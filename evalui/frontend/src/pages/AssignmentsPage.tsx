import React, { useState } from 'react';
import { Plus, BookOpen, ChevronRight, Search, FileText, Calendar } from 'lucide-react';
import { Assignment } from '../types/evaluation';

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
            {filteredAssignments.map((asm) => (
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

                <div className="pt-3 border-t border-forest-100 flex items-center justify-between text-xs font-sans text-forest-500">
                  <div className="flex items-center space-x-3 font-mono text-[11px]">
                    <span className="bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                      {asm.rubric_criteria?.length || 0} Criteria
                    </span>
                    <span className="text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      Published
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectAssignment(asm)}
                      className="px-3 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 text-xs font-semibold font-display transition-colors border border-forest-200"
                    >
                      View Details
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
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
