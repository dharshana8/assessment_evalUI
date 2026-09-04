import React, { useState } from 'react';
import { Search, Bell, Cpu, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { User } from '../types/auth';
import { AiEngineStatusModal } from './AiEngineStatusModal';

interface TopbarProps {
  user: User | null;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onLaunchDemo?: () => void;
  healthStatus?: any;
}

export const Topbar: React.FC<TopbarProps> = ({ user, healthStatus }) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const isReady = healthStatus?.models_loaded || healthStatus?.ai_engine === 'ready';

  const roleLabel = user?.role === 'STUDENT'
    ? `Student • ${user.department || 'CSBS'}`
    : user?.role === 'ORG_ADMIN'
    ? 'Organization Admin'
    : `Faculty • ${user?.department || 'CSBS'}`;

  return (
    <>
      <header className="h-16 bg-white border-b border-forest-100 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-forest-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search assignments, submissions, students..."
            className="w-full pl-10 pr-16 py-2 bg-forest-50/50 border border-forest-200/80 rounded-xl text-xs text-forest-900 placeholder-forest-400 focus:outline-none focus:border-mint-500 focus:bg-white transition-all font-sans"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest-100 text-forest-700 border border-forest-200">
              Ctrl + K
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          
          {/* Local AI Engine Health Badge (Clickable for status panel) */}
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all border cursor-pointer ${
              isReady
                ? 'bg-mint-50 border-mint-200 text-forest-900 hover:bg-mint-100'
                : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-mint-500 animate-pulse' : 'bg-amber-500 animate-ping'}`}></span>
            <Cpu className="w-3.5 h-3.5 text-forest-700" />
            <span className="font-semibold">
              {isReady ? '🟢 Local AI Engine Ready' : '🟡 AI Engine Initializing'}
            </span>
          </button>

          {/* Notifications Icon */}
          <div className="relative">
            <button className="p-2 rounded-xl text-forest-700 hover:bg-forest-50 border border-forest-100 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white">
              3
            </span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center space-x-3 pl-2 border-l border-forest-100">
            <div className="w-9 h-9 rounded-full bg-forest-900 text-mint-300 font-display font-semibold text-xs flex items-center justify-center border border-forest-700 shadow-sm">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-sans font-bold text-forest-900 leading-tight">
                {user?.name || 'Dr. Dharshana S'}
              </div>
              <div className="text-[10px] font-sans text-forest-500 leading-tight">
                {roleLabel}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-forest-400" />
          </div>

        </div>

      </header>

      {/* AI Engine Detailed Status Modal */}
      <AiEngineStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        healthStatus={healthStatus}
      />
    </>
  );
};
