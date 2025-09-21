import React, { useState, useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
import { MarkdownRenderer } from './MarkdownRenderer';

interface JsonRendererProps {
  data: string | undefined;
}

// Custom style to override background colors and match the app's theme
const customStyle = {
    padding: '1rem',
    margin: '0',
    borderRadius: '0.375rem', // rounded-md
    backgroundColor: 'transparent',
};

// Create theme objects that won't be re-created on every render
const lightTheme = { ...prism, 'pre[class*="language-"]': { ...prism['pre[class*="language-"]'], ...customStyle } };
const darkTheme = { ...vscDarkPlus, 'pre[class*="language-"]': { ...vscDarkPlus['pre[class*="language-"]'], ...customStyle } };


export const JsonRenderer: React.FC<JsonRendererProps> = ({ data }) => {
  if (!data) return null;

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode preference and listen for changes
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(matchMedia.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    matchMedia.addEventListener('change', handler);
    return () => matchMedia.removeEventListener('change', handler);
  }, []);

  let formattedJson = data;
  let isJson = false;

  try {
    // Attempt to extract JSON from markdown code fences before parsing
    const potentialJson = data.replace(/```json\n?([\s\S]*?)```/, '$1').trim();
    const jsonObj = JSON.parse(potentialJson);
    formattedJson = JSON.stringify(jsonObj, null, 2);
    isJson = true;
  } catch (error) {
    // Not valid JSON, or it's just regular markdown.
    isJson = false;
  }

  if (isJson) {
    return (
      <div className="text-sm rounded-md bg-slate-100 dark:bg-slate-900/70 overflow-hidden border border-slate-200 dark:border-slate-700">
        <SyntaxHighlighter 
            language="json" 
            style={isDarkMode ? darkTheme : lightTheme} 
            showLineNumbers
            wrapLines={true}
            wrapLongLines={true}
        >
          {formattedJson}
        </SyntaxHighlighter>
      </div>
    );
  }

  // If it's not valid JSON, it could be other markdown content. Fall back to the original renderer.
  return <MarkdownRenderer content={data} />;
};