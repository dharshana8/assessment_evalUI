import React, { useState, useEffect } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { Topbar } from './components/Topbar';
import { DemoModeModal, DEMO_CASES } from './components/DemoModeModal';
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

const DEFAULT_DEMO_USER: User = {
  id: 'usr-1',
  name: 'Dr. Dharshana S',
  email: 'dharshana@sece.ac.in',
  role: 'STAFF',
  organization_id: 'org_sece_7329',
  organization_name: 'Sri Eshwar College of Engineering',
  organization_code: 'SECE',
  department: 'Computer Science & Business Systems',
};

const DEMO_TCP_ASSIGNMENT = {
  title: 'Computer Networks Internal Assessment',
  subject: 'Computer Networks',
  question: 'Explain the TCP three-way handshake.',
  total_marks: 4.0,
  rubric_criteria: [
    { description: 'TCP is a connection-oriented protocol.', max_marks: 1.0, keywords: ['connection-oriented'] },
    { description: 'Client sends SYN to initiate communication.', max_marks: 1.0, keywords: ['SYN'] },
    { description: 'Server responds with SYN-ACK.', max_marks: 1.0, keywords: ['SYN-ACK'] },
    { description: 'Client sends ACK to complete the handshake.', max_marks: 1.0, keywords: ['ACK'] }
  ]
};

const DEMO_ANSWERS: Record<string, string> = {
  'Case A — Correct': 'TCP is a connection-oriented protocol. The client sends a SYN packet. The server responds with SYN-ACK. Finally, the client sends ACK to complete the connection.',
  'Case B — Contradiction': 'TCP is not a connection-oriented protocol and it does not use a three-way handshake.',
  'Case C — Partial': 'TCP is connection-oriented. The client sends SYN and receives SYN-ACK.',
  'Case D — Paraphrased': 'TCP establishes communication by performing a handshake between the client and server before data exchange.',
  'Case E — Off Topic': 'Cricket is played between two teams. Players score runs by hitting the ball.',
  'Case F — Keyword Stuffing': 'TCP SYN SYN-ACK ACK HTTP UDP IP TCP SYN ACK connection-oriented.'
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

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
        const created = await api.createAssignment(DEMO_TCP_ASSIGNMENT);
        setAssignments([created]);
        setSelectedAssignment(created);
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
    }, 3000);

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
    } catch (e) {}
    setCurrentUser(null);
  };


  // Handle Evaluation Complete
  const handleEvaluationComplete = (result: EvaluationResultData) => {
    setEvaluationResult(result);
    setActiveTab('result');
  };

  // Handle selecting a demo case from DemoModeModal
  const handleSelectDemoCase = async (caseKey: string, studentText: string) => {
    try {
      setIsLoading(true);
      // Ensure we have a valid assignment
      let targetAssignment = selectedAssignment;
      if (!targetAssignment) {
        const list = await api.listAssignments();
        if (list.length > 0) {
          targetAssignment = list[0];
        } else {
          targetAssignment = await api.createAssignment(DEMO_TCP_ASSIGNMENT);
        }
      }

      // Submit and evaluate
      const sub = await api.createSubmission(targetAssignment.id, studentText);
      const evalRes = await api.evaluateSubmission(sub.id);
      setEvaluationResult(evalRes);
      setActiveTab('result');
    } catch (err) {
      console.error('Demo evaluation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch Role / User identity during demo
  const handleSwitchUserRole = (role: 'STAFF' | 'STUDENT' | 'ORG_ADMIN') => {
    if (!currentUser) return;
    if (role === 'STAFF') {
      setCurrentUser({
        ...currentUser,
        name: 'Dr. Dharshana S',
        email: 'dharshana@sece.ac.in',
        role: 'STAFF',
      });
    } else if (role === 'STUDENT') {
      setCurrentUser({
        ...currentUser,
        name: 'Ananya Sharma',
        email: 'ananya.s2024csbs@sece.ac.in',
        role: 'STUDENT',
        department: 'Computer Science & Business Systems',
        batch: '2024',
        student_id: '732924CSBS001',
      });
    } else if (role === 'ORG_ADMIN') {
      setCurrentUser({
        ...currentUser,
        name: 'Dr. Dharshana S (Org Admin)',
        email: 'dharshana@sece.ac.in',
        role: 'ORG_ADMIN',
      });
    }
    setActiveTab('dashboard');
  };

  // If user is not logged in, show LoginPage
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        onLaunchDemo={() => {
          handleLoginSuccess(DEFAULT_DEMO_USER);
          setIsDemoModalOpen(true);
        }}
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
        onLaunchDemo={() => setIsDemoModalOpen(true)}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <Topbar
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLaunchDemo={() => setIsDemoModalOpen(true)}
          healthStatus={healthStatus}
        />

        {/* Dynamic Role Switcher Bar (Demo Quick Controls) */}
        <div className="bg-forest-900 text-white px-6 py-2 flex items-center justify-between border-b border-forest-800 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-mint-400 font-bold">⚡ LIVE DEMO ROLE:</span>
            <span className="text-emerald-200 font-sans">
              {currentUser.name} ({currentUser.role})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-forest-400 text-[10px] uppercase tracking-wider">Quick Switch:</span>
            <button
              onClick={() => handleSwitchUserRole('STAFF')}
              className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-colors ${
                currentUser.role === 'STAFF' ? 'bg-mint-500 text-forest-950 font-bold' : 'bg-forest-800 text-emerald-200 hover:bg-forest-700'
              }`}
            >
              Faculty / Staff
            </button>
            <button
              onClick={() => handleSwitchUserRole('STUDENT')}
              className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-colors ${
                currentUser.role === 'STUDENT' ? 'bg-mint-500 text-forest-950 font-bold' : 'bg-forest-800 text-emerald-200 hover:bg-forest-700'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => handleSwitchUserRole('ORG_ADMIN')}
              className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-colors ${
                currentUser.role === 'ORG_ADMIN' ? 'bg-mint-500 text-forest-950 font-bold' : 'bg-forest-800 text-emerald-200 hover:bg-forest-700'
              }`}
            >
              Org Admin
            </button>
          </div>
        </div>

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
                      onLaunchDemo={() => setIsDemoModalOpen(true)}
                    />
                  ) : (
                    <StaffDashboard user={currentUser} onNavigate={setActiveTab} />
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
                  demoAnswers={DEMO_ANSWERS}
                  healthStatus={healthStatus}
                />
              )}


              {/* Evaluation Result View */}
              {activeTab === 'result' && evaluationResult && (
                <EvaluationResult
                  data={evaluationResult}
                  onUpdateResult={setEvaluationResult}
                  onBack={() => setActiveTab('submissions')}
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

      {/* 1-Click Demo Mode Modal */}
      <DemoModeModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectCase={handleSelectDemoCase}
      />

    </div>
  );
};

export default App;
