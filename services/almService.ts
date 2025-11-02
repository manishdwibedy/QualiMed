import { type TestCase, ALMPlatform } from '../types';
// This service attempts to import credentials from `config.ts`.
// If this file does not exist, you will see a build error.
// Please follow the instructions in INSTALLATION.md to create this file.
import { almConfig, base_url } from '../config';

interface AlmResult {
  success: boolean;
  issueKey?: string;
  error?: string;
}

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
 * [REAL IMPLEMENTATION] Creates a real test case issue in Jira via backend API to avoid CORS.
 */
async function createJiraTicketReal(testCase: TestCase, jiraConfig?: { instanceUrl: string; userEmail: string; apiToken: string; projectKey: string }): Promise<AlmResult> {
    // Build description as a string for backend
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

    // Payload for backend
    const payload = {
        summary: testCase.title,
        description: description,
        projectKey: jiraConfig?.projectKey || almConfig.jira?.projectKey || 'HTP',
        issuetype: 'Bug'
    };

    console.log(`[REAL][${ALMPlatform.JIRA}] Backend Payload:`, JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${base_url}/create/jira`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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


/**
 * [SIMULATED IMPLEMENTATION] Simulates creating a new test case issue in Jira.
 * This is the default behavior.
 */
async function createJiraTicketSimulated(testCase: TestCase): Promise<AlmResult> {
    const projectKey = almConfig.jira?.projectKey || 'PROJ';
    const jiraPayload = {
      fields: {
        project: { key: projectKey },
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
        const issueKey = `${projectKey}-${Math.floor(Math.random() * 1000) + 1}`;
        return { success: true, issueKey };
    } else {
        return { success: false, error: 'Failed to connect to Jira API (simulated).' };
    }
}


/**
 * Creates a new test case issue in Jira.
 * Toggles between the real and simulated implementations.
 */
async function createJiraTicket(testCase: TestCase, jiraConfig?: { instanceUrl: string; userEmail: string; apiToken: string; projectKey: string }): Promise<AlmResult> {
  // --- TOGGLE BETWEEN REAL AND SIMULATED ---
  // To use the REAL Jira API, comment out the line below:
  // return createJiraTicketSimulated(testCase);

  // And uncomment this line:
  return createJiraTicketReal(testCase, jiraConfig);
}

/**
 * [REAL IMPLEMENTATION] Creates a real test case work item in Polarion.
 */
async function createPolarionWorkItemReal(testCase: TestCase, polarionConfig?: { serverUrl: string; username: string; password: string; projectId: string }): Promise<AlmResult> {
    const polarion = polarionConfig || almConfig.polarion;
    if (!polarion || polarion.serverUrl.includes('your-server') || polarion.username.includes('your-username') || polarion.password.includes('YOUR_PASSWORD')) {
        return {
            success: false,
            error: 'Polarion configuration is incomplete. Please fill in your credentials in the dashboard.'
        };
    }

    const endpoint = `${polarion.serverUrl}/polarion/rest/v1/projects/${polarion.projectId}/workitems`;
    const headers = {
        'Authorization': `Basic ${btoa(`${polarion.username}:${polarion.password}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const polarionPayload = {
        type: 'testcase',
        title: testCase.title,
        description: testCase.requirement,
        customFields: {
            'testSteps': testCase.steps.map(s => `${s.actor}: ${s.action}`).join('\n'),
            'expectedResult': testCase.expectedResult,
            'preConditions': testCase.preConditions || '',
            'testData': testCase.testData || '',
            'category': testCase.category,
        },
    };

    try {
        console.log(`[REAL][${ALMPlatform.POLARION}] Sending Payload:`, JSON.stringify(polarionPayload, null, 2));
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(polarionPayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Polarion API Error:', errorData);
            const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
            return { success: false, error: errorMessage };
        }

        const responseData = await response.json();
        return { success: true, issueKey: responseData.id };

    } catch (error) {
        console.error('Network or other error during Polarion work item creation:', error);
        return { success: false, error: error instanceof Error ? error.message : 'An unknown network error occurred.' };
    }
}

/**
 * [SIMULATED IMPLEMENTATION] Simulates creating a new test case work item in Polarion.
 * This is the default behavior.
 */
async function createPolarionWorkItemSimulated(testCase: TestCase): Promise<AlmResult> {
    const projectId = almConfig.polarion?.projectId || 'PROJ';
    const polarionPayload = {
        type: 'testcase',
        title: testCase.title,
        description: testCase.requirement,
        customFields: {
            'testSteps': testCase.steps.map(s => `${s.actor}: ${s.action}`).join('\n'),
            'expectedResult': testCase.expectedResult,
            'preConditions': testCase.preConditions || '',
            'testData': testCase.testData || '',
            'category': testCase.category,
        },
    };
    console.log(`[SIMULATION][${ALMPlatform.POLARION}] Payload:`, JSON.stringify(polarionPayload, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (Math.random() > 0.2) {
        const workItemId = `${projectId}-${Math.floor(Math.random() * 1000) + 1}`;
        return { success: true, issueKey: workItemId };
    } else {
        return { success: false, error: 'Failed to connect to Polarion API (simulated).' };
    }
}

/**
 * Creates a new test case work item in Polarion.
 * Toggles between the real and simulated implementations.
 */
async function createPolarionWorkItem(testCase: TestCase, polarionConfig?: { serverUrl: string; username: string; password: string; projectId: string }): Promise<AlmResult> {
  // --- TOGGLE BETWEEN REAL AND SIMULATED ---
  // To use the REAL Polarion API, comment out the line below:
  return createPolarionWorkItemSimulated(testCase);

  // And uncomment this line:
  // return createPolarionWorkItemReal(testCase, polarionConfig);
}

/**
 * [REAL IMPLEMENTATION] Creates a real test case work item in Azure DevOps.
 */
async function createAzureDevOpsWorkItem(testCase: TestCase, azureDevOpsConfig?: { organization: string; project: string; personalAccessToken: string; workItemType: string }): Promise<AlmResult> {
    const azureDevOps = azureDevOpsConfig || almConfig.azureDevOps;
    if (!azureDevOps || azureDevOps.organization.includes('your-organization') || azureDevOps.project.includes('your-project') || azureDevOps.personalAccessToken.includes('YOUR_PAT')) {
        return {
            success: false,
            error: 'Azure DevOps configuration is incomplete. Please fill in your Azure DevOps credentials in the dashboard.'
        };
    }

    const endpoint = `https://dev.azure.com/${azureDevOps.organization}/${azureDevOps.project}/_apis/wit/workitems/$${azureDevOps.workItemType}?api-version=7.1`;
    const headers = {
        'Authorization': `Basic ${btoa(`:${azureDevOps.personalAccessToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json-patch+json',
    };

    const adoPayload = [
        { "op": "add", "path": "/fields/System.Title", "value": testCase.title },
        { "op": "add", "path": "/fields/System.Description", "value": testCase.requirement },
        { "op": "add", "path": "/fields/Microsoft.VSTS.TCM.Steps", "value": testCase.steps.map(s => `<step>${s.actor}: ${s.action}</step>`).join('') },
        { "op": "add", "path": "/fields/Microsoft.VSTS.TCM.ExpectedResult", "value": testCase.expectedResult },
        { "op": "add", "path": "/fields/Microsoft.VSTS.Common.Priority", "value": 2 },
        { "op": "add", "path": "/fields/System.Tags", "value": testCase.category },
    ];

    if (testCase.preConditions) {
        adoPayload.push({ "op": "add", "path": "/fields/Microsoft.VSTS.TCM.PreConditions", "value": testCase.preConditions });
    }

    if (testCase.testData) {
        adoPayload.push({ "op": "add", "path": "/fields/Microsoft.VSTS.TCM.TestData", "value": testCase.testData });
    }

    try {
        console.log(`[REAL][${ALMPlatform.AZURE_DEVOPS}] Sending Payload:`, JSON.stringify(adoPayload, null, 2));
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(adoPayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Azure DevOps API Error:', errorData);
            const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
            return { success: false, error: errorMessage };
        }

        const responseData = await response.json();
        return { success: true, issueKey: responseData.id.toString() };

    } catch (error) {
        console.error('Network or other error during Azure DevOps work item creation:', error);
        return { success: false, error: error instanceof Error ? error.message : 'An unknown network error occurred.' };
    }
}


/**
 * Factory function to call the correct ALM integration service.
 * @param testCase The test case data.
 * @param platform The target ALM platform.
 * @param jiraConfig Optional Jira configuration for dynamic credentials.
 * @param azureDevOpsConfig Optional Azure DevOps configuration for dynamic credentials.
 * @param polarionConfig Optional Polarion configuration for dynamic credentials.
 * @returns A promise that resolves with the result of the operation.
 */
export async function createAlmTicket(testCase: TestCase, platform: ALMPlatform, jiraConfig?: { instanceUrl: string; userEmail: string; apiToken: string; projectKey: string }, azureDevOpsConfig?: { organization: string; project: string; personalAccessToken: string; workItemType: string }, polarionConfig?: { serverUrl: string; username: string; password: string; projectId: string }): Promise<AlmResult> {
  console.log(`Attempting ticket creation for ${platform}...`);

  switch (platform) {
    case ALMPlatform.JIRA:
      return createJiraTicket(testCase, jiraConfig);
    case ALMPlatform.POLARION:
        return createPolarionWorkItem(testCase, polarionConfig);
    case ALMPlatform.AZURE_DEVOPS:
        return createAzureDevOpsWorkItem(testCase, azureDevOpsConfig);
    default:
      console.error(`Unknown ALM platform: ${platform}`);
      return { success: false, error: `ALM platform "${platform}" is not supported.` };
  }
}
