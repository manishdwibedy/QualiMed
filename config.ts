// INSTRUCTIONS:
// 1. This file was auto-generated to fix a startup error because it was missing.
// 2. To enable real ALM integration, fill in your credentials below.
// 3. IMPORTANT: Add this file (`config.ts`) to your `.gitignore` file to prevent committing secrets.

export const almConfig = {
  jira: {
    instanceUrl: 'https://your-instance.atlassian.net', // e.g., https://my-company.atlassian.net
    userEmail: 'your-email@example.com',
    apiToken: 'YOUR_JIRA_API_TOKEN_HERE', // Generate this from your Atlassian account settings
    projectKey: 'YOUR_PROJECT_KEY' // e.g., 'PROJ'
  },
  // You can add configurations for other ALMs like Polarion or Azure DevOps here
};
