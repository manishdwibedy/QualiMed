import React, { useState, useEffect } from 'react';
import { type TestCase, TestCaseCategory, ALMStatus, ALMPlatform } from '../types';
import { AlmIntegration } from './AlmIntegration';
import { MarkdownRenderer } from './MarkdownRenderer';
import { JsonRenderer } from './JsonRenderer';
import { PencilIcon, ClipboardDocumentIcon, CheckIcon } from './Icons';

interface SingleTestCaseCardProps {
  testCase: TestCase;
  onAlmStatusUpdate: (testCaseId: string, status: ALMStatus, result?: { issueKey?: string, error?: string }) => void;
  onTestCaseUpdate: (testCase: TestCase) => void;
  almPlatform: ALMPlatform;
}

const categoryStyles: { [key in TestCaseCategory]: { bg: string; text: string; border: string } } = {
  [TestCaseCategory.POSITIVE]: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-500',
  },
  [TestCaseCategory.NEGATIVE]: {
    bg: 'bg-red-100 dark:bg-red-900/50',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-500',
  },
  [TestCaseCategory.EDGE_CASE]: {
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-500',
  },
};

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  copyContent?: string;
}> = ({ title, children, className, copyContent }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!copyContent) return;
    navigator.clipboard.writeText(copyContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    }).catch(err => {
      console.error('Failed to copy content: ', err);
    });
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300">{title}</h4>
        {copyContent && (
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
            aria-label="Copy to clipboard"
          >
            {isCopied ? (
              <CheckIcon className="w-5 h-5 text-emerald-500" />
            ) : (
              <ClipboardDocumentIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

const EditableField: React.FC<{ label: string; value: string; onChange: (value: string) => void; isTextArea?: boolean }> = ({ label, value, onChange, isTextArea = false }) => {
    const commonClasses = "w-full p-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200";
    return (
        <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{label}</label>
            {isTextArea ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} className={`${commonClasses} min-h-[80px] resize-y font-mono`} />
            ) : (
                <input type="text" value={value} onChange={e => onChange(e.target.value)} className={commonClasses} />
            )}
        </div>
    );
};


export const SingleTestCaseCard: React.FC<SingleTestCaseCardProps> = ({ testCase, onAlmStatusUpdate, onTestCaseUpdate, almPlatform }) => {
  const styles = categoryStyles[testCase.category] || categoryStyles[TestCaseCategory.POSITIVE];
  const [isEditing, setIsEditing] = useState(false);
  const [editedTestCase, setEditedTestCase] = useState<TestCase>(testCase);

  useEffect(() => {
    setEditedTestCase(testCase);
  }, [testCase]);

  const handleUpdate = (status: ALMStatus, result?: { issueKey?: string, error?: string }) => {
    onAlmStatusUpdate(testCase.id, status, result);
  };

  const handleInputChange = (field: keyof Omit<TestCase, 'steps'>, value: string) => {
    setEditedTestCase(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (field: 'actor' | 'action', value: string) => {
    setEditedTestCase(prev => ({
        ...prev,
        steps: [{ ...prev.steps[0], [field]: value }]
    }));
  };

  const handleSave = () => {
    onTestCaseUpdate(editedTestCase);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedTestCase(testCase); // Revert changes
    setIsEditing(false);
  };

  if (isEditing) {
    return (
        <article className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border-l-4 ${styles.border}`} aria-labelledby={`test-case-title-${testCase.id}`}>
            <div className="space-y-4">
                <header>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editing Test Case</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">ID: {testCase.id}</p>
                </header>
                
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <EditableField label="Title" value={editedTestCase.title} onChange={value => handleInputChange('title', value)} />
                    <EditableField label="Pre-Conditions" value={editedTestCase.preConditions || ''} onChange={value => handleInputChange('preConditions', value)} isTextArea />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <EditableField label="Actor" value={editedTestCase.steps[0].actor} onChange={value => handleStepChange('actor', value)} />
                        <EditableField label="Action" value={editedTestCase.steps[0].action} onChange={value => handleStepChange('action', value)} isTextArea />
                    </div>

                    <EditableField label="Test Data" value={editedTestCase.testData || ''} onChange={value => handleInputChange('testData', value)} isTextArea />
                    <EditableField label="Expected Result" value={editedTestCase.expectedResult} onChange={value => handleInputChange('expectedResult', value)} isTextArea />
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={handleCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </article>
    );
  }

  return (
    <article className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border-l-4 ${styles.border} animate-fade-in`} aria-labelledby={`test-case-title-${testCase.id}`}>
      <div className="space-y-6">
        <header className="flex justify-between items-start flex-wrap gap-2">
          <div className="flex-1">
            <h3 id={`test-case-title-${testCase.id}`} className="text-xl font-bold text-sky-600 dark:text-sky-400">{testCase.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">ID: {testCase.id}</p>
          </div>
          <div className="flex items-center gap-4">
             <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles.bg} ${styles.text}`}>
                {testCase.category}
             </span>
             <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Edit test case">
                <PencilIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
             </button>
          </div>
        </header>

        <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">

          {testCase.preConditions && (
             <Section title="Pre-Conditions">
              <div className="p-3 rounded-md bg-slate-100 dark:bg-slate-700/50">
                <MarkdownRenderer content={testCase.preConditions} />
              </div>
            </Section>
          )}

          <Section title="Test Steps">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="p-3 font-semibold text-sm w-16">Step</th>
                    <th className="p-3 font-semibold text-sm">Actor</th>
                    <th className="p-3 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {testCase.steps.map((step) => (
                    <tr key={step.step} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="p-3 text-center">{step.step}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{step.actor}</td>
                      <td className="p-3">
                        <MarkdownRenderer content={step.action} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
          
          {testCase.testData && (
             <Section title="Test Data" copyContent={testCase.testData}>
              <JsonRenderer data={testCase.testData} />
            </Section>
          )}

          <Section title="Expected Result">
            <div className={`p-3 rounded-md ${styles.bg}`}>
               <MarkdownRenderer content={testCase.expectedResult} />
            </div>
          </Section>
        </div>

        <AlmIntegration 
          testCase={testCase} 
          platform={almPlatform} 
          onUpdate={handleUpdate} 
        />
      </div>
    </article>
  );
};