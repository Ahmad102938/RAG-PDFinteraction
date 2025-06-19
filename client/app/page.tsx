"use client";
import { useState, useEffect, useRef } from "react";
import UploadComponent from "./components/upload-component";
import PDFViewerComponent from "./components/viewer-component";
import ChatComponent from "./components/chat-component";

export default function Home() {
  const [currentPDF, setCurrentPDF] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(25); // Percentage
  const [rightWidth, setRightWidth] = useState(25); // Percentage
  const centerWidth = 100 - leftWidth - rightWidth; // Calculated dynamically
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const dragRefLeft = useRef<HTMLDivElement>(null);
  const dragRefRight = useRef<HTMLDivElement>(null);

  const handlePDFUpload = (filename: string) => {
    setCurrentPDF(filename);
  };

  const handleDragStart = (isLeft: boolean) => {
    if (isLeft) setIsDraggingLeft(true);
    else setIsDraggingRight(true);
  };

  const handleDragEnd = () => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const containerWidth = window.innerWidth;

    if (isDraggingLeft && dragRefLeft.current) {
      const newLeftWidth = Math.max(
        10,
        Math.min(40, (clientX / containerWidth) * 100)
      );
      const newRightWidth = Math.max(10, 100 - newLeftWidth - centerWidth);
      if (newLeftWidth + newRightWidth <= 90) {
        setLeftWidth(newLeftWidth);
        setRightWidth(newRightWidth);
      }
    }
    if (isDraggingRight && dragRefRight.current) {
      const newRightWidth = Math.max(
        10,
        Math.min(40, ((containerWidth - clientX) / containerWidth) * 100)
      );
      const newLeftWidth = Math.max(10, 100 - newRightWidth - centerWidth);
      if (newLeftWidth + newRightWidth <= 90) {
        setRightWidth(newRightWidth);
        setLeftWidth(newLeftWidth);
      }
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (isDraggingLeft || isDraggingRight) handleDragMove(e as any);
    };
    const handleGlobalEnd = () => handleDragEnd();

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener("mousemove", handleGlobalMove);
      document.addEventListener("mouseup", handleGlobalEnd);
      document.addEventListener("touchmove", handleGlobalMove, { passive: false });
      document.addEventListener("touchend", handleGlobalEnd);
    } else {
      document.removeEventListener("mousemove", handleGlobalMove);
      document.removeEventListener("mouseup", handleGlobalEnd);
      document.removeEventListener("touchmove", handleGlobalMove);
      document.removeEventListener("touchend", handleGlobalEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMove);
      document.removeEventListener("mouseup", handleGlobalEnd);
      document.removeEventListener("touchmove", handleGlobalMove);
      document.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [isDraggingLeft, isDraggingRight]);

  return (
    <div className="min-h-screen bg-[#0f0f1f] p-2 sm:p-4 font-orbitron text-white flex flex-col">
      <div className="flex-1 flex flex-col sm:flex-row w-full">
        <div
          className="relative bg-[#1e1e2f] rounded-lg shadow-lg p-2 sm:p-4 transition-all duration-200 flex-shrink-0"
          style={{ width: `${leftWidth}%`, minWidth: "100px", flexBasis: `${leftWidth}%` }}
        >
          <UploadComponent onUpload={handlePDFUpload} />
          <div
            ref={dragRefLeft}
            onMouseDown={() => handleDragStart(true)}
            onTouchStart={() => handleDragStart(true)}
            className="absolute right-0 top-0 bottom-0 w-1 bg-purple-500 cursor-col-resize hover:bg-purple-600 transition-colors duration-200 touch-action-none"
          />
        </div>
        <div
          className="relative bg-[#1e1e2f] rounded-lg shadow-lg p-2 sm:p-4 overflow-y-auto transition-all duration-200 flex-shrink-0"
          style={{ width: `${centerWidth}%`, minWidth: "100px", flexBasis: `${centerWidth}%` }}
        >
          {currentPDF ? (
            <PDFViewerComponent filename={currentPDF} />
          ) : (
            <p className="text-center text-gray-500">No PDF selected</p>
          )}
          <div
            ref={dragRefRight}
            onMouseDown={() => handleDragStart(false)}
            onTouchStart={() => handleDragStart(false)}
            className="absolute right-0 top-0 bottom-0 w-1 bg-purple-500 cursor-col-resize hover:bg-purple-600 transition-colors duration-200 touch-action-none"
          />
        </div>
        <div
          className="relative bg-[#1e1e2f] rounded-lg shadow-lg p-2 sm:p-4 transition-all duration-200 flex-shrink-0"
          style={{ width: `${rightWidth}%`, minWidth: "100px", flexBasis: `${rightWidth}%` }}
        >
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}