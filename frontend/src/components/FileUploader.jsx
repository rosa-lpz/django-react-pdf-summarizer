import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const FileUploader = ({ onFileUploaded, isUploading }) => {
  const [uploadStatus, setUploadStatus] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setUploadStatus(null);
      onFileUploaded(file);
    } else {
      setUploadStatus({ type: 'error', message: 'Please upload a PDF file' });
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${isDragActive 
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]' 
            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <>
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
                <FileText className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">Uploading & Processing...</p>
                <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
              </div>
              <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse w-3/4"></div>
              </div>
            </>
          ) : isDragActive ? (
            <>
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
              </div>
              <p className="text-lg font-medium text-cyan-400">Drop your PDF here!</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">
                  Drop your scientific PDF here
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or click to browse your files
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FileText className="w-4 h-4" />
                <span>PDF files only, max 50MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div
          className={`
            mt-4 p-3 rounded-lg flex items-center gap-2 animate-fadeIn
            ${uploadStatus.type === 'error' 
              ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
              : 'bg-green-500/10 border border-green-500/20 text-green-400'
            }
          `}
        >
          {uploadStatus.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{uploadStatus.message}</span>
        </div>
      )}

      {/* Accepted Files Preview */}
      {acceptedFiles.length > 0 && !isUploading && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 animate-fadeIn">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {acceptedFiles[0].name}
              </p>
              <p className="text-xs text-gray-400">
                {(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
