import React from 'react';
import { type TestCase, JiraStatus } from '../types';
import { SingleTestCaseCard } from './SingleTestCaseCard';
import { DocumentArrowDownIcon } from './Icons';

interface TestCaseDisplayProps {
  testCases: TestCase[];
  onJiraStatusUpdate: (testCaseId: string, status: JiraStatus, result?: { issueKey?: string, error?: string }) => void;
  onTestCaseUpdate: (testCase: TestCase) => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
}

export const TestCaseDisplay: React.FC<TestCaseDisplayProps> = ({ testCases, onJiraStatusUpdate, onTestCaseUpdate, onExportJson, onExportMarkdown }) => {
  if (testCases.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No Test Cases Generated</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">The AI could not generate test cases for the provided requirement. Please try refining your requirement.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Generated Test Case Suite</h2>
        <div className="flex items-center gap-2">
           <button
            onClick={onExportMarkdown}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            aria-label="Export test cases as Markdown"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Markdown</span>
          </button>
          <button
            onClick={onExportJson}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            aria-label="Export test cases as JSON"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>JSON</span>
          </button>
        </div>
      </div>
      
      {testCases.map((testCase) => (
        <SingleTestCaseCard 
          key={testCase.id} 
          testCase={testCase}
          onJiraStatusUpdate={onJiraStatusUpdate}
          onTestCaseUpdate={onTestCaseUpdate}
        />
      ))}
    </div>
  );
};