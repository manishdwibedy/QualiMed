
import React from 'react';
import { type TestCase, TestCaseCategory, JiraStatus } from '../types';
import { JiraIntegration } from './JiraIntegration';

interface SingleTestCaseCardProps {
  testCase: TestCase;
  onJiraStatusUpdate: (testCaseId: string, status: JiraStatus, result?: { issueKey?: string, error?: string }) => void;
}

const categoryStyles: { [key in TestCaseCategory]: { bg: string; text: string; border: string } } = {
  [TestCaseCategory.POSITIVE]: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-500',
  },
  [TestCaseCategory.NEGATIVE]: {
    bg: 'bg-red-100 dark:bg-red-900/50',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-500',
  },
  [TestCaseCategory.EDGE_CASE]: {
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-500',
  },
};

export const SingleTestCaseCard: React.FC<SingleTestCaseCardProps> = ({ testCase, onJiraStatusUpdate }) => {
  const styles = categoryStyles[testCase.category] || categoryStyles[TestCaseCategory.POSITIVE];

  const handleUpdate = (status: JiraStatus, result?: { issueKey?: string, error?: string }) => {
    onJiraStatusUpdate(testCase.id, status, result);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border-l-4 ${styles.border} animate-fade-in`}>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400">{testCase.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">ID: {testCase.id}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles.bg} ${styles.text}`}>
            {testCase.category}
          </span>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-md font-semibold mb-2 text-slate-700 dark:text-slate-300">Test Steps</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="p-3 font-semibold text-sm w-16">Step</th>
                  <th className="p-3 font-semibold text-sm">Actor</th>
                  <th className="p-3 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {testCase.steps.map((step) => (
                  <tr key={step.step} className="border-b border-slate-200 dark:border-slate-700">
                    <td className="p-3 text-center">{step.step}</td>
                    <td className="p-3">{step.actor}</td>
                    <td className="p-3">{step.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-md font-semibold mb-2 text-slate-700 dark:text-slate-300">Expected Result</h4>
          <p className={`text-slate-600 dark:text-slate-300 p-3 rounded-md ${styles.bg}`}>
            {testCase.expectedResult}
          </p>
        </div>

        <JiraIntegration testCase={testCase} onUpdate={handleUpdate} />
      </div>
    </div>
  );
};
