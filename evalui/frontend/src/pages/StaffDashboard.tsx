import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Calendar, 
  MoreHorizontal, 
  ShieldCheck, 
  BarChart2, 
  Cpu, 
  HelpCircle,
  Headphones,
  ArrowUpRight,
  Send,
  Download,
  BookOpen
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
  assignments,
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

  const totalAssignmentsCount = assignments.length;
  const totalSubmissionsCount = submissions.length;
  const totalEvaluatedCount = evaluations.length;

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
            Overview of teaching, descriptive assessments, and real-time AI evaluation status.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden lg:block bg-white border border-canvas-border px-4 py-2 rounded-2xl shadow-card text-caption text-slate-600 italic">
            "Better assessments create brighter learners." <span className="text-forest-700 font-semibold font-sans">— EvalUI</span>
          </div>

          <div className="bg-white border border-canvas-border px-4 py-2 rounded-2xl shadow-card flex items-center space-x-3 text-left">
            <div className="p-2 rounded-xl bg-mint-50 text-forest-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-body font-display font-bold text-slate-900">{todayStr}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat Card 1: Total Assignments */}
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

        {/* Stat Card 2: Submissions */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 w-fit mb-3">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">{totalSubmissionsCount}</div>
            <div className="text-body font-sans font-medium text-slate-600">Student Submissions</div>
          </div>
          <button onClick={() => onNavigate('evaluations')} className="text-slate-400 group-hover:text-blue-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stat Card 3: Evaluated */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 w-fit mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">{totalEvaluatedCount}</div>
            <div className="text-body font-sans font-medium text-slate-600">Evaluated</div>
          </div>
          <button onClick={() => onNavigate('evaluations')} className="text-slate-400 group-hover:text-purple-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stat Card 4: Average Score */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 w-fit mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">{avgClassScore}%</div>
            <div className="text-body font-sans font-medium text-slate-600">Average Score</div>
          </div>
          <button onClick={() => onNavigate('reports')} className="text-slate-400 group-hover:text-amber-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Recent Assignments */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-heading font-display font-bold text-slate-900">Recent Assignments</h2>
              <div className="flex items-center space-x-3">
                <button onClick={() => onNavigate('assignments')} className="text-caption font-sans font-semibold text-forest-700 hover:underline">
                  View All &rarr;
                </button>
                <button
                  onClick={() => onNavigate('create-assignment')}
                  className="px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-caption flex items-center space-x-1 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Assignment</span>
                </button>
              </div>
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
                    {assignments.map((asm) => (
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

        {/* Right Column (4 cols): Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-3">
            <h3 className="text-heading font-display font-bold text-slate-900 mb-3">Tutor Actions</h3>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('create-assignment')}
                className="w-full p-3 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white text-caption font-display font-semibold flex items-center space-x-3 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Assignment</span>
              </button>

              <button
                onClick={() => onNavigate('evaluations')}
                className="w-full p-3 rounded-2xl bg-canvas-subtle hover:bg-slate-200 text-slate-800 text-caption font-display font-semibold flex items-center space-x-3 transition-all border border-canvas-border"
              >
                <Send className="w-4 h-4 text-forest-700" />
                <span>Submissions & Evaluations</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="w-full p-3 rounded-2xl bg-canvas-subtle hover:bg-slate-200 text-slate-800 text-caption font-display font-semibold flex items-center space-x-3 transition-all border border-canvas-border"
              >
                <Download className="w-4 h-4 text-forest-700" />
                <span>Generate Evaluation Report</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
