import React, { useState } from 'react';
import { Upload, FileText, Send, Zap, AlertTriangle, Clock, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Assignment, EvaluationResultData } from '../types/evaluation';
import { api } from '../services/api';
import { LoadingSkeleton } from './LoadingSkeleton';
import { DemoModeModal } from './DemoModeModal';

interface SubmissionPortalProps {
  assignment: Assignment;
  onEvaluationComplete: (result: EvaluationResultData) => void;
  demoAnswers?: Record<string, string>;
  healthStatus?: any;
}

export const SubmissionPortal: React.FC<SubmissionPortalProps> = ({
  assignment,
  onEvaluationComplete,
  demoAnswers,
  healthStatus
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [evalMode, setEvalMode] = useState<'live' | 'demo'>('live');

  const [studentText, setStudentText] = useState(
    'TCP is a connection-oriented protocol. The client sends a SYN packet. The server responds with SYN-ACK. Finally, the client sends ACK to complete the connection.'
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState('STUDENT_101');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warmingNotice, setWarmingNotice] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const isModelReady = healthStatus?.models_loaded || healthStatus?.ai_engine === 'ready';

  const handleSelectDemoCase = (caseName: string, text: string) => {
    setStudentText(text);
    setActiveTab('text');
    setErrorMsg(null);
    setWarmingNotice(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Only PDF files are supported.');
        return;
      }
      setPdfFile(file);
      setErrorMsg(null);
      setWarmingNotice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWarmingNotice(null);

    // If Live Evaluation mode selected but models still warming up:
    if (evalMode === 'live' && !isModelReady) {
      setWarmingNotice("AI evaluation engine is still warming up. Please wait a moment.");
      return;
    }

    setIsEvaluating(true);

    try {
      // In Demo Mode, simulate instant cached response
      if (evalMode === 'demo') {
        setTimeout(async () => {
          try {
            let submission = await api.submitText({
              assignment_id: assignment.id,
              student_id: studentId,
              content: studentText
            });
            const result = await api.triggerEvaluation(submission.id);
            onEvaluationComplete(result);
          } catch (err: any) {
            // Fallback demo result structure if backend unavailable
            onEvaluationComplete({
              evaluation_id: 'demo_eval_001',
              submission_id: 'sub_demo_101',
              assignment_id: assignment.id,
              assignment_title: assignment.title,
              question: assignment.question,
              student_id: studentId,
              student_answer: studentText,
              total_score: 4.0,
              final_score: 4.0,
              max_score: 4.0,
              percentage: 100.0,
              processing_time: 0.12,
              sentences: [
                'TCP is a connection-oriented protocol.',
                'The client sends a SYN packet.',
                'The server responds with SYN-ACK.',
                'Finally, the client sends ACK to complete the connection.'
              ],
              criteria: [
                {
                  id: 'c1',
                  criterion_id: 'crit-1',
                  description: 'TCP is a connection-oriented protocol.',
                  max_marks: 1.0,
                  awarded_marks: 1.0,
                  semantic_score: 0.96,
                  entailment_score: 0.98,
                  contradiction_probability: 0.01,
                  lexical_score: 1.0,
                  status: 'ENTAILED',
                  evidence: { sentence_id: 0, text: 'TCP is a connection-oriented protocol.', similarity: 0.96, entailment: 0.98, contradiction: 0.01, status: 'entailed' },
                  missing_concepts: [],
                  keyword_stuffing_detected: false,
                  feedback: 'Fully entailed by answer.'
                }
              ],
              diagnostic_summary: 'Demo evaluation completed instantly.',
              created_at: new Date().toISOString()
            });
          } finally {
            setIsEvaluating(false);
          }
        }, 300);
        return;
      }

      // Live Evaluation Mode
      let submission: any;
      if (activeTab === 'text') {
        if (!studentText.trim()) {
          throw new Error('Please enter a student answer before evaluating.');
        }
        submission = await api.submitText({
          assignment_id: assignment.id,
          student_id: studentId,
          content: studentText
        });
      } else {
        if (!pdfFile) {
          throw new Error('Please select a PDF file to upload.');
        }
        const formData = new FormData();
        formData.append('assignment_id', assignment.id);
        formData.append('student_id', studentId);
        formData.append('file', pdfFile);

        submission = await api.submitPdf(formData);
      }

      const result = await api.triggerEvaluation(submission.id);
      onEvaluationComplete(result);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Evaluation failed.';
      if (detail.includes('warming up')) {
        setWarmingNotice("AI evaluation engine is still warming up. Please wait a moment.");
      } else {
        setErrorMsg(detail);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isEvaluating) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-forest-100 space-y-6 animate-fadeIn">
      
      {/* 1-Click Hackathon Demo Mode Header Banner */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-850 to-forest-950 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-white border border-forest-700/60 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-mint-500/20 text-mint-300 border border-mint-400/30">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-white">1-Click Hackathon Demo Mode</h4>
            <p className="text-xs font-sans text-emerald-200/80">Load pre-configured TCP test cases (Cases A–F) instantly without manual typing</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDemoModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Launch Demo Cases (A–F)</span>
        </button>
      </div>

      {/* Mode Selector: Demo Evaluation vs Live Local AI Evaluation */}
      <div className="flex items-center justify-between p-3.5 bg-forest-50/60 rounded-2xl border border-forest-100 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-forest-900 font-sans">Evaluation Engine Mode:</span>
          <span className="text-forest-500 font-mono text-[11px] hidden sm:inline">Choose inference pipeline</span>
        </div>

        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-forest-200 shadow-sm">
          <button
            type="button"
            onClick={() => { setEvalMode('live'); setWarmingNotice(null); }}
            className={`px-3 py-1.5 rounded-lg font-display font-semibold transition-all flex items-center space-x-1.5 ${
              evalMode === 'live'
                ? 'bg-forest-900 text-mint-300 shadow-sm'
                : 'text-forest-600 hover:text-forest-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Local AI Evaluation</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setEvalMode('demo'); setWarmingNotice(null); }}
            className={`px-3 py-1.5 rounded-lg font-display font-semibold transition-all flex items-center space-x-1.5 ${
              evalMode === 'demo'
                ? 'bg-mint-500 text-forest-950 shadow-sm'
                : 'text-forest-600 hover:text-forest-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Demo Evaluation (Instant)</span>
          </button>
        </div>
      </div>

      {/* Assignment Header Summary */}
      <div className="bg-forest-900 text-white border border-forest-800 rounded-2xl p-5 space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-forest-800 text-mint-300 border border-forest-700">
            {assignment.subject}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-200">
            Max Marks: {assignment.total_marks}
          </span>
        </div>
        <h3 className="text-xl font-display font-bold text-white tracking-tight">{assignment.title}</h3>
        <div className="text-xs font-sans text-emerald-100/90 bg-forest-950/60 p-3.5 rounded-xl border border-forest-800 leading-relaxed">
          <strong className="text-mint-300 font-semibold">Question: </strong>{assignment.question}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-forest-100 space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`pb-3 text-xs font-display font-bold flex items-center space-x-2 transition-colors border-b-2 ${
            activeTab === 'text'
              ? 'border-mint-500 text-forest-900 font-bold'
              : 'border-transparent text-forest-500 hover:text-forest-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text Answer Input</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pdf')}
          className={`pb-3 text-xs font-display font-bold flex items-center space-x-2 transition-colors border-b-2 ${
            activeTab === 'pdf'
              ? 'border-mint-500 text-forest-900 font-bold'
              : 'border-transparent text-forest-500 hover:text-forest-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF Document</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-56">
            <label className="block text-xs font-semibold text-forest-900 font-sans mb-1">
              Student ID / Roll Number
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full bg-forest-50/50 border border-forest-200 rounded-xl px-3.5 py-2 text-xs font-mono text-forest-900 focus:outline-none focus:border-mint-500"
            />
          </div>
        </div>

        {activeTab === 'text' ? (
          <div>
            <label className="block text-xs font-semibold text-forest-900 font-sans mb-2">
              Descriptive Answer Text
            </label>
            <textarea
              rows={6}
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="Paste student answer text here..."
              className="w-full bg-forest-50/30 border border-forest-200 rounded-2xl p-4 text-xs font-sans text-forest-900 focus:outline-none focus:border-mint-500 leading-relaxed"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-forest-900 font-sans mb-2">
              PDF Answer Sheet Upload
            </label>
            <div className="border-2 border-dashed border-forest-200 hover:border-mint-500 rounded-2xl p-8 text-center bg-forest-50/40 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload-input"
              />
              <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-2xl bg-mint-50 text-mint-700 border border-mint-100 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-display font-bold text-forest-900">
                  {pdfFile ? pdfFile.name : 'Click to select or Drag & Drop PDF'}
                </div>
                <div className="text-xs font-mono text-forest-500">
                  {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : 'PyMuPDF text extraction engine (Local CPU extraction)'}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Model Warming Notice Banner */}
        {warmingNotice && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 text-xs flex items-center space-x-3 shadow-sm animate-fadeIn">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 animate-spin" />
            <div className="flex-1">
              <strong className="font-bold block text-amber-950 font-display">AI Model Initializing</strong>
              <span>{warmingNotice} Switch to "Demo Evaluation (Instant)" to test UI immediately.</span>
            </div>
          </div>
        )}

        {/* Error Message Banner */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div className="flex-1">
              <strong className="font-bold block text-rose-950 font-display">Evaluation Notice</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isEvaluating}
            className="px-6 py-3 rounded-xl bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-bold text-xs shadow-md flex items-center space-x-2 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>{evalMode === 'demo' ? 'Evaluate Demo Answer (Instant)' : 'Evaluate Live Local AI'}</span>
          </button>
        </div>
      </form>

      {/* Demo Mode Modal */}
      <DemoModeModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectCase={handleSelectDemoCase}
      />

    </div>
  );
};
