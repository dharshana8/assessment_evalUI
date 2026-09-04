import React from 'react';
import { ShieldCheck, Cpu, BookOpen, UserCheck, Play } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLoadDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onLoadDemo }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-brand/30 bg-brand-navy backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand border border-brand-light/30 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-brand-lighter" />
            </div>
            <div>
              <span className="text-display-md font-display font-semibold text-white tracking-tight">
                EvalUI
              </span>
              <span className="hidden sm:inline-block ml-2 text-caption font-mono px-2 py-0.5 rounded-full bg-brand/40 text-brand-lighter border border-brand-light/30">
                v1.0 Offline
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-xl text-label font-sans transition-colors ${
                activeTab === 'home'
                  ? 'bg-brand text-white border border-brand-light/40 shadow-sm'
                  : 'text-neutral hover:text-white hover:bg-brand/20'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('instructor')}
              className={`px-3 py-2 rounded-xl text-label font-sans transition-colors flex items-center space-x-1.5 ${
                activeTab === 'instructor'
                  ? 'bg-brand text-white border border-brand-light/40 shadow-sm'
                  : 'text-neutral hover:text-white hover:bg-brand/20'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Instructor Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('student')}
              className={`px-3 py-2 rounded-xl text-label font-sans transition-colors flex items-center space-x-1.5 ${
                activeTab === 'student'
                  ? 'bg-brand text-white border border-brand-light/40 shadow-sm'
                  : 'text-neutral hover:text-white hover:bg-brand/20'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            {/* Quick Demo Button */}
            <button
              onClick={onLoadDemo}
              className="ml-2 px-3.5 py-2 rounded-xl text-label font-display bg-brand-light hover:bg-brand-lighter text-brand-navy shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-brand-navy" />
              <span>⚡ Demo Mode</span>
            </button>
          </nav>

          {/* Status Indicator */}
          <div className="hidden lg:flex items-center space-x-2 text-caption text-brand-lighter bg-brand/40 border border-brand-light/30 px-3 py-1.5 rounded-full font-mono">
            <Cpu className="w-3.5 h-3.5 text-brand-light animate-pulse" />
            <span>Local CPU Engine Active</span>
          </div>

        </div>
      </div>
    </header>
  );
};
