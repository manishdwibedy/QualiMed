# QualiMed Enhancement TODO List

## Approved Plan: Implement Dynamic ALM Credential Input and Mock Gemini

### 1. Add Azure DevOps Config Component
- [x] Create AzureDevOpsConfig.tsx component for dynamic credential input

### 2. Update App.tsx for Azure DevOps State
- [x] Add azureDevOpsConfig state and AzureDevOpsConfig component rendering

### 3. Propagate Azure DevOps Config Through Components
- [x] Update TestCaseDisplay, AlmStatusCell, AlmIntegration, SingleTestCaseCard interfaces and props

### 4. Update almService.ts for Dynamic Azure DevOps Config
- [x] Modify createAzureDevOpsWorkItem to accept optional azureDevOpsConfig parameter
- [x] Update createAlmTicket function signature and calls

### 5. Add Mock Gemini Functionality
- [x] Implement generateMockTestCases function in geminiService.ts
- [x] Set USE_MOCK_DATA flag to true for testing without API keys

### 6. Update Documentation
- [x] Update INSTALLATION.md with dashboard configuration instructions

### Followup Steps
- [x] Test Azure DevOps work item creation via dashboard with user-provided credentials
- [x] Verify mock Gemini functionality generates test cases without real API calls
- [x] Ensure all TypeScript errors are resolved
- [x] Perform command-line testing of mock ALM ticket creation (Jira and Azure DevOps)

## New Approved Plan: Integrate Jira API Calls via Dashboard

### 1. Add Jira Config State in App.tsx
- [x] Add state for Jira configuration (instanceUrl, userEmail, apiToken, projectKey)

### 2. Create JiraConfig Component
- [x] Create components/JiraConfig.tsx with input fields for Jira credentials

### 3. Update almService.ts for Dynamic Credentials
- [x] Modify createJiraTicketReal to accept dynamic config instead of static almConfig.jira

### 4. Integrate Config UI into Dashboard
- [x] Add JiraConfig component to App.tsx, conditionally show based on ALM platform selection

### Followup Steps
- [ ] Test creating a Jira ticket via the dashboard with dynamic credentials
