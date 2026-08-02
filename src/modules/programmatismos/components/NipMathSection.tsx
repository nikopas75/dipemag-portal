import React from 'react';
import { NipMathData, EidNipMathData, SchoolCategory } from '../types';
import { Sparkles, Shield, UserCheck } from 'lucide-react';

interface Props {
  mathData: NipMathData | EidNipMathData;
  setMathData: React.Dispatch<React.SetStateAction<any>>;
  schoolName?: string;
  category?: SchoolCategory;
}

export const NipMathSection: React.FC<Props> = ({ mathData, setMathData, schoolName, category }) => {
  const updateVal = (field: string, val: string | number) => {
    const numVal = typeof val === 'number' ? val : Number(val) || 0;
    const updated = { ...mathData, [field]: numVal };
    if (field === 'StuA' || field === 'StuB') {
      updated.StuTotal = Number(updated.StuA || 0) + Number(updated.StuB || 0);
    }
    if (field === 'StuOloA' || field === 'StuOloB') {
      updated.StuOloTotal = Number(updated.StuOloA || 0) + Number(updated.StuOloB || 0);
    }
    setMathData(updated);
  };

  const nameToCheck = (schoolName || mathData.SchName || '').toUpperCase();
  const isEidiko = nameToCheck.includes('ΕΙΔΙΚΟ') || nameToCheck.includes('ΕΙΔΙΚ');
  const showSpecialStaff = category === 'eid_nip' || (category !== 'nip' && isEidiko);
  const eidMathData = mathData as EidNipMathData;

  const totalStu = Number(mathData.StuA || 0) + Number(mathData.StuB || 0);
  const totalOlo = Number(mathData.StuOloA || 0) + Number(mathData.StuOloB || 0);

  return (
    <div className="space-y-6">
      {/* 1. Προνήπια & Νήπια */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 mb-3 tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Αριθμός Μαθητών Νηπιαγωγείου (Προνήπια & Νήπια)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold">
                <th className="p-2.5 text-left">Κατηγορία</th>
                <th className="p-2.5">Προνήπια</th>
                <th className="p-2.5">Νήπια</th>
                <th className="p-2.5 bg-amber-700 text-white font-bold">Σύνολο</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2.5 text-left font-bold text-slate-800 bg-slate-50">Εγγραφές</td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    value={mathData.StuA || 0}
                    onChange={e => updateVal('StuA', e.target.value)}
                    className="w-24 p-1.5 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800 outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    value={mathData.StuB || 0}
                    onChange={e => updateVal('StuB', e.target.value)}
                    className="w-24 p-1.5 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800 outline-none"
                  />
                </td>
                <td className="p-2.5 font-bold text-amber-900 bg-amber-50 text-sm">{totalStu}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Ολοήμερο Πρόγραμμα & Πρωινή Ζώνη (Πρωινή Ζώνη Πρώτη) */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 max-w-2xl">
        <h4 className="text-xs font-bold text-slate-800 tracking-wider">
          Ολοήμερο Πρόγραμμα & Πρωινή Ζώνη
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Πρωινή Ζώνη</label>
            <input
              type="number"
              min={0}
              value={mathData.StuPY || 0}
              onChange={e => updateVal('StuPY', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Ολοήμερο Προνήπια</label>
            <input
              type="number"
              min={0}
              value={mathData.StuOloA || 0}
              onChange={e => updateVal('StuOloA', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Ολοήμερο Νήπια</label>
            <input
              type="number"
              min={0}
              value={mathData.StuOloB || 0}
              onChange={e => updateVal('StuOloB', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Σύνολο Ολοημέρου</label>
            <div className="w-full p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-bold text-center">
              {totalOlo}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Διευρυμένο Πρόγραμμα & Τμήμα Ένταξης */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 max-w-2xl">
        <h4 className="text-xs font-bold text-slate-800 tracking-wider flex items-center space-x-2">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>Τμήμα Ένταξης & Απορρόφηση</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Τμήμα Ένταξης (Μαθητές)</label>
            <input
              type="number"
              min={0}
              value={mathData.StuTE || 0}
              onChange={e => updateVal('StuTE', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Μαθητές χωρίς δυνατότητα Απορρόφησης</label>
            <input
              type="number"
              min={0}
              value={mathData.StuApor || 0}
              onChange={e => updateVal('StuApor', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Ειδικό Εκπαιδευτικό & Βοηθητικό Προσωπικό (ΕΕΠ / ΕΒΠ) - ΕΜΦΑΝΙΖΕΤΑΙ ΜΟΝΟ ΣΤΑ ΕΙΔΙΚΑ ΝΗΠΙΑΓΩΓΕΙΑ */}
      {showSpecialStaff && (
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3 max-w-2xl">
          <h4 className="text-xs font-bold text-amber-900 tracking-wider flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>Στελέχωση Ειδικού Νηπιαγωγείου (ΕΕΠ / ΕΒΠ)</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-medium">ΕΒΠ (ΔΕ1ΕΒΠ)</label>
              <input
                type="number"
                min={0}
                value={eidMathData.DE1EVP || 0}
                onChange={e => updateVal('DE1EVP', e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">ΠΕ21 (Ψυχολόγοι)</label>
              <input
                type="number"
                min={0}
                value={eidMathData.PE21 || 0}
                onChange={e => updateVal('PE21', e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">ΠΕ23 (Κοινων. Λειτ.)</label>
              <input
                type="number"
                min={0}
                value={eidMathData.PE23 || 0}
                onChange={e => updateVal('PE23', e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">ΠΕ25 (Σχ. Νοσηλευτές)</label>
              <input
                type="number"
                min={0}
                value={eidMathData.PE25 || 0}
                onChange={e => updateVal('PE25', e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">ΠΕ26 (Λογοθεραπευτές)</label>
              <input
                type="number"
                min={0}
                value={eidMathData.PE26 || 0}
                onChange={e => updateVal('PE26', e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">ΠΕ28 (Φυσιοθεραπευτές)</label>
              <input
                type="number"
                min={0}
                value={eidMathData.PE28 || 0}
                onChange={e => updateVal('PE28', e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">ΠΕ29 (Εργοθεραπευτές)</label>
              <input
                type="number"
                min={0}
                value={eidMathData.PE29 || 0}
                onChange={e => updateVal('PE29', e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">ΠΕ30 (Λοιπό ΕΕΠ)</label>
              <input
                type="number"
                min={0}
                value={eidMathData.PE30 || 0}
                onChange={e => updateVal('PE30', e.target.value)}
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Παρατηρήσεις */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1">Παρατηρήσεις / Σημειώσεις Νηπιαγωγείου</label>
        <textarea
          rows={3}
          value={mathData.Parat || ''}
          onChange={e => setMathData({ ...mathData, Parat: e.target.value })}
          placeholder="Επιπλέον παρατηρήσεις για τις εγγραφές νηπίων/προνηπίων..."
          className="w-full p-3 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans"
        />
      </div>
    </div>
  );
};

