import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageLightboxModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  tourTitle?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  tourTitle = 'Hidden Atlas Tour Gallery'
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, images.length - 1)));
      setZoomLevel(1);
    }
  }, [isOpen, initialIndex, images.length]);

  const handlePrev = useCallback(() => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  // Request higher resolution for full lightbox view
  const highResSrc = currentImage?.includes('images.unsplash.com')
    ? `${currentImage.split('?')[0]}?auto=format&fit=crop&w=1920&q=85`
    : currentImage;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Zoom Gallery"
      className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-lg flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-white max-w-[65%]">
          <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate drop-shadow-sm">
            {tourTitle}
          </h3>
          <p className="text-[11px] text-[#C98B4B] font-semibold tracking-wider uppercase">
            Photo {currentIndex + 1} of {images.length}
          </p>
        </div>

        {/* Zoom & Close Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            aria-label="Zoom In"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            aria-label="Zoom Out"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset Zoom */}
          {zoomLevel > 1 && (
            <button
              onClick={handleResetZoom}
              aria-label="Reset Zoom"
              className="w-10 h-10 rounded-full bg-[#E5733A] hover:bg-[#d0622b] text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close Lightbox"
            className="w-11 h-11 rounded-full bg-white/15 hover:bg-rose-600 text-white flex items-center justify-center transition-all ml-1 cursor-pointer active:scale-95"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View Area */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous Photo"
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-105 active:scale-95 border border-white/10 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Centered Image with Smooth Zoom Transform */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ease-out cursor-zoom-in"
          style={{ transform: `scale(${zoomLevel})` }}
          onClick={() => {
            if (zoomLevel === 1) handleZoomIn();
            else handleResetZoom();
          }}
        >
          <img
            src={highResSrc}
            alt={`${tourTitle} - Photo ${currentIndex + 1}`}
            className="max-h-[75vh] sm:max-h-[80vh] max-w-[94vw] object-contain rounded-[8px] shadow-2xl"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next Photo"
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-transform hover:scale-105 active:scale-95 border border-white/10 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="z-20 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center overflow-x-auto gap-2 max-w-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setZoomLevel(1);
                setCurrentIndex(idx);
              }}
              aria-label={`Jump to photo ${idx + 1}`}
              className={`w-14 h-10 sm:w-16 sm:h-12 rounded-[6px] overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-[#E5733A] scale-105 shadow-md shadow-[#E5733A]/40 opacity-100'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
