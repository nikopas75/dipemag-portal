import React from 'react';
import { AppId } from '../types';
import { LayoutGrid, FileText, School, ClipboardCheck, Database, Server, GraduationCap, ShieldCheck, UserCheck, Lock, LogOut } from 'lucide-react';

interface HeaderProps {
  activeApp: AppId;
  setActiveApp: (app: AppId) => void;
  dbStatuses: Record<string, { connected: boolean; host: string; database: string; message: string }>;
  onOpenDbModal: () => void;
  aitisiRole?: 'landing' | 'teacher' | 'admin';
  setAitisiRole?: (role: 'landing' | 'teacher' | 'admin') => void;
  aitisiAdminSubTab?: 'portal' | 'sql' | 'ai';
  setAitisiAdminSubTab?: (tab: 'portal' | 'sql' | 'ai') => void;
  programmatismosRole?: 'landing' | 'director' | 'admin';
  setProgrammatismosRole?: (role: 'landing' | 'director' | 'admin') => void;
  axiologisiRole?: 'landing' | 'admin';
  setAxiologisiRole?: (role: 'landing' | 'admin') => void;
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
  programmatismosRole = 'landing',
  setProgrammatismosRole,
  axiologisiRole = 'landing',
  setAxiologisiRole,
}) => {
  const aitisiStatus = dbStatuses['aitisi'];
  const isConnected = Boolean(aitisiStatus?.connected);
  const hostName = aitisiStatus?.host || 'localhost';

  const isAitisiLoggedIn = activeApp === 'aitisi' && aitisiRole !== 'landing';
  const isProgrammatismosLoggedIn = activeApp === 'programmatismos' && programmatismosRole !== 'landing';
  const isAxiologisiLoggedIn = activeApp === 'axiologisi' && axiologisiRole !== 'landing';
  const isAnyLoggedIn = isAitisiLoggedIn || isProgrammatismosLoggedIn || isAxiologisiLoggedIn;

  const getNavButtonClass = (targetApp: AppId, activeColorClass: string) => {
    if (activeApp === targetApp) {
      return `${activeColorClass} text-white shadow-sm cursor-default font-semibold`;
    }
    if (isAnyLoggedIn) {
      return 'text-slate-500 bg-slate-800/40 opacity-40 cursor-not-allowed select-none';
    }
    return 'text-slate-300 hover:text-white hover:bg-slate-700/50 font-medium';
  };

  const getNavTitle = (targetApp: AppId, appLabel: string) => {
    if (isAnyLoggedIn && activeApp !== targetApp) {
      return `Ενεργή συνεδρία: Αποσυνδεθείτε πρώτα για να μεταβείτε στην εφαρμογή ${appLabel}`;
    }
    return undefined;
  };

  const handleBrandClick = () => {
    if (isAnyLoggedIn) return;
    if (activeApp === 'aitisi' && setAitisiRole) setAitisiRole('landing');
    setActiveApp('hub');
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo & title */}
          {activeApp === 'aitisi' ? (
            <div
              className={`flex items-center space-x-3 transition-opacity ${
                isAnyLoggedIn ? 'cursor-default opacity-90' : 'cursor-pointer group'
              }`}
              onClick={handleBrandClick}
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
            <div
              className={`flex items-center space-x-3 transition-opacity ${
                isAnyLoggedIn ? 'cursor-default opacity-90' : 'cursor-pointer'
              }`}
              onClick={handleBrandClick}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-between p-2 shadow-inner shrink-0">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                    ΔΠΕ Μαγνησίας
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
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
                disabled={isAnyLoggedIn}
                onClick={() => !isAnyLoggedIn && setActiveApp('hub')}
                title={getNavTitle('hub', 'Κεντρική')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${getNavButtonClass(
                  'hub',
                  'bg-blue-600'
                )}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Κεντρική</span>
              </button>

              <button
                disabled={isAnyLoggedIn && activeApp !== 'aitisi'}
                onClick={() => !(isAnyLoggedIn && activeApp !== 'aitisi') && setActiveApp('aitisi')}
                title={getNavTitle('aitisi', '1. Η-Αίτηση')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${getNavButtonClass(
                  'aitisi',
                  'bg-emerald-600'
                )}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Η-Αίτηση</span>
                {isAnyLoggedIn && activeApp !== 'aitisi' && <Lock className="w-3 h-3 ml-0.5 text-slate-500" />}
              </button>

              <button
                disabled={isAnyLoggedIn && activeApp !== 'programmatismos'}
                onClick={() => !(isAnyLoggedIn && activeApp !== 'programmatismos') && setActiveApp('programmatismos')}
                title={getNavTitle('programmatismos', '2. Προγραμματισμός')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${getNavButtonClass(
                  'programmatismos',
                  'bg-amber-600'
                )}`}
              >
                <School className="w-3.5 h-3.5" />
                <span>2. Προγραμματισμός</span>
                {isAnyLoggedIn && activeApp !== 'programmatismos' && <Lock className="w-3 h-3 ml-0.5 text-slate-500" />}
              </button>

              <button
                disabled={isAnyLoggedIn && activeApp !== 'axiologisi'}
                onClick={() => !(isAnyLoggedIn && activeApp !== 'axiologisi') && setActiveApp('axiologisi')}
                title={getNavTitle('axiologisi', '3. Αξιολόγηση')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${getNavButtonClass(
                  'axiologisi',
                  'bg-purple-600'
                )}`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>3. Αξιολόγηση</span>
                {isAnyLoggedIn && activeApp !== 'axiologisi' && <Lock className="w-3 h-3 ml-0.5 text-slate-500" />}
              </button>
            </nav>
          </div>

          {/* Right Section: Role Badge & Single MySQL Connection Button */}
          <div className="flex items-center space-x-2">
            {isAnyLoggedIn && (
              <div className="flex items-center space-x-2 pr-1 border-r border-slate-800">
                <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isAitisiLoggedIn
                    ? (aitisiRole === 'admin' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30')
                    : isProgrammatismosLoggedIn
                      ? (programmatismosRole === 'admin' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30')
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                }`}>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isAitisiLoggedIn && (aitisiRole === 'admin' ? 'Διαχειριστής' : 'Εκπαιδευτικός')}
                    {isProgrammatismosLoggedIn && (programmatismosRole === 'admin' ? 'Διαχειριστής' : 'Διευθυντής')}
                    {isAxiologisiLoggedIn && 'Διαχειριστής'}
                  </span>
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
            disabled={isAnyLoggedIn}
            onClick={() => !isAnyLoggedIn && setActiveApp('hub')}
            title={getNavTitle('hub', 'Κεντρική')}
            className={`flex-none px-2.5 py-1 rounded text-xs font-medium ${
              activeApp === 'hub'
                ? 'bg-blue-600 text-white'
                : isAnyLoggedIn
                  ? 'text-slate-600 bg-slate-800/40 opacity-40 cursor-not-allowed select-none'
                  : 'text-slate-400 bg-slate-800 hover:text-white'
            }`}
          >
            Κεντρική
          </button>
          <button
            disabled={isAnyLoggedIn && activeApp !== 'aitisi'}
            onClick={() => !(isAnyLoggedIn && activeApp !== 'aitisi') && setActiveApp('aitisi')}
            title={getNavTitle('aitisi', '1. Η-Αίτηση')}
            className={`flex-none px-2.5 py-1 rounded text-xs font-medium ${
              activeApp === 'aitisi'
                ? 'bg-emerald-600 text-white'
                : isAnyLoggedIn
                  ? 'text-slate-600 bg-slate-800/40 opacity-40 cursor-not-allowed select-none'
                  : 'text-slate-400 bg-slate-800 hover:text-white'
            }`}
          >
            1. Η-Αίτηση
          </button>
          <button
            disabled={isAnyLoggedIn && activeApp !== 'programmatismos'}
            onClick={() => !(isAnyLoggedIn && activeApp !== 'programmatismos') && setActiveApp('programmatismos')}
            title={getNavTitle('programmatismos', '2. Προγραμματισμός')}
            className={`flex-none px-2.5 py-1 rounded text-xs font-medium ${
              activeApp === 'programmatismos'
                ? 'bg-amber-600 text-white'
                : isAnyLoggedIn
                  ? 'text-slate-600 bg-slate-800/40 opacity-40 cursor-not-allowed select-none'
                  : 'text-slate-400 bg-slate-800 hover:text-white'
            }`}
          >
            2. Προγραμματισμός
          </button>
          <button
            disabled={isAnyLoggedIn && activeApp !== 'axiologisi'}
            onClick={() => !(isAnyLoggedIn && activeApp !== 'axiologisi') && setActiveApp('axiologisi')}
            title={getNavTitle('axiologisi', '3. Αξιολόγηση')}
            className={`flex-none px-2.5 py-1 rounded text-xs font-medium ${
              activeApp === 'axiologisi'
                ? 'bg-purple-600 text-white'
                : isAnyLoggedIn
                  ? 'text-slate-600 bg-slate-800/40 opacity-40 cursor-not-allowed select-none'
                  : 'text-slate-400 bg-slate-800 hover:text-white'
            }`}
          >
            3. Αξιολόγηση
          </button>
        </div>
      </div>
    </header>
  );
};


