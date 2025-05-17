"use client";
import {useState} from 'react';
import { Document, Page } from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerComponentProps {
  filename: string;
}

export default function PDFViewerComponent({ filename }: PDFViewerComponentProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    }

    return (
        <div className="space-y-4">
      <Document
        file={`http://localhost:8000/uploads/${filename}`}
        onLoadSuccess={onDocumentLoadSuccess}
        className="border rounded shadow"
      >
        <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} />
      </Document>
      {numPages && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}
            disabled={pageNumber <= 1}
            className="py-1 px-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            Previous
          </button>
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <button
            onClick={() => setPageNumber(Math.min(pageNumber + 1, numPages))}
            disabled={pageNumber >= numPages}
            className="py-1 px-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      )}
    </div>
    );
}