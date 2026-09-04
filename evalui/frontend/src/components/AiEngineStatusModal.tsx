import React from 'react';
import { Cpu, X, CheckCircle2, Clock, ShieldCheck, Zap, AlertCircle, HardDrive } from 'lucide-react';

interface AiEngineStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthStatus: any;
}

export const AiEngineStatusModal: React.FC<AiEngineStatusModalProps> = ({
  isOpen,
  onClose,
  healthStatus
}) => {
  if (!isOpen) return null;

  const isReady = healthStatus?.models_loaded || healthStatus?.ai_engine === 'ready';
  const isInitializing = healthStatus?.ai_engine === 'initializing';

  const spacyStatus = healthStatus?.models?.spacy ?? isReady;
  const embedderStatus = healthStatus?.models?.embedder ?? isReady;
  const nliStatus = healthStatus?.models?.nli ?? isReady;

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-forest-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-forest-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${isReady ? 'bg-mint-100 text-mint-800 border border-mint-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              <Cpu className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-forest-900">
                Local AI Engine Status
              </h2>
              <p className="text-xs text-forest-600 font-sans">
                Real-time model warm-up & privacy architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-forest-400 hover:text-forest-900 bg-forest-50 hover:bg-forest-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Status Banner */}
        <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${
          isReady
            ? 'bg-mint-50/80 border-mint-200 text-mint-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}>
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${isReady ? 'bg-mint-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
          <div className="text-xs font-sans">
            <div className="font-bold text-sm">
              {isReady ? '🟢 Local AI Engine Ready' : '🟡 AI Engine Initializing'}
            </div>
            <div className="text-forest-600 text-[11px] mt-0.5">
              {isReady
                ? 'All local models are loaded into CPU memory and ready for instant inference.'
                : 'FastAPI backend is online. Models are pre-warming in a background task.'}
            </div>
          </div>
        </div>

        {/* Detailed Model Breakdown */}
        <div className="space-y-3 bg-forest-50/60 p-4 rounded-2xl border border-forest-100">
          <div className="text-xs font-mono font-bold text-forest-700 uppercase tracking-wider mb-1">
            Model Status Breakdown
          </div>

          {/* Model 1: Sentence Segmentation */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-forest-100 text-xs">
            <span className="font-sans font-medium text-forest-900">Sentence Segmentation (spaCy)</span>
            {spacyStatus ? (
              <span className="text-mint-700 font-mono font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint-600" /> ✓ Ready
              </span>
            ) : (
              <span className="text-amber-700 font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Initializing...
              </span>
            )}
          </div>

          {/* Model 2: Semantic Engine */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-forest-100 text-xs">
            <span className="font-sans font-medium text-forest-900">Semantic Engine (MiniLM-L6-v2)</span>
            {embedderStatus ? (
              <span className="text-mint-700 font-mono font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint-600" /> ✓ Ready
              </span>
            ) : (
              <span className="text-amber-700 font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Initializing...
              </span>
            )}
          </div>

          {/* Model 3: NLI Contradiction Engine */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-forest-100 text-xs">
            <span className="font-sans font-medium text-forest-900">NLI Engine (DeBERTa-v3-small)</span>
            {nliStatus ? (
              <span className="text-mint-700 font-mono font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint-600" /> ✓ Ready
              </span>
            ) : (
              <span className="text-amber-700 font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Initializing...
              </span>
            )}
          </div>
        </div>

        {/* Technical Architecture Specs Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-forest-50/60 rounded-xl border border-forest-100">
            <span className="text-[10px] font-mono text-forest-500 uppercase block">Execution</span>
            <span className="text-xs font-display font-bold text-forest-900 flex items-center justify-center gap-1 mt-0.5">
              <Cpu className="w-3.5 h-3.5 text-forest-700" /> Local CPU
            </span>
          </div>

          <div className="p-3 bg-forest-50/60 rounded-xl border border-forest-100">
            <span className="text-[10px] font-mono text-forest-500 uppercase block">External APIs</span>
            <span className="text-xs font-display font-bold text-forest-900 flex items-center justify-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> None
            </span>
          </div>

          <div className="p-3 bg-forest-50/60 rounded-xl border border-forest-100">
            <span className="text-[10px] font-mono text-forest-500 uppercase block">Privacy</span>
            <span className="text-xs font-display font-bold text-mint-800 flex items-center justify-center gap-1 mt-0.5">
              <HardDrive className="w-3.5 h-3.5 text-mint-600" /> 100% Local
            </span>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-xs rounded-xl transition-colors"
          >
            Close Status Window
          </button>
        </div>

      </div>
    </div>
  );
};
