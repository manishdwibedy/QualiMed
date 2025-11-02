import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { XIcon } from './Icons';
import { JiraConfig } from './JiraConfig';
import { AzureDevOpsConfig } from './AzureDevOpsConfig';
import { PolarionConfig } from './PolarionConfig';
import { loadAlmSettings, saveAlmSettings, AlmSettings } from '../services/settingsService';
import { base_url } from '../config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'alm'>('general');
  const [almSettings, setAlmSettings] = useState<AlmSettings>({
    jira: { instanceUrl: '', userEmail: '', apiToken: '', projectKey: '' },
    azureDevOps: { organization: '', project: '', personalAccessToken: '', workItemType: 'Test Case' },
    polarion: { serverUrl: '', username: '', password: '', projectId: '' },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const settings = await loadAlmSettings();
      setAlmSettings(settings);
    } catch (error) {
      console.error('Failed to load ALM settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to Firebase first
      await saveAlmSettings(almSettings);

      // Save credentials to backend
      const savePromises = [];

      if (almSettings.jira.instanceUrl && almSettings.jira.userEmail && almSettings.jira.apiToken) {
        savePromises.push(
          fetch(`${base_url}/credentials/jira`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              baseUrl: almSettings.jira.instanceUrl,
              email: almSettings.jira.userEmail,
              apiToken: almSettings.jira.apiToken,
            }),
          })
        );
      }

      if (almSettings.polarion.serverUrl && almSettings.polarion.username && almSettings.polarion.password) {
        savePromises.push(
          fetch(`${base_url}/credentials/polarion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              baseUrl: almSettings.polarion.serverUrl,
              username: almSettings.polarion.username,
              password: almSettings.polarion.password,
            }),
          })
        );
      }

      if (almSettings.azureDevOps.organization && almSettings.azureDevOps.personalAccessToken) {
        savePromises.push(
          fetch(`${base_url}/credentials/azure`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              organization: almSettings.azureDevOps.organization,
              personalAccessToken: almSettings.azureDevOps.personalAccessToken,
            }),
          })
        );
      }

      // Wait for all credential saves to complete
      if (savePromises.length > 0) {
        const responses = await Promise.all(savePromises);
        const failedSaves = responses.filter(response => !response.ok);
        if (failedSaves.length > 0) {
          console.warn('Some credentials failed to save to backend:', failedSaves);
        }
      }

      onClose();
    } catch (error) {
      console.error('Failed to save ALM settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'general'
                ? 'text-sky-500 border-b-2 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'api'
                ? 'text-sky-500 border-b-2 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('alm')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'alm'
                ? 'text-sky-500 border-b-2 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            ALM Integration
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
                  Application Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Theme
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleTheme()}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
                      >
                        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                      </button>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Current: {theme === 'light' ? 'Light' : 'Dark'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Default Export Format
                    </label>
                    <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
                  API Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your Gemini API key"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Get your API key from{' '}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-500 hover:text-sky-600"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Ollama URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="http://localhost:11434"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alm' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
                  ALM Integration Settings
                </h3>
                <div className="space-y-6">
                  <JiraConfig
                    config={almSettings.jira}
                    onConfigChange={(config) => setAlmSettings(prev => ({ ...prev, jira: config }))}
                  />
                  <AzureDevOpsConfig
                    config={almSettings.azureDevOps}
                    onConfigChange={(config) => setAlmSettings(prev => ({ ...prev, azureDevOps: config }))}
                  />
                  <PolarionConfig
                    config={almSettings.polarion}
                    onConfigChange={(config) => setAlmSettings(prev => ({ ...prev, polarion: config }))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
