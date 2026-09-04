import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  UserCheck, 
  ShieldAlert,
  Mail,
  ChevronRight,
  MoreVertical,
  Upload,
  BadgeCheck
} from 'lucide-react';
import { User, UserRole } from '../types/auth';
import { parseEmailIdentity } from '../services/identityParser';

interface UserManagementProps {
  currentUser: User | null;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  batch?: string;
  student_id?: string;
  status: 'Active' | 'Pending' | 'Suspended';
  parsedAutomatically: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [testEmail, setTestEmail] = useState('dharshana.s2024csbs@sece.ac.in');

  // Parse Live Preview of Test Email
  const parsedPreview = parseEmailIdentity(testEmail);

  // Mock User Database
  const [users] = useState<UserRecord[]>([
    {
      id: 'usr-1',
      name: 'Dr. Dharshana S',
      email: 'dharshana@sece.ac.in',
      role: 'ORG_ADMIN',
      department: 'Computer Science & Business Systems',
      status: 'Active',
      parsedAutomatically: true,
    },
    {
      id: 'usr-2',
      name: 'Prof. Anitha K',
      email: 'anitha.k@sece.ac.in',
      role: 'STAFF',
      department: 'Computer Science & Business Systems',
      status: 'Active',
      parsedAutomatically: true,
    },
    {
      id: 'usr-3',
      name: 'Ananya Sharma',
      email: 'ananya.s2024csbs@sece.ac.in',
      role: 'STUDENT',
      department: 'Computer Science & Business Systems',
      batch: '2024',
      student_id: '732924CSBS001',
      status: 'Active',
      parsedAutomatically: true,
    },
    {
      id: 'usr-4',
      name: 'Rohan Kumar',
      email: 'rohan.k2024csbs@sece.ac.in',
      role: 'STUDENT',
      department: 'Computer Science & Business Systems',
      batch: '2024',
      student_id: '732924CSBS002',
      status: 'Active',
      parsedAutomatically: true,
    },
    {
      id: 'usr-5',
      name: 'Kavya Raman',
      email: 'kavya.r2023aids@sece.ac.in',
      role: 'STUDENT',
      department: 'Artificial Intelligence & Data Science',
      batch: '2023',
      student_id: '732923AIDS015',
      status: 'Active',
      parsedAutomatically: true,
    },
    {
      id: 'usr-6',
      name: 'Dr. Rajesh V',
      email: 'rajesh.v@sece.ac.in',
      role: 'STAFF',
      department: 'Artificial Intelligence & Data Science',
      status: 'Active',
      parsedAutomatically: false,
    },
  ]);

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.student_id && u.student_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesDept = selectedDept === 'ALL' || u.department.includes(selectedDept);

    return matchesSearch && matchesRole && matchesDept;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-forest-50/40 min-h-screen">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-forest-900 tracking-tight">
            User Directory & Identity Management
          </h1>
          <p className="text-xs md:text-sm text-forest-600 font-sans mt-1">
            Institutional users automatically provisioned & mapped from domain email parsing schemas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-forest-200 text-forest-800 font-display font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm hover:bg-forest-50 transition-colors">
            <Upload className="w-4 h-4 text-forest-600" />
            <span>Bulk CSV Import</span>
          </button>
          <button className="flex items-center space-x-2 bg-mint-500 hover:bg-mint-400 text-forest-950 font-display font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Single User</span>
          </button>
        </div>
      </div>

