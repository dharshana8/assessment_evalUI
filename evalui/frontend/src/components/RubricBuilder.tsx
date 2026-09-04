import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Assignment } from '../types/evaluation';
import { api } from '../services/api';

interface RubricBuilderProps {
  onAssignmentCreated: (assignment: Assignment) => void;
}

export const RubricBuilder: React.FC<RubricBuilderProps> = ({ onAssignmentCreated }) => {
  const [title, setTitle] = useState('Computer Networks Internal Assessment');
  const [subject, setSubject] = useState('Computer Networks');
  const [question, setQuestion] = useState('Explain the TCP three-way handshake.');
  const [totalMarks, setTotalMarks] = useState(4.0);
  const [isSaving, setIsSaving] = useState(false);

  const [criteria, setCriteria] = useState<Array<{ description: string; max_marks: number; keywords_str: string }>>([
    { description: 'TCP is a connection-oriented protocol.', max_marks: 1.0, keywords_str: 'connection-oriented' },
    { description: 'Client sends SYN to initiate communication.', max_marks: 1.0, keywords_str: 'SYN' },
    { description: 'Server responds with SYN-ACK.', max_marks: 1.0, keywords_str: 'SYN-ACK' },
    { description: 'Client sends ACK to complete the handshake.', max_marks: 1.0, keywords_str: 'ACK' }
  ]);

  const handleAddCriterion = () => {
    setCriteria([...criteria, { description: '', max_marks: 1.0, keywords_str: '' }]);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formattedCriteria = criteria.map(c => ({
        description: c.description.trim(),
        max_marks: Number(c.max_marks),
        keywords: c.keywords_str.split(',').map(k => k.trim()).filter(Boolean)
      }));

      const created = await api.createAssignment({
        title,
        subject,
        question,
        total_marks: Number(totalMarks),
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
    <div className="glass-panel rounded-3xl p-6 shadow-2xl border border-neutral/30 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral/20">
        <div>
          <h2 className="text-display-lg font-display font-semibold text-white">Create New Assignment & Rubric</h2>
          <p className="text-body font-sans text-neutral mt-1">
            Define atomic criteria and mandatory concepts for explainable AI scoring
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-caption font-sans font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Computer Networks Internal Assessment"
              className="w-full bg-brand-navy border border-neutral/40 rounded-xl px-4 py-2.5 text-body text-white focus:outline-none focus:border-brand-light font-sans"
            />
          </div>

          <div>
            <label className="block text-caption font-sans font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Subject Name
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Networks"
              className="w-full bg-brand-navy border border-neutral/40 rounded-xl px-4 py-2.5 text-body text-white focus:outline-none focus:border-brand-light font-sans"
            />
          </div>

          <div>
            <label className="block text-caption font-sans font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Total Assignment Marks
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              required
              value={totalMarks}
              onChange={(e) => setTotalMarks(parseFloat(e.target.value))}
              className="w-full bg-brand-navy border border-neutral/40 rounded-xl px-4 py-2.5 text-body text-white focus:outline-none focus:border-brand-light font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-caption font-sans font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Descriptive Question
          </label>
          <textarea
            required
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type the descriptive assessment question..."
            className="w-full bg-brand-navy border border-neutral/40 rounded-xl p-3.5 text-body text-white focus:outline-none focus:border-brand-light font-sans"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading font-display font-semibold text-brand-light flex items-center space-x-2">
              <span>Atomic Rubric Criteria</span>
              <span className="text-caption font-mono px-2 py-0.5 rounded bg-brand-navy border border-neutral/30 text-neutral">
                {criteria.length} Criteria
              </span>
            </h3>
            <button
              type="button"
              onClick={handleAddCriterion}
              className="px-3.5 py-1.5 rounded-xl bg-brand/30 hover:bg-brand text-brand-lighter hover:text-white border border-brand-light/30 text-label font-display font-semibold flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Criterion</span>
            </button>
          </div>

          <div className="space-y-4">
            {criteria.map((crit, idx) => (
              <div key={idx} className="bg-brand-navy/60 border border-neutral/30 rounded-2xl p-4 transition-all hover:border-neutral">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-brand text-white text-caption font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Criterion statement (e.g. TCP is connection-oriented)"
                        value={crit.description}
                        onChange={(e) => handleCriterionChange(idx, 'description', e.target.value)}
                        className="flex-1 bg-brand-navy border border-neutral/30 rounded-xl px-3 py-2 text-body text-white focus:outline-none focus:border-brand-light font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                      <div>
                        <input
                          type="text"
                          placeholder="Keywords (comma separated, e.g. SYN, SYN-ACK)"
                          value={crit.keywords_str}
                          onChange={(e) => handleCriterionChange(idx, 'keywords_str', e.target.value)}
                          className="w-full bg-brand-navy border border-neutral/30 rounded-xl px-3 py-2 text-caption text-slate-300 focus:outline-none focus:border-brand-light font-sans"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-caption font-sans text-neutral">Max Marks:</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          required
                          value={crit.max_marks}
                          onChange={(e) => handleCriterionChange(idx, 'max_marks', parseFloat(e.target.value))}
                          className="w-24 bg-brand-navy border border-neutral/30 rounded-xl px-3 py-2 text-caption text-white focus:outline-none focus:border-brand-light font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(idx)}
                      className="p-2 rounded-xl text-neutral hover:text-danger-text hover:bg-danger-bg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Save Button in brand teal */}
        <div className="pt-4 border-t border-neutral/20 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3.5 rounded-xl bg-brand hover:bg-brand-light text-white hover:text-brand-navy font-display font-semibold text-heading shadow-lg flex items-center space-x-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving Assignment...' : 'Save Assignment & Rubric'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
