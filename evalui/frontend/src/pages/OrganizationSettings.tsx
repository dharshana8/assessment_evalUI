import React, { useState } from 'react';
import { 
  Building2, 
  Sliders, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Info,
  AlertTriangle,
  Lock,
  Code2,
  Sparkles
} from 'lucide-react';
import { User } from '../types/auth';

interface OrganizationSettingsProps {
  user: User | null;
}

export const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ user }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [orgDomain, setOrgDomain] = useState(user?.email.split('@')[1] || 'sece.ac.in');
  const [studentPattern, setStudentPattern] = useState('^[a-z]+(\\.s\\d{4})?([a-z]+)@sece\\.ac\\.in$');
  const [facultyPattern, setFacultyPattern] = useState('^[a-z]+(\\.[a-z]+)?@sece\\.ac\\.in$');

  const [departments, setDepartments] = useState([
    'Computer Science & Business Systems (CSBS)',
    'Artificial Intelligence & Data Science (AIDS)',
    'Computer Science & Engineering (CSE)',
    'Electronics & Communication Engineering (ECE)',
  ]);
  const [newDept, setNewDept] = useState('');

  const [batches, setBatches] = useState(['2024', '2023', '2022', '2021']);
  const [newBatch, setNewBatch] = useState('');

  // AI Guardrail Threshold State
  const [contradictionZeroMarks, setContradictionZeroMarks] = useState(true);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.45);
  const [selectedNliModel, setSelectedNliModel] = useState('nli-deberta-v3-small');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddDept = () => {
    if (newDept.trim()) {
      setDepartments([...departments, newDept.trim()]);
      setNewDept('');
    }
  };

  const handleRemoveDept = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const handleAddBatch = () => {
    if (newBatch.trim()) {
      setBatches([...batches, newBatch.trim()]);
      setNewBatch('');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-forest-50/40 min-h-screen">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-forest-900 tracking-tight">
            Organization Settings & AI Rules
          </h1>
          <p className="text-xs md:text-sm text-forest-600 font-sans mt-1">
            Configure institutional email domain schemas, department codes, and AI evaluation guardrails.
          </p>
        </div>

        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-forest-950" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save Organization Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Main Settings Panels */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Panel 1: Institutional Email Identity Parser Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-forest-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-forest-50 text-forest-700 rounded-xl border border-forest-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-forest-900">
                    Institutional Email Schema & Domain Rules
                  </h3>
                  <p className="text-xs text-forest-600 font-sans">
                    Zero-dropdown login identity parser parameters for {user?.organization_name || 'SECE'}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-mint-100 text-mint-800 rounded-full text-xs font-mono font-semibold border border-mint-200">
                Auto-Identity
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-forest-900 font-sans block mb-1">
                  Primary Organization Email Domain
                </label>
                <input
                  type="text"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-forest-50/50 border border-forest-200 rounded-xl text-xs font-mono text-forest-900 focus:outline-none focus:border-mint-500"
                  placeholder="e.g. sece.ac.in"
                />
                <p className="text-[11px] text-forest-500 mt-1 font-sans">
                  Users logging in with @{orgDomain} are automatically mapped into this organization workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-forest-900 font-sans block mb-1">
                    Student Email Parsing Pattern (Regex)
                  </label>
                  <input
                    type="text"
                    value={studentPattern}
                    onChange={(e) => setStudentPattern(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-forest-50/50 border border-forest-200 rounded-xl text-xs font-mono text-forest-900 focus:outline-none focus:border-mint-500"
                  />
                  <p className="text-[10px] text-emerald-700 font-mono mt-1">
                    Example match: name.s2024csbs@sece.ac.in
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-forest-900 font-sans block mb-1">
                    Faculty Email Parsing Pattern (Regex)
                  </label>
                  <input
                    type="text"
                    value={facultyPattern}
                    onChange={(e) => setFacultyPattern(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-forest-50/50 border border-forest-200 rounded-xl text-xs font-mono text-forest-900 focus:outline-none focus:border-mint-500"
                  />
                  <p className="text-[10px] text-emerald-700 font-mono mt-1">
                    Example match: dharshana@sece.ac.in
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Department & Batch Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-6">
            <div className="flex items-center space-x-3 border-b border-forest-100 pb-4">
              <div className="p-2.5 bg-mint-50 text-mint-700 rounded-xl border border-mint-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-forest-900">
                  Departments & Batches
                </h3>
                <p className="text-xs text-forest-600 font-sans">
                  Structure your institution's academic branches and active student batches
                </p>
              </div>
            </div>

            {/* Departments */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-forest-900 font-sans block">
                Active Departments ({departments.length})
              </label>
              <div className="space-y-2">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-forest-50/60 rounded-xl border border-forest-100 text-xs font-sans">
                    <span className="font-medium text-forest-900">{dept}</span>
                    <button
                      onClick={() => handleRemoveDept(index)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="New Department Name (e.g. Information Technology - IT)"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white border border-forest-200 rounded-xl text-xs text-forest-900 focus:outline-none focus:border-mint-500"
                />
                <button
                  onClick={handleAddDept}
                  className="px-4 py-2 bg-forest-800 hover:bg-forest-700 text-white font-display font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Batches */}
            <div className="space-y-3 pt-2 border-t border-forest-100">
              <label className="text-xs font-semibold text-forest-900 font-sans block">
                Active Academic Batches
              </label>
              <div className="flex flex-wrap gap-2">
                {batches.map((batch, index) => (
                  <span key={index} className="px-3 py-1.5 bg-forest-100 text-forest-800 rounded-xl text-xs font-mono font-semibold border border-forest-200 flex items-center space-x-2">
                    <span>Batch {batch}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 3: Explainable AI Evaluation & Guardrails */}
          <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-6">
            <div className="flex items-center space-x-3 border-b border-forest-100 pb-4">
              <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-forest-900">
                  AI Evaluation Guardrails & NLP Engine Settings
                </h3>
                <p className="text-xs text-forest-600 font-sans">
                  Fine-tune NLI contradiction rules, semantic similarity cutoffs, and local embedding models
                </p>
              </div>
            </div>

            <div className="space-y-5">
              
              {/* Contradiction Guardrail Toggle */}
              <div className="flex items-start justify-between p-4 bg-forest-50/60 rounded-2xl border border-forest-100">
                <div className="space-y-1 max-w-md">
                  <h4 className="text-xs font-display font-bold text-forest-900">
                    Strict NLI Contradiction Zero-Score Guardrail (Case B Protection)
                  </h4>
                  <p className="text-[11px] text-forest-600 font-sans leading-relaxed">
                    When enabled, if the answer directly contradicts key reference concepts (e.g., negates a factual assertion like "does not require"), the criteria score is set to 0 regardless of semantic similarity.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input 
                    type="checkbox" 
                    checked={contradictionZeroMarks} 
                    onChange={(e) => setContradictionZeroMarks(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-forest-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-forest-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint-500"></div>
                </label>
              </div>

              {/* Semantic Similarity Slider */}
              <div className="space-y-2 p-4 bg-forest-50/60 rounded-2xl border border-forest-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-display font-bold text-forest-900">
                    Minimum Semantic Similarity Cutoff
                  </h4>
                  <span className="text-xs font-mono font-bold text-mint-700 bg-mint-100 px-2 py-0.5 rounded border border-mint-200">
                    {similarityThreshold} ({Math.round(similarityThreshold * 100)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  className="w-full accent-mint-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-forest-500">
                  <span>0.20 (Lenient)</span>
                  <span>0.45 (Recommended Default)</span>
                  <span>0.80 (Strict)</span>
                </div>
              </div>

              {/* Model Choice */}
              <div>
                <label className="text-xs font-semibold text-forest-900 font-sans block mb-1">
                  Local NLP NLI Transformer Model
                </label>
                <select
                  value={selectedNliModel}
                  onChange={(e) => setSelectedNliModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-forest-50/50 border border-forest-200 rounded-xl text-xs font-mono text-forest-900 focus:outline-none focus:border-mint-500"
                >
                  <option value="nli-deberta-v3-small">cross-encoder/nli-deberta-v3-small (Fastest • Local CPU)</option>
                  <option value="nli-roberta-base">cross-encoder/nli-roberta-base (Balanced)</option>
                  <option value="all-MiniLM-L6-v2">sentence-transformers/all-MiniLM-L6-v2 (Embedding Only)</option>
                </select>
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Column: Multi-Tenant Key & Help */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-forest-100 shadow-card space-y-4">
            <h3 className="text-sm font-display font-bold text-forest-900 uppercase tracking-wider">
              Tenant Security & API Key
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-forest-500 uppercase block">Tenant Organization ID</span>
                <code className="text-xs font-mono font-semibold text-forest-900 bg-forest-50 px-2.5 py-1 rounded block mt-1 border border-forest-100">
                  {user?.organization_id || 'org_sece_7329'}
                </code>
              </div>

              <div>
                <span className="text-[10px] font-mono text-forest-500 uppercase block">Secret Evaluation Key</span>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="password"
                    readOnly
                    value="sk_evalui_live_994827104928"
                    className="flex-1 px-3 py-1.5 bg-forest-50 border border-forest-200 rounded-lg text-xs font-mono text-forest-700"
                  />
                  <button className="p-1.5 bg-forest-100 text-forest-700 rounded-lg hover:bg-forest-200 transition-colors text-xs font-sans font-medium">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-forest-900 to-forest-950 p-6 rounded-2xl text-white border border-forest-800 shadow-lg space-y-3">
            <div className="flex items-center space-x-2 text-mint-400">
              <Sparkles className="w-5 h-5" />
              <h4 className="text-sm font-display font-bold text-white">Explainable AI Promise</h4>
            </div>
            <p className="text-xs text-emerald-100/80 font-sans leading-relaxed">
              EvalUI's offline NLP models ensure 100% data privacy. No student submission leaves your institution's infrastructure.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
