'use client';

import React, { useState } from 'react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: string;
}

interface ImageGalleryProps {
  images: GeneratedImage[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ImageGallery({ images, onLoadMore, hasMore = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No images generated yet</h3>
        <p className="text-gray-500">Create your first AI-generated image using the prompt builder above.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setSelectedImage(image)}
          >
            <div className="aspect-square relative">
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-4">
                  <p className="text-sm font-medium mb-2 line-clamp-2">{image.prompt}</p>
                  <p className="text-xs">{image.model}</p>
                </div>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(image.url, `${image.id}.png`);
              }}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            {/* Timestamp */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-white">
              <p className="text-xs">{formatDate(image.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load More Images
          </button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-3/4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto object-contain max-h-[70vh]"
                />
              </div>

              {/* Details */}
              <div className="lg:w-1/4 p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Image Details</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Model</p>
                    <p className="text-sm text-gray-900">{selectedImage.model}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Generated</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedImage.timestamp)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Prompt</p>
                    <p className="text-sm text-gray-900 bg-white p-3 rounded border border-gray-200">
                      {selectedImage.prompt}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => handleDownload(selectedImage.url, `${selectedImage.id}.png`)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Download Image
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedImage.prompt);
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Copy Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}