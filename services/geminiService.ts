import { GoogleGenAI, Type } from "@google/genai";
import { type GeneratedTestCaseData, type GenerationConfig, type ModelConfig, ModelProvider } from '../types';

// This service now handles multiple AI providers.

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
        topK: genConfig.topK,
        topP: genConfig.topP,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
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
                top_k: genConfig.topK,
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