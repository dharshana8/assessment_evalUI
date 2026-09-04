import React, { useState, useEffect } from 'react';
import { Cpu, FileSearch, Layers, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface LoadingSkeletonProps {
  onComplete?: () => void;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Parsing Input (PDF/Text)", icon: FileSearch, desc: "Extracting raw text document contents..." },
    { label: "Linguistic Sentence Segmentation", icon: Layers, desc: "Splitting text into atomic sentence units via spaCy..." },
    { label: "Semantic Similarity Vectorization", icon: Sparkles, desc: "Computing all-MiniLM-L6-v2 cosine embedding vectors..." },
    { label: "NLI Contradiction Guardrail", icon: Cpu, desc: "Evaluating cross-encoder RoBERTa entailment vs negation..." },
    { label: "Hybrid Score Calculation", icon: CheckCircle2, desc: "Applying discretized mark bands and diagnostic summary..." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="max-w-3xl mx-auto glass-panel rounded-3xl p-8 border border-brand-light/30 shadow-2xl space-y-8 animate-pulse-subtle">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-brand/30 border border-brand-light/40 text-brand-light mb-2">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-display-lg font-display font-semibold text-white">EvalUI NLP Pipeline Processing</h2>
        <p className="text-body font-sans text-brand-lighter">Offline CPU Inference in progress (0% cloud API reliance)...</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-brand/30 border-brand-light/40 text-brand-lighter'
                  : isCurrent
                  ? 'bg-brand-navy border-brand-light shadow-lg scale-[1.01] text-white ring-1 ring-brand-light'
                  : 'bg-brand-navy/40 border-brand-light/10 text-neutral opacity-60'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border ${
                  isDone
                    ? 'bg-brand/40 border-brand-light/40 text-brand-light'
                    : isCurrent
                    ? 'bg-brand-light text-brand-navy border-brand-light font-bold'
                    : 'bg-brand-navy border-brand-light/20 text-neutral'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : isCurrent ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-heading font-display font-semibold truncate">{step.label}</h4>
                  <span className="text-caption font-mono px-2 py-0.5 rounded bg-brand-navy border border-brand-light/20 text-brand-lighter">
                    Step {idx + 1}/5
                  </span>
                </div>
                <p className="text-caption font-sans text-brand-lighter truncate mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full bg-brand-navy h-2.5 rounded-full overflow-hidden border border-brand-light/30">
        <div
          className="bg-gradient-to-r from-brand to-brand-light h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
