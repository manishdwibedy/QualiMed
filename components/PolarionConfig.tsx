import React from 'react';

interface PolarionConfigProps {
  config: {
    serverUrl: string;
    username: string;
    password: string;
    projectId: string;
  };
  onConfigChange: (config: {
    serverUrl: string;
    username: string;
    password: string;
    projectId: string;
  }) => void;
}

export const PolarionConfig: React.FC<PolarionConfigProps> = ({ config, onConfigChange }) => {
  const handleChange = (field: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...config,
      [field]: e.target.value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Polarion Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="serverUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Server URL
          </label>
          <input
            type="url"
            id="serverUrl"
            value={config.serverUrl}
            onChange={handleChange('serverUrl')}
            placeholder="https://your-server.polarion.com"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={config.username}
            onChange={handleChange('username')}
            placeholder="your-username"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={config.password}
            onChange={handleChange('password')}
            placeholder="Your password"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Project ID
          </label>
          <input
            type="text"
            id="projectId"
            value={config.projectId}
            onChange={handleChange('projectId')}
            placeholder="your-project-id"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
        These credentials are stored temporarily in your browser and not persisted. Use your Polarion server credentials with appropriate permissions.
      </p>
    </div>
  );
};
