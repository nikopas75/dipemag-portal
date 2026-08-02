import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Edit3, Trash2, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import { DataRecord, UserProfile } from '../types';
import { generateCustomDataTablePdf } from '../utils/pdfGenerator';

interface RecordsSectionProps {
  records: DataRecord[];
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onAddRecord: (newRecord: Partial<DataRecord>) => Promise<void>;
  onUpdateRecord: (id: number, updatedRecord: Partial<DataRecord>) => Promise<void>;
  onDeleteRecord: (id: number) => Promise<void>;
}

export const RecordsSection: React.FC<RecordsSectionProps> = ({
  records,
  currentUser,
  allUsers,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [onlyMyRecords, setOnlyMyRecords] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for modal
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DataRecord['category']>('Financial Invoice');
  const [amount, setAmount] = useState('1000');
  const [clientOrProject, setClientOrProject] = useState('');
  const [status, setStatus] = useState<DataRecord['status']>('Pending');
  const [priority, setPriority] = useState<DataRecord['priority']>('Medium');
  const [description, setDescription] = useState('');

  const filteredRecords = records.filter(r => {
    if (onlyMyRecords && r.userId !== currentUser.id) return false;
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.clientOrProject.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openNewModal = () => {
    setEditingRecord(null);
    setTitle('');
    setCategory('Financial Invoice');
    setAmount('5000');
    setClientOrProject('Acme Corp');
    setStatus('Pending');
    setPriority('Medium');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (r: DataRecord) => {
    setEditingRecord(r);
    setTitle(r.title);
    setCategory(r.category);
    setAmount(r.amount.toString());
    setClientOrProject(r.clientOrProject);
    setStatus(r.status);
    setPriority(r.priority);
    setDescription(r.description);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      await onUpdateRecord(editingRecord.id, {
        title,
        category,
        amount: Number(amount) || 0,
        clientOrProject,
        status,
        priority,
        description
      });
    } else {
      await onAddRecord({
        userId: currentUser.id,
        category,
        title,
        amount: Number(amount) || 0,
        clientOrProject,
        status,
        priority,
        description
      });
    }
    setIsModalOpen(false);
  };

  const categories = ['All', 'Financial Invoice', 'Project Milestone', 'Client Asset', 'System Audit', 'Expense Claim'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search table records..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Ownership Checkbox */}
          <label className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyMyRecords}
              onChange={e => setOnlyMyRecords(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0"
            />
            <span>Only My Assigned Records</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => generateCustomDataTablePdf(filteredRecords, `Relational Export (${categoryFilter})`)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl transition-all text-xs shadow-md"
            title="Export retrieved table view to PDF format"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Table PDF</span>
          </button>

          <button
            onClick={openNewModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition-all text-xs shadow-md shadow-cyan-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Insert New Record</span>
          </button>
        </div>
      </div>

      {/* Records Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Title & Description</th>
                <th className="py-3.5 px-4">Client / Project</th>
                <th className="py-3.5 px-4">Amount ($)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4 text-right">Alter / Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRecords.map(r => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-4 px-4 font-mono text-cyan-400 font-bold">#{r.id}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700/60 font-medium">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <p className="font-semibold text-slate-100">{r.title}</p>
                    {r.description && <p className="text-slate-400 text-[11px] truncate mt-0.5">{r.description}</p>}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300">{r.clientOrProject}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-100">
                    ${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        r.status === 'Approved' || r.status === 'Completed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : r.status === 'Requires Review'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`font-semibold font-mono ${
                        r.priority === 'Critical'
                          ? 'text-red-400'
                          : r.priority === 'High'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {r.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{r.ownerName}</td>
                  <td className="py-4 px-4 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(r)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-900/50 hover:text-cyan-300 text-slate-400 transition-colors"
                      title="Alter Database Record"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteRecord(r.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-400 transition-colors"
                      title="Delete Record from MySQL table"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alter / Insert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingRecord ? `Alter Record #${editingRecord.id}` : 'Insert New MySQL Record'}
                </h3>
                <p className="text-xs text-slate-400">
                  Executes ACID-compliant SQL mutation statement
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title / Milestone Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Analytics Cluster Scaling"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Financial Invoice">Financial Invoice</option>
                    <option value="Project Milestone">Project Milestone</option>
                    <option value="Client Asset">Client Asset</option>
                    <option value="System Audit">System Audit</option>
                    <option value="Expense Claim">Expense Claim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount / Value ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Client or Project</label>
                  <input
                    type="text"
                    value={clientOrProject}
                    onChange={e => setClientOrProject(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Requires Review">Requires Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Enter detailed SQL record notes..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  {editingRecord ? 'Execute UPDATE Query' : 'Execute INSERT Query'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
