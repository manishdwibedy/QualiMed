# ALM API Testing Guide

This document provides curl commands for testing Azure DevOps and Jira API integrations before implementing the backend.

## Azure DevOps Work Item Creation

### Prerequisites
- Azure DevOps organization URL (e.g., `https://dev.azure.com/your-org`)
- Project name
- Personal Access Token (PAT) with Work Items (read & write) permissions
- Work Item Type (e.g., "Test Case")

### Test Case Data Structure
```json
{
  "id": "TC-001",
  "title": "User login with valid credentials",
  "requirement": "The system shall allow users to log in with valid username and password",
  "category": "Positive",
  "steps": [
    {
      "step": 1,
      "actor": "User",
      "action": "Navigate to login page"
    },
    {
      "step": 2,
      "actor": "User",
      "action": "Enter valid username and password"
    },
    {
      "step": 3,
      "actor": "User",
      "action": "Click login button"
    }
  ],
  "expectedResult": "User is successfully logged in and redirected to dashboard",
  "preConditions": "User has a valid account",
  "testData": "username: testuser@example.com, password: TestPass123"
}
```

### Curl Command for Azure DevOps

✅ **TESTED AND WORKING** - Successfully created Test Case work item ID #3

Replace the placeholders with your actual values:

```bash
curl -X PATCH \
  "https://dev.azure.com/ajitha-tech/GEN-AI-Exchange/_apis/wit/workitems/\$Test%20Case?api-version=7.1" \
  -H "Authorization: Basic YOUR_BASE64_ENCODED_PAT" \
  -H "Content-Type: application/json-patch+json" \
  -d '[
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": "User login with valid credentials"
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "value": "Original Requirement Context: The system shall allow users to log in with valid username and password\n\nPre-Conditions: User has a valid account\n\nTest Data: username: testuser@example.com, password: TestPass123"
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.TCM.Steps",
      "value": "<step>User: Navigate to login page</step><step>User: Enter valid username and password</step><step>User: Click login button</step>"
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.TCM.ExpectedResult",
      "value": "User is successfully logged in and redirected to dashboard"
    },
    {
      "op": "add",
      "path": "/fields/Microsoft.VSTS.Common.Priority",
      "value": 2
    },
    {
      "op": "add",
      "path": "/fields/System.Tags",
      "value": "Positive"
    }
  ]'
```

**Your working PAT (base64 encoded with colon prefix):** `OkFjbEVwT000VklqUWlZb0UwRVBQM3dFdm5hWjJpNXlmaTA4NG5leTh2NUo3OWVGUUNMQk5KUVFKOTlCSkFDQUFBQUFBQUFBQUFBQVNBWkRPb01FRQ==`

### Troubleshooting the Azure DevOps API Call

If the curl command is not working, try these debugging steps:

1. **Check PAT Permissions**: Ensure your Personal Access Token has "Work Items (read & write)" permissions
2. **Verify Organization/Project Access**: Make sure you have access to the `ajitha-tech` organization and `GEN-AI-Exchange` project
3. **Test Basic Work Item Creation**: Start with a minimal payload to isolate issues:

```bash
curl -X PATCH \
  "https://dev.azure.com/ajitha-tech/GEN-AI-Exchange/_apis/wit/workitems/\$Task?api-version=7.1" \
  -H "Authorization: Basic YOUR_BASE64_ENCODED_PAT" \
  -H "Content-Type: application/json-patch+json" \
  -d '[
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": "Test Work Item"
    }
  ]'
```

4. **Check Available Work Item Types**: Some organizations may not have "Test Case" work item type enabled. Try "Task" or "Bug" instead.
5. **Verify API Version**: Try using `api-version=6.0` instead of `7.1`
6. **Check Field Availability**: Some test management fields may not be available in your process template

### Alternative: Create Task Instead of Test Case

If "Test Case" work item type is not available, use "Task":

