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
import { AssignmentsPage } from './pages/AssignmentsPage';
import { CreateAssignmentPage } from './pages/CreateAssignmentPage';
import { StudentSubmission } from './pages/StudentSubmission';
import { FacultySubmissionsPage } from './pages/FacultySubmissionsPage';
import { EvaluationResult } from './pages/EvaluationResult';
import { User } from './types/auth';
import { Assignment, EvaluationResultData } from './types/evaluation';
import { api } from './services/api';

// Helper to normalize user roles to standard 'ADMIN' | 'TUTOR' | 'STUDENT'
const getNormalizedRole = (user: User | null): 'ADMIN' | 'TUTOR' | 'STUDENT' | null => {
  if (!user) return null;
  if (user.role === 'ORG_ADMIN' || user.role === 'PLATFORM_ADMIN') return 'ADMIN';
  if (user.role === 'STUDENT') return 'STUDENT';
  return 'TUTOR';
};

const getDefaultPathForRole = (role: 'ADMIN' | 'TUTOR' | 'STUDENT' | null): string => {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'STUDENT') return '/student/dashboard';
  if (role === 'TUTOR') return '/tutor/dashboard';
  return '/login';
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('evalui_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    return parts[1] || 'dashboard';
  });

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const normalizedRole = getNormalizedRole(currentUser);

  // Sync URL path and validate Role Access Guards on load/refresh
  useEffect(() => {
    const path = window.location.pathname;
    const normRole = getNormalizedRole(currentUser);

    if (!currentUser || !normRole) {
      if (path !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
      return;
    }

    // Role Route Guards
    if (path.startsWith('/tutor') && normRole !== 'TUTOR') {
      window.history.replaceState(null, '', getDefaultPathForRole(normRole));
      setActiveTab('dashboard');
      return;
    }
    if (path.startsWith('/student') && normRole !== 'STUDENT') {
      window.history.replaceState(null, '', getDefaultPathForRole(normRole));
      setActiveTab('dashboard');
      return;
    }
    if (path.startsWith('/admin') && normRole !== 'ADMIN') {
      window.history.replaceState(null, '', getDefaultPathForRole(normRole));
      setActiveTab('dashboard');
      return;
    }

    if (path === '/' || path === '/login') {
      window.history.replaceState(null, '', getDefaultPathForRole(normRole));
      setActiveTab('dashboard');
      return;
    }

    const parts = path.split('/').filter(Boolean);
    if (parts[1]) {
      setActiveTab(parts[1]);
    }
  }, [currentUser]);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const saved = localStorage.getItem('evalui_user');
      const user = saved ? JSON.parse(saved) : null;
      const normRole = getNormalizedRole(user);

      if (!user || !normRole) {
        window.history.replaceState(null, '', '/login');
        setCurrentUser(null);
        setActiveTab('login');
        return;
      }

      if (path.startsWith('/tutor') && normRole !== 'TUTOR') {
        window.history.replaceState(null, '', getDefaultPathForRole(normRole));
        setActiveTab('dashboard');
        return;
      }
      if (path.startsWith('/student') && normRole !== 'STUDENT') {
        window.history.replaceState(null, '', getDefaultPathForRole(normRole));
        setActiveTab('dashboard');
        return;
      }
      if (path.startsWith('/admin') && normRole !== 'ADMIN') {
        window.history.replaceState(null, '', getDefaultPathForRole(normRole));
        setActiveTab('dashboard');
        return;
      }

      const parts = path.split('/').filter(Boolean);
      setActiveTab(parts[1] || 'dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchAssignments = async () => {
    try {
      const userRole = currentUser?.role || 'STUDENT';
      const list = await api.listAssignments(userRole);
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

  // Safe Navigation Handler
  const handleNavigate = (tabOrPath: string) => {
    const normRole = getNormalizedRole(currentUser);
    if (!currentUser || !normRole) {
      window.history.replaceState(null, '', '/login');
      setActiveTab('login');
      return;
    }

    let targetTab = tabOrPath;
    let targetPath = tabOrPath;

    if (!tabOrPath.startsWith('/')) {
      targetTab = tabOrPath;
      const prefix = normRole === 'ADMIN' ? '/admin/' : normRole === 'STUDENT' ? '/student/' : '/tutor/';
      targetPath = `${prefix}${tabOrPath}`;
    } else {
      const parts = tabOrPath.split('/').filter(Boolean);
      targetTab = parts[1] || 'dashboard';
    }

    window.history.pushState(null, '', targetPath);
    setActiveTab(targetTab);
  };

  // Handle Login from LoginPage
  const handleLoginSuccess = (user: User) => {
    try {
      localStorage.setItem('evalui_user', JSON.stringify(user));
      localStorage.setItem('evalui_token', 'token_' + Date.now());
    } catch (e) {}
    setCurrentUser(user);
    const normRole = getNormalizedRole(user);
    const defaultPath = getDefaultPathForRole(normRole);
    window.history.pushState(null, '', defaultPath);
    setActiveTab('dashboard');
  };

  // Reusable Complete Logout Handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('evalui_user');
      localStorage.removeItem('evalui_token');
      sessionStorage.clear();
    } catch (e) {}
    setCurrentUser(null);
    setSelectedAssignment(null);
    setEvaluationResult(null);
    setActiveTab('login');
    window.history.replaceState(null, '', '/login');
  };

  // Handle Evaluation Complete
  const handleEvaluationComplete = (result: EvaluationResultData) => {
    setEvaluationResult(result);
    handleNavigate('result');
  };

  // If user is not logged in or invalid role, show LoginPage (Protected route guard)
  if (!currentUser || !normalizedRole) {
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
        setActiveTab={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <Topbar
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={handleNavigate}
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
                    <OrgAdminDashboard user={currentUser} onNavigate={handleNavigate} />
                  ) : currentUser.role === 'STUDENT' ? (
                    <StudentDashboard 
                      user={currentUser} 
                      assignments={assignments}
                      onNavigate={handleNavigate}
                      onStartAssignment={(asm) => { setSelectedAssignment(asm); handleNavigate('submissions'); }}
                      onViewResults={() => handleNavigate('submissions')}
                    />
                  ) : (
                    <StaffDashboard user={currentUser} assignments={assignments} onSelectAssignment={setSelectedAssignment} onNavigate={handleNavigate} />
                  )}

                </>
              )}

              {/* Faculty Assignments Management Page */}
              {currentUser.role !== 'STUDENT' && (activeTab === 'assignments' || activeTab === 'rubrics') && (
                <AssignmentsPage
                  assignments={assignments}
                  onSelectAssignment={(asm) => {
                    setSelectedAssignment(asm);
                  }}
                  onNavigateToCreate={() => handleNavigate('create-assignment')}
                  onNavigateToSubmissions={(asm) => {
                    setSelectedAssignment(asm);
                    handleNavigate('evaluations');
                  }}
                />
              )}

              {/* Faculty Create Assignment Page */}
              {currentUser.role !== 'STUDENT' && activeTab === 'create-assignment' && (
                <CreateAssignmentPage
                  onAssignmentCreated={(newAssignment) => {
                    fetchAssignments();
                    setSelectedAssignment(newAssignment);
                    handleNavigate('assignments');
                  }}
                />
              )}

              {/* Faculty Submission Management & Evaluation Review Page */}
              {currentUser.role !== 'STUDENT' && activeTab === 'evaluations' && (
                <FacultySubmissionsPage
                  assignments={assignments}
                  selectedAssignment={selectedAssignment}
                  onSelectAssignment={setSelectedAssignment}
                  onNavigate={handleNavigate}
                />
              )}

              {/* Student Submission Portal (Student Only) */}
              {currentUser.role === 'STUDENT' && (activeTab === 'my-assignments' || activeTab === 'submissions') && (
                <StudentSubmission
                  assignments={assignments}
                  selectedAssignment={selectedAssignment}
                  onSelectAssignment={setSelectedAssignment}
                  onEvaluationComplete={handleEvaluationComplete}
                  healthStatus={healthStatus}
                />
              )}

              {/* Evaluation Result View */}
              {(activeTab === 'result' || activeTab === 'results') && (
                evaluationResult ? (
                  <EvaluationResult
                    data={evaluationResult}
                    onUpdateResult={setEvaluationResult}
                    onBack={() => handleNavigate('submissions')}
                    isStudentView={currentUser?.role === 'STUDENT'}
                  />
                ) : (
                  <div className="p-8 text-center font-sans space-y-3">
                    <div className="bg-white rounded-3xl p-12 max-w-md mx-auto border border-forest-100 shadow-card text-forest-600">
                      <h3 className="text-base font-display font-bold text-forest-900">No Evaluation Result Selected</h3>
                      <p className="text-xs text-forest-500 mt-1">Please submit an answer to view your evaluation feedback.</p>
                      <button
                        onClick={() => handleNavigate('submissions')}
                        className="mt-4 px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-xl text-xs font-display font-semibold transition-all"
                      >
                        Go to Submit Answer
                      </button>
                    </div>
                  </div>
                )
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

