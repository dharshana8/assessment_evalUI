import React, { useState } from 'react';
import { EvaluationResultData, CriterionEvaluation } from '../types/evaluation';
import { ScoreSummary } from '../components/ScoreSummary';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { CriterionCard } from '../components/CriterionCard';
import { OverrideModal } from '../components/OverrideModal';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { api } from '../services/api';
import { 
  ArrowLeft, 
  Download, 
  LayoutList, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Sparkles,
  Edit3
} from 'lucide-react';

interface EvaluationResultProps {
  data: EvaluationResultData;
  onUpdateResult: (updated: EvaluationResultData) => void;
  onBack: () => void;
  isStudentView?: boolean;
}

export const EvaluationResult: React.FC<EvaluationResultProps> = ({
  data,
  onUpdateResult,
  onBack,
  isStudentView = false
}) => {
  const [selectedSentenceId, setSelectedSentenceId] = useState<number | null>(null);
  const [overrideCriterion, setOverrideCriterion] = useState<CriterionEvaluation | null>(null);

  const handleSentenceClick = (sentenceId: number | null) => {
    setSelectedSentenceId(sentenceId);
    if (sentenceId !== null) {
      const matchedCrit = data.criteria.find(c => c.evidence?.sentence_id === sentenceId);
      if (matchedCrit) {
        const el = document.getElementById(`criterion-card-${matchedCrit.criterion_id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handleSaveOverride = async (
    criterionEvaluationId: string,
    newScore: number,
    reason: string
  ) => {
    const updated = await api.overrideScore(
      data.evaluation_id,
      criterionEvaluationId,
      newScore,
      reason
    );
    onUpdateResult(updated);
  };

  const handleDownloadPDF = () => {
    window.open(api.getReportPdfUrl(data.evaluation_id), '_blank');
  };

  const isOverridden = Math.abs(data.final_score - data.total_score) > 0.001;

  const reliabilityStatus = data.reliability?.status || 'RELIABLE';
  const reliabilityScore = data.reliability?.score ?? 0.95;
  const duplicateFlag = data.duplicate?.flag || false;
  const confidenceLevel = data.confidence?.level || 'HIGH';
  const confidenceScore = data.confidence?.score ?? 0.88;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      
      {/* Sticky Header Bar */}
      <div className="sticky top-4 z-40 bg-forest-900 border border-forest-700 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 text-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-mint-300 border border-forest-600 hover:text-white transition-colors"
            title="Back to portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-display font-bold text-white flex items-center space-x-2">
              <span>{data.assignment_title}</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-mint-500/20 text-mint-300 border border-mint-500/30">
                EVALUATION REVIEW
              </span>
            </h2>
            {!isStudentView && (
              <p className="text-xs font-mono text-emerald-200/80">
                Student ID: {data.student_id} | Latency: {data.processing_time.toFixed(2)}s
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <div className="bg-forest-800 border border-forest-700 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] font-sans font-semibold uppercase text-mint-300 block">
              {isOverridden ? 'Final Teacher Score' : 'Final AI Score'}
            </span>
            <span className="text-xl font-display font-bold text-white">
              {data.final_score} <span className="text-xs font-normal text-emerald-200/70">/ {data.max_score}</span>
            </span>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold text-xs shadow-lg flex items-center space-x-2 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* 1. QUESTION SECTION */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-forest-100 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-forest-600">
          <HelpCircle className="w-4 h-4 text-forest-700" />
          <span>1. Question</span>
        </div>
        <p className="text-base font-display font-bold text-forest-900 leading-relaxed">
          {data.question}
        </p>
      </div>

      {/* 2. REFERENCE ANSWER SECTION (FACULTY / TUTOR ONLY) */}
      {!isStudentView && (
        <div className="bg-white rounded-3xl p-6 shadow-card border border-forest-100 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-forest-600">
            <BookOpen className="w-4 h-4 text-forest-700" />
            <span>2. Private Reference Answer (Faculty Only)</span>
          </div>
          <p className="text-xs md:text-sm text-forest-800 leading-relaxed font-sans bg-forest-50/60 p-4 rounded-2xl border border-forest-100">
            Standard rubric reference answer used by local NLP engine for semantic and entailment alignment verification.
          </p>
        </div>
      )}

      {/* 3. RELIABILITY STATUS / AUDIT SIGNALS SECTION */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-forest-100 space-y-4">
        <div className="flex items-center justify-between border-b border-forest-100 pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-forest-600">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>3. Audit Signals & Reliability</span>
          </div>
          <span className="text-xs font-mono text-forest-500">Local NLP Inspection</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono font-semibold">
          {/* AI Score */}
          <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 space-y-1">
            <span className="text-forest-600 block text-[10px] uppercase">Final AI Score</span>
            <div className="text-xl font-display font-bold text-forest-900">
              {data.total_score} / {data.max_score} <span className="text-xs text-forest-600">({data.percentage}%)</span>
            </div>
            {isOverridden && (
              <span className="text-[10px] text-amber-700 font-bold block">Teacher Overridden: {data.final_score}</span>
            )}
          </div>

          {/* Reference Reliability */}
          <div className={`p-4 rounded-2xl border space-y-1 ${
            reliabilityStatus === 'RELIABLE' ? 'bg-mint-50 border-mint-200 text-forest-900' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <span className="block text-[10px] uppercase opacity-80">Reference Reliability</span>
            <div className="text-xl font-display font-bold">
              {(reliabilityScore * 100).toFixed(0)}%
            </div>
            <span className="text-[10px] font-bold block">{reliabilityStatus}</span>
          </div>

          {/* Duplicate Status */}
          <div className={`p-4 rounded-2xl border space-y-1 ${
            duplicateFlag ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <span className="block text-[10px] uppercase opacity-80">Duplicate Status</span>
            <div className="text-xl font-display font-bold flex items-center space-x-1.5">
              <Copy className="w-4 h-4" />
              <span>{duplicateFlag ? 'Yes' : 'No'}</span>
            </div>
            <span className="text-[10px] font-bold block">{duplicateFlag ? 'Flagged Risk' : 'Original Answer'}</span>
          </div>

          {/* Confidence */}
          <div className={`p-4 rounded-2xl border space-y-1 ${
            confidenceLevel === 'HIGH' ? 'bg-mint-100 border-mint-300 text-forest-950' : 'bg-amber-100 border-amber-300 text-amber-950'
          }`}>
            <span className="block text-[10px] uppercase opacity-80">AI Confidence</span>
            <div className="text-xl font-display font-bold">
              {(confidenceScore * 100).toFixed(0)}%
            </div>
            <span className="text-[10px] font-bold block">{confidenceLevel} CONFIDENCE</span>
          </div>
        </div>
      </div>

      {/* 4 & 5 & 6 & 7. RUBRIC + STUDENT ANSWER + EVIDENCE HIGHLIGHTING + CRITERION SCORES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Student Answer & Evidence Highlighting */}
        <div className="lg:col-span-5 space-y-4">
          <EvidenceViewer
            sentences={data.sentences}
            criteria={data.criteria}
            selectedSentenceId={selectedSentenceId}
            onSelectSentence={handleSentenceClick}
          />
        </div>

        {/* Right 7 Cols: Rubric Criteria & Specific Feedback Cards */}
        <div className="lg:col-span-7 space-y-4 max-h-[750px] overflow-y-auto pr-2">
          <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-forest-100 z-10 shadow-sm">
            <h3 className="text-sm font-display font-bold text-forest-900 flex items-center space-x-2">
              <LayoutList className="w-4 h-4 text-forest-700" />
              <span>Rubric Criterion Evaluation ({data.criteria.length} Items)</span>
            </h3>
            <div className="flex items-center space-x-2 text-[11px] font-sans font-bold">
              <span className="px-2 py-0.5 bg-mint-50 text-forest-900 rounded border border-mint-200">Green: Supported</span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded border border-amber-200">Yellow: Partial</span>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-900 rounded border border-rose-200">Red: Contradicted</span>
            </div>
          </div>

          <div className="space-y-3">
            {data.criteria.map((crit) => {
              const isFocused =
                selectedSentenceId !== null &&
                crit.evidence?.sentence_id === selectedSentenceId;

              return (
                <CriterionCard
                  key={crit.id}
                  criterion={crit}
                  onOpenOverride={setOverrideCriterion}
                  isFocused={isFocused}
                  isStudentView={isStudentView}
                />
              );
            })}
          </div>
        </div>

      </div>

      {/* 8. FEEDBACK & DIAGNOSTIC SUMMARY */}
      <FeedbackPanel
        evaluationId={data.evaluation_id}
        diagnosticSummary={data.diagnostic_summary}
      />

      {/* 9. TEACHER OVERRIDE MODAL */}
      {overrideCriterion && (
        <OverrideModal
          criterion={overrideCriterion}
          onClose={() => setOverrideCriterion(null)}
          onSaveOverride={handleSaveOverride}
        />
      )}

    </div>
  );
};

export default EvaluationResult;

