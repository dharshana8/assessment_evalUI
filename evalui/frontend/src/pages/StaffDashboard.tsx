import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  Send, 
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Assignment, EvaluationResultData } from '../types/evaluation';
import { User } from '../types/auth';
import { api } from '../services/api';

interface StaffDashboardProps {
  user: User | null;
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
  onNavigate: (tab: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  user,
  assignments = [],
  onSelectAssignment,
  onNavigate
}) => {
  const staffName = user?.name || 'Faculty';

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResultData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoadingData(true);
        const [subList, evalList] = await Promise.all([
          api.listSubmissions().catch(() => []),
          api.listEvaluations().catch(() => [])
        ]);
        setSubmissions(subList || []);
        setEvaluations(evalList || []);
      } catch (err) {
        console.error('Failed to load staff dashboard metrics:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadDashboardData();
  }, []);

  // Compute exact metrics from backend APIs
  const totalAssignmentsCount = assignments.length;
  const totalEvaluatedCount = evaluations.length;

  const evaluatedSubmissionIds = new Set(evaluations.map(e => e.submission_id));
  const pendingSubmissions = submissions.filter(s => !evaluatedSubmissionIds.has(s.id));
  const pendingEvaluationsCount = pendingSubmissions.length;

  const avgClassScore = totalEvaluatedCount > 0 
    ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalEvaluatedCount)
    : 0;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-6 md:p-8 space-y-6 pb-12 animate-fadeIn font-sans bg-canvas min-h-screen">
      
      {/* Header Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display-lg font-display font-bold text-slate-900 flex items-center space-x-2">
            <span>Good Day, {staffName}!</span>
            <span>👋</span>
          </h1>
          <p className="text-body font-sans text-slate-500 mt-0.5">
            Real-time assessment overview and pending AI evaluation queue.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('create-assignment')}
            className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-xs shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Assignment</span>
          </button>

          <div className="bg-white border border-canvas-border px-4 py-2 rounded-2xl shadow-card flex items-center space-x-3 text-left">
            <div className="p-2 rounded-xl bg-mint-50 text-forest-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-xs font-display font-bold text-slate-900">{todayStr}</div>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Total Assignments */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-mint-50 text-forest-700 w-fit mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">{totalAssignmentsCount}</div>
            <div className="text-body font-sans font-medium text-slate-600">Total Assignments</div>
          </div>
          <button onClick={() => onNavigate('assignments')} className="text-slate-400 group-hover:text-forest-700 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Pending Evaluations */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 w-fit mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">{pendingEvaluationsCount}</div>
            <div className="text-body font-sans font-medium text-slate-600">Pending Evaluations</div>
          </div>
          <button onClick={() => onNavigate('evaluations')} className="text-slate-400 group-hover:text-amber-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* 3. Completed Evaluations */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 w-fit mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">{totalEvaluatedCount}</div>
            <div className="text-body font-sans font-medium text-slate-600">Completed Evaluations</div>
          </div>
          <button onClick={() => onNavigate('evaluations')} className="text-slate-400 group-hover:text-emerald-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* 4. Average Score */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 w-fit mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">{avgClassScore}%</div>
            <div className="text-body font-sans font-medium text-slate-600">Average Score</div>
          </div>
          <button onClick={() => onNavigate('reports')} className="text-slate-400 group-hover:text-blue-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 5. Recent Assignments (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-heading font-display font-bold text-slate-900">Recent Assignments</h2>
              <button onClick={() => onNavigate('assignments')} className="text-caption font-sans font-semibold text-forest-700 hover:underline">
                View All &rarr;
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3 bg-canvas-subtle/50 rounded-2xl border border-canvas-border">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-display font-bold text-slate-900">No assignments created yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
                  Create an assignment to begin evaluating student submissions.
                </p>
                <button
                  onClick={() => onNavigate('create-assignment')}
                  className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body">
                  <thead className="bg-canvas-subtle text-slate-500 font-sans text-caption uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Title</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Criteria</th>
                      <th className="p-3.5">Max Marks</th>
                      <th className="p-3.5 rounded-r-xl text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-canvas-border font-sans text-slate-700">
                    {assignments.slice(0, 5).map((asm) => (
                      <tr key={asm.id} className="hover:bg-canvas-subtle/50 transition-colors">
                        <td className="p-3.5 font-semibold text-slate-900 font-display">{asm.title}</td>
                        <td className="p-3.5 text-caption font-mono">{asm.subject}</td>
                        <td className="p-3.5 font-mono text-forest-700 font-semibold">{asm.rubric_criteria?.length || 0} items</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">{asm.total_marks}</td>
                        <td className="p-3.5 text-right">
                          <button 
                            onClick={() => { onSelectAssignment(asm); onNavigate('evaluations'); }}
                            className="text-xs font-sans font-semibold text-forest-700 hover:underline"
                          >
                            Submissions &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 6. Pending Reviews Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-heading font-display font-bold text-slate-900">Pending Reviews</h3>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {pendingEvaluationsCount} Pending
              </span>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2 bg-canvas-subtle/40 rounded-2xl border border-canvas-border">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-display font-bold text-slate-900">All submissions evaluated!</h4>
                <p className="text-[11px] text-slate-500 font-sans px-4">
                  No student answer sheets waiting for evaluation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="p-3.5 rounded-2xl bg-canvas-subtle/50 border border-canvas-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-slate-900">Student: {sub.student_id || 'STUDENT'}</span>
                      <span className="text-[10px] font-mono text-slate-500">{sub.input_type}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 font-sans italic">
                      "{sub.content}"
                    </p>
                    <button
                      onClick={() => onNavigate('evaluations')}
                      className="w-full py-1.5 px-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-[11px] flex items-center justify-center space-x-1 shadow-sm transition-all"
                    >
                      <Send className="w-3 h-3" />
                      <span>Evaluate Now &rarr;</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