      {/* Live Domain Identity Parser Playground */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-850 to-forest-950 p-6 rounded-2xl text-white border border-forest-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-mint-500/20 text-mint-300 rounded-xl border border-mint-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white">
                Live Email Identity Parser Tester
              </h3>
              <p className="text-xs text-emerald-200/80 font-sans">
                Type any email address to test instant role, organization, department, and batch detection logic
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 bg-forest-800 rounded-md text-mint-300 border border-forest-700">
            Zero Dropdowns Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider block">
              Enter Email to Test
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-forest-400" />
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-forest-950/80 border border-forest-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-mint-400 transition-colors"
                placeholder="e.g. name.s2024csbs@sece.ac.in"
              />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-forest-950/50 p-3 rounded-xl border border-forest-800 text-xs">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 block">Detected Role</span>
              <span className="font-semibold text-mint-300 font-sans">{parsedPreview.role}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 block">Organization</span>
              <span className="font-semibold text-white font-sans">{parsedPreview.organization_code}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 block">Department</span>
              <span className="font-semibold text-emerald-200 font-sans truncate block">{parsedPreview.department || 'General'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 block">Batch Year</span>
              <span className="font-semibold text-mint-300 font-mono">{parsedPreview.batch || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-forest-100 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-forest-400" />
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-forest-50/50 border border-forest-200/80 rounded-xl text-xs text-forest-900 placeholder-forest-400 focus:outline-none focus:border-mint-500 font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Role Filter */}
          <div className="flex items-center space-x-1 bg-forest-50 p-1 rounded-xl border border-forest-100 text-xs">
            <button
              onClick={() => setSelectedRole('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedRole === 'ALL' ? 'bg-white text-forest-900 shadow-sm font-semibold' : 'text-forest-600 hover:text-forest-900'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setSelectedRole('STUDENT')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedRole === 'STUDENT' ? 'bg-white text-forest-900 shadow-sm font-semibold' : 'text-forest-600 hover:text-forest-900'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setSelectedRole('STAFF')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedRole === 'STAFF' ? 'bg-white text-forest-900 shadow-sm font-semibold' : 'text-forest-600 hover:text-forest-900'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => setSelectedRole('ORG_ADMIN')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedRole === 'ORG_ADMIN' ? 'bg-white text-forest-900 shadow-sm font-semibold' : 'text-forest-600 hover:text-forest-900'
              }`}
            >
              Org Admins
            </button>
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-white border border-forest-200 rounded-xl text-xs text-forest-800 font-sans focus:outline-none focus:border-mint-500 shadow-sm"
          >
            <option value="ALL">All Departments</option>
            <option value="CSBS">CSBS Department</option>
            <option value="AIDS">AIDS Department</option>
            <option value="CSE">CSE Department</option>
          </select>

        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-forest-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-forest-50/70 border-b border-forest-100 text-[11px] font-mono uppercase tracking-wider text-forest-700">
                <th className="py-3.5 px-5">User Name & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department & Batch</th>
                <th className="py-3.5 px-4 text-center">Student ID</th>
                <th className="py-3.5 px-4 text-center">Identity Method</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50 text-sm font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-forest-500 font-sans text-xs">
                    No users found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-forest-50/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-forest-900">{u.name}</div>
                      <div className="text-xs text-forest-500 font-mono">{u.email}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ORG_ADMIN'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : u.role === 'STAFF'
                          ? 'bg-forest-100 text-forest-800 border border-forest-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {u.role === 'ORG_ADMIN' && 'Org Admin'}
                        {u.role === 'STAFF' && 'Faculty Staff'}
                        {u.role === 'STUDENT' && 'Student'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-xs font-medium text-forest-900">{u.department}</div>
                      {u.batch && (
                        <div className="text-[10px] text-forest-500 font-mono">Batch of {u.batch}</div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-xs text-forest-700">
                      {u.student_id || '—'}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {u.parsedAutomatically ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-mint-700 bg-mint-50 px-2 py-0.5 rounded border border-mint-200">
                          <BadgeCheck className="w-3.5 h-3.5 text-mint-600" /> Auto Parsed
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-forest-500">Manual Entry</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {u.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button className="p-1.5 hover:bg-forest-100 text-forest-600 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-forest-50/50 border-t border-forest-100 flex items-center justify-between text-xs text-forest-600 font-sans">
          <span>Showing {filteredUsers.length} of {users.length} active institution users</span>
          <span className="font-mono text-[11px]">Organization: {currentUser?.organization_name || 'SECE'}</span>
        </div>
      </div>

    </div>
  );
};
