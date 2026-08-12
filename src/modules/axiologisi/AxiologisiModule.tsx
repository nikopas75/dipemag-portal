import React, { useState } from 'react';
import { EvaluationCycle, TeacherEvaluation, DbConfig } from '../../types';
import { sampleEvaluationCycles, sampleTeacherEvaluations } from '../../data/mockData';
import {
  ClipboardCheck,
  Shield,
  Search,
  Database,
  Users,
  CheckCircle2,
  Clock,
  Award,
  BarChart3,
  Sliders,
  PlusCircle,
  FileSpreadsheet,
  Sparkles,
  X,
  AlertCircle,
  LogOut,
  UserCheck,
  Info,
} from 'lucide-react';

interface AxiologisiModuleProps {
  dbConfig: DbConfig;
  onUpdateDbConfig: (config: DbConfig) => void;
  appRole?: 'landing' | 'admin';
  setAppRole?: (role: 'landing' | 'admin') => void;
}

export const AxiologisiModule: React.FC<AxiologisiModuleProps> = ({
  dbConfig,
  onUpdateDbConfig,
  appRole: propsAppRole,
  setAppRole: propsSetAppRole,
}) => {
  const [internalAppRole, setInternalAppRole] = useState<'landing' | 'admin'>('landing');
  const appRole = propsAppRole !== undefined ? propsAppRole : internalAppRole;
  const setAppRole = (role: 'landing' | 'admin') => {
    if (propsSetAppRole) propsSetAppRole(role);
    setInternalAppRole(role);
  };
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('plinetamag');
  const [adminPassword, setAdminPassword] = useState('pl!n3tAmag');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  const [cycles, setCycles] = useState<EvaluationCycle[]>(sampleEvaluationCycles);
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>(sampleTeacherEvaluations);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    if (!adminUsername || !adminPassword) {
      setAdminLoginError('Παρακαλώ συμπληρώστε Όνομα Χρήστη και Κωδικό.');
      return;
    }
    // Grant admin access
    setAppRole('admin');
    setIsAdminLoginOpen(false);
  };

  // Filtered evaluations list
  const filteredEvals = evaluations.filter((item) => {
    const matchesQuery =
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacherAfm.includes(searchQuery) ||
      item.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || item.stage === stageFilter;
    return matchesQuery && matchesStage;
  });

  return (
    <div className="space-y-6 min-h-[600px]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-purple-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-400/30">
              <ClipboardCheck className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              3. Αξιολόγηση Εκπαιδευτικών
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              ΔΠΕ Μαγνησίας
            </span>
          </div>
          <p className="text-xs text-purple-200/80">
            Κεντρικό Σύστημα Διαχείρισης Περιόδων & Εκθέσεων Αξιολόγησης (Διαχειριστικό Περιβάλλον)
          </p>
        </div>

        {appRole !== 'landing' ? (
          <div className="flex items-center space-x-3 bg-slate-950/60 p-2 rounded-xl border border-purple-700/40 text-xs">
            <span className="text-purple-300 font-semibold flex items-center space-x-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Διαχειριστής (Admin)</span>
            </span>
            <button
              onClick={() => setAppRole('landing')}
              className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-purple-400" />
              <span>Έξοδος</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-purple-700/40 text-xs text-purple-300">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="font-semibold">Αποκλειστική Πρόσβαση Διαχειριστών</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LANDING / PORTAL ENTRANCE SCREEN */}
      {/* ========================================================================= */}
      {appRole === 'landing' && (
        <div className="space-y-8">
          <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden text-slate-100">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-400/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Ηλεκτρονική Πλατφόρμα Αξιολόγησης</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Καλώς ήρθατε στο Σύστημα Αξιολόγησης Εκπαιδευτικών
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Η εφαρμογή παρέχει τη δυνατότητα στους διαχειριστές της ΔΠΕ Μαγνησίας να παρακολουθούν τους κύκλους αξιολόγησης, να αντιστοιχίζουν αξιολογητές <strong className="text-purple-300">A1 (Διδακτικό)</strong>, <strong className="text-purple-300">A2 (Παιδαγωγικό)</strong> & <strong className="text-purple-300">B (Υπηρεσιακό)</strong>, καθώς και να ελέγχουν την πρόοδο των εκθέσεων.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>1. Διαχείριση Κύκλων</span>
                </div>
                <p className="text-xs text-slate-400">
                  Ορισμός περιόδων αξιολόγησης, προθεσμιών και παρακολούθηση σταδίων (Α1, Α2, Β).
                </p>
              </div>

              <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>2. Αντιστοίχιση Αξιολογητών</span>
                </div>
                <p className="text-xs text-slate-400">
                  Αναφορά Συμβούλων Εκπαίδευσης & Διευθυντών Σχολείων ανά αξιολογούμενο εκπαιδευτικό.
                </p>
              </div>

              <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span>3. Μητρώο & Στατιστικά</span>
                </div>
                <p className="text-xs text-slate-400">
                  Πλήρες μητρώο αξιολογήσεων, βαθμολογίες, χαρακτηρισμοί και εξαγωγή αναφορών.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-950/40 border border-purple-800/40 rounded-2xl flex items-start space-x-3">
              <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-200/90 leading-relaxed">
                <strong>Σημείωση:</strong> Λόγω απουσίας μεμονωμένων λογαριασμών χρηστών/εκπαιδευτικών στην παρούσα φάση, η πρόσβαση στο σύστημα πραγματοποιείται αποκλειστικά από τους Διαχειριστές της ΔΠΕ.
              </p>
            </div>

            {/* Entrance Button */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end">
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-purple-950/50"
              >
                <Shield className="w-4 h-4 text-purple-200" />
                <span>Είσοδος Διαχειριστή (Admin)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {appRole === 'admin' && (
        <div className="space-y-6">
          {/* Metric Cards - Active Cycle Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-1 text-slate-100">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Ενεργός Κύκλος</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xl font-bold text-white">2025 - 2026</p>
              <p className="text-[11px] text-purple-400 font-medium">Σε εξέλιξη (Περίοδος Α1 & Α2)</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-1 text-slate-100">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Σύνολο Αξιολογούμενων</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl font-bold text-white">1,420</p>
              <p className="text-[11px] text-slate-400">Εκπαιδευτικοί Πρωτοβάθμιας & Δευτεροβάθμιας</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-1 text-slate-100">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Ολοκληρώθηκαν</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-400">890 (62.6%)</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full w-[62.6%]"></div>
              </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-1 text-slate-100">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Εκκρεμείς Αξιολογήσεις</span>
                <BarChart3 className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-400">530</p>
              <p className="text-[11px] text-amber-300 font-medium">Σε στάδιο Α1 & Β</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6 text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <ClipboardCheck className="w-5 h-5 text-purple-400" />
                  <span>Μητρώο Αξιολογήσεων Εκπαιδευτικών</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ανάθεση αξιολογητών, παρακολούθηση σταδίων & βαθμολογίες
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Αναζήτηση Εκπαιδευτικού..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                >
                  <option value="all">Όλα τα Στάδια</option>
                  <option value="A1_διδακτικό_έργο">A1. Διδακτικό Έργο</option>
                  <option value="A2_παιδαγωγικό_κλίμα">A2. Παιδαγωγικό Κλίμα</option>
                  <option value="B_υπηρεσιακό_έργο">B. Υπηρεσιακό Έργο</option>
                  <option value="ολοκληρώθηκε">Ολοκληρώθηκε</option>
                </select>
              </div>
            </div>

            {/* Evaluations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-300 font-bold border-b border-slate-800">
                    <th className="p-3">Εκπαιδευτικός</th>
                    <th className="p-3">Ειδικότητα</th>
                    <th className="p-3">Σχολείο</th>
                    <th className="p-3">Αξιολογητής A (Σύμβουλος)</th>
                    <th className="p-3">Αξιολογητής B (Διευθυντής)</th>
                    <th className="p-3">Στάδιο</th>
                    <th className="p-3">Βαθμός / Χαρακτηρισμός</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredEvals.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{item.teacherName}</div>
                        <div className="font-mono text-[10px] text-slate-400">ΑΦΜ: {item.teacherAfm}</div>
                      </td>
                      <td className="p-3 text-slate-300">{item.specialty}</td>
                      <td className="p-3 text-slate-300">{item.schoolName}</td>
                      <td className="p-3 text-slate-400">{item.evaluatorA}</td>
                      <td className="p-3 text-slate-400">{item.evaluatorB}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.stage === 'ολοκληρώθηκε'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {item.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {item.grade ? (
                          <div className="flex items-center space-x-1">
                            <Award className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-bold text-slate-200">{item.grade.replace('_', ' ')}</span>
                            {item.score && <span className="text-slate-400 font-mono">({item.score}/100)</span>}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Σε εκκρεμότητα</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Database Credentials Inspector */}
            <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-xs text-slate-200">
                    Ρυθμίσεις Συνδεσιμότητας Βάσης Δεδομένων (axiologisi)
                  </span>
                </div>
                <span className="text-[10px] text-purple-400 font-mono">Status: Connected</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Host:</span>
                  <span>{dbConfig.host}:{dbConfig.port}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Database Name:</span>
                  <span className="text-purple-400">{dbConfig.database}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DB User:</span>
                  <span>{dbConfig.user}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Table Prefix:</span>
                  <span className="text-amber-400">{dbConfig.tablePrefix}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN LOGIN MODAL */}
      {/* ========================================================================= */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-800 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Είσοδος Διαχειριστή (Admin)
                </h3>
              </div>
              <button
                onClick={() => setIsAdminLoginOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminLoginError && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Όνομα Χρήστη (Username):
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="π.χ. plinetamag"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-100 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Κωδικός Πρόσβασης (Password):
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-100 font-mono text-xs"
                />
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                💡 <span className="font-semibold text-purple-300">Placeholder Διαχειριστή:</span> Χρησιμοποιήστε <code className="text-purple-300 bg-purple-950/80 px-1 py-0.5 rounded">plinetamag</code> / <code className="text-purple-300 bg-purple-950/80 px-1 py-0.5 rounded">pl!n3tAmag</code>.
              </p>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdminLoginOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow transition"
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
};

