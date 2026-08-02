import React from 'react';
import { AppId, DbConfig } from '../types';
import {
  FileText,
  School,
  ClipboardCheck,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SuiteHubProps {
  onSelectApp: (app: AppId) => void;
  dbConfigs: Record<'aitisi' | 'programmatismos' | 'axiologisi', DbConfig>;
  dbStatuses: Record<string, { connected: boolean; host: string; database: string; message: string }>;
  onOpenDbModal: () => void;
  onRefreshDbStatuses: () => void;
}

export const SuiteHub: React.FC<SuiteHubProps> = ({
  onSelectApp,
  dbConfigs,
  dbStatuses,
  onOpenDbModal,
  onRefreshDbStatuses,
}) => {
  const isConnected = Boolean(dbStatuses['aitisi']?.connected);
  const currentHost = dbStatuses['aitisi']?.host || 'localhost';

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white border border-slate-800 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ΔΠΕ Μαγνησίας • Ενιαία Αρχιτεκτονική Πύλης</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Ενιαία Πύλη Εφαρμογών ΔΠΕ Μαγνησίας
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Καλώς ήρθατε στην <strong>Ενιαία Πύλη Εφαρμογών ΔΠΕ Μαγνησίας</strong>. Η πύλη φιλοξενεί τις αυτόνομες εκπαιδευτικές εφαρμογές για την υποβολή αιτήσεων εκπαιδευτικών, τον προγραμματισμό σχολικών μονάδων και την αξιολόγηση.
          </p>
        </div>
      </div>

      {/* 3 Applications Launcher Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Οι Εφαρμογές της Πύλης</span>
          </h2>
          <span className="text-xs text-slate-400">Επιλέξτε εφαρμογή για μετάβαση</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: e-Aitisi */}
          <div
            onClick={() => onSelectApp('aitisi')}
            className="group bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl hover:shadow-2xl hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden text-slate-100"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition"></div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md">
                  ΕΚΠΑΙΔΕΥΤΙΚΟΙ
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                  1. Η-Αίτηση
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Πύλη Αιτήσεων e-aitisi</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Πύλη υποβολής αιτήσεων εκπαιδευτικών (Αποσπάσεις, Μεταθέσεις, Βελτιώσεις). Αναζήτηση στοιχείων, διορθώσεις, οριστική υποβολή & παραγωγή εκτυπώσιμου εγγράφου.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition">
              <span>Μετάβαση στην Η-Αίτηση</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Programmatismos */}
          <div
            onClick={() => onSelectApp('programmatismos')}
            className="group bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl hover:shadow-2xl hover:border-amber-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden text-slate-100"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition"></div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-xl">
                  <School className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-md">
                  ΔΙΕΥΘΥΝΤΕΣ ΣΧΟΛΕΙΩΝ
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                  2. Προγραμματισμός Σχολικών Μονάδων
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Προγραμματισμός</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Πύλη Διευθυντών & Προϊσταμένων Σχολικών Μονάδων. Υποβολή μαθητικού δυναμικού, κατανομή ωραρίου εκπαιδευτικών & αναφορές.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition">
              <span>Μετάβαση στον Προγραμματισμό</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Axiologisi */}
          <div
            onClick={() => onSelectApp('axiologisi')}
            className="group bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl hover:shadow-2xl hover:border-purple-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden text-slate-100"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition"></div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-950/80 border border-purple-800 text-purple-400 rounded-xl">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-md">
                  Admin Only
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">
                  3. Αξιολόγηση
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Αξιολόγηση Εκπαιδευτικών</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Αποκλειστικό διαχειριστικό περιβάλλον. Παρακολούθηση κύκλων αξιολόγησης, αντιστοίχιση αξιολογητών A1/A2/B, καταγραφή βαθμολογιών & στατιστικά.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition">
              <span>Μετάβαση στην Αξιολόγηση</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

