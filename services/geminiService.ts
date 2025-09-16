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
};

/**
 * Generates a structured test case suite from a plain text requirement and/or extracted document text.
 * @param requirement - The software requirement in plain text, providing context.
 * @param documentText - An optional string containing the extracted text from a document.
 * @returns A promise that resolves to an array of generated test cases.
 */
export async function generateTestCaseFromRequirement(
  requirement: string, 
  documentText: string | null
): Promise<GeneratedTestCaseData[]> {
  
  let fullPrompt = `
    You are an expert Software Quality Assurance Engineer specializing in mission-critical healthcare systems.
    Your task is to analyze the following software requirement context and/or the document content provided.
    From the provided materials, identify all individual functional requirements. For each requirement found, generate a comprehensive suite of test cases that includes 'Positive', 'Negative', and 'Edge Case' scenarios.

    Strictly adhere to the provided JSON schema for your response. The schema details all the required and optional fields for each test case.
    Populate the 'action', 'expectedOutcome', 'preConditions', and 'testData' fields with markdown-formatted text for enhanced readability, as suggested in the schema descriptions.

    Requirement Context: "${requirement}"
  `;

  if (documentText) {
    fullPrompt += `\n\n--- DOCUMENT CONTENT ---\n${documentText}\n--- END DOCUMENT CONTENT ---`;
  }

  const contents = { parts: [{ text: fullPrompt }] };

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
