import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { FileIcon, UploadCloudIcon, XIcon, XCircleIcon, SettingsIcon, ServerIcon, KeyIcon } from './Icons';
import { type GenerationConfig, type ModelConfig, ModelProvider, type ApiSettings } from '../types';
import { logAnalyticsEvent } from '../services/analyticsService';

interface RequirementInputProps {
  requirement: string;
  setRequirement: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  generationConfig: GenerationConfig;
  onGenerationConfigChange: (config: GenerationConfig) => void;
  modelConfig: ModelConfig;
  onModelConfigChange: (config: ModelConfig) => void;
  apiSettings: ApiSettings;
}

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled: boolean;
}> = ({ label, value, min, max, step, onChange, disabled }) => (
    <div>
        <label className="flex justify-between items-center text-md font-semibold text-slate-700 dark:text-slate-300">
            <span>{label}</span>
            <span className="font-normal text-sm text-slate-500 dark:text-slate-400">{value}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-50"
        />
    </div>
);

export const RequirementInput: React.FC<RequirementInputProps> = ({
  requirement,
  setRequirement,
  onGenerate,
  isLoading,
  files,
  onFilesChange,
  generationConfig,
  onGenerationConfigChange,
  modelConfig,
  onModelConfigChange,
  apiSettings,
}) => {
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (rejectedFiles.length > 0) {
      const timer = setTimeout(() => setRejectedFiles([]), 7000);
      return () => clearTimeout(timer);
    }
  }, [rejectedFiles]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    // Add new unique files to the existing list
    const existingFileNames = new Set(files.map(f => f.name));
    const newUniqueFiles = acceptedFiles.filter(f => !existingFileNames.has(f.name));
    onFilesChange([...files, ...newUniqueFiles]);
    setRejectedFiles(fileRejections);

    if (newUniqueFiles.length > 0) {
      logAnalyticsEvent('file_upload', {
        count: newUniqueFiles.length,
        types: newUniqueFiles.map(f => f.type || 'unknown')
      });
    }
  }, [onFilesChange, files]);

  const isDisabled = isLoading;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: isDisabled,
  });

  const handleRemoveFile = (e: React.MouseEvent, fileToRemove: File) => {
    e.stopPropagation();
    onFilesChange(files.filter(f => f !== fileToRemove));
  };
  
  const handleRemoveAll = () => {
    onFilesChange([]);
    setRejectedFiles([]);
  }
  
  const handleGenConfigChange = (field: keyof Omit<GenerationConfig, 'categories'>, value: string | number) => {
    onGenerationConfigChange({ ...generationConfig, [field]: value });
  };
  
  const handleModelConfigChange = (field: keyof ModelConfig, value: string | ModelProvider) => {
    onModelConfigChange({ ...modelConfig, [field]: value });
  };

  const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory && !generationConfig.categories.includes(trimmedCategory)) {
        onGenerationConfigChange({
            ...generationConfig,
            categories: [...generationConfig.categories, trimmedCategory],
        });
        setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    onGenerationConfigChange({
        ...generationConfig,
        categories: generationConfig.categories.filter(c => c !== categoryToRemove),
    });
  };

  const isButtonDisabled = isDisabled || (!requirement.trim() && files.length === 0);
  const buttonText = files.length > 0 ? `Start Batch Generation (${files.length} ${files.length === 1 ? 'File' : 'Files'})` : 'Generate Test Suite';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4">
      <div>
        <label htmlFor="requirement-input" className="block text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
          Requirement Context / Prompt (Applies to all documents)
        </label>
        <textarea
          id="requirement-input"
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="e.g., Generate security test cases for the features described in the attached document(s)."
          className="w-full h-24 p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-none"
          disabled={isDisabled}
          aria-label="Software Requirement Context Input"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
          Upload Requirements Documents
        </label>
        <div 
          {...getRootProps()} 
          className={`relative p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 
            ${isDragActive ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50' : 'border-slate-300 dark:border-slate-600 hover:border-sky-400'}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="text-center text-slate-500 dark:text-slate-400">
              <UploadCloudIcon className="w-10 h-10 mx-auto mb-2" />
              <p className="font-semibold">
                {isDragActive ? "Drop the files here..." : "Drag & drop files or a folder here, or click to select"}
              </p>
              <p className="text-sm">PDF or DOCX</p>
            </div>
        </div>
      </div>
      
      {rejectedFiles.length > 0 && (
        <div className="space-y-2 animate-fade-in" aria-live="polite">
            <h4 className="font-semibold text-red-600 dark:text-red-400">Rejected Files</h4>
            <ul className="space-y-2">
                {rejectedFiles.map(({ file, errors }) => (
                    <li key={file.name + file.size} className="flex items-start justify-between bg-red-100 dark:bg-red-900/50 p-3 rounded-md">
                        <div className="flex items-start space-x-3 overflow-hidden">
                            <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="truncate block font-medium text-red-800 dark:text-red-200" title={file.name}>{file.name}</span>
                                <p className="text-sm text-red-700 dark:text-red-300">{errors.map(e => e.message).join(', ')}</p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      )}

      {files.length > 0 && (
         <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">{files.length} file{files.length > 1 && 's'} selected</h4>
                <button onClick={handleRemoveAll} disabled={isDisabled} className="text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 disabled:opacity-50">Clear all</button>
            </div>
            <ul className="max-h-40 overflow-y-auto space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                        <div className="flex items-center space-x-2 overflow-hidden">
                            <FileIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate" title={file.name}>{file.name}</span>
                        </div>
                        <button 
                            onClick={(e) => handleRemoveFile(e, file)} 
                            disabled={isDisabled}
                            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                            aria-label={`Remove ${file.name}`}
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      )}
      
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <details>
              <summary className="list-none flex items-center gap-2 cursor-pointer font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  <SettingsIcon className="w-5 h-5" />
                  Advanced Settings
                  <span className="details-arrow ml-1 transform transition-transform duration-200">&#9656;</span>
              </summary>
              <div className="mt-4 space-y-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2 animate-fade-in">
                  <div>
                      <label htmlFor="system-instruction" className="block text-md font-semibold mb-2 text-slate-700 dark:text-slate-300">
                          System Instruction
                      </label>
                      <textarea
                          id="system-instruction"
                          value={generationConfig.systemInstruction}
                          onChange={(e) => handleGenConfigChange('systemInstruction', e.target.value)}
                          placeholder="Provide detailed instructions for the AI, including negative constraints (e.g., 'Do not include performance tests')."
                          className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-y font-mono text-sm"
                          disabled={isDisabled}
                          aria-label="System Instruction for AI model"
                      />
                  </div>
                  
                  <div className="space-y-4">
                        <label className="block text-md font-semibold text-slate-700 dark:text-slate-300">
                            Test Case Categories
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                            {generationConfig.categories.map((cat) => (
                                <div key={cat} className="flex items-center gap-1 bg-sky-100 dark:bg-sky-800 text-sky-800 dark:text-sky-200 text-sm font-medium px-2 py-1 rounded-full">
                                    <span>{cat}</span>
                                    <button
                                        onClick={() => handleRemoveCategory(cat)}
                                        disabled={isDisabled}
                                        className="p-0.5 rounded-full hover:bg-sky-200 dark:hover:bg-sky-700 disabled:opacity-50"
                                        aria-label={`Remove ${cat} category`}
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                                placeholder="Add new category (e.g., Usability)"
                                disabled={isDisabled}
                                className="flex-grow p-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={isDisabled || !newCategory.trim()}
                                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-sm hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                  <div className="space-y-4">
                     <label className="block text-md font-semibold text-slate-700 dark:text-slate-300">Model Configuration</label>
                     <div className="flex flex-wrap gap-4">
                         {Object.values(ModelProvider).map(provider => (
                            <label key={provider} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="model-provider" 
                                    value={provider} 
                                    checked={modelConfig.provider === provider} 
                                    onChange={() => handleModelConfigChange('provider', provider)}
                                    disabled={isDisabled}
                                    className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300">{provider}</span>
                            </label>
                         ))}
                     </div>
                     {modelConfig.provider === ModelProvider.GEMINI && (
                        <div className="relative animate-fade-in">
                           <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                           <input
                               type="password"
                               placeholder="Enter your Gemini API Key (optional, uses settings default)"
                               value={modelConfig.apiKey || apiSettings.geminiApiKey}
                               onChange={(e) => handleModelConfigChange('apiKey', e.target.value)}
                               disabled={isDisabled}
                               className="w-full pl-10 p-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                           />
                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                             Leave empty to use API key from settings
                           </p>
                        </div>
                     )}
                     {modelConfig.provider === ModelProvider.OLLAMA && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                           <div className="relative">
                              <ServerIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <input
                                  type="text"
                                  placeholder="Ollama Server URL"
                                  value={modelConfig.ollamaUrl || apiSettings.ollamaUrl}
                                  onChange={(e) => handleModelConfigChange('ollamaUrl', e.target.value)}
                                  disabled={isDisabled}
                                  className="w-full pl-10 p-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              />
                           </div>
                           <input
                              type="text"
                              placeholder="Model Name (e.g., llama3)"
                              value={modelConfig.ollamaModel || apiSettings.ollamaModel}
                              onChange={(e) => handleModelConfigChange('ollamaModel', e.target.value)}
                              disabled={isDisabled}
                              className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                           />
                        </div>
                     )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                      <SliderControl
                          label="Temperature"
                          value={generationConfig.temperature}
                          min={0} max={1} step={0.1}
                          onChange={(v) => handleGenConfigChange('temperature', v)}
                          disabled={isDisabled}
                      />
                      <SliderControl
                          label="Top-K"
                          value={generationConfig.topK}
                          min={1} max={100} step={1}
                          onChange={(v) => handleGenConfigChange('topK', v)}
                          disabled={isDisabled}
                      />
                       <SliderControl
                          label="Top-P"
                          value={generationConfig.topP}
                          min={0} max={1} step={0.05}
                          onChange={(v) => handleGenConfigChange('topP', v)}
                          disabled={isDisabled}
                      />
                  </div>
              </div>
          </details>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={isButtonDisabled}
          className="px-6 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 ease-in-out flex items-center"
          aria-live="polite"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
       <style>{`
          details[open] .details-arrow {
              transform: rotate(90deg);
          }
          details > summary {
            list-style: none;
          }
          details > summary::-webkit-details-marker {
            display: none;
          }
      `}</style>
    </div>
  );
};