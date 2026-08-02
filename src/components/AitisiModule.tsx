import React, { useState } from 'react';
import { Teacher, Application, DbConfig } from '../types';
import { sampleTeachers, sampleApplications } from '../data/mockData';
import { PrintDocument } from './PrintDocument';
import {
  FileText,
  Search,
  UserCheck,
  CheckCircle,
  PlusCircle,
  Printer,
  Shield,
  Database,
  Edit3,
  Send,
  AlertCircle,
  Filter,
  Layers,
  Settings,
} from 'lucide-react';

interface AitisiModuleProps {
  dbConfig: DbConfig;
  onUpdateDbConfig: (config: DbConfig) => void;
}

export const AitisiModule: React.FC<AitisiModuleProps> = ({
  dbConfig,
  onUpdateDbConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'teacher_portal' | 'admin_panel'>('teacher_portal');
  
  // Teacher Portal State
  const [searchAfm, setSearchAfm] = useState('012345678');
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(sampleTeachers[0]);
  const [applications, setApplications] = useState<Application[]>(sampleApplications);
  const [selectedAppForPrint, setSelectedAppForPrint] = useState<Application | null>(null);

  // New Application Form State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newType, setNewType] = useState<Application['applicationType']>('απόσπαση');
  const [prefInput, setPrefInput] = useState('');
  const [preferences, setPreferences] = useState<string[]>([
    '1ο Δημοτικό Κηφισιάς',
    '2ο Δημοτικό Αμαρουσίου',
  ]);
  const [comments, setComments] = useState('');
  const [hasMedical, setHasMedical] = useState(false);
  const [hasCohab, setHasCohab] = useState(true);
  const [cohabMuni, setCohabMuni] = useState('Δήμος Αμαρουσίου');
  const [maritalStatus, setMaritalStatus] = useState<'άγαμος' | 'έγγαμος' | 'διαζευγμένος'>('έγγαμος');
  const [childrenCount, setChildrenCount] = useState(2);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Admin Tab Filter State
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');

  // Teacher lookup handler
  const handleTeacherLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const found = sampleTeachers.find((t) => t.afm === searchAfm || t.amka === searchAfm);
    if (found) {
      setActiveTeacher(found);
      setSubmitSuccessMsg(null);
    } else {
      alert(`Δεν βρέθηκε εκπαιδευτικός με ΑΦΜ/ΑΜΚΑ: ${searchAfm}. Δοκιμάστε 012345678 ή 098765432.`);
    }
  };

  // Add preference
  const handleAddPreference = () => {
    if (prefInput.trim()) {
      setPreferences([...preferences, prefInput.trim()]);
      setPrefInput('');
    }
  };

  // Submit Application Handler
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeacher) return;

    const newProtocol = `ΑΙΤ-2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: Application = {
      id: `app-${Date.now()}`,
      protocolNumber: newProtocol,
      teacherId: activeTeacher.id,
      teacherAfm: activeTeacher.afm,
      teacherName: `${activeTeacher.firstName} ${activeTeacher.lastName}`,
      specialty: `${activeTeacher.specialtyCode} - ${activeTeacher.specialtyName}`,
      applicationType: newType,
      status: 'υποβλήθηκε',
      submissionDate: new Date().toISOString().split('T')[0],
      preferences,
      comments,
      hasMedicalReason: hasMedical,
      hasCohabitation: hasCohab,
      coHabitationMuni: hasCohab ? cohabMuni : undefined,
      maritalStatus,
      childrenCount,
    };

    setApplications([newApp, ...applications]);
    setIsCreatingNew(false);
    setSubmitSuccessMsg(`Η αίτηση υποβλήθηκε επιτυχώς με Αριθμό Πρωτοκόλλου: ${newProtocol}`);
  };

  // Admin status update
  const handleUpdateAppStatus = (appId: string, newStatus: Application['status']) => {
    setApplications(
      applications.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
  };

  // Filtered applications for admin
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.teacherName.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      app.teacherAfm.includes(adminSearchQuery) ||
      app.protocolNumber.toLowerCase().includes(adminSearchQuery.toLowerCase());
    const matchesStatus = adminStatusFilter === 'all' || app.status === adminStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const teacherApps = activeTeacher
    ? applications.filter((app) => app.teacherAfm === activeTeacher.afm)
    : [];

  return (
    <div className="space-y-6">
      {/* Printable Modal Render */}
      {selectedAppForPrint && (
        <PrintDocument
          type="aitisi"
          applicationData={selectedAppForPrint}
          onClose={() => setSelectedAppForPrint(null)}
        />
      )}

      {/* Application Top Bar Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">1. Η-Αίτηση (e-Aitisi)</h1>
          </div>
          <p className="text-xs text-emerald-200/80">
            Πύλη Ηλεκτρονικών Αιτήσεων Εκπαιδευτικών & Διαχείριση Βάσης Δεδομένων
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded-xl border border-emerald-700/40">
          <button
            onClick={() => setActiveTab('teacher_portal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'teacher_portal'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Πύλη Εκπαιδευτικών</span>
          </button>
          <button
            onClick={() => setActiveTab('admin_panel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'admin_panel'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Διαχείριση (Admin)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEACHER PORTAL */}
      {activeTab === 'teacher_portal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Teacher Search & Profile Info */}
          <div className="space-y-6">
            {/* AFM Search Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Αναζήτηση & Ταυτοποίηση</span>
              </h3>
              <p className="text-xs text-slate-500">
                Εισάγετε Α.Φ.Μ. ή Α.Μ.Κ.Α. για ανάκτηση στοιχείων από τη βάση δεδομένων:
              </p>
              <form onSubmit={handleTeacherLookup} className="flex space-x-2">
                <input
                  type="text"
                  value={searchAfm}
                  onChange={(e) => setSearchAfm(e.target.value)}
                  placeholder="π.χ. 012345678"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Ανάκτηση
                </button>
              </form>
            </div>

            {/* Active Teacher Profile Info */}
            {activeTeacher && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {activeTeacher.firstName[0]}
                      {activeTeacher.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {activeTeacher.firstName} {activeTeacher.lastName}
                      </h4>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        {activeTeacher.specialtyCode} - {activeTeacher.specialtyName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Επαληθευμένος
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Πατρώνυμο:</span>
                    <span className="font-medium text-slate-200">{activeTeacher.fatherName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Α.Φ.Μ.:</span>
                    <span className="font-mono text-slate-200">{activeTeacher.afm}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Α.Μ.Κ.Α.:</span>
                    <span className="font-mono text-slate-200">{activeTeacher.amka}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Οργανική Θέση:</span>
                    <span className="font-medium text-slate-200">{activeTeacher.organicSchool}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Υπηρετεί στο:</span>
                    <span className="font-medium text-slate-200">{activeTeacher.currentSchool}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Έτη Υπηρεσίας:</span>
                    <span className="font-medium text-slate-200">{activeTeacher.yearsOfService} έτη</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Applications List & Creation Form */}
          <div className="lg:col-span-2 space-y-6">
            {submitSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center space-x-3 text-xs shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{submitSuccessMsg}</span>
              </div>
            )}

            {/* Submissions Management Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Αιτήσεις Εκπαιδευτικού
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ιστορικό υποβολών & δημιουργία νέας αίτησης
                  </p>
                </div>
                {!isCreatingNew && (
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center space-x-2 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Νέα Αίτηση</span>
                  </button>
                )}
              </div>

              {/* NEW APPLICATION FORM */}
              {isCreatingNew ? (
                <form onSubmit={handleSubmitApplication} className="space-y-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                      <Edit3 className="w-4 h-4 text-emerald-600" />
                      <span>Συμπλήρωση Νέας Αίτησης</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Ακύρωση
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Τύπος Αίτησης</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="απόσπαση">Αίτηση Απόσπασης</option>
                        <option value="μετάθεση">Αίτηση Μετάθεσης</option>
                        <option value="βελτίωση">Αίτηση Βελτίωσης Θέσης</option>
                        <option value="άδεια">Αίτηση Μακροχρόνιας Άδειας</option>
                        <option value="ειδική_αίτηση">Ειδική Αίτηση</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Οικογενειακή Κατάσταση</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value as any)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="έγγαμος">Έγγαμος/η</option>
                        <option value="άγαμος">Άγαμος/η</option>
                        <option value="διαζευγμένος">Διαζευγμένος/η</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Αριθμός Ανήλικων Τέκνων</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-4">
                      <input
                        type="checkbox"
                        id="medical"
                        checked={hasMedical}
                        onChange={(e) => setHasMedical(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                      />
                      <label htmlFor="medical" className="font-medium text-slate-700">
                        Ειδική κατηγορία / Λόγοι υγείας
                      </label>
                    </div>
                  </div>

                  {/* Co-habitation info */}
                  <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="cohab"
                        checked={hasCohab}
                        onChange={(e) => setHasCohab(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                      />
                      <label htmlFor="cohab" className="font-semibold text-slate-700">
                        Αίτημα μοριοδότησης Συνυπηρέτησης
                      </label>
                    </div>
                    {hasCohab && (
                      <input
                        type="text"
                        placeholder="Δήμος Συνυπηρέτησης (π.χ. Δήμος Αμαρουσίου)"
                        value={cohabMuni}
                        onChange={(e) => setCohabMuni(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    )}
                  </div>

                  {/* Preferences input */}
                  <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
                    <label className="block font-semibold text-slate-700">
                      Προτιμήσεις Σχολικών Μονάδων (κατά σειρά προτεραιότητας)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={prefInput}
                        onChange={(e) => setPrefInput(e.target.value)}
                        placeholder="Προσθέστε σχολείο (π.χ. 3ο Δημοτικό Χαλανδρίου)"
                        className="flex-1 p-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddPreference}
                        className="px-3 py-2 bg-slate-800 text-white rounded-xl font-medium"
                      >
                        Προσθήκη
                      </button>
                    </div>
                    <ol className="list-decimal pl-5 space-y-1 text-slate-700 pt-1 font-medium">
                      {preferences.map((p, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span>{p}</span>
                          <button
                            type="button"
                            onClick={() => setPreferences(preferences.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-[10px] ml-2"
                          >
                            Διαγραφή
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Justification / Comments */}
                  <div className="text-xs">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Αιτιολογία & Παρατηρήσεις
                    </label>
                    <textarea
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Προσθέστε τυχόν επιπλέον παρατηρήσεις για την υπηρεσία..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium"
                    >
                      Ακύρωση
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center space-x-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>Οριστική Υποβολή</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* EXISTING APPLICATIONS LIST */
                <div className="space-y-4">
                  {teacherApps.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      Δεν βρέθηκαν υποβληθείσες αιτήσεις για αυτόν τον εκπαιδευτικό.
                    </div>
                  ) : (
                    teacherApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-800 text-sm">
                              {app.protocolNumber}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {app.applicationType}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                app.status === 'εγκρίθηκε'
                                  ? 'bg-emerald-600 text-white'
                                  : app.status === 'υποβλήθηκε'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-slate-600">
                            <strong>Ημερομηνία:</strong> {app.submissionDate} |{' '}
                            <strong>Προτιμήσεις:</strong> {app.preferences.length} σχολικές μονάδες
                          </p>
                          {app.comments && (
                            <p className="text-slate-500 italic text-[11px]">"{app.comments}"</p>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedAppForPrint(app)}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-sm transition self-start sm:self-auto"
                        >
                          <Printer className="w-4 h-4 text-emerald-400" />
                          <span>Εκτύπωση Εγγράφου</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN PANEL FOR E-AITISI */}
      {activeTab === 'admin_panel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>Διαχείριση Αιτήσεων Εκπαιδευτικών (e-Aitisi Admin)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Επισκόπηση υποβολών, έλεγχος δικαιολογητικών & έγκριση/απόρριψη αιτήσεων
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Αναζήτηση ΑΦΜ, Ονόματος..."
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="all">Όλες οι Καταστάσεις</option>
                  <option value="υποβλήθηκε">Υποβλήθηκε</option>
                  <option value="σε_επεξεργασία">Σε Επεξεργασία</option>
                  <option value="εγκρίθηκε">Εγκρίθηκε</option>
                  <option value="απορρίφθηκε">Απορρίφθηκε</option>
                </select>
              </div>
            </div>

            {/* Applications Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Αρ. Πρωτοκόλλου</th>
                    <th className="p-3">Εκπαιδευτικός</th>
                    <th className="p-3">Α.Φ.Μ.</th>
                    <th className="p-3">Ειδικότητα</th>
                    <th className="p-3">Τύπος</th>
                    <th className="p-3">Ημερομηνία</th>
                    <th className="p-3">Κατάσταση</th>
                    <th className="p-3 text-right">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">{app.protocolNumber}</td>
                      <td className="p-3 font-semibold text-slate-800">{app.teacherName}</td>
                      <td className="p-3 font-mono text-slate-600">{app.teacherAfm}</td>
                      <td className="p-3 text-slate-600">{app.specialty}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                          {app.applicationType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{app.submissionDate}</td>
                      <td className="p-3">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                          className={`px-2 py-1 rounded text-[11px] font-bold border ${
                            app.status === 'εγκρίθηκε'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : app.status === 'απορρίφθηκε'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-blue-50 text-blue-800 border-blue-300'
                          }`}
                        >
                          <option value="υποβλήθηκε">Υποβλήθηκε</option>
                          <option value="σε_επεξεργασία">Σε Επεξεργασία</option>
                          <option value="εγκρίθηκε">Εγκρίθηκε</option>
                          <option value="απορρίφθηκε">Απορρίφθηκε</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedAppForPrint(app)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition"
                          title="Εκτύπωση Αίτησης"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DB Configuration Inspector Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs text-slate-200">
                    Ρυθμίσεις Συνδεσιμότητας Βάσης Δεδομένων (e_aitisi_db)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Status: Connected</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Host:</span>
                  <span>{dbConfig.host}:{dbConfig.port}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Database Name:</span>
                  <span className="text-emerald-400">{dbConfig.database}</span>
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
    </div>
  );
};
