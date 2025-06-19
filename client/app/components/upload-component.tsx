"use client";
import { useState } from 'react';

interface UploadComponentProps {
  onUpload: (filename: string) => void;
}

export default function UploadComponent({ onUpload }: UploadComponentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/upload/pdf', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        onUpload(data.file.filename);
        setSelectedFile(null);
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-6 font-orbitron text-white flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1a1a2e] rounded-xl shadow-2xl p-6 border border-purple-500/20 transform transition-all duration-300 hover:shadow-purple-500/20">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-purple-300 animate-pulse-slow">
          AI PDF Upload
        </h2>
        <div className="space-y-6">
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:bg-gradient-to-r from-purple-600 to-purple-800 file:text-white file:cursor-pointer file:hover:bg-gradient-to-r file:hover:from-purple-700 file:hover:to-purple-900 file:transition-all file:duration-300"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-purple-200 truncate">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
                Uploading...
              </>
            ) : (
              "Upload PDF"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}