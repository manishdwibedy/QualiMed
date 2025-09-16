import { GoogleGenAI, Type } from "@google/genai";
import { type GeneratedTestCaseData, TestCaseCategory } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: `The category of the test case. Must be one of: '${TestCaseCategory.POSITIVE}', '${TestCaseCategory.NEGATIVE}', or '${TestCaseCategory.EDGE_CASE}'.`,
        enum: [TestCaseCategory.POSITIVE, TestCaseCategory.NEGATIVE, TestCaseCategory.EDGE_CASE],
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
        description: "The specific action being performed, including conditions (e.g., 'attempts to log in with an incorrect password').",
      },
      expectedOutcome: {
        type: Type.STRING,
        description: "The expected result or system response after the action is completed (e.g., 'an error message is displayed, and access is denied').",
      },
      preConditions: {
        type: Type.STRING,
        description: "Optional: Any pre-conditions that must be met before the test step can be executed (e.g., 'User must have an active account'). If none, this can be omitted."
      },
      testData: {
        type: Type.STRING,
        description: "Optional: Specific data values to be used in the test (e.g., 'Username: testuser, Password: WrongPassword123'). If none, this can be omitted."
      },
    },
    required: ["category", "title", "actor", "action", "expectedOutcome"],
  }
};

/**
 * Generates a structured test case suite from a plain text requirement and/or a document.
 * @param requirement - The software requirement in plain text, which can also provide context for the document.
 * @param file - An optional file object containing mimeType and base64 data.
 * @returns A promise that resolves to an array of generated test cases.
 */
export async function generateTestCaseFromRequirement(
  requirement: string, 
  file: { mimeType: string, data: string } | null
): Promise<GeneratedTestCaseData[]> {
  
  const prompt = `
    You are an expert Software Quality Assurance Engineer specializing in mission-critical healthcare systems.
    Your task is to analyze the following software requirement and/or the attached document.
    Identify all individual requirements, paying close attention to bullet points or numbered lists.
    For each identified requirement, generate a comprehensive suite of test cases.
    This suite must include 'Positive', 'Negative', and 'Edge Case' scenarios.

    For each test case, you must extract and define the following:
    - category: The type of test case.
    - title: A concise, descriptive title.
    - actor: The user or system performing the action.
    - action: The specific action being performed.
    - expectedOutcome: The precise expected result.
    - preConditions (if applicable): Any pre-condition that must be true, often found in 'Given...' clauses.
    - testData (if applicable): Any specific example data mentioned for testing.

    Context: "${requirement}"
  `;

  // FIX: The type `GenerateContentRequest` is deprecated and no longer exported from `@google/genai`.
  // The explicit type annotation has been removed in favor of TypeScript's type inference.
  const contents = { parts: [{ text: prompt }] };

  if (file) {
    contents.parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.3,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    if (Array.isArray(parsedData) && parsedData.length > 0) {
      return parsedData as GeneratedTestCaseData[];
    } else {
      throw new Error("The AI model did not return any valid test cases. Please refine your input.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("JSON")) {
      throw new Error("The AI model returned an invalid JSON format. Please try again.");
    }
    throw new Error("Could not process the requirement with the AI model.");
  }
}
