import ReactMarkdown from 'react-markdown';
import { BookOpen, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

// Extract text content from various LLM response formats
const extractTextContent = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    // Handle Gemini API format: [{type: 'text', text: '...'}]
    const textPart = content.find(item => item.type === 'text');
    if (textPart?.text) return textPart.text;
    return content.map(item => item.text || JSON.stringify(item)).join('');
  }
  if (content?.content) return extractTextContent(content.content);
  if (content?.text) return content.text;
  return JSON.stringify(content);
};

const SummaryPanel = ({ summary, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (summary) {
      await navigator.clipboard.writeText(extractTextContent(summary));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Summary</h2>
        </div>
        
        {summary && !isLoading && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-gray-600 border-t-cyan-400 animate-spin"></div>
              <Sparkles className="w-5 h-5 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Analyzing document...</p>
              <p className="text-sm text-gray-400 mt-1">AI is reading and summarizing the article</p>
            </div>
          </div>
        ) : summary ? (
          <div className="markdown-content animate-fadeIn">
            <ReactMarkdown>{extractTextContent(summary)}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400">
              Upload a PDF and click "Generate Summary" to see the AI-generated summary
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPanel;
