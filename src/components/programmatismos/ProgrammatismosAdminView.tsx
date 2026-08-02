import React from 'react';
import {
  Shield,
  Terminal,
  Building2,
  Download,
  Server,
  Lock,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Upload,
  UserCheck,
  CheckCircle,
  Eye,
  Calendar,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { AdminRecord } from './types';
import { getSchoolTypeLabel } from './utils';

interface ProgrammatismosAdminViewProps {
  // Modes & Navigation
  adminMode: 'console' | 'schools';
  setAdminMode: (mode: 'console' | 'schools') => void;
  consoleSubTab: 'export' | 'maintenance' | 'security';
  setConsoleSubTab: (tab: 'export' | 'maintenance' | 'security') => void;
  schoolsCategoryFilter: 'dim' | 'nip' | 'eid_dim' | 'eid_nip';
  setSchoolsCategoryFilter: (filter: 'dim' | 'nip' | 'eid_dim' | 'eid_nip') => void;
  schoolsViewFormat: 'overview' | 'catalog';
  setSchoolsViewFormat: (format: 'overview' | 'catalog') => void;

  adminRecords: AdminRecord[];
  adminUserRecords: any[];
  adminSearch: string;
  setAdminSearch: (s: string) => void;
  isLoadingAdmin: boolean;

  // Actions
  onExportAdminCsv: (filter?: string) => void;
  onExportAdminUserCsv: (filter?: string) => void;
  onExportTableCsv: (table: string) => void;

  // SQL Console
  sqlQuery: string;
  setSqlQuery: (q: string) => void;
  sqlResult: any;
  sqlError: string | null;
  onExecuteSql: () => void;

  // Sync Wizard
  syncTargetTable: 'all_dim' | 'all_nip' | 'all_tables' | 'dim_users' | 'nip_users' | 'eid_dim_users' | 'eid_nip_users';
  setSyncTargetTable: (t: any) => void;
  syncCsvFileName: string;
  syncRawRows: any[];
  syncCsvHeaders: string[];
  syncCodeCol: string;
  setSyncCodeCol: (c: string) => void;
  syncNameCol: string;
  setSyncNameCol: (c: string) => void;
  syncAmCol: string;
  setSyncAmCol: (c: string) => void;
  syncAfmCol: string;
  setSyncAfmCol: (c: string) => void;
  skipBlankDirectorInCsv: boolean;
  setSkipBlankDirectorInCsv: (skip: boolean) => void;
  isSyncing: boolean;
  syncSuccessMsg: string | null;
  syncErrorMsg: string | null;
  dbCurrentUsers: any[];
  isLoadingDbUsers: boolean;
  onSyncCsvFileSelect: (file: File) => void;
  onExecutePrincipalSync: () => void;
  getEffectivePrID: (row: any) => { prId: string; source: 'am' | 'afm' | 'none' };

  // Security / Password Management
  currentAdminUser: string;
  adminList: { username: string; password: string }[];
  newAdminPasswordInput: string;
  setNewAdminPasswordInput: (p: string) => void;
  showAdminPassToggle: boolean;
  setShowAdminPassToggle: (show: boolean) => void;
  newAdminUser: string;
  setNewAdminUser: (u: string) => void;
  newAdminPassword: string;
  setNewAdminPassword: (p: string) => void;
  adminSecSuccessMsg: string | null;
  adminSecErrorMsg: string | null;
  onSaveAdminPassword: () => void;
  onAddAdminAccount: () => void;
  onRemoveAdminAccount: (user: string) => void;

  // School Users Direct Management (*_users)
  isSchoolModalOpen: boolean;
  setIsSchoolModalOpen: (open: boolean) => void;
  editingSchoolRecord: {
    SchID?: number;
    sourceTable: string;
    SchCode: string;
    SchName: string;
    PrID: string;
    PrName: string;
    Organ: string;
    Location: string;
    Password?: string;
  };
  setEditingSchoolRecord: (rec: any) => void;
  schoolModalError: string | null;
  schoolModalSuccess: string | null;
  isSavingSchoolUser: boolean;
  onOpenNewSchoolModal: (defaultTable?: string) => void;
  onOpenEditSchoolModal: (rec: any) => void;
  onSaveSchoolUser: (e: React.FormEvent) => void;
  onDeleteSchoolUser: (rec: any) => void;
  onRefreshAdminRecords?: () => void;
}

export const ProgrammatismosAdminView: React.FC<ProgrammatismosAdminViewProps> = ({
  adminMode,
  setAdminMode,
  consoleSubTab,
  setConsoleSubTab,
  onRefreshAdminRecords,
  schoolsCategoryFilter,
  setSchoolsCategoryFilter,
  schoolsViewFormat,
  setSchoolsViewFormat,
  adminRecords,
  adminUserRecords,
  adminSearch,
  setAdminSearch,
  isLoadingAdmin,
  onExportAdminCsv,
  onExportAdminUserCsv,
  onExportTableCsv,
  sqlQuery,
  setSqlQuery,
  sqlResult,
  sqlError,
  onExecuteSql,
  syncTargetTable,
  setSyncTargetTable,
  syncCsvFileName,
  syncRawRows,
  syncCsvHeaders,
  syncCodeCol,
  setSyncCodeCol,
  syncNameCol,
  setSyncNameCol,
  syncAmCol,
  setSyncAmCol,
  syncAfmCol,
  setSyncAfmCol,
  skipBlankDirectorInCsv,
  setSkipBlankDirectorInCsv,
  isSyncing,
  syncSuccessMsg,
  syncErrorMsg,
  dbCurrentUsers,
  isLoadingDbUsers,
  onSyncCsvFileSelect,
  onExecutePrincipalSync,
  getEffectivePrID,
  currentAdminUser,
  adminList,
  newAdminPasswordInput,
  setNewAdminPasswordInput,
  showAdminPassToggle,
  setShowAdminPassToggle,
  newAdminUser,
  setNewAdminUser,
  newAdminPassword,
  setNewAdminPassword,
  adminSecSuccessMsg,
  adminSecErrorMsg,
  onSaveAdminPassword,
  onAddAdminAccount,
  onRemoveAdminAccount,
  isSchoolModalOpen,
  setIsSchoolModalOpen,
  editingSchoolRecord,
  setEditingSchoolRecord,
  schoolModalError,
  schoolModalSuccess,
  isSavingSchoolUser,
  onOpenNewSchoolModal,
  onOpenEditSchoolModal,
  onSaveSchoolUser,
  onDeleteSchoolUser
}) => {
  const isSuperUser = currentAdminUser === 'plinetamag';

  // State for submission start date filter (persisted in localStorage)
  const [submissionStartDate, setSubmissionStartDate] = React.useState<string>(() => {
    const saved = localStorage.getItem('programmatismos_start_date');
    if (saved) return saved;
    return '2026-01-01T00:00';
  });

  // Timezone-agnostic parsing helper: treats timestamps as literal face values (YYYY-MM-DD HH:mm:ss)
  const parseLiteralTimestampToMs = (ts?: string | null): number => {
    if (!ts) return 0;
    try {
      const clean = String(ts).replace('T', ' ').replace('Z', '').split('.')[0].trim();
      const [datePart, timePart = '00:00:00'] = clean.split(' ');
      if (!datePart) return 0;
      const [yStr, mStr, dStr] = datePart.split('-');
      if (!yStr || !mStr || !dStr) return 0;

      const [hStr = '00', minStr = '00', sStr = '00'] = timePart.split(':');
      
      const year = parseInt(yStr, 10);
      const month = parseInt(mStr, 10) - 1;
      const day = parseInt(dStr, 10);
      const hours = parseInt(hStr, 10);
      const mins = parseInt(minStr, 10);
      const secs = parseInt(sStr, 10);

      if (isNaN(year) || isNaN(month) || isNaN(day)) return 0;

      return Date.UTC(year, month, day, hours, mins, secs);
    } catch (e) {
      return 0;
    }
  };

  // Helper to generate current browser local date-time string without timezone offset shift
  const getNowLiteralDateTimeString = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${mins}`;
  };

  // Helper to test if a record has timestamp updated after submission start date (timezone-agnostic)
  const isSubmittedAfterStart = (r: AdminRecord, startDateStr: string) => {
    if (!startDateStr) return false;
    const startTime = parseLiteralTimestampToMs(startDateStr);
    if (!startTime) return false;

    const mathTime = parseLiteralTimestampToMs(r.MathTimeStamp);
    const ekpTime = parseLiteralTimestampToMs(r.EkpTimeStamp);

    return (mathTime > startTime || ekpTime > startTime);
  };

  // Category statistics calculations
  const dimRecords = adminRecords.filter(r => r.category === 'dim');
  const totalDim = dimRecords.length;
  const submittedDim = dimRecords.filter(r => isSubmittedAfterStart(r, submissionStartDate)).length;
  const pctDim = totalDim > 0 ? Math.round((submittedDim / totalDim) * 100) : 0;

  const nipRecords = adminRecords.filter(r => r.category === 'nip');
  const totalNip = nipRecords.length;
  const submittedNip = nipRecords.filter(r => isSubmittedAfterStart(r, submissionStartDate)).length;
  const pctNip = totalNip > 0 ? Math.round((submittedNip / totalNip) * 100) : 0;

  const eidDimRecords = adminRecords.filter(r => r.category === 'eid_dim');
  const totalEidDim = eidDimRecords.length;
  const submittedEidDim = eidDimRecords.filter(r => isSubmittedAfterStart(r, submissionStartDate)).length;
  const pctEidDim = totalEidDim > 0 ? Math.round((submittedEidDim / totalEidDim) * 100) : 0;

  const eidNipRecords = adminRecords.filter(r => r.category === 'eid_nip');
  const totalEidNip = eidNipRecords.length;
  const submittedEidNip = eidNipRecords.filter(r => isSubmittedAfterStart(r, submissionStartDate)).length;
  const pctEidNip = totalEidNip > 0 ? Math.round((submittedEidNip / totalEidNip) * 100) : 0;

  // Data Reset State (*_data tables reset)
  const [resetCategory, setResetCategory] = React.useState<'dim' | 'nip' | 'eid_dim' | 'eid_nip' | 'all'>('all');
  const [resetConfirmChecked, setResetConfirmChecked] = React.useState(false);
  const [isResettingData, setIsResettingData] = React.useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = React.useState<string | null>(null);
  const [resetErrorMsg, setResetErrorMsg] = React.useState<string | null>(null);

  const handleExecuteDataReset = async () => {
    if (!resetConfirmChecked) return;
    setIsResettingData(true);
    setResetSuccessMsg(null);
    setResetErrorMsg(null);

    try {
      const res = await fetch('/api/programmatismos/admin/reset-data-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: resetCategory })
      });
      const data = await res.json();
      if (data.success) {
        setResetSuccessMsg(data.message);
        setResetConfirmChecked(false);
        if (onRefreshAdminRecords) {
          onRefreshAdminRecords();
        }
      } else {
        setResetErrorMsg(data.error || 'Σφάλμα κατά την εκκαθάριση.');
      }
    } catch (err: any) {
      setResetErrorMsg('Σφάλμα δικτύου: ' + err.message);
    } finally {
      setIsResettingData(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header & Main Mode Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-600" />
            <span>Διαχείριση Προγραμματισμού (Admin Panel)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Κεντρική κονσόλα ενεργειών βάσης &amp; αυτόνομη προβολή σχολικών μονάδων
          </p>
        </div>

        {/* Top 2 Main Modes Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setAdminMode('console')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              adminMode === 'console'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>1. Κονσόλα Ενεργειών</span>
          </button>
          <button
            onClick={() => setAdminMode('schools')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              adminMode === 'schools'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>2. Διαχείριση Σχολείων</span>
          </button>
        </div>
      </div>

      {/* MODE 1: ΚΟΝΣΟΛΑ ΕΝΕΡΓΕΙΩΝ */}
      {adminMode === 'console' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setConsoleSubTab('export')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                consoleSubTab === 'export'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>1. Εξαγωγή Δεδομένων &amp; Αναφορές</span>
            </button>
            <button
              onClick={() => setConsoleSubTab('maintenance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                consoleSubTab === 'maintenance'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>2. Διαχείριση Βάσης &amp; Εργασίες Συντήρησης</span>
            </button>
            <button
              onClick={() => setConsoleSubTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                consoleSubTab === 'security'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>3. Ασφάλεια &amp; Λογαριασμοί Διαχειριστών</span>
            </button>
          </div>

          {/* SUB-TAB 1: EXPORT & REPORTS */}
          {consoleSubTab === 'export' && (
            <div className="space-y-6">
              {/* Submission Start Date Bar */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                      <span>Ημερομηνία &amp; Ώρα Έναρξης Υποβολών</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-mono">
                        Φίλτρο Ενεργών Υποβολών
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Υπολογισμός ποσοστών υποβολής με βάση τη χρονοσήμανση (TimeStamp). Προσμετρώνται μόνο τα σχολεία με ενημέρωση μετά την έναρξη.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-300 pl-2">Έναρξη:</span>
                  <input
                    type="datetime-local"
                    value={submissionStartDate}
                    onChange={e => {
                      setSubmissionStartDate(e.target.value);
                      localStorage.setItem('programmatismos_start_date', e.target.value);
                    }}
                    className="p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const nowStr = getNowLiteralDateTimeString();
                      setSubmissionStartDate(nowStr);
                      localStorage.setItem('programmatismos_start_date', nowStr);
                    }}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded-lg transition shadow"
                    title="Ορισμός τρέχουσας ώρας ως έναρξη"
                  >
                    Τώρα
                  </button>
                </div>
              </div>

              {/* 4 Category Statistics Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Δημοτικά Σχολεία */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-3 hover:border-blue-500/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-sm" />
                      <span>Δημοτικά Σχολεία</span>
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 font-bold border border-blue-800/80">
                      Δημοτικά
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-2xl font-black text-slate-100 font-mono">{pctDim}%</span>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {submittedDim} από {totalDim} σχολεία
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800/80">
                      {submittedDim}/{totalDim}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700">
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${pctDim}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Υποβολές μετά την έναρξη
                  </p>
                </div>

                {/* Card 2: Νηπιαγωγεία */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-3 hover:border-emerald-500/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
                      <span>Νηπιαγωγεία</span>
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/80">
                      Νηπιαγωγεία
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-2xl font-black text-slate-100 font-mono">{pctNip}%</span>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {submittedNip} από {totalNip} σχολεία
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                      {submittedNip}/{totalNip}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700">
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${pctNip}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Υποβολές μετά την έναρξη
                  </p>
                </div>

                {/* Card 3: Ειδικά Δημοτικά */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-3 hover:border-purple-500/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shadow-sm" />
                      <span>Ειδικά Δημοτικά</span>
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 font-bold border border-purple-800/80">
                      Ειδικά Δημοτικά
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-2xl font-black text-slate-100 font-mono">{pctEidDim}%</span>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {submittedEidDim} από {totalEidDim} σχολεία
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/80">
                      {submittedEidDim}/{totalEidDim}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700">
                    <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${pctEidDim}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Υποβολές μετά την έναρξη
                  </p>
                </div>

                {/* Card 4: Ειδικά Νηπιαγωγεία */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-3 hover:border-amber-500/60 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm" />
                      <span>Ειδικά Νηπιαγωγεία</span>
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 font-bold border border-amber-800/80">
                      Ειδικά Νηπιαγωγεία
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-2xl font-black text-slate-100 font-mono">{pctEidNip}%</span>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {submittedEidNip} από {totalEidNip} σχολεία
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/80">
                      {submittedEidNip}/{totalEidNip}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700">
                    <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${pctEidNip}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Υποβολές μετά την έναρξη
                  </p>
                </div>
              </div>

              {/* Export Categories by School Type (User-Friendly UI) */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-lg text-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                    <Download className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">
                      Εξαγωγή Αναλυτικών Δεδομένων ανά Κατηγορία Σχολικής Μονάδας
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Επιλέξτε την κατηγορία σχολικής μονάδας και τον τύπο αναφοράς που επιθυμείτε να εξαγάγετε σε αρχείο CSV
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category 1: Δημοτικά Σχολεία */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md hover:border-blue-500/60 transition">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-sm" />
                        <span>Δημοτικά Σχολεία</span>
                      </h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 font-bold border border-blue-800/80">
                        Γενικά Δημοτικά
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Εξαγωγή δεδομένων μαθητικού δυναμικού, τμημάτων, ολοήμερου προγράμματος και κατανομής ωρών εκπαιδευτικών.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => onExportTableCsv('dim_data_math')}
                        className="px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800/80 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Μαθητικό Δυναμικό &amp; Τμήματα</span>
                      </button>
                      <button
                        onClick={() => onExportTableCsv('dim_data_ekp')}
                        className="px-3.5 py-2 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800/80 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        <span>Κατανομή Ωρών Εκπαιδευτικών</span>
                      </button>
                    </div>
                  </div>

                  {/* Category 2: Νηπιαγωγεία */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md hover:border-emerald-500/60 transition">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
                        <span>Νηπιαγωγεία</span>
                      </h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/80">
                        Γενικά Νηπιαγωγεία
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Εξαγωγή εγγραφών νηπίων/προνηπίων, τμημάτων και ολοήμερου προγράμματος νηπιαγωγείων.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => onExportTableCsv('nip_data_math')}
                        className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Μαθητικό Δυναμικό &amp; Νήπια</span>
                      </button>
                    </div>
                  </div>

                  {/* Category 3: Ειδικά Δημοτικά */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md hover:border-purple-500/60 transition">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shadow-sm" />
                        <span>Ειδικά Δημοτικά Σχολεία</span>
                      </h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 font-bold border border-purple-800/80">
                        Ειδική Αγωγή
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Εξαγωγή μαθητικού δυναμικού ειδικών δημοτικών, τμημάτων και στελέχωσης ΕΕΠ/ΕΒΠ.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => onExportTableCsv('eid_dim_data_math')}
                        className="px-3.5 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/80 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-purple-400" />
                        <span>Μαθητικό Δυναμικό Ειδικής</span>
                      </button>
                      <button
                        onClick={() => onExportTableCsv('eid_dim_data_ekp')}
                        className="px-3.5 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/80 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-purple-400" />
                        <span>Στελέχωση ΕΕΠ / ΕΒΠ / Εκπ/κών</span>
                      </button>
                    </div>
                  </div>

                  {/* Category 4: Ειδικά Νηπιαγωγεία */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md hover:border-amber-500/60 transition">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm" />
                        <span>Ειδικά Νηπιαγωγεία</span>
                      </h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 font-bold border border-amber-800/80">
                        Ειδική Αγωγή Νηπίων
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Εξαγωγή εγγραφών ειδικών νηπιαγωγείων, τμημάτων και στελέχωσης ΕΒΠ/ΕΕΠ.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => onExportTableCsv('eid_nip_data_math')}
                        className="px-3.5 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800/80 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Μαθητικό Δυναμικό &amp; Στελέχωση</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: MAINTENANCE & MYSCHOOL IMPORT */}
          {consoleSubTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl border border-slate-800 text-slate-100 space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <Upload className="w-5 h-5" />
                  <span>Ενημέρωση Διευθυντών &amp; Σχολικών Μονάδων από CSV (MySchool)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Εισάγετε το αρχείο CSV από το MySchool για να ενημερωθούν αυτόματα οι Διευθυντές/Προϊστάμενοι και τα ΑΜ τους στη Βάση Δεδομένων.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="space-y-2">
                    <label className="font-bold text-slate-200 block">1. Επιλογή Πίνακα Στόχου:</label>
                    <div className="grid grid-cols-1 gap-1.5 font-semibold">
                      {[
                        { id: 'all_dim', label: '⭐ Όλα τα Δημοτικά Σχολεία', badge: 'Προτεινόμενο' },
                        { id: 'all_nip', label: '⭐ Όλα τα Νηπιαγωγεία', badge: 'Προτεινόμενο' },
                        { id: 'all_tables', label: '🌐 Όλες οι Σχολικές Μονάδες (Πλήρης Σύνδεση)', badge: 'Έλεγχος Όλων' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSyncTargetTable(t.id as any)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                            syncTargetTable === t.id
                              ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <span>{t.label}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                            {t.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-200 block">2. Επιλογή Αρχείου CSV:</label>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            onSyncCsvFileSelect(e.target.files[0]);
                          }
                        }}
                        className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 file:cursor-pointer"
                      />
                      {syncCsvFileName && (
                        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-emerald-400 font-mono flex items-center space-x-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Επιλέχθηκε: {syncCsvFileName} ({syncRawRows.length} γραμμές)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {syncRawRows.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Στήλη Κωδικού Σχολείου:</label>
                        <select
                          value={syncCodeCol}
                          onChange={e => setSyncCodeCol(e.target.value)}
                          className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2 font-mono text-xs"
                        >
                          {syncCsvHeaders.map(h => (
                            <option key={`code-${h}`} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Στήλη Ονοματεπώνυμου:</label>
                        <select
                          value={syncNameCol}
                          onChange={e => setSyncNameCol(e.target.value)}
                          className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2 font-mono text-xs"
                        >
                          {syncCsvHeaders.map(h => (
                            <option key={`name-${h}`} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Στήλη ΑΜ:</label>
                        <select
                          value={syncAmCol}
                          onChange={e => setSyncAmCol(e.target.value)}
                          className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2 font-mono text-xs"
                        >
                          <option value="">-- Χωρίς ΑΜ --</option>
                          {syncCsvHeaders.map(h => (
                            <option key={`am-${h}`} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Στήλη ΑΦΜ (για Αναπληρωτές):</label>
                        <select
                          value={syncAfmCol}
                          onChange={e => setSyncAfmCol(e.target.value)}
                          className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-2 font-mono text-xs"
                        >
                          <option value="">-- Χωρίς ΑΦΜ --</option>
                          {syncCsvHeaders.map(h => (
                            <option key={`afm-${h}`} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        id="skipBlank"
                        checked={skipBlankDirectorInCsv}
                        onChange={e => setSkipBlankDirectorInCsv(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <label htmlFor="skipBlank">Παράλειψη κενών εγγραφών Διευθυντή κατά την ενημέρωση</label>
                    </div>

                    {/* LIVE CSV DIFF PREVIEW TABLE */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                          <Eye className="w-4 h-4 text-amber-500" />
                          <span>Προεπισκόπηση Αλλαγών &amp; Σύγκριση με τη Βάση ({syncRawRows.length} εγγραφές)</span>
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] font-bold">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                            Νέες: {
                              syncRawRows.filter(r => {
                                const isSkipped = skipBlankDirectorInCsv && (getEffectivePrID(r).source === 'none' || !getEffectivePrID(r).prId);
                                const code = String(r[syncCodeCol] || '').trim();
                                return !isSkipped && !dbCurrentUsers.some(u => String(u.SchCode || '').trim() === code);
                              }).length
                            }
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80">
                            Ενημερώσεις: {
                              syncRawRows.filter(r => {
                                const isSkipped = skipBlankDirectorInCsv && (getEffectivePrID(r).source === 'none' || !getEffectivePrID(r).prId);
                                if (isSkipped) return false;
                                const code = String(r[syncCodeCol] || '').trim();
                                const newName = String(r[syncNameCol] || '').trim();
                                const { prId: newAm } = getEffectivePrID(r);
                                const match = dbCurrentUsers.find(u => String(u.SchCode || '').trim() === code);
                                if (!match) return false;
                                const nameDiffers = String(match.PrName || '').trim() !== newName;
                                const amDiffers = String(match.PrID || '').trim() !== newAm;
                                return nameDiffers || amDiffers;
                              }).length
                            }
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            Αμετάβλητα / Παράλειψη: {
                              syncRawRows.filter(r => {
                                const isSkipped = skipBlankDirectorInCsv && (getEffectivePrID(r).source === 'none' || !getEffectivePrID(r).prId);
                                if (isSkipped) return true;
                                const code = String(r[syncCodeCol] || '').trim();
                                const newName = String(r[syncNameCol] || '').trim();
                                const { prId: newAm } = getEffectivePrID(r);
                                const match = dbCurrentUsers.find(u => String(u.SchCode || '').trim() === code);
                                if (!match) return false;
                                const nameSame = String(match.PrName || '').trim() === newName;
                                const amSame = String(match.PrID || '').trim() === newAm;
                                return nameSame && amSame;
                              }).length
                            }
                          </span>
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60 font-sans text-xs">
                        <table className="w-full text-left text-slate-300">
                          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-300">
                            <tr>
                              <th className="p-2 w-10 text-center">#</th>
                              <th className="p-2 font-mono">SchCode</th>
                              <th className="p-2">Σχολική Μονάδα</th>
                              <th className="p-2">Τρέχων Δ/ντής (ΒΔ)</th>
                              <th className="p-2">Νέος Δ/ντής (CSV)</th>
                              <th className="p-2">Τρέχον AM</th>
                              <th className="p-2">Νέο AM/ΑΦΜ</th>
                              <th className="p-2 text-center">Κατάσταση</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                            {syncRawRows.slice(0, 100).map((r, idx) => {
                              const code = String(r[syncCodeCol] || '').trim();
                              const newName = String(r[syncNameCol] || '').trim();
                              const { prId: newAm, source } = getEffectivePrID(r);
                              const match = dbCurrentUsers.find(u => String(u.SchCode || '').trim() === code);
                              const isSkipped = skipBlankDirectorInCsv && (source === 'none' || !newAm);

                              let status: 'new' | 'modified' | 'unchanged' | 'skipped' = 'unchanged';
                              if (isSkipped) {
                                status = 'skipped';
                              } else if (!match) {
                                status = 'new';
                              } else if (String(match.PrName || '').trim() !== newName || String(match.PrID || '').trim() !== newAm) {
                                status = 'modified';
                              }

                              return (
                                <tr key={`diff-${idx}`} className={status === 'modified' ? 'bg-amber-950/20' : status === 'new' ? 'bg-emerald-950/20' : status === 'skipped' ? 'opacity-75' : ''}>
                                  <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                                  <td className="p-2 font-bold text-amber-400">{code || '-'}</td>
                                  <td className="p-2 font-sans font-semibold text-slate-200">
                                    {match?.SchName || r[syncNameCol] || '-'}
                                  </td>
                                  <td className="p-2 font-sans text-slate-400">
                                    {match?.PrName || <span className="text-slate-600 font-italic">Κενό</span>}
                                  </td>
                                  <td className={`p-2 font-sans font-medium ${status === 'modified' ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                                    {newName || '-'}
                                  </td>
                                  <td className="p-2 text-slate-400">{match?.PrID || '-'}</td>
                                  <td className={`p-2 ${status === 'modified' ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                                    {newAm ? `${newAm} ${source === 'afm' ? '(ΑΦΜ)' : ''}` : '-'}
                                  </td>
                                  <td className="p-2 text-center">
                                    {status === 'skipped' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-amber-400/90 border border-slate-700">
                                        Παράλειψη (Κενό)
                                      </span>
                                    )}
                                    {status === 'new' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                                        Νέα Εγγραφή
                                      </span>
                                    )}
                                    {status === 'modified' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                                        Ενημέρωση
                                      </span>
                                    )}
                                    {status === 'unchanged' && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800">
                                        Αμετάβλητο
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {syncRawRows.length > 100 && (
                        <p className="text-[10px] text-slate-400 font-mono text-center">
                          * Εμφανίζονται οι πρώτες 100 από {syncRawRows.length} εγγραφές της προεπισκόπησης.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={onExecutePrincipalSync}
                        disabled={isSyncing}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg disabled:opacity-50"
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Εκτέλεση Ενημέρωσης Διευθυντών</span>
                      </button>
                    </div>

                    {syncSuccessMsg && (
                      <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{syncSuccessMsg}</span>
                      </div>
                    )}

                    {syncErrorMsg && (
                      <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{syncErrorMsg}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION: DATA TABLES RESET / CLEAR (*_data) */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-rose-900/60 shadow-lg text-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                    <RotateCcw className="w-5 h-5" />
                    <span>Εκκαθάριση &amp; Μηδενισμός Δεδομένων Πινάκων *_data (Νέα Σχολική Χρονιά)</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono font-bold">
                    Προηγμένη Συντήρηση
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Εκτελεί πλήρη διαγραφή των εγγραφών υποβολών από τους πίνακες <code className="text-amber-300 font-mono">* _data_math</code> και <code className="text-amber-300 font-mono">* _data_ekp</code> και πραγματοποιεί <strong>αυτόματη επαναδημιουργία</strong> αρχικών εγγραφών με στοιχεία από τους αντίστοιχους πίνακες <code className="text-amber-300 font-mono">* _users</code>. Όλες οι αριθμητικές τιμές μηδενίζονται (0), τα σχόλια καθαρίζονται και τα TimeStamps μηδενίζονται (NULL), ώστε η βάση να είναι έτοιμη για νέες υποβολές.
                </p>

                <div className="space-y-3 text-xs pt-1">
                  <label className="font-bold text-slate-200 block">1. Επιλογή Κατηγορίας Σχολικών Μονάδων για Εκκαθάριση:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 font-semibold">
                    {[
                      { id: 'all', label: '⚠️ Όλοι οι Πίνακες (Πλήρης)', badge: 'Όλες οι μονάδες' },
                      { id: 'dim', label: 'Δημοτικά Σχολεία', badge: 'dim_data_*' },
                      { id: 'nip', label: 'Νηπιαγωγεία', badge: 'nip_data_*' },
                      { id: 'eid_dim', label: 'Ειδικά Δημοτικά', badge: 'eid_dim_data_*' },
                      { id: 'eid_nip', label: 'Ειδικά Νηπιαγωγεία', badge: 'eid_nip_data_*' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setResetCategory(item.id as any);
                          setResetConfirmChecked(false);
                          setResetSuccessMsg(null);
                          setResetErrorMsg(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                          resetCategory === item.id
                            ? item.id === 'all'
                              ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                              : 'bg-amber-600 text-white border-amber-500 shadow-md'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-bold text-xs">{item.label}</span>
                        <span className="text-[10px] mt-1 opacity-80 font-mono">{item.badge}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 bg-rose-950/40 border border-rose-900/80 rounded-xl space-y-2 text-rose-200 text-xs mt-3">
                    <div className="flex items-center space-x-2 text-rose-300 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Προειδοποίηση Ασφαλείας</span>
                    </div>
                    <p className="text-[11px] leading-normal opacity-90">
                      Η ενέργεια αυτή είναι <strong>μη αναστρέψιμη</strong>. Θα διαγραφούν όλες οι τρέχουσες υποβολές μαθητικού δυναμικού και εκπαιδευτικών για την επιλογή <span className="font-mono underline font-bold">{resetCategory}</span> και θα αντικατασταθούν από μηδενισμένες αρχικές εγγραφές.
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="resetConfirmCheck"
                        checked={resetConfirmChecked}
                        onChange={e => setResetConfirmChecked(e.target.checked)}
                        className="rounded accent-rose-600 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="resetConfirmCheck" className="text-xs font-bold text-white cursor-pointer select-none">
                        Επιβεβαιώνω ότι επιθυμώ την εκκαθάριση &amp; μηδενισμό των δεδομένων.
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleExecuteDataReset}
                      disabled={!resetConfirmChecked || isResettingData}
                      className="px-6 py-2.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isResettingData ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      <span>Εκτέλεση Εκκαθάρισης &amp; Μηδενισμού</span>
                    </button>
                  </div>

                  {resetSuccessMsg && (
                    <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{resetSuccessMsg}</span>
                    </div>
                  )}

                  {resetErrorMsg && (
                    <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{resetErrorMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SQL Query Console */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Κονσόλα Εκτέλεσης SQL Queries</span>
                  </h3>
                  <button
                    onClick={onExecuteSql}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Εκτέλεση Query
                  </button>
                </div>
                <textarea
                  value={sqlQuery}
                  onChange={e => setSqlQuery(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                />
                {sqlError && (
                  <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl font-mono">
                    {sqlError}
                  </div>
                )}
                {sqlResult && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono max-h-60 overflow-auto">
                    <pre className="text-emerald-400">{JSON.stringify(sqlResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: SECURITY & ADMIN PASSWORDS */}
          {consoleSubTab === 'security' && (
            <div className="space-y-6">
              {adminSecSuccessMsg && (
                <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl flex items-center space-x-3 text-xs shadow-md">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold">{adminSecSuccessMsg}</span>
                </div>
              )}

              {adminSecErrorMsg && (
                <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl flex items-center space-x-3 text-xs shadow-md">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="font-semibold">{adminSecErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* 1. Password Change for Logged-In Admin */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-lg text-slate-100">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                      <div className="p-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                        <Lock className="w-4 h-4 text-amber-400" />
                      </div>
                      <span>Αλλαγή Κωδικού Ενεργού Διαχειριστή ({currentAdminUser})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Ενημέρωση κωδικού πρόσβασης για τον συνδεδεμένο διαχειριστή
                    </p>
                  </div>

                  {isSuperUser ? (
                    <div className="p-3.5 bg-amber-950/60 border border-amber-800/80 rounded-xl text-xs text-amber-300">
                      Ο λογαριασμός κύριου διαχειριστή (<code className="font-mono font-bold text-amber-200">plinetamag</code>) έχει προστατευμένο κωδικό συστήματος.
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <label className="text-[11px] font-semibold text-slate-300 block">Νέος Κωδικός Πρόσβασης:</label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="password"
                          value={newAdminPasswordInput}
                          onChange={e => setNewAdminPasswordInput(e.target.value)}
                          placeholder="Εισάγετε νέο κωδικό..."
                          className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:ring-2 focus:ring-amber-500 focus:bg-slate-900 transition placeholder-slate-600 outline-none"
                        />
                        <button
                          onClick={onSaveAdminPassword}
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition shrink-0"
                        >
                          Αποθήκευση
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Admin Accounts Directory */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-4 shadow-lg text-slate-100">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                      <div className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg">
                        <Shield className="w-4 h-4 text-amber-400" />
                      </div>
                      <span>Κατάλογος Λογαριασμών Διαχειριστών Βάσης</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Διαχείριση εγγεγραμμένων χρηστών με πρόσβαση στο Πάνελ Διαχείρισης
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {adminList.map((admin, idx) => (
                      <div key={`admin-acc-${idx}`} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-slate-100 flex items-center space-x-1.5 truncate">
                            <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{admin.username}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            Pass: {admin.username === 'plinetamag' ? '••••••••' : admin.password}
                          </p>
                        </div>

                        {admin.username !== 'plinetamag' && (
                          <button
                            onClick={() => onRemoveAdminAccount(admin.username)}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/80 rounded-lg transition ml-2 shrink-0"
                            title="Διαγραφή Διαχειριστή"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-200">Προσθήκη Νέου Διαχειριστή:</h4>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={newAdminUser}
                        onChange={e => setNewAdminUser(e.target.value)}
                        placeholder="Όνομα (Username)"
                        className="w-full sm:w-1/2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:ring-2 focus:ring-amber-500 focus:bg-slate-900 transition placeholder-slate-600 outline-none"
                      />
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={e => setNewAdminPassword(e.target.value)}
                        placeholder="Κωδικός (Password)"
                        className="w-full sm:w-1/2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:ring-2 focus:ring-amber-500 focus:bg-slate-900 transition placeholder-slate-600 outline-none"
                      />
                      <button
                        onClick={onAddAdminAccount}
                        className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition shrink-0"
                      >
                        Προσθήκη
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: ΔΙΑΧΕΙΡΙΣΗ ΣΧΟΛΕΙΩΝ */}
      {adminMode === 'schools' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-xs space-y-2">
            <p className="font-bold text-amber-900 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Αυθεντικοποίηση Σχολικών Μονάδων &amp; Πεδίο Password MD5:</span>
            </p>
            <p className="text-slate-600 leading-relaxed">
              Στους καταλόγους των σχολικών μονάδων, η ταυτοποίηση των Διευθυντών/Προϊσταμένων γίνεται μέσω του <span className="font-bold text-slate-900">PrID</span> (ΑΜ).
              Το πεδίο <code className="bg-white border border-slate-300 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">Password</code> περιέχει το MD5 hash του PrID και χρησιμεύει ως τυπικό επίπεδο ασφαλείας κατά την επικοινωνία με τη βάση.
            </p>
          </div>

          {/* Action Bar: Filters, Search & Add Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                onClick={() => setSchoolsCategoryFilter('dim')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  schoolsCategoryFilter === 'dim'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                Δημοτικά Σχολεία
              </button>
              <button
                onClick={() => setSchoolsCategoryFilter('nip')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  schoolsCategoryFilter === 'nip'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                Νηπιαγωγεία
              </button>
              <button
                onClick={() => setSchoolsCategoryFilter('eid_dim')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  schoolsCategoryFilter === 'eid_dim'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                Ειδικά Δημοτικά
              </button>
              <button
                onClick={() => setSchoolsCategoryFilter('eid_nip')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  schoolsCategoryFilter === 'eid_nip'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                Ειδικά Νηπιαγωγεία
              </button>
            </div>

            {/* Right side controls: Format, Export CSV, Add School */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSchoolsViewFormat('overview')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    schoolsViewFormat === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Πίνακας Σχολείων
                </button>
                <button
                  onClick={() => setSchoolsViewFormat('catalog')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    schoolsViewFormat === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Κάρτες Καταλόγου
                </button>
              </div>

              <button
                onClick={() => onExportAdminUserCsv(schoolsCategoryFilter)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                title="Εξαγωγή Λίστας Χρηστών σε CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => onOpenNewSchoolModal(schoolsCategoryFilter)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Νέο Σχολείο</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={adminSearch}
              onChange={e => setAdminSearch(e.target.value)}
              placeholder="Αναζήτηση με SchCode, Ονομασία Σχολείου, PrID ή Ονοματεπώνυμο Διευθυντή..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
          </div>

          {/* Records Display Area */}
          {isLoadingAdmin ? (
            <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>Φόρτωση σχολικών μονάδων από τη βάση...</span>
            </div>
          ) : adminUserRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
              Δεν βρέθηκαν εγγραφές σχολικών μονάδων στη βάση δεδομένων.
            </div>
          ) : (
            <div>
              {/* Format 1: Table View */}
              {schoolsViewFormat === 'overview' && (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                        <th className="p-3 w-14 text-center">SchID</th>
                        <th className="p-3">Τύπος Σχολείου</th>
                        <th className="p-3">Κωδικός (SchCode)</th>
                        <th className="p-3">Σχολική Μονάδα (SchName)</th>
                        <th className="p-3">AM Διευθυντή</th>
                        <th className="p-3">Ονοματεπώνυμο Διευθυντή</th>
                        <th className="p-3">Οργανικότητα</th>
                        <th className="p-3 text-center w-24">Ενέργειες</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminUserRecords
                        .filter(r => {
                          const filter = schoolsCategoryFilter;
                          if (filter === 'dim') return r.sourceTable === 'dim_users';
                          if (filter === 'nip') return r.sourceTable === 'nip_users';
                          if (filter === 'eid_dim') return r.sourceTable === 'eid_dim_users' || r.sourceTable === 'eid_users';
                          if (filter === 'eid_nip') return r.sourceTable === 'eid_nip_users';
                          return true;
                        })
                        .filter(r =>
                          (r.SchName || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                          (r.SchCode || '').includes(adminSearch) ||
                          (r.PrName || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                          String(r.PrID || '').includes(adminSearch) ||
                          String(r.SchID || '').includes(adminSearch)
                        )
                        .sort((a, b) => (Number(a.SchID) || 0) - (Number(b.SchID) || 0))
                        .map((r, idx) => (
                          <tr key={`user-rec-${r.sourceTable || ''}-${r.SchCode}-${idx}`} className="hover:bg-amber-50/40 transition">
                            <td className="p-3 text-center font-bold text-amber-700 font-mono">{r.SchID || '-'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                (r.sourceTable === 'dim_users' || r.sourceTable === 'dim')
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : (r.sourceTable === 'nip_users' || r.sourceTable === 'nip')
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : (r.sourceTable === 'eid_dim_users' || r.sourceTable === 'eid_users' || r.sourceTable === 'eid_dim')
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {getSchoolTypeLabel(r.sourceTable)}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900">{r.SchCode}</td>
                            <td className="p-3 font-semibold text-slate-900">{r.SchName}</td>
                            <td className="p-3 font-mono text-slate-700">{r.PrID || '-'}</td>
                            <td className="p-3 text-slate-800 font-medium">{r.PrName || '-'}</td>
                            <td className="p-3 text-slate-600">{r.Organ || '-'}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => onOpenEditSchoolModal(r)}
                                  className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition"
                                  title="Επεξεργασία Σχολείου"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteSchoolUser(r)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                                  title="Διαγραφή Σχολείου"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Format 2: Catalog Cards View */}
              {schoolsViewFormat === 'catalog' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminUserRecords
                    .filter(r => {
                      const filter = schoolsCategoryFilter;
                      if (filter === 'dim') return r.sourceTable === 'dim_users';
                      if (filter === 'nip') return r.sourceTable === 'nip_users';
                      if (filter === 'eid_dim') return r.sourceTable === 'eid_dim_users' || r.sourceTable === 'eid_users';
                      if (filter === 'eid_nip') return r.sourceTable === 'eid_nip_users';
                      return true;
                    })
                    .filter(r =>
                      (r.SchName || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                      (r.SchCode || '').includes(adminSearch) ||
                      (r.PrName || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                      String(r.PrID || '').includes(adminSearch) ||
                      String(r.SchID || '').includes(adminSearch)
                    )
                    .sort((a, b) => (Number(a.SchID) || 0) - (Number(b.SchID) || 0))
                    .map((sch, idx) => (
                      <div key={`user-card-${sch.sourceTable}-${sch.SchCode}-${idx}`} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-amber-400 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[10px]">
                              {sch.SchCode}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            (sch.sourceTable === 'dim_users' || sch.sourceTable === 'dim')
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : (sch.sourceTable === 'nip_users' || sch.sourceTable === 'nip')
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : (sch.sourceTable === 'eid_dim_users' || sch.sourceTable === 'eid_users' || sch.sourceTable === 'eid_dim')
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {getSchoolTypeLabel(sch.sourceTable)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{sch.SchName}</h4>
                          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                            Δ/ντής: <span className="font-bold text-slate-800">{sch.PrName || '-'}</span> {sch.PrID ? `(AM: ${sch.PrID})` : ''}
                          </p>
                          <p className="text-[11px] text-slate-500">Οργανικότητα: {sch.Organ || '-'} | Έδρα: {sch.Location || '-'}</p>
                        </div>
                        <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => onOpenEditSchoolModal(sch)}
                            className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Επεξεργασία</span>
                          </button>
                          <button
                            onClick={() => onDeleteSchoolUser(sch)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDIT / ADD SCHOOL USER RECORD */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingSchoolRecord.SchID
                    ? 'Επεξεργασία Σχολικής Μονάδας'
                    : 'Προσθήκη Νέας Σχολικής Μονάδας'}
                </h3>
              </div>
              <button
                onClick={() => setIsSchoolModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {schoolModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{schoolModalError}</span>
              </div>
            )}

            {schoolModalSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{schoolModalSuccess}</span>
              </div>
            )}

            <form onSubmit={onSaveSchoolUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Τύπος Σχολικής Μονάδας:</label>
                <select
                  value={editingSchoolRecord.sourceTable}
                  onChange={e => setEditingSchoolRecord({ ...editingSchoolRecord, sourceTable: e.target.value })}
                  disabled={Boolean(editingSchoolRecord.SchID)}
                  className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl font-sans font-semibold text-xs focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                >
                  <option value="dim_users">Δημοτικό Σχολείο</option>
                  <option value="nip_users">Νηπιαγωγείο</option>
                  <option value="eid_dim_users">Ειδικό Δημοτικό</option>
                  <option value="eid_nip_users">Ειδικό Νηπιαγωγείο</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Κωδικός Σχολείου (SchCode): *</label>
                  <input
                    type="text"
                    required
                    value={editingSchoolRecord.SchCode}
                    onChange={e => setEditingSchoolRecord({ ...editingSchoolRecord, SchCode: e.target.value })}
                    placeholder="π.χ. 9350053"
                    className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Οργανικότητα (Organ):</label>
                  <input
                    type="text"
                    value={editingSchoolRecord.Organ}
                    onChange={e => setEditingSchoolRecord({ ...editingSchoolRecord, Organ: e.target.value })}
                    placeholder="π.χ. 6/θέσιο"
                    className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ονομασία Σχολικής Μονάδας (SchName): *</label>
                <input
                  type="text"
                  required
                  value={editingSchoolRecord.SchName}
                  onChange={e => setEditingSchoolRecord({ ...editingSchoolRecord, SchName: e.target.value })}
                  placeholder="π.χ. 1ο Δημοτικό Σχολείο Βόλου"
                  className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Αριθμός Μητρώου Διευθυντή (PrID / AM):</label>
                  <input
                    type="text"
                    value={editingSchoolRecord.PrID}
                    onChange={e => setEditingSchoolRecord({ ...editingSchoolRecord, PrID: e.target.value })}
                    placeholder="π.χ. 123456"
                    className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ονοματεπώνυμο Διευθυντή (PrName):</label>
                  <input
                    type="text"
                    value={editingSchoolRecord.PrName}
                    onChange={e => setEditingSchoolRecord({ ...editingSchoolRecord, PrName: e.target.value })}
                    placeholder="π.χ. Παπαδόπουλος Ιωάννης"
                    className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Έδρα / Διεύθυνση (Location):</label>
                <input
                  type="text"
                  value={editingSchoolRecord.Location}
                  onChange={e => setEditingSchoolRecord({ ...editingSchoolRecord, Location: e.target.value })}
                  placeholder="π.χ. Βόλος"
                  className="w-full p-2.5 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSchoolModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={isSavingSchoolUser}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSavingSchoolUser && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSchoolRecord.SchID ? 'Αποθήκευση Αλλαγών' : 'Δημιουργία Σχολείου'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
