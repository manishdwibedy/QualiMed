# TODO: Fix Jira Ticket Creation to Call Backend Instead of Simulating

- [x] Update `services/jiraService.ts` to import `base_url` from config and make a POST request to `${base_url}/create/jira`
- [x] Simplify payload to match backend expectations: `summary` (testCase.title), `description` (stringified content), `projectKey` ('HTP' or from config), `issuetype` ('Test Case')
- [x] Parse response: success if status_code 201, issueKey from response.response.key, else error
- [ ] Test the integration by running the app and creating a Jira ticket
- [ ] Ensure Jira credentials are configured in the backend
