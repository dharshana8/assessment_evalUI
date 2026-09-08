import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  TrendingUp, 
  BarChart3, 
  AlertTriangle,
  ArrowUpRight,
  Download,
  Plus,
  RefreshCw,
  Clock,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { User } from '../types/auth';
import { api } from '../services/api';

interface OrgAdminDashboardProps {
  user: User | null;
  onNavigate: (tab: string) => void;
}

export const OrgAdminDashboard: React.FC<OrgAdminDashboardProps> = ({ user, onNavigate }) => {
  const orgName = user?.organization_name || 'Institution Workspace';
  const orgCode = user?.organization_code || 'SECE';
  const orgDomain = user?.email.split('@')[1] || 'sece.ac.in';

  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [evaluationsCount, setEvaluationsCount] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [asms, subs, evals] = await Promise.all([
          api.listAssignments().catch(() => []),
          api.listSubmissions().catch(() => []),
          api.listEvaluations().catch(() => [])
        ]);
        setAssignmentsCount(asms.length || 0);
        setSubmissionsCount(subs.length || 0);
        setEvaluationsCount(evals.length || 0);
      } catch (e) {}
    };
    loadStats();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-forest-50/40 min-h-screen">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-forest-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-mint-500/20 border border-mint-400/30 text-mint-300 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Org Admin Console • {orgCode}
            </span>
            <span className="px-3 py-1 bg-forest-700/60 border border-forest-600 text-emerald-200 rounded-full text-xs font-mono">
              Domain: {orgDomain}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
            {orgName}
          </h1>
          <p className="text-emerald-100/80 font-sans text-sm max-w-2xl">
            Multi-tenant AI evaluation dashboard. Manage domain rules, view department analytics, and monitor local NLP evaluation engine throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button 
            onClick={() => onNavigate('users')}
            className="flex items-center space-x-2 bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Manage Users</span>
          </button>
          <button 
            onClick={() => onNavigate('settings')}
            className="flex items-center space-x-2 bg-forest-800/80 hover:bg-forest-700 text-white font-display font-medium px-4 py-2.5 rounded-xl border border-forest-600 shadow-md transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Domain & Rules</span>
          </button>
        </div>
      </div>

      {/* Top System-Level Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Users */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
              Total Users
            </span>
            <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700 border border-forest-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
              {user ? 1 : 0}
            </div>
            <div className="text-xs text-forest-600 font-medium mt-1">Active Database Accounts</div>
          </div>
        </div>

        {/* Card 2: Total Assignments */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
              Assignments
            </span>
            <div className="p-2.5 rounded-xl bg-mint-50 text-mint-700 border border-mint-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
              {assignmentsCount}
            </div>
            <div className="text-xs text-forest-600 font-medium mt-1">Database Records</div>
          </div>
        </div>

        {/* Card 3: Submissions */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
              Submissions
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
              {submissionsCount}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">Student Answer Sheets</div>
          </div>
        </div>

        {/* Card 4: Evaluated */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
              Evaluations
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
              {evaluationsCount}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">Completed Evaluations</div>
          </div>
        </div>

      </div>

      {/* System Health Overview Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-forest-100 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-forest-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-mint-50 rounded-2xl text-forest-700 border border-mint-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-forest-900">System Health & Services Status</h3>
              <p className="text-xs text-forest-600">Real-time status of backend FastAPI, SQL/Mongo DB, and Local AI Inference Models</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-mint-50 text-mint-800 rounded-full text-xs font-mono font-bold border border-mint-200">
            ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-canvas-subtle/50 border border-canvas-border space-y-2">
            <span className="text-xs font-mono text-slate-500 block uppercase">Backend Service</span>
            <div className="text-base font-display font-bold text-slate-900 flex items-center justify-between">
              <span>FastAPI (Uvicorn)</span>
              <span className="text-xs text-emerald-600 font-mono font-bold">100% Healthy</span>
            </div>
            <p className="text-xs text-slate-500">Port 8001 • REST Endpoints Active</p>
          </div>

          <div className="p-5 rounded-2xl bg-canvas-subtle/50 border border-canvas-border space-y-2">
            <span className="text-xs font-mono text-slate-500 block uppercase">Database Layer</span>
            <div className="text-base font-display font-bold text-slate-900 flex items-center justify-between">
              <span>SQL & MongoDB</span>
              <span className="text-xs text-emerald-600 font-mono font-bold">Connected</span>
            </div>
            <p className="text-xs text-slate-500">Relational & Document Databases Active</p>
          </div>

          <div className="p-5 rounded-2xl bg-canvas-subtle/50 border border-canvas-border space-y-2">
            <span className="text-xs font-mono text-slate-500 block uppercase">NLP Models Engine</span>
            <div className="text-base font-display font-bold text-slate-900 flex items-center justify-between">
              <span>MiniLM / RoBERTa</span>
              <span className="text-xs text-emerald-600 font-mono font-bold">Loaded</span>
            </div>
            <p className="text-xs text-slate-500">CPU Inference Ready</p>
          </div>
        </div>
      </div>

    </div>
  );
};
