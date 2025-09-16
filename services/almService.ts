import { type TestCase, ALMPlatform } from '../types';

interface AlmResult {
  success: boolean;
  issueKey?: string;
  error?: string;
}

/**
 * Simulates creating a new test case issue in Jira.
 */
async function createJiraTicket(testCase: TestCase): Promise<AlmResult> {
  // This is the payload you would send to the Jira API
  const jiraPayload = {
    fields: {
      project: { key: 'HTP' },
      summary: testCase.title,
      description: {
        type: 'doc',
        version: 1,
        content: [ /* ... Jira's complex document format ... */ ],
      },
      issuetype: { name: 'Test Case' },
    },
  };
  console.log(`[${ALMPlatform.JIRA}] Payload:`, JSON.stringify(jiraPayload, null, 2));

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (Math.random() > 0.2) { // 80% success rate
    const issueKey = `HTP-${Math.floor(Math.random() * 1000) + 1}`;
    return { success: true, issueKey };
  } else {
    return { success: false, error: 'Failed to connect to Jira API (simulated).' };
  }
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
  console.log(`Simulating ticket creation for ${platform}...`);
  
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
