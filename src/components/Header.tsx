import React from 'react';
import { AppId } from '../types';
import { LayoutGrid, FileText, School, ClipboardCheck, Database, Server, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  activeApp: AppId;
  setActiveApp: (app: AppId) => void;
  dbStatuses: Record<string, { connected: boolean; host: string; database: string; message: string }>;
  onOpenDbModal: () => void;
  aitisiRole?: 'landing' | 'teacher' | 'admin';
  setAitisiRole?: (role: 'landing' | 'teacher' | 'admin') => void;
  aitisiAdminSubTab?: 'portal' | 'sql' | 'ai';
  setAitisiAdminSubTab?: (tab: 'portal' | 'sql' | 'ai') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeApp,
  setActiveApp,
  dbStatuses,
  onOpenDbModal,
  aitisiRole = 'landing',
  setAitisiRole,
  aitisiAdminSubTab = 'portal',
  setAitisiAdminSubTab,
}) => {
  const aitisiStatus = dbStatuses['aitisi'];
  const isConnected = Boolean(aitisiStatus?.connected);
  const hostName = aitisiStatus?.host || 'localhost';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo & title */}
          {activeApp === 'aitisi' ? (
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => {
                if (aitisiRole !== 'teacher' && setAitisiRole) setAitisiRole('landing');
                else setActiveApp('hub');
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold tracking-tight text-base sm:text-lg bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                    Πύλη Η-Αίτηση ΔΠΕ Μαγνησίας
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                  Ηλεκτρονικές Αιτήσεις Μετάθεσης & Τοποθέτησης Εκπαιδευτικών
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveApp('hub')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-between p-2 shadow-inner shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                    ΔΠΕ Μαγνησίας
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                    v2.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Ενιαία Πύλη Εφαρμογών</p>
              </div>
            </div>
          )}

          {/* Central Navigation Section */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Apps Navigation Switcher */}
            <nav className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setActiveApp('hub')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeApp === 'hub'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Κεντρική</span>
              </button>

              <button
                onClick={() => setActiveApp('aitisi')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeApp === 'aitisi'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Η-Αίτηση</span>
              </button>

              <button
                onClick={() => setActiveApp('programmatismos')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeApp === 'programmatismos'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>2. Προγραμματισμός</span>
              </button>

              <button
                onClick={() => setActiveApp('axiologisi')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeApp === 'axiologisi'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>3. Αξιολόγηση</span>
              </button>
            </nav>
          </div>

          {/* Right Section: Role Badge & Single MySQL Connection Button */}
          <div className="flex items-center space-x-2">
            {activeApp === 'aitisi' && aitisiRole !== 'landing' && (
              <div className="flex items-center space-x-2 pr-1 border-r border-slate-800">
                <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  aitisiRole === 'admin' 
                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' 
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {aitisiRole === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{aitisiRole === 'admin' ? 'Διαχειριστής' : 'Εκπαιδευτικός'}</span>
                </span>
              </div>
            )}

            {/* Unified Central MySQL Connection Status Button */}
            <button
              onClick={onOpenDbModal}
              className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-xl border font-mono transition shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
                isConnected
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 hover:bg-emerald-900/80'
                  : 'bg-amber-950/80 border-amber-600 text-amber-200 hover:bg-amber-900/80'
              }`}
              title="Ρύθμιση Σύνδεσης MySQL Server (ngrok / Host / Port / User)"
            >
              <Server className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-[11px] flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  MySQL Server
                </span>
                <span className="text-[10px] text-slate-300 font-mono truncate max-w-[110px]">
                  {hostName}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden border-t border-slate-800 px-2 py-2 bg-slate-900/95 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveApp('hub')}
            className={`flex-none px-2.5 py-1 rounded text-xs font-medium ${
              activeApp === 'hub' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-800'
            }`}
          >
            Κεντρική
          </button>
          <button
            onClick={() => setActiveApp('aitisi')}
            className={`flex-none px-2.5 py-1 rounded text-xs font-medium ${
              activeApp === 'aitisi' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-800'
            }`}
          >
            1. Η-Αίτηση
          </button>
          <button
            onClick={() => setActiveApp('programmatismos')}
            className={`flex-none px-2.5 py-1 rounded text-xs font-medium ${
              activeApp === 'programmatismos' ? 'bg-amber-600 text-white' : 'text-slate-400 bg-slate-800'
            }`}
          >
            2. Προγραμματισμός
          </button>
          <button
            onClick={() => setActiveApp('axiologisi')}
            className={`flex-none px-2.5 py-1 rounded text-xs font-medium ${
              activeApp === 'axiologisi' ? 'bg-purple-600 text-white' : 'text-slate-400 bg-slate-800'
            }`}
          >
            3. Αξιολόγηση
          </button>
        </div>
      </div>
    </header>
  );
};


