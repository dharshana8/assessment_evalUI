import React from 'react';
import { Assignment, EvaluationResultData } from '../types/evaluation';
import { SubmissionPortal } from '../components/SubmissionPortal';
import { BookOpen } from 'lucide-react';

interface StudentSubmissionProps {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  onSelectAssignment: (assignment: Assignment) => void;
  onEvaluationComplete: (result: EvaluationResultData) => void;
  demoAnswers?: Record<string, string>;
  healthStatus?: any;
}

export const StudentSubmission: React.FC<StudentSubmissionProps> = ({
  assignments,
  selectedAssignment,
  onSelectAssignment,
  onEvaluationComplete,
  demoAnswers,
  healthStatus
}) => {
  const currentAssignment = selectedAssignment || (assignments.length > 0 ? assignments[0] : null);

  return (
    <div className="p-6 md:p-8 space-y-6 bg-forest-50/40 min-h-screen">
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-forest-900 tracking-tight">
            Student Evaluation Portal
          </h2>
          <p className="text-xs md:text-sm text-forest-600 font-sans mt-1">
            Submit descriptive answer text or upload PDF for explainable local AI evaluation
          </p>
        </div>

        {/* Assignment Selector Dropdown */}
        {assignments.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-forest-600">Select Question:</span>
            <select
              value={currentAssignment?.id || ''}
              onChange={(e) => {
                const found = assignments.find(a => a.id === e.target.value);
                if (found) onSelectAssignment(found);
              }}
              className="bg-white border border-forest-200 rounded-xl px-3.5 py-2 text-xs font-sans text-forest-900 focus:outline-none focus:border-mint-500 shadow-sm"
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

      {currentAssignment ? (
        <SubmissionPortal
          assignment={currentAssignment}
          onEvaluationComplete={onEvaluationComplete}
          demoAnswers={demoAnswers}
          healthStatus={healthStatus}
        />
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-forest-600 border border-forest-100 shadow-card space-y-3">
          <BookOpen className="w-12 h-12 text-forest-400 mx-auto" />
          <p className="font-sans text-xs">No active assessment questions found. Please create an assignment in the Instructor Portal first.</p>
        </div>
      )}

    </div>
  );
};
