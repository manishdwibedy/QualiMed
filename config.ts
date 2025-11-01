// INSTRUCTIONS:
// 1. This file was auto-generated to fix a startup error because it was missing.
// 2. To enable real ALM integration, fill in your credentials below.
// 3. IMPORTANT: Add this file (`config.ts`) to your `.gitignore` file to prevent committing secrets.

// Firebase Auth Configuration

export const base_url = 'http://localhost:5000';
// export const base_url = 'https://qualimed-142826139203.us-central1.run.app:5000';

export const firebaseConfig = {
  apiKey: "AIzaSyD9IJ5WA-ER1dCQJasA6gQFsSTxcLqGfos",
  authDomain: "simply-trade-4fbbd.firebaseapp.com",
  projectId: "simply-trade-4fbbd",
  storageBucket: "simply-trade-4fbbd.appspot.com",
  messagingSenderId: "142826139203",
  appId: "1:142826139203:web:a51fb857ff8e097ce12ef6",
  measurementId: "G-L388M0W5E0"
};

// Enable or disable authentication (set to false to bypass auth)
export const enableAuth = true;

export const almConfig = {
  jira: {
    instanceUrl: 'https://your-instance.atlassian.net', // e.g., https://my-company.atlassian.net
    userEmail: 'your-email@example.com',
    apiToken: 'YOUR_JIRA_API_TOKEN_HERE', // Generate this from your Atlassian account settings
    projectKey: 'YOUR_PROJECT_KEY' // e.g., 'PROJ'
  },
  polarion: {
    serverUrl: 'https://your-server.polarion.com', // e.g., https://polarion.mycompany.com
    username: 'your-username',
    password: 'YOUR_PASSWORD_HERE', // Use a secure method to store this
    projectId: 'YOUR_PROJECT_ID' // e.g., 'HealthApp'
  },
  azureDevOps: {
    organization: 'your-organization', // e.g., 'myorg'
    project: 'your-project', // e.g., 'MyProject'
    personalAccessToken: 'YOUR_PAT_HERE', // Generate this from Azure DevOps settings
    workItemType: 'Test Case' // e.g., 'Test Case'
  }
};
