import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Clock, Award, FileText, TrendingUp, Sparkles } from 'lucide-react';
import { User } from '../types/auth';
import { Assignment, EvaluationResultData } from '../types/evaluation';
import { api } from '../services/api';

interface StudentDashboardProps {
  user: User | null;
  assignments?: Assignment[];
  onNavigate?: (tab: string) => void;
  onStartAssignment?: (assignment: Assignment) => void;
  onViewResults?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  assignments = [],
  onNavigate,
  onStartAssignment,
  onViewResults
}) => {
  const studentName = user?.name || 'Student';
  const deptBatch = `${user?.department || 'CSBS'} • ${user?.batch || '2024'} Batch`;

  const [studentEvaluations, setStudentEvaluations] = useState<EvaluationResultData[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const sId = user?.student_id || user?.email || 'STUDENT_001';
        const [evals, subs] = await Promise.all([
          api.listEvaluations({ student_id: sId }).catch(() => []),
          api.listSubmissions({ student_id: sId }).catch(() => [])
        ]);
        setStudentEvaluations(evals || []);
        setStudentSubmissions(subs || []);
      } catch (err) {
        console.error('Failed to load student data:', err);
      }
    };
    loadStudentData();
  }, [user]);

  const handleStart = (asm: Assignment) => {
    if (onStartAssignment) {
      onStartAssignment(asm);
    } else if (onNavigate) {
      onNavigate('submissions');
    }
  };

  const handleViewResults = () => {
    if (onViewResults) {
      onViewResults();
    } else if (onNavigate) {
      onNavigate('submissions');
    }
  };

  const completedCount = studentEvaluations.length;
  const pendingCount = assignments.length;

  const avgScore = completedCount > 0
    ? Math.round(studentEvaluations.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / completedCount)
    : 0;

  const latestEval = studentEvaluations.length > 0 ? studentEvaluations[0] : null;

  return (
    <div className="p-6 md:p-8 space-y-6 pb-12 font-sans bg-forest-50/40 min-h-screen">
      
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-wrap items-center justify-between gap-6 border border-forest-700/50">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-mint-500/20 text-mint-300 border border-mint-500/30 text-xs font-mono">
            <span>Student Workspace</span>
            <span>•</span>
            <span>{deptBatch}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
            Good Day, {studentName}! 👋
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/80 max-w-xl">
            You have <strong className="text-mint-300 font-bold">{pendingCount} assessment{pendingCount === 1 ? '' : 's'} available</strong>. Review your explainable AI feedback to improve your writing.
          </p>
        </div>
      </div>

      {/* Student Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Available</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-forest-900">{assignments.length}</div>
          <div className="text-xs text-amber-700 font-medium">Available Assignments</div>
        </div>

        <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Pending</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-forest-900">{studentSubmissions.length}</div>
          <div className="text-xs text-blue-700 font-medium">Pending Submissions</div>
        </div>

        <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-mint-50 text-mint-700 border border-mint-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-forest-900">{completedCount}</div>
          <div className="text-xs text-mint-700 font-medium">Completed Evaluations</div>
        </div>

        <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Recent Results</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-forest-900">{avgScore}%</div>
          <div className="text-xs text-emerald-600 font-medium">Recent Results Avg</div>
        </div>

      </div>

      {/* Available Assignments & Recent Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Available Assignments List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-forest-900">Available Assignments</h2>
            <span className="text-xs text-forest-500 font-mono">{assignments.length} Available</span>
          </div>

          <div className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((asm) => (
                <div key={asm.id} className="bg-white border border-forest-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-mint-50 text-mint-800 border border-mint-200">
                      {asm.subject}
                    </span>
                    <span className="text-xs font-mono font-bold text-forest-600">
                      Max Marks: {asm.total_marks}
                    </span>
                  </div>

                  <h3 className="text-base font-display font-bold text-forest-900">{asm.title}</h3>
                  <p className="text-xs text-forest-600 line-clamp-2">{asm.question}</p>

                  <div className="pt-3 border-t border-forest-100 flex items-center justify-between">
                    <div className="text-xs text-forest-500 font-mono">
                      Maximum Marks: <strong className="text-forest-800">{asm.total_marks} Marks</strong>
                    </div>
                    <button
                      onClick={() => handleStart(asm)}
                      className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Submit Answer</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-forest-100 rounded-2xl p-8 text-center text-forest-600 shadow-card space-y-3">
                <BookOpen className="w-10 h-10 text-forest-400 mx-auto" />
                <h4 className="text-sm font-display font-bold text-forest-900">No assignments available</h4>
                <p className="text-xs text-forest-500 max-w-sm mx-auto font-sans">
                  No assignments available at this moment.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-forest-100 pb-3">
              <h3 className="text-sm font-display font-bold text-forest-900">Recent Results</h3>
              {latestEval && (
                <span className="text-xs font-mono text-mint-800 bg-mint-50 px-2 py-0.5 rounded border border-mint-200 font-bold">
                  {latestEval.final_score} / {latestEval.max_score}
                </span>
              )}
            </div>

            {latestEval ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-forest-900 font-display">{latestEval.assignment_title || 'Assessment'}</h4>
                <p className="text-xs text-forest-600 bg-forest-50/60 p-3 rounded-xl border border-forest-100">
                  <strong className="text-mint-800 font-semibold">Feedback: </strong>
                  {latestEval.diagnostic_summary || 'Evaluation complete.'}
                </p>
                <button
                  onClick={handleViewResults}
                  className="w-full py-2.5 px-4 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 font-display font-semibold text-xs border border-forest-200 flex items-center justify-center space-x-1.5 transition-all mt-2"
                >
                  <FileText className="w-4 h-4 text-forest-700" />
                  <span>View Evidence & Feedback</span>
                </button>
              </div>
            ) : (
              <div className="py-6 text-center text-forest-500 space-y-1">
                <p className="text-xs font-sans">No evaluated submissions yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
