

import React from 'react';
// Fix: Use ALMStatus instead of the non-existent JiraStatus.
import { type TestCase, type Requirement, ALMStatus } from '../types';
import { createJiraTicket } from '../services/jiraService';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface JiraIntegrationProps {
  testCase: TestCase;
  requirements: Requirement[];
  // Fix: Use ALMStatus in the onUpdate prop signature.
  onUpdate: (status: ALMStatus, result?: { issueKey?: string; error?: string }) => void;
}

export const JiraIntegration: React.FC<JiraIntegrationProps> = ({ testCase, requirements, onUpdate }) => {
  
  const handleCreateTicket = async () => {
    // Fix: Use ALMStatus enum members.
    onUpdate(ALMStatus.LOADING);
    const result = await createJiraTicket(testCase, requirements);

    if (result.success && result.issueKey) {
      // Fix: Use ALMStatus enum members.
      onUpdate(ALMStatus.SUCCESS, { issueKey: result.issueKey });
    } else {
      // Fix: Use ALMStatus enum members.
      onUpdate(ALMStatus.ERROR, { error: result.error || 'An unknown error occurred.' });
    }
  };

  const renderContent = () => {
    // Fix: Use almStatus property which exists on TestCase type.
    switch (testCase.almStatus) {
      // Fix: Use ALMStatus enum members.
      case ALMStatus.LOADING:
        return (
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <svg className="animate-spin mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creating Jira ticket...</span>
          </div>
        );
      // Fix: Use ALMStatus enum members.
      case ALMStatus.SUCCESS:
        return (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-6 h-6 mr-2" />
            {/* Fix: Use almIssueKey property which exists on TestCase type. */}
            <span>Success! Jira ticket created: <strong>{testCase.almIssueKey}</strong></span>
          </div>
        );
      // Fix: Use ALMStatus enum members.
      case ALMStatus.ERROR:
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-red-600 dark:text-red-400">
            <div className="flex items-center flex-shrink-0">
              <XCircleIcon className="w-6 h-6 mr-2" />
              {/* Fix: Use almError property which exists on TestCase type. */}
              <span>Error: {testCase.almError}</span>
            </div>
            <button
              onClick={handleCreateTicket}
              className="mt-2 sm:mt-0 sm:ml-4 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        );
      // Fix: Use ALMStatus enum members.
      case ALMStatus.IDLE:
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
