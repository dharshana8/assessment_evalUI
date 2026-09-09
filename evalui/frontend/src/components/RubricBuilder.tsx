import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowRight, BookOpen, Layers } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);

  const [criteria, setCriteria] = useState<Array<{ description: string; max_marks: number }>>([
    { description: '', max_marks: 2.0 }
  ]);

  const handleAddCriterion = () => {
    setCriteria([...criteria, { description: '', max_marks: 2.0 }]);
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

  // STEP 4: Summary Calculations
  const criteriaCount = criteria.length;
  const totalMarks = criteria.reduce((sum, c) => sum + (Number(c.max_marks) || 0), 0);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      alert('Please fill in both Assignment Title and Question.');
      return;
    }

    const invalidCrit = criteria.some(c => !c.description.trim() || Number(c.max_marks) <= 0);
    if (invalidCrit) {
      alert('Please enter a valid description and positive mark for all rubric criteria.');
      return;
    }

    setIsSaving(true);
    try {
      const formattedCriteria = criteria.map(c => ({
        description: c.description.trim(),
        max_marks: Number(c.max_marks),
        keywords: []
      }));

      const created = await api.createAssignment({
        title: title.trim(),
        subject: subject.trim() || 'General',
        question: question.trim(),
        reference_answer: referenceAnswer.trim() || undefined,
        total_marks: totalMarks || 10,
        rubric_criteria: formattedCriteria
      });

      onAssignmentCreated(created);
    } catch (err: any) {
      alert('Failed to save assignment: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-canvas-border space-y-8 max-w-4xl mx-auto font-sans">
      
      {/* 5-Step Visual Wizard Navbar */}
      <div className="bg-forest-50/60 p-4 rounded-2xl border border-forest-100">
        <div className="flex items-center justify-between text-xs font-sans font-semibold text-forest-700 overflow-x-auto gap-2">
          <div className="flex items-center space-x-1.5 text-forest-900 font-bold whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-forest-900 text-white text-[10px] flex items-center justify-center font-mono">1</span>
            <span>Assignment Details</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-forest-300 flex-shrink-0" />
          
          <div className="flex items-center space-x-1.5 text-forest-900 font-bold whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-forest-900 text-white text-[10px] flex items-center justify-center font-mono">2</span>
            <span>Reference Answer</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-forest-300 flex-shrink-0" />

          <div className="flex items-center space-x-1.5 text-forest-900 font-bold whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-forest-900 text-white text-[10px] flex items-center justify-center font-mono">3</span>
            <span>Rubric</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-forest-300 flex-shrink-0" />

          <div className="flex items-center space-x-1.5 text-forest-900 font-bold whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-forest-900 text-white text-[10px] flex items-center justify-center font-mono">4</span>
            <span>Summary</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-forest-300 flex-shrink-0" />

          <div className="flex items-center space-x-1.5 text-mint-700 font-bold whitespace-nowrap">
            <span className="w-5 h-5 rounded-full bg-mint-500 text-forest-950 text-[10px] flex items-center justify-center font-mono">5</span>
            <span>Publish</span>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-display font-bold text-forest-900">Create & Publish Assignment</h2>
        <p className="text-xs text-forest-600 font-sans mt-1">
          Complete the 5-step form to set up assessment details, model answer, and evaluation rubric criteria.
        </p>
      </div>

      <form onSubmit={handlePublish} className="space-y-8">
        
        {/* STEP 1: Assignment Details */}
        <div className="space-y-4 pt-2 border-t border-forest-100">
          <h3 className="text-base font-display font-bold text-forest-900 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-forest-100 text-forest-800 text-xs font-mono font-bold">STEP 1</span>
            <span>Assignment Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-forest-900 font-sans mb-1.5">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full bg-white border border-forest-200 rounded-xl px-4 py-2.5 text-xs text-forest-900 focus:outline-none focus:border-mint-500 font-sans shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-forest-900 font-sans mb-1.5">
                Subject / Topic *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject or course code..."
                className="w-full bg-white border border-forest-200 rounded-xl px-4 py-2.5 text-xs text-forest-900 focus:outline-none focus:border-mint-500 font-sans shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-forest-900 font-sans mb-1.5">
              Descriptive Question Prompt *
            </label>
            <textarea
              required
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type descriptive assessment question prompt..."
              className="w-full bg-white border border-forest-200 rounded-xl p-3.5 text-xs text-forest-900 focus:outline-none focus:border-mint-500 font-sans shadow-sm"
            />
          </div>
        </div>

        {/* STEP 2: Reference Answer */}
        <div className="space-y-4 pt-4 border-t border-forest-100">
          <h3 className="text-base font-display font-bold text-forest-900 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-forest-100 text-forest-800 text-xs font-mono font-bold">STEP 2</span>
            <span>Reference Answer</span>
          </h3>
          <p className="text-xs text-forest-600 font-sans">
            Provide the official model/reference answer used by the local NLP engine for semantic entailment verification.
          </p>

          <textarea
            rows={4}
            value={referenceAnswer}
            onChange={(e) => setReferenceAnswer(e.target.value)}
            placeholder="Type or paste model reference answer..."
            className="w-full bg-white border border-forest-200 rounded-xl p-3.5 text-xs text-forest-900 focus:outline-none focus:border-mint-500 font-sans shadow-sm"
          />
        </div>

        {/* STEP 3: Rubric */}
        <div className="space-y-4 pt-4 border-t border-forest-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-bold text-forest-900 flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-forest-100 text-forest-800 text-xs font-mono font-bold">STEP 3</span>
              <span>Rubric Criteria</span>
            </h3>
            <button
              type="button"
              onClick={handleAddCriterion}
              className="px-3 py-1.5 rounded-xl bg-mint-50 hover:bg-mint-100 text-forest-900 border border-mint-200 text-xs font-display font-semibold flex items-center space-x-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Criterion</span>
            </button>
          </div>

          <div className="space-y-3">
            {criteria.map((crit, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-forest-50/40 border border-forest-100 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest-900 text-white text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  
                  {/* Criterion Description */}
                  <input
                    type="text"
                    required
                    placeholder="Criterion description..."
                    value={crit.description}
                    onChange={(e) => handleCriterionChange(idx, 'description', e.target.value)}
                    className="flex-1 bg-white border border-forest-200 rounded-xl px-3.5 py-2 text-xs text-forest-900 focus:outline-none focus:border-mint-500 font-sans shadow-sm"
                  />

                  {/* Marks */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-sans text-forest-700 font-semibold">Marks:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={crit.max_marks}
                      onChange={(e) => handleCriterionChange(idx, 'max_marks', parseFloat(e.target.value))}
                      className="w-20 bg-white border border-forest-200 rounded-xl px-3 py-1.5 text-xs text-forest-900 focus:outline-none focus:border-mint-500 font-mono font-bold shadow-sm"
                    />
                  </div>

                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(idx)}
                      className="p-2 rounded-xl text-forest-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 4: Summary */}
        <div className="space-y-4 pt-4 border-t border-forest-100">
          <h3 className="text-base font-display font-bold text-forest-900 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-forest-100 text-forest-800 text-xs font-mono font-bold">STEP 4</span>
            <span>Summary</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-forest-50/60 rounded-2xl border border-forest-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-mint-50 text-mint-700 rounded-xl border border-mint-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-forest-500 uppercase block">Number of Criteria</span>
                  <span className="text-lg font-display font-bold text-forest-900">{criteriaCount} Criteria</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-forest-50/60 rounded-2xl border border-forest-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-forest-100 text-forest-800 rounded-xl border border-forest-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-forest-500 uppercase block">Total Assignment Marks</span>
                  <span className="text-lg font-display font-bold text-forest-900">{totalMarks} Marks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 5: Create / Publish Assignment */}
        <div className="pt-6 border-t border-forest-100 flex items-center justify-between">
          <div className="text-xs text-forest-600 font-sans">
            <span className="font-bold text-forest-900">STEP 5:</span> Review and publish this assignment to the local evaluation repository.
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-xs shadow-md flex items-center space-x-2 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Publishing...' : 'Create / Publish Assignment'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
