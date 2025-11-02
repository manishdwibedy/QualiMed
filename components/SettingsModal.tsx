import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { XIcon } from './Icons';
import { JiraConfig } from './JiraConfig';
import { AzureDevOpsConfig } from './AzureDevOpsConfig';
import { PolarionConfig } from './PolarionConfig';
import { loadAlmSettings, saveAlmSettings, AlmSettings, loadApiSettings, saveApiSettings, ApiSettings } from '../services/settingsService';
import { ModelProvider } from '../types';
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
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    provider: ModelProvider.GEMINI,
    geminiApiKey: '',
    ollamaUrl: '',
    ollamaModel: '',
    temperature: 0.4,
    maxOutputTokens: 1000,
    topP: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const [almSettingsData, apiSettingsData] = await Promise.all([
        loadAlmSettings(),
        loadApiSettings(),
      ]);
      setAlmSettings(almSettingsData);
      setApiSettings(apiSettingsData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to Firebase
      await Promise.all([
        saveAlmSettings(almSettings),
        saveApiSettings(apiSettings),
      ]);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
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
                      Model Provider
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {Object.values(ModelProvider).map(provider => (
                        <label key={provider} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="model-provider"
                            value={provider}
                            checked={apiSettings.provider === provider}
                            onChange={() => setApiSettings(prev => ({ ...prev, provider }))}
                            className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                          />
                          <span className="font-medium text-slate-700 dark:text-slate-300">{provider}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {apiSettings.provider === ModelProvider.GEMINI && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Gemini API Key
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your Gemini API key"
                        value={apiSettings.geminiApiKey}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
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
                  )}
                  {apiSettings.provider === ModelProvider.OLLAMA && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Ollama URL
                        </label>
                        <input
                          type="url"
                          placeholder="http://localhost:11434"
                          value={apiSettings.ollamaUrl}
                          onChange={(e) => setApiSettings(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Ollama Model
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., llama3"
                          value={apiSettings.ollamaModel}
                          onChange={(e) => setApiSettings(prev => ({ ...prev, ollamaModel: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <label className="flex justify-between items-center text-md font-semibold text-slate-700 dark:text-slate-300">
                        <span>Temperature</span>
                        <span className="font-normal text-sm text-slate-500 dark:text-slate-400">{apiSettings.temperature}</span>
                      </label>
                      <input
                        type="range"
                        min={0.0} max={2.0} step={0.1}
                        value={apiSettings.temperature}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between items-center text-md font-semibold text-slate-700 dark:text-slate-300">
                        <span>Max Output Tokens</span>
                        <span className="font-normal text-sm text-slate-500 dark:text-slate-400">{apiSettings.maxOutputTokens}</span>
                      </label>
                      <input
                        type="range"
                        min={50} max={65000} step={1}
                        value={apiSettings.maxOutputTokens}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, maxOutputTokens: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between items-center text-md font-semibold text-slate-700 dark:text-slate-300">
                        <span>Top-P</span>
                        <span className="font-normal text-sm text-slate-500 dark:text-slate-400">{apiSettings.topP}</span>
                      </label>
                      <input
                        type="range"
                        min={0} max={1} step={0.05}
                        value={apiSettings.topP}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-600"
                      />
                    </div>
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
