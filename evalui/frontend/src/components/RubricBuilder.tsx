import React, { useState } from 'react';
import { Plus, Trash2, Save, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Assignment } from '../types/evaluation';
import { api } from '../services/api';

interface RubricBuilderProps {
  onAssignmentCreated: (assignment: Assignment) => void;
}

export const RubricBuilder: React.FC<RubricBuilderProps> = ({ onAssignmentCreated }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [referenceAnswer, setReferenceAnswer] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(10);
  const [isSaving, setIsSaving] = useState(false);

  const [criteria, setCriteria] = useState<Array<{ description: string; max_marks: number; keywords_str: string }>>([
    { description: '', max_marks: 2.0, keywords_str: '' }
  ]);

  const handleAddCriterion = () => {
    setCriteria([...criteria, { description: '', max_marks: 2.0, keywords_str: '' }]);
  };

  const handleRemoveCriterion = (index: number) => {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (index: number, field: string, value: any) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  // Auto-calculate sum of criteria max marks if criteria changes
  const criteriaSumMarks = criteria.reduce((sum, c) => sum + (Number(c.max_marks) || 0), 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      alert('Please fill in both Assignment Title and Question.');
      return;
    }

    setIsSaving(true);
    try {
      const formattedCriteria = criteria.map(c => ({
        description: c.description.trim(),
        max_marks: Number(c.max_marks),
        keywords: c.keywords_str ? c.keywords_str.split(',').map(k => k.trim()).filter(Boolean) : []
      }));

      // Append Reference Answer to Question body if provided
      const fullQuestionText = referenceAnswer.trim()
        ? `${question.trim()}\n\n[Reference Answer / Gold Standard]\n${referenceAnswer.trim()}`
        : question.trim();

      const created = await api.createAssignment({
        title: title.trim(),
        subject: subject.trim() || 'General',
        question: fullQuestionText,
        total_marks: Number(totalMarks) || criteriaSumMarks || 10,
        rubric_criteria: formattedCriteria.filter(c => c.description.length > 0)
      });

      onAssignmentCreated(created);
    } catch (err: any) {
      alert('Failed to save assignment: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-canvas-border space-y-8 max-w-4xl mx-auto">
      
      {/* Visual Workflow Steps Bar */}
      <div className="bg-canvas-subtle p-4 rounded-2xl border border-canvas-border">
        <div className="flex items-center justify-between text-xs font-sans font-semibold text-slate-700 overflow-x-auto gap-2">
          <div className="flex items-center space-x-1.5 text-forest-700 font-bold whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-forest-900 text-white text-[10px] flex items-center justify-center font-mono">1</span>
            <span>Question Details</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <div className="flex items-center space-x-1.5 text-slate-700 whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono">2</span>
            <span>Reference Answer</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <div className="flex items-center space-x-1.5 text-slate-700 whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono">3</span>
            <span>Rubric Criteria</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <div className="flex items-center space-x-1.5 text-slate-700 whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono">4</span>
            <span>Marks</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-display-md font-display font-bold text-slate-900">Create New Assignment & Rubric</h2>
        <p className="text-body font-sans text-slate-500 mt-1">
          Specify your question, model reference answer, and evaluation rubric criteria for AI scoring.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* STEP 1: Question / Assignment Details */}
        <div className="space-y-4 pt-2 border-t border-canvas-border">
          <h3 className="text-heading font-display font-bold text-slate-900 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-forest-100 text-forest-800 text-xs font-mono font-bold">STEP 1</span>
            <span>Question & Assignment Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-caption font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Computer Networks Assessment 1"
                className="w-full bg-canvas-subtle/50 border border-canvas-border rounded-xl px-4 py-2.5 text-body text-slate-900 focus:outline-none focus:border-mint-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-caption font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject / Topic
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="w-full bg-canvas-subtle/50 border border-canvas-border rounded-xl px-4 py-2.5 text-body text-slate-900 focus:outline-none focus:border-mint-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-caption font-sans font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descriptive Question *
            </label>
            <textarea
              required
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the assessment question..."
              className="w-full bg-canvas-subtle/50 border border-canvas-border rounded-xl p-3.5 text-body text-slate-900 focus:outline-none focus:border-mint-500 font-sans"
            />
          </div>
        </div>

        {/* STEP 2: Reference Answer */}
        <div className="space-y-4 pt-4 border-t border-canvas-border">
          <h3 className="text-heading font-display font-bold text-slate-900 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-forest-100 text-forest-800 text-xs font-mono font-bold">STEP 2</span>
            <span>Model / Reference Answer</span>
          </h3>
          <p className="text-xs text-slate-500">
            Provide the tutor reference solution used to evaluate student semantic similarity and coverage.
          </p>

          <textarea
            rows={4}
            value={referenceAnswer}
            onChange={(e) => setReferenceAnswer(e.target.value)}
            placeholder="Type or paste the ideal reference answer for this question..."
            className="w-full bg-canvas-subtle/50 border border-canvas-border rounded-xl p-3.5 text-body text-slate-900 focus:outline-none focus:border-mint-500 font-sans"
          />
        </div>

        {/* STEP 3 & 4: Rubric Criteria & Maximum Marks */}
        <div className="space-y-4 pt-4 border-t border-canvas-border">
          <div className="flex items-center justify-between">
            <h3 className="text-heading font-display font-bold text-slate-900 flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-forest-100 text-forest-800 text-xs font-mono font-bold">STEP 3 & 4</span>
              <span>Rubric Criteria & Marks</span>
            </h3>
            <button
              type="button"
              onClick={handleAddCriterion}
              className="px-3 py-1.5 rounded-xl bg-mint-50 hover:bg-mint-100 text-forest-900 border border-mint-200 text-caption font-display font-semibold flex items-center space-x-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Criterion</span>
            </button>
          </div>

          <div className="space-y-3">
            {criteria.map((crit, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-canvas-subtle/40 border border-canvas-border space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-900 text-white text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Criterion description (e.g. Explains SYN-ACK exchange protocol)"
                    value={crit.description}
                    onChange={(e) => handleCriterionChange(idx, 'description', e.target.value)}
                    className="flex-1 bg-white border border-canvas-border rounded-xl px-3.5 py-2 text-body text-slate-900 focus:outline-none focus:border-mint-500 font-sans"
                  />
                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                  <div>
                    <input
                      type="text"
                      placeholder="Expected keywords (e.g. SYN, ACK, handshake)"
                      value={crit.keywords_str}
                      onChange={(e) => handleCriterionChange(idx, 'keywords_str', e.target.value)}
                      className="w-full bg-white border border-canvas-border rounded-xl px-3.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-mint-500 font-sans"
                    />
                  </div>
                  <div className="flex items-center space-x-2 justify-end">
                    <span className="text-xs font-sans text-slate-600">Criterion Marks:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={crit.max_marks}
                      onChange={(e) => handleCriterionChange(idx, 'max_marks', parseFloat(e.target.value))}
                      className="w-20 bg-white border border-canvas-border rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-mint-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Marks Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-forest-50 border border-forest-100">
            <span className="text-xs font-sans font-bold text-forest-900">
              Total Assignment Marks (Rubric Sum: {criteriaSumMarks})
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-forest-700 font-semibold">Total:</span>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 0)}
                className="w-24 bg-white border border-forest-200 rounded-xl px-3 py-1.5 text-xs text-forest-900 font-mono font-bold focus:outline-none focus:border-mint-500"
              />
            </div>
          </div>
        </div>

        {/* STEP 5: Save & Publish */}
        <div className="pt-4 border-t border-canvas-border flex items-center justify-between">
          <div className="text-xs text-slate-500 font-sans">
            Tutor controls all reference criteria and evaluation mark weightages.
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-body shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Assignment...' : 'Save & Publish Assignment'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
