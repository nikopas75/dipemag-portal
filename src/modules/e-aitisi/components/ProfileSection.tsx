import React, { useState } from 'react';
import { UserCheck, Save, FileText, CheckCircle2, DollarSign, MapPin, Mail, Phone, Briefcase, RefreshCw } from 'lucide-react';
import { UserProfile, DataRecord } from '../types';
import { generateUserDossierPdf } from '../utils/pdfGenerator';

interface ProfileSectionProps {
  user: UserProfile;
  records: DataRecord[];
  onUpdateUser: (updatedData: Partial<UserProfile>) => Promise<void>;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, records, onUpdateUser }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [role, setRole] = useState(user.role);
  const [phone, setPhone] = useState(user.phone);
  const [location, setLocation] = useState(user.location);
  const [salaryBudget, setSalaryBudget] = useState(user.salaryBudget.toString());
  const [status, setStatus] = useState(user.status);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    await onUpdateUser({
      fullName,
      role: role as any,
      phone,
      location,
      salaryBudget: Number(salaryBudget) || 0,
      status: status as any
    });

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const myRecords = records.filter(r => r.userId === user.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-cyan-500/30 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-slate-900 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{user.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-medium">
                  {user.role}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Department: <span className="text-slate-200 font-medium">{user.departmentName}</span> (ID: #{user.departmentId})
              </p>
              <div className="flex items-center space-x-4 text-xs text-slate-400 mt-3 font-mono">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{user.email}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{user.location}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => generateUserDossierPdf(user, myRecords)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-sm w-full sm:w-auto"
            >
              <FileText className="w-4 h-4" />
              <span>Export Official Dossier PDF</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center sm:text-right">
              Includes table records & SQL certified footer
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <span>Alter Database Personnel Record</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Changes will execute a live <code className="text-cyan-400">UPDATE users SET ...</code> query in MySQL
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Role / Designation
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Phone Direct
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Office Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Salary / Allocation Budget ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    value={salaryBudget}
                    onChange={e => setSalaryBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Current Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Active">Active</option>
                  <option value="Remote">Remote</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {savedSuccess ? (
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SUCCESS: Updated record in MySQL database!</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-mono">
                  Primary Key ID: <span className="text-cyan-400">#{user.id}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Store Altered Data to DB</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 mb-4">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Assigned DB Records</span>
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Total Records Owned</span>
                <span className="text-sm font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded">
                  {myRecords.length} items
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Approved Value</span>
                <span className="text-sm font-mono font-bold text-emerald-400 bg-slate-800 px-2.5 py-1 rounded">
                  ${myRecords.filter(r => r.status === 'Approved' || r.status === 'Completed').reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Account Created</span>
                <span className="text-xs font-mono text-slate-300">{user.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 shadow-xl font-mono text-xs text-slate-400 space-y-2">
            <p className="text-cyan-400 font-bold uppercase tracking-wider">MySQL Storage Spec</p>
            <p>Engine: InnoDB / Memory Buffer</p>
            <p>Charset: utf8mb4_unicode_ci</p>
            <p>Row Format: DYNAMIC</p>
            <p className="text-[10px] text-slate-400 mt-2">
              All alterations execute transparent ACID-compliant state writes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
