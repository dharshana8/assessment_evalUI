import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  FileText, 
  Send, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Building2, 
  Settings, 
  HelpCircle, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  Zap,
  GraduationCap
} from 'lucide-react';
import { User, UserRole } from '../types/auth';

interface AppSidebarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onLaunchDemo: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onLaunchDemo
}) => {
  const role: UserRole = user?.role || 'STAFF';

  // Navigation Items per Role
  const getNavItems = () => {
    if (role === 'ORG_ADMIN' || role === 'PLATFORM_ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'organizations', label: 'Organizations', icon: Building2 },
        { id: 'users', label: 'Users & Staff', icon: Users },
        { id: 'assignments', label: 'All Assignments', icon: BookOpen },
        { id: 'evaluations', label: 'Evaluations', icon: CheckSquare },
        { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
        { id: 'settings', label: 'Org Settings', icon: Settings },
      ];
    }

    if (role === 'STUDENT') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my-assignments', label: 'My Assignments', icon: BookOpen },
        { id: 'submissions', label: 'My Submissions', icon: Send },
        { id: 'results', label: 'My Results', icon: CheckSquare },
        { id: 'progress', label: 'Learning Progress', icon: BarChart3 },
      ];
    }

    // Default: STAFF / FACULTY (Matches reference screenshot)
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'my-assignments', label: 'My Assignments', icon: BookOpen },
      { id: 'create-assignment', label: 'Create Assignment', icon: PlusCircle },
      { id: 'rubrics', label: 'Rubrics', icon: FileText },
      { id: 'submissions', label: 'Submissions', icon: Send },
      { id: 'evaluations', label: 'Evaluations', icon: CheckSquare },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'students', label: 'Students', icon: Users },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-forest-900 text-white flex flex-col justify-between h-screen sticky top-0 z-30 shadow-2xl flex-shrink-0 select-none">
      
      {/* Top Header & Brand */}
      <div className="p-5 space-y-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-mint-500 flex items-center justify-center shadow-lg text-forest-900">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-display-md font-display font-bold text-white tracking-tight leading-none">
              EvalUI
            </h1>
            <p className="text-[10px] text-mint-300 font-sans tracking-wide mt-1 opacity-90">
              Explain. Evaluate. Empower.
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-label font-sans font-medium transition-all ${
                  isActive
                    ? 'bg-forest-800 text-mint-300 font-semibold shadow-inner border-l-4 border-mint-400'
                    : 'text-emerald-100/80 hover:bg-forest-800/60 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-mint-400' : 'text-emerald-200/70'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Organization Badge & Account Actions */}
      <div className="p-4 space-y-4 border-t border-forest-800/80 bg-forest-950/40">
        
        {/* 1-Click Demo Mode Button */}
        <button
          onClick={onLaunchDemo}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold text-label shadow-md transition-all hover:scale-[1.02]"
        >
          <Zap className="w-4 h-4 fill-forest-950" />
          <span>⚡ Launch Demo Mode</span>
        </button>

        {/* Organization Card */}
        <div className="bg-forest-800/50 p-3 rounded-2xl border border-forest-700/60 flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-forest-900 border border-forest-700 text-mint-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate font-sans">
              {user?.organization_name || 'Sri Eshwar College of Eng.'}
            </h4>
            <span className="text-[10px] font-mono text-mint-300 block">
              {user?.organization_code || 'SECE'} Workspace
            </span>
          </div>
        </div>

        {/* Account Controls */}
        <div className="space-y-1 pt-1">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-caption text-emerald-200/80 hover:text-white hover:bg-forest-800/40 transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-caption text-emerald-200/80 hover:text-white hover:bg-forest-800/40 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-1.5 rounded-lg text-caption text-rose-300 hover:text-white hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* App Version Tag */}
        <div className="text-[10px] text-emerald-300/60 font-mono text-center pt-1 border-t border-forest-800/40">
          EvalUI v1.0 • Offline AI Engine
        </div>

      </div>

    </aside>
  );
};
