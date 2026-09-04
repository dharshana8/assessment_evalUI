import React from 'react';
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

interface OrgAdminDashboardProps {
  user: User | null;
  onNavigate: (tab: string) => void;
}

export const OrgAdminDashboard: React.FC<OrgAdminDashboardProps> = ({ user, onNavigate }) => {
  const orgName = user?.organization_name || 'Sri Eshwar College of Engineering';
  const orgCode = user?.organization_code || 'SECE';
  const orgDomain = user?.email.split('@')[1] || 'sece.ac.in';

  // Sample Audit Logs
  const auditLogs = [
    { id: '1', action: 'Domain Regex Updated', detail: 'Pattern ^[a-z]+(\\.s\\d{4})?[a-z]+@sece\\.ac\\.in active', user: 'Admin (dharshana@sece.ac.in)', time: '10 mins ago', type: 'security' },
    { id: '2', action: 'Batch 2024 CSBS Provisioned', detail: '120 student accounts provisioned via domain identity parser', user: 'System Auto-Parser', time: '1 hour ago', type: 'user' },
    { id: '3', action: 'AI Guardrail Threshold Adjusted', detail: 'NLI Contradiction penalty set to 100% deduction', user: 'Dr. Dharshana (Org Admin)', time: '3 hours ago', type: 'config' },
    { id: '4', action: 'Department Performance Export', detail: 'CSV Report generated for CSBS & AIDS departments', user: 'Faculty Admin', time: 'Yesterday', type: 'report' },
  ];

  // Department Summaries
  const departments = [
    { name: 'Computer Science & Business Systems', code: 'CSBS', students: 240, faculty: 12, avgScore: 84.5, evalCount: 1240, status: 'Optimal' },
    { name: 'Artificial Intelligence & Data Science', code: 'AIDS', students: 310, faculty: 15, avgScore: 82.1, evalCount: 1580, status: 'Optimal' },
    { name: 'Computer Science & Engineering', code: 'CSE', students: 480, faculty: 18, avgScore: 79.8, evalCount: 2100, status: 'Attention' },
    { name: 'Electronics & Communication', code: 'ECE', students: 390, faculty: 14, avgScore: 81.4, evalCount: 1720, status: 'Optimal' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-forest-50/40 min-h-screen">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-forest-700/50 relative overflow-hidden">
        {/* Decorative background glow */}
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

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card hover:shadow-card-hover transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
              Total Enrolled Students
            </span>
            <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700 border border-forest-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
              1,420
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+120 added this semester</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card hover:shadow-card-hover transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
              Active Faculty Staff
            </span>
            <div className="p-2.5 rounded-xl bg-mint-50 text-mint-700 border border-mint-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
              59
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-forest-600 font-medium mt-1">
              <span>Across 4 core departments</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card hover:shadow-card-hover transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
              Total Evaluated Submissions
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
              6,640
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>99.4% auto-eval accuracy</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card hover:shadow-card-hover transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
              AI Model Quota & Load
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
              <Zap className="w-5 h-5 fill-purple-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
              18% <span className="text-xs text-forest-500 font-normal">CPU Usage</span>
            </div>
            <div className="w-full bg-forest-100 rounded-full h-1.5 mt-2">
              <div className="bg-mint-500 h-1.5 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Layout: Departments + Security/Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Department Performance Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-forest-100 shadow-card overflow-hidden">
            <div className="p-6 border-b border-forest-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-forest-900">
                  Department Breakdown & Quotas
                </h3>
                <p className="text-xs text-forest-600 font-sans">
                  Real-time aggregation of student evaluations across departments
                </p>
              </div>
              <button 
                onClick={() => onNavigate('reports')}
                className="text-xs font-display font-semibold text-mint-700 hover:text-mint-800 flex items-center space-x-1"
              >
                <span>View Full Reports</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-forest-50/60 border-b border-forest-100 text-[11px] font-mono uppercase tracking-wider text-forest-700">
                    <th className="py-3.5 px-5">Department</th>
                    <th className="py-3.5 px-4 text-center">Students</th>
                    <th className="py-3.5 px-4 text-center">Faculty</th>
                    <th className="py-3.5 px-4 text-center">Avg Score</th>
                    <th className="py-3.5 px-4 text-center">Evaluations</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-50 text-sm">
                  {departments.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-forest-50/40 transition-colors">
                      <td className="py-4 px-5 font-sans font-medium text-forest-900">
                        <div className="font-semibold text-forest-900">{dept.name}</div>
                        <div className="text-xs text-forest-500 font-mono">Code: {dept.code}</div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-medium text-forest-700">
                        {dept.students}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-medium text-forest-700">
                        {dept.faculty}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {dept.avgScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-forest-800">
                        {dept.evalCount}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dept.status === 'Optimal' 
                            ? 'bg-mint-100 text-mint-800 border border-mint-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dept.status === 'Optimal' ? 'bg-mint-500' : 'bg-amber-500'}`} />
                          {dept.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Domain Parser Banner Card */}
          <div className="bg-gradient-to-r from-mint-900 via-forest-900 to-forest-950 rounded-2xl p-6 text-white border border-mint-800/60 shadow-lg space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-mint-500/20 rounded-xl border border-mint-400/30 text-mint-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-display font-bold text-white">
                    Institutional Email Auto-Identity Parser
                  </h4>
                  <p className="text-xs text-mint-200/80 font-sans">
                    Zero-registration login active for domain <code className="font-mono bg-forest-800 px-1.5 py-0.5 rounded text-mint-300">@{orgDomain}</code>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-mint-500/20 text-mint-300 rounded-full text-xs font-mono border border-mint-400/30">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-forest-950/60 p-4 rounded-xl border border-forest-800/80 text-xs font-mono">
              <div>
                <span className="text-emerald-400 block text-[10px] uppercase">Detected Student Pattern</span>
                <span className="text-white">{`name.<year><dept>@` + orgDomain}</span>
              </div>
              <div>
                <span className="text-emerald-400 block text-[10px] uppercase">Detected Faculty Pattern</span>
                <span className="text-white">{`name@` + orgDomain}</span>
              </div>
              <div>
                <span className="text-emerald-400 block text-[10px] uppercase">Validation Status</span>
                <span className="text-mint-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> 100% Regex Match
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Audit Log & Quick Actions */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-4">
            <h3 className="text-sm font-display font-bold text-forest-900 uppercase tracking-wider">
              Org Admin Quick Actions
            </h3>
            <div className="space-y-2.5">
              <button 
                onClick={() => onNavigate('users')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-forest-50 hover:bg-forest-100/80 text-forest-900 font-sans font-medium text-xs transition-colors border border-forest-100 group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-forest-700" />
                  <span>Provision Student/Faculty Batch</span>
                </div>
                <ChevronRight className="w-4 h-4 text-forest-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-forest-50 hover:bg-forest-100/80 text-forest-900 font-sans font-medium text-xs transition-colors border border-forest-100 group"
              >
                <div className="flex items-center space-x-3">
                  <Sliders className="w-4 h-4 text-forest-700" />
                  <span>Configure Guardrails & Rubrics</span>
                </div>
                <ChevronRight className="w-4 h-4 text-forest-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                onClick={() => onNavigate('reports')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-forest-50 hover:bg-forest-100/80 text-forest-900 font-sans font-medium text-xs transition-colors border border-forest-100 group"
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-4 h-4 text-forest-700" />
                  <span>Download Accreditation CSV</span>
                </div>
                <ChevronRight className="w-4 h-4 text-forest-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Audit Logs Widget */}
          <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-forest-900 uppercase tracking-wider">
                System Audit Trail
              </h3>
              <span className="text-[10px] font-mono text-forest-500 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                Live Log
              </span>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-forest-50/50 rounded-xl border border-forest-100/80 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-forest-900">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-forest-500 font-mono">{log.time}</span>
                  </div>
                  <p className="text-forest-700 text-[11px] font-mono">{log.detail}</p>
                  <div className="text-[10px] text-forest-500 font-sans">by {log.user}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
