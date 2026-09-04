import React from 'react';
import { Zap, X, CheckCircle2, AlertTriangle, XCircle, FileText, ArrowRight } from 'lucide-react';

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseKey: string, studentText: string) => void;
}

export const DEMO_CASES = [
  {
    key: "Case A — Correct",
    badge: "Full Credit (4.0/4.0)",
    color: "bg-brand-bg text-brand-navy border-brand/40",
    icon: CheckCircle2,
    desc: "Complete TCP Three-Way Handshake explanation with all required steps.",
    text: "TCP is a connection-oriented protocol. The client sends a SYN packet. The server responds with SYN-ACK. Finally, the client sends ACK to complete the connection."
  },
  {
    key: "Case B — Contradiction",
    badge: "Direct Negation (0.0/4.0)",
    color: "bg-danger-bg text-danger-text border-danger/40",
    icon: XCircle,
    desc: "Direct negation of concept. NLI Guardrail catches contradiction and awards 0 marks despite high keyword similarity.",
    text: "TCP is not a connection-oriented protocol and it does not use a three-way handshake."
  },
  {
    key: "Case C — Partial",
    badge: "Partial Credit (3.0/4.0)",
    color: "bg-partial-bg text-partial-text border-partial/40",
    icon: AlertTriangle,
    desc: "Mentions SYN and SYN-ACK, but misses final ACK packet step.",
    text: "TCP is connection-oriented. The client sends SYN and receives SYN-ACK."
  },
  {
    key: "Case D — Paraphrased",
    badge: "Paraphrased (3.5/4.0)",
    color: "bg-brand-bg text-brand-navy border-brand/40",
    icon: FileText,
    desc: "Paraphrased conceptually without exact keyword matching.",
    text: "TCP establishes communication by performing a handshake between the client and server before data exchange."
  },
  {
    key: "Case E — Off Topic",
    badge: "Zero Credit (0.0/4.0)",
    color: "bg-neutral-bg text-slate-800 border-neutral/40",
    icon: XCircle,
    desc: "Unrelated answer ('Cricket'). Model gives 0 marks with 0 false positive.",
    text: "Cricket is played between two teams. Players score runs by hitting the ball."
  },
  {
    key: "Case F — Keyword Stuffing",
    badge: "Stuffing Flagged (1.0/4.0)",
    color: "bg-partial-bg text-partial-text border-partial/40",
    icon: AlertTriangle,
    desc: "Random keyword list. Lexical-Semantic mismatch triggers keyword stuffing warning.",
    text: "TCP SYN SYN-ACK ACK HTTP UDP IP TCP SYN ACK connection-oriented."
  }
];

export const DemoModeModal: React.FC<DemoModeModalProps> = ({
  isOpen,
  onClose,
  onSelectCase
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-brand-navy/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-brand-navy border border-brand-light/40 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-light/20 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-brand text-brand-lighter border border-brand-light/30">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-display-md font-display font-semibold text-white">1-Click Hackathon Demo Mode</h2>
              <p className="text-body font-sans text-brand-lighter">Pre-loaded TCP Three-Way Handshake test cases (Cases A–F)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral hover:text-white bg-brand/40 hover:bg-brand border border-brand-light/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_CASES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => {
                  onSelectCase(item.key, item.text);
                  onClose();
                }}
                className="glass-panel p-4 rounded-2xl border border-brand-light/30 hover:border-brand-light cursor-pointer group transition-all hover:scale-[1.01] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-heading font-display font-semibold text-white flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-brand-light" />
                      <span>{item.key}</span>
                    </span>
                    <span className={`text-caption font-sans font-semibold px-2 py-0.5 rounded-md border ${item.color}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-body font-sans text-brand-lighter mb-3">{item.desc}</p>
                  <p className="text-caption font-mono text-slate-200 bg-brand-navy p-2.5 rounded-xl border border-brand-light/20 line-clamp-3">
                    "{item.text}"
                  </p>
                </div>

                <div className="flex items-center justify-end text-label font-display font-semibold text-brand-light group-hover:translate-x-1 transition-transform">
                  <span>Load Case & Evaluate</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
