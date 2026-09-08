import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, XCircle, Edit3, ShieldAlert, FileText } from 'lucide-react';
import { CriterionEvaluation } from '../types/evaluation';

interface CriterionCardProps {
  criterion: CriterionEvaluation;
  onOpenOverride: (criterion: CriterionEvaluation) => void;
  isFocused?: boolean;
  isStudentView?: boolean;
}

export const CriterionCard: React.FC<CriterionCardProps> = ({
  criterion,
  onOpenOverride,
  isFocused,
  isStudentView = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const status = criterion.status;
  const isOverridden = criterion.override_score !== undefined && criterion.override_score !== null;
  const displayScore = isOverridden ? criterion.override_score : criterion.awarded_marks;

  let badgeStyle = 'bg-neutral-bg text-slate-800 border-neutral';
  let cardBg = 'glass-panel';
  let Icon = CheckCircle2;

  if (status === 'ENTAILED') {
    badgeStyle = 'bg-brand text-white border-brand-light/40';
    cardBg = 'bg-brand-navy/90 border-brand-light/30';
    Icon = CheckCircle2;
  } else if (status === 'PARTIAL') {
    badgeStyle = 'bg-partial text-slate-950 font-semibold border-partial/40';
    cardBg = 'bg-brand-navy/90 border-partial/40';
    Icon = AlertTriangle;
  } else if (status === 'CONTRADICTED') {
    badgeStyle = 'bg-danger text-white border-danger/40';
    cardBg = 'bg-brand-navy/90 border-danger/40';
    Icon = XCircle;
  }

  return (
    <div
      id={`criterion-card-${criterion.criterion_id}`}
      className={`${cardBg} rounded-2xl border transition-all duration-300 ${
        isFocused || isOpen ? 'ring-2 ring-brand-light border-brand-light' : 'hover:border-brand-light/50'
      }`}
    >
      {/* Header Bar */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
          <div className={`p-1.5 rounded-lg border ${badgeStyle}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-body font-sans font-semibold text-white truncate">
                {criterion.description}
              </span>
              <span className={`text-caption font-sans font-semibold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                {status}
              </span>
            </div>
            {criterion.keyword_stuffing_detected && (
              <div className="text-caption font-sans text-partial-text flex items-center space-x-1 mt-1 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Possible Keyword Stuffing Detected</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-display-md font-display font-semibold text-white">
              {displayScore} <span className="text-body font-sans text-neutral font-normal">/ {criterion.max_marks}</span>
            </span>
            {isOverridden && (
              <div className="text-caption font-sans text-partial-text font-medium">
                Overridden (AI: {criterion.awarded_marks})
              </div>
            )}
          </div>

          {!isStudentView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenOverride(criterion);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-brand/40 hover:bg-brand text-brand-lighter hover:text-white border border-brand-light/30 text-label font-sans font-medium flex items-center space-x-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Override</span>
            </button>
          )}

          <button type="button" className="text-neutral hover:text-white">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-brand-light/20 space-y-4 animate-fadeIn">
          
          {/* Sentence Evidence */}
          {criterion.evidence ? (
            <div className="bg-brand-navy border border-brand-light/30 rounded-xl p-3">
              <div className="text-caption font-sans font-semibold text-brand-lighter flex items-center space-x-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-brand-light" />
                <span>Supporting Sentence Evidence (Sentence #{criterion.evidence.sentence_id + 1}):</span>
              </div>
              <p className="text-body text-slate-200 italic font-sans pl-5">
                "{criterion.evidence.text}"
              </p>
            </div>
          ) : (
            <div className="bg-brand-navy/40 border border-brand-light/20 rounded-xl p-3 text-caption text-neutral italic">
              No matching evidence sentence identified in submission.
            </div>
          )}

          {/* AI Component Metrics (Tutor/Admin view only) */}
          {!isStudentView && (
            <div className="space-y-3 bg-brand-navy/80 p-4 rounded-xl border border-brand-light/30">
              <div className="text-label font-sans font-semibold text-brand-lighter uppercase tracking-wider">
                NLP Engine Component Scores
              </div>

              {/* Semantic Similarity Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-body font-sans font-medium">
                  <span className="text-slate-300">Semantic Similarity</span>
                  <span className="text-brand-light font-mono font-medium">{(criterion.semantic_score * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-brand-navy h-2 rounded-full overflow-hidden border border-brand-light/20">
                  <div
                    className="bg-brand-light h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, criterion.semantic_score * 100))}%` }}
                  />
                </div>
              </div>

              {/* Entailment Score Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-body font-sans font-medium">
                  <span className="text-slate-300">Entailment Probability</span>
                  <span className="text-brand-lighter font-mono font-medium">{(criterion.entailment_score * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-brand-navy h-2 rounded-full overflow-hidden border border-brand-light/20">
                  <div
                    className="bg-brand-lighter h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, criterion.entailment_score * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Feedback Text */}
          <div className="text-body font-sans text-slate-200 leading-relaxed bg-brand-navy/60 p-3.5 rounded-xl border border-brand-light/20">
            <strong className="text-brand-light font-semibold">AI Diagnostic Feedback: </strong>
            {criterion.feedback}
          </div>

          {/* Missing Concepts Panel (insight purple: bg-insight-bg, text-insight-text) */}
          {criterion.missing_concepts.length > 0 && status !== 'ENTAILED' && (
            <div className="bg-insight-bg border border-insight/30 rounded-xl p-3 flex flex-wrap items-center gap-2">
              <span className="text-caption font-sans font-semibold text-insight-text">Missing Concepts:</span>
              {criterion.missing_concepts.map((kw, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-insight/20 text-insight-text border border-insight/40 font-mono text-caption">
                  {kw}
                </span>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
