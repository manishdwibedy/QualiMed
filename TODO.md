# TODO: Fix Jira User ID Issue

- [x] Modify `services/jiraService.ts` to include `userId` in the payload for redundancy.
- [x] Remove backend credential saving from SettingsModal to save directly to Firebase.
- [ ] Test the changes by running the app and attempting to create a Jira ticket.
- [ ] Verify backend logs for user_id and frontend console for payload.
