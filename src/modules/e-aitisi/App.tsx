import React, { useState } from 'react';
import { PersonnelPortalSection } from './components/PersonnelPortalSection';
import { UserCheck, Shield, Lock, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Key, FileText, Database } from 'lucide-react';

interface EAitisiAppProps {
  appRole?: 'landing' | 'teacher' | 'admin';
  setAppRole?: (role: 'landing' | 'teacher' | 'admin') => void;
  onOpenDbModal?: () => void;
}

export const EAitisiApp: React.FC<EAitisiAppProps> = ({
  appRole: propsAppRole,
  setAppRole: propsSetAppRole,
  onOpenDbModal
}) => {
  const [internalRole, setInternalRole] = useState<'landing' | 'teacher' | 'admin'>('landing');
  const appRole = propsAppRole !== undefined ? propsAppRole : internalRole;

  const setAppRole = (role: 'landing' | 'teacher' | 'admin') => {
    if (propsSetAppRole) {
      propsSetAppRole(role);
    }
    setInternalRole(role);
  };

  // Admin Login Modal State
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);

    if (adminUsername === 'plinetamag' && adminPassword === 'pl!n3tAmag') {
      setIsAdminLoginModalOpen(false);
      setAppRole('admin');
    } else {
      setAdminLoginError('Εσφαλμένο Όνομα Χρήστη ή Κωδικός Πρόσβασης.');
    }
  };

  // Render Module Views
  if (appRole === 'teacher') {
    return (
      <PersonnelPortalSection
        initialMode="teacher"
        currentAdminUser="plinetamag"
        onExitToLanding={() => setAppRole('landing')}
      />
    );
  }

  if (appRole === 'admin') {
    return (
      <PersonnelPortalSection
        initialMode="admin"
        currentAdminUser="plinetamag"
        onExitToLanding={() => setAppRole('landing')}
      />
    );
  }

  // Default View: Module Landing Selection (Mode Switcher)
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Landing Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-950/80 border border-blue-800/80 rounded-full text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ηλεκτρονική Πύλη Αιτήσεων ΔΠΕ Μαγνησίας</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Η-Αίτηση — Σύστημα Υποβολής & Διαχείρισης Αιτήσεων
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Κεντρικό πληροφοριακό σύστημα υποβολής αιτήσεων αποσπάσεων, βελτιώσεων, οριστικών τοποθετήσεων και δηλώσεων άρσης υπεραριθμίας των εκπαιδευτικών της Διεύθυνσης Πρωτοβάθμιας Εκπαίδευσης Μαγνησίας.
          </p>
        </div>
      </div>

      {/* Entry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entry 1: Teacher Portal */}
        <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 shadow-xl transition-all hover:shadow-2xl hover:shadow-blue-950/20 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                ΕΚΠΑΙΔΕΥΤΙΚΟΙ
              </span>
              <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                Πύλη Εκπαιδευτικού & Υποβολής Αίτησης
              </h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Αυθεντικοποίηση εκπαιδευτικών με <strong className="text-slate-200">ΑΦΜ & Αριθμό Μητρώου (ΑΜ)</strong>. Ενημέρωση προσωπικών στοιχείων, επιλογή σχολικών μονάδων προτίμησης και παραγωγή επίσημης αίτησης σε PDF.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center text-xs text-slate-300 space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Απευθείας ταυτοποίηση χωρίς κωδικούς Taxisnet</span>
              </div>
              <div className="flex items-center text-xs text-slate-300 space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Δήλωση σχολικών μονάδων με σειρά προτίμησης</span>
              </div>
              <div className="flex items-center text-xs text-slate-300 space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Αυτόματη παραγωγή έγκυρης αίτησης PDF</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setAppRole('teacher')}
            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all transform group-hover:translate-x-0.5"
          >
            <span>Είσοδος ως Εκπαιδευτικός</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Entry 2: Local Administrator */}
        <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 shadow-xl transition-all hover:shadow-2xl hover:shadow-purple-950/20 flex flex-col justify-between space-y-6 group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                ΔΙΑΧΕΙΡΙΣΤΗΣ
              </span>
              <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                Πάνελ Διαχείρισης & Συντήρησης (Admin)
              </h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Εκτελεστικό περιβάλλον διαχειριστή. Πρόσβαση στο μητρώο αιτήσεων, εισαγωγές CSV, κονσόλα εκτέλεσης ερωτημάτων SQL και ιστορικό αλλαγών.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center text-xs text-slate-300 space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Επισκόπηση & επεξεργασία αιτήσεων προσωπικού</span>
              </div>
              <div className="flex items-center text-xs text-slate-300 space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Μαζικές εισαγωγές δεδομένων από αρχεία CSV/Excel</span>
              </div>
              <div className="flex items-center text-xs text-slate-300 space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Ομογενοποιημένη Κονσόλα SQL & Audit Logs</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setAdminUsername('');
              setAdminPassword('');
              setAdminLoginError(null);
              setIsAdminLoginModalOpen(true);
            }}
            className="w-full py-3.5 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20 transition-all transform group-hover:translate-x-0.5"
          >
            <Lock className="w-4 h-4" />
            <span>Είσοδος Διαχειριστή</span>
          </button>
        </div>
      </div>

      {/* Admin Login Modal */}
      {isAdminLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-950 border border-purple-800 rounded-xl text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Διαπιστευτήρια Διαχειριστή</h3>
                  <p className="text-xs text-slate-400">Εφαρμογή: Η-Αίτηση (e-Aitisi)</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              {adminLoginError && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{adminLoginError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Όνομα Χρήστη (Username)
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  placeholder="Όνομα χρήστη..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Κωδικός Πρόσβασης (Password)
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminLoginModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/20 transition-all"
                >
                  Σύνδεση Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EAitisiApp;
