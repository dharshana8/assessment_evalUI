import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CriterionEvaluation } from '../types/evaluation';

interface OverrideModalProps {
  criterion: CriterionEvaluation | null;
  onClose: () => void;
  onSaveOverride: (criterionEvaluationId: string, newScore: number, reason: string) => Promise<void>;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  criterion,
  onClose,
  onSaveOverride
}) => {
  if (!criterion) return null;

  const [newScore, setNewScore] = useState<number>(
    criterion.override_score !== undefined && criterion.override_score !== null
      ? criterion.override_score
      : criterion.awarded_marks
  );
  const [reason, setReason] = useState<string>(criterion.override_reason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for overriding the AI score.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSaveOverride(criterion.id, Number(newScore), reason.trim());
      onClose();
    } catch (err: any) {
      alert('Failed to override score: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-brand-light/30 space-y-5 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-light/20 pb-3">
          <h3 className="text-display-md font-display font-semibold text-white flex items-center space-x-2">
            <span>Override AI Criterion Score</span>
          </h3>
          <button
            onClick={onClose}
            className="text-neutral hover:text-white p-1 rounded-xl hover:bg-brand/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Criterion Info */}
        <div className="bg-brand-navy border border-brand-light/30 p-4 rounded-2xl">
          <div className="text-caption font-sans font-semibold text-brand-lighter mb-1">Target Criterion:</div>
          <p className="text-body font-sans font-medium text-slate-100">{criterion.description}</p>
          <div className="mt-2 flex items-center space-x-3 text-caption font-sans">
            <span className="text-brand-lighter">AI Suggested Score: <strong className="text-brand-light font-mono">{criterion.awarded_marks} / {criterion.max_marks}</strong></span>
            <span className="text-brand-lighter">Status: <strong className="text-brand-light">{criterion.status}</strong></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-caption font-sans font-semibold text-slate-300 uppercase tracking-wider mb-2">
              New Instructor Score (Max: {criterion.max_marks})
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              max={criterion.max_marks}
              required
              value={newScore}
              onChange={(e) => setNewScore(parseFloat(e.target.value))}
              className="w-full bg-brand-navy border border-brand-light/30 rounded-xl px-4 py-2.5 text-body text-white font-mono focus:outline-none focus:border-brand-light"
            />
          </div>

          <div>
            <label className="block text-caption font-sans font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Reason / Justification for Override
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Student explanation is conceptually correct despite alternative wording..."
              className="w-full bg-brand-navy border border-brand-light/30 rounded-xl p-3.5 text-body text-white focus:outline-none focus:border-brand-light font-sans"
            />
          </div>

          <div className="flex items-center space-x-2 text-caption font-sans text-partial-text bg-partial-bg p-3 rounded-xl border border-partial/40">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>The original AI evaluation score will be preserved in database audit logs.</span>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-label font-sans font-medium text-neutral hover:text-white bg-brand-navy hover:bg-brand/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white hover:text-brand-navy font-display font-semibold text-label shadow-lg flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Override'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
