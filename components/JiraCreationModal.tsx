
import React, { useState } from 'react';
import { TestCase } from '../types';

interface JiraCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (summary: string, description: string) => void;
  testCase: TestCase;
}

export const JiraCreationModal: React.FC<JiraCreationModalProps> = ({ isOpen, onClose, onSubmit, testCase }) => {
  const [summary, setSummary] = useState(`Bug in ${testCase.name}`);
  const [description, setDescription] = useState(`Test case failed: ${testCase.name}\n\n**Steps to Reproduce:**\n${testCase.steps.join('\n')}\n\n**Expected Result:**\n${testCase.expectedResult}`);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    onSubmit(summary, description);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Create Jira Ticket</h2>
        <div className="mb-4">
          <label htmlFor="summary" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Summary</label>
          <input
            type="text"
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
