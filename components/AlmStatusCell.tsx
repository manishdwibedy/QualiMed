import React from 'react';
import { type TestCase, ALMStatus, ALMPlatform } from '../types';
import { createAlmTicket } from '../services/almService';
import { CheckCircleIcon, XCircleIcon, SpinnerIcon } from './Icons';
import { logAnalyticsEvent } from '../services/analyticsService';

interface AlmStatusCellProps {
  testCase: TestCase;
  platform: ALMPlatform;
  onStatusUpdate: (testCaseId: string, status: ALMStatus, result?: { issueKey?: string; error?: string }) => void;
  jiraConfig?: { instanceUrl: string; userEmail: string; apiToken: string; projectKey: string };
  azureDevOpsConfig?: { organization: string; project: string; personalAccessToken: string; workItemType: string };
  polarionConfig?: { serverUrl: string; username: string; password: string; projectId: string };
}

export const AlmStatusCell: React.FC<AlmStatusCellProps> = ({ testCase, platform, onStatusUpdate, jiraConfig, azureDevOpsConfig, polarionConfig }) => {

  const handleCreateTicket = async () => {
    logAnalyticsEvent('create_alm_ticket_attempt', { platform, test_case_id: testCase.id });
    onStatusUpdate(testCase.id, ALMStatus.LOADING);
    const result = await createAlmTicket(testCase, platform, jiraConfig, azureDevOpsConfig, polarionConfig);

    if (result.success && result.issueKey) {
      logAnalyticsEvent('create_alm_ticket_success', { platform, test_case_id: testCase.id, issue_key: result.issueKey });
      onStatusUpdate(testCase.id, ALMStatus.SUCCESS, { issueKey: result.issueKey });
    } else {
      logAnalyticsEvent('create_alm_ticket_error', { platform, test_case_id: testCase.id, error: result.error });
      onStatusUpdate(testCase.id, ALMStatus.ERROR, { error: result.error || 'An unknown error occurred.' });
    }
  };

  const platformActionText = {
      [ALMPlatform.JIRA]: 'Create Jira',
      [ALMPlatform.POLARION]: 'Create Polarion',
      [ALMPlatform.AZURE_DEVOPS]: 'Create DevOps',
  };
  
  const buttonClasses = "px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap";

  switch (testCase.almStatus) {
    case ALMStatus.LOADING:
      return (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <SpinnerIcon className="w-4 h-4" />
          <span className="text-xs">Processing...</span>
        </div>
      );
    case ALMStatus.SUCCESS:
      return (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Success</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{testCase.almIssueKey}</span>
          </div>
        </div>
      );
    case ALMStatus.ERROR:
      return (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircleIcon className="w-5 h-5 flex-shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm">Error</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate" title={testCase.almError ?? ''}>{testCase.almError}</span>
            </div>
          </div>
          <button onClick={handleCreateTicket} className={`${buttonClasses} mt-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200`}>
            Retry
          </button>
        </div>
      );
    case ALMStatus.IDLE:
    default:
      return (
        <button onClick={handleCreateTicket} className={`${buttonClasses} bg-sky-600 hover:bg-sky-700 text-white shadow-sm`}>
          {platformActionText[platform] || 'Create Ticket'}
        </button>
      );
  }
};
