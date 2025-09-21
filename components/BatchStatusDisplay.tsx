import React from 'react';
import { type BatchFileStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, SpinnerIcon, ClockIcon } from './Icons';

interface BatchStatusDisplayProps {
  status: BatchFileStatus[];
  isProcessing: boolean;
}

const statusConfig = {
    pending: { Icon: ClockIcon, color: 'text-slate-500', label: 'Pending' },
    processing: { Icon: SpinnerIcon, color: 'text-sky-500', label: 'Processing...' },
    success: { Icon: CheckCircleIcon, color: 'text-emerald-500', label: 'Success' },
    error: { Icon: XCircleIcon, color: 'text-red-500', label: 'Error' },
};

export const BatchStatusDisplay: React.FC<BatchStatusDisplayProps> = ({ status, isProcessing }) => {

  if (isProcessing) {
    const progress = status.filter(s => s.status === 'success' || s.status === 'error').length;
    const total = status.length;
    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4 animate-fade-in" aria-live="polite" aria-busy="true">
        <div className="flex justify-between items-center font-semibold">
          <h3 className="text-lg text-slate-800 dark:text-slate-200">Processing Batch...</h3>
          <span className="text-slate-600 dark:text-slate-400">{progress} / {total}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
          <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${percentage}%`, transition: 'width 0.3s ease-in-out' }}></div>
        </div>
        <ul className="max-h-48 overflow-y-auto space-y-2 pt-2">
            {status.map((item) => {
                const { Icon, color, label } = statusConfig[item.status];
                return (
                    <li key={item.name} className="flex items-center justify-between text-sm p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                        <span className="truncate font-medium text-slate-700 dark:text-slate-300" title={item.name}>{item.name}</span>
                        <div className={`flex items-center gap-2 font-semibold ${color}`}>
                            <Icon className="w-5 h-5" />
                            <span>{label}</span>
                        </div>
                    </li>
                );
            })}
        </ul>
      </div>
    );
  }
  
  // Summary Report View
  const successItems = status.filter(s => s.status === 'success');
  const failedItems = status.filter(s => s.status === 'error');
  const totalSuccessCount = successItems.reduce((sum, item) => sum + (item.generatedCount || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4 animate-fade-in" aria-live="polite">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Batch Processing Complete</h3>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-600 dark:text-slate-300">
         <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
          <span><span className="font-bold">{totalSuccessCount}</span> test cases generated from <span className="font-bold">{successItems.length}</span> file(s).</span>
         </div>
         {failedItems.length > 0 && (
          <div className="flex items-center gap-2">
              <XCircleIcon className="w-6 h-6 text-red-500" />
              <span><span className="font-bold">{failedItems.length}</span> file(s) failed to process.</span>
          </div>
         )}
      </div>
      
      {failedItems.length > 0 && (
          <details className="pt-2">
              <summary className="font-semibold cursor-pointer text-slate-700 dark:text-slate-300">View Failed Documents</summary>
              <ul className="mt-2 max-h-40 overflow-y-auto space-y-2 text-sm">
                  {failedItems.map(item => (
                      <li key={item.name} className="p-3 bg-red-100 dark:bg-red-900/50 rounded-md">
                          <p className="font-semibold text-red-800 dark:text-red-300">{item.name}</p>
                          <p className="text-red-600 dark:text-red-400 mt-1">{item.message}</p>
                      </li>
                  ))}
              </ul>
          </details>
      )}
    </div>
  )
};