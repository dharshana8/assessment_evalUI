import React from 'react';
import { Award, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { EvaluationResultData } from '../types/evaluation';

interface ScoreSummaryProps {
  data: EvaluationResultData;
}

export const ScoreSummary: React.FC<ScoreSummaryProps> = ({ data }) => {
  const isOverridden = Math.abs(data.final_score - data.total_score) > 0.001;

  const entailedCount = data.criteria.filter(c => c.status === 'ENTAILED').length;
  const partialCount = data.criteria.filter(c => c.status === 'PARTIAL').length;
  const contradictedCount = data.criteria.filter(c => c.status === 'CONTRADICTED').length;
  const unsupportedCount = data.criteria.filter(c => c.status === 'UNSUPPORTED').length;

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-brand-light/30 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-light/20">
        <div>
          <h3 className="text-label font-sans font-semibold uppercase tracking-wider text-brand-lighter">
            Evaluation Result Summary
          </h3>
          <p className="text-heading font-display font-semibold text-white mt-0.5">
            {data.assignment_title}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-caption text-brand-lighter bg-brand/40 border border-brand-light/30 px-3 py-1.5 rounded-full font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing Latency: {data.processing_time.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      {/* Main Score Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Big Score Banner (bg-brand-navy, text-brand-lighter) */}
        <div className="bg-brand-navy border border-brand-light/40 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
          <div className="text-label font-sans font-semibold text-brand-lighter uppercase tracking-wider mb-1">
            Overall Score
          </div>

          <div className="text-display-xl font-display font-semibold text-brand-lighter">
            {data.final_score} <span className="text-display-md text-neutral font-normal">/ {data.max_score}</span>
          </div>

          <div className="text-heading font-display font-semibold text-brand-light mt-1">
            {data.percentage}%
          </div>

          {isOverridden && (
            <div className="mt-2.5 inline-flex items-center space-x-1 text-caption font-sans text-partial-text bg-partial-bg border border-partial/40 px-2.5 py-1 rounded-lg">
              <span>Teacher Override Applied (AI: {data.total_score})</span>
            </div>
          )}
        </div>

        {/* Progress Bar & Breakdown */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex justify-between text-body font-sans font-semibold text-slate-200 mb-2">
              <span>Criteria Support Progress</span>
              <span className="font-display font-semibold text-brand-light">{data.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-brand-navy rounded-full overflow-hidden border border-brand-light/30">
              <div
                className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, data.percentage))}%` }}
              />
            </div>
          </div>

          {/* Counts Badges (Stat Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-brand-bg border border-brand/40 rounded-xl p-3 text-center">
              <div className="text-brand-navy font-display text-display-md font-semibold">{entailedCount}</div>
              <div className="text-caption font-sans font-semibold uppercase text-brand">Entailed</div>
            </div>

            <div className="bg-partial-bg border border-partial/40 rounded-xl p-3 text-center">
              <div className="text-partial-text font-display text-display-md font-semibold">{partialCount}</div>
              <div className="text-caption font-sans font-semibold uppercase text-partial-text">Partial</div>
            </div>

            <div className="bg-danger-bg border border-danger/40 rounded-xl p-3 text-center">
              <div className="text-danger-text font-display text-display-md font-semibold">{contradictedCount}</div>
              <div className="text-caption font-sans font-semibold uppercase text-danger-text">Contradicted</div>
            </div>

            <div className="bg-neutral-bg border border-neutral/40 rounded-xl p-3 text-center">
              <div className="text-slate-800 font-display text-display-md font-semibold">{unsupportedCount}</div>
              <div className="text-caption font-sans font-semibold uppercase text-slate-600">Unsupported</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
