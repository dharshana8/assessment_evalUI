import React, { useState } from 'react';
import { Plus, BookOpen, ChevronRight } from 'lucide-react';
import { Assignment } from '../types/evaluation';
import { RubricBuilder } from '../components/RubricBuilder';

interface InstructorDashboardProps {
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
  onRefreshAssignments: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  assignments,
  onSelectAssignment,
  onRefreshAssignments
}) => {
  const [showBuilder, setShowBuilder] = useState(false);

  const handleAssignmentCreated = (newAssignment: Assignment) => {
    setShowBuilder(false);
    onRefreshAssignments();
    onSelectAssignment(newAssignment);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-lg font-display font-semibold text-white">Instructor Assessment Portal</h2>
          <p className="text-body font-sans text-neutral mt-1">
            Manage descriptive assessment questions, rubric criteria, and evaluations
          </p>
        </div>

        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white hover:text-brand-navy font-display font-semibold text-label shadow-lg flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showBuilder ? 'View Assignments List' : 'Create New Assignment'}</span>
        </button>
      </div>

      {showBuilder ? (
        <RubricBuilder onAssignmentCreated={handleAssignmentCreated} />
      ) : (
        <div className="space-y-4">
          <h3 className="text-heading font-display font-semibold text-slate-200">Existing Assignments</h3>
          {assignments.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center text-neutral space-y-3">
              <BookOpen className="w-12 h-12 text-neutral mx-auto" />
              <p className="text-body font-sans">No assignments created yet.</p>
              <button
                onClick={() => setShowBuilder(true)}
                className="px-4 py-2 rounded-xl bg-brand text-white text-label font-display font-semibold hover:bg-brand-light hover:text-brand-navy"
              >
                Create First Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((asm) => (
                <div
                  key={asm.id}
                  onClick={() => onSelectAssignment(asm)}
                  className="glass-panel p-5 rounded-3xl border border-brand-light/30 hover:border-brand-light cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-mono font-semibold px-2.5 py-0.5 rounded-md bg-brand/40 text-brand-lighter border border-brand-light/30">
                      {asm.subject}
                    </span>
                    <span className="text-caption font-mono font-bold text-neutral">
                      Max Marks: {asm.total_marks}
                    </span>
                  </div>

                  <h4 className="text-heading font-display font-semibold text-white group-hover:text-brand-light transition-colors">
                    {asm.title}
                  </h4>

                  <p className="text-body font-sans text-neutral line-clamp-2">
                    {asm.question}
                  </p>

                  <div className="pt-2 border-t border-brand-light/20 flex items-center justify-between text-caption font-sans text-neutral">
                    <span>{asm.rubric_criteria?.length || 0} Atomic Rubric Criteria</span>
                    <ChevronRight className="w-4 h-4 text-brand-light group-hover:translate-x-1 transition-transform" />
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
