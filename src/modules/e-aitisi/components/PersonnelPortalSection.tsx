import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Edit3, Save, CheckCircle2, Lock, Unlock, Mail, Phone, MapPin, 
  Briefcase, Calendar, Heart, AlertCircle, RefreshCw, ChevronRight, FileText, UserCheck, Sparkles,
  Key, LogOut, User, Shield, Eye, EyeOff, FileDown, ArrowRight, Plus, Trash2, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Printer, Building2, RotateCcw, X, Download, Loader2, Database
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadGreekFontToDoc } from '../../../utils/pdfFontLoader';
import { SCHOOL_CATEGORIES, INITIAL_SCHOOLS_CATALOG, SchoolCategory } from '../data/schoolsData';
import { AdminDashboardPane } from './AdminDashboardPane';

export interface PlineRecord {
  Α_Α: number;
  ΑρΜητρ: string;
  ΑΦΜ: string;
  Επώνυμο: string;
  Όνομα: string;
  Πατρώνυμο: string;
  ΚωδΕιδικότ: string;
  Ειδικότητα: string;
  Έτη: number;
  Μήνες: number;
  Ημέρες: number;
  ΚωδΟργαν: string;
  Οργανική: string;
  ΠερΜετάθ: string;
  Πόλη: string;
  ΤαχΚωδ: string;
  Οδός: string;
  Αριθμός: string;
  Σταθερό: string;
  Κινητό: string;
  Email: string;
  ΟικΚατάστ: string;
  ΑρΠαιδιών: number;
  Εντοπιότητα: string;
  Συνυπηρέτηση: string;
  ΛόγοιΥγείας?: string;
  Ποσοστό?: number;
  ΛόγοιΥγείαςΙδίου?: string;
  ΛόγοιΥγείαςΣυζ?: string;
  ΛόγοιΥγείαςΤεκν?: string;
  ΛόγοιΥγείαςΓον?: string;
  ΛόγοιΥγείαςΑδερ?: string;
  Παρατηρήσεις: string;
  ΑρΠροτιμ?: number;
  Προτιμήσεις?: string;
  Υπεραριθμία?: string;
  Χρονοσήμανση?: string;
  Θεραπεία?: string;
  Μεταπτυχιακό?: string;
  ΕιδικήΚΜ?: string;
  ΚατηγορίαΚΠ?: string;
}

export const MAGNESIA_MUNICIPALITIES = [
  'Δήμος Βόλου',
  'Δήμος Αλμυρού',
  'Δήμος Ρήγα Φεραίου',
  'Δήμος Νοτίου Πηλίου',
  'Δήμος Ζαγοράς - Μουρεσίου',
  'Δήμος Σκιάθου',
  'Δήμος Σκοπέλου',
  'Δήμος Αλοννήσου',
];

export interface PersonnelPortalSectionProps {
  initialMode?: 'teacher' | 'admin';
  currentAdminUser?: string;
  onExitToLanding?: () => void;
}

