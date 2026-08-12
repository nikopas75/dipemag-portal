import React from 'react';
import {
  Building,
  Shield,
  GraduationCap,
  Clock,
  Sparkles,
  Users,
  ChevronRight,
  X,
  User,
  Key,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { SchoolCategory, SchoolUser } from '../types';

interface ProgrammatismosLandingProps {
  appRole: 'landing' | 'director' | 'admin';
  setAppRole: (role: 'landing' | 'director' | 'admin') => void;
  setActiveSchool: (sch: SchoolUser | null) => void;
  schoolType: SchoolCategory;
  setSchoolType: (type: SchoolCategory) => void;
  isDirectorLoginOpen: boolean;
  setIsDirectorLoginOpen: (open: boolean) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;
  directorSchoolCode: string;
  setDirectorSchoolCode: (code: string) => void;
  directorAm: string;
  setDirectorAm: (am: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  loginError: string | null;
  setLoginError: (err: string | null) => void;
  availableSchools: SchoolUser[];
  onDirectorLogin: (e: React.FormEvent) => void;
  adminUsername: string;
  setAdminUsername: (u: string) => void;
  adminPassword: string;
  setAdminPassword: (p: string) => void;
  adminLoginError: string | null;
  setAdminLoginError: (err: string | null) => void;
  onAdminLogin: (e: React.FormEvent) => void;
}

export const ProgrammatismosLanding: React.FC<ProgrammatismosLandingProps> = ({
  appRole,
  setAppRole,
  setActiveSchool,
  schoolType,
  setSchoolType,
  isDirectorLoginOpen,
  setIsDirectorLoginOpen,
  isAdminLoginOpen,
  setIsAdminLoginOpen,
  directorSchoolCode,
  setDirectorSchoolCode,
  directorAm,
  setDirectorAm,
  showPassword,
  setShowPassword,
  loginError,
  setLoginError,
  availableSchools,
  onDirectorLogin,
  adminUsername,
  setAdminUsername,
  adminPassword,
  setAdminPassword,
  adminLoginError,
  setAdminLoginError,
  onAdminLogin
}) => {
  return (
    <>
      {/* 1. LANDING VIEW (When not logged in) */}
      {appRole === 'landing' && (
        <div className="space-y-8">
          <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden text-slate-100">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ηλεκτρονική Πλατφόρμα Προγραμματισμού</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Καλώς ήρθατε στο Σύστημα Προγραμματισμού Σχολικών Μονάδων
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Η εφαρμογή επιτρέπει στους Διευθυντές και Προϊσταμένους των σχολικών μονάδων να υποβάλλουν ηλεκτρονικά τα στοιχεία για το <strong className="text-amber-300">Μαθητικό Δυναμικό</strong> (τμήματα, εγγραφές, ολοήμερο) και το <strong className="text-amber-300">Ωράριο Εκπαιδευτικών</strong> (κατανομή ωρών ανά ειδικότητα), παρέχοντας παράλληλα στους διαχειριστές της ΔΠΕ πλήρη εικόνα και δυνατότητες εξαγωγής αναφορών.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  <span>1. Μαθητικό Δυναμικό</span>
                </div>
                <p className="text-xs text-slate-400">
                  Καταγραφή μαθητών ανά τάξη (Α-ΣΤ), τμημάτων, ολοήμερου προγράμματος, τμημάτων ένταξης και παράλληλης στήριξης.
                </p>
              </div>

              <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>2. Ωράριο Εκπαιδευτικών</span>
                </div>
                <p className="text-xs text-slate-400">
                  Κατανομή διατιθέμενων &amp; προβλεπόμενων ωρών διδασκαλίας ανά ειδικότητα (ΠΕ70, ΠΕ05, ΠΕ06, ΠΕ07, ΠΕ08, ΠΕ11, ΠΕ79, ΠΕ86, ΠΕ91).
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => {
                  setAppRole('director');
                  setActiveSchool(null);
                  setLoginError(null);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 cursor-pointer"
              >
                <Building className="w-4 h-4" />
                <span>Είσοδος Χρήστη (Διευθυντής/Προϊστάμενος)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setAdminUsername('');
                  setAdminPassword('');
                  setAdminLoginError(null);
                  setIsAdminLoginOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Είσοδος Διαχειριστή (Admin)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DIRECTOR LOGIN LANDING PAGE (Select School Category) */}
      {appRole === 'director' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Building className="w-6 h-6 text-amber-400" />
              <span>Επιλέξτε Τύπο Σχολικής Μονάδας</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Επιλέξτε την κατηγορία του σχολείου σας για να ανοίξει το παράθυρο σύνδεσης με τη σχετική φόρμα υποβολής.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {/* Card 1: Δημοτικά Σχολεία */}
            <div 
              onClick={() => {
                setSchoolType('dim');
                setDirectorSchoolCode('');
                setDirectorAm('');
                setLoginError(null);
                setIsDirectorLoginOpen(true);
              }}
              className="group bg-gradient-to-b from-slate-900 to-slate-950 hover:from-amber-950/40 hover:to-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl shadow-xl hover:shadow-amber-950/30 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-20 h-20 text-amber-400" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    Δημοτικά Σχολεία
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Τακτικά Δημοτικά Σχολεία ΔΠΕ Μαγνησίας. Υποβολή Μαθητικού Δυναμικού (Α-ΣΤ, Ολοήμερο, ΤΜ) &amp; Ωραρίου.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                  Σύνδεση &rarr;
                </span>
                <ChevronRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Νηπιαγωγεία */}
            <div 
              onClick={() => {
                setSchoolType('nip');
                setDirectorSchoolCode('');
                setDirectorAm('');
                setLoginError(null);
                setIsDirectorLoginOpen(true);
              }}
              className="group bg-gradient-to-b from-slate-900 to-slate-950 hover:from-amber-950/40 hover:to-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl shadow-xl hover:shadow-amber-950/30 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-20 h-20 text-amber-400" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    Νηπιαγωγεία
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Δημόσια Νηπιαγωγεία ΔΠΕ Μαγνησίας. Υποβολή Νηπίων/Προνηπίων, Ολοήμερου &amp; Προσωπικού.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                  Σύνδεση &rarr;
                </span>
                <ChevronRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Ειδικά Δημοτικά */}
            <div 
              onClick={() => {
                setSchoolType('eid_dim');
                setDirectorSchoolCode('');
                setDirectorAm('');
                setLoginError(null);
                setIsDirectorLoginOpen(true);
              }}
              className="group bg-gradient-to-b from-slate-900 to-slate-950 hover:from-amber-950/40 hover:to-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl shadow-xl hover:shadow-amber-950/30 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-20 h-20 text-amber-400" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    Ειδικά Δημοτικά
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Δημοτικά Σχολεία Ειδικής Αγωγής (ΣΜΕΑΕ, Ε.Ε.Ε.Ε.Κ.). Προπαρασκευαστικά, Τάξεις Α-ΣΤ, ΕΕΠ &amp; ΕΒΠ.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                  Σύνδεση &rarr;
                </span>
                <ChevronRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Ειδικά Νηπιαγωγεία */}
            <div 
              onClick={() => {
                setSchoolType('eid_nip');
                setDirectorSchoolCode('');
                setDirectorAm('');
                setLoginError(null);
                setIsDirectorLoginOpen(true);
              }}
              className="group bg-gradient-to-b from-slate-900 to-slate-950 hover:from-amber-950/40 hover:to-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl shadow-xl hover:shadow-amber-950/30 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-20 h-20 text-amber-400" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/30">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    Ειδικά Νηπιαγωγεία
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Νηπιαγωγεία Ειδικής Αγωγής ΔΠΕ Μαγνησίας. Ειδικές Δομές, Προνήπια/Νήπια, ΕΕΠ (ΠΕ21-ΠΕ30) &amp; ΕΒΠ (ΔΕ1ΕΒΠ).
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                  Σύνδεση &rarr;
                </span>
                <ChevronRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECTOR LOGIN MODAL */}
      {isDirectorLoginOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl max-w-lg w-full p-6 space-y-6 border border-amber-900/50 shadow-2xl animate-in fade-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-400">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Σύνδεση Διευθυντή / Προϊσταμένου
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Επιλέξτε Σχολείο &amp; Εισάγετε τον Αριθμό Μητρώου (AM)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDirectorLoginOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400">
                Τύπος Σχολικής Μονάδας:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSchoolType('dim');
                    setLoginError(null);
                  }}
                  className={`py-2 px-1.5 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    schoolType === 'dim'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Δημοτικά
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSchoolType('nip');
                    setLoginError(null);
                  }}
                  className={`py-2 px-1.5 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    schoolType === 'nip'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Νηπιαγωγεία
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSchoolType('eid_dim');
                    setLoginError(null);
                  }}
                  className={`py-2 px-1.5 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    schoolType === 'eid_dim'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Ειδικά Δημοτικά
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSchoolType('eid_nip');
                    setLoginError(null);
                  }}
                  className={`py-2 px-1.5 text-center rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    schoolType === 'eid_nip'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Ειδικά Νηπιαγωγεία
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center gap-2.5 animate-in shake">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={onDirectorLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Επιλογή Σχολικής Μονάδας (Λίστα):
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
                  <select
                    value={directorSchoolCode}
                    onChange={e => {
                      setDirectorSchoolCode(e.target.value);
                      setLoginError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500 shadow-inner"
                  >
                    <option value="" className="bg-slate-900 text-slate-400 font-medium py-1">
                      -- Επιλέξτε Σχολική Μονάδα --
                    </option>
                    {availableSchools
                      .slice()
                      .sort((a, b) => (Number(a.SchID) || 0) - (Number(b.SchID) || 0))
                      .map((sch, idx) => (
                        <option key={`opt-sch-${sch.SchCode}-${idx}`} value={sch.SchCode} className="bg-slate-900 text-slate-100 font-medium py-1">
                          {sch.SchID ? `${sch.SchID}. ` : ''}{sch.SchName} ({sch.SchCode})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Κωδικός Σχολείου (ΥΠΑΙΘ):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={directorSchoolCode}
                    onChange={e => {
                      setDirectorSchoolCode(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="π.χ. 9350053"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Αριθμός Μητρώου (AM) Διευθυντή/Προϊσταμένου:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={directorAm}
                    onChange={e => {
                      setDirectorAm(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="π.χ. 210543"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDirectorLoginOpen(false)}
                  className="px-4 py-2.5 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={!directorSchoolCode.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  Είσοδος στην Πλατφόρμα
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl max-w-md w-full p-6 space-y-5 border border-amber-900/50 shadow-2xl animate-in fade-in zoom-in-95 relative overflow-hidden text-slate-100">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Σύνδεση Διαχειριστή (Admin)
                </h3>
              </div>
              <button
                onClick={() => setIsAdminLoginOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminLoginError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center space-x-2 animate-in shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={onAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Όνομα Χρήστη (Username):
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  placeholder="Όνομα χρήστη..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Κωδικός Πρόσβασης (Password):
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 shadow-inner"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdminLoginOpen(false)}
                  className="px-4 py-2.5 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
                >
                  Σύνδεση
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
