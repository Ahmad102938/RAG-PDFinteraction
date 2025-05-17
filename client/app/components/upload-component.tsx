"use client";
import { useState } from 'react';

interface UploadComponentProps {
  onUpload: (filename: string) => void;
}

export default function UploadComponent({ onUpload }: UploadComponentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/upload/pdf', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        onUpload(data.file.filename); // Assumes backend returns { file: { filename: string } }
        setSelectedFile(null); // Reset file input
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
      />
      <button
        onClick={handleUpload}
        disabled={!selectedFile}
        className="w-full py-2 px-4 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
      >
        Upload PDF
      </button>
    </div>
  );
}