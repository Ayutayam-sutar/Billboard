import React from 'react';
import Header from './Header';
import PrivacyDisclaimer from './PrivacyDisclaimer';
import { User } from '../types';

interface LayoutProps {
  user: User | null;
  navigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout = ({ user, navigate, onLogout, children }: LayoutProps): React.ReactNode => {
  return (
    <div className="bg-white min-h-screen text-gray-100 flex flex-col font-sans relative">
      <div className="absolute inset-0 w-full h-full animated-gradient -z-10"></div>
      <div className="flex flex-col flex-grow z-10">
        {user && <Header user={user} navigate={navigate} onLogout={onLogout} />}
        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            {children}
        </main>
        {user && <PrivacyDisclaimer />}
      </div>
    </div>
  );
};

export default Layout;