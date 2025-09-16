
import React from 'react';
import { type TestCase, JiraStatus } from '../types';
import { createJiraTicket } from '../services/jiraService';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface JiraIntegrationProps {
  testCase: TestCase;
  onUpdate: (status: JiraStatus, result?: { issueKey?: string; error?: string }) => void;
}

export const JiraIntegration: React.FC<JiraIntegrationProps> = ({ testCase, onUpdate }) => {
  
  const handleCreateTicket = async () => {
    onUpdate(JiraStatus.LOADING);
    const result = await createJiraTicket(testCase);

    if (result.success && result.issueKey) {
      onUpdate(JiraStatus.SUCCESS, { issueKey: result.issueKey });
    } else {
      onUpdate(JiraStatus.ERROR, { error: result.error || 'An unknown error occurred.' });
    }
  };

  const renderContent = () => {
    switch (testCase.jiraStatus) {
      case JiraStatus.LOADING:
        return (
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <svg className="animate-spin mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creating Jira ticket...</span>
          </div>
        );
      case JiraStatus.SUCCESS:
        return (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-6 h-6 mr-2" />
            <span>Success! Jira ticket created: <strong>{testCase.jiraIssueKey}</strong></span>
          </div>
        );
      case JiraStatus.ERROR:
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-red-600 dark:text-red-400">
            <div className="flex items-center flex-shrink-0">
              <XCircleIcon className="w-6 h-6 mr-2" />
              <span>Error: {testCase.jiraError}</span>
            </div>
            <button
              onClick={handleCreateTicket}
              className="mt-2 sm:mt-0 sm:ml-4 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        );
      case JiraStatus.IDLE:
      default:
        return (
          <button
            onClick={handleCreateTicket}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 transform hover:scale-105 transition-all duration-200 ease-in-out"
          >
            Create Jira Ticket
          </button>
        );
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
      {renderContent()}
    </div>
  );
};
