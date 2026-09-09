import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  BookOpen, 
  User as UserIcon,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Copy
} from 'lucide-react';
import { Assignment, EvaluationResultData } from '../types/evaluation';
import { api } from '../services/api';
import { EvaluationResult } from './EvaluationResult';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface FacultySubmissionsPageProps {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  onSelectAssignment: (asm: Assignment) => void;
  onNavigate: (tab: string) => void;
}

export const FacultySubmissionsPage: React.FC<FacultySubmissionsPageProps> = ({
  assignments,
  selectedAssignment,
  onSelectAssignment,
  onNavigate
}) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResultData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Currently viewing evaluation detail for selected submission
  const [activeEvaluation, setActiveEvaluation] = useState<EvaluationResultData | null>(null);
  const [isEvaluatingId, setIsEvaluatingId] = useState<string | null>(null);

  const currentAssignment = selectedAssignment || (assignments.length > 0 ? assignments[0] : null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const asmId = currentAssignment?.id;
      const [subs, evals] = await Promise.all([
        api.listSubmissions({ assignment_id: asmId }),
        api.listEvaluations({ assignment_id: asmId })
      ]);
      setSubmissions(subs || []);
      setEvaluations(evals || []);
    } catch (err) {
      console.error('Failed to load faculty submission data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentAssignment]);

  // Compute Statistics
  const totalSubmissions = submissions.length;
  const evaluationMap = new Map<string, EvaluationResultData>();
  evaluations.forEach(e => evaluationMap.set(e.submission_id, e));

  const evaluatedCount = submissions.filter(s => evaluationMap.has(s.id)).length;
  const pendingCount = totalSubmissions - evaluatedCount;

  const evaluatedList = evaluations.filter(e => e.assignment_id === currentAssignment?.id || !currentAssignment);
  const avgScore = evaluatedList.length > 0
    ? Math.round(evaluatedList.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / evaluatedList.length)
    : 0;

  // Filter Submissions
  const filteredSubmissions = submissions.filter(s => {
    const sId = s.student_id || 'STUDENT_001';
    const matchesSearch = sId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isEval = evaluationMap.has(s.id);
    const matchesStatus = statusFilter === 'ALL' ||
                          (statusFilter === 'EVALUATED' && isEval) ||
                          (statusFilter === 'PENDING' && !isEval);

    return matchesSearch && matchesStatus;
  });

  const handleTriggerEvaluation = async (submissionId: string) => {
    try {
      setIsEvaluatingId(submissionId);
      const res = await api.triggerEvaluation(submissionId);
      await loadData();
      setActiveEvaluation(res);
    } catch (err: any) {
      alert('Failed to evaluate submission: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsEvaluatingId(null);
    }
  };

  if (activeEvaluation) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <EvaluationResult
          data={activeEvaluation}
          onUpdateResult={(updated) => {
            setActiveEvaluation(updated);
            loadData();
          }}
          onBack={() => setActiveEvaluation(null)}
          isStudentView={false}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 font-sans bg-forest-50/40 min-h-screen">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-forest-900 tracking-tight">
            Submissions & Evaluation Management
          </h2>
          <p className="text-xs md:text-sm text-forest-600 font-sans mt-1">
            Review student submissions, trigger AI evaluation, inspect evidence, and manage score overrides.
          </p>
        </div>

        {/* Assignment Selector Dropdown */}
        {assignments.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-forest-700">Select Assignment:</span>
            <select
              value={currentAssignment?.id || ''}
              onChange={(e) => {
                const found = assignments.find(a => a.id === e.target.value);
                if (found) onSelectAssignment(found);
              }}
              className="bg-white border border-forest-200 rounded-xl px-4 py-2 text-xs font-sans font-semibold text-forest-900 focus:outline-none focus:border-mint-500 shadow-sm"
            >
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.subject})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 1. Assignment Header Card */}
      {currentAssignment ? (
        <div className="bg-forest-900 text-white rounded-3xl p-6 shadow-md border border-forest-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-forest-800 text-mint-300 border border-forest-700">
              {currentAssignment.subject}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-200">
              Maximum Marks: {currentAssignment.total_marks}
            </span>
          </div>
          <h3 className="text-xl font-display font-bold text-white tracking-tight">{currentAssignment.title}</h3>
          <p className="text-xs font-sans text-emerald-100/90 bg-forest-950/60 p-3.5 rounded-xl border border-forest-800 leading-relaxed">
            <strong className="text-mint-300 font-semibold">Question: </strong>{currentAssignment.question}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center text-forest-600 border border-forest-100 shadow-card space-y-3">
          <BookOpen className="w-12 h-12 text-forest-400 mx-auto" />
          <h4 className="text-base font-display font-bold text-forest-900">No assignments found</h4>
          <p className="text-xs text-forest-500 max-w-sm mx-auto">
            Please create an assignment first to view student submissions.
          </p>
          <button
            onClick={() => onNavigate('create-assignment')}
            className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-display font-semibold transition-all inline-flex items-center space-x-1.5"
          >
            <span>Create Assignment</span>
          </button>
        </div>
      )}

      {/* 2. Submission Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-card space-y-2">
          <div className="flex items-center justify-between text-forest-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Submissions</span>
            <FileText className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-display font-bold text-forest-900">{totalSubmissions}</div>
          <div className="text-[11px] text-forest-500 font-medium">Student Answer Sheets</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-card space-y-2">
          <div className="flex items-center justify-between text-mint-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Evaluated</span>
            <CheckCircle2 className="w-4 h-4 text-mint-700" />
          </div>
          <div className="text-2xl font-display font-bold text-forest-900">{evaluatedCount}</div>
          <div className="text-[11px] text-mint-700 font-medium font-mono">AI Evaluated</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-card space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-display font-bold text-forest-900">{pendingCount}</div>
          <div className="text-[11px] text-amber-700 font-medium font-mono">Awaiting Evaluation</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-card space-y-2">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Class Average</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-display font-bold text-forest-900">{avgScore}%</div>
          <div className="text-[11px] text-blue-700 font-medium">Mean percentage</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-forest-100 shadow-card space-y-2">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Evaluation Rate</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-display font-bold text-forest-900">
            {totalSubmissions > 0 ? Math.round((evaluatedCount / totalSubmissions) * 100) : 0}%
          </div>
          <div className="text-[11px] text-purple-700 font-medium">Completed percentage</div>
        </div>

      </div>

      {/* 3. Student Submission Table & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-card space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-100 pb-4">
          <h3 className="text-base font-display font-bold text-forest-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-forest-700" />
            <span>Student Submission Repository</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-forest-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-forest-50 border border-forest-200 rounded-xl text-xs text-forest-900 focus:outline-none focus:border-mint-500 font-sans"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-forest-50 border border-forest-200 rounded-xl px-3 py-1.5 text-xs text-forest-900 font-sans focus:outline-none focus:border-mint-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="EVALUATED">Evaluated</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-12 text-center text-forest-600 space-y-2">
            <div className="w-8 h-8 border-4 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono">Loading student submission database...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center text-forest-500 space-y-2 font-sans">
            <FileText className="w-10 h-10 text-forest-300 mx-auto" />
            <p className="text-xs font-semibold">No student submissions found matching the criteria.</p>
            <p className="text-[11px] text-forest-400">Student answer submissions will appear here automatically when submitted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-forest-100 text-forest-600 uppercase font-mono text-[10px] tracking-wider bg-forest-50/50">
                  <th className="py-3 px-4">Student ID / Roll No</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Input Format</th>
                  <th className="py-3 px-4">Evaluation Status</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Duplicate Flag</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100">
                {filteredSubmissions.map((sub) => {
                  const evalData = evaluationMap.get(sub.id);
                  const isEval = !!evalData;
                  const isEvaluatingThis = isEvaluatingId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-forest-50/30 transition-colors">
                      
                      <td className="py-3.5 px-4 font-mono font-bold text-forest-900">
                        {sub.student_id || 'STUDENT_001'}
                      </td>

                      <td className="py-3.5 px-4 text-forest-600 font-mono text-[11px]">
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Just now'}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          sub.input_type === 'PDF' 
                            ? 'bg-purple-50 text-purple-800 border-purple-200' 
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {sub.input_type || 'TEXT'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {isEval ? (
                          <span className="px-2.5 py-1 rounded-full bg-mint-50 text-mint-800 border border-mint-200 text-[10px] font-bold inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>EVALUATED</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold inline-flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {isEval ? (
                          <span className="font-bold text-forest-900 text-sm">
                            {evalData.final_score} <span className="text-xs text-forest-500 font-normal">/ {evalData.max_score} ({evalData.percentage}%)</span>
                          </span>
                        ) : (
                          <span className="text-forest-400 italic">--</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {isEval && evalData.duplicate?.flag ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                            FLAGGED
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">Original</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isEval ? (
                          <button
                            onClick={() => setActiveEvaluation(evalData)}
                            className="px-3 py-1.5 bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-[11px] rounded-xl shadow-sm transition-all inline-flex items-center space-x-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Evaluation</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTriggerEvaluation(sub.id)}
                            disabled={isEvaluatingThis}
                            className="px-3 py-1.5 bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold text-[11px] rounded-xl shadow-sm transition-all inline-flex items-center space-x-1.5 disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isEvaluatingThis ? 'Evaluating...' : 'Run AI Evaluation'}</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
