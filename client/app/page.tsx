"use client";
// import Image from "next/image";
// import FileUpload from "./components/file-upload";
import { useState } from 'react';
import UploadComponent from './components/upload-component';
import PDFViewerComponent from './components/viewer-component';
import ChatComponent from './components/chat-component';
export default function Home() {
  const [currentPDF, setCurrentPDF] = useState<string | null>(null);
  const handlePDFUpload = (filename: string) => {
    setCurrentPDF(filename);
  };
  return (
    <div className="flex h-screen">
      {/* Left Section: Upload */}
      <div className="w-1/4 bg-gray-100 p-4">
        <UploadComponent onUpload={handlePDFUpload} />
      </div>
      {/* Middle Section: PDF Viewer */}
      <div className="w-1/2 bg-white p-4 overflow-y-auto">
        {currentPDF ? (
          <PDFViewerComponent filename={currentPDF} />
        ) : (
          <p className="text-center text-gray-500">No PDF selected</p>
        )}
      </div>
      {/* Right Section: Chat */}
      <div className="w-1/4 bg-gray-100 p-4">
        <ChatComponent />
      </div>
    </div>
  );
}
