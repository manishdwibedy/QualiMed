import { GoogleGenAI, Type } from "@google/genai";
import { type GeneratedTestCaseData, type GenerationConfig, type ModelConfig, ModelProvider } from '../types';

// This service now handles multiple AI providers.

// --- TESTING FLAG ---
// Set this to true to use mock data instead of real API calls
const USE_MOCK_DATA = false;

/**
 * Generates mock test cases for testing purposes without making real API calls.
 * @param requirement - The software requirement in plain text.
 * @param documentText - An optional string containing the extracted text from a document.
 * @param genConfig - The generation configuration.
 * @returns A promise that resolves to an array of mock generated test cases.
 */
async function generateMockTestCases(
  requirement: string,
  documentText: string | null,
  genConfig: GenerationConfig,
): Promise<GeneratedTestCaseData[]> {
  console.log('[MOCK] Generating test cases for requirement:', requirement);
  console.log('[MOCK] Document text provided:', !!documentText);
  console.log('[MOCK] Categories:', genConfig.categories);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return mock test cases based on the requirement
  const mockCases: GeneratedTestCaseData[] = [
    {
      category: genConfig.categories[0] || 'Positive',
      title: 'User successfully logs in with valid credentials',
      actor: 'a user',
      action: 'enters valid username and password and clicks login button',
      expectedOutcome: 'user is redirected to the dashboard and sees a welcome message',
      preConditions: 'user has a valid account with confirmed email',
      testData: 'Username: testuser@example.com\nPassword: ValidPass123!',
    },
    {
      category: genConfig.categories[1] || 'Negative',
      title: 'User fails to log in with invalid password',
      actor: 'a user',
      action: 'enters valid username but invalid password and clicks login button',
      expectedOutcome: 'error message is displayed and user remains on login page',
      preConditions: 'user has a valid account',
      testData: 'Username: testuser@example.com\nPassword: WrongPass123!',
    },
    {
      category: genConfig.categories[2] || 'Edge Case',
      title: 'User attempts login with empty fields',
      actor: 'a user',
      action: 'leaves username and password fields empty and clicks login button',
      expectedOutcome: 'validation messages appear for both fields and login is prevented',
      preConditions: 'user is on the login page',
      testData: 'Username: (empty)\nPassword: (empty)',
    },
  ];

  // Filter based on available categories
  return mockCases.filter(mockCase => genConfig.categories.includes(mockCase.category));
}

const buildSchema = (categories: string[]) => ({
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: `The category of the test case. Must be one of: '${categories.join("', '")}'.`,
        enum: categories,
      },
      title: {
        type: Type.STRING,
        description: "A concise, descriptive title for the test case (e.g., 'User logs in with invalid password').",
      },
      actor: {
        type: Type.STRING,
        description: "The user or system performing the action (e.g., 'a user', 'an administrator').",
      },
      action: {
        type: Type.STRING,
        description: "The specific action being performed, including conditions (e.g., 'attempts to log in with an incorrect password'). Use markdown for clarity if needed.",
      },
      expectedOutcome: {
        type: Type.STRING,
        description: "The expected result or system response after the action is completed (e.g., 'an error message is displayed, and access is denied'). Use markdown for clarity.",
      },
      preConditions: {
        type: Type.STRING,
        description: "Optional: Any pre-conditions that must be met before the test step can be executed (e.g., 'User must have an active account'). Use markdown for lists. If none, this can be omitted."
      },
      testData: {
        type: Type.STRING,
        description: "Optional: Specific data values to be used in the test (e.g., 'Username: testuser, Password: WrongPassword123'). Use markdown fenced code blocks for structured data. If none, this can be omitted."
      },
    },
    required: ["category", "title", "actor", "action", "expectedOutcome"],
  }
});

async function generateWithGemini(
    userPrompt: string,
    genConfig: GenerationConfig,
    modelConfig: ModelConfig
): Promise<GeneratedTestCaseData[]> {
    const apiKey = modelConfig.apiKey || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is not set. Please provide a key in the advanced settings or ensure the API_KEY environment variable is configured.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const contents = { parts: [{ text: userPrompt }] };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: genConfig.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: buildSchema(genConfig.categories),
        temperature: genConfig.temperature,
        maxOutputTokens: genConfig.maxOutputTokens,
        topP: genConfig.topP,
      },
    });

    // When using responseMimeType: "application/json", the response is structured.
    // The actual JSON string is in the first part of the first candidate.
    const candidate = response.candidates?.[0];
    const jsonText = candidate?.content?.parts?.[0]?.text;

    if (!jsonText) {
      throw new Error("The AI model did not return a valid JSON response.");
    }
    return JSON.parse(jsonText.trim());
}

async function generateWithOllama(
    userPrompt: string,
    genConfig: GenerationConfig,
    modelConfig: ModelConfig
): Promise<GeneratedTestCaseData[]> {
    if (!modelConfig.ollamaUrl || !modelConfig.ollamaModel) {
        throw new Error("Ollama server URL or model name is not configured.");
    }

    const ollamaSchemaDescription = `
You must respond with only a valid JSON array of objects. Do not output any other text, introductory sentences, or code block fences, just the raw JSON.
Each object in the array must conform to the following properties:
- category: (string) Must be one of: '${genConfig.categories.join("', '")}'.
- title: (string) A concise, descriptive title for the test case.
- actor: (string) The user or system performing the action.
- action: (string) The specific action being performed. Use markdown.
- expectedOutcome: (string) The expected result or system response. Use markdown.
- preConditions: (string, optional) Any pre-conditions. Use markdown.
- testData: (string, optional) Specific data values. Use markdown fenced code blocks for structured data.
`;
    const fullPrompt = `${genConfig.systemInstruction}\n\n${ollamaSchemaDescription}\n\n--- USER PROMPT ---\n${userPrompt}`;

    const endpoint = new URL('/api/generate', modelConfig.ollamaUrl).toString();

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: modelConfig.ollamaModel,
            prompt: fullPrompt,
            format: 'json',
            stream: false,
            options: {
                temperature: genConfig.temperature,
                max_output_tokens: genConfig.maxOutputTokens,
                top_p: genConfig.topP,
            }
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();
    // Ollama with format: 'json' wraps the JSON string in the 'response' field.
    if (typeof responseData.response !== 'string') {
        throw new Error('Ollama response did not contain a valid JSON string.');
    }
    return JSON.parse(responseData.response);
}


/**
 * Generates a structured test case suite from a plain text requirement and/or extracted document text
 * using the configured AI provider.
 * @param requirement - The software requirement in plain text, providing context.
 * @param documentText - An optional string containing the extracted text from a document.
 * @param genConfig - The generation configuration, including system prompt and LLM parameters.
 * @param modelConfig - The model configuration, including provider, keys, and URLs.
 * @returns A promise that resolves to an array of generated test cases.
 */
export async function generateTestCaseFromRequirement(
  requirement: string,
  documentText: string | null,
  genConfig: GenerationConfig,
  modelConfig: ModelConfig,
): Promise<GeneratedTestCaseData[]> {

  // Log the request details for testing
  console.log('[AI Request] Provider:', modelConfig.provider);
  console.log('[AI Request] Model:', modelConfig.provider === ModelProvider.GEMINI ? 'gemini-2.5-flash' : modelConfig.ollamaModel);
  console.log('[AI Request] Parameters:', {
    temperature: genConfig.temperature,
    maxOutputTokens: genConfig.maxOutputTokens,
    topP: genConfig.topP,
  });
  console.log('[AI Request] Categories:', genConfig.categories);
  console.log('[AI Request] Requirement:', requirement.substring(0, 100) + (requirement.length > 100 ? '...' : ''));
  console.log('[AI Request] Has document text:', !!documentText);

  // --- MOCK MODE FOR TESTING ---
  // Use mock data if testing flag is enabled
  if (USE_MOCK_DATA) {
    return generateMockTestCases(requirement, documentText, genConfig);
  }

  let userPrompt = `Requirement Context: "${requirement}"`;

  if (documentText) {
    userPrompt += `\n\n--- DOCUMENT CONTENT ---\n${documentText}\n--- END DOCUMENT CONTENT ---`;
  }

  try {
    let parsedData: any;
    switch (modelConfig.provider) {
        case ModelProvider.OLLAMA:
            parsedData = await generateWithOllama(userPrompt, genConfig, modelConfig);
            break;
        case ModelProvider.GEMINI:
        default:
            parsedData = await generateWithGemini(userPrompt, genConfig, modelConfig);
            break;
    }

    if (Array.isArray(parsedData) && parsedData.length > 0) {
      return parsedData as GeneratedTestCaseData[];
    } else {
      throw new Error("The AI model did not return any valid test cases. Please refine your input.");
    }

  } catch (error) {
    console.error(`Error calling ${modelConfig.provider} API:`, error);
    if (error instanceof SyntaxError) {
        // This likely means JSON.parse failed
        throw new Error(`The AI model returned an invalid JSON format. Please try again. Error: ${error.message}`);
    }
    if (error instanceof Error) {
        // Re-throw specific errors from the service functions
        throw error;
    }
    throw new Error(`Could not process the requirement with the ${modelConfig.provider} model.`);
  }
}
