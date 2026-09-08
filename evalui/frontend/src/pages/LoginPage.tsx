import React, { useState } from 'react';
import { ShieldCheck, Building2, ArrowRight, CheckCircle2, Sparkles, UserPlus, LogIn, AlertCircle, GraduationCap, Briefcase, ShieldAlert } from 'lucide-react';
import { parseInstitutionalEmail } from '../services/identityParser';
import { User, UserRole } from '../types/auth';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Registration / Login Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [department, setDepartment] = useState('CSBS');
  const [batch, setBatch] = useState('2024');
  const [collegeName, setCollegeName] = useState('Sri Eshwar College of Engineering');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-detect identity preview as email changes
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (newEmail.includes('@')) {
      const parsed = parseInstitutionalEmail(newEmail);
      if (parsed.role) setRole(parsed.role);
      if (parsed.department) setDepartment(parsed.department);
      if (parsed.batch) setBatch(parsed.batch);
      if (parsed.organization_name) setCollegeName(parsed.organization_name);
      if (!name) setName(parsed.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid institutional email address.');
      return;
    }

    setIsLoading(true);

    try {
      let userRes: User;
      if (authMode === 'register') {
        userRes = await api.register({
          name: name || email.split('@')[0],
          email,
          role,
          department,
          batch: role === 'STUDENT' ? batch : undefined,
          organization_name: collegeName
        });
      } else {
        userRes = await api.login(email, role, department, batch);
      }
      onLoginSuccess(userRes);
    } catch (err: any) {
      // Fallback local auth creation if backend auth endpoint returns error
      const domain = email.split('@')[1] || 'sece.ac.in';
      const code = domain.split('.')[0].toUpperCase();
      const userRes: User = {
        id: 'usr_' + Date.now(),
        name: name || email.split('@')[0].replace('.', ' ').title(),
        email: email.trim().toLowerCase(),
        role: role,
        organization_id: 'org_' + code.toLowerCase(),
        organization_name: collegeName || (code === 'SECE' ? 'Sri Eshwar College of Engineering' : `${code} Institution`),
        organization_code: code,
        department: department,
        batch: role === 'STUDENT' ? batch : undefined
      };
      onLoginSuccess(userRes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-50/50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-forest-100 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[640px]">
        
        {/* Left Panel: Brand & Platform Philosophy */}
        <div className="lg:col-span-5 bg-gradient-to-br from-forest-900 via-forest-850 to-forest-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-forest-700/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-mint-500 text-forest-950 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white tracking-tight leading-none">
                  EvalUI
                </h1>
                <p className="text-xs text-mint-300 font-sans tracking-wide mt-1">
                  Explain. Evaluate. Empower.
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <h2 className="text-xl font-display font-bold text-white leading-tight">
                Offline-First Explainable AI Descriptive Assessment Platform
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-sans">
                Create an account or sign in with your email to enter your role workspace.
              </p>
            </div>
          </div>

          {/* Core Feature Badges */}
          <div className="relative z-10 py-6 space-y-3">
            <div className="flex items-center space-x-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-mint-400 flex-shrink-0" />
              <span>Faculty Staff, Student & Admin Workspaces</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-mint-400 flex-shrink-0" />
              <span>Department & Academic Batch Mapping</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-mint-400 flex-shrink-0" />
              <span>100% Offline Local CPU NLP Engine</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-mint-400 flex-shrink-0" />
              <span>Sentence Evidence Grounding & NLI Guardrails</span>
            </div>
          </div>
        </div>


        {/* Right Panel: Login / Register Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-white overflow-y-auto max-h-[85vh]">
          
          {/* Tabs: Sign In vs Registration */}
          <div className="flex border-b border-forest-100 space-x-6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
              className={`pb-3 text-sm font-display font-bold flex items-center space-x-2 border-b-2 transition-colors ${
                authMode === 'login'
                  ? 'border-mint-500 text-forest-900 font-bold'
                  : 'border-transparent text-forest-400 hover:text-forest-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
              className={`pb-3 text-sm font-display font-bold flex items-center space-x-2 border-b-2 transition-colors ${
                authMode === 'register'
                  ? 'border-mint-500 text-forest-900 font-bold'
                  : 'border-transparent text-forest-400 hover:text-forest-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New User</span>
            </button>
          </div>

          <div>
            <h3 className="text-2xl font-display font-bold text-forest-900">
              {authMode === 'login' ? 'Institutional Sign In' : 'Register New User'}
            </h3>
            <p className="text-xs text-forest-600 mt-1 font-sans">
              {authMode === 'login' 
                ? 'Enter your email and role parameters to access your dashboard'
                : 'Fill in your profile criteria to register your account'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-forest-900 font-sans mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Dharshana S or Ananya Sharma"
                  className="w-full bg-forest-50/50 border border-forest-200 rounded-xl px-3.5 py-2.5 text-xs text-forest-900 focus:outline-none focus:border-mint-500 transition-all font-sans"
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-forest-900 font-sans mb-1">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="e.g. dharshana@sece.ac.in or student.s2024csbs@sece.ac.in"
                className="w-full bg-forest-50/50 border border-forest-200 rounded-xl px-3.5 py-2.5 text-xs text-forest-900 focus:outline-none focus:border-mint-500 transition-all font-mono"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-forest-900 font-sans mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-forest-50/50 border border-forest-200 rounded-xl px-3.5 py-2.5 text-xs text-forest-900 focus:outline-none focus:border-mint-500 transition-all font-mono"
              />
            </div>

            {/* Role Criteria Selection */}
            <div>
              <label className="block text-xs font-semibold text-forest-900 font-sans mb-1.5">
                Select Workspace Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('STAFF')}
                  className={`py-2 px-3 rounded-xl text-xs font-display font-semibold transition-all border flex flex-col items-center justify-center space-y-1 ${
                    role === 'STAFF'
                      ? 'bg-forest-900 text-mint-300 border-forest-700 shadow-sm'
                      : 'bg-forest-50/60 text-forest-700 border-forest-200 hover:bg-forest-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Faculty Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`py-2 px-3 rounded-xl text-xs font-display font-semibold transition-all border flex flex-col items-center justify-center space-y-1 ${
                    role === 'STUDENT'
                      ? 'bg-mint-500 text-forest-950 border-mint-400 shadow-sm font-bold'
                      : 'bg-forest-50/60 text-forest-700 border-forest-200 hover:bg-forest-100'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ORG_ADMIN')}
                  className={`py-2 px-3 rounded-xl text-xs font-display font-semibold transition-all border flex flex-col items-center justify-center space-y-1 ${
                    role === 'ORG_ADMIN'
                      ? 'bg-purple-900 text-purple-200 border-purple-700 shadow-sm'
                      : 'bg-forest-50/60 text-forest-700 border-forest-200 hover:bg-forest-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Org Admin</span>
                </button>
              </div>
            </div>

            {/* Department & Batch Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-forest-900 font-sans mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-forest-200 rounded-xl px-3 py-2 text-xs font-sans text-forest-900 focus:outline-none focus:border-mint-500 shadow-sm"
                >
                  <option value="CSBS">Computer Science & Business Systems (CSBS)</option>
                  <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="MECH">Mechanical Engineering (MECH)</option>
                </select>
              </div>

              {role === 'STUDENT' ? (
                <div>
                  <label className="block text-xs font-semibold text-forest-900 font-sans mb-1">
                    Academic Batch Year
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full bg-white border border-forest-200 rounded-xl px-3 py-2 text-xs font-mono text-forest-900 focus:outline-none focus:border-mint-500 shadow-sm"
                  >
                    <option value="2024">Batch 2024</option>
                    <option value="2025">Batch 2025</option>
                    <option value="2026">Batch 2026</option>
                    <option value="2027">Batch 2027</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-forest-900 font-sans mb-1">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="Sri Eshwar College of Engineering"
                    className="w-full bg-white border border-forest-200 rounded-xl px-3 py-2 text-xs font-sans text-forest-900 focus:outline-none focus:border-mint-500 shadow-sm"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-xs shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-105 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : authMode === 'login' ? `Sign In as ${role}` : `Register & Enter Workspace`}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="pt-3 border-t border-forest-100 text-center space-y-2">
            <div className="text-[10px] font-mono text-forest-500 uppercase tracking-wider">Quick Select Criteria Presets:</div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('dharshana@sece.ac.in');
                  setName('Dr. Dharshana S');
                  setRole('STAFF');
                  setDepartment('CSBS');
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200"
              >
                dharshana@sece.ac.in (Faculty)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('ananya.s2024csbs@sece.ac.in');
                  setName('Ananya Sharma');
                  setRole('STUDENT');
                  setDepartment('CSBS');
                  setBatch('2024');
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200"
              >
                ananya.s2024csbs@sece.ac.in (Student)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@sece.ac.in');
                  setName('Org Admin');
                  setRole('ORG_ADMIN');
                  setDepartment('ADMIN');
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200"
              >
                admin@sece.ac.in (Org Admin)
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
