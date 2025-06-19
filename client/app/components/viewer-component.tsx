"use client";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerComponentProps {
  filename: string;
}

export default function PDFViewerComponent({ filename }: PDFViewerComponentProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1f] p-4 md:p-6 font-orbitron text-white flex flex-col items-center">
      <div className="w-full max-w-3xl bg-[#1e1e2f] rounded-lg shadow-lg p-4 border border-purple-500/20">
        <h2 className="text-lg md:text-xl font-semibold text-center text-purple-400 mb-4">
          AI PDF Viewer
        </h2>
        <div className="overflow-auto border rounded-lg bg-gray-800">
          <Document
            file={`http://localhost:8000/uploads/${filename}`}
            onLoadSuccess={onDocumentLoadSuccess}
            className="p-4"
            loading={<p className="text-center text-gray-500">Loading PDF...</p>}
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={window.innerWidth > 768 ? 600 : window.innerWidth - 64}
            />
          </Document>
        </div>
        {numPages && (
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button
              onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}
              disabled={pageNumber <= 1}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <p className="text-sm">
              Page {pageNumber} of {numPages}
            </p>
            <button
              onClick={() => setPageNumber(Math.min(pageNumber + 1, numPages))}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}