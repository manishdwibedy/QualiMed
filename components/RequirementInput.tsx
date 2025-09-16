
import React from 'react';

interface RequirementInputProps {
  requirement: string;
  setRequirement: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const RequirementInput: React.FC<RequirementInputProps> = ({ requirement, setRequirement, onGenerate, isLoading }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
      <label htmlFor="requirement-input" className="block text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
        Enter Software Requirement
      </label>
      <textarea
        id="requirement-input"
        value={requirement}
        onChange={(e) => setRequirement(e.target.value)}
        placeholder="e.g., The system shall allow a doctor to view a patient's medical history."
        className="w-full h-32 p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-none"
        disabled={isLoading}
        aria-label="Software Requirement Input"
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="px-6 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 ease-in-out flex items-center"
          aria-live="polite"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Test Suite'
          )}
        </button>
      </div>
    </div>
  );
};
