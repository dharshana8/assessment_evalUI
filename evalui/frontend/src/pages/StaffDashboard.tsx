import React from 'react';
import { 
  FileText, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Calendar, 
  MoreHorizontal, 
  ShieldCheck, 
  BarChart2, 
  Cpu, 
  HelpCircle,
  Headphones,
  ArrowUpRight,
  Send,
  Download
} from 'lucide-react';
import { Assignment } from '../types/evaluation';
import { User } from '../types/auth';

interface StaffDashboardProps {
  user: User | null;
  assignments: Assignment[];
  onSelectAssignment: (assignment: Assignment) => void;
  onNavigate: (tab: string) => void;
  onLaunchDemo: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  user,
  assignments,
  onSelectAssignment,
  onNavigate,
  onLaunchDemo
}) => {
  const staffName = user?.name || 'Dr. Dharshana';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn font-sans bg-canvas">
      
      {/* Header Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display-lg font-display font-bold text-slate-900 flex items-center space-x-2">
            <span>Good Morning, {staffName}!</span>
            <span>👋</span>
          </h1>
          <p className="text-body font-sans text-slate-500 mt-0.5">
            Here's an overview of your teaching and evaluation activities.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Quote Pill */}
          <div className="hidden lg:block bg-white border border-canvas-border px-4 py-2 rounded-2xl shadow-card text-caption text-slate-600 italic">
            "Better assessments create brighter learners." <span className="text-forest-700 font-semibold font-sans">— EvalUI</span>
          </div>

          {/* Date Card */}
          <div className="bg-white border border-canvas-border px-4 py-2 rounded-2xl shadow-card flex items-center space-x-3 text-left">
            <div className="p-2 rounded-xl bg-mint-50 text-forest-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Wednesday</div>
              <div className="text-body font-display font-bold text-slate-900">03 September 2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat Card 1 */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-mint-50 text-forest-700 w-fit mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">6</div>
            <div className="text-body font-sans font-medium text-slate-600">My Assignments</div>
            <div className="text-caption font-sans text-forest-700 font-semibold mt-1">+2 this month</div>
          </div>
          <button onClick={() => onNavigate('my-assignments')} className="text-slate-400 group-hover:text-forest-700 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 w-fit mb-3">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">142</div>
            <div className="text-body font-sans font-medium text-slate-600">Total Submissions</div>
            <div className="text-caption font-sans text-forest-700 font-semibold mt-1">+28 this week</div>
          </div>
          <button onClick={() => onNavigate('submissions')} className="text-slate-400 group-hover:text-blue-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 w-fit mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">118</div>
            <div className="text-body font-sans font-medium text-slate-600">Evaluated</div>
            <div className="text-caption font-sans text-purple-700 font-semibold mt-1">83% completion</div>
          </div>
          <button onClick={() => onNavigate('evaluations')} className="text-slate-400 group-hover:text-purple-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white border border-canvas-border rounded-3xl p-5 shadow-card hover:shadow-panel transition-all group flex justify-between items-start">
          <div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 w-fit mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-display-lg font-display font-bold text-slate-900">76%</div>
            <div className="text-body font-sans font-medium text-slate-600">Average Class Score</div>
            <div className="text-caption font-sans text-forest-700 font-semibold mt-1">+6% from last month</div>
          </div>
          <button onClick={() => onNavigate('reports')} className="text-slate-400 group-hover:text-amber-600 p-1">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Recent Assignments & Performance */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recent Assignments Table Card */}
          <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-heading font-display font-bold text-slate-900">Recent Assignments</h2>
              <div className="flex items-center space-x-3">
                <button onClick={() => onNavigate('my-assignments')} className="text-caption font-sans font-semibold text-forest-700 hover:underline">
                  View All &rarr;
                </button>
                <button
                  onClick={() => onNavigate('create-assignment')}
                  className="px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-display font-semibold text-caption flex items-center space-x-1 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Assignment</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body">
                <thead className="bg-canvas-subtle text-slate-500 font-sans text-caption uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Title</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Class</th>
                    <th className="p-3.5">Submissions</th>
                    <th className="p-3.5">Evaluated</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-border font-sans text-slate-700">
                  <tr className="hover:bg-canvas-subtle/50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900 font-display">TCP Three-Way Handshake</td>
                    <td className="p-3.5 text-caption">Computer Networks</td>
                    <td className="p-3.5 text-caption font-mono">II CSBS</td>
                    <td className="p-3.5 font-mono">42</td>
                    <td className="p-3.5 font-mono text-forest-700 font-semibold">38 (90%)</td>
                    <td className="p-3.5">
                      <span className="text-caption font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        In Progress
                      </span>
                    </td>
                    <td className="p-3.5 text-caption text-slate-500">Sep 10, 2025</td>
                    <td className="p-3.5 text-right">
                      <button onClick={onLaunchDemo} className="p-1 text-slate-400 hover:text-forest-700">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-canvas-subtle/50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900 font-display">Normalization in DBMS</td>
                    <td className="p-3.5 text-caption">DBMS</td>
                    <td className="p-3.5 text-caption font-mono">II CSE</td>
                    <td className="p-3.5 font-mono">38</td>
                    <td className="p-3.5 font-mono text-forest-700 font-semibold">38 (100%)</td>
                    <td className="p-3.5">
                      <span className="text-caption font-semibold px-2.5 py-0.5 rounded-full bg-mint-100 text-forest-800 border border-mint-300">
                        Completed
                      </span>
                    </td>
                    <td className="p-3.5 text-caption text-slate-500">Aug 28, 2025</td>
                    <td className="p-3.5 text-right">
                      <button className="p-1 text-slate-400 hover:text-forest-700">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-canvas-subtle/50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900 font-display">SDLC Models</td>
                    <td className="p-3.5 text-caption">Software Eng.</td>
                    <td className="p-3.5 text-caption font-mono">III CSBS</td>
                    <td className="p-3.5 font-mono">51</td>
                    <td className="p-3.5 font-mono text-forest-700 font-semibold">37 (73%)</td>
                    <td className="p-3.5">
                      <span className="text-caption font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        In Progress
                      </span>
                    </td>
                    <td className="p-3.5 text-caption text-slate-500">Aug 25, 2025</td>
                    <td className="p-3.5 text-right">
                      <button className="p-1 text-slate-400 hover:text-forest-700">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-canvas-subtle/50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900 font-display">OOP Concepts</td>
                    <td className="p-3.5 text-caption">Python Prog.</td>
                    <td className="p-3.5 text-caption font-mono">I CSBS</td>
                    <td className="p-3.5 font-mono">28</td>
                    <td className="p-3.5 font-mono text-forest-700 font-semibold">28 (100%)</td>
                    <td className="p-3.5">
                      <span className="text-caption font-semibold px-2.5 py-0.5 rounded-full bg-mint-100 text-forest-800 border border-mint-300">
                        Completed
                      </span>
                    </td>
                    <td className="p-3.5 text-caption text-slate-500">Aug 20, 2025</td>
                    <td className="p-3.5 text-right">
                      <button className="p-1 text-slate-400 hover:text-forest-700">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Split Row: Class Performance Donut & Recent Submissions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Class Performance Donut Card */}
            <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-heading font-display font-bold text-slate-900">Class Performance</h3>
              
              <div className="flex items-center justify-between pt-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* SVG Donut */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path strokeDasharray="24, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#047857" strokeWidth="4" />
                    <path strokeDasharray="41, 100" strokeDashoffset="-24" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#34d399" strokeWidth="4" />
                    <path strokeDasharray="22, 100" strokeDashoffset="-65" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef9f27" strokeWidth="4" />
                    <path strokeDasharray="13, 100" strokeDashoffset="-87" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e24b4a" strokeWidth="4" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-display-md font-display font-bold text-slate-900">118</div>
                    <div className="text-caption font-sans text-slate-500">Students</div>
                  </div>
                </div>

                <div className="space-y-2 text-caption font-sans">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-forest-700"></span>
                    <span className="text-slate-700">Excellent (&ge; 90%)</span>
                    <span className="font-bold text-slate-900 ml-auto">24%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-mint-400"></span>
                    <span className="text-slate-700">Good (70–89%)</span>
                    <span className="font-bold text-slate-900 ml-auto">41%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-partial"></span>
                    <span className="text-slate-700">Average (50–69%)</span>
                    <span className="font-bold text-slate-900 ml-auto">22%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-danger"></span>
                    <span className="text-slate-700">Below Average (&lt; 50%)</span>
                    <span className="font-bold text-slate-900 ml-auto">13%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Submissions List */}
            <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-heading font-display font-bold text-slate-900">Recent Submissions</h3>
                <button onClick={() => onNavigate('submissions')} className="text-caption font-sans font-semibold text-forest-700 hover:underline">
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-3">
                <div onClick={onLaunchDemo} className="p-3 rounded-2xl bg-canvas-subtle/60 border border-canvas-border hover:border-forest-700/50 cursor-pointer transition-all flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">A</div>
                    <div>
                      <div className="text-body font-semibold text-slate-900">Arjun S.</div>
                      <div className="text-caption text-slate-500">TCP Handshake</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-body font-mono font-bold text-forest-700">3.5 / 4</div>
                    <div className="text-[10px] text-slate-400">2 hours ago</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-canvas-subtle/60 border border-canvas-border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-mint-100 text-forest-800 font-bold text-xs flex items-center justify-center">P</div>
                    <div>
                      <div className="text-body font-semibold text-slate-900">Priya M.</div>
                      <div className="text-caption text-slate-500">Normalization</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-body font-mono font-bold text-forest-700">8 / 10</div>
                    <div className="text-[10px] text-slate-400">5 hours ago</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-canvas-subtle/60 border border-canvas-border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">K</div>
                    <div>
                      <div className="text-body font-semibold text-slate-900">Kavin R.</div>
                      <div className="text-caption text-slate-500">SDLC Models</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-body font-mono font-bold text-amber-700">6 / 10</div>
                    <div className="text-[10px] text-slate-400">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Evaluation Activity & Quick Actions & AI Status */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Evaluation Activity Bar Chart Card */}
          <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-heading font-display font-bold text-slate-900">Evaluation Activity</h3>
              <span className="text-caption text-slate-400 border border-slate-200 px-2 py-0.5 rounded-lg">Last 30 Days</span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-1.5 pt-4">
              {[35, 45, 60, 50, 75, 85, 95, 65, 80, 90, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-mint-100 rounded-t-lg transition-all" style={{ height: `${h}%` }}>
                    <div className="w-full bg-forest-700 rounded-t-lg" style={{ height: `${h * 0.75}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-4 text-caption font-sans pt-2 border-t border-slate-100">
              <span className="flex items-center space-x-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded bg-mint-300"></span>
                <span>Submissions</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded bg-forest-700"></span>
                <span>Evaluated</span>
              </span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white border border-canvas-border rounded-3xl p-6 shadow-card space-y-3">
            <h3 className="text-heading font-display font-bold text-slate-900 mb-3">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('create-assignment')}
                className="p-3 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white text-caption font-display font-semibold flex items-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>

              <button
                onClick={() => onNavigate('submissions')}
                className="p-3 rounded-2xl bg-canvas-subtle hover:bg-slate-200 text-slate-800 text-caption font-display font-semibold flex items-center space-x-2 transition-all border border-canvas-border"
              >
                <Send className="w-4 h-4 text-forest-700" />
                <span>View Submissions</span>
              </button>

              <button
                onClick={() => onNavigate('rubrics')}
                className="p-3 rounded-2xl bg-canvas-subtle hover:bg-slate-200 text-slate-800 text-caption font-display font-semibold flex items-center space-x-2 transition-all border border-canvas-border"
              >
                <FileText className="w-4 h-4 text-forest-700" />
                <span>Create Rubric</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="p-3 rounded-2xl bg-canvas-subtle hover:bg-slate-200 text-slate-800 text-caption font-display font-semibold flex items-center space-x-2 transition-all border border-canvas-border"
              >
                <Download className="w-4 h-4 text-forest-700" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          {/* AI Engine Status Card (Matching screenshot) */}
          <div className="bg-mint-50 border border-mint-200 rounded-3xl p-6 shadow-card space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-forest-700" />
                <h3 className="text-heading font-display font-bold text-forest-950">AI Engine Status</h3>
              </div>
              <span className="text-caption font-bold px-2.5 py-0.5 rounded-full bg-mint-200 text-forest-900 border border-mint-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse"></span>
                <span>Healthy</span>
              </span>
            </div>

            <div className="space-y-2 text-caption font-sans text-forest-900">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                <span>Models Loaded (MiniLM, NLI, spaCy)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                <span>CPU Inference Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                <span>No External APIs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                <span>Ready for Evaluation</span>
              </div>
            </div>

            <div className="pt-2 border-t border-mint-200/80 flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-forest-900 text-mint-400 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-display-md font-display font-bold text-forest-950 leading-tight">100%</div>
                <div className="text-[10px] text-forest-800 font-sans font-semibold">Offline & Private</div>
              </div>
            </div>
          </div>

          {/* Need Help Footer Widget */}
          <div className="bg-white border border-canvas-border rounded-3xl p-4 shadow-card flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-canvas-subtle text-slate-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-body font-semibold text-slate-900">Need Help?</div>
                <div className="text-caption text-slate-500">Check documentation or contact support</div>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-canvas-subtle hover:bg-slate-200 text-slate-800 text-caption font-semibold flex items-center space-x-1 border border-canvas-border">
              <Headphones className="w-3.5 h-3.5" />
              <span>Get Support</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
