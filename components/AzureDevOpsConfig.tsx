import React from 'react';

interface AzureDevOpsConfigProps {
  config: {
    organization: string;
    project: string;
    personalAccessToken: string;
    workItemType: string;
  };
  onConfigChange: (config: {
    organization: string;
    project: string;
    personalAccessToken: string;
    workItemType: string;
  }) => void;
}

export const AzureDevOpsConfig: React.FC<AzureDevOpsConfigProps> = ({ config, onConfigChange }) => {
  const handleChange = (field: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...config,
      [field]: e.target.value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Azure DevOps Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Organization
          </label>
          <input
            type="text"
            id="organization"
            value={config.organization}
            onChange={handleChange('organization')}
            placeholder="your-organization"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Project
          </label>
          <input
            type="text"
            id="project"
            value={config.project}
            onChange={handleChange('project')}
            placeholder="your-project"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="personalAccessToken" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Personal Access Token
          </label>
          <input
            type="password"
            id="personalAccessToken"
            value={config.personalAccessToken}
            onChange={handleChange('personalAccessToken')}
            placeholder="Your PAT"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="workItemType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Work Item Type
          </label>
          <input
            type="text"
            id="workItemType"
            value={config.workItemType}
            onChange={handleChange('workItemType')}
            placeholder="Test Case"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
        These credentials are stored temporarily in your browser and not persisted. Generate a PAT from Azure DevOps → User Settings → Personal Access Tokens.
      </p>
    </div>
  );
};
