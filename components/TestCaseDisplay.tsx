import React, { useCallback } from 'react';
import { type TestCase, ALMStatus, ALMPlatform } from '../types';
import { SingleTestCaseCard } from './SingleTestCaseCard';
import { DocumentArrowDownIcon } from './Icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface TestCaseDisplayProps {
  testCases: TestCase[];
  onAlmStatusUpdate: (testCaseId: string, status: ALMStatus, result?: { issueKey?: string, error?: string }) => void;
  onTestCaseUpdate: (testCase: TestCase) => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
  almPlatform: ALMPlatform;
  onAlmPlatformChange: (platform: ALMPlatform) => void;
}

export const TestCaseDisplay: React.FC<TestCaseDisplayProps> = ({ 
    testCases, 
    onAlmStatusUpdate, 
    onTestCaseUpdate, 
    onExportJson, 
    onExportMarkdown,
    almPlatform,
    onAlmPlatformChange
}) => {
  const handleExportPdf = useCallback(() => {
    if (!testCases || testCases.length === 0) return;

    // Type assertion because jspdf-autotable extends the jsPDF prototype
    const doc = new jsPDF() as jsPDF & { autoTable: (options: any) => jsPDF };

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let cursorY = margin;

    const addWrappedText = (text: string, x: number, y: number, options: any = {}) => {
        const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(splitText, x, y, options);
        return y + (doc.getTextDimensions(splitText).h);
    };

    doc.setFontSize(22);
    doc.text('Test Case Suite', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 15;

    testCases.forEach((tc, index) => {
        if (index > 0) {
            doc.line(margin, cursorY, pageWidth - margin, cursorY);
            cursorY += 10;
        }

        // Estimate if a new page is needed; this is a rough approximation
        if (cursorY > doc.internal.pageSize.getHeight() - 80) {
            doc.addPage();
            cursorY = margin;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        cursorY = addWrappedText(`${tc.title} (${tc.id})`, margin, cursorY);
        cursorY += 2;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        cursorY = addWrappedText(`Category: ${tc.category}`, margin, cursorY);
        cursorY = addWrappedText(`Source: ${tc.sourceFile || 'N/A'}`, margin, cursorY);
        cursorY += 8;

        if (tc.preConditions) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Pre-Conditions', margin, cursorY);
            cursorY += 6;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            cursorY = addWrappedText(tc.preConditions.replace(/`/g, ''), margin, cursorY); // Basic markdown removal
            cursorY += 8;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Test Steps', margin, cursorY);
        cursorY += 6;
        
        doc.autoTable({
            startY: cursorY,
            head: [['Step', 'Actor', 'Action']],
            body: tc.steps.map(step => [step.step, step.actor, step.action.replace(/`/g, '')]),
            theme: 'striped',
            headStyles: { fillColor: [3, 105, 161] }, // sky-700
            margin: { left: margin },
            didDrawPage: (data) => {
                cursorY = data.cursor?.y ?? cursorY;
            }
        });
        
        cursorY = (doc as any).autoTable.previous.finalY + 10;

        if (tc.testData) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Test Data', margin, cursorY);
            cursorY += 6;
            doc.setFontSize(9);
            doc.setFont('courier', 'normal');
            cursorY = addWrappedText(tc.testData.replace(/```json\n?|```/g, ''), margin, cursorY);
            doc.setFont('helvetica', 'normal');
            cursorY += 8;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Expected Result', margin, cursorY);
        cursorY += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        cursorY = addWrappedText(tc.expectedResult.replace(/`/g, ''), margin, cursorY);
        cursorY += 8;
    });

    doc.save(`test-cases-${Date.now()}.pdf`);
  }, [testCases]);

  if (testCases.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No Test Cases Generated</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">The AI could not generate test cases. Please try refining your requirement or check the batch report for errors.</p>
      </div>
    );
  }
  
  const groupedByFile = testCases.reduce((acc, tc) => {
    const key = tc.sourceFile || 'From Text Input';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tc);
    return acc;
  }, {} as Record<string, TestCase[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Generated Test Case Suite</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
           <div className="flex items-center gap-2">
             <label htmlFor="alm-select" className="text-sm font-semibold">ALM:</label>
             <select 
               id="alm-select" 
               value={almPlatform} 
               onChange={(e) => onAlmPlatformChange(e.target.value as ALMPlatform)}
               className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 pl-3 pr-8 text-sm focus:ring-sky-500 focus:border-sky-500"
             >
               {Object.values(ALMPlatform).map(p => <option key={p} value={p}>{p}</option>)}
             </select>
           </div>
           <div className="flex items-center gap-2">
             <button
              onClick={handleExportPdf}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              aria-label="Export test cases as PDF"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>PDF</span>
            </button>
            <button
              onClick={onExportMarkdown}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              aria-label="Export test cases as Markdown"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>Markdown</span>
            </button>
            <button
              onClick={onExportJson}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              aria-label="Export test cases as JSON"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>
      
      {Object.entries(groupedByFile).map(([sourceFile, tcs]) => (
        <details key={sourceFile} className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-md" open>
            <summary className="p-4 cursor-pointer font-bold text-lg text-slate-700 dark:text-slate-300 list-none flex justify-between items-center">
                <span>{sourceFile} <span className="text-sm font-medium text-slate-500">({tcs.length} test cases)</span></span>
                <svg className="w-5 h-5 transition-transform transform details-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </summary>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                {tcs.map((testCase) => (
                    <SingleTestCaseCard 
                        key={testCase.id} 
                        testCase={testCase}
                        onAlmStatusUpdate={onAlmStatusUpdate}
                        onTestCaseUpdate={onTestCaseUpdate}
                        almPlatform={almPlatform}
                    />
                ))}
            </div>
             <style>{`
                details[open] .details-arrow {
                    transform: rotate(180deg);
                }
            `}</style>
        </details>
      ))}

    </div>
  );
};