import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, ChevronRight, Search, FileText, Calendar, Users, Eye, Edit3 } from 'lucide-react';
import { Assignment } from '../types/evaluation';
import { api } from '../services/api';

interface AssignmentsPageProps {
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
  onNavigateToCreate: () => void;
  onNavigateToSubmissions?: (assignment: Assignment) => void;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({
  assignments,
  onSelectAssignment,
  onNavigateToCreate,
  onNavigateToSubmissions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [selectedDetailsAssignment, setSelectedDetailsAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    const fetchSubmissionCounts = async () => {
      try {
        const subs = await api.listSubmissions();
        const counts: Record<string, number> = {};
        (subs || []).forEach((s: any) => {
          if (s.assignment_id) {
            counts[s.assignment_id] = (counts[s.assignment_id] || 0) + 1;
          }
        });
        setSubmissionCounts(counts);
      } catch (e) {
        console.error('Failed to load submission counts:', e);
      }
    };
    fetchSubmissionCounts();
  }, [assignments]);

  // Extract unique subjects
  const subjects = ['ALL', ...Array.from(new Set(assignments.map(a => a.subject).filter(Boolean)))];

  const filteredAssignments = assignments.filter((asm) => {
    const matchesSearch = 
      asm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.question.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === 'ALL' || asm.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 font-sans bg-forest-50/40 min-h-screen">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg font-display font-bold text-forest-900">Assignments</h2>
          <p className="text-body font-sans text-forest-600 mt-1">
            View and manage your published assessments.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-label shadow-md flex items-center space-x-1.5 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assignment</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-forest-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
          <input
            type="text"
            placeholder="Search assignments by title or question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-forest-50/50 border border-forest-200 rounded-xl pl-9 pr-4 py-2 text-xs text-forest-900 focus:outline-none focus:border-mint-500 font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-forest-600 whitespace-nowrap">Filter Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-forest-50/50 border border-forest-200 rounded-xl px-3 py-2 text-xs font-sans text-forest-900 focus:outline-none focus:border-mint-500"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-xs text-forest-500 font-mono pl-2 border-l border-forest-200">
            {filteredAssignments.length} / {assignments.length} Total
          </span>
        </div>
      </div>

      {/* Assignments List / Grid */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-forest-600 space-y-3 border border-forest-100 shadow-card">
            <BookOpen className="w-12 h-12 text-forest-400 mx-auto" />
            <h4 className="text-base font-display font-bold text-forest-900">
              {assignments.length === 0 ? 'No assignments created yet' : 'No matching assignments found'}
            </h4>
            <p className="text-xs text-forest-500 font-sans max-w-sm mx-auto">
              {assignments.length === 0 
                ? 'Create an assessment with a reference answer and rubric for AI-powered evaluation.' 
                : 'Try adjusting your search criteria or clear filters.'}
            </p>
            {assignments.length === 0 && (
              <button
                onClick={onNavigateToCreate}
                className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-caption font-display font-semibold shadow-md transition-all inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asm) => {
              const subCount = submissionCounts[asm.id] || 0;

              return (
                <div
                  key={asm.id}
                  className="bg-white p-6 rounded-3xl border border-forest-100 hover:border-mint-500 shadow-card hover:shadow-card-hover transition-all space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-mint-50 text-mint-800 border border-mint-200">
                        {asm.subject}
                      </span>
                      <span className="text-xs font-mono font-bold text-forest-700">
                        Max Marks: {asm.total_marks}
                      </span>
                    </div>

                    <h4 className="text-heading font-display font-bold text-forest-900 group-hover:text-mint-700 transition-colors">
                      {asm.title}
                    </h4>

                    <p className="text-xs text-forest-600 line-clamp-3 font-sans">
                      {asm.question}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-forest-100 flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-forest-500">
                    <div className="flex items-center space-x-2 font-mono text-[11px]">
                      <span className="bg-forest-50 px-2 py-0.5 rounded border border-forest-200 text-forest-800 font-semibold">
                        {asm.rubric_criteria?.length || 0} Criteria
                      </span>
                      <span className="bg-purple-50 text-purple-900 font-bold px-2 py-0.5 rounded border border-purple-200">
                        {subCount} Submissions
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDetailsAssignment(asm)}
                        className="px-3 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 text-xs font-semibold font-display transition-colors border border-forest-200 flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View/Edit</span>
                      </button>
                      {onNavigateToSubmissions && (
                        <button
                          onClick={() => onNavigateToSubmissions(asm)}
                          className="px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-semibold font-display transition-colors shadow-sm flex items-center space-x-1"
                        >
                          <span>Submissions</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View / Edit Assignment Modal */}
      {selectedDetailsAssignment && (
        <div className="fixed inset-0 z-50 bg-forest-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-forest-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-forest-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-mint-50 text-mint-800 border border-mint-200">
                  {selectedDetailsAssignment.subject}
                </span>
                <h3 className="text-xl font-display font-bold text-forest-900 mt-2">
                  {selectedDetailsAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailsAssignment(null)}
                className="text-forest-400 hover:text-forest-800 text-sm font-mono font-bold p-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-forest-800">
              <div>
                <strong className="block font-display font-bold text-forest-900 mb-1">Descriptive Question:</strong>
                <p className="bg-forest-50/60 p-3.5 rounded-xl border border-forest-100 leading-relaxed font-mono">
                  {selectedDetailsAssignment.question}
                </p>
              </div>

              {selectedDetailsAssignment.reference_answer && (
                <div>
                  <strong className="block font-display font-bold text-forest-900 mb-1 text-amber-900">
                    Instructor Reference Answer (Private):
                  </strong>
                  <p className="bg-amber-50/60 text-amber-950 p-3.5 rounded-xl border border-amber-200/60 leading-relaxed font-mono">
                    {selectedDetailsAssignment.reference_answer}
                  </p>
                </div>
              )}

              <div>
                <strong className="block font-display font-bold text-forest-900 mb-2">
                  Rubric Criteria ({selectedDetailsAssignment.rubric_criteria?.length || 0}) • Total: {selectedDetailsAssignment.total_marks} Marks:
                </strong>
                <div className="space-y-2">
                  {(selectedDetailsAssignment.rubric_criteria || []).map((c, idx) => (
                    <div key={idx} className="p-3 bg-forest-50/40 rounded-xl border border-forest-100 flex items-center justify-between">
                      <span className="font-medium text-forest-900 flex-1">{idx + 1}. {c.description}</span>
                      <span className="font-mono font-bold text-forest-700 ml-4">{c.max_marks} Marks</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-forest-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedDetailsAssignment(null)}
                className="px-4 py-2 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-900 font-display font-semibold text-xs transition-colors"
              >
                Close
              </button>
              {onNavigateToSubmissions && (
                <button
                  onClick={() => {
                    const asm = selectedDetailsAssignment;
                    setSelectedDetailsAssignment(null);
                    onNavigateToSubmissions(asm);
                  }}
                  className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <span>View Submissions</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
