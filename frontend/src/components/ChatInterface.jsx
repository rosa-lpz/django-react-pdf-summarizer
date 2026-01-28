import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Send, User, Bot, Loader2, Sparkles, BookOpen } from 'lucide-react';

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

const ChatInterface = ({ onSendQuery, isProcessing, documentId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing || !documentId) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await onSendQuery(inputValue.trim());
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, there was an error processing your question. Please try again.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const suggestedQuestions = [
    "What are the main findings of this paper?",
    "What methodology was used in this study?",
    "What are the limitations mentioned?",
    "Can you explain the key concepts?",
  ];

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Q&A Chat</h2>
        {documentId && (
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Connected to document
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Ask questions about the document
            </h3>
            <p className="text-sm text-gray-400 max-w-md mb-6">
              {documentId 
                ? "The AI will answer based on the content of your uploaded PDF using RAG (Retrieval Augmented Generation)."
                : "Upload a PDF document first to start asking questions."
              }
            </p>
            
            {documentId && (
              <div className="w-full max-w-md">
                <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="px-3 py-1.5 rounded-full text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fadeIn ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20'
                    : message.isError
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'bg-gray-700/50 border border-gray-600'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-white">{message.content}</p>
                ) : (
                  <div className="markdown-content text-sm">
                    <ReactMarkdown>{extractTextContent(message.content)}</ReactMarkdown>
                  </div>
                )}
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                      <BookOpen className="w-3 h-3" />
                      Sources from document
                    </p>
                    <div className="space-y-1">
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-500 bg-gray-800/50 rounded px-2 py-1"
                        >
                          {source.page && `Page ${source.page}`}
                          {source.chunk && ` • Chunk ${source.chunk}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isProcessing && (
          <div className="flex gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Searching document and generating answer...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-800/30">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={documentId ? "Ask a question about the document..." : "Upload a PDF first..."}
            disabled={!documentId || isProcessing}
            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !documentId || isProcessing}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
