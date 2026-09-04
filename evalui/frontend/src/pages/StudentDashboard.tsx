import React from 'react';
import { BookOpen, CheckCircle2, Clock, Award, ArrowRight, FileText, TrendingUp, Sparkles } from 'lucide-react';
import { User } from '../types/auth';
import { Assignment } from '../types/evaluation';

interface StudentDashboardProps {
  user: User | null;
  assignments?: Assignment[];
  onNavigate?: (tab: string) => void;
  onStartAssignment?: (assignment: Assignment) => void;
  onViewResults?: () => void;
  onLaunchDemo?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  assignments = [],
  onNavigate,
  onStartAssignment,
  onViewResults,
  onLaunchDemo
}) => {
  const studentName = user?.name || 'Student';
  const deptBatch = `${user?.department || 'CSBS'} • ${user?.batch || '2024'} Batch`;

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

  const handleDemo = () => {
    if (onLaunchDemo) {
      onLaunchDemo();
    } else if (onNavigate) {
      onNavigate('submissions');
    }
  };

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
            Good Morning, {studentName}! 👋
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/80 max-w-xl">
            You have <strong className="text-mint-300 font-bold">2 pending assessments</strong> due this week. Review your explainable AI feedback to boost your descriptive writing.
          </p>
        </div>

        <button
          onClick={handleDemo}
          className="relative z-10 px-5 py-3 rounded-2xl bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold text-xs shadow-lg flex items-center space-x-2 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 fill-forest-950" />
          <span>Try Demo TCP Assessment</span>
        </button>
      </div>

      {/* Student Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-forest-900">2</div>
          <div className="text-xs text-amber-700 font-medium">Due in next 5 days</div>
        </div>

        <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-mint-50 text-mint-700 border border-mint-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-forest-900">8</div>
          <div className="text-xs text-mint-700 font-medium">100% evaluated</div>
        </div>

        <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Average Score</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-forest-900">84%</div>
          <div className="text-xs text-emerald-600 font-medium">Top 15% in class</div>
        </div>

        <div className="bg-white border border-forest-100 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-500 uppercase tracking-wider">Improvement</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-forest-900">+8%</div>
          <div className="text-xs text-purple-700 font-medium">Compared to last term</div>
        </div>

      </div>

      {/* Pending Assignments & Recent Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pending Assignments List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-forest-900">Pending Assignments</h2>
            <span className="text-xs text-forest-500 font-mono">{assignments.length > 0 ? assignments.length : 1} Available</span>
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
                      Due: <strong className="text-forest-800">Sep 10, 2026</strong>
                    </div>
                    <button
                      onClick={() => handleStart(asm)}
                      className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Start Assessment</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-mint-50 text-mint-800 border border-mint-200">
                    Computer Networks
                  </span>
                  <span className="text-xs font-mono font-bold text-forest-600">
                    Max Marks: 4.0
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-forest-900">Computer Networks Internal Assessment</h3>
                <p className="text-xs text-forest-600">Explain the TCP three-way handshake.</p>
                <div className="pt-3 border-t border-forest-100 flex items-center justify-between">
                  <div className="text-xs text-forest-500 font-mono">Due: <strong className="text-forest-800">Sep 10, 2026</strong></div>
                  <button
                    onClick={() => onNavigate && onNavigate('submissions')}
                    className="px-4 py-2 rounded-xl bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Start Assessment</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learning Progress & Recent Feedback (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recent AI Result Card */}
          <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-forest-100 pb-3">
              <h3 className="text-sm font-display font-bold text-forest-900">Latest AI Evaluation Result</h3>
              <span className="text-xs font-mono text-mint-800 bg-mint-50 px-2 py-0.5 rounded border border-mint-200 font-bold">
                4.0 / 4.0
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-forest-900 font-display">TCP Three-Way Handshake</h4>
              <p className="text-xs text-forest-600 bg-forest-50/60 p-3 rounded-xl border border-forest-100">
                <strong className="text-mint-800 font-semibold">AI Feedback Summary: </strong>
                Excellent coverage of SYN, SYN-ACK, and ACK packet exchange sequence.
              </p>
            </div>

            <button
              onClick={handleViewResults}
              className="w-full py-2.5 px-4 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 font-display font-semibold text-xs border border-forest-200 flex items-center justify-center space-x-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-forest-700" />
              <span>View Full Sentence Highlights</span>
            </button>
          </div>

          {/* Subject-Wise Progress */}
          <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-sm font-display font-bold text-forest-900">Subject-Wise Learning Progress</h3>
            
            <div className="space-y-3 font-sans">
              <div>
                <div className="flex justify-between text-xs font-semibold text-forest-800 mb-1">
                  <span>Computer Networks</span>
                  <span className="text-mint-700 font-mono font-bold">88%</span>
                </div>
                <div className="w-full bg-forest-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-mint-500 h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-forest-800 mb-1">
                  <span>Database Management (DBMS)</span>
                  <span className="text-mint-700 font-mono font-bold">82%</span>
                </div>
                <div className="w-full bg-forest-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-forest-800 mb-1">
                  <span>Software Engineering</span>
                  <span className="text-amber-700 font-mono font-bold">74%</span>
                </div>
                <div className="w-full bg-forest-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '74%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
