import React from 'react';
import { Download, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface FeedbackPanelProps {
  evaluationId: string;
  diagnosticSummary: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  evaluationId,
  diagnosticSummary
}) => {
  const handleDownloadPdf = () => {
    const url = api.getReportPdfUrl(evaluationId);
    window.open(url, '_blank');
  };

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-insight/30 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-insight/20 pb-3">
        <h3 className="text-heading font-display font-semibold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-insight-DEFAULT" />
          <span>AI Diagnostic Feedback & Report</span>
        </h3>

        <button
          onClick={handleDownloadPdf}
          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white hover:text-brand-navy font-display font-semibold text-label shadow-lg flex items-center space-x-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Evaluation Report</span>
        </button>
      </div>

      {/* AI Insight Box (insight bg-EEEDFE, text-534AB7) */}
      <div className="bg-insight-bg border border-insight/30 rounded-2xl p-5">
        <div className="text-caption font-sans font-semibold uppercase tracking-wider text-insight-text mb-1">
          Overall Diagnostic Summary
        </div>
        <p className="text-body text-slate-800 leading-relaxed font-sans font-normal">
          {diagnosticSummary || 'Evaluation complete. All criteria checked.'}
        </p>
      </div>
    </div>
  );
};
