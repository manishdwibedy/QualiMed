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

## New Approved Plan: Complete Polarion Integration with Dynamic Credentials

### 1. Create PolarionConfig Component
- [x] Create components/PolarionConfig.tsx following the pattern of JiraConfig and AzureDevOpsConfig

### 2. Add Polarion Config State in App.tsx
- [x] Add polarionConfig state with fields: serverUrl, username, password, projectId

### 3. Update Conditional Rendering in App.tsx
- [x] Add PolarionConfig component rendering when almPlatform === ALMPlatform.POLARION

### 4. Update Component Interfaces
- [x] Update TestCaseDisplay, AlmStatusCell, SingleTestCaseCard, AlmIntegration interfaces to include polarionConfig prop

### 5. Update almService.ts for Dynamic Polarion Config
- [x] Modify createPolarionWorkItem to accept optional polarionConfig parameter
- [x] Update createAlmTicket function signature and calls to pass polarionConfig

### 6. Update Documentation
- [x] Add Polarion API testing section to ALM.md with curl commands, prerequisites, and troubleshooting

### Followup Steps
- [ ] Test creating a Polarion work item via the dashboard with dynamic credentials
- [ ] Verify all TypeScript errors are resolved
- [ ] Ensure the new PolarionConfig component matches the UI style of existing config components
