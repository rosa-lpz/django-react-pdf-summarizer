import { useState } from 'react';
import { FileText, Sparkles, Github, Brain } from 'lucide-react';
import FileUploader from './components/FileUploader';
import DocumentInfo from './components/DocumentInfo';
import SummaryPanel from './components/SummaryPanel';
import ChatInterface from './components/ChatInterface';
import { uploadPDF, summarizeDocument, queryDocument } from './services/api';

function App() {
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    setSummary('');
    
    try {
      const response = await uploadPDF(file);
      setDocument({
        id: response.id,
        fileName: file.name,
        message: response.message,
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!document?.id) return;
    
    setIsSummarizing(true);
    setError(null);
    
    try {
      const response = await summarizeDocument(document.id);
      setSummary(response.summary);
    } catch (err) {
      console.error('Summary error:', err);
      setError(err.response?.data?.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleQuery = async (query) => {
    if (!document?.id) return;
    
    setIsQuerying(true);
    
    try {
      const response = await queryDocument(document.id, query);
      return response;
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">PDF Summarizer</h1>
                <p className="text-xs text-gray-400">AI-Powered Scientific Article Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-xs text-gray-400">
                <Brain className="w-3.5 h-3.5" />
                <span>Powered by TinyLlama</span>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-fadeIn">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Summary */}
          <div className="space-y-6">
            {/* Upload Section */}
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Upload Document
              </h2>
              <FileUploader onFileUploaded={handleFileUpload} isUploading={isUploading} />
            </section>

            {/* Document Info */}
            {document && (
              <section className="animate-slideIn">
                <DocumentInfo document={document} />
                
                {/* Generate Summary Button */}
                <button
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing || !document.id}
                  className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 glow-hover"
                >
                  {isSummarizing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Summary
                    </>
                  )}
                </button>
              </section>
            )}

            {/* Summary Panel */}
            <SummaryPanel summary={summary} isLoading={isSummarizing} />
          </div>

          {/* Right Column - Chat Interface */}
          <div className="space-y-6">
            <section className="glass rounded-2xl p-6">
              <ChatInterface
                onSendQuery={handleQuery}
                isProcessing={isQuerying}
                documentId={document?.id}
              />
            </section>

            {/* Features Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Smart Extraction</h3>
                <p className="text-sm text-gray-400">
                  Automatically extracts and processes text from scientific PDFs
                </p>
              </div>
              
              <div className="glass rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">RAG-Powered Q&A</h3>
                <p className="text-sm text-gray-400">
                  Ask questions and get accurate answers from your documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              Built with Django, React & LangChain
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Open Source LLM</span>
              <span>•</span>
              <span>FAISS Vector Store</span>
              <span>•</span>
              <span>MCP Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
