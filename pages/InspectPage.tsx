import React, { useState, useCallback, useRef, useEffect } from 'react';
import { User, Report } from '../types';
import api from '../api';
import AnalysisResult from '../components/AnalysisResult';

// ADDED IMPORTS
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface InspectPageProps {
  user: User;
  onAnalysisComplete: () => void;
  navigate: (path: string) => void;
}

const InspectPage = ({ user, onAnalysisComplete, navigate }: InspectPageProps) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // MODIFIED startCamera FUNCTION
  const startCamera = async () => {
    // First, check if we are running on a native platform (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      // --- THIS IS THE NEW NATIVE CAMERA LOGIC ---
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });

        if (image.webPath) {
          setImagePreview(image.webPath);
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          const file = new File([blob], "from-camera.jpg", { type: "image/jpeg" });
          setImageFile(file);
        }
      } catch (e) {
        console.error("Native Camera Error:", e);
        setError("Camera failed or permission was denied.");
      }
    } else {
      // --- THIS IS OUR ORIGINAL WEB CAMERA LOGIC
      setMode('camera');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Camera access denied. Please allow camera permissions.');
        setMode('upload');
      }
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        setImagePreview(imageDataUrl);

        fetch(imageDataUrl)
            .then(res => res.blob())
            .then(blob => {
              const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
              setImageFile(capturedFile);
            });

        setMode('upload');
        
        if (videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleAnalysis = useCallback(async () => {
    if (!imageFile) {
      setError('Please capture or upload an image first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
        const formData = new FormData();
        formData.append('file', imageFile); 
        const response = await api.post('/analyze-hybrid', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setReport(response.data);
        onAnalysisComplete(); 
    } catch (err) {
      setError('Analysis failed. Please try again. Check the server console for details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [imageFile, onAnalysisComplete]);

  const handleReset = () => {
    setImagePreview('');
    setImageFile(null);
    setReport(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className=" animate-bounce-in-top max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billboard Inspection</h1>
          <p className="text-lg text-gray-600">
            {report ? 'Analysis Complete' : 'Capture or upload a billboard image for analysis'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg font-medium text-gray-700">Analyzing billboard...</span>
              </div>
              <p className="mt-2 text-gray-500">This may take a few moments</p>
            </div>
          ) : report ? (
            <AnalysisResult 
              report={report} 
              onReset={handleReset} 
              navigate={navigate} 
            />
          ) : mode === 'camera' ? (
            <div className="p-6">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-white border-dashed rounded-lg h-3/4 w-3/4"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => setMode('upload')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={captureImage}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Capture
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {imagePreview ? (
                <>
                  <div className="mb-6">
                    <img src={imagePreview} alt="Selected billboard" className="w-full h-auto rounded-lg shadow-sm max-h-[70vh] object-contain" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retake
                    </button>
                    <button
                      onClick={handleAnalysis}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Analyze Image
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload or Capture Billboard Image</h3>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white  bg-gradient-to-r from-red-400 via-blue-500 to-purple-500 hover:from-red-500 hover:via-blue-600 hover:to-purple-600">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                        />
                        <svg className="-ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Image
                      </label>
                      <button
                        onClick={startCamera}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white  bg-gradient-to-r from-red-400 via-blue-500 to-purple-500 hover:from-red-500 hover:via-blue-600 hover:to-purple-600"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Use Camera
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectPage;