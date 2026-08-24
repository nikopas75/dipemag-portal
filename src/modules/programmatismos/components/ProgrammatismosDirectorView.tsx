import React from 'react';
import {
  Printer,
  Save,
  RefreshCw,
  CheckCircle,
  GraduationCap,
  Clock,
  FileText
} from 'lucide-react';
import { SchoolCategory, SchoolUser, DimMathData, NipMathData, EidMathData, DimEkpData, EidEkpData } from '../types';
import { NipMathSection } from './NipMathSection';
import { EidMathSection } from './EidMathSection';
import { DimMathSection } from './DimMathSection';
import { EidEkpSection } from './EidEkpSection';
import { DimEkpSection } from './DimEkpSection';

interface ProgrammatismosDirectorViewProps {
  activeSchool: SchoolUser;
  schoolCategory: SchoolCategory;
  mathData: any;
  setMathData: (d: any) => void;
  ekpData: any;
  setEkpData: (d: any) => void;
  userTab: 'math' | 'ekp';
  setUserTab: (tab: 'math' | 'ekp') => void;
  protocolNumber: string;
  setProtocolNumber: (val: string) => void;
  isSaving: boolean;
  saveMessage: string | null;
  onSaveData: () => void;
  onExportPDF: () => void;
}

export const ProgrammatismosDirectorView: React.FC<ProgrammatismosDirectorViewProps> = ({
  activeSchool,
  schoolCategory,
  mathData,
  setMathData,
  ekpData,
  setEkpData,
  userTab,
  setUserTab,
  protocolNumber,
  setProtocolNumber,
  isSaving,
  saveMessage,
  onSaveData,
  onExportPDF
}) => {
  return (
    <div className="space-y-6">
      {/* School Profile Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              Κωδικός: {activeSchool.SchCode}
            </span>
            <h2 className="text-lg font-bold text-slate-900">{activeSchool.SchName}</h2>
          </div>
          <p className="text-xs text-slate-500">
            Διευθυντής/Προϊστάμενος: <strong className="text-slate-800">{activeSchool.PrName}</strong> | Οργανικότητα: <strong className="text-slate-800">{activeSchool.Organ}θέσιο</strong> | Έδρα: <strong className="text-slate-800">{activeSchool.Location}</strong>
          </p>
        </div>

        {/* Action buttons & Protocol Number */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Protocol Number input box */}
          <div id="protocol-number-wrapper" className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-300 rounded-xl px-3 py-1.5 transition">
            <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <label htmlFor="protocol-number-input" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Αρ. Πρωτ.:
            </label>
            <input
              id="protocol-number-input"
              type="text"
              value={protocolNumber}
              onChange={(e) => setProtocolNumber(e.target.value)}
              placeholder="π.χ. 124 / 24-08-2026"
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-36 sm:w-44 transition shadow-xs"
              title="Εισάγετε τον Αριθμό Πρωτοκόλλου για εμφάνιση στο εξαγόμενο PDF"
            />
          </div>

          <button
            id="btn-export-programmatismos-pdf"
            onClick={onExportPDF}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Εξαγωγή σε PDF</span>
          </button>

          <button
            id="btn-save-programmatismos-data"
            onClick={onSaveData}
            disabled={isSaving}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Αποθήκευση Μεταβολών</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center space-x-3 text-xs shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{saveMessage}</span>
        </div>
      )}

      {/* PARALLEL SUB-CATEGORIES / TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setUserTab('math')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                userTab === 'math'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>1. Μαθητικό Δυναμικό &amp; Τμήματα</span>
            </button>

            <button
              onClick={() => setUserTab('ekp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                userTab === 'ekp'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>2. Ωράριο Εκπαιδευτικών (Κατανομή Ωρών)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ΜΑΘΗΤΙΚΟ ΔΥΝΑΜΙΚΟ */}
        {userTab === 'math' && mathData && (
          <>
            {(schoolCategory === 'nip' || schoolCategory === 'eid_nip') && (
              <NipMathSection mathData={mathData as NipMathData} setMathData={setMathData} schoolName={activeSchool?.SchName} category={schoolCategory} />
            )}
            {(schoolCategory === 'eid' || schoolCategory === 'eid_dim') && (
              <EidMathSection mathData={mathData as EidMathData} setMathData={setMathData} />
            )}
            {schoolCategory === 'dim' && (
              <DimMathSection mathData={mathData as DimMathData} setMathData={setMathData} />
            )}
          </>
        )}

        {/* TAB 2: ΩΡΑΡΙΟ ΕΚΠΑΙΔΕΥΤΙΚΩΝ */}
        {userTab === 'ekp' && (
          <>
            {schoolCategory === 'nip' ? (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-2">
                <h4 className="font-bold text-sm">Σημείωση για Γενικά Νηπιαγωγεία</h4>
                <p>
                  Στα Γενικά Νηπιαγωγεία δεν απαιτείται ξεχωριστή καρτέλα κατανομής ωρών εκπαιδευτικών, καθώς το πρόγραμμα υπολογίζεται αυτόματα από τα τμήματα και τις εγγραφές στην καρτέλα <strong>"1. Μαθητικό Δυναμικό &amp; Τμήματα"</strong>.
                </p>
              </div>
            ) : schoolCategory === 'eid_nip' ? (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-2">
                <h4 className="font-bold text-sm">Σημείωση για Ειδικά Νηπιαγωγεία</h4>
                <p>
                  Στα Ειδικά Νηπιαγωγεία, οι εγγραφές μαθητών καθώς και η στελέχωση ΕΒΠ (ΔΕ1ΕΒΠ) &amp; ΕΕΠ (ΠΕ21-ΠΕ30) καταγράφονται συγκεντρωτικά στην καρτέλα <strong>"1. Μαθητικό Δυναμικό &amp; Στελέχωση Ειδικού Νηπιαγωγείου"</strong>.
                </p>
              </div>
            ) : (schoolCategory === 'eid' || schoolCategory === 'eid_dim') && ekpData ? (
              <EidEkpSection ekpData={ekpData as EidEkpData} setEkpData={setEkpData} mathData={mathData as EidMathData} />
            ) : ekpData ? (
              <DimEkpSection ekpData={ekpData as DimEkpData} setEkpData={setEkpData} mathData={mathData as DimMathData} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
