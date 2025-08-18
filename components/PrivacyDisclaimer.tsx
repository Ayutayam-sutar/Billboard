
import React from 'react';

const PrivacyDisclaimer = (): React.ReactNode => {
    return (
        <footer className="w-full text-center p-4 mt-8">
            <div className="max-w-3xl mx-auto bg-gray-800/50 rounded-lg p-3">
                 <p className="text-xs text-white">
                    <strong>Privacy Disclaimer:</strong> This application is for demonstration purposes. Images are sent for analysis and are not stored long-term. No personal data or faces are detected or stored. By using this service, you agree to these terms.
                </p>
            </div>
        </footer>
    );
}

export default PrivacyDisclaimer;
