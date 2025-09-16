
import React from 'react';
import { type TestCase, JiraStatus } from '../types';
import { SingleTestCaseCard } from './SingleTestCaseCard';

interface TestCaseDisplayProps {
  testCases: TestCase[];
  onJiraStatusUpdate: (testCaseId: string, status: JiraStatus, result?: { issueKey?: string, error?: string }) => void;
}

export const TestCaseDisplay: React.FC<TestCaseDisplayProps> = ({ testCases, onJiraStatusUpdate }) => {
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
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Generated Test Case Suite</h2>
      {testCases.map((testCase) => (
        <SingleTestCaseCard 
          key={testCase.id} 
          testCase={testCase}
          onJiraStatusUpdate={onJiraStatusUpdate}
        />
      ))}
    </div>
  );
};
