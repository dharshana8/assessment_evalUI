import React from 'react';
import { RubricBuilder } from '../components/RubricBuilder';
import { Assignment } from '../types/evaluation';

interface CreateAssignmentPageProps {
  onAssignmentCreated: (newAssignment: Assignment) => void;
}

export const CreateAssignmentPage: React.FC<CreateAssignmentPageProps> = ({
  onAssignmentCreated
}) => {
  return (
    <div className="p-6 md:p-8 space-y-6 font-sans bg-forest-50/40 min-h-screen">
      <div>
        <h2 className="text-display-lg font-display font-bold text-forest-900">Create New Assignment</h2>
        <p className="text-body font-sans text-forest-600 mt-1">
          Create an assessment with a reference answer and rubric for AI-powered evaluation.
        </p>
      </div>

      <RubricBuilder onAssignmentCreated={onAssignmentCreated} />
    </div>
  );
};
