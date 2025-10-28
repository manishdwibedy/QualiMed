# QualiMed Enhancement TODO List

## Approved Plan: Implement Real ALM Integrations

### 1. Update almService.ts for Real Jira
- [x] Uncomment the real Jira implementation in createJiraTicket function

### 2. Implement Real Polarion Integration
- [x] Implement real createPolarionWorkItem function using Polarion REST API

### 3. Implement Real Azure DevOps Integration
- [x] Implement real createAzureDevOpsWorkItem function using Azure DevOps REST API

### 4. Update config.ts
- [x] Add configuration objects for Polarion and Azure DevOps

### Followup Steps
- [x] Test integrations with real APIs (Jira tested successfully - created issue SCRUM-7)
- [x] Update INSTALLATION.md with new setup instructions

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
