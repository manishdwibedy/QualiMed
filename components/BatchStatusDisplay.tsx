import React from 'react';
import { type BatchReport } from '../types';
import { CheckCircleIcon, XCircleIcon, FileIcon } from './Icons';

interface BatchStatusDisplayProps {
  progress?: number;
  total?: number;
  currentFile?: string | null;
  report?: BatchReport | null;
}

export const BatchStatusDisplay: React.FC<BatchStatusDisplayProps> = ({ progress = 0, total = 0, currentFile, report }) => {
  if (report) {
    const totalSuccess = report.success.reduce((sum, item) => sum + item.count, 0);
    const totalFiles = report.success.length + report.failed.length;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Batch Processing Complete</h3>
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
           <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
            <span><span className="font-bold">{totalSuccess}</span> test cases generated from <span className="font-bold">{report.success.length}</span> files.</span>
           </div>
           {report.failed.length > 0 && (
            <div className="flex items-center gap-2">
                <XCircleIcon className="w-6 h-6 text-red-500" />
                <span><span className="font-bold">{report.failed.length}</span> files failed to process.</span>
            </div>
           )}
        </div>
        
        {report.failed.length > 0 && (
            <div className="space-y-2 pt-2">
                <h4 className="font-semibold">Failed Documents:</h4>
                <ul className="max-h-32 overflow-y-auto space-y-1 text-sm">
                    {report.failed.map(item => (
                        <li key={item.file} className="p-2 bg-red-100 dark:bg-red-900/50 rounded-md">
                            <p className="font-semibold text-red-800 dark:text-red-300">{item.file}</p>
                            <p className="text-red-600 dark:text-red-400">{item.reason}</p>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    )
  }
  
  if (total > 0) {
    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-3">
        <div className="flex justify-between items-center font-semibold">
          <h3 className="text-lg text-slate-800 dark:text-slate-200">Processing Batch...</h3>
          <span className="text-slate-600 dark:text-slate-400">{progress} / {total}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
          <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${percentage}%`, transition: 'width 0.3s ease-in-out' }}></div>
        </div>
        {currentFile && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-1">
            <FileIcon className="w-4 h-4" />
            <span>Processing: <span className="font-medium">{currentFile}</span></span>
          </div>
        )}
      </div>
    );
  }

  return null;
};
