import React from 'react';
import { Sparkles, CheckCircle2, XCircle, ShieldCheck, Lock, Zap } from 'lucide-react';

export const JudgePanel: React.FC = () => {
  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-insight/40 bg-insight-bg space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-insight/30 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-insight text-white border border-insight/40">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 className="text-display-md font-display font-semibold text-insight-text">Why EvalUI Wins — Architectural Comparison</h3>
            <p className="text-body font-sans text-slate-700">AMYPO Hackathon Judge Perspective & Core Innovation Differentiators</p>
          </div>
        </div>

        <span className="text-label font-mono font-semibold px-3 py-1.5 rounded-xl bg-insight text-white border border-insight/40">
          Judge Pitch Panel
        </span>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-insight/30 bg-white/90 shadow-sm">
        <table className="w-full text-left text-body text-slate-800">
          <thead className="bg-insight/10 text-insight-text uppercase font-display text-caption tracking-wider border-b border-insight/30">
            <tr>
              <th className="p-3.5">Evaluation Feature</th>
              <th className="p-3.5 text-brand font-bold bg-brand-bg border-x border-brand/30">
                EvalUI (Hybrid + NLI)
              </th>
              <th className="p-3.5">Pure Cosine Similarity</th>
              <th className="p-3.5">Cloud LLM API (OpenAI/Gemini)</th>
              <th className="p-3.5">Keyword Match</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-body">
            <tr>
              <td className="p-3.5 font-sans font-medium text-slate-900">Contradiction Detection ("TCP is NOT...")</td>
              <td className="p-3.5 bg-brand-bg border-x border-brand/30 text-brand font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-brand" />
                <span>Zeroes Score (&gt;0.60 prob)</span>
              </td>
              <td className="p-3.5 text-danger-text flex items-center space-x-1">
                <XCircle className="w-4 h-4 text-danger" />
                <span>False High Score</span>
              </td>
              <td className="p-3.5 text-partial-text">Inconsistent / Hallucination Risk</td>
              <td className="p-3.5 text-danger-text flex items-center space-x-1">
                <XCircle className="w-4 h-4 text-danger" />
                <span>Ignored</span>
              </td>
            </tr>

            <tr>
              <td className="p-3.5 font-sans font-medium text-slate-900">Privacy & Offline Capability</td>
              <td className="p-3.5 bg-brand-bg border-x border-brand/30 text-brand font-bold">
                100% Offline (Local CPU)
              </td>
              <td className="p-3.5 text-brand">Offline</td>
              <td className="p-3.5 text-danger-text">Cloud Dependency & Data Leak</td>
              <td className="p-3.5 text-brand">Offline</td>
            </tr>

            <tr>
              <td className="p-3.5 font-sans font-medium text-slate-900">Inference Latency</td>
              <td className="p-3.5 bg-brand-bg border-x border-brand/30 text-brand-navy font-bold">
                ~40ms – 160ms on CPU
              </td>
              <td className="p-3.5 text-neutral">~20ms</td>
              <td className="p-3.5 text-partial-text">~2,000ms – 5,000ms</td>
              <td className="p-3.5 text-neutral">~5ms</td>
            </tr>

            <tr>
              <td className="p-3.5 font-sans font-medium text-slate-900">Sentence Evidence Grounding</td>
              <td className="p-3.5 bg-brand-bg border-x border-brand/30 text-brand font-bold">
                Sentence-level Green/Yellow/Red
              </td>
              <td className="p-3.5 text-neutral">Doc-level Vector</td>
              <td className="p-3.5 text-neutral">Text Summary</td>
              <td className="p-3.5 text-neutral">Exact String Match</td>
            </tr>

            <tr>
              <td className="p-3.5 font-sans font-medium text-slate-900">Keyword Stuffing Guardrail</td>
              <td className="p-3.5 bg-brand-bg border-x border-brand/30 text-brand font-bold">
                Lexical-Semantic Mismatch Flag
              </td>
              <td className="p-3.5 text-danger-text">Easily Fooled</td>
              <td className="p-3.5 text-partial-text">Variable</td>
              <td className="p-3.5 text-danger-text">Gives 100% Score</td>
            </tr>

            <tr>
              <td className="p-3.5 font-sans font-medium text-slate-900">Operating Cost</td>
              <td className="p-3.5 bg-brand-bg border-x border-brand/30 text-brand font-bold">
                $0.00 (Zero API Billing)
              </td>
              <td className="p-3.5 text-brand">$0.00</td>
              <td className="p-3.5 text-danger-text">High API Token Costs</td>
              <td className="p-3.5 text-brand">$0.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Key Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 p-4 rounded-2xl border border-insight/30 space-y-1.5">
          <div className="flex items-center space-x-2 text-insight-text font-bold text-heading font-display">
            <Lock className="w-4 h-4" />
            <span>Offline-First CPU Target</span>
          </div>
          <p className="text-body text-slate-700 font-sans">
            Runs HuggingFace MiniLM and RoBERTa models locally on CPU with zero cloud API reliance or student data exposure.
          </p>
        </div>

        <div className="bg-white/80 p-4 rounded-2xl border border-insight/30 space-y-1.5">
          <div className="flex items-center space-x-2 text-brand font-bold text-heading font-display">
            <ShieldCheck className="w-4 h-4" />
            <span>NLI Contradiction Guard</span>
          </div>
          <p className="text-body text-slate-700 font-sans">
            Enforces 0 marks when student answer negates rubric fact (contradiction probability &gt; 0.60).
          </p>
        </div>

        <div className="bg-white/80 p-4 rounded-2xl border border-insight/30 space-y-1.5">
          <div className="flex items-center space-x-2 text-partial-text font-bold text-heading font-display">
            <Zap className="w-4 h-4" />
            <span>Human-in-the-Loop</span>
          </div>
          <p className="text-body text-slate-700 font-sans">
            Instructors review sentence highlights and submit score overrides with justification while preserving AI records.
          </p>
        </div>
      </div>

    </div>
  );
};
