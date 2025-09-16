import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, UploadCloudIcon, XIcon } from './Icons';

interface RequirementInputProps {
  requirement: string;
  setRequirement: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isParsing: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export const RequirementInput: React.FC<RequirementInputProps> = ({ 
  requirement, 
  setRequirement, 
  onGenerate, 
  isLoading,
  isParsing,
  file,
  onFileChange 
}) => {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  const isDisabled = isLoading || isParsing;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    disabled: isDisabled,
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };

  const isButtonDisabled = isDisabled || (!requirement.trim() && !file);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4">
      <div>
        <label htmlFor="requirement-input" className="block text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
          Requirement Context / Prompt
        </label>
        <textarea
          id="requirement-input"
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="e.g., Generate test cases for the login feature described in the attached document."
          className="w-full h-24 p-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-none"
          disabled={isDisabled}
          aria-label="Software Requirement Context Input"
        />
      </div>

      <div>
        <label className="block text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
          Upload Requirements Document (Optional)
        </label>
        <div 
          {...getRootProps()} 
          className={`relative p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 
            ${isDragActive ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/50' : 'border-slate-300 dark:border-slate-600 hover:border-sky-400'}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileIcon className="w-8 h-8 text-sky-500" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
                   {isParsing ? (
                    <div className="flex items-center text-sm text-sky-600 dark:text-sky-400">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Parsing document...
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={handleRemoveFile} 
                disabled={isDisabled}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Remove file"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400">
              <UploadCloudIcon className="w-10 h-10 mx-auto mb-2" />
              <p className="font-semibold">
                {isDragActive ? "Drop the file here..." : "Drag & drop a file here, or click to select"}
              </p>
              <p className="text-sm">PDF or DOCX</p>
            </div>
          )}
        </div>
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