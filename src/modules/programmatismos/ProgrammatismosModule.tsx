import React, { useState, useEffect } from 'react';
import { DbConfig } from '../../types';
import {
  Building,
  CheckCircle,
  Printer,
  Shield,
  Save,
  LogOut,
  UserCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { DimMathData, NipMathData, EidNipMathData, EidMathData, DimEkpData, EidEkpData, SchoolCategory, SchoolUser, AdminRecord } from './types';
import { exportProgrammatismosPdf } from './pdfExport';
import { defaultDimMathData, defaultNipMathData, defaultEidNipMathData, defaultEidMathData, defaultDimEkpData, defaultEidEkpData, getSchoolTypeLabel } from './utils';
import { ProgrammatismosLanding } from './components/ProgrammatismosLanding';
import { ProgrammatismosDirectorView } from './components/ProgrammatismosDirectorView';
import { ProgrammatismosAdminView } from './components/ProgrammatismosAdminView';

interface ProgrammatismosModuleProps {
  dbConfig?: DbConfig;
  onUpdateDbConfig?: (cfg: DbConfig) => void;
}

export const ProgrammatismosModule: React.FC<ProgrammatismosModuleProps> = () => {
  // Navigation / View State
  const [appRole, setAppRole] = useState<'landing' | 'director' | 'admin'>('landing');

  // Modals
  const [isDirectorLoginOpen, setIsDirectorLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Login inputs - Standardized category symbols
  const [schoolType, setSchoolType] = useState<SchoolCategory>('dim');
  const [directorSchoolCode, setDirectorSchoolCode] = useState('');
  const [directorAm, setDirectorAm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Dynamic Local Admins & Password Management State (Programmatismos Specific)
  const [currentAdminUser, setCurrentAdminUser] = useState<string>(() => {
    return localStorage.getItem('programmatismos_current_admin') || 'plinetamag';
  });
  const [adminList, setAdminList] = useState<{ username: string; password: string }[]>(() => {
    const saved = localStorage.getItem('programmatismos_admins_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // ignore
      }
    }
    return [{ username: 'plinetamag', password: 'pl!n3tAmag' }];
  });
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState('');
  const [showAdminPassToggle, setShowAdminPassToggle] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminSecSuccessMsg, setAdminSecSuccessMsg] = useState<string | null>(null);
  const [adminSecErrorMsg, setAdminSecErrorMsg] = useState<string | null>(null);

  // Logged-in School State
  const [schoolCategory, setSchoolCategory] = useState<SchoolCategory>('dim');
  const [activeSchool, setActiveSchool] = useState<SchoolUser | null>(null);
  const [mathData, setMathData] = useState<any>(null);
  const [ekpData, setEkpData] = useState<any>(null);
  const [userTab, setUserTab] = useState<'math' | 'ekp'>('math');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Admin Navigation State (2 Modes: Console vs Schools Viewer)
  const [adminMode, setAdminMode] = useState<'console' | 'schools'>('console');
  const [consoleSubTab, setConsoleSubTab] = useState<'export' | 'maintenance' | 'security'>('export');
  const [schoolsCategoryFilter, setSchoolsCategoryFilter] = useState<'dim' | 'nip' | 'eid_dim' | 'eid_nip'>('dim');
  const [schoolsViewFormat, setSchoolsViewFormat] = useState<'overview' | 'catalog'>('overview');

  const [adminTab, setAdminTab] = useState<'overview' | 'schools' | 'sql'>('overview');
  const [adminRecords, setAdminRecords] = useState<AdminRecord[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  // School User Records Direct Management State (*_users table direct editor)
  const [adminUserRecords, setAdminUserRecords] = useState<any[]>([]);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [editingSchoolRecord, setEditingSchoolRecord] = useState<{
    SchID?: number;
    sourceTable: string;
    SchCode: string;
    SchName: string;
    PrID: string;
    PrName: string;
    Organ: string;
    Location: string;
    Password?: string;
  }>({
    sourceTable: 'dim_users',
    SchCode: '',
    SchName: '',
    PrID: '',
    PrName: '',
    Organ: '6/θέσιο',
    Location: '',
    Password: ''
  });
  const [schoolModalError, setSchoolModalError] = useState<string | null>(null);
  const [schoolModalSuccess, setSchoolModalSuccess] = useState<string | null>(null);
  const [isSavingSchoolUser, setIsSavingSchoolUser] = useState(false);

  // SQL Console
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM dim_users LIMIT 10;');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Director Sync Wizard State (In-place update by SchCode preserving SchID sequence)
  const [syncTargetTable, setSyncTargetTable] = useState<'all_dim' | 'all_nip' | 'all_tables' | 'dim_users' | 'nip_users' | 'eid_dim_users' | 'eid_nip_users'>('all_dim');
  const [syncCsvFileName, setSyncCsvFileName] = useState('');
  const [syncRawRows, setSyncRawRows] = useState<any[]>([]);
  const [syncCsvHeaders, setSyncCsvHeaders] = useState<string[]>([]);
  const [syncCodeCol, setSyncCodeCol] = useState('');
  const [syncNameCol, setSyncNameCol] = useState('');
  const [syncAmCol, setSyncAmCol] = useState('');
  const [syncAfmCol, setSyncAfmCol] = useState('');
  const [skipBlankDirectorInCsv, setSkipBlankDirectorInCsv] = useState(true);

  // Helper to extract effective PrID (uses AM if present, otherwise last 6 digits of AFM for substitute teachers)
  const getEffectivePrID = (row: any): { prId: string; source: 'am' | 'afm' | 'none' } => {
    if (!row) return { prId: '', source: 'none' };
    const rawAm = String(row[syncAmCol] || '').trim();
    const amDigits = rawAm.replace(/\D/g, '');
    if (rawAm.length > 0 && amDigits.length > 0 && !/^0+$/.test(amDigits)) {
      return { prId: rawAm, source: 'am' };
    }

    const rawAfm = syncAfmCol ? String(row[syncAfmCol] || '').trim() : '';
    const afmDigits = rawAfm.replace(/\D/g, '');
    if (afmDigits.length >= 6 && !/^0+$/.test(afmDigits)) {
      return { prId: afmDigits.slice(-6), source: 'afm' };
    } else if (afmDigits.length > 0 && !/^0+$/.test(afmDigits)) {
      return { prId: afmDigits, source: 'afm' };
    }
    return { prId: '', source: 'none' };
  };
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [syncErrorMsg, setSyncErrorMsg] = useState<string | null>(null);
  const [dbCurrentUsers, setDbCurrentUsers] = useState<any[]>([]);
  const [isLoadingDbUsers, setIsLoadingDbUsers] = useState(false);

  // Fetch current database users for sync target
  const fetchDbUsersForSync = async (targetMode: string) => {
    setIsLoadingDbUsers(true);
    try {
      let query = '';
      if (targetMode === 'all_dim') {
        query = `SELECT 'dim_users' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.dim_users 
                 UNION ALL 
                 SELECT 'eid_dim_users' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.eid_dim_users 
                 ORDER BY sourceTable ASC, SchID ASC;`;
      } else if (targetMode === 'all_nip') {
        query = `SELECT 'nip_users' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.nip_users 
                 UNION ALL 
                 SELECT 'eid_nip_users' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.eid_nip_users 
                 ORDER BY sourceTable ASC, SchID ASC;`;
      } else if (targetMode === 'all_tables') {
        query = `SELECT 'dim_users' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.dim_users 
                 UNION ALL 
                 SELECT 'eid_dim_users' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.eid_dim_users 
                 UNION ALL 
                 SELECT 'nip_users' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.nip_users 
                 UNION ALL 
                 SELECT 'eid_nip_users' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.eid_nip_users 
                 ORDER BY sourceTable ASC, SchID ASC;`;
      } else {
        query = `SELECT '${targetMode}' AS sourceTable, SchID, SchCode, SchName, PrID, PrName FROM programmatismos.${targetMode} ORDER BY SchID ASC;`;
      }

      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data.rows && Array.isArray(data.rows)) {
        setDbCurrentUsers(data.rows);
      } else {
        setDbCurrentUsers([]);
      }
    } catch (e) {
      console.warn('Could not fetch DB users:', e);
      setDbCurrentUsers([]);
    } finally {
      setIsLoadingDbUsers(false);
    }
  };

  useEffect(() => {
    if (consoleSubTab === 'maintenance') {
      fetchDbUsersForSync(syncTargetTable);
    }
  }, [syncTargetTable, consoleSubTab]);

  // Parse CSV File for Director Sync
  const handleSyncCsvFileSelect = (file: File) => {
    setSyncCsvFileName(file.name);
    setSyncSuccessMsg(null);
    setSyncErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length === 0) return;

      const firstLine = lines[0];
      const sep = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
      const headers = firstLine.split(sep).map(h => h.trim().replace(/^["'\uFEFF]+|["'\uFEFF]+$/g, ''));
      setSyncCsvHeaders(headers);

      // Intelligent Auto-detect
      const autoCodeCol = headers.find(h => /SchCode|Κωδικός|Code|ΚΩΔΙΚΟΣ|ΚΩΔ_ΣΧΟΛ/i.test(h)) || headers[0] || '';
      const autoNameCol = headers.find(h => /PrName|Διευθυντ|Προϊστάμεν|Ονοματεπώνυμο|Επώνυμο|Name/i.test(h)) || headers[1] || '';
      const autoAmCol = headers.find(h => /PrID|AM|ΑΜ|Αριθμός Μητρώου|Μητρώο/i.test(h)) || headers[2] || '';
      const autoAfmCol = headers.find(h => /AFM|ΑΦΜ|TaxID|Α\.Φ\.Μ\.|A\.F\.M\./i.test(h)) || '';

      setSyncCodeCol(autoCodeCol);
      setSyncNameCol(autoNameCol);
      setSyncAmCol(autoAmCol);
      setSyncAfmCol(autoAfmCol);

      const parsedRows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const rawCells = lines[i].split(sep).map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (rawCells.length < 2) continue;
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = rawCells[idx] !== undefined ? rawCells[idx] : '';
        });
        parsedRows.push(rowObj);
      }
      setSyncRawRows(parsedRows);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Perform In-place Update API Call
  const handleExecutePrincipalSync = async () => {
    if (syncRawRows.length === 0 || !syncCodeCol) return;
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setSyncErrorMsg(null);

    let updates = syncRawRows.map(r => {
      const { prId } = getEffectivePrID(r);
      return {
        SchCode: String(r[syncCodeCol] || '').trim(),
        PrName: String(r[syncNameCol] || '').trim(),
        PrID: prId
      };
    }).filter(u => u.SchCode.length > 0);

    if (skipBlankDirectorInCsv) {
      updates = updates.filter(u => {
        const hasPrId = u.PrID.length > 0 && u.PrID !== '0' && u.PrID !== '000000';
        const hasPrName = u.PrName.length > 0 && u.PrName !== '0';
        return hasPrId && hasPrName;
      });
    }

    try {
      const res = await fetch('/api/programmatismos/admin/sync-principals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: syncTargetTable,
          updates,
          updatePasswordMd5: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setSyncSuccessMsg(data.message);
        fetchDbUsersForSync(syncTargetTable);
        loadAdminRecords();
      } else {
        setSyncErrorMsg(data.error || 'Σφάλμα κατά την ενημέρωση των διευθυντών.');
      }
    } catch (err: any) {
      setSyncErrorMsg('Σφάλμα δικτύου: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Available schools list for director login drop-down/picker & admin directory
  const [availableSchools, setAvailableSchools] = useState<SchoolUser[]>([]);

  // CSV Exporter for Admin Console
  const handleExportAdminCsv = (categoryFilter: string = 'all') => {
    const filtered = adminRecords.filter(r => categoryFilter === 'all' || r.category === categoryFilter);
    if (filtered.length === 0) {
      alert('Δεν βρέθηκαν εγγραφές για εξαγωγή με τα επιλεγμένα φίλτρα.');
      return;
    }

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Greek support
    csvContent += 'A/A;Κατηγορία;Κωδικός Σχολείου;Ονομασία Σχολικής Μονάδας;Διευθυντής/Προϊστάμενος;Σύνολο Μαθητών;Διατιθέμενες Ώρες;Τελευταία Ενημέρωση\n';

    filtered.forEach(r => {
      const catLabel = r.category === 'dim' ? 'Δημοτικό' : r.category === 'nip' ? 'Νηπιαγωγείο' : r.category === 'eid_dim' ? 'Ειδικό Δημοτικό' : r.category === 'eid_nip' ? 'Ειδικό Νηπιαγωγείο' : r.category || '-';
      let timeStr = 'Εκκρεμεί';
      if (r.MathTimeStamp) {
        try {
          const clean = String(r.MathTimeStamp).replace('T', ' ').replace('Z', '').split('.')[0].trim();
          const [datePart, timePart] = clean.split(' ');
          if (datePart) {
            const [year, month, day] = datePart.split('-');
            if (year && month && day) {
              timeStr = `${day}/${month}/${year}${timePart ? ` ${timePart}` : ''}`;
            }
          }
        } catch (e) {
          timeStr = String(r.MathTimeStamp);
        }
      }
      csvContent += `${r.SchID || '-'};"${catLabel}";"${r.SchCode}";"${r.SchName}";"${r.PrName || '-'}";${r.StuTotal ?? 0};${r.DiaTotal ?? 0};"${timeStr}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Programmatismos_Exagogi_${categoryFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetch(`/api/programmatismos/schools?type=${schoolType}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => (Number(a.SchID) || 0) - (Number(b.SchID) || 0));
          setAvailableSchools(sorted);
        }
      })
      .catch(err => console.warn('Could not fetch schools:', err));
  }, [schoolType]);

  // Fetch School Data for Director Portal
  const loadSchoolPortalData = async (schCode: string, amPass?: string) => {
    try {
      const res = await fetch(`/api/programmatismos/school/${schCode}?type=${schoolType}`);
      const data = await res.json();
      if (data.school) {
        // Validate Director AM password if supplied
        const masterPasses = ['pl!n3tAmag', '123456', '9999999', 'admin'];
        const isMaster = amPass && masterPasses.includes(amPass.trim());
        const expectedPrID = data.school.PrID ? String(data.school.PrID).trim() : '';

        if (amPass && amPass.trim() !== '' && !isMaster && expectedPrID !== '' && expectedPrID !== amPass.trim()) {
          setLoginError(`Λανθασμένος Αριθμός Μητρώου Διευθυντή/Προϊσταμένου (AM) για το σχολείο "${data.school.SchName}".`);
          return;
        }

        const cat: SchoolCategory = (data.category as SchoolCategory) || schoolType;
        setSchoolCategory(cat);
        setActiveSchool(data.school);
        if (cat === 'eid_nip') {
          setMathData(data.mathData || defaultEidNipMathData(data.school.SchCode, data.school.SchName));
          setEkpData(null);
        } else if (cat === 'nip') {
          setMathData(data.mathData || defaultNipMathData(data.school.SchCode, data.school.SchName));
          setEkpData(null);
        } else if (cat === 'eid_dim') {
          setMathData(data.mathData || defaultEidMathData(data.school.SchCode, data.school.SchName));
          setEkpData(data.ekpData || defaultEidEkpData(data.school.SchCode, data.school.SchName));
        } else {
          setMathData(data.mathData || defaultDimMathData(data.school.SchCode, data.school.SchName));
          setEkpData(data.ekpData || defaultDimEkpData(data.school.SchCode, data.school.SchName));
        }
        setAppRole('director');
        setIsDirectorLoginOpen(false);
        setLoginError(null);
      } else {
        setLoginError('Δεν βρέθηκε η σχολική μονάδα με αυτόν τον κωδικό.');
      }
    } catch (err: any) {
      setLoginError('Σφάλμα σύνδεσης: ' + err.message);
    }
  };

  // Director Login Handler
  const handleDirectorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directorSchoolCode.trim()) return;
    loadSchoolPortalData(directorSchoolCode.trim(), directorAm.trim());
  };

  // Fetch dynamic admins on load (Programmatismos Specific)
  useEffect(() => {
    fetch('/api/programmatismos/admins')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.admins) && data.admins.length > 0) {
          setAdminList(data.admins);
          localStorage.setItem('programmatismos_admins_v1', JSON.stringify(data.admins));
        }
      })
      .catch(err => console.error('Error fetching programmatismos admin accounts list:', err));
  }, []);

  const saveAdminsToDb = async (updatedList: { username: string; password: string }[]) => {
    try {
      const res = await fetch('/api/programmatismos/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admins: updatedList })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminList(updatedList);
        localStorage.setItem('programmatismos_admins_v1', JSON.stringify(updatedList));
        return true;
      } else {
        throw new Error(data.error || 'Σφάλμα κατά την αποθήκευση των διαχειριστών.');
      }
    } catch (err: any) {
      setAdminSecErrorMsg(err.message || 'Αποτυχία αποθήκευσης των διαχειριστών στη Βάση Δεδομένων.');
      setTimeout(() => setAdminSecErrorMsg(null), 4000);
      return false;
    }
  };

  const activeAdminUser = currentAdminUser || localStorage.getItem('programmatismos_current_admin') || 'plinetamag';
  const isSuperUser = activeAdminUser === 'plinetamag';

  const handleSaveAdminPassword = async () => {
    if (!newAdminPasswordInput.trim() || isSuperUser) return;
    
    let found = false;
    const updated = adminList.map(a => {
      if (a.username === activeAdminUser) {
        found = true;
        return { ...a, password: newAdminPasswordInput.trim() };
      }
      return a;
    });

    const finalUpdated = found ? updated : [...updated, { username: activeAdminUser, password: newAdminPasswordInput.trim() }];

    const success = await saveAdminsToDb(finalUpdated);
    if (success) {
      setNewAdminPasswordInput('');
      setAdminSecSuccessMsg(`Ο κωδικός πρόσβασης του διαχειριστή "${activeAdminUser}" άλλαξε επιτυχώς!`);
      setTimeout(() => setAdminSecSuccessMsg(null), 4000);
    }
  };

  const handleAddAdminAccount = async () => {
    if (!newAdminUser.trim() || !newAdminPassword.trim()) {
      setAdminSecErrorMsg('Παρακαλώ συμπληρώστε και το όνομα χρήστη και τον κωδικό πρόσβασης.');
      setTimeout(() => setAdminSecErrorMsg(null), 4000);
      return;
    }
    if (adminList.some(a => a.username.trim().toLowerCase() === newAdminUser.trim().toLowerCase())) {
      setAdminSecErrorMsg('Ο λογαριασμός διαχειριστή υπάρχει ήδη.');
      setTimeout(() => setAdminSecErrorMsg(null), 4000);
      return;
    }
    const updated = [...adminList, { username: newAdminUser.trim(), password: newAdminPassword.trim() }];
    const success = await saveAdminsToDb(updated);
    if (success) {
      setNewAdminUser('');
      setNewAdminPassword('');
      setAdminSecSuccessMsg(`Ο διαχειριστής "${newAdminUser.trim()}" προστέθηκε με επιτυχία!`);
      setTimeout(() => setAdminSecSuccessMsg(null), 4000);
    }
  };

  const handleRemoveAdminAccount = async (user: string) => {
    if (user === 'plinetamag') {
      alert('Δεν επιτρέπεται η διαγραφή του κύριου διαχειριστή συστήματος (plinetamag).');
      return;
    }
    const updated = adminList.filter(a => a.username !== user);
    const success = await saveAdminsToDb(updated);
    if (success) {
      setAdminSecSuccessMsg(`Ο λογαριασμός διαχειριστή "${user}" αφαιρέθηκε από τη Βάση Δεδομένων.`);
      setTimeout(() => setAdminSecSuccessMsg(null), 4000);
    }
  };

  // Admin Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = adminUsername.trim();
    const cleanPass = adminPassword.trim();
    
    // Check hardcoded super user or dynamically stored admins
    const isHardcodedSuper = (cleanUser === 'plinetamag' && cleanPass === 'pl!n3tAmag');
    const matchedAdmin = adminList.find(a => a.username.trim().toLowerCase() === cleanUser.toLowerCase() && a.password === cleanPass);

    if (isHardcodedSuper || matchedAdmin) {
      const loggedUser = isHardcodedSuper ? 'plinetamag' : matchedAdmin!.username;
      setCurrentAdminUser(loggedUser);
      localStorage.setItem('programmatismos_current_admin', loggedUser);
      setAppRole('admin');
      setIsAdminLoginOpen(false);
      setAdminLoginError(null);
      loadAdminRecords();
      loadAdminUserRecords();
    } else {
      setAdminLoginError('Λανθασμένα στοιχεία διαχειριστή');
    }
  };

  // Load Admin Records (*_data_* aggregated view)
  const loadAdminRecords = async () => {
    setIsLoadingAdmin(true);
    try {
      const res = await fetch('/api/programmatismos/admin/records');
      const data = await res.json();
      if (Array.isArray(data)) setAdminRecords(data);
    } catch (err) {
      console.error('Error loading admin records:', err);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  // Load Admin User Records (*_users direct tables view)
  const loadAdminUserRecords = async () => {
    setIsLoadingAdmin(true);
    try {
      const res = await fetch('/api/programmatismos/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdminUserRecords(data);
      }
    } catch (err) {
      console.error('Error loading admin user records:', err);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleOpenNewSchoolModal = (defaultTable: string = 'dim_users') => {
    let target = defaultTable;
    if (target === 'dim') target = 'dim_users';
    else if (target === 'nip') target = 'nip_users';
    else if (target === 'eid_dim') target = 'eid_dim_users';
    else if (target === 'eid_nip') target = 'eid_nip_users';

    setEditingSchoolRecord({
      sourceTable: target,
      SchCode: '',
      SchName: '',
      PrID: '',
      PrName: '',
      Organ: '6/θέσιο',
      Location: '',
      Password: ''
    });
    setSchoolModalError(null);
    setSchoolModalSuccess(null);
    setIsSchoolModalOpen(true);
  };

  const handleOpenEditSchoolModal = (rec: any) => {
    setEditingSchoolRecord({
      SchID: rec.SchID,
      sourceTable: rec.sourceTable || 'dim_users',
      SchCode: rec.SchCode || '',
      SchName: rec.SchName || '',
      PrID: rec.PrID ? String(rec.PrID) : '',
      PrName: rec.PrName || '',
      Organ: rec.Organ || '',
      Location: rec.Location || '',
      Password: rec.Password || ''
    });
    setSchoolModalError(null);
    setSchoolModalSuccess(null);
    setIsSchoolModalOpen(true);
  };

  const handleSaveSchoolUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchoolRecord.SchCode.trim() || !editingSchoolRecord.SchName.trim()) {
      setSchoolModalError('Ο Κωδικός (SchCode) και η Ονομασία (SchName) είναι υποχρεωτικά πεδία.');
      return;
    }
    setIsSavingSchoolUser(true);
    setSchoolModalError(null);
    setSchoolModalSuccess(null);
    try {
      const res = await fetch('/api/programmatismos/admin/school/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSchoolRecord)
      });
      const data = await res.json();
      if (data.success) {
        setSchoolModalSuccess(data.message);
        setTimeout(() => {
          setIsSchoolModalOpen(false);
          setSchoolModalSuccess(null);
        }, 1200);
        loadAdminUserRecords();
        fetch(`/api/programmatismos/schools?type=${schoolType}`)
          .then(r => r.json())
          .then(d => { if (Array.isArray(d)) setAvailableSchools(d); });
      } else {
        setSchoolModalError(data.error || 'Σφάλμα κατά την αποθήκευση της σχολικής μονάδας.');
      }
    } catch (err: any) {
      setSchoolModalError('Σφάλμα δικτύου: ' + err.message);
    } finally {
      setIsSavingSchoolUser(false);
    }
  };

  const handleDeleteSchoolUser = async (rec: any) => {
    const confirmMsg = `Είστε βέβαιοι ότι θέλετε να διαγράψετε τη σχολική μονάδα "${rec.SchName}" (${rec.SchCode}) από το σύστημα;`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/programmatismos/admin/school/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: rec.sourceTable,
          SchID: rec.SchID,
          SchCode: rec.SchCode
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadAdminUserRecords();
        fetch(`/api/programmatismos/schools?type=${schoolType}`)
          .then(r => r.json())
          .then(d => { if (Array.isArray(d)) setAvailableSchools(d); });
      } else {
        alert('Σφάλμα διαγραφής: ' + (data.error || 'Άγνωστο σφάλμα'));
      }
    } catch (err: any) {
      alert('Σφάλμα δικτύου: ' + err.message);
    }
  };

  const handleExportAdminUserCsv = (categoryFilter: string = 'all') => {
    const filtered = adminUserRecords.filter(r => {
      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'dim' || categoryFilter === 'dim_users') return r.sourceTable === 'dim_users';
      if (categoryFilter === 'nip' || categoryFilter === 'nip_users') return r.sourceTable === 'nip_users';
      if (categoryFilter === 'eid_dim' || categoryFilter === 'eid_dim_users') return r.sourceTable === 'eid_dim_users' || r.sourceTable === 'eid_users';
      if (categoryFilter === 'eid_nip' || categoryFilter === 'eid_nip_users') return r.sourceTable === 'eid_nip_users';
      return true;
    });

    if (filtered.length === 0) {
      alert('Δεν βρέθηκαν εγγραφές για εξαγωγή.');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'SchID;Τύπος_Σχολείου;Κωδικός_Σχολείου;Ονομασία_Σχολικής_Μονάδας;ΑΜ_Διευθυντή;Ονοματεπώνυμο_Διευθυντή;Οργανικότητα;Έδρα\n';

    filtered.forEach(r => {
      const line = [
        r.SchID || '',
        `"${getSchoolTypeLabel(r.sourceTable || '')}"`,
        r.SchCode || '',
        `"${(r.SchName || '').replace(/"/g, '""')}"`,
        r.PrID || '',
        `"${(r.PrName || '').replace(/"/g, '""')}"`,
        `"${(r.Organ || '').replace(/"/g, '""')}"`,
        `"${(r.Location || '').replace(/"/g, '""')}"`
      ].join(';');
      csvContent += line + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Programmatismos_Xristes_${categoryFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save School Form Data
  const handleSaveData = async () => {
    if (!activeSchool || !mathData) return;
    setIsSaving(true);
    setSaveMessage(null);

    let updatedMath = { ...mathData };
    let updatedEkp = ekpData ? { ...ekpData } : null;

    if (schoolCategory === 'dim') {
      updatedMath.StuTotal = Number(mathData.StuA || 0) + Number(mathData.StuB || 0) + Number(mathData.StuC || 0) + Number(mathData.StuD || 0) + Number(mathData.StuE || 0) + Number(mathData.StuF || 0);
      updatedMath.ClassTotal = Number(mathData.ClassA || 0) + Number(mathData.ClassB || 0) + Number(mathData.ClassC || 0) + Number(mathData.ClassD || 0) + Number(mathData.ClassE || 0) + Number(mathData.ClassF || 0);
      updatedMath.StuOloTotal = Number(mathData.StuOloZ1 || 0) + Number(mathData.StuOloZ2 || 0) + Number(mathData.StuOloZ3 || 0);

      if (updatedEkp) {
        const specialties = ['PE70', 'PE05', 'PE06', 'PE07', 'PE08', 'PE11', 'PE79', 'PE86', 'PE91'];
        const calcCategoryTotal = (prefix: string) => specialties.reduce((acc, spec) => acc + Number(updatedEkp[`${prefix}${spec}`] || 0), 0);
        updatedEkp.DiaTotal = calcCategoryTotal('Dia');
        updatedEkp.ProTotal = calcCategoryTotal('Pro');
        updatedEkp.EZTotal = calcCategoryTotal('EZ');
        updatedEkp.PYTotal = calcCategoryTotal('PY');
        updatedEkp.OloTotal = calcCategoryTotal('Olo');
        updatedEkp.SitTotal = calcCategoryTotal('Sit');
        updatedEkp.BibTotal = calcCategoryTotal('Bib');
      }
    } else if (schoolCategory === 'nip' || schoolCategory === 'eid_nip') {
      updatedMath.StuTotal = Number(mathData.StuA || 0) + Number(mathData.StuB || 0);
      updatedMath.StuOloTotal = Number(mathData.StuOloA || 0) + Number(mathData.StuOloB || 0);
    } else if (schoolCategory === 'eid_dim') {
      updatedMath.StuTotal = Number(mathData.StuProp || 0) + Number(mathData.StuA || 0) + Number(mathData.StuB || 0) + Number(mathData.StuC || 0) + Number(mathData.StuD || 0) + Number(mathData.StuE || 0) + Number(mathData.StuF || 0);
      updatedMath.ClassTotal = Number(mathData.ClassProp || 0) + Number(mathData.ClassA || 0) + Number(mathData.ClassB || 0) + Number(mathData.ClassC || 0) + Number(mathData.ClassD || 0) + Number(mathData.ClassE || 0) + Number(mathData.ClassF || 0);
      if (updatedEkp) {
        const specialties = ['PE70', 'PE05', 'PE06', 'PE07', 'PE08', 'PE11', 'PE79', 'PE86', 'PE91'];
        const calcCategoryTotal = (prefix: string) => specialties.reduce((acc, spec) => acc + Number(updatedEkp[`${prefix}${spec}`] || 0), 0);
        updatedEkp.DiaTotal = calcCategoryTotal('Dia');
        updatedEkp.ProTotal = calcCategoryTotal('Pro');
        updatedEkp.EZTotal = calcCategoryTotal('EZ');
        updatedEkp.PYTotal = calcCategoryTotal('PY');
        updatedEkp.OloTotal = calcCategoryTotal('Olo');
        updatedEkp.SitTotal = calcCategoryTotal('Sit');
        updatedEkp.BibTotal = calcCategoryTotal('Bib');
      }
    }

    try {
      const res = await fetch('/api/programmatismos/school/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schCode: activeSchool.SchCode,
          category: schoolCategory,
          mathData: updatedMath,
          ekpData: updatedEkp
        })
      });
      const result = await res.json();
      if (result.success) {
        setMathData(updatedMath);
        setEkpData(updatedEkp);
        setSaveMessage('Τα στοιχεία Προγραμματισμού αποθηκεύτηκαν επιτυχώς στη Βάση Δεδομένων!');
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        alert('Σφάλμα αποθήκευσης: ' + result.error);
      }
    } catch (err: any) {
      alert('Σφάλμα σύνδεσης κατά την αποθήκευση: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate PDF Export
  const handleExportPDF = async () => {
    if (!activeSchool || !mathData) return;
    await exportProgrammatismosPdf(activeSchool, schoolCategory, mathData, ekpData, userTab);
  };

  // Helper for direct CSV download without blank browser tab artifacts
  const handleExportTableCsv = (table: string) => {
    const link = document.createElement('a');
    link.href = `/api/programmatismos/admin/export/csv?table=${table}`;
    link.setAttribute('download', `${table}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run SQL Console query
  const handleExecuteSql = async () => {
    setSqlError(null);
    setSqlResult(null);
    try {
      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery })
      });
      const data = await res.json();
      if (data.error) {
        setSqlError(data.error);
      } else {
        setSqlResult(data.results || data);
      }
    } catch (err: any) {
      setSqlError('Σφάλμα εκτέλεσης SQL: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 min-h-[600px]">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-amber-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400/30">
              <Building className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              2. Προγραμματισμός Σχολικών Μονάδων
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              ΔΠΕ Μαγνησίας
            </span>
          </div>
          <p className="text-xs text-amber-200/80">
            Πύλη Υποβολής &amp; Διαχείρισης Στοιχείων Μαθητικού Δυναμικού &amp; Ωραρίου Εκπαιδευτικών
          </p>
        </div>

        {/* Action Status / Role Switch */}
        {appRole !== 'landing' && (
          <div className="flex items-center space-x-3 bg-slate-950/60 p-2 rounded-xl border border-amber-700/40 text-xs">
            <span className="text-amber-300 font-semibold flex items-center space-x-1">
              {appRole === 'director' ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>{activeSchool?.SchName || 'Σύνδεση Σχολείου'}</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Διαχειριστής ({currentAdminUser})</span>
                </>
              )}
            </span>
            <button
              onClick={() => {
                setAppRole('landing');
                setActiveSchool(null);
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Έξοδος</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. LANDING & LOGIN COMPONENT (Entry View & Login Modals) */}
      {(appRole === 'landing' || (appRole === 'director' && !activeSchool)) && (
        <ProgrammatismosLanding
          appRole={appRole}
          setAppRole={setAppRole}
          setActiveSchool={setActiveSchool}
          schoolType={schoolType}
          setSchoolType={setSchoolType}
          isDirectorLoginOpen={isDirectorLoginOpen}
          setIsDirectorLoginOpen={setIsDirectorLoginOpen}
          isAdminLoginOpen={isAdminLoginOpen}
          setIsAdminLoginOpen={setIsAdminLoginOpen}
          directorSchoolCode={directorSchoolCode}
          setDirectorSchoolCode={setDirectorSchoolCode}
          directorAm={directorAm}
          setDirectorAm={setDirectorAm}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loginError={loginError}
          setLoginError={setLoginError}
          availableSchools={availableSchools}
          onDirectorLogin={handleDirectorLogin}
          adminUsername={adminUsername}
          setAdminUsername={setAdminUsername}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          adminLoginError={adminLoginError}
          setAdminLoginError={setAdminLoginError}
          onAdminLogin={handleAdminLogin}
        />
      )}

      {/* 2. DIRECTOR / USER PORTAL COMPONENT */}
      {appRole === 'director' && activeSchool && mathData && (
        <ProgrammatismosDirectorView
          activeSchool={activeSchool}
          schoolCategory={schoolCategory}
          mathData={mathData}
          setMathData={setMathData}
          ekpData={ekpData}
          setEkpData={setEkpData}
          userTab={userTab}
          setUserTab={setUserTab}
          isSaving={isSaving}
          saveMessage={saveMessage}
          onSaveData={handleSaveData}
          onExportPDF={handleExportPDF}
        />
      )}

      {/* 3. ADMIN PORTAL COMPONENT */}
      {appRole === 'admin' && (
        <ProgrammatismosAdminView
          adminMode={adminMode}
          setAdminMode={setAdminMode}
          consoleSubTab={consoleSubTab}
          setConsoleSubTab={setConsoleSubTab}
          onRefreshAdminRecords={loadAdminRecords}
          schoolsCategoryFilter={schoolsCategoryFilter}
          setSchoolsCategoryFilter={setSchoolsCategoryFilter}
          schoolsViewFormat={schoolsViewFormat}
          setSchoolsViewFormat={setSchoolsViewFormat}
          adminRecords={adminRecords}
          adminUserRecords={adminUserRecords}
          adminSearch={adminSearch}
          setAdminSearch={setAdminSearch}
          isLoadingAdmin={isLoadingAdmin}
          onExportAdminCsv={handleExportAdminCsv}
          onExportAdminUserCsv={handleExportAdminUserCsv}
          onExportTableCsv={handleExportTableCsv}
          sqlQuery={sqlQuery}
          setSqlQuery={setSqlQuery}
          sqlResult={sqlResult}
          sqlError={sqlError}
          onExecuteSql={handleExecuteSql}
          syncTargetTable={syncTargetTable}
          setSyncTargetTable={setSyncTargetTable}
          syncCsvFileName={syncCsvFileName}
          syncRawRows={syncRawRows}
          syncCsvHeaders={syncCsvHeaders}
          syncCodeCol={syncCodeCol}
          setSyncCodeCol={setSyncCodeCol}
          syncNameCol={syncNameCol}
          setSyncNameCol={setSyncNameCol}
          syncAmCol={syncAmCol}
          setSyncAmCol={setSyncAmCol}
          syncAfmCol={syncAfmCol}
          setSyncAfmCol={setSyncAfmCol}
          skipBlankDirectorInCsv={skipBlankDirectorInCsv}
          setSkipBlankDirectorInCsv={setSkipBlankDirectorInCsv}
          isSyncing={isSyncing}
          syncSuccessMsg={syncSuccessMsg}
          syncErrorMsg={syncErrorMsg}
          dbCurrentUsers={dbCurrentUsers}
          isLoadingDbUsers={isLoadingDbUsers}
          onSyncCsvFileSelect={handleSyncCsvFileSelect}
          onExecutePrincipalSync={handleExecutePrincipalSync}
          getEffectivePrID={getEffectivePrID}
          currentAdminUser={currentAdminUser}
          adminList={adminList}
          newAdminPasswordInput={newAdminPasswordInput}
          setNewAdminPasswordInput={setNewAdminPasswordInput}
          showAdminPassToggle={showAdminPassToggle}
          setShowAdminPassToggle={setShowAdminPassToggle}
          newAdminUser={newAdminUser}
          setNewAdminUser={setNewAdminUser}
          newAdminPassword={newAdminPassword}
          setNewAdminPassword={setNewAdminPassword}
          adminSecSuccessMsg={adminSecSuccessMsg}
          adminSecErrorMsg={adminSecErrorMsg}
          onSaveAdminPassword={handleSaveAdminPassword}
          onAddAdminAccount={handleAddAdminAccount}
          onRemoveAdminAccount={handleRemoveAdminAccount}
          isSchoolModalOpen={isSchoolModalOpen}
          setIsSchoolModalOpen={setIsSchoolModalOpen}
          editingSchoolRecord={editingSchoolRecord}
          setEditingSchoolRecord={setEditingSchoolRecord}
          schoolModalError={schoolModalError}
          schoolModalSuccess={schoolModalSuccess}
          isSavingSchoolUser={isSavingSchoolUser}
          onOpenNewSchoolModal={handleOpenNewSchoolModal}
          onOpenEditSchoolModal={handleOpenEditSchoolModal}
          onSaveSchoolUser={handleSaveSchoolUser}
          onDeleteSchoolUser={handleDeleteSchoolUser}
        />
      )}
    </div>
  );
};

export default ProgrammatismosModule;
