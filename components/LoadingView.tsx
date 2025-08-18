
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './Icons';

const loadingMessages = [
    "Initializing analysis engine...",
    "Processing image data...",
    "Scanning for structural issues...",
    "Analyzing content compliance...",
    "Checking for placement violations...",
    "Cross-referencing regulations...",
    "Finalizing report...",
];

const LoadingView = (): React.ReactNode => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-xl shadow-2xl">
            <LoadingSpinner className="h-16 w-16 text-teal-400" />
            <h2 className="text-2xl font-bold text-white mt-6">Analyzing...</h2>
            <p className="text-gray-400 mt-2 transition-opacity duration-500">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};

export default LoadingView;