```bash
curl -X PATCH \
  "https://dev.azure.com/ajitha-tech/GEN-AI-Exchange/_apis/wit/workitems/\$Task?api-version=7.1" \
  -H "Authorization: Basic manish.dwibedy@gmail.comOkFjbEVwT000VklqUWlZb0UwRVBQM3dFdm5hWjJpNXlmaTA4NG5leTh2NUo3OWVGUUNMQk5KUVFKOTlCSkFDQUFBQUFBQUFBQUFBQVNBWkRPb01FRQ==" \
  -H "Content-Type: application/json-patch+json" \
  -d '[
    {
      "op": "add",
      "path": "/fields/System.Title",
      "value": "User login with valid credentials"
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "value": "Test Case: User login with valid credentials\n\nRequirement: The system shall allow users to log in with valid username and password\n\nSteps:\n1. Navigate to login page\n2. Enter valid username and password\n3. Click login button\n\nExpected: User is successfully logged in and redirected to dashboard"
    },
    {
      "op": "add",
      "path": "/fields/System.Tags",
      "value": "Test Case, Positive"
    }
  ]'
```

### How to Get Your Base64 Encoded PAT

1. Create a Personal Access Token in Azure DevOps:
   - Go to User Settings → Personal Access Tokens
   - Create new token with Work Items (Read & Write) scope
   - Copy the token

2. Encode it for Basic Auth (note the colon prefix):
```bash
echo -n ":YOUR_PAT_HERE" | base64
```

Or use an online base64 encoder with `:YOUR_PAT_HERE`

### Expected Response

Success response (201 Created):
```json
{
  "id": 12345,
  "rev": 1,
  "fields": {
    "System.Id": 12345,
    "System.Title": "User login with valid credentials",
    "System.State": "New",
    "System.Reason": "New",
    "System.WorkItemType": "Test Case"
  },
  "url": "https://dev.azure.com/YOUR_ORGANIZATION/YOUR_PROJECT/_apis/wit/workItems/12345"
}
```

### Common Issues

1. **401 Unauthorized**: Check your PAT permissions and encoding
2. **404 Not Found**: Verify organization, project name, and work item type
3. **400 Bad Request**: Check JSON syntax and field paths
4. **403 Forbidden**: PAT lacks required permissions

### Testing Different Work Item Types

For Bug:
```bash
curl -X PATCH \
  "https://dev.azure.com/YOUR_ORGANIZATION/YOUR_PROJECT/_apis/wit/workitems/\$Bug?api-version=7.1" \
  ...
```

For User Story:
```bash
curl -X PATCH \
  "https://dev.azure.com/YOUR_ORGANIZATION/YOUR_PROJECT/_apis/wit/workitems/\$User%20Story?api-version=7.1" \
  ...
```

## Jira Issue Creation

### Prerequisites
- Jira instance URL (e.g., `https://your-company.atlassian.net`)
- API Token from Atlassian account
- User email
- Project key

### Curl Command for Jira

```bash
curl -X POST \
  "https://your-company.atlassian.net/rest/api/3/issue" \
  -H "Authorization: Basic YOUR_BASE64_ENCODED_CREDENTIALS" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {
        "key": "PROJ"
      },
      "summary": "User login with valid credentials",
      "description": {
        "type": "doc",
        "version": 1,
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Original Requirement Context: The system shall allow users to log in with valid username and password"
              }
            ]
          },
          {
            "type": "heading",
            "attrs": { "level": 2 },
            "content": [{ "type": "text", "text": "Pre-Conditions" }]
          },
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "User has a valid account" }]
          },
          {
            "type": "heading",
            "attrs": { "level": 2 },
            "content": [{ "type": "text", "text": "Test Steps" }]
          },
          {
            "type": "orderedList",
            "content": [
              {
                "type": "listItem",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      { "type": "text", "text": "As User, Navigate to login page." }
                    ]
                  }
                ]
              },
              {
                "type": "listItem",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      { "type": "text", "text": "As User, Enter valid username and password." }
                    ]
                  }
                ]
              },
              {
                "type": "listItem",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      { "type": "text", "text": "As User, Click login button." }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "type": "heading",
            "attrs": { "level": 2 },
            "content": [{ "type": "text", "text": "Test Data" }]
          },
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "username: testuser@example.com, password: TestPass123" }]
          },
          {
            "type": "heading",
            "attrs": { "level": 2 },
            "content": [{ "type": "text", "text": "Expected Result" }]
          },
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "User is successfully logged in and redirected to dashboard" }]
          }
        ]
      },
      "issuetype": {
        "name": "Test Case"
      }
    }
  }'
```

### How to Get Jira Base64 Credentials

```bash
echo -n "your-email@example.com:YOUR_API_TOKEN" | base64
```

### Expected Jira Response

```json
{
  "id": "10001",
  "key": "PROJ-123",
  "self": "https://your-company.atlassian.net/rest/api/3/issue/10001"
}
```

## Polarion Work Item Creation

### Prerequisites
- Polarion server URL (e.g., `https://your-server.polarion.com`)
- Username and password with appropriate permissions
- Project ID (e.g., 'HealthApp')
- REST API access enabled on your Polarion server

### Test Case Data Structure
```json
{
  "id": "TC-001",
  "title": "User login with valid credentials",
  "requirement": "The system shall allow users to log in with valid username and password",
  "category": "Positive",
  "steps": [
    {
      "step": 1,
      "actor": "User",
      "action": "Navigate to login page"
    },
    {
      "step": 2,
      "actor": "User",
      "action": "Enter valid username and password"
    },
    {
      "step": 3,
      "actor": "User",
      "action": "Click login button"
    }
  ],
  "expectedResult": "User is successfully logged in and redirected to dashboard",
  "preConditions": "User has a valid account",
  "testData": "username: testuser@example.com, password: TestPass123"
}
```

### Curl Command for Polarion

```bash
curl -X POST \
  "https://your-server.polarion.com/polarion/rest/v1/projects/YOUR_PROJECT_ID/workitems" \
  -H "Authorization: Basic YOUR_BASE64_ENCODED_CREDENTIALS" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "testcase",
    "title": "User login with valid credentials",
    "description": "Original Requirement Context: The system shall allow users to log in with valid username and password",
    "customFields": {
      "testSteps": "User: Navigate to login page\nUser: Enter valid username and password\nUser: Click login button",
      "expectedResult": "User is successfully logged in and redirected to dashboard",
      "preConditions": "User has a valid account",
      "testData": "username: testuser@example.com, password: TestPass123",
      "category": "Positive"
    }
  }'
```

### How to Get Polarion Base64 Credentials

```bash
echo -n "your-username:YOUR_PASSWORD" | base64
```

### Expected Polarion Response

```json
{
  "id": "TC-12345",
  "type": "testcase",
  "title": "User login with valid credentials",
  "status": "open",
  "project": {
    "id": "YOUR_PROJECT_ID"
  }
}
```

### Troubleshooting Polarion API Calls

1. **Check REST API Access**: Ensure REST API is enabled in your Polarion server configuration
2. **Verify Project Permissions**: Make sure your user has write access to the specified project
3. **Test Basic Work Item Creation**: Start with a minimal payload to isolate issues:

```bash
curl -X POST \
  "https://your-server.polarion.com/polarion/rest/v1/projects/YOUR_PROJECT_ID/workitems" \
  -H "Authorization: Basic YOUR_BASE64_ENCODED_CREDENTIALS" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "testcase",
    "title": "Test Work Item"
  }'
```

4. **Check Custom Fields**: Some custom fields may not be available in your project template
5. **Verify Work Item Types**: Ensure "testcase" is a valid work item type in your project
6. **Check Server URL**: Make sure you're using the correct Polarion server URL and API version

### Common Polarion Issues

1. **401 Unauthorized**: Check username/password and base64 encoding
2. **403 Forbidden**: Verify user permissions for the project
3. **404 Not Found**: Check project ID and server URL
4. **400 Bad Request**: Verify JSON syntax and required fields
5. **500 Internal Server Error**: Check server logs for detailed error information

## Testing Tips

1. **Start with simple payloads** - Test basic work item/issue creation first
2. **Use API documentation**:
   - Azure DevOps: https://docs.microsoft.com/en-us/rest/api/azure/devops/wit/work-items/create
   - Jira: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post
   - Polarion: Check your server documentation or contact your Polarion administrator
3. **Check field availability** - Some fields may not be available in your organization/project
4. **Verify permissions** - Ensure your credentials have write access
5. **Test in development environment** - Use test projects/boards first

## Integration Notes

- Azure DevOps uses PATCH with JSON Patch operations
- Jira uses POST with Atlassian Document Format (ADF) for rich text
- Both require proper authentication headers
- Field paths and available fields may vary by organization configuration
