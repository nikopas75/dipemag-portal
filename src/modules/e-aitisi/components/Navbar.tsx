import React from 'react';
import { Database, ShieldCheck, UserCheck, LogOut, Terminal, Sparkles, Users, Settings, Server, GraduationCap } from 'lucide-react';
import { MysqlConfig } from '../types';

interface NavbarProps {
  appRole: 'landing' | 'teacher' | 'admin';
  setAppRole: (role: 'landing' | 'teacher' | 'admin') => void;
  adminSubTab: 'portal' | 'sql' | 'ai';
  setAdminSubTab: (tab: 'portal' | 'sql' | 'ai') => void;
  dbConfig: MysqlConfig;
  onOpenConnectionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appRole,
  setAppRole,
  adminSubTab,
  setAdminSubTab,
  dbConfig,
  onOpenConnectionModal
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => {
            if (appRole !== 'teacher') setAppRole('landing');
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                Πύλη Η-αίτηση ΔΠΕ Μαγνησίας
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              Ηλεκτρονικές Αιτήσεις Μετάθεσης & Τοποθέτησης Εκπαιδευτικών
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Admin Only) */}
        {appRole === 'admin' && (
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setAdminSubTab('portal')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminSubTab === 'portal'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-300" />
              <span>Πίνακας Εκπαιδευτικών</span>
            </button>

            <button
              onClick={() => setAdminSubTab('sql')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminSubTab === 'sql'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Κονσόλα SQL</span>
            </button>

            <button
              onClick={() => setAdminSubTab('ai')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                adminSubTab === 'ai'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Βοηθός Ανάλυσης AI</span>
            </button>
          </nav>
        )}

        {/* Right Section: Connection Status & Role Actions */}
        <div className="flex items-center space-x-3">
          {/* DB Mode Pill */}
          <button
            onClick={onOpenConnectionModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
            title="Ρύθμιση Σύνδεσης ΒΔ MySQL"
          >
            <Server className={`w-3.5 h-3.5 ${dbConfig.isConnected ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="hidden lg:inline">
              {dbConfig.mode === 'embedded' ? 'Ενσωματωμένη ΒΔ' : `MySQL: ${dbConfig.host}`}
            </span>
            <span className="lg:hidden">{dbConfig.mode === 'embedded' ? 'Εσωτ. ΒΔ' : 'MySQL'}</span>
            <Settings className="w-3 h-3 text-slate-400" />
          </button>

          {/* Current Role Badge & Exit Button */}
          {appRole !== 'landing' && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                appRole === 'admin' 
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' 
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}>
                {appRole === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{appRole === 'admin' ? 'Διαχειριστής' : 'Εκπαιδευτικός'}</span>
              </span>

              {/* Removed Navbar role-change button as it has been moved to page headers */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
