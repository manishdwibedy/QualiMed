import React from 'react';
import { type TestCase, type Requirement, ALMStatus, ALMPlatform } from '../types';
import { createAlmTicket } from '../services/almService';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface AlmIntegrationProps {
  testCase: TestCase;
  requirements: Requirement[];
  platform: ALMPlatform;
  onUpdate: (status: ALMStatus, result?: { issueKey?: string; error?: string }) => void;
  jiraConfig?: { instanceUrl: string; userEmail: string; apiToken: string; projectKey: string };
  azureDevOpsConfig?: { organization: string; project: string; personalAccessToken: string; workItemType: string };
  polarionConfig?: { serverUrl: string; username: string; password: string; projectId: string };
}

export const AlmIntegration: React.FC<AlmIntegrationProps> = ({ testCase, requirements, platform, onUpdate, jiraConfig, azureDevOpsConfig, polarionConfig }) => {

  const handleCreateTicket = async () => {
    onUpdate(ALMStatus.LOADING);
    const result = await createAlmTicket(testCase, requirements, platform, jiraConfig, azureDevOpsConfig, polarionConfig);

    if (result.success && result.issueKey) {
      onUpdate(ALMStatus.SUCCESS, { issueKey: result.issueKey });
    } else {
      onUpdate(ALMStatus.ERROR, { error: result.error || 'An unknown error occurred.' });
    }
  };
  
  const platformActionText = {
      [ALMPlatform.JIRA]: 'Create Jira Ticket',
      [ALMPlatform.POLARION]: 'Create Polarion Item',
      [ALMPlatform.AZURE_DEVOPS]: 'Create DevOps Item',
  }

  const renderContent = () => {
    switch (testCase.almStatus) {
      case ALMStatus.LOADING:
        return (
          <div className="flex items-center text-slate-500 dark:text-slate-400">
            <svg className="animate-spin mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creating {platform} item...</span>
          </div>
        );
      case ALMStatus.SUCCESS:
        return (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-6 h-6 mr-2" />
            <span>Success! {platform} item created: <strong>{testCase.almIssueKey}</strong></span>
          </div>
        );
      case ALMStatus.ERROR:
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-red-600 dark:text-red-400">
            <div className="flex items-center flex-shrink-0">
              <XCircleIcon className="w-6 h-6 mr-2" />
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
      case ALMStatus.IDLE:
      default:
        return (
          <button
            onClick={handleCreateTicket}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 transform hover:scale-105 transition-all duration-200 ease-in-out"
          >
            {platformActionText[platform] || 'Create Ticket'}
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
