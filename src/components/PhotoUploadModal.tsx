'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
}

export default function PhotoUploadModal({ isOpen, onClose, onUpload }: PhotoUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Add Photos</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-lg text-gray-900 dark:text-gray-100">
              {isDragActive
                ? 'Drop the photos here...'
                : 'Drag and drop photos here, or click to select files'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supported formats: JPEG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Selected Photos ({selectedFiles.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group aspect-square">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload Photos'}
          </button>
        </div>
      </div>
    </div>
  );
} 