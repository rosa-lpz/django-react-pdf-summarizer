import { FileText, Calendar, Hash } from 'lucide-react';

const DocumentInfo = ({ document }) => {
  if (!document) return null;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 animate-fadeIn">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-cyan-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">
            {document.fileName || 'Scientific Article'}
          </h3>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Hash className="w-4 h-4" />
              <span className="font-mono text-xs">{document.id?.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Uploaded just now</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            Ready
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentInfo;
