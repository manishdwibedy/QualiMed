import { type TestCase, ALMPlatform } from '../types';

interface AlmResult {
  success: boolean;
  issueKey?: string;
  error?: string;
}

// --- REAL JIRA INTEGRATION CONFIGURATION (User needs to fill this in) ---
// IMPORTANT: For a production application, use a secure way to store secrets,
// like environment variables or a secret management service.
const JIRA_INSTANCE_URL = 'https://your-domain.atlassian.net'; // e.g., https://my-company.atlassian.net
const JIRA_USER_EMAIL = 'your-email@example.com';
const JIRA_API_TOKEN = 'YOUR_JIRA_API_TOKEN'; // Generate this from your Atlassian account settings


/**
 * Constructs a Jira issue description in Atlassian Document Format (ADF).
 * @param testCase The test case to format.
 * @returns The ADF content array.
 */
function buildJiraDescription(testCase: TestCase) {
  const content: any[] = [
    {
      type: 'paragraph',
      content: [ { type: 'text', text: 'Original Requirement Context: ' + testCase.requirement } ],
    },
  ];

  if (testCase.preConditions) {
    content.push(
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Pre-Conditions' }] },
      { type: 'paragraph', content: [{ type: 'text', text: testCase.preConditions }] }
    );
  }
  
  content.push(
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Test Steps' }] },
    { type: 'orderedList', content: testCase.steps.map(step => ({ type: 'listItem', content: [ { type: 'paragraph', content: [ { type: 'text', text: `As ${step.actor}, ${step.action}.` } ] } ] })) }
  );
  
  if (testCase.testData) {
    content.push(
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Test Data' }] },
      { type: 'codeBlock', attrs: { language: 'json' }, content: [{ type: 'text', text: testCase.testData }] }
    );
  }

  content.push(
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Expected Result' }] },
    { type: 'paragraph', content: [{ type: 'text', text: testCase.expectedResult }] }
  );

  return content;
}

/**
 * [REAL IMPLEMENTATION] Creates a real test case issue in Jira.
 * NOTE: This function is currently NOT called by default.
 * To enable it, swap it with `createJiraTicketSimulated` in the `createJiraTicket` function below.
 */
