
import { type TestCase } from '../types';
import { base_url } from '../config';
import { getAuth } from 'firebase/auth';

/**
 * Creates a new test case issue in Jira by calling the backend API.
 * @param testCase - The test case data to be sent.
 * @returns A promise that resolves with the result of the operation.
 */
export async function createJiraTicket(testCase: TestCase): Promise<{ success: boolean; issueKey?: string; error?: string }> {
  console.log('Creating Jira ticket via backend...');

  // Build description as a string
  let description = `Original Requirement Context: ${testCase.requirement}\n\n`;

  if (testCase.preConditions) {
    description += `## Pre-Conditions\n${testCase.preConditions}\n\n`;
  }

  description += `## Test Steps\n`;
  testCase.steps.forEach((step, index) => {
    description += `${index + 1}. As ${step.actor}, ${step.action}.\n`;
  });
  description += '\n';

  if (testCase.testData) {
    description += `## Test Data\n${testCase.testData}\n\n`;
  }

  description += `## Expected Result\n${testCase.expectedResult}`;

  // Get user ID
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Payload for backend
  const payload = {
    summary: testCase.title,
    description: description,
    projectKey: 'HTP', // Example Project Key, can be made configurable
    issuetype: 'Test Case',
    userId: user.uid
  };

  console.log('Backend Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${base_url}/create/jira`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.uid,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Backend Response:', data);

    if (response.ok && data.status_code === 201 && data.response && data.response.key) {
      const issueKey = data.response.key;
      console.log(`Successfully created Jira ticket: ${issueKey}`);
      return { success: true, issueKey };
    } else {
      const error = data.response?.errorMessages?.join(', ') || data.response?.errors?.join(', ') || 'Failed to create Jira ticket';
      console.error('Failed to create Jira ticket:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('Error calling backend:', error);
    return { success: false, error: 'Failed to connect to backend API.' };
  }
}
