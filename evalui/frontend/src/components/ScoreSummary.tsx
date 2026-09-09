import React from 'react';
import { Award, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { EvaluationResultData } from '../types/evaluation';

interface ScoreSummaryProps {
  data: EvaluationResultData;
  isStudentView?: boolean;
}

export const ScoreSummary: React.FC<ScoreSummaryProps> = ({ data, isStudentView = false }) => {
  const isOverridden = Math.abs(data.final_score - data.total_score) > 0.001;

  const entailedCount = data.criteria.filter(c => c.status === 'ENTAILED').length;
  const partialCount = data.criteria.filter(c => c.status === 'PARTIAL').length;
  const contradictedCount = data.criteria.filter(c => c.status === 'CONTRADICTED').length;
  const unsupportedCount = data.criteria.filter(c => c.status === 'UNSUPPORTED').length;

  // Extract audit signals
  const reliabilityStatus = data.reliability?.status || 'RELIABLE';
  const reliabilityScore = data.reliability?.score ?? 0.95;
  const duplicateFlag = data.duplicate?.flag || false;
  const duplicateType = data.duplicate?.type || 'ORIGINAL';
  const confidenceLevel = data.confidence?.level || 'HIGH';
  const confidenceScore = data.confidence?.score ?? 0.88;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-canvas-border space-y-6">
      
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-canvas-border space-y-6">
      
      {/* Evaluation Review Pipeline Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-canvas-border">
        <div>
          <h3 className="text-caption font-mono font-semibold uppercase tracking-wider text-forest-600">
            {isStudentView ? 'Assessment Feedback Summary' : 'Tutor Evaluation Review Pipeline'}
          </h3>
          <p className="text-heading font-display font-bold text-slate-900 mt-0.5">
            {data.assignment_title}
          </p>
        </div>

        {/* Audit Badges: Reliability, Duplicate, Confidence */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold">
          
          {/* Reference Reliability */}
          <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${
            reliabilityStatus === 'RELIABLE'
              ? 'bg-mint-50 text-forest-900 border-mint-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            <span>Reference Reliability: {(reliabilityScore * 100).toFixed(0)}% ({reliabilityStatus})</span>
          </div>

          {/* Duplicate Status */}
          <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${
            duplicateFlag
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}>
            <span>Duplicate: {duplicateFlag ? 'Yes' : 'No'}</span>
          </div>

          {/* AI Confidence */}
          <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${
            confidenceLevel === 'HIGH'
              ? 'bg-mint-100 text-forest-950 border-mint-300 font-bold'
              : 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
          }`}>
            <span>Confidence: {(confidenceScore * 100).toFixed(0)}% ({confidenceLevel})</span>
          </div>

          {!isStudentView && (
            <div className="flex items-center space-x-1 text-xs text-slate-500 bg-canvas-subtle border border-canvas-border px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>Latency: {data.processing_time.toFixed(2)}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Score Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Score Banner (AI Score vs Final Teacher Score Auditability) */}
        <div className="bg-forest-900 text-white rounded-2xl p-6 text-center shadow-md relative overflow-hidden border border-forest-800 space-y-2">
          <div className="text-caption font-sans font-semibold text-mint-300 uppercase tracking-wider">
            {isOverridden ? 'Final Teacher Score' : 'Final AI Score'}
          </div>

          <div className="text-display-xl font-display font-bold text-white">
            {data.final_score} <span className="text-display-md text-mint-200/80 font-normal">/ {data.max_score}</span>
          </div>

          <div className="text-heading font-display font-bold text-mint-400">
            {data.percentage}%
          </div>

          <div className="pt-2 border-t border-forest-800 text-xs font-mono text-emerald-200 flex justify-center items-center space-x-3">
            <span>AI Score: <strong>{data.total_score} / {data.max_score}</strong></span>
            {isOverridden && (
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded text-[10px] font-bold">
                Teacher Overridden
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Status Counts */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex justify-between text-body font-sans font-semibold text-slate-800 mb-2">
              <span>Rubric Criterion Support Level</span>
              <span className="font-display font-bold text-forest-900">{data.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-canvas-subtle rounded-full overflow-hidden border border-canvas-border">
              <div
                className="h-full bg-forest-900 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, data.percentage))}%` }}
              />
            </div>
          </div>

          {/* Counts Badges: GREEN Supported, YELLOW Partial, RED Contradicted */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-mint-50 border border-mint-200 rounded-xl p-3 text-center">
              <div className="text-forest-900 font-display text-display-md font-bold">{entailedCount}</div>
              <div className="text-caption font-sans font-bold uppercase text-forest-700">Supported (Green)</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <div className="text-amber-900 font-display text-display-md font-bold">{partialCount}</div>
              <div className="text-caption font-sans font-bold uppercase text-amber-800">Partial (Yellow)</div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
              <div className="text-rose-900 font-display text-display-md font-bold">{contradictedCount}</div>
              <div className="text-caption font-sans font-bold uppercase text-rose-800">Contradicted (Red)</div>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-slate-800 font-display text-display-md font-bold">{unsupportedCount}</div>
              <div className="text-caption font-sans font-bold uppercase text-slate-600">Unsupported</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