async function createJiraTicketReal(testCase: TestCase): Promise<AlmResult> {
    if (!JIRA_INSTANCE_URL.startsWith('https://') || !JIRA_USER_EMAIL.includes('@') || !JIRA_API_TOKEN) {
        return {
            success: false,
            error: 'Jira configuration is missing. Please update JIRA_INSTANCE_URL, JIRA_USER_EMAIL, and JIRA_API_TOKEN in almService.ts'
        };
    }

    const endpoint = `${JIRA_INSTANCE_URL}/rest/api/3/issue`;
    const headers = {
        'Authorization': `Basic ${btoa(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const jiraPayload = {
      fields: {
        project: { key: 'HTP' }, // IMPORTANT: Change 'HTP' to your actual Jira project key
        summary: testCase.title,
        description: {
          type: 'doc',
          version: 1,
          content: buildJiraDescription(testCase),
        },
        issuetype: { name: 'Test Case' }, // Ensure 'Test Case' is a valid issue type in your project
      },
    };

    try {
        console.log(`[REAL][${ALMPlatform.JIRA}] Sending Payload:`, JSON.stringify(jiraPayload, null, 2));
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(jiraPayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Jira API Error:', errorData);
            const errorMessage = errorData.errorMessages?.join(', ') || `HTTP error! status: ${response.status}`;
            return { success: false, error: errorMessage };
        }

        const responseData = await response.json();
        return { success: true, issueKey: responseData.key };

    } catch (error) {
        console.error('Network or other error during Jira ticket creation:', error);
        return { success: false, error: error instanceof Error ? error.message : 'An unknown network error occurred.' };
    }
}


/**
 * [SIMULATED IMPLEMENTATION] Simulates creating a new test case issue in Jira.
 * This is the default behavior.
 */
async function createJiraTicketSimulated(testCase: TestCase): Promise<AlmResult> {
    const jiraPayload = {
      fields: {
        project: { key: 'HTP' },
        summary: testCase.title,
        description: {
          type: 'doc',
          version: 1,
          content: buildJiraDescription(testCase),
        },
        issuetype: { name: 'Test Case' },
      },
    };
    console.log(`[SIMULATION][${ALMPlatform.JIRA}] Payload:`, JSON.stringify(jiraPayload, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (Math.random() > 0.2) { 
        const issueKey = `HTP-${Math.floor(Math.random() * 1000) + 1}`;
        return { success: true, issueKey };
    } else {
        return { success: false, error: 'Failed to connect to Jira API (simulated).' };
    }
}


/**
 * Creates a new test case issue in Jira.
 * Toggles between the real and simulated implementations.
 */
async function createJiraTicket(testCase: TestCase): Promise<AlmResult> {
  // --- TOGGLE BETWEEN REAL AND SIMULATED ---
  // To use the REAL Jira API, comment out the line below:
  return createJiraTicketSimulated(testCase);
  
  // And uncomment this line:
  // return createJiraTicketReal(testCase);
}

/**
 * Simulates creating a new work item in Polarion.
 */
async function createPolarionWorkItem(testCase: TestCase): Promise<AlmResult> {
    const polarionPayload = {
        project: 'HealthApp',
        type: 'testcase',
        title: testCase.title,
        description: testCase.requirement,
        steps: testCase.steps.map(s => ({ action: s.action, expectedResult: testCase.expectedResult })),
        category: testCase.category,
    };
    console.log(`[${ALMPlatform.POLARION}] Payload:`, JSON.stringify(polarionPayload, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (Math.random() > 0.2) {
        const issueKey = `MP-${Math.floor(Math.random() * 5000) + 100}`;
        return { success: true, issueKey };
    } else {
        return { success: false, error: 'Authorization failed for Polarion (simulated).' };
    }
}

/**
 * Simulates creating a new work item in Azure DevOps.
 */
async function createAzureDevOpsWorkItem(testCase: TestCase): Promise<AlmResult> {
    const adoPayload = [
        { "op": "add", "path": "/fields/System.Title", "value": testCase.title },
        { "op": "add", "path": "/fields/Microsoft.VSTS.TCM.Steps", "value": testCase.steps.map(s => `<step>${s.action}</step>`).join('') },
        { "op": "add", "path": "/fields/Microsoft.VSTS.TCM.ExpectedResult", "value": testCase.expectedResult },
        { "op": "add", "path": "/fields/System.Description", "value": testCase.requirement },
    ];
    console.log(`[${ALMPlatform.AZURE_DEVOPS}] Payload:`, JSON.stringify(adoPayload, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() > 0.2) {
        const issueKey = `${Math.floor(Math.random() * 9000) + 1000}`;
        return { success: true, issueKey };
    } else {
        return { success: false, error: 'Invalid work item type for this project (simulated).' };
    }
}


/**
 * Factory function to call the correct ALM integration service.
 * @param testCase The test case data.
 * @param platform The target ALM platform.
 * @returns A promise that resolves with the result of the operation.
 */
export async function createAlmTicket(testCase: TestCase, platform: ALMPlatform): Promise<AlmResult> {
  console.log(`Attempting ticket creation for ${platform}...`);
  
  switch (platform) {
    case ALMPlatform.JIRA:
      return createJiraTicket(testCase);
    case ALMPlatform.POLARION:
        return createPolarionWorkItem(testCase);
    case ALMPlatform.AZURE_DEVOPS:
        return createAzureDevOpsWorkItem(testCase);
    default:
      console.error(`Unknown ALM platform: ${platform}`);
      return { success: false, error: `ALM platform "${platform}" is not supported.` };
  }
}