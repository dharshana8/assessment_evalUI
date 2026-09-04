import React, { useState } from 'react';
import { EvaluationResultData, CriterionEvaluation } from '../types/evaluation';
import { ScoreSummary } from '../components/ScoreSummary';
import { EvidenceViewer } from '../components/EvidenceViewer';
import { CriterionCard } from '../components/CriterionCard';
import { OverrideModal } from '../components/OverrideModal';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { JudgePanel } from '../components/JudgePanel';
import { api } from '../services/api';
import { ArrowLeft, Download, Sparkles, LayoutList } from 'lucide-react';

interface EvaluationResultProps {
  data: EvaluationResultData;
  onUpdateResult: (updated: EvaluationResultData) => void;
  onBack: () => void;
}

export const EvaluationResult: React.FC<EvaluationResultProps> = ({
  data,
  onUpdateResult,
  onBack
}) => {
  const [selectedSentenceId, setSelectedSentenceId] = useState<number | null>(null);
  const [overrideCriterion, setOverrideCriterion] = useState<CriterionEvaluation | null>(null);
  const [showJudgePanel, setShowJudgePanel] = useState<boolean>(true);

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

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Sticky Dashboard Header */}
      <div className="sticky top-4 z-40 bg-brand-navy border border-brand-light/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-brand/40 hover:bg-brand text-brand-lighter border border-brand-light/30 hover:text-white transition-colors"
            title="Back to portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-heading font-display font-semibold text-white flex items-center space-x-2">
              <span>{data.assignment_title}</span>
              <span className="text-caption font-mono font-bold px-2 py-0.5 rounded bg-brand/40 text-brand-lighter border border-brand-light/30">
                OFFLINE EVALUATION
              </span>
            </h2>
            <p className="text-caption font-mono text-brand-lighter">
              Student ID: {data.student_id} | Latency: {data.processing_time}s
            </p>
          </div>
        </div>

        {/* Score Pill & Actions */}
        <div className="flex items-center space-x-3">
          <div className="bg-brand border border-brand-light/40 px-4 py-2 rounded-xl text-center">
            <span className="text-caption font-sans font-semibold uppercase text-brand-lighter block">Total Score</span>
            <span className="text-display-lg font-display font-semibold text-brand-lighter">
              {data.final_score} <span className="text-body font-sans text-neutral">/ {data.max_score}</span>
            </span>
          </div>

          <button
            onClick={() => setShowJudgePanel(!showJudgePanel)}
            className={`px-3.5 py-2.5 rounded-xl text-label font-display font-semibold flex items-center space-x-1.5 border transition-all ${
              showJudgePanel
                ? 'bg-insight text-white border-insight/40 shadow-lg'
                : 'bg-brand/30 hover:bg-brand text-brand-lighter border-brand-light/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Judge Pitch Panel</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-brand-light hover:bg-brand-lighter text-brand-navy font-display font-semibold text-label shadow-lg flex items-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Top Overall Score Summary Card */}
      <ScoreSummary data={data} />

      {/* Judge Innovation Overview */}
      {showJudgePanel && <JudgePanel />}

      {/* Split Screen Grid: Student Answer (Left 5 cols) | Rubric Criterion Breakdown (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5/12): Student Answer Evidence Highlighting */}
        <div className="lg:col-span-5 space-y-4">
          <EvidenceViewer
            sentences={data.sentences}
            criteria={data.criteria}
            selectedSentenceId={selectedSentenceId}
            onSelectSentence={handleSentenceClick}
          />
        </div>

        {/* Right Column (7/12): Scrollable Rubric Criteria Accordions */}
        <div className="lg:col-span-7 space-y-4 max-h-[750px] overflow-y-auto pr-2">
          <div className="flex items-center justify-between sticky top-0 bg-brand-navy/90 backdrop-blur-md p-2 rounded-xl border border-brand-light/20 z-10">
            <h3 className="text-heading font-display font-semibold text-white flex items-center space-x-2">
              <LayoutList className="w-4 h-4 text-brand-light" />
              <span>Rubric Criterion Evaluation Cards</span>
            </h3>
            <span className="text-caption font-mono text-brand-lighter">
              {data.criteria.length} Criteria Evaluated
            </span>
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
                />
              );
            })}
          </div>
        </div>

      </div>

      {/* Diagnostic Feedback Panel */}
      <FeedbackPanel
        evaluationId={data.evaluation_id}
        diagnosticSummary={data.diagnostic_summary}
      />

      {/* Teacher Override Modal */}
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