export const PersonnelPortalSection: React.FC<PersonnelPortalSectionProps> = ({
  initialMode = 'teacher',
  currentAdminUser,
  onExitToLanding
}) => {
  // Portal Mode: 'teacher' (AFM/AM login) vs 'admin' (browse all records)
  const [portalMode, setPortalMode] = useState<'teacher' | 'admin'>(initialMode);

  useEffect(() => {
    setPortalMode(initialMode);
  }, [initialMode]);

  // Teacher Authentication state
  const [teacherAfm, setTeacherAfm] = useState('');
  const [teacherAm, setTeacherAm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [teacherAuthLoading, setTeacherAuthLoading] = useState(false);
  const [teacherAuthError, setTeacherAuthError] = useState<string | null>(null);
  const [authenticatedTeacher, setAuthenticatedTeacher] = useState<PlineRecord | null>(null);
  const [teacherSaveNotice, setTeacherSaveNotice] = useState(false);

  // Admin / Record browsing state
  const [records, setRecords] = useState<PlineRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PlineRecord | null>(null);
  const [editForm, setEditForm] = useState<Partial<PlineRecord>>({});
  const [activeTab, setActiveTab] = useState<'page1' | 'page2' | 'page3' | 'page4'>('page1');
  const [applicationType, setApplicationType] = useState<'apospasi' | 'diathesi' | 'organiki_yperarithmia' | 'leitourgiki_yperarithmia'>('apospasi');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedSchoolCategory, setSelectedSchoolCategory] = useState<SchoolCategory | ''>('dimotika');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [selectedSchoolUnit, setSelectedSchoolUnit] = useState<string>('');
  const [selectedBatchSchools, setSelectedBatchSchools] = useState<string[]>([]);
  const [lastSelectedBatchIdx, setLastSelectedBatchIdx] = useState<number | null>(null);
  const [activePreferenceSchool, setActivePreferenceSchool] = useState<string | null>(null);
  const [focusedActionTarget, setFocusedActionTarget] = useState<{ school: string; action: 'top' | 'up' | 'down' | 'bottom' } | null>(null);
  const [activeTableName, setActiveTableName] = useState('e_aitisi.teachers');
  const [syncingClone, setSyncingClone] = useState(false);
  const [cloneSyncMsg, setCloneSyncMsg] = useState<string | null>(null);
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'profiles'>('dashboard');

  const [phases, setPhases] = useState<any[]>([]);
  const [loadingPhases, setLoadingPhases] = useState(false);

  const fetchPhases = async () => {
    setLoadingPhases(true);
    try {
      const res = await fetch('api/plinetamag/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.phases) {
          setPhases(data.phases);
        }
      }
    } catch (err) {
      console.error('Error fetching phases:', err);
    } finally {
      setLoadingPhases(false);
    }
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const isPhaseActive = (phaseId: string): { active: boolean; message?: string; start?: string; end?: string } => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return { active: true };
    
    if (!phase.active) {
      return { 
        active: false, 
        message: 'Η διαδικασία αυτή έχει απενεργοποιηθεί από τον διαχειριστή.',
        start: phase.startDate,
        end: phase.endDate
      };
    }
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    if (phase.startDate && todayStr < phase.startDate) {
      return { 
        active: false, 
        message: `Η διαδικασία δεν έχει ξεκινήσει ακόμα. Περίοδος υποβολής: ${new Date(phase.startDate).toLocaleDateString('el-GR')} έως ${new Date(phase.endDate).toLocaleDateString('el-GR')}.`,
        start: phase.startDate,
        end: phase.endDate
      };
    }
    
    if (phase.endDate && todayStr > phase.endDate) {
      return { 
        active: false, 
        message: `Η περίοδος υποβολής έχει λήξει στις ${new Date(phase.endDate).toLocaleDateString('el-GR')}.`,
        start: phase.startDate,
        end: phase.endDate
      };
    }
    
    return { active: true, start: phase.startDate, end: phase.endDate };
  };

  useEffect(() => {
    if (focusedActionTarget) {
      const btn = document.querySelector(`[data-school-action="${focusedActionTarget.school}-${focusedActionTarget.action}"]`) as HTMLElement;
      if (btn) {
        btn.focus();
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      setFocusedActionTarget(null);
    }
  }, [focusedActionTarget, editForm.Προτιμήσεις]);

  // No longer forcing a reset of applicationType based on legacy excess status '3' to allow free preparation

  const handleCloneSync = async () => {
    setSyncingClone(true);
    setCloneSyncMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch('api/plinetamag/clone-sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Σφάλμα συγχρονισμού αντιγράφου ΒΔ');
      }
      setActiveTableName(data.table || 'e_aitisi.teachers');
      setCloneSyncMsg(data.message || 'Το αντίγραφο ΒΔ δημιουργήθηκε επιτυχώς!');
      fetchRecords(page, search);
      setTimeout(() => setCloneSyncMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSyncingClone(false);
    }
  };

  // Helper functions for school preferences management (Tab 3)
  const getPreferencesList = (): string[] => {
    const raw = String(editForm.Προτιμήσεις || selectedRecord?.Προτιμήσεις || '').trim();
    if (raw) {
      const rawList = raw.includes('\n') ? raw.split(/\r?\n/) : raw.split(',');
      const parsed = rawList
        .map(s => s.replace(/^\d+[\)\.\-]\s*/, '').trim())
        .filter(Boolean);
      if (parsed.length > 0) return parsed;
    }
    const legacyList: string[] = [];
    const src1 = editForm as any;
    const src2 = selectedRecord as any;
    for (let i = 1; i <= 20; i++) {
      const val = src1?.[`Σχολείο${i}`] || src2?.[`Σχολείο${i}`];
      if (val && typeof val === 'string' && val.trim() !== '') {
        legacyList.push(val.trim());
      }
    }
    return legacyList;
  };

  const updatePreferencesList = (list: string[]) => {
    const formatted = list.join(', ');
    setEditForm(prev => ({
      ...prev,
      Προτιμήσεις: formatted,
      ΑρΠροτιμ: list.length
    }));
    setSaveSuccess(false);
  };

  const handleAddSchoolPreference = (schoolName?: string) => {
    const toAdd = (schoolName || '').trim();
    if (!toAdd || toAdd === '---' || toAdd.startsWith('───')) return;
    const current = getPreferencesList();
    if (current.length >= 20) {
      setErrorMsg('Έχετε συμπληρώσει τον μέγιστο επιτρεπόμενο αριθμό (20) σχολικών προτιμήσεων.');
      return;
    }
    if (!current.includes(toAdd)) {
      updatePreferencesList([...current, toAdd]);
    }
  };

  const handleAddBatchSchools = (schools: string[]) => {
    const validSchools = schools.map(s => s.trim()).filter(s => s && s !== '---' && !s.startsWith('───') && !s.startsWith('---'));
    if (validSchools.length === 0) return;
    
    const current = getPreferencesList();
    if (current.length >= 20) {
      setErrorMsg('Έχετε ήδη συμπληρώσει τον μέγιστο επιτρεπόμενο αριθμό (20) σχολικών προτιμήσεων.');
      return;
    }
    
    let updated = [...current];
    let addedCount = 0;
    
    for (const s of validSchools) {
      if (updated.length >= 20) {
        setErrorMsg('Προστέθηκαν όσες σχολικές μονάδες ήταν δυνατό μέχρι τη συμπλήρωση του μέγιστου ορίου (20/20).');
        break;
      }
      if (!updated.includes(s)) {
        updated.push(s);
        addedCount++;
      }
    }
    
    if (addedCount > 0) {
      updatePreferencesList(updated);
      setSelectedBatchSchools([]);
      setLastSelectedBatchIdx(null);
    }
  };

  const handleRemoveSchoolPreference = (index: number) => {
    const current = getPreferencesList();
    const removed = current[index];
    current.splice(index, 1);
    updatePreferencesList(current);
    if (activePreferenceSchool === removed) {
      setActivePreferenceSchool(null);
    }
  };

  const handleMovePreference = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const current = getPreferencesList();
    if (index < 0 || index >= current.length) return;
    const item = current[index];
    if (direction === 'up' && index > 0) {
      const temp = current[index - 1];
      current[index - 1] = current[index];
      current[index] = temp;
      updatePreferencesList(current);
      setActivePreferenceSchool(item);
      setFocusedActionTarget({ school: item, action: 'up' });
    } else if (direction === 'down' && index < current.length - 1) {
      const temp = current[index + 1];
      current[index + 1] = current[index];
      current[index] = temp;
      updatePreferencesList(current);
      setActivePreferenceSchool(item);
      setFocusedActionTarget({ school: item, action: 'down' });
    } else if (direction === 'top' && index > 0) {
      current.splice(index, 1);
      current.unshift(item);
      updatePreferencesList(current);
      setActivePreferenceSchool(item);
      setFocusedActionTarget({ school: item, action: 'top' });
    } else if (direction === 'bottom' && index < current.length - 1) {
      current.splice(index, 1);
      current.push(item);
      updatePreferencesList(current);
      setActivePreferenceSchool(item);
      setFocusedActionTarget({ school: item, action: 'bottom' });
    }
  };

  const fetchRecords = async (pageIndex = 1, searchQuery = search) => {
    if (portalMode === 'teacher' && !authenticatedTeacher) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`api/plinetamag/records?page=${pageIndex}&limit=12&search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch records');
      }
      const data = await res.json();
      setRecords(data.records || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      if (data.tableName) setActiveTableName(data.tableName);
      if (data.records && data.records.length > 0 && !selectedRecord && portalMode === 'admin') {
        handleSelectRecord(data.records[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (portalMode === 'admin') {
      fetchRecords(1, '');
    }
  }, [portalMode]);

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherAuthLoading(true);
    setTeacherAuthError(null);
    try {
      const res = await fetch('api/plinetamag/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ afm: teacherAfm, am: teacherAm })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Αποτυχία σύνδεσης εκπαιδευτικού.');
      }
      setAuthenticatedTeacher(data.teacher);
      handleSelectRecord(data.teacher);
    } catch (err: any) {
      setTeacherAuthError(err.message);
    } finally {
      setTeacherAuthLoading(false);
    }
  };

  const handleTeacherLogout = () => {
    setAuthenticatedTeacher(null);
    setSelectedRecord(null);
    setTeacherAfm('');
    setTeacherAm('');
    setTeacherSaveNotice(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(1, search);
  };

  const handleSelectRecord = (rec: PlineRecord) => {
    setSelectedRecord(rec);
    const raw = String(rec.Προτιμήσεις || '').trim();
    const items = raw ? (raw.includes('\n') ? raw.split(/\r?\n/) : raw.split(',')) : [];
    const count = rec.ΑρΠροτιμ ?? items.map(s => s.replace(/^\d+[\)\.\-]\s*/, '').trim()).filter(Boolean).length;
    setEditForm({ ...rec, ΑρΠροτιμ: count });
    setSaveSuccess(false);
  };

  const handleFieldChange = (field: keyof PlineRecord, value: any) => {
    setEditForm(prev => {
      const updated: any = { ...prev, [field]: value };
      if (field === 'Προτιμήσεις') {
        const raw = String(value || '').trim();
        const items = raw ? (raw.includes('\n') ? raw.split(/\r?\n/) : raw.split(',')) : [];
        updated.ΑρΠροτιμ = items.map(s => s.replace(/^\d+[\)\.\-]\s*/, '').trim()).filter(Boolean).length;
      }
      return updated;
    });
    setSaveSuccess(false);
  };

  const checkHasChanges = (): boolean => {
    if (!selectedRecord || !editForm) return false;
    const keys = Object.keys(editForm) as Array<keyof PlineRecord>;
    for (const key of keys) {
      if (key === 'Α_Α') continue;
      const val1 = editForm[key];
      const val2 = selectedRecord[key];
      if (key === 'Προτιμήσεις') {
        const parseList = (val: any) =>
          String(val || '')
            .split(/\r?\n|,/)
            .map(s => s.replace(/^\d+[\)\.\-]\s*/, '').trim())
            .filter(Boolean)
            .join(' | ');
        if (parseList(val1) !== parseList(val2)) return true;
        continue;
      }
      if (key === 'ΑρΠροτιμ') {
        if (Number(val1 || 0) !== Number(val2 || 0)) return true;
        continue;
      }
      if (val1 === val2) continue;
      const str1 = val1 === null || val1 === undefined ? '' : String(val1).trim();
      const str2 = val2 === null || val2 === undefined ? '' : String(val2).trim();
      if (str1 !== str2) return true;
    }
    return false;
  };

  const handleSave = async (silentParam: boolean | any = false) => {
    if (!selectedRecord) return;
    const isSilent = typeof silentParam === 'boolean' && silentParam === true;
    if (isSilent && !checkHasChanges()) {
      return;
    }
    if (!isSilent) {
      setSaving(true);
      setErrorMsg(null);
    }
    setSaveSuccess(false);
    try {
      const res = await fetch(`api/plinetamag/records/${selectedRecord.Α_Α}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Σφάλμα κατά την αποθήκευση');
      }
      const updated = { ...selectedRecord, ...editForm } as PlineRecord;
      setSelectedRecord(updated);
      if (authenticatedTeacher && authenticatedTeacher.Α_Α === selectedRecord.Α_Α) {
        setAuthenticatedTeacher(updated);
      }
      setSaveSuccess(true);
      // Also update in list if in admin mode
      setRecords(prev => prev.map(r => r.Α_Α === selectedRecord.Α_Α ? updated : r));
      if (portalMode === 'teacher' && !isSilent) {
        if (updated.Υπεραριθμία === '1' || updated.Υπεραριθμία === '2') {
          setTeacherSaveNotice(true);
        } else {
          setTeacherSaveNotice(false);
        }
      }
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err: any) {
      if (!isSilent) setErrorMsg(err.message);
    } finally {
      if (!isSilent) setSaving(false);
    }
  };

  const isStep1Complete = () => {
    const city = editForm.Πόλη?.trim();
    const street = editForm.Οδός?.trim();
    const number = editForm.Αριθμός?.trim();
    const mobile = editForm.Κινητό?.trim();
    const email = editForm.Email?.trim();
    return !!(city && street && number && mobile && email);
  };

  const handleTabChange = (nextTab: 'page1' | 'page2' | 'page3' | 'page4') => {
    if (portalMode === 'teacher' && nextTab !== 'page1' && !isStep1Complete()) {
      return;
    }
    if (selectedRecord && activeTab !== nextTab) {
      handleSave(true);
    }
    if (activeTab !== nextTab) {
      setShowPdfPreview(false);
    }
    setActiveTab(nextTab);
  };

  const maritalMap: Record<string, string> = {
    '0': 'Άγαμος/η',
    '1': 'Έγγαμος/η',
    '2': 'Διαζευγμένος/η',
    '3': 'Χήρος/α'
  };

  const healthMap: Record<string, string> = {
    '0': 'Όχι',
    '1': '50-66%',
    '2': '67-80%',
    '3': 'άνω του 80%'
  };

  const getHealthSummary = (record: PlineRecord) => {
    const parts: string[] = [];
    if (record.ΛόγοιΥγείαςΙδίου && record.ΛόγοιΥγείαςΙδίου !== '0') {
      parts.push(`Ιδίου: ${healthMap[record.ΛόγοιΥγείαςΙδίου]}`);
    }
    if (record.ΛόγοιΥγείαςΣυζ && record.ΛόγοιΥγείαςΣυζ !== '0') {
      parts.push(`Συζύγου: ${healthMap[record.ΛόγοιΥγείαςΣυζ]}`);
    }
    if (record.ΛόγοιΥγείαςΤεκν && record.ΛόγοιΥγείαςΤεκν !== '0') {
      parts.push(`Τέκνων: ${healthMap[record.ΛόγοιΥγείαςΤεκν]}`);
    }
    if (record.ΛόγοιΥγείαςΓον && record.ΛόγοιΥγείαςΓον !== '0') {
      parts.push(`Γονέων: ${healthMap[record.ΛόγοιΥγείαςΓον]}`);
    }
    if (record.ΛόγοιΥγείαςΑδερ && record.ΛόγοιΥγείαςΑδερ !== '0') {
      parts.push(`Αδερφών: ${healthMap[record.ΛόγοιΥγείαςΑδερ]}`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Όχι';
  };

  // Programmatic Vector PDF Generator (jsPDF + AutoTable)
  const generateProgrammaticPdf = async () => {
    if (!selectedRecord) return;
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      await loadGreekFontToDoc(doc);

      const appTitleStr = 
        applicationType === 'apospasi' ? 'ΑΙΤΗΣΗ ΑΠΟΣΠΑΣΗΣ ΕΝΤΟΣ ΠΥΣΠΕ' :
        applicationType === 'diathesi' ? 'ΑΙΤΗΣΗ ΤΟΠΟΘΕΤΗΣΗΣ ΑΠΟ ΔΙΑΘΕΣΗ ΕΝΤΟΣ ΠΥΣΠΕ' :
        applicationType === 'organiki_yperarithmia' ? 'ΑΙΤΗΣΗ ΤΟΠΟΘΕΤΗΣΗΣ ΑΠΟ ΟΡΓΑΝΙΚΗ ΥΠΕΡΑΡΙΘΜΙΑ ΕΝΤΟΣ ΠΥΣΠΕ' :
        'ΑΙΤΗΣΗ ΤΟΠΟΘΕΤΗΣΗΣ ΑΠΟ ΛΕΙΤΟΥΡΓΙΚΗ ΥΠΕΡΑΡΙΘΜΙΑ ΕΝΤΟΣ ΠΥΣΠΕ';

      doc.setFontSize(12.5);
      doc.text('ΔΙΕΥΘΥΝΣΗ ΠΡΩΤΟΒΑΘΜΙΑΣ ΕΚΠΑΙΔΕΥΣΗΣ ΜΑΓΝΗΣΙΑΣ', 105, 16, { align: 'center' });
      doc.setFontSize(10.5);
      doc.text(appTitleStr, 105, 22, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`Σχολικό Έτος 2026-2027  •  Αρ. Μητρώου: ${selectedRecord.ΑρΜητρ || '-'}  •  ΑΦΜ: ${selectedRecord.ΑΦΜ || '-'}`, 105, 28, { align: 'center' });

      // Table 1: Στοιχεία Εκπαιδευτικού
      autoTable(doc, {
        startY: 33,
        theme: 'grid',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8.5, cellPadding: 1.8, textColor: [15, 23, 42], lineColor: [148, 163, 184], lineWidth: 0.15 },
        headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] },
        bodyStyles: { font: 'Roboto', fontStyle: 'normal' },
        head: [['ΣΤΟΙΧΕΙΑ ΕΚΠΑΙΔΕΥΤΙΚΟΥ & ΥΠΗΡΕΣΙΑΚΗΣ ΚΑΤΑΣΤΑΣΗΣ', '']],
        body: [
          ['Ονοματεπώνυμο:', `${selectedRecord.Επώνυμο || ''} ${selectedRecord.Όνομα || ''} (${selectedRecord.Πατρώνυμο || ''})`],
          ['Ειδικότητα:', `${selectedRecord.Ειδικότητα || ''} (${selectedRecord.ΚωδΕιδικότ || ''})`],
          ['Οργανική Θέση:', selectedRecord.Οργανική || '-'],
          ['Περιοχή Μετάθεσης:', selectedRecord.ΠεριοχήΜετάθεσης || 'Α΄ ΜΑΓΝΗΣΙΑΣ (Π.Ε.)'],
          ['Στοιχεία Επικοινωνίας:', `${selectedRecord.Κινητό || '-'}  •  ${selectedRecord.Email || '-'}`],
          ['Διεύθυνση Κατοικίας:', `${selectedRecord.Οδός || '-'} ${selectedRecord.Αριθμός || ''}, ${selectedRecord.Πόλη || '-'} (Τ.Κ. ${selectedRecord.ΤαχΚωδ || '-'})`]
        ],
        columnStyles: {
          0: { cellWidth: 50, font: 'Roboto', fontStyle: 'normal', textColor: [0, 0, 0] },
          1: { cellWidth: 'auto', font: 'Roboto', fontStyle: 'normal' }
        }
      });

      // Table 2: Μοριοδότηση & Κριτήρια (Με κενό πεδίο στη 2η στήλη για χειροκίνητη καταγραφή μορίων από την Υπηρεσία)
      const criteriaList = [
        `Συνολική Υπηρεσία: ${selectedRecord.Έτη ?? 0} Έτη, ${selectedRecord.Μήνες ?? 0} Μήνες, ${selectedRecord.Ημέρες ?? 0} Ημέρες`,
        'Δυσμενών Συνθηκών Σχολείων (Υπολογισμός από Υπηρεσία):',
        `Οικογενειακή Κατάσταση: ${maritalMap[String(selectedRecord.ΟικΚατάστ || '0')] || selectedRecord.ΟικΚατάστ || 'Άγαμος/η'}  •  Αρ. Παιδιών: ${selectedRecord.ΑρΠαιδιών ?? 0}`,
        `Εντοπιότητα: ${selectedRecord.Εντοπιότητα || '-'}`,
        `Συνυπηρέτηση: ${selectedRecord.Συνυπηρέτηση || '-'}`
      ];

      const healthSum = getHealthSummary(selectedRecord);
      if (healthSum && healthSum !== 'Όχι') {
        criteriaList.push(`Σοβαροί Λόγοι Υγείας: ${healthSum}`);
      }
      if (selectedRecord.Θεραπεία === '1') {
        criteriaList.push('Θεραπεία Εξωσωματικής Γονιμοποίησης: Ναι');
      }
      if (selectedRecord.Μεταπτυχιακό && selectedRecord.Μεταπτυχιακό !== '0') {
        criteriaList.push(`Διαδικασία Λήψης Μεταπτυχιακού / Σπουδές: ${selectedRecord.Μεταπτυχιακό}`);
      }
      if (selectedRecord.ΕιδικήΚΜ === '1') {
        criteriaList.push('Ειδική κατηγορία μετάθεσης (παρ. 1, άρθρο 13, ΠΔ 50/1996): Ναι');
      }
      if (selectedRecord.ΚατηγορίαΚΠ && selectedRecord.ΚατηγορίαΚΠ !== 'Κανένα' && selectedRecord.ΚατηγορίαΚΠ !== '') {
        criteriaList.push(`Κατηγορία Κατά Προτεραιότητα: ${selectedRecord.ΚατηγορίαΚΠ}`);
      }

      const criteriaBody = criteriaList.map(text => [text, '']);
      criteriaBody.push(['ΣΥΝΟΛΟ ΜΟΡΙΩΝ (Αθροισμα Υπηρεσίας):', '']);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 4,
        theme: 'grid',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8.5, cellPadding: 2.2, textColor: [15, 23, 42], lineColor: [148, 163, 184], lineWidth: 0.15 },
        headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] },
        bodyStyles: { font: 'Roboto', fontStyle: 'normal' },
        head: [['ΚΡΙΤΗΡΙΑ & ΔΗΛΩΘΕΝΤΑ ΣΤΟΙΧΕΙΑ ΕΚΠΑΙΔΕΥΤΙΚΟΥ', 'ΜΟΝΑΔΕΣ (Για υπηρεσιακή χρήση)']],
        body: criteriaBody,
        columnStyles: {
          0: { font: 'Roboto', fontStyle: 'normal' },
          1: { cellWidth: 45, halign: 'center', font: 'Roboto', fontStyle: 'normal' }
        }
      });

      // Table 3: Δηλωθείσες Προτιμήσεις Σχολείων (10 rows, double column mirroring the HTML preview layout)
      const schoolsBody: any[] = [];
      const prefsList = getPreferencesList();

      for (let idx = 0; idx < 10; idx++) {
        const leftSch = prefsList[idx] || '';
        const rightSch = prefsList[idx + 10] || '';
        schoolsBody.push([
          `${idx + 1}.`,
          leftSch,
          `${idx + 11}.`,
          rightSch
        ]);
      }

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 4,
        theme: 'grid',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8, cellPadding: 1.5, textColor: [15, 23, 42], lineColor: [148, 163, 184], lineWidth: 0.15 },
        headStyles: { font: 'Roboto', fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] },
        bodyStyles: { font: 'Roboto', fontStyle: 'normal' },
        head: [['Α/Α', 'ΣΧΟΛΙΚΗ ΜΟΝΑΔΑ (1η ΣΤΗΛΗ)', 'Α/Α', 'ΣΧΟΛΙΚΗ ΜΟΝΑΔΑ (2η ΣΤΗΛΗ)']],
        body: schoolsBody,
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', font: 'Roboto', fontStyle: 'normal', textColor: [0, 0, 0] },
          1: { cellWidth: 'auto', font: 'Roboto', fontStyle: 'normal' },
          2: { cellWidth: 10, halign: 'center', font: 'Roboto', fontStyle: 'normal', textColor: [0, 0, 0] },
          3: { cellWidth: 'auto', font: 'Roboto', fontStyle: 'normal' }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(9);
      if (finalY > 265) {
        doc.addPage();
        doc.text(`Ημερομηνία: ${new Date().toLocaleDateString('el-GR')}`, 20, 25);
        doc.text('Ο/Η Αιτών / Αιτούσα Εκπαιδευτικός', 130, 25);
        doc.text(`${selectedRecord.Επώνυμο || ''} ${selectedRecord.Όνομα || ''}`, 130, 42);
      } else {
        doc.text(`Ημερομηνία: ${new Date().toLocaleDateString('el-GR')}`, 20, finalY);
        doc.text('Ο/Η Αιτών / Αιτούσα Εκπαιδευτικός', 130, finalY);
        doc.text(`${selectedRecord.Επώνυμο || ''} ${selectedRecord.Όνομα || ''}`, 130, finalY + 16);
      }

      let typeStr = 'Αίτησης';
      if (applicationType === 'apospasi') {
        typeStr = 'Απόσπασης';
      } else if (applicationType === 'diathesi') {
        typeStr = 'Διάθεσης';
      } else if (applicationType === 'organiki_yperarithmia' || applicationType === 'leitourgiki_yperarithmia') {
        typeStr = 'Υπεραριθμίας';
      }

      const fileName = `Αίτηση_${typeStr}_${selectedRecord.Επώνυμο || 'Teacher'}_${selectedRecord.Όνομα || ''}_${selectedRecord.ΑρΜητρ || ''}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("Error generating programmatic PDF:", err);
      alert("Προέκυψε σφάλμα κατά τη δημιουργία του αρχείου PDF. Παρακαλώ δοκιμάστε την εναλλακτική απομονωμένη εκτύπωση.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ================= RENDER: TEACHER SIGN-IN WIDGET =================
  if (portalMode === 'teacher' && !authenticatedTeacher) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto py-8">
        {/* Top Header & Mode Toggle */}
        <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Πύλη Εκπαιδευτικών</h3>
              <p className="text-[11px] text-slate-400">Σύνδεση & Διαχείριση Προσωπικών Στοιχείων</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onExitToLanding && initialMode === 'teacher' && (
              <button
                type="button"
                onClick={onExitToLanding}
                className="text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 px-3 py-1.5 rounded-xl border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Αποσύνδεση</span>
              </button>
            )}
            {initialMode !== 'teacher' && (
              <button
                type="button"
                onClick={() => setPortalMode('admin')}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Προβολή Διαχειριστή</span>
              </button>
            )}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-950 p-8 rounded-3xl border border-blue-900/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400 border border-blue-500/40 shadow-inner">
              <Key className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Σύνδεση Εκπαιδευτικού</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Εισάγετε τον <strong className="text-blue-300">ΑΦΜ</strong> σας ως Όνομα Χρήστη και τον <strong className="text-blue-300">Αριθμό Μητρώου (ΑρΜητρ)</strong> ως Κωδικό για πρόσβαση στην καρτέλα σας από τη βάση δεδομένων.
            </p>
          </div>

          {teacherAuthError && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{teacherAuthError}</span>
            </div>
          )}

          <form onSubmit={handleTeacherLogin} className="space-y-5 max-w-md mx-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Αριθμός Φορολογικού Μητρώου (ΑΦΜ) <span className="text-blue-400 font-normal">| Όνομα Χρήστη</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={teacherAfm}
                  onChange={e => setTeacherAfm(e.target.value)}
                  placeholder="π.χ. 058123456"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Αριθμός Μητρώου <span className="text-blue-400 font-normal">(ως Κωδικός)</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={teacherAm}
                  onChange={e => setTeacherAm(e.target.value)}
                  placeholder="π.χ. 214567"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={teacherAuthLoading || !teacherAfm.trim() || !teacherAm.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all transform active:scale-[0.99]"
            >
              {teacherAuthLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Έλεγχος στοιχείων στη ΒΔ...</span>
                </>
              ) : (
                <>
                  <span>Είσοδος στην Καρτέλα</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Workflow Guide Info Banner */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider block">
              ΒΗΜΑΤΑ ΡΟΗΣ ΕΡΓΑΣΙΑΣ (WORKFLOW)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-300">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-blue-400 block mb-0.5">1. Σύνδεση</strong>
                Αυθεντικοποίηση με ΑΦΜ & ΑΜ
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-purple-400 block mb-0.5">2. Ενημέρωση</strong>
                Στοιχεία επικοινωνίας & κριτήρια
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">3. Σχολικές Μονάδες</strong>
                Δήλωση & σειρά προτίμησης
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">4. Εξαγωγή PDF</strong>
                Δημιουργία εγγράφου για κατάθεση
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 print:space-y-0 print:block">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl print:hidden">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/30">
            {portalMode === 'teacher' ? <UserCheck className="w-6 h-6 text-emerald-400" /> : <Users className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {portalMode === 'teacher' && authenticatedTeacher ? (
                <span>Εκπαιδευτικός: {authenticatedTeacher.Επώνυμο} {authenticatedTeacher.Όνομα}</span>
              ) : (
                <>
                  <span>Πύλη Διαχειριστή Δεδομένων</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {total.toLocaleString()} εγγραφές
                  </span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {portalMode === 'teacher' ? (
                <span>ΑΜ: <strong className="text-white font-mono">{authenticatedTeacher?.ΑρΜητρ}</strong> | Ειδικότητα: <strong>{authenticatedTeacher?.Ειδικότητα} ({authenticatedTeacher?.ΚωδΕιδικότ})</strong></span>
              ) : (
                <span>Διαχείριση Προσωπικών & Υπηρεσιακών Δεδομένων | Εφαρμογή: Η-αίτηση</span>
              )}
            </p>
          </div>
        </div>

        {/* Mode & Action Controls */}
        <div className="flex flex-col items-end gap-3.5">
          {portalMode === 'teacher' ? (
            /* Teacher Portal View */
            authenticatedTeacher && (
              <button
                type="button"
                onClick={() => {
                  handleTeacherLogout();
                  if (onExitToLanding) onExitToLanding();
                }}
                className="flex items-center gap-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Αποσύνδεση</span>
              </button>
            )
          ) : (
            /* Admin Portal View */
            <div className="flex flex-col items-end gap-2.5 w-full sm:w-auto">
              {/* Top Row: Κονσόλα, Καρτέλες, Αποσύνδεση */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAdminViewMode('dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      adminViewMode === 'dashboard'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Κονσόλα</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminViewMode('profiles')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      adminViewMode === 'profiles'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Καρτέλες</span>
                  </button>
                </div>

                {/* Administrator's Logout/Disconnect Button in the Header */}
                {onExitToLanding && (
                  <button
                    type="button"
                    onClick={onExitToLanding}
                    className="flex items-center gap-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Αποσύνδεση</span>
                  </button>
                )}
              </div>

              {/* Bottom Row: Search Input */}
              {adminViewMode === 'profiles' && (
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80 animate-in fade-in duration-200">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Αναζήτηση Επώνυμο, Όνομα, ΑρΜητρ..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer"
                  >
                    Αναζήτηση
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {cloneSyncMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{cloneSyncMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2 print:hidden">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left List (Only in Admin Mode & when in profiles mode) / Right 3-Page Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block print:m-0 print:p-0">
        {/* Left List Pane (Only in Admin Mode & when in profiles mode) */}
        {portalMode === 'admin' && adminViewMode === 'profiles' && (
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[650px] print:hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 tracking-wider">ΕΓΓΡΑΦΕΣ ΠΡΟΣΩΠΙΚΟΥ</span>
              <span className="text-[11px] font-mono text-slate-500">Σελίδα {page} από {Math.ceil(total / 12) || 1}</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="text-xs">Φόρτωση εγγραφών MySQL...</span>
                </div>
              ) : records.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">Δεν βρέθηκαν εγγραφές.</div>
              ) : (
                records.map(rec => {
                  const isSelected = selectedRecord?.Α_Α === rec.Α_Α;
                  return (
                    <button
                      key={rec.Α_Α}
                      onClick={() => handleSelectRecord(rec)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-blue-600/20 border border-blue-500/40 text-white' 
                          : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-xs truncate">
                          {rec.Επώνυμο} {rec.Όνομα}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-blue-300">ΑΜ: {rec.ΑρΜητρ}</span>
                          <span>•</span>
                          <span className="truncate">{rec.Ειδικότητα || rec.ΚωδΕιδικότ}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'}`} />
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                disabled={page <= 1}
                onClick={() => fetchRecords(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                Προηγούμενη
              </button>
              <span className="font-mono text-slate-400">{page} / {Math.ceil(total / 12) || 1}</span>
              <button
                disabled={page * 12 >= total}
                onClick={() => fetchRecords(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                Επόμενη
              </button>
            </div>
          </div>
        )}

        {/* Right Content Pane (Takes full width 12 cols in Teacher Mode or Admin Dashboard Mode, 8 cols in Admin Profile Mode) */}
        <div className={`${(portalMode === 'admin' && adminViewMode === 'profiles') ? 'lg:col-span-8' : 'lg:col-span-12'} bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col min-h-[650px] overflow-hidden print:border-none print:shadow-none print:bg-white print:w-full print:block print:min-h-0 print:overflow-visible print:m-0 print:p-0`}>
          {portalMode === 'admin' && adminViewMode === 'dashboard' ? (
            <AdminDashboardPane
              activeTableName={activeTableName}
              onRefreshAllRecords={() => fetchRecords(page, search)}
              onSelectTeacherForEditing={(rec) => {
                handleSelectRecord(rec);
                setAdminViewMode('profiles');
              }}
              currentAdminUser={currentAdminUser}
            />
          ) : !selectedRecord ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500 p-8 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-700" />
              <p className="text-sm">Επιλέξτε ένα μέλος προσωπικού από τη λίστα για προβολή & διαχείριση.</p>
            </div>
          ) : (
            <>
              {/* Selected Record Header Info */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {selectedRecord.Επώνυμο} {selectedRecord.Όνομα} {selectedRecord.Πατρώνυμο ? `(${selectedRecord.Πατρώνυμο})` : ''}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span><strong>ΑΜ:</strong> <code className="text-blue-300">{selectedRecord.ΑρΜητρ}</code></span>
                    <span><strong>ΑΦΜ:</strong> <code className="text-purple-300">{selectedRecord.ΑΦΜ}</code></span>
                    <span><strong>Ειδικότητα:</strong> {selectedRecord.Ειδικότητα} ({selectedRecord.ΚωδΕιδικότ})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> Αποθηκεύτηκε!
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}</span>
                  </button>
                </div>
              </div>

              {/* Teacher Save Success Notice */}
              {teacherSaveNotice && portalMode === 'teacher' && (selectedRecord?.Υπεραριθμία === '1' || selectedRecord?.Υπεραριθμία === '2') && (
                <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-b border-emerald-500/40 p-4 px-5 animate-in fade-in duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/30">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-emerald-300 text-sm">
                        Η αποθήκευση των στοιχείων και της δήλωσής σας ολοκληρώθηκε με επιτυχία!
                      </h4>
                      <div className="text-slate-300 leading-relaxed space-y-0.5">
                        <p>• <strong className="text-white">Δεν απαιτείται καμία περαιτέρω ενέργεια</strong> από εσάς (ούτε εκτύπωση/εξαγωγή PDF ή αποστολή αίτησης) για την Ειδική Διαδικασία Άρσης Υπεραριθμίας.</p>
                        <p>• Για την ασφάλεια του λογαριασμού και των προσωπικών σας δεδομένων, <strong className="text-amber-300">προτείνεται η αποσύνδεσή σας</strong>.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleTeacherLogout}
                      className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Αποσύνδεση</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherSaveNotice(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Κλείσιμο μηνύματος"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Tabs (4 Pages) */}
              <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 overflow-x-auto print:hidden">
                <button
                  type="button"
                  onClick={() => handleTabChange('page1')}
                  className={`px-4 py-3 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'page1'
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Βήμα 1: Προσωπικά & Επικοινωνία</span>
                </button>

                <button
                  type="button"
                  disabled={portalMode === 'teacher' && !isStep1Complete()}
                  onClick={() => handleTabChange('page2')}
                  className={`px-4 py-3 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    portalMode === 'teacher' && !isStep1Complete()
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  } ${
                    activeTab === 'page2'
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
                  }`}
                  title={portalMode === 'teacher' && !isStep1Complete() ? 'Παρακαλούμε συμπληρώστε τα υποχρεωτικά στοιχεία επικοινωνίας στο Βήμα 1' : ''}
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Βήμα 2: Κριτήρια Μοριοδότησης</span>
                </button>

                <button
                  type="button"
                  disabled={portalMode === 'teacher' && !isStep1Complete()}
                  onClick={() => handleTabChange('page3')}
                  className={`px-4 py-3 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    portalMode === 'teacher' && !isStep1Complete()
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  } ${
                    activeTab === 'page3'
                      ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
                  }`}
                  title={portalMode === 'teacher' && !isStep1Complete() ? 'Παρακαλούμε συμπληρώστε τα υποχρεωτικά στοιχεία επικοινωνίας στο Βήμα 1' : ''}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Βήμα 3: Επιλογή Σχολικών Μονάδων</span>
                </button>

                <button
                  type="button"
                  disabled={portalMode === 'teacher' && !isStep1Complete()}
                  onClick={() => handleTabChange('page4')}
                  className={`px-4 py-3 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    portalMode === 'teacher' && !isStep1Complete()
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  } ${
                    activeTab === 'page4'
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-xl'
                  }`}
                  title={portalMode === 'teacher' && !isStep1Complete() ? 'Παρακαλούμε συμπληρώστε τα υποχρεωτικά στοιχεία επικοινωνίας στο Βήμα 1' : ''}
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Βήμα 4: Εξαγωγή σε PDF</span>
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 print:overflow-visible print:h-auto print:p-0 print:m-0 print:block print:space-y-0">
                {/* ================= PAGE 1: PERSONAL & CONTACT ================= */}
                {activeTab === 'page1' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Ειδική Διαδικασία Άρσης Υπεραριθμίας (Επιθυμώ / Δεν Επιθυμώ) */}
                    {(() => {
                      const declPhase = isPhaseActive('yper_decl');
                      const placementPhase = isPhaseActive('yper_placement');
                      const isTeacher = portalMode === 'teacher';
                      const isEditable = !isTeacher || declPhase.active || placementPhase.active;

                      return (
                        <div className="bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              isEditable
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                : 'bg-slate-800 border border-slate-700 text-slate-400'
                            }`}>
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-200 tracking-wide uppercase">
                                ΔΙΑΔΙΚΑΣΙΑ & ΚΑΤΑΣΤΑΣΗ ΥΠΕΡΑΡΙΘΜΙΑΣ
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                {editForm.Υπεραριθμία === '3'
                                  ? 'Έχετε κριθεί υπεράριθμος/η (Ενεργοποιεί Αίτηση Τοποθέτησης στα Βήματα 3-4)'
                                  : editForm.Υπεραριθμία === '1'
                                  ? 'Δηλώσατε: Δεν επιθυμώ να κριθώ υπεράριθμος/η'
                                  : editForm.Υπεραριθμία === '2'
                                  ? 'Δηλώσατε: Επιθυμώ να κριθώ υπεράριθμος/η'
                                  : 'Δεν συμμετέχετε στη διαδικασία υπεραριθμίας'}
                                {isTeacher && (
                                  <span className="text-slate-500 block sm:inline sm:ml-1.5 font-medium">
                                    ({declPhase.active || placementPhase.active ? 'Διαδικασία Ενεργή' : 'Κλειδωμένη / Εκτός προθεσμιών'})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0 self-start sm:self-center">
                            <span className="text-xs text-slate-300 font-semibold whitespace-nowrap">Δήλωση / Κατάσταση:</span>
                            <select
                              value={editForm.Υπεραριθμία || '0'}
                              disabled={!isEditable}
                              onChange={e => handleFieldChange('Υπεραριθμία', e.target.value)}
                              className={`bg-slate-900 border rounded-md px-2 py-1 text-xs font-bold focus:outline-none cursor-pointer transition-colors ${
                                isEditable
                                  ? 'border-amber-500/40 text-amber-300 focus:border-amber-400'
                                  : 'border-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <option value="0">Δεν συμμετέχω / Κανονική</option>
                              <option value="1">Δεν επιθυμώ να κριθώ υπεράριθμος/η (Δήλωση)</option>
                              <option value="2">Επιθυμώ να κριθώ υπεράριθμος/η (Δήλωση)</option>
                              <option value="3">Έχω κριθεί υπεράριθμος/η (Αίτηση Τοποθέτησης)</option>
                            </select>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Part A: Read-Only Labels */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          Α) ΥΠΗΡΕΣΙΑΚΑ ΣΤΟΙΧΕΙΑ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block font-medium">ΕΠΩΝΥΜΟ</span>
                          <span className="text-xs font-semibold text-slate-200">{selectedRecord.Επώνυμο || '-'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block font-medium">ΟΝΟΜΑ</span>
                          <span className="text-xs font-semibold text-slate-200">{selectedRecord.Όνομα || '-'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block font-medium">ΠΑΤΡΩΝΥΜΟ</span>
                          <span className="text-xs font-semibold text-slate-200">{selectedRecord.Πατρώνυμο || '-'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 md:col-span-2">
                          <span className="text-[10px] text-slate-500 block font-medium">ΕΙΔΙΚΟΤΗΤΑ</span>
                          <span className="text-xs font-semibold text-slate-200">{selectedRecord.Ειδικότητα || '-'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block font-medium">ΚΩΔ. ΕΙΔΙΚΟΤΗΤΑΣ</span>
                          <span className="font-mono text-xs font-semibold text-slate-200">{selectedRecord.ΚωδΕιδικότ || '-'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 md:col-span-2">
                          <span className="text-[10px] text-slate-500 block font-medium">ΟΡΓΑΝΙΚΗ ΘΕΣΗ</span>
                          <span className="text-xs font-semibold text-slate-200">{selectedRecord.Οργανική || '-'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block font-medium">ΚΩΔ. ΟΡΓΑΝΙΚΗΣ</span>
                          <span className="font-mono text-xs font-semibold text-slate-200">{selectedRecord.ΚωδΟργαν || '-'}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 md:col-span-3">
                          <span className="text-[10px] text-slate-500 block font-medium">ΠΕΡ. ΜΕΤΑΘΕΣΗΣ</span>
                          <span className="text-xs font-semibold text-slate-200">{selectedRecord.ΠερΜετάθ || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Part B: Editable Inputs */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-blue-900/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-blue-300 tracking-wider flex items-center gap-2">
                          <Unlock className="w-3.5 h-3.5 text-blue-400" />
                          Β) ΣΤΟΙΧΕΙΑ ΕΠΙΚΟΙΝΩΝΙΑΣ & ΔΙΕΥΘΥΝΣΗΣ
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Τροποποιήστε τα πεδία & πατήστε Αποθήκευση
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Πόλη <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            value={editForm.Πόλη || ''}
                            onChange={e => handleFieldChange('Πόλη', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Οδός <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            value={editForm.Οδός || ''}
                            onChange={e => handleFieldChange('Οδός', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Αριθμός <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={editForm.Αριθμός || ''}
                            onChange={e => handleFieldChange('Αριθμός', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-300 mb-1">Ταχ. Κώδικας</label>
                          <input
                            type="text"
                            maxLength={5}
                            value={editForm.ΤαχΚωδ || ''}
                            onChange={e => handleFieldChange('ΤαχΚωδ', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-slate-300 mb-1">Σταθερό Τηλέφωνο</label>
                          <input
                            type="text"
                            maxLength={11}
                            value={editForm.Σταθερό || ''}
                            onChange={e => handleFieldChange('Σταθερό', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Κινητό Τηλέφωνο <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={11}
                            value={editForm.Κινητό || ''}
                            onChange={e => handleFieldChange('Κινητό', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Email <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="email"
                            value={editForm.Email || ''}
                            onChange={e => handleFieldChange('Email', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Bottom Navigation */}
                      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-2 border-t border-slate-800/80 gap-3">
                        <div className="text-left">
                          {portalMode === 'teacher' && !isStep1Complete() && (
                            <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5 animate-pulse">
                              <AlertCircle className="w-3.5 h-3.5" />
                              * Παρακαλούμε συμπληρώστε όλα τα υποχρεωτικά πεδία (με αστεράκι) για να συνεχίσετε.
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={portalMode === 'teacher' && !isStep1Complete()}
                          onClick={() => handleTabChange('page2')}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all select-none ${
                            !(portalMode === 'teacher' && !isStep1Complete())
                              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                          }`}
                        >
                          <span>Συνέχεια στο Βήμα 2: Κριτήρια Μοριοδότησης</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= PAGE 2: WORK & FAMILY STATUS ================= */}
                {activeTab === 'page2' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Part A: Read-Only Service Duration */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          Α) ΣΥΝΟΛΙΚΗ ΠΡΟΥΠΗΡΕΣΙΑ / ΧΡΟΝΟΣ ΥΠΗΡΕΣΙΑΣ
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 block font-medium">ΕΤΗ ΥΠΗΡΕΣΙΑΣ</span>
                          <span className="text-2xl font-bold font-mono text-blue-400">{selectedRecord.Έτη ?? 0}</span>
                        </div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 block font-medium">ΜΗΝΕΣ</span>
                          <span className="text-2xl font-bold font-mono text-purple-400">{selectedRecord.Μήνες ?? 0}</span>
                        </div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-[11px] text-slate-400 block font-medium">ΗΜΕΡΕΣ</span>
                          <span className="text-2xl font-bold font-mono text-emerald-400">{selectedRecord.Ημέρες ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section B: Family Criteria */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          Β) ΟΙΚΟΓΕΝΕΙΑΚΑ ΚΡΙΤΗΡΙΑ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-slate-300 mb-1">Οικογενειακή Κατάσταση</label>
                          <select
                            value={editForm.ΟικΚατάστ || '0'}
                            onChange={e => handleFieldChange('ΟικΚατάστ', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Άγαμος/η</option>
                            <option value="1">Έγγαμος/η</option>
                            <option value="2">Διαζευγμένος/η</option>
                            <option value="3">Χήρος/α</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-300 mb-1">Αριθμός Παιδιών</label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={editForm.ΑρΠαιδιών ?? 0}
                            onChange={e => handleFieldChange('ΑρΠαιδιών', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section C: Locality / Co-serving */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          Γ) ΕΝΤΟΠΙΟΤΗΤΑ / ΣΥΝΗΠΗΡΕΤΗΣΗ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Εντοπιότητα</label>
                          <select
                            value={editForm.Εντοπιότητα || ''}
                            onChange={e => handleFieldChange('Εντοπιότητα', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value=""></option>
                            {MAGNESIA_MUNICIPALITIES.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                            {editForm.Εντοπιότητα && !MAGNESIA_MUNICIPALITIES.includes(editForm.Εντοπιότητα) && (
                              <option value={editForm.Εντοπιότητα}>{editForm.Εντοπιότητα}</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Συνυπηρέτηση</label>
                          <select
                            value={editForm.Συνυπηρέτηση || ''}
                            onChange={e => handleFieldChange('Συνυπηρέτηση', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value=""></option>
                            {MAGNESIA_MUNICIPALITIES.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                            {editForm.Συνυπηρέτηση && !MAGNESIA_MUNICIPALITIES.includes(editForm.Συνυπηρέτηση) && (
                              <option value={editForm.Συνυπηρέτηση}>{editForm.Συνυπηρέτηση}</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section D: Serious Health Reasons */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          Δ) ΣΟΒΑΡΟΙ ΛΟΓΟΙ ΥΓΕΙΑΣ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Λόγοι Υγείας Ιδίου</label>
                          <select
                            value={editForm.ΛόγοιΥγείαςΙδίου || '0'}
                            onChange={e => handleFieldChange('ΛόγοιΥγείαςΙδίου', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Όχι</option>
                            <option value="1">Ποσοστό Αναπηρίας 50-66%</option>
                            <option value="2">Ποσοστό Αναπηρίας 67-80%</option>
                            <option value="3">Ποσοστό Αναπηρίας άνω του 80%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Λόγοι Υγείας Συζύγου</label>
                          <select
                            value={editForm.ΛόγοιΥγείαςΣυζ || '0'}
                            onChange={e => handleFieldChange('ΛόγοιΥγείαςΣυζ', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Όχι</option>
                            <option value="1">Ποσοστό Αναπηρίας 50-66%</option>
                            <option value="2">Ποσοστό Αναπηρίας 67-80%</option>
                            <option value="3">Ποσοστό Αναπηρίας άνω του 80%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Λόγοι Υγείας Τέκνων</label>
                          <select
                            value={editForm.ΛόγοιΥγείαςΤεκν || '0'}
                            onChange={e => handleFieldChange('ΛόγοιΥγείαςΤεκν', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Όχι</option>
                            <option value="1">Ποσοστό Αναπηρίας 50-66%</option>
                            <option value="2">Ποσοστό Αναπηρίας 67-80%</option>
                            <option value="3">Ποσοστό Αναπηρίας άνω του 80%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Λόγοι Υγείας Γονέων</label>
                          <select
                            value={editForm.ΛόγοιΥγείαςΓον || '0'}
                            onChange={e => handleFieldChange('ΛόγοιΥγείαςΓον', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Όχι</option>
                            <option value="1">Ποσοστό Αναπηρίας 50-66%</option>
                            <option value="2">Ποσοστό Αναπηρίας 67-80%</option>
                            <option value="3">Ποσοστό Αναπηρίας άνω του 80%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Λόγοι Υγείας Αδερφών</label>
                          <select
                            value={editForm.ΛόγοιΥγείαςΑδερ || '0'}
                            onChange={e => handleFieldChange('ΛόγοιΥγείαςΑδερ', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Όχι</option>
                            <option value="1">Ποσοστό Αναπηρίας 50-66%</option>
                            <option value="2">Ποσοστό Αναπηρίας 67-80%</option>
                            <option value="3">Ποσοστό Αναπηρίας άνω του 80%</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section E: Special Criteria */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Ε) ΕΙΔΙΚΑ ΚΡΙΤΗΡΙΑ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Θεραπεία Εξωσωματικής Γονιμοποίησης</label>
                          <select
                            value={editForm.Θεραπεία || '0'}
                            onChange={e => handleFieldChange('Θεραπεία', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Όχι</option>
                            <option value="1">Ναι</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">Διαδικασία Λήψης Μεταπτυχιακού / Σπουδές</label>
                          <select
                            value={(editForm.Μεταπτυχιακό !== '0' && editForm.Μεταπτυχιακό !== 'Μεταπτυχιακό' && editForm.Μεταπτυχιακό !== 'Διδακτορικό' && editForm.Μεταπτυχιακό !== 'Δεύτερο Πτυχίο' && editForm.Μεταπτυχιακό && editForm.Μεταπτυχιακό !== '') ? 'custom' : (editForm.Μεταπτυχιακό || '0')}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                handleFieldChange('Μεταπτυχιακό', 'Άλλο');
                              } else {
                                handleFieldChange('Μεταπτυχιακό', val);
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Όχι</option>
                            <option value="Μεταπτυχιακό">Φοίτηση σε Μεταπτυχιακό Πρόγραμμα (Master)</option>
                            <option value="Διδακτορικό">Φοίτηση σε Διδακτορικό Πρόγραμμα (PhD)</option>
                            <option value="Δεύτερο Πτυχίο">Σπουδές για Απόκτηση 2ου Πτυχίου</option>
                            <option value="custom">Άλλο (Πληκτρολογήστε τη διαδικασία σπουδών...)</option>
                          </select>
                          {(editForm.Μεταπτυχιακό !== '0' && editForm.Μεταπτυχιακό !== 'Μεταπτυχιακό' && editForm.Μεταπτυχιακό !== 'Διδακτορικό' && editForm.Μεταπτυχιακό !== 'Δεύτερο Πτυχίο' && editForm.Μεταπτυχιακό && editForm.Μεταπτυχιακό !== '') && (
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Πληκτρολογήστε τη διαδικασία ή τίτλο σπουδών..."
                                value={editForm.Μεταπτυχιακό === 'Άλλο' ? '' : editForm.Μεταπτυχιακό}
                                onChange={e => handleFieldChange('Μεταπτυχιακό', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                                maxLength={50}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section F: Priority Criteria */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                          <ChevronsUp className="w-3.5 h-3.5 text-blue-400" />
                          ΣΤ) ΚΑΤΑ ΠΡΟΤΕΡΑΙΟΤΗΤΑ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Ειδική κατηγορία μετάθεσης (παρ.1, άρθρο 13, ΠΔ 50/1996)
                          </label>
                          <select
                            value={editForm.ΕιδικήΚΜ || '0'}
                            onChange={e => handleFieldChange('ΕιδικήΚΜ', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="0">Όχι</option>
                            <option value="1">Ναι</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Κατηγορία Κατά Προτεραιότητα (με επισυναπτόμενα δικαιολογητικά)
                          </label>
                          <select
                            value={editForm.ΚατηγορίαΚΠ || ''}
                            onChange={e => handleFieldChange('ΚατηγορίαΚΠ', e.target.value || null)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Κανένα</option>
                            <option value="Σύζυγος στρατιωτικού των Ενόπλων Δυνάμεων">
                              Σύζυγος στρατιωτικού των Ενόπλων Δυνάμεων
                            </option>
                            <option value="Σύζυγος ένστολου προσωπικού Ελληνικής Αστυνομίας, Πυροσβεστικού ή Λιμενικού Σώματος (παρ. 1, άρθρο 21 ν. 2946/2001)">
                              Σύζυγος ένστολου προσωπικού Ελληνικής Αστυνομίας, Πυροσβεστικού ή Λιμενικού Σώματος (παρ. 1, άρθρο 21 ν. 2946/2001)
                            </option>
                            <option value="Αιρετός Ο.Τ.Α. (άρθρο 93, παρ. 7 και 182 παρ. 10, ν. 3852/2010)">
                              Αιρετός Ο.Τ.Α. (άρθρο 93, παρ. 7 και 182 παρ. 10, ν. 3852/2010)
                            </option>
                            <option value="Σύζυγος Δικαστικού Λειτουργού (άρθρο 47, παρ. 3, ν. 2304/1995)">
                              Σύζυγος Δικαστικού Λειτουργού (άρθρο 47, παρ. 3, ν. 2304/1995)
                            </option>
                            <option value="Σύζυγος Μέλους Δ.Ε.Π. (άρθρο 44Α, παρ. 12« ν. 4115/2013)">
                              Σύζυγος Μέλους Δ.Ε.Π. (άρθρο 44Α, παρ. 12« ν. 4115/2013)
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section: Observations (No Numbering) */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                        <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          ΠΑΡΑΤΗΡΗΣΕΙΣ
                        </span>
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          value={editForm.Παρατηρήσεις || ''}
                          onChange={e => handleFieldChange('Παρατηρήσεις', e.target.value)}
                          placeholder="Εισάγετε τυχόν επιπλέον σχόλια ή παρατηρήσεις για την υπηρεσιακή/οικογενειακή κατάσταση..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Bottom Navigation */}
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleTabChange('page1')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          &larr; Επιστροφή στο Βήμα 1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTabChange('page3')}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                        >
                          <span>Συνέχεια στο Βήμα 3: Επιλογή Σχολικών Μονάδων</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'page3' && (() => {
                  const isTeacher = portalMode === 'teacher';
                  let applicablePhaseId = 'apospasi';
                  let phaseTitle = 'Αιτήσεις Απόσπασης';
                  
                  if (isTeacher) {
                    if (selectedRecord?.Υπεραριθμία === '3') {
                      applicablePhaseId = 'yper_placement';
                      phaseTitle = 'Αίτηση Τοποθέτησης από Υπεραριθμία';
                    } else if (String(selectedRecord?.ΚωδΟργαν || '').trim() === '9935101') {
                      applicablePhaseId = 'diathesi_placement';
                      phaseTitle = 'Αίτηση Τοποθέτησης από Διάθεση';
                    } else {
                      applicablePhaseId = 'apospasi';
                      phaseTitle = 'Αιτήσεις Απόσπασης';
                    }
                  }
                  
                  const isLocked = false; // Always unlocked in Step 3 for preparation according to user request

                  return (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Preparation Info Banner */}
                      <div className="bg-blue-500/10 border border-blue-500/30 p-4 sm:p-5 rounded-2xl flex items-start gap-3 text-xs text-blue-300 shadow-lg shadow-blue-950/10">
                        <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h5 className="font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                            ΠΡΟΕΤΟΙΜΑΣΙΑ ΠΡΟΤΙΜΗΣΕΩΝ (ΕΛΕΥΘΕΡΗ ΕΠΙΛΟΓΗ)
                          </h5>
                          <p className="text-slate-300 leading-relaxed">
                            Μπορείτε να επιλέξετε και να ταξινομήσετε τις σχολικές μονάδες σας ελεύθερα για προετοιμασία της αίτησής σας. Η δυνατότητα προεπισκόπησης, δημιουργίας και επίσημης εξαγωγής σε PDF ελέγχεται από το Χρονολόγιο στο <strong>Βήμα 4</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-5 rounded-2xl border border-amber-500/30 space-y-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                          <div>
                            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-amber-400" />
                              ΒΗΜΑ 3: ΔΗΛΩΣΗ & ΣΕΙΡΑ ΠΡΟΤΙΜΗΣΗΣ ΣΧΟΛΙΚΩΝ ΜΟΝΑΔΩΝ
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {isTeacher 
                                ? `Υποβάλλετε προτιμήσεις για τη διαδικασία: ${phaseTitle}` 
                                : 'Προσθέστε ή διατάξτε με τη σειρά προτίμησής σας τις σχολικές μονάδες τοποθέτησης.'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Cascading School Selection Architecture (3-Level) */}
                        {isLocked ? (
                          <div className="bg-slate-900/40 p-8 rounded-2xl border border-dashed border-slate-800 text-center text-slate-400 space-y-2">
                            <Lock className="w-8 h-8 text-rose-500 mx-auto opacity-70" />
                            <h5 className="font-bold text-slate-300 text-xs uppercase tracking-wide">Η επιλογή σχολείων είναι κλειδωμένη</h5>
                            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                              Η περίοδος τροποποίησης προτιμήσεων έχει παρέλθει ή δεν έχει ξεκινήσει. Μπορείτε να δείτε τις υπάρχουσες προτιμήσεις σας παρακάτω ή να προχωρήσετε στο Βήμα 4 για εξαγωγή του αρχείου PDF.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                3-ΕΠΙΠΕΔΗ ΕΠΙΛΟΓΗ ΣΧΟΛΙΚΗΣ ΜΟΝΑΔΑΣ (ΚΑΤΗΓΟΡΙΑ &rarr; ΔΗΜΟΣ/ΠΕΡΙΟΧΗ &rarr; ΣΧΟΛΕΙΟ)
                              </span>
                              <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                                Επιλέξτε διαδοχικά από τις λίστες
                              </span>
                            </div>

                            {/* Level 1: Category Buttons / Selector */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-semibold text-slate-400 block">
                                1. Επιλογή Τύπου / Βαθμίδας Σχολείων:
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {SCHOOL_CATEGORIES.map(cat => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSchoolCategory(cat.id);
                                      setSelectedMunicipality('');
                                      setSelectedSchoolUnit('');
                                      setSelectedBatchSchools([]);
                                      setLastSelectedBatchIdx(null);
                                    }}
                                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                                      selectedSchoolCategory === cat.id
                                        ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-lg shadow-amber-500/10'
                                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                    }`}
                                  >
                                    <span className={`text-xs font-bold ${selectedSchoolCategory === cat.id ? 'text-amber-300' : 'text-slate-300'}`}>
                                      {cat.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 line-clamp-1">
                                      {cat.description}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Level 2: Municipality / Area */}
                            <div className="pt-2 space-y-1.5">
                              <label className="text-[11px] font-semibold text-slate-400 block">
                                2. Επιλογή Δήμου / Περιοχής:
                              </label>
                              <select
                                value={selectedMunicipality}
                                onChange={e => {
                                  setSelectedMunicipality(e.target.value);
                                  setSelectedSchoolUnit('');
                                  setSelectedBatchSchools([]);
                                  setLastSelectedBatchIdx(null);
                                }}
                                disabled={!selectedSchoolCategory}
                                className="w-full sm:max-w-md bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-40"
                              >
                                <option value="">-- Επιλέξτε Δήμο / Περιοχή --</option>
                                {selectedSchoolCategory && Object.keys(INITIAL_SCHOOLS_CATALOG[selectedSchoolCategory] || {}).map(muni => (
                                  <option key={muni} value={muni}>{muni}</option>
                                ))}
                              </select>
                            </div>

                            {/* Level 3: Multi-Row School Units Box */}
                            <div className="pt-3 space-y-2.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <label className="text-[11px] font-semibold text-slate-300 flex flex-wrap items-center gap-2">
                                  <span>3. Επιλογή Σχολικών Μονάδων (Πολλαπλή Επιλογή με Checkboxes / Shift / Ctrl):</span>
                                  {selectedMunicipality && (
                                    <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                                      Δήμος: {selectedMunicipality}
                                    </span>
                                  )}
                                </label>
                                {selectedMunicipality && (
                                  <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const raw = INITIAL_SCHOOLS_CATALOG[selectedSchoolCategory]?.[selectedMunicipality] || [];
                                        const selectable = raw.filter(s => s && s !== '---' && !s.startsWith('---') && !s.startsWith('───') && !getPreferencesList().includes(s));
                                        const remainingSpots = 20 - getPreferencesList().length;
                                        if (remainingSpots <= 0) {
                                          setErrorMsg('Έχετε ήδη συμπληρώσει το μέγιστο όριο (20/20) προτιμήσεων.');
                                          return;
                                        }
                                        setSelectedBatchSchools(selectable.slice(0, remainingSpots));
                                      }}
                                      className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                                    >
                                      Επιλογή Όλων Διαθέσιμων
                                    </button>
                                    {selectedBatchSchools.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedBatchSchools([]);
                                          setLastSelectedBatchIdx(null);
                                        }}
                                        className="text-[11px] bg-slate-900 hover:bg-rose-950/60 text-rose-300 font-semibold px-2.5 py-1 rounded-lg border border-rose-800/40 transition-colors"
                                      >
                                        Αποεπιλογή ({selectedBatchSchools.length})
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {!selectedMunicipality ? (
                                <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
                                  Επιλέξτε πρώτα <strong>Τύπο/Βαθμίδα</strong> και <strong>Δήμο/Περιοχή</strong> παραπάνω για να εμφανιστούν οι διαθέσιμες σχολικές μονάδες σε λίστα πολλαπλής επιλογής.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <span>💡 <strong>Οδηγία:</strong> Επιλέξτε κουτάκια ή κάντε κλικ σε γραμμές με <strong>Shift/Ctrl</strong> και πατήστε Προσθήκη.</span>
                                    <span>Επιλεγμένα για προσθήκη: <strong className="text-amber-400 font-mono text-xs">{selectedBatchSchools.length}</strong></span>
                                  </div>

                                  <div className="max-h-64 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-900 shadow-inner">
                                    {(INITIAL_SCHOOLS_CATALOG[selectedSchoolCategory]?.[selectedMunicipality] || []).map((school, idx, arr) => {
                                      if (school === '---' || school.startsWith('---') || school.startsWith('───')) {
                                        return (
                                          <div key={`sep-${idx}`} className="bg-slate-900/95 text-amber-400/90 font-bold text-center text-[11px] py-2 tracking-wide sticky top-0 z-10 border-y border-slate-800 select-none shadow-sm">
                                            {school.replace(/^-+|-+$/g, '').trim() || 'ΚΑΤΗΓΟΡΙΑ ΣΧΟΛΕΙΩΝ'}
                                          </div>
                                        );
                                      }

                                      const isAlreadyAdded = getPreferencesList().includes(school);
                                      const isSelected = selectedBatchSchools.includes(school);

                                      return (
                                        <div
                                          key={school}
                                          onClick={(e) => {
                                            if (isAlreadyAdded) return;
                                            if (e.shiftKey && lastSelectedBatchIdx !== null) {
                                              const selectable = arr.filter(s => s && s !== '---' && !s.startsWith('---') && !s.startsWith('───'));
                                              const lastSelItem = arr[lastSelectedBatchIdx];
                                              const lastIdx = selectable.indexOf(lastSelItem);
                                              const currIdx = selectable.indexOf(school);
                                              if (lastIdx !== -1 && currIdx !== -1) {
                                                const start = Math.min(lastIdx, currIdx);
                                                const end = Math.max(lastIdx, currIdx);
                                                const range = selectable.slice(start, end + 1).filter(s => !getPreferencesList().includes(s));
                                                setSelectedBatchSchools(prev => Array.from(new Set([...prev, ...range])));
                                              }
                                            } else {
                                              setSelectedBatchSchools(prev =>
                                                prev.includes(school) ? prev.filter(s => s !== school) : [...prev, school]
                                              );
                                            }
                                            setLastSelectedBatchIdx(idx);
                                          }}
                                          className={`px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors select-none ${
                                            isAlreadyAdded
                                              ? 'bg-slate-900/40 text-slate-500 cursor-not-allowed opacity-60'
                                              : isSelected
                                                ? 'bg-amber-500/15 text-white font-medium cursor-pointer border-l-2 border-amber-500'
                                                : 'hover:bg-slate-900/80 text-slate-300 cursor-pointer'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <input
                                              type="checkbox"
                                              checked={isSelected || isAlreadyAdded}
                                              disabled={isAlreadyAdded}
                                              readOnly
                                              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-950 shrink-0 pointer-events-none"
                                            />
                                            <span className="truncate">{school}</span>
                                          </div>
                                          {isAlreadyAdded && (
                                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded shrink-0">
                                              Ήδη στη λίστα
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                    <div className="text-xs text-slate-300">
                                      Επιλεγμένα για προσθήκη: <strong className="text-amber-400 font-mono text-sm">{selectedBatchSchools.length}</strong> {selectedBatchSchools.length === 1 ? 'σχολική μονάδα' : 'σχολικές μονάδες'}
                                    </div>
                                    <button
                                      type="button"
                                      disabled={selectedBatchSchools.length === 0 || getPreferencesList().length >= 20}
                                      onClick={() => handleAddBatchSchools(selectedBatchSchools)}
                                      className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20 shrink-0"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span>Προσθήκη Επιλεγμένων ({selectedBatchSchools.length}) στη Λίστα</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Subsection Header: Preferences Ranking */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white tracking-wide uppercase">ΣΕΙΡΑ ΠΡΟΤΙΜΗΣΗΣ</span>
                              <span className="text-[11px] text-slate-400">Διαδραστική κατάταξη και διαχείριση σχολικών μονάδων</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end gap-1.5">
                            <div className="flex items-center justify-between sm:justify-end gap-3 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-amber-500/30">
                              <span className="text-xs font-bold text-amber-300">Αριθμός Προτιμήσεων:</span>
                              <span className={`px-3 py-1 rounded-lg font-mono font-black text-sm shadow-inner border ${
                                getPreferencesList().length >= 20
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}>
                                {editForm.ΑρΠροτιμ ?? getPreferencesList().length} / 20
                              </span>
                            </div>
                            <div className={`text-[11px] flex items-center gap-1.5 ${
                              getPreferencesList().length >= 20
                                ? 'text-rose-400 font-bold animate-pulse'
                                : 'text-amber-400/90 font-medium'
                            }`}>
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {getPreferencesList().length >= 20
                                  ? 'Έχετε συμπληρώσει το μέγιστο όριο (20/20)'
                                  : 'Μέγιστος επιτρεπόμενος αριθμός: 20 σχολικές μονάδες'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Current Preferences List */}
                        <div className="space-y-3">
                          {getPreferencesList().length === 0 ? (
                            <div className="bg-slate-900/40 border border-dashed border-slate-800 p-8 rounded-xl text-center text-slate-500 text-xs">
                              Δεν έχουν προστεθεί σχολικές μονάδες στη λίστα προτιμήσεων. Επιλέξτε από τα διαδοχικά μενού παραπάνω.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                              {getPreferencesList().map((school, idx, arr) => (
                                <div
                                  key={school}
                                  onClick={() => {
                                    if (!isLocked) setActivePreferenceSchool(school);
                                  }}
                                  className={`flex items-center justify-between p-3 rounded-xl border transition-all gap-3 ${
                                    isLocked 
                                      ? 'cursor-not-allowed bg-slate-900/60 border-slate-800/80 opacity-80' 
                                      : activePreferenceSchool === school
                                        ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50 cursor-pointer'
                                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 cursor-pointer'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                                      isLocked 
                                        ? 'bg-slate-850 text-slate-500 border-slate-800'
                                        : activePreferenceSchool === school
                                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-200 truncate">{school}</span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      data-school-action={`${school}-top`}
                                      disabled={isLocked || idx === 0}
                                      onClick={(e) => { e.stopPropagation(); handleMovePreference(idx, 'top'); }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                                      title={isLocked ? 'Κλειδωμένο λόγω λήξης προθεσμίας' : 'Μετακίνηση στην Κορυφή (1η θέση)'}
                                    >
                                      <ChevronsUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      data-school-action={`${school}-up`}
                                      disabled={isLocked || idx === 0}
                                      onClick={(e) => { e.stopPropagation(); handleMovePreference(idx, 'up'); }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                                      title={isLocked ? 'Κλειδωμένο λόγω λήξης προθεσμίας' : 'Μετακίνηση Μία Θέση Πάνω'}
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      data-school-action={`${school}-down`}
                                      disabled={isLocked || idx === arr.length - 1}
                                      onClick={(e) => { e.stopPropagation(); handleMovePreference(idx, 'down'); }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                                      title={isLocked ? 'Κλειδωμένο λόγω λήξης προθεσμίας' : 'Μετακίνηση Μία Θέση Κάτω'}
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      data-school-action={`${school}-bottom`}
                                      disabled={isLocked || idx === arr.length - 1}
                                      onClick={(e) => { e.stopPropagation(); handleMovePreference(idx, 'bottom'); }}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
                                      title={isLocked ? 'Κλειδωμένο λόγω λήξης προθεσμίας' : 'Μετακίνηση στο Τέλος'}
                                    >
                                      <ChevronsDown className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
                                    <button
                                      type="button"
                                      disabled={isLocked}
                                      onClick={(e) => { e.stopPropagation(); handleRemoveSchoolPreference(idx); }}
                                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:text-rose-500/50 transition-colors"
                                      title={isLocked ? 'Κλειδωμένο λόγω λήξης προθεσμίας' : 'Διαγραφή'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom Navigation */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleTabChange('page2')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            &larr; Επιστροφή στο Βήμα 2
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTabChange('page4')}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                          >
                            <span>Συνέχεια στο Βήμα 4: Εξαγωγή PDF</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ================= PAGE 4: PDF EXPORT & FORMAL SUBMISSION ================= */}
                {activeTab === 'page4' && (() => {
                  const getPhaseIdForAppType = (type: string) => {
                    if (type === 'diathesi') return 'diathesi_placement';
                    if (type === 'organiki_yperarithmia' || type === 'leitourgiki_yperarithmia') return 'yper_placement';
                    return 'apospasi';
                  };

                  const activePhaseId = getPhaseIdForAppType(applicationType);
                  const currentPhaseStatus = isPhaseActive(activePhaseId);
                  const isSubmissionLocked = portalMode === 'teacher' && !currentPhaseStatus.active;

                  return (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {!showPdfPreview ? (
                        <div className="bg-slate-900/90 rounded-2xl border border-emerald-500/30 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-2xl print:hidden">
                          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                            <FileDown className="w-8 h-8" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg sm:text-xl font-bold text-white">Βήμα 4: Επιλογή Τύπου Αίτησης & Εξαγωγή σε PDF</h3>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                              Έχετε ολοκληρώσει την καταχώριση των στοιχείων σας στα προηγούμενα βήματα. Επιλέξτε τον τύπο της αίτησής σας και πατήστε "Εξαγωγή σε PDF" για να δημιουργήσετε το επίσημο έγγραφο.
                            </p>
                          </div>

                          {/* Application Type Selection Grid */}
                          <div className="pt-2 text-left space-y-2 max-w-2xl mx-auto">
                            <label className="text-[11px] font-bold tracking-wider text-slate-400 block px-1">
                              ΕΠΙΛΕΞΤΕ ΤΥΠΟ ΑΙΤΗΣΗΣ-ΔΗΛΩΣΗΣ:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {[
                                { 
                                  id: 'apospasi', 
                                  label: 'Αίτηση Απόσπασης', 
                                  subtitle: 'Απόσπαση εντός ΠΥΣΠΕ',
                                  tag: 'ΑΠΟΣΠΑΣΗ',
                                  tagClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                                  activeCard: 'bg-blue-500/15 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500',
                                  radioActive: 'border-blue-400 bg-blue-400',
                                  hoverClass: 'hover:border-blue-500/50 hover:bg-blue-950/20'
                                },
                                { 
                                  id: 'diathesi', 
                                  label: 'Αίτηση Τοποθέτησης από Διάθεση', 
                                  subtitle: 'Τοποθέτηση από Διάθεση ΠΥΣΠΕ',
                                  tag: 'ΔΙΑΘΕΣΗ',
                                  tagClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                                  activeCard: 'bg-purple-500/15 border-purple-500 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500',
                                  radioActive: 'border-purple-400 bg-purple-400',
                                  hoverClass: 'hover:border-purple-500/50 hover:bg-purple-950/20'
                                },
                                { 
                                  id: 'organiki_yperarithmia', 
                                  label: 'Αίτηση από Οργανική Υπεραριθμία', 
                                  subtitle: 'Τοποθέτηση λόγω Οργανικής Υπεραριθμίας',
                                  tag: 'ΟΡΓΑΝΙΚΗ ΥΠΕΡΑΡΙΘΜΙΑ',
                                  tagClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                                  activeCard: 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500',
                                  radioActive: 'border-amber-400 bg-amber-400',
                                  hoverClass: 'hover:border-amber-500/50 hover:bg-amber-950/20'
                                },
                                { 
                                  id: 'leitourgiki_yperarithmia', 
                                  label: 'Αίτηση από Λειτουργική Υπεραριθμία', 
                                  subtitle: 'Τοποθέτηση λόγω Λειτουργικής Υπεραριθμίας',
                                  tag: 'ΛΕΙΤΟΥΡΓΙΚΗ ΥΠΕΡΑΡΙΘΜΙΑ',
                                  tagClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                                  activeCard: 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/10 ring-1 ring-rose-500',
                                  radioActive: 'border-rose-400 bg-rose-400',
                                  hoverClass: 'hover:border-rose-500/50 hover:bg-rose-950/20'
                                },
                              ].map((opt) => {
                                const optPhaseId = getPhaseIdForAppType(opt.id);
                                const optPhaseStatus = isPhaseActive(optPhaseId);
                                const isOptLocked = portalMode === 'teacher' && !optPhaseStatus.active;

                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setApplicationType(opt.id as any)}
                                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden text-left ${
                                      isOptLocked
                                        ? 'bg-slate-950/30 border-slate-900/60 text-slate-500 opacity-60 hover:bg-slate-950/40'
                                        : applicationType === opt.id
                                          ? opt.activeCard
                                          : `bg-slate-950/60 border-slate-800 text-slate-400 ${opt.hoverClass} hover:text-slate-200`
                                    }`}
                                  >
                                    <div className="flex items-center justify-between w-full mb-3">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wide uppercase ${opt.tagClass}`}>
                                        {opt.tag}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {isOptLocked ? (
                                          <span className="text-[9px] font-bold bg-rose-950/60 text-rose-400 px-1.5 py-0.5 rounded border border-rose-900/40 flex items-center gap-1">
                                            <Lock className="w-2.5 h-2.5" />
                                            ΚΛΕΙΣΤΗ
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-bold bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/40 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            ΕΝΕΡΓΗ
                                          </span>
                                        )}
                                        {applicationType === opt.id && !isOptLocked && (
                                          <span className="text-[10px] font-bold bg-white/10 text-white px-1.5 py-0.5 rounded border border-white/20">Επιλεγμένο</span>
                                        )}
                                        {!isOptLocked && (
                                          <span className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 ${
                                            applicationType === opt.id ? opt.radioActive : 'border-slate-600 bg-slate-900'
                                          }`}>
                                            {applicationType === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <span className={`text-xs font-bold block mb-1 ${isOptLocked ? 'text-slate-500' : 'text-slate-100'}`}>{opt.label}</span>
                                      <span className={`text-[10px] block leading-tight ${isOptLocked ? 'text-slate-600' : 'text-slate-400'}`}>{opt.subtitle}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Phase Lock Warnings */}
                          {isSubmissionLocked && (
                            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-300 max-w-2xl mx-auto text-left animate-in fade-in duration-150">
                              <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <h5 className="font-bold text-rose-400 uppercase tracking-wide">
                                  Η ΦΑΣΗ ΥΠΟΒΟΛΗΣ ΕΙΝΑΙ ΚΛΕΙΣΤΗ
                                </h5>
                                <p className="text-slate-300 leading-relaxed">
                                  {currentPhaseStatus.message || 'Η περίοδος υποβολής για αυτήν την αίτηση δεν είναι ενεργή σύμφωνα με το χρονολόγιο.'}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                              type="button"
                              disabled={isSubmissionLocked}
                              onClick={() => {
                                if (!isSubmissionLocked) setShowPdfPreview(true);
                              }}
                              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 ${
                                isSubmissionLocked
                                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
                              }`}
                            >
                              {isSubmissionLocked ? <Lock className="w-5 h-5 text-slate-500" /> : <FileDown className="w-5 h-5" />}
                              <span>
                                {isSubmissionLocked 
                                  ? 'Κλειδωμένο λόγω Χρονολογίου' 
                                  : `Προεπισκόπηση & Εξαγωγή σε PDF (${
                                      applicationType === 'apospasi' ? 'Απόσπαση' :
                                      applicationType === 'diathesi' ? 'Διάθεση' :
                                      applicationType === 'organiki_yperarithmia' ? 'Οργανική Υπεραριθμία' : 'Λειτουργική Υπεραριθμία'
                                    })`
                                }
                              </span>
                            </button>
                          </div>
                          <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs">
                            <button
                              type="button"
                              onClick={() => handleTabChange('page3')}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              &larr; Επιστροφή στο Βήμα 3
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTabChange('page1')}
                              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Επανάληψη Διαδικασίας</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Top Action Bar */}
                          <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                                <FileDown className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">Βήμα 4: Προεπισκόπηση & Εξαγωγή σε PDF</h4>
                                <p className="text-xs text-slate-400">
                                  {applicationType === 'apospasi' && 'Αίτηση Απόσπασης Εντός ΠΥΣΠΕ'}
                                  {applicationType === 'diathesi' && 'Αίτηση Τοποθέτησης από Διάθεση Εντός ΠΥΣΠΕ'}
                                  {applicationType === 'organiki_yperarithmia' && 'Αίτηση Τοποθέτησης από Οργανική Υπεραριθμία Εντός ΠΥΣΠΕ'}
                                  {applicationType === 'leitourgiki_yperarithmia' && 'Αίτηση Τοποθέτησης από Λειτουργική Υπεραριθμία Εντός ΠΥΣΠΕ'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={applicationType}
                                onChange={(e) => setApplicationType(e.target.value as any)}
                                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                              >
                                <option value="apospasi">Αίτηση Απόσπασης</option>
                                <option value="diathesi">Αίτηση από Διάθεση</option>
                                <option value="organiki_yperarithmia">Αίτηση από Οργανική Υπεραριθμία</option>
                                <option value="leitourgiki_yperarithmia">Αίτηση από Λειτουργική Υπεραριθμία</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => setShowPdfPreview(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                              >
                                &larr; Αλλαγή / Απόκρυψη
                              </button>
                              <button
                                type="button"
                                onClick={generateProgrammaticPdf}
                                disabled={isGeneratingPdf || isSubmissionLocked}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                                  isSubmissionLocked
                                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                                }`}
                                title={isSubmissionLocked ? 'Η λήψη είναι κλειδωμένη λόγω Χρονολογίου' : "Δημιουργία και άμεση λήψη του επίσημου εντύπου της αίτησης σε μορφή αρχείου PDF"}
                              >
                                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                <span>{isGeneratingPdf ? 'Δημιουργία εγγράφου...' : 'Λήψη Αίτησης (PDF)'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Export Information Banner */}
                          <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-4 text-xs text-slate-300 flex items-start sm:items-center gap-3 print:hidden">
                            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shrink-0 border border-blue-500/30">
                              <Sparkles className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="space-y-1">
                              <div className="font-bold text-slate-100 text-sm">Αυτόματη Δημιουργία & Λήψη Επίσημου Εγγράφου</div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Πατώντας το κουμπί <strong className="text-blue-300">«Λήψη Αίτησης (PDF)»</strong>, δημιουργείται αυτόματα το επίσημο, διαμορφωμένο έντυπο της αίτησης με όλα τα προσωπικά στοιχεία, τα κριτήρια μοριοδότησης και τις σχολικές μονάδες που επιλέξατε. Το αρχείο αποθηκεύεται άμεσα στον υπολογιστή σας έτοιμο για κατάθεση.
                              </p>
                            </div>
                          </div>

                          {/* Visual stage / background for the document sheet to look like an interactive editor */}
                          <div className="bg-slate-900/40 p-3 sm:p-6 rounded-2xl border border-slate-800/60 shadow-inner max-w-3xl mx-auto print:p-0 print:bg-transparent print:border-none relative">
                            {isSubmissionLocked && (
                              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-rose-500/20">
                                <Lock className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                                <h4 className="text-sm font-black text-rose-400 uppercase tracking-wider mb-2">Η ΠΡΟΕΠΙΣΚΟΠΗΣΗ & ΛΗΨΗ ΕΙΝΑΙ ΚΛΕΙΔΩΜΕΝΗ</h4>
                                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                                  {currentPhaseStatus.message || 'Η περίοδος υποβολής για αυτήν την αίτηση δεν είναι ενεργή σύμφωνα με το Χρονολόγιο του ΠΥΣΠΕ.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setShowPdfPreview(false)}
                                  className="mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                                >
                                  &larr; Επιστροφή στην Επιλογή Αίτησης
                                </button>
                              </div>
                            )}




                      {/* Official Document Sheet (Printable Area) - 1-to-1 replica of legacy PDF template */}
                      <div id="printable-official-document" className="bg-white text-slate-900 p-6 sm:p-10 rounded-xl shadow-2xl border border-slate-300 font-sans print:p-0 print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none">
                        
                        {/* Document Header mimicking the generated PDF */}
                        <div className="text-center mb-6 space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                            ΔΙΕΥΘΥΝΣΗ ΠΡΩΤΟΒΑΘΜΙΑΣ ΕΚΠΑΙΔΕΥΣΗΣ ΜΑΓΝΗΣΙΑΣ
                          </h4>
                          <h2 className="text-xs sm:text-[13px] font-bold tracking-wide uppercase text-slate-900">
                            {applicationType === 'apospasi' && 'ΑΙΤΗΣΗ ΑΠΟΣΠΑΣΗΣ ΕΝΤΟΣ ΠΥΣΠΕ'}
                            {applicationType === 'diathesi' && 'ΑΙΤΗΣΗ ΤΟΠΟΘΕΤΗΣΗΣ ΑΠΟ ΔΙΑΘΕΣΗ ΕΝΤΟΣ ΠΥΣΠΕ'}
                            {applicationType === 'organiki_yperarithmia' && 'ΑΙΤΗΣΗ ΤΟΠΟΘΕΤΗΣΗΣ ΑΠΟ ΟΡΓΑΝΙΚΗ ΥΠΕΡΑΡΙΘΜΙΑ ΕΝΤΟΣ ΠΥΣΠΕ'}
                            {applicationType === 'leitourgiki_yperarithmia' && 'ΑΙΤΗΣΗ ΤΟΠΟΘΕΤΗΣΗΣ ΑΠΟ ΛΕΙΤΟΥΡΓΙΚΗ ΥΠΕΡΑΡΙΘΜΙΑ ΕΝΤΟΣ ΠΥΣΠΕ'}
                          </h2>
                          <div className="text-[10px] sm:text-xs text-slate-700 font-semibold">
                            Σχολικό Έτος 2026-2027  •  Αρ. Μητρώου: {selectedRecord.ΑρΜητρ || '-'}  •  ΑΦΜ: {selectedRecord.ΑΦΜ || '-'}
                          </div>
                        </div>

                        {/* Section 1: Υπηρεσιακά Στοιχεία Table */}
                        <table className="w-full text-[11px] sm:text-xs border-collapse border border-slate-400 text-slate-900 table-fixed mb-5">
                          <thead>
                            <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 font-bold">
                              <th colSpan={2} className="px-3 py-1.5 text-left font-bold text-[11px] sm:text-xs uppercase tracking-wide border border-slate-400">
                                ΣΤΟΙΧΕΙΑ ΕΚΠΑΙΔΕΥΤΙΚΟΥ & ΥΠΗΡΕΣΙΑΚΗΣ ΚΑΤΑΣΤΑΣΗΣ
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-slate-50">
                              <td className="w-1/3 border border-slate-300 px-3 py-1.5 font-medium text-slate-700">Ονοματεπώνυμο:</td>
                              <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-900">
                                {selectedRecord.Επώνυμο || ''} {selectedRecord.Όνομα || ''} ({selectedRecord.Πατρώνυμο || ''})
                              </td>
                            </tr>
                            <tr className="bg-white">
                              <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-700">Ειδικότητα:</td>
                              <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-900">
                                {selectedRecord.Ειδικότητα || ''} ({selectedRecord.ΚωδΕιδικότ || ''})
                              </td>
                            </tr>
                            <tr className="bg-slate-50">
                              <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-700">Οργανική Θέση:</td>
                              <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-900">{selectedRecord.Οργανική || '-'}</td>
                            </tr>
                            <tr className="bg-white">
                              <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-700">Περιοχή Μετάθεσης:</td>
                              <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-900">{selectedRecord.ΠεριοχήΜετάθεσης || 'Α΄ ΜΑΓΝΗΣΙΑΣ (Π.Ε.)'}</td>
                            </tr>
                            <tr className="bg-slate-50">
                              <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-700">Στοιχεία Επικοινωνίας:</td>
                              <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-900">
                                {selectedRecord.Κινητό || '-'}  •  {selectedRecord.Email || '-'}
                              </td>
                            </tr>
                            <tr className="bg-white">
                              <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-700">Διεύθυνση Κατοικίας:</td>
                              <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-900">
                                {selectedRecord.Οδός || '-'} {selectedRecord.Αριθμός || ''}, {selectedRecord.Πόλη || '-'} (Τ.Κ. {selectedRecord.ΤαχΚωδ || '-'})
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Section 2: Μοριοδότηση & Κριτήρια Table */}
                        <table className="w-full text-[11px] sm:text-xs border-collapse border border-slate-400 text-slate-900 table-fixed mb-5">
                          <thead>
                            <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 font-bold">
                              <th className="px-3 py-1.5 text-left font-bold text-[11px] sm:text-xs uppercase tracking-wide border border-slate-400">
                                ΚΡΙΤΗΡΙΑ & ΔΗΛΩΘΕΝΤΑ ΣΤΟΙΧΕΙΑ ΕΚΠΑΙΔΕΥΤΙΚΟΥ
                              </th>
                              <th className="w-40 sm:w-52 px-3 py-1.5 text-center font-bold text-[11px] sm:text-xs uppercase tracking-wide border border-slate-400">
                                ΜΟΝΑΔΕΣ (Για υπηρεσιακή χρήση)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const dynamicRows = [
                                {
                                  text: `Συνολική Υπηρεσία: ${selectedRecord.Έτη ?? 0} Έτη, ${selectedRecord.Μήνες ?? 0} Μήνες, ${selectedRecord.Ημέρες ?? 0} Ημέρες`
                                },
                                {
                                  text: 'Δυσμενών Συνθηκών Σχολείων (Υπολογισμός από Υπηρεσία):'
                                },
                                {
                                  text: `Οικογενειακή Κατάσταση: ${maritalMap[String(selectedRecord.ΟικΚατάστ || '0')] || selectedRecord.ΟικΚατάστ || 'Άγαμος/η'}  •  Αρ. Παιδιών: ${selectedRecord.ΑρΠαιδιών ?? 0}`
                                },
                                {
                                  text: `Εντοπιότητα: ${selectedRecord.Εντοπιότητα || '-'}`
                                },
                                {
                                  text: `Συνυπηρέτηση: ${selectedRecord.Συνυπηρέτηση || '-'}`
                                }
                              ];

                              const healthSum = getHealthSummary(selectedRecord);
                              if (healthSum && healthSum !== 'Όχι') {
                                dynamicRows.push({
                                  text: `Σοβαροί Λόγοι Υγείας: ${healthSum}`
                                });
                              }
                              if (selectedRecord.Θεραπεία === '1') {
                                dynamicRows.push({
                                  text: 'Θεραπεία Εξωσωματικής Γονιμοποίησης: Ναι'
                                });
                              }
                              if (selectedRecord.Μεταπτυχιακό && selectedRecord.Μεταπτυχιακό !== '0') {
                                dynamicRows.push({
                                  text: `Διαδικασία Λήψης Μεταπτυχιακού / Σπουδές: ${selectedRecord.Μεταπτυχιακό}`
                                });
                              }
                              if (selectedRecord.ΕιδικήΚΜ === '1') {
                                dynamicRows.push({
                                  text: 'Ειδική κατηγορία μετάθεσης (παρ. 1, άρθρο 13, ΠΔ 50/1996): Ναι'
                                });
                              }
                              if (selectedRecord.ΚατηγορίαΚΠ && selectedRecord.ΚατηγορίαΚΠ !== 'Κανένα' && selectedRecord.ΚατηγορίαΚΠ !== '') {
                                dynamicRows.push({
                                  text: `Κατηγορία Κατά Προτεραιότητα: ${selectedRecord.ΚατηγορίαΚΠ}`
                                });
                              }

                              return dynamicRows.map((row, index) => {
                                const isGreyRow = index % 2 === 0;
                                const rowBgClass = isGreyRow ? 'bg-slate-50' : 'bg-white';
                                const cellBgClass = isGreyRow ? 'bg-slate-50/50' : '';
                                return (
                                  <tr key={index} className={rowBgClass}>
                                    <td className="border border-slate-300 px-3 py-1.5 text-slate-800 font-medium">
                                      {row.text}
                                    </td>
                                    <td className={`border border-slate-300 px-3 py-1.5 ${cellBgClass}`}></td>
                                  </tr>
                                );
                              });
                            })()}
                            <tr className="bg-slate-100 font-bold">
                              <td className="border border-slate-300 px-3 py-2 text-slate-900 uppercase">
                                ΣΥΝΟΛΟ ΜΟΡΙΩΝ (Αθροισμα Υπηρεσίας):
                              </td>
                              <td className="border border-slate-300 px-3 py-2 bg-slate-100"></td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Section 3: Προτιμήσεις Σχολικών Μονάδων Table */}
                        <div className="mb-6">
                          <table className="w-full text-[11px] sm:text-xs border-collapse border border-slate-400 text-slate-900 table-fixed">
                            <thead>
                              <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 font-bold">
                                <th className="w-10 px-2 py-1.5 text-center font-bold border border-slate-400">Α/Α</th>
                                <th className="px-3 py-1.5 text-left font-bold uppercase tracking-wider border border-slate-400">ΣΧΟΛΙΚΗ ΜΟΝΑΔΑ (1η ΣΤΗΛΗ)</th>
                                <th className="w-10 px-2 py-1.5 text-center font-bold border border-slate-400">Α/Α</th>
                                <th className="px-3 py-1.5 text-left font-bold uppercase tracking-wider border border-slate-400">ΣΧΟΛΙΚΗ ΜΟΝΑΔΑ (2η ΣΤΗΛΗ)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: 10 }).map((_, idx) => {
                                const prefsList = getPreferencesList();
                                const leftSchool = prefsList[idx] || '';
                                const rightSchool = prefsList[idx + 10] || '';
                                const isGreyRow = idx % 2 === 0;
                                const rowBgClass = isGreyRow ? 'bg-slate-50' : 'bg-white';
                                return (
                                  <tr key={idx} className={rowBgClass}>
                                    <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-600">{idx + 1}.</td>
                                    <td className="border border-slate-300 px-3 py-1.5 text-slate-900 font-semibold truncate" title={leftSchool}>{leftSchool}</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-600">{idx + 11}.</td>
                                    <td className="border border-slate-300 px-3 py-1.5 text-slate-900 font-semibold truncate" title={rightSchool}>{rightSchool}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Sign-off / Signature Block */}
                        <div className="pt-8 flex justify-between items-start text-xs sm:text-[13px] text-slate-900 px-2">
                          <div>
                            <p className="font-semibold">Ημερομηνία: {new Date().toLocaleDateString('el-GR')}</p>
                          </div>
                          <div className="text-center space-y-12">
                            <p className="font-semibold">Ο/Η Αιτών / Αιτούσα Εκπαιδευτικός</p>
                            <p className="uppercase font-bold tracking-wide text-slate-900">
                              {selectedRecord.Επώνυμο} {selectedRecord.Όνομα}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation (Print Hidden) */}
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 items-center gap-3 print:hidden">
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => handleTabChange('page3')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                        >
                          &larr; Επιστροφή στο Βήμα 3
                        </button>
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={generateProgrammaticPdf}
                          disabled={isGeneratingPdf}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer w-full sm:w-auto justify-center"
                          title="Δημιουργία και άμεση λήψη του επίσημου εντύπου της αίτησης σε μορφή αρχείου PDF"
                        >
                          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          <span>{isGeneratingPdf ? 'Δημιουργία εγγράφου...' : 'Λήψη Αίτησης (PDF)'}</span>
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleTabChange('page1')}
                          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Επανάληψη Διαδικασίας</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

