
import React, { useRef } from 'react';
import { CameraIcon, UploadIcon, XCircleIcon } from './Icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onStartAnalysis: () => void;
  onClearImage: () => void;
  imagePreview: string;
}

const ImageUploader = ({ onImageSelect, onStartAnalysis, onClearImage, imagePreview }: ImageUploaderProps): React.ReactNode => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const triggerFileInput = (capture: boolean = false) => {
    if (fileInputRef.current) {
      if (capture) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 text-center transition-all duration-300 ease-in-out">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      {!imagePreview ? (
        <>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">Check a Billboard</h2>
            <p className="text-gray-400 mt-1">Upload a photo or use your camera to start the compliance check.</p>
          </div>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center">
             <UploadIcon className="h-12 w-12 text-gray-500 mb-4" />
             <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                    onClick={() => triggerFileInput(false)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors"
                >
                    Upload from Device
                </button>
                <button
                    onClick={() => triggerFileInput(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                >
                    <CameraIcon className="h-5 w-5 mr-2" />
                    Use Camera
                </button>
             </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-4">Image Ready for Analysis</h2>
            <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-lg mb-4">
                <img src={imagePreview} alt="Billboard preview" className="w-full h-auto object-contain" />
                <button onClick={onClearImage} className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/75 transition-colors">
                    <XCircleIcon className="h-6 w-6" />
                </button>
            </div>
            <button
                onClick={onStartAnalysis}
                className="w-full max-w-md inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-transform transform hover:scale-105"
            >
                Analyze Billboard
            </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
