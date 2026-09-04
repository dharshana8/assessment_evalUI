import React from 'react';
import { ShieldCheck, BookOpen, UserCheck, Play, Cpu, Sparkles } from 'lucide-react';
import { JudgePanel } from '../components/JudgePanel';

interface HomeProps {
  onNavigate: (tab: string) => void;
  onLoadDemo: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onLoadDemo }) => {
  return (
    <div className="space-y-10 pb-12 animate-fadeIn">
      
      {/* Hero Section with brand-navy background */}
      <div className="bg-brand-navy border border-brand-light/30 rounded-3xl p-8 text-center max-w-5xl mx-auto space-y-6 shadow-2xl">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand/40 text-brand-lighter border border-brand-light/30 text-caption font-mono">
          <Cpu className="w-3.5 h-3.5 text-brand-light animate-pulse" />
          <span>Offline-First CPU NLP Engine • Zero Cloud APIs</span>
        </div>

        <h1 className="text-display-xl font-display font-semibold tracking-tight text-white">
          Explainable AI Evaluation for Descriptive Assessments
        </h1>

        <p className="text-body font-sans text-brand-lighter max-w-2xl mx-auto leading-relaxed">
          EvalUI combines MiniLM semantic embeddings, CrossEncoder NLI contradiction guardrails, and sentence evidence extraction to evaluate student descriptive answers reliably without keyword trickery.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigate('instructor')}
            className="px-6 py-3.5 rounded-xl bg-brand hover:bg-brand-light text-white hover:text-brand-navy font-display font-semibold text-heading shadow-xl flex items-center space-x-2 transition-all hover:scale-105"
          >
            <BookOpen className="w-5 h-5" />
            <span>Instructor Portal</span>
          </button>

          <button
            onClick={() => onNavigate('student')}
            className="px-6 py-3.5 rounded-xl bg-brand/40 hover:bg-brand text-white border border-brand-light/30 font-display font-semibold text-heading flex items-center space-x-2 transition-all"
          >
            <UserCheck className="w-5 h-5" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={onLoadDemo}
            className="px-6 py-3.5 rounded-xl bg-brand-light hover:bg-brand-lighter text-brand-navy font-display font-semibold text-heading shadow-lg flex items-center space-x-2 transition-all hover:scale-105"
          >
            <Play className="w-5 h-5 fill-brand-navy" />
            <span>⚡ Run Quick TCP Demo</span>
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="glass-panel p-6 rounded-3xl border border-brand-light/30 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-brand/30 text-brand-light border border-brand-light/30 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-heading font-display font-semibold text-white">Contradiction Guardrail</h3>
          <p className="text-body font-sans text-brand-lighter leading-relaxed">
            Detects negations & contradictions using CrossEncoder NLI. Negated statements automatically receive 0 marks regardless of high semantic similarity.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-brand-light/30 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-insight/20 text-insight-text border border-insight/30 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-heading font-display font-semibold text-white">Sentence Evidence Grounding</h3>
          <p className="text-body font-sans text-brand-lighter leading-relaxed">
            Extracts exact sentence proofs for every criterion and highlights student answers in Green (Entailed), Yellow (Partial), or Red (Contradicted).
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-brand-light/30 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-brand/30 text-brand-light border border-brand-light/30 flex items-center justify-center mb-3">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-heading font-display font-semibold text-white">Offline-First CPU Target</h3>
          <p className="text-body font-sans text-brand-lighter leading-relaxed">
            Pretrained lightweight models run locally on CPU without sending sensitive student data or relying on paid third-party APIs.
          </p>
        </div>
      </div>

      {/* Judge Panel */}
      <div className="max-w-6xl mx-auto">
        <JudgePanel />
      </div>

    </div>
  );
};
