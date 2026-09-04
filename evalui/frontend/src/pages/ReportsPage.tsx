import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText,
  Zap,
  ArrowUpRight,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { User } from '../types/auth';

interface ReportsPageProps {
  user: User | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ user }) => {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Semester');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: 'CSV' | 'PDF') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Exported EvalUI Accreditation Report (${format}) successfully!`);
    }, 1500);
  };

  // Mock Score Distribution Data
  const scoreBins = [
    { range: '0 - 20%', count: 12, label: 'Needs Intervention', color: 'bg-rose-500' },
    { range: '21 - 40%', count: 48, label: 'Below Average', color: 'bg-amber-500' },
    { range: '41 - 60%', count: 180, label: 'Satisfactory', color: 'bg-emerald-400' },
    { range: '61 - 80%', count: 420, label: 'Proficient', color: 'bg-mint-500' },
    { range: '81 - 100%', count: 580, label: 'Exemplary', color: 'bg-forest-700' },
  ];

  // Department Analytics Breakdown
  const deptAnalytics = [
    { department: 'Computer Science & Business Systems', code: 'CSBS', submissions: 1240, avgScore: 84.5, highestScore: 98, contradictionRate: '1.2%', overrideRate: '2.8%' },
    { department: 'Artificial Intelligence & Data Science', code: 'AIDS', submissions: 1580, avgScore: 82.1, highestScore: 100, contradictionRate: '1.8%', overrideRate: '3.1%' },
    { department: 'Computer Science & Engineering', code: 'CSE', submissions: 2100, avgScore: 79.8, highestScore: 96, contradictionRate: '2.4%', overrideRate: '4.0%' },
    { department: 'Electronics & Communication', code: 'ECE', submissions: 1720, avgScore: 81.4, highestScore: 97, contradictionRate: '1.5%', overrideRate: '3.2%' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-forest-50/40 min-h-screen">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-forest-900 tracking-tight">
            Institutional Analytics & Accreditation Reports
          </h1>
          <p className="text-xs md:text-sm text-forest-600 font-sans mt-1">
            Aggregate student evaluation performance, NLI contradiction rates, and score distributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => handleExport('CSV')}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-white border border-forest-200 text-forest-800 font-display font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm hover:bg-forest-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export CSV</span>
          </button>
          
          <button 
            onClick={() => handleExport('PDF')}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isExporting ? 'Generating Report...' : 'Export PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
            Institutional Average
          </span>
          <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
            82.4%
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+3.2% vs previous term</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
            Contradictions Guarded
          </span>
          <div className="text-3xl font-display font-bold text-rose-700 tracking-tight">
            42 <span className="text-xs text-forest-500 font-normal">Flagged</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-rose-600 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Zero-marks enforced for negation</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
            Human-in-the-Loop Overrides
          </span>
          <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
            3.2% <span className="text-xs text-forest-500 font-normal">of scores</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-forest-600 font-medium">
            <span>High AI-Faculty alignment</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-600/70 font-sans">
            Evaluated Submissions
          </span>
          <div className="text-3xl font-display font-bold text-forest-900 tracking-tight">
            6,640
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-mint-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% evaluated offline</span>
          </div>
        </div>

      </div>

      {/* Main Charts & Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Score Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-forest-100 pb-4">
            <div>
              <h3 className="text-base font-display font-bold text-forest-900">
                Student Score Distribution Histogram
              </h3>
              <p className="text-xs text-forest-600 font-sans">
                Categorized grade spread across all institutional answer evaluations
              </p>
            </div>
            <span className="px-3 py-1 bg-forest-50 border border-forest-100 rounded-full text-xs font-mono text-forest-700">
              6,640 Answer Sheets
            </span>
          </div>

          {/* Histogram Bars */}
          <div className="space-y-4 pt-2">
            {scoreBins.map((bin, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-forest-900 font-mono w-24">{bin.range}</span>
                  <span className="text-forest-600 text-xs">{bin.label}</span>
                  <span className="font-mono font-bold text-forest-900">{bin.count} students</span>
                </div>
                <div className="w-full bg-forest-50 rounded-full h-3 overflow-hidden border border-forest-100">
                  <div 
                    className={`${bin.color} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${(bin.count / 580) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Key Insights & Accreditation Note */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-forest-900 via-forest-850 to-forest-950 p-6 rounded-2xl text-white border border-forest-800 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-mint-300">
              <Sparkles className="w-5 h-5" />
              <h4 className="text-sm font-display font-bold text-white">NAAC & NBA Accreditation Ready</h4>
            </div>
            <p className="text-xs text-emerald-100/80 font-sans leading-relaxed">
              EvalUI's sentence-level evidence highlight logs and rubric criterion score maps fulfill Outcome-Based Education (OBE) evaluation compliance standards.
            </p>
            <div className="pt-2 border-t border-forest-800 text-[11px] font-mono text-mint-400">
              Audit log hash: #eval_sece_2026_q3
            </div>
          </div>
        </div>

      </div>

      {/* Department Breakdown Matrix */}
      <div className="bg-white rounded-2xl border border-forest-100 shadow-card overflow-hidden">
        <div className="p-6 border-b border-forest-100">
          <h3 className="text-base font-display font-bold text-forest-900">
            Department Performance & Guardrail Metrics
          </h3>
          <p className="text-xs text-forest-600 font-sans">
            Comparative performance across departments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-forest-50/70 border-b border-forest-100 text-[11px] font-mono uppercase tracking-wider text-forest-700">
                <th className="py-3.5 px-5">Department</th>
                <th className="py-3.5 px-4 text-center">Evaluated Sheets</th>
                <th className="py-3.5 px-4 text-center">Avg Score</th>
                <th className="py-3.5 px-4 text-center">High Score</th>
                <th className="py-3.5 px-4 text-center">Contradiction Rate</th>
                <th className="py-3.5 px-4 text-center">Faculty Override Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50 text-sm font-sans">
              {deptAnalytics.map((dept, idx) => (
                <tr key={idx} className="hover:bg-forest-50/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-forest-900">{dept.department}</div>
                    <div className="text-xs text-forest-500 font-mono">Code: {dept.code}</div>
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-forest-800">
                    {dept.submissions}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {dept.avgScore}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-semibold text-forest-900">
                    {dept.highestScore}%
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-xs text-rose-700">
                    {dept.contradictionRate}
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-xs text-forest-700">
                    {dept.overrideRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
