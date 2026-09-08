import React, { useState } from 'react';
import { Plus, BookOpen, ChevronRight } from 'lucide-react';
import { Assignment } from '../types/evaluation';
import { RubricBuilder } from '../components/RubricBuilder';

interface InstructorDashboardProps {
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
  onRefreshAssignments: () => void;
  onNavigateToCreate?: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  assignments,
  onSelectAssignment,
  onRefreshAssignments,
  onNavigateToCreate
}) => {
  const [showBuilder, setShowBuilder] = useState(false);

  const handleAssignmentCreated = (newAssignment: Assignment) => {
    setShowBuilder(false);
    onRefreshAssignments();
    onSelectAssignment(newAssignment);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 font-sans bg-forest-50/40 min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-lg font-display font-bold text-forest-900">Assignments & Rubric Repository</h2>
          <p className="text-body font-sans text-forest-600 mt-1">
            Manage descriptive assessment questions, rubric criteria, and student evaluations
          </p>
        </div>

        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-label shadow-md flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showBuilder ? 'View Assignments List' : 'Create New Assignment'}</span>
        </button>
      </div>

      {showBuilder ? (
        <RubricBuilder onAssignmentCreated={handleAssignmentCreated} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-heading font-display font-bold text-forest-900">All Database Assignments</h3>
            <span className="text-xs text-forest-600 font-mono">{assignments.length} Records</span>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-forest-600 space-y-3 border border-forest-100 shadow-card">
              <BookOpen className="w-12 h-12 text-forest-400 mx-auto" />
              <h4 className="text-base font-display font-bold text-forest-900">No assignments created yet</h4>
              <p className="text-xs text-forest-500 font-sans max-w-sm mx-auto">
                Create an assignment to begin evaluating student submissions.
              </p>
              <button
                onClick={() => setShowBuilder(true)}
                className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-caption font-display font-semibold shadow-md transition-all inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((asm) => (
                <div
                  key={asm.id}
                  onClick={() => onSelectAssignment(asm)}
                  className="bg-white p-6 rounded-3xl border border-forest-100 hover:border-mint-500 shadow-card hover:shadow-card-hover cursor-pointer transition-all space-y-3 group"
                >
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

                  <p className="text-xs text-forest-600 line-clamp-2 font-sans">
                    {asm.question}
                  </p>

                  <div className="pt-3 border-t border-forest-100 flex items-center justify-between text-xs font-sans text-forest-500">
                    <span className="font-mono">{asm.rubric_criteria?.length || 0} Rubric Criteria</span>
                    <ChevronRight className="w-4 h-4 text-forest-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
