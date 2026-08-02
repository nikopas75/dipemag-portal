/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ConnectionModal } from './components/ConnectionModal';
import { SqlConsoleSection } from './components/SqlConsoleSection';
import { PersonnelPortalSection } from './components/PersonnelPortalSection';
import { SqlAuditLog, MysqlConfig, SqlQueryResult } from './types';
import { Database, ShieldCheck, UserCheck, ArrowRight, GraduationCap, Key, AlertCircle, X, Terminal, Sparkles, Users, Server, LogOut } from 'lucide-react';

export interface EAitisiAppProps {
  appRole?: 'landing' | 'teacher' | 'admin';
  setAppRole?: (role: 'landing' | 'teacher' | 'admin') => void;
  adminSubTab?: 'portal' | 'sql';
  setAdminSubTab?: (tab: 'portal' | 'sql') => void;
  onOpenDbModal?: () => void;
}

export default function App({
  appRole: propAppRole,
  setAppRole: propSetAppRole,
  adminSubTab: propAdminSubTab,
  setAdminSubTab: propSetAdminSubTab,
  onOpenDbModal,
}: EAitisiAppProps = {}) {
  const [internalAppRole, setInternalAppRole] = useState<'landing' | 'teacher' | 'admin'>('landing');
  const [internalAdminSubTab, setInternalAdminSubTab] = useState<'portal' | 'sql' | 'ai'>('portal');

  const appRole = propAppRole !== undefined ? propAppRole : internalAppRole;
  const setAppRole = propSetAppRole || setInternalAppRole;

  const adminSubTab = propAdminSubTab !== undefined ? propAdminSubTab : internalAdminSubTab;
  const setAdminSubTab = propSetAdminSubTab || setInternalAdminSubTab;

  const [currentAdminUser, setCurrentAdminUser] = useState<string>(() => {
    return localStorage.getItem('eaitisi_current_admin') || 'plinetamag';
  });

  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [logs, setLogs] = useState<SqlAuditLog[]>([]);
  const [dbConfig, setDbConfig] = useState<MysqlConfig>(() => {
    try {
      const saved = localStorage.getItem('ngrok_db_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          mode: 'external',
          host: parsed.host || '2.tcp.eu.ngrok.io',
          port: Number(parsed.port) || 16641,
          user: parsed.user || 'plinetamag',
          password: parsed.password || 'pl!n3tAmag',
          database: parsed.database || 'e_aitisi',
          isConnected: true,
          activeConnectionMessage: 'Σύνδεση στη βάση δεδομένων MySQL (ngrok)...'
        };
      }
    } catch (e) {}
    return {
      mode: 'external',
      host: '2.tcp.eu.ngrok.io',
      port: 16641,
      user: 'plinetamag',
      password: 'pl!n3tAmag',
      database: 'e_aitisi',
      isConnected: true,
      activeConnectionMessage: 'Σύνδεση στη βάση δεδομένων MySQL (ngrok)...'
    };
  });

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch database status & audit logs from Express server
  const refreshData = async () => {
    try {
      const [statusRes, logsRes, adminsRes] = await Promise.all([
        fetch('api/status'),
        fetch('api/logs'),
        fetch('api/plinetamag/admins').catch(() => null)
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setDbConfig({
          mode: statusData.mode,
          host: statusData.host,
          port: statusData.port,
          user: statusData.user,
          database: statusData.database,
          isConnected: statusData.isConnected,
          activeConnectionMessage: statusData.activeConnectionMessage
        });
      }

      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData);
      }

      if (adminsRes && adminsRes.ok) {
        const adminsData = await adminsRes.json();
        if (adminsData.success && adminsData.admins) {
          localStorage.setItem('eaitisi_admins_v2', JSON.stringify(adminsData.admins));
        }
      }
    } catch (err) {
      console.error('Error fetching data from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveConnection = async (newConfig: Partial<MysqlConfig>): Promise<boolean> => {
    try {
      const res = await fetch('api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleExecuteQuery = async (query: string): Promise<SqlQueryResult> => {
    try {
      const res = await fetch('api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, username: 'plinetamag' })
      });
      return await res.json();
    } catch (err: any) {
      return { columns: [], rows: [], executionTimeMs: 0, error: err.message };
    }
  };

  const handleOpenAdminAuth = () => {
    setAdminUsernameInput('');
    setAdminPasswordInput('');
    setAdminPasswordError('');
    setIsAdminAuthModalOpen(true);
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = localStorage.getItem('eaitisi_admins_v2');
    let adminsList = [];
    if (saved) {
      try {
        adminsList = JSON.parse(saved);
      } catch (err) {
        // ignore
      }
    }
    if (!adminsList || adminsList.length === 0) {
      adminsList = [
        { username: 'plinetamag', password: 'pl!n3tAmag' },
        { username: 'v.magnesia.admin', password: 'pl!n3tAmag' }
      ];
    }

    const found = adminsList.find(
      (a: any) => a.username.trim() === adminUsernameInput.trim() && a.password === adminPasswordInput
    );

    if (found || (adminUsernameInput.trim() === 'plinetamag' && adminPasswordInput === 'pl!n3tAmag')) {
      const loggedUser = found ? found.username.trim() : adminUsernameInput.trim();
      setCurrentAdminUser(loggedUser);
      localStorage.setItem('eaitisi_current_admin', loggedUser);
      setIsAdminAuthModalOpen(false);
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      setAdminPasswordError('');
      setAppRole('admin');
      setAdminSubTab('portal');
    } else {
      setAdminPasswordError('Λανθασμένο όνομα χρήστη ή κωδικός πρόσβασης!');
    }
  };

  const virtualAdminUser = {
    id: 1,
    username: currentAdminUser,
    fullName: `Διαχειριστής ΒΔ (${currentAdminUser})`,
    email: 'admin@e-aitisi.sch.gr',
    role: 'Admin' as const,
    departmentId: 1,
    departmentName: 'Διεύθυνση Προσωπικού & Αιτήσεων e_aitisi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+30 210 3442000',
    location: 'Αθήνα (ΥΠΑΙΘΑ)',
    status: 'Active' as const,
    salaryBudget: 0,
    joinedDate: '2026-01-01'
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center animate-spin mb-4">
          <Database className="w-6 h-6 text-blue-400" />
        </div>
        <p className="font-mono text-sm tracking-wide text-slate-400">Φόρτωση Πύλης Η-αίτηση...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:p-0 print:m-0 print:block">
      {/* Main Container Viewport */}
      <div className="w-full">
        {appRole === 'landing' && (
          /* Dual Entrance Gateway Screen */
          <div className="max-w-5xl mx-auto my-4 space-y-6 animate-in fade-in duration-500">
            {/* Header banner */}
            <div className="text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-10 rounded-3xl border border-blue-900/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/40">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex flex-col gap-1.5">
                <span className="text-3xl sm:text-4xl text-blue-400 font-extrabold tracking-normal">Η-αίτηση</span>
                <span className="text-xl sm:text-2xl text-slate-100">Ηλεκτρονική Πύλη Εκπαιδευτικού Προσωπικού ΔΠΕ Μαγνησίας</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Επιλέξτε τον ρόλο σύνδεσής σας για διαχείριση στοιχείων, υποβολή αιτήσεων μετάθεσης/τοποθέτησης και επιθεώρηση εγγραφών στη βάση δεδομένων.
              </p>
            </div>

            {/* Dual Option Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teacher Option */}
              <div className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-emerald-950/40">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Είσοδος Εκπαιδευτικού
                    </h3>
                    <span className="inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Απλός Χρήστης / Εκπαιδευτικός
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Σύνδεση με <strong className="text-emerald-300">Όνομα Χρήστη: ΑΦΜ</strong> και <strong className="text-emerald-300">Κωδικός: Αριθμός Μητρώου (ΑρΜητρ)</strong> (πίνακας <code className="text-emerald-400 font-mono">e_aitisi.teachers</code>). Προβολή προσωπικών & υπηρεσιακών στοιχείων, υποβολή κριτηρίων, δήλωση 20 προτιμήσεων και εξαγωγή Αίτησης σε PDF.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    onClick={() => setAppRole('teacher')}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 group-hover:translate-x-0.5"
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>Είσοδος στην Αίτησή μου</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              {/* Admin Option */}
              <div className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-blue-950/40">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                      Είσοδος Διαχειριστή ΒΔ
                    </h3>
                    <span className="inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                      Super User (plinetamag) / Τοπικός Διαχειριστής
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Πλήρης διαχείριση της βάσης δεδομένων. Αναζήτηση & επεξεργασία όλων των εγγραφών εκπαιδευτικών, διαχείριση τοπικών διαχειριστών, εκτέλεση ερωτημάτων στην Κονσόλα SQL και AI ανάλυση.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    onClick={handleOpenAdminAuth}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 group-hover:translate-x-0.5"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Διαχείριση Βάσης Δεδομένων</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {appRole === 'teacher' && (
          <PersonnelPortalSection
            initialMode="teacher"
            onExitToLanding={() => setAppRole('landing')}
          />
        )}

        {appRole === 'admin' && (
          <div>
            {adminSubTab === 'portal' && (
              <PersonnelPortalSection
                initialMode="admin"
                currentAdminUser={currentAdminUser}
                onExitToLanding={() => setAppRole('landing')}
              />
            )}

            {adminSubTab === 'sql' && (
              <SqlConsoleSection
                logs={logs}
                currentUser={virtualAdminUser}
                onExecuteQuery={handleExecuteQuery}
                onRefreshLogs={refreshData}
              />
            )}
          </div>
        )}
      </div>

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        config={dbConfig}
        onSaveConnection={handleSaveConnection}
      />

      {/* Admin Password Authentication Modal */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Αυθεντικοποίηση Διαχειριστή</h3>
                  <p className="text-xs text-slate-400">Πρόσβαση Διαχειριστή Η-αίτηση</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminAuthModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminPasswordError && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{adminPasswordError}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Όνομα Χρήστη (Username)
                </label>
                <input
                  type="text"
                  required
                  value={adminUsernameInput}
                  onChange={e => setAdminUsernameInput(e.target.value)}
                  placeholder="plinetamag ή τοπικός διαχειριστής"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Κωδικός Πρόσβασης (Password)
                </label>
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={e => setAdminPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdminAuthModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
                >
                  Σύνδεση
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
