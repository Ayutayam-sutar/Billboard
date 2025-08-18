import React from 'react';
import { CameraIcon, LayoutDashboardIcon, UserCircleIcon, MapIcon } from './Icons';
import { User } from '../types';

interface HeaderProps {
    user: User | null;
    navigate: (path: string) => void;
    onLogout: () => void;
    showHeatmap: boolean;
    toggleHeatmap: () => void;
}

const Header = ({ user, navigate, onLogout, showHeatmap, toggleHeatmap }: HeaderProps): React.ReactNode => {
  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <a 
            href="#/dashboard" 
            onClick={(e) => { e.preventDefault(); user && navigate('#/dashboard'); }} 
            className="group flex items-center space-x-2 sm:space-x-3 cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="relative">
              <div className="relative">
                <img src="logo.png" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" alt="Logo" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-md sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-red-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Billboard Inspector
              </h1>
              <p className="hidden md:block text-xs text-gray-500 font-medium -mt-1">
                Making cities safer
              </p>
            </div>
          </a>
           
          {user && (
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {/* Navigation */}
              <nav className="flex items-center space-x-0 sm:space-x-1 md:space-x-2">
                {/* Dashboard Button */}
                <a 
                  href="#/dashboard" 
                  onClick={(e) => { e.preventDefault(); navigate('#/dashboard'); }} 
                  className="group relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-all duration-200 hover:bg-indigo-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative p-1 sm:p-1.5 rounded-lg bg-gray-100 group-hover:bg-indigo-100 transition-colors">
                    <LayoutDashboardIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <span className="hidden sm:inline relative">Dashboard</span>
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
                
                {/* Inspect Button */}
                <a 
                  href="#/inspect" 
                  onClick={(e) => { e.preventDefault(); navigate('#/inspect'); }} 
                  className="group relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative p-1 sm:p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                    <CameraIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="hidden sm:inline relative">Inspect</span>
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
                
                {/* Heatmap Button */}
                <a 
                  href="#/Map" 
                  onClick={(e) => { e.preventDefault(); navigate('#/Map'); }} 
                  className="group relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-all duration-200 hover:bg-indigo-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative p-1 sm:p-1.5 rounded-lg bg-gray-100 group-hover:bg-indigo-100 transition-colors">
                    <MapIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <span className="hidden sm:inline relative">Heat Map</span>
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
                
                {/* Profile Button */}
                <a 
                  href="#/profile" 
                  onClick={(e) => { e.preventDefault(); navigate('#/profile'); }} 
                  className="group relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-all duration-200 hover:bg-emerald-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative p-1 sm:p-1.5 rounded-lg bg-gray-100 group-hover:bg-emerald-100 transition-colors">
                    <UserCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <span className="hidden sm:inline relative">Profile</span>
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
              </nav>

              {/* User Info Section - Desktop */}
              <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="flex flex-col items-end">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name.split(' ')[0]}
                  </p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <p className="text-xs text-gray-500 font-medium">Online</p>
                  </div>
                </div>
                
                {/* User Avatar with Logout Dropdown */}
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                    <span className="text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>
                  
                  {/* Logout Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile User Indicator */}
              <div className="md:hidden relative group">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                  <span className="text-white font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border border-white rounded-full"></div>
                
                {/* Mobile Logout Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle gradient border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-indigo-50/20 pointer-events-none"></div>
    </header>
  );
};

export default Header;