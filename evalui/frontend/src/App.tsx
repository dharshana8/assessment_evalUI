import React, { useState, useEffect } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { Topbar } from './components/Topbar';
import { LoginPage } from './pages/LoginPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { OrgAdminDashboard } from './pages/OrgAdminDashboard';
import { UserManagement } from './pages/UserManagement';
import { OrganizationSettings } from './pages/OrganizationSettings';
import { ReportsPage } from './pages/ReportsPage';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { StudentSubmission } from './pages/StudentSubmission';
import { EvaluationResult } from './pages/EvaluationResult';
import { User } from './types/auth';
import { Assignment, EvaluationResultData } from './types/evaluation';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('evalui_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const fetchAssignments = async () => {
    try {
      const list = await api.listAssignments();
      setAssignments(list);
      if (list.length > 0 && !selectedAssignment) {
        setSelectedAssignment(list[0]);
      } else if (list.length === 0) {
        setSelectedAssignment(null);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const checkHealth = async () => {
    try {
      const status = await api.checkHealth();
      setHealthStatus(status);
    } catch (err) {
      console.error('Backend offline or health check failed:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(false);
      await checkHealth();
      await fetchAssignments();
    };
    init();

    const interval = setInterval(async () => {
      await checkHealth();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle Login from LoginPage
  const handleLoginSuccess = (user: User) => {
    try {
      localStorage.setItem('evalui_user', JSON.stringify(user));
    } catch (e) {}
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('evalui_user');
      localStorage.removeItem('evalui_token');
      sessionStorage.clear();
    } catch (e) {}
    setCurrentUser(null);
    setActiveTab('dashboard');
    setSelectedAssignment(null);
    setEvaluationResult(null);
    // Push new entry to prevent back-button navigation into protected state
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', window.location.href);
    }
  };

  // Handle Evaluation Complete
  const handleEvaluationComplete = (result: EvaluationResultData) => {
    setEvaluationResult(result);
    setActiveTab('result');
  };

  // If user is not logged in, show LoginPage (Guards all protected routes)
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex h-screen bg-forest-50/50 font-sans text-forest-900 overflow-hidden">
      
      {/* Persistent App Sidebar */}
      <AppSidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <Topbar
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          healthStatus={healthStatus}
          onLogout={handleLogout}
        />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-10 h-10 border-4 border-mint-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-forest-700">Loading EvalUI Local Engine...</p>
            </div>
          ) : (
            <>
              {/* Dashboard View */}
              {activeTab === 'dashboard' && (
                <>
                  {currentUser.role === 'ORG_ADMIN' || currentUser.role === 'PLATFORM_ADMIN' ? (
                    <OrgAdminDashboard user={currentUser} onNavigate={setActiveTab} />
                  ) : currentUser.role === 'STUDENT' ? (
                    <StudentDashboard 
                      user={currentUser} 
                      assignments={assignments}
                      onNavigate={setActiveTab}
                      onStartAssignment={(asm) => { setSelectedAssignment(asm); setActiveTab('submissions'); }}
                      onViewResults={() => setActiveTab('submissions')}
                    />
                  ) : (
                    <StaffDashboard user={currentUser} assignments={assignments} onSelectAssignment={setSelectedAssignment} onNavigate={setActiveTab} />
                  )}

                </>
              )}

              {/* Assignment Creation / Rubrics / Management */}
              {(activeTab === 'my-assignments' || activeTab === 'assignments' || activeTab === 'create-assignment' || activeTab === 'rubrics') && (
                <InstructorDashboard
                  assignments={assignments}
                  onSelectAssignment={setSelectedAssignment}
                  onRefreshAssignments={fetchAssignments}
                />
              )}

              {/* Student Submission / Evaluation Portal */}
              {(activeTab === 'submissions' || activeTab === 'evaluations') && (
                <StudentSubmission
                  assignments={assignments}
                  selectedAssignment={selectedAssignment}
                  onSelectAssignment={setSelectedAssignment}
                  onEvaluationComplete={handleEvaluationComplete}
                  healthStatus={healthStatus}
                />
              )}

              {/* Evaluation Result View */}
              {activeTab === 'result' && evaluationResult && (
                <EvaluationResult
                  data={evaluationResult}
                  onUpdateResult={setEvaluationResult}
                  onBack={() => setActiveTab('submissions')}
                  isStudentView={currentUser?.role === 'STUDENT'}
                />
              )}

              {/* User Management View */}
              {(activeTab === 'users' || activeTab === 'students') && (
                <UserManagement currentUser={currentUser} />
              )}

              {/* Organization Settings View */}
              {(activeTab === 'settings' || activeTab === 'profile') && (
                <OrganizationSettings user={currentUser} />
              )}

              {/* Analytics & Reports View */}
              {(activeTab === 'reports' || activeTab === 'progress') && (
                <ReportsPage user={currentUser} />
              )}
            </>
          )}
        </main>
      </div>

    </div>
  );
};

export default App;

