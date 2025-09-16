import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) {
    return null;
  }
  return (
    <div className="markdown-content text-slate-600 dark:text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-slate-700 dark:text-slate-200" {...props} />,
          code: ({ node, inline, className, children, ...props }) => {
            return !inline ? (
               <pre className="text-slate-600 dark:text-slate-300 p-3 my-2 rounded-md bg-slate-100 dark:bg-slate-700/50 text-sm whitespace-pre-wrap font-mono">
                <code>{children}</code>
               </pre>
            ) : (
              <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
          li: ({ node, ...props }) => <li className="pl-2" {...props} />,
          a: ({ node, ...props }) => <a className="text-sky-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          table: ({ node, ...props }) => <table className="w-full my-2 border-collapse" {...props} />,
          thead: ({ node, ...props }) => <thead className="bg-slate-100 dark:bg-slate-700" {...props} />,
          th: ({ node, ...props }) => <th className="p-2 border border-slate-300 dark:border-slate-600 font-semibold" {...props} />,
          td: ({ node, ...props }) => <td className="p-2 border border-slate-300 dark:border-slate-600" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};