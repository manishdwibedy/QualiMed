import React from 'react';

interface JiraConfigProps {
  config: {
    instanceUrl: string;
    userEmail: string;
    apiToken: string;
    projectKey: string;
  };
  onConfigChange: (config: {
    instanceUrl: string;
    userEmail: string;
    apiToken: string;
    projectKey: string;
  }) => void;
}

export const JiraConfig: React.FC<JiraConfigProps> = ({ config, onConfigChange }) => {
  const handleChange = (field: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...config,
      [field]: e.target.value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Jira Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="instanceUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Instance URL
          </label>
          <input
            type="url"
            id="instanceUrl"
            value={config.instanceUrl}
            onChange={handleChange('instanceUrl')}
            placeholder="https://your-instance.atlassian.net"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="userEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            User Email
          </label>
          <input
            type="email"
            id="userEmail"
            value={config.userEmail}
            onChange={handleChange('userEmail')}
            placeholder="your-email@example.com"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="apiToken" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            API Token
          </label>
          <input
            type="password"
            id="apiToken"
            value={config.apiToken}
            onChange={handleChange('apiToken')}
            placeholder="Your Jira API Token"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="projectKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Project Key
          </label>
          <input
            type="text"
            id="projectKey"
            value={config.projectKey}
            onChange={handleChange('projectKey')}
            placeholder="PROJ"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
        These credentials are stored temporarily in your browser and not persisted. Generate an API token from your Atlassian account settings.
      </p>
    </div>
  );
};
