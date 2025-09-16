
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
    },
    required: ["category", "title", "actor", "action", "expectedOutcome"],
  }
};

/**
 * Generates a structured test case suite from a plain text requirement.
 * @param requirement - The software requirement in plain text.
 * @returns A promise that resolves to an array of generated test cases.
 */
export async function generateTestCaseFromRequirement(requirement: string): Promise<GeneratedTestCaseData[]> {
  const prompt = `
    You are an expert Software Quality Assurance Engineer specializing in mission-critical healthcare systems.
    Your task is to analyze the following software requirement and generate a comprehensive suite of test cases.
    For the given requirement, create at least three test cases:
    1.  A 'Positive' test case for the primary success scenario (the "happy path").
    2.  A 'Negative' test case covering invalid inputs, error conditions, or unauthorized actions.
    3.  An 'Edge Case' test case that explores boundaries, unusual combinations of inputs, or system limits.

    For each test case, you must extract and define the category, a concise title, the actor, the specific action (including conditions), and the precise expected outcome.

    Requirement: "${requirement}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.3,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    if (Array.isArray(parsedData) && parsedData.every(item => 
        typeof item.category === 'string' &&
        typeof item.title === 'string' &&
        typeof item.actor === 'string' &&
        typeof item.action === 'string' &&
        typeof item.expectedOutcome === 'string'
    )) {
        return parsedData as GeneratedTestCaseData[];
    } else {
        throw new Error("Invalid data structure received from API. Expected an array of test cases.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("JSON")) {
      throw new Error("The AI model returned an invalid JSON format. Please try again.");
    }
    throw new Error("Could not process the requirement with the AI model.");
  }
}
