import React from 'react';
import { SentenceStruct, CriterionEvaluation } from '../types/evaluation';
import { FileText, Info } from 'lucide-react';

interface EvidenceViewerProps {
  sentences: SentenceStruct[];
  criteria: CriterionEvaluation[];
  selectedSentenceId: number | null;
  onSelectSentence: (sentenceId: number | null) => void;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  sentences,
  criteria,
  selectedSentenceId,
  onSelectSentence
}) => {
  const sentenceStatusMap: Record<number, string> = {};
  const sentenceCriterionMap: Record<number, string[]> = {};

  criteria.forEach(c => {
    if (c.evidence) {
      const sId = c.evidence.sentence_id;
      const status = c.status;
      
      if (!sentenceCriterionMap[sId]) {
        sentenceCriterionMap[sId] = [];
      }
      sentenceCriterionMap[sId].push(c.criterion_id);

      if (status === 'CONTRADICTED') {
        sentenceStatusMap[sId] = 'CONTRADICTED';
      } else if (status === 'ENTAILED' && sentenceStatusMap[sId] !== 'CONTRADICTED') {
        sentenceStatusMap[sId] = 'ENTAILED';
      } else if (status === 'PARTIAL' && !sentenceStatusMap[sId]) {
        sentenceStatusMap[sId] = 'PARTIAL';
      }
    }
  });

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-brand-light/30 space-y-4">
      
      <div className="flex items-center justify-between border-b border-brand-light/20 pb-3">
        <h3 className="text-heading font-display font-semibold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-brand-light" />
          <span>Student Answer Evidence Highlighting</span>
        </h3>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-caption font-sans">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand"></span>
            <span className="text-brand-lighter font-medium">Entailed</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-partial"></span>
            <span className="text-partial font-medium">Partial</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-danger"></span>
            <span className="text-danger font-medium">Contradicted</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral"></span>
            <span className="text-neutral font-medium">Unmatched</span>
          </span>
        </div>
      </div>

      {/* Answer Sentences Display */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-2">
        {sentences.length === 0 ? (
          <div className="text-neutral text-body font-sans italic p-4 text-center">
            No sentences segmented.
          </div>
        ) : (
          sentences.map((sent) => {
            const status = sentenceStatusMap[sent.sentence_id] || 'UNMATCHED';
            const matchedCriteria = sentenceCriterionMap[sent.sentence_id] || [];
            const isSelected = selectedSentenceId === sent.sentence_id;

            let statusClass = 'sent-unmatched';
            if (status === 'CONTRADICTED') statusClass = 'sent-contradicted';
            else if (status === 'ENTAILED') statusClass = 'sent-entailed';
            else if (status === 'PARTIAL') statusClass = 'sent-partial';

            return (
              <div
                key={sent.sentence_id}
                onClick={() => onSelectSentence(isSelected ? null : sent.sentence_id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all ${statusClass} ${
                  isSelected ? 'ring-2 ring-brand-light scale-[1.01] shadow-lg' : 'hover:opacity-95'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-body font-sans font-normal leading-relaxed">
                    <span className="text-caption font-mono px-2 py-0.5 rounded bg-slate-900/10 mr-2 font-medium">
                      S{sent.sentence_id + 1}
                    </span>
                    {sent.text}
                  </span>

                  {matchedCriteria.length > 0 && (
                    <span className="text-caption font-mono font-medium px-2 py-0.5 rounded bg-slate-900/10 flex-shrink-0">
                      Matches {matchedCriteria.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-caption text-neutral flex items-center space-x-1.5 pt-2 border-t border-brand-light/20">
        <Info className="w-3.5 h-3.5 text-brand-light" />
        <span>Click any sentence to focus and scroll to its corresponding rubric criterion card.</span>
      </div>

    </div>
  );
};
