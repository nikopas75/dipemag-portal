import React from 'react';
import { DimMathData } from './types';
import { Table } from 'lucide-react';

interface Props {
  mathData: DimMathData;
  setMathData: React.Dispatch<React.SetStateAction<DimMathData | null>>;
}

export const DimMathSection: React.FC<Props> = ({ mathData, setMathData }) => {
  const isExtended = Number(mathData.OloType) === 1;

  const updateVal = (field: keyof DimMathData, val: string | number) => {
    const numVal = typeof val === 'number' ? val : Number(val) || 0;
    const updated = { ...mathData, [field]: numVal };

    if (field === 'OloType' && numVal !== 1) {
      updated.StuOloZ3 = 0;
    }

    if (field === 'StuOloZ1' || field === 'StuOloZ2' || field === 'StuOloZ3' || field === 'OloType') {
      const isExt = Number(updated.OloType) === 1;
      const z3Val = isExt ? Number(updated.StuOloZ3 || 0) : 0;
      updated.StuOloTotal = Number(updated.StuOloZ1 || 0) + Number(updated.StuOloZ2 || 0) + z3Val;
    }
    setMathData(updated);
  };

  const totalStu = Number(mathData.StuA || 0) + Number(mathData.StuB || 0) + Number(mathData.StuC || 0) + Number(mathData.StuD || 0) + Number(mathData.StuE || 0) + Number(mathData.StuF || 0);
  const totalClass = Number(mathData.ClassA || 0) + Number(mathData.ClassB || 0) + Number(mathData.ClassC || 0) + Number(mathData.ClassD || 0) + Number(mathData.ClassE || 0) + Number(mathData.ClassF || 0);
  const zSum = Number(mathData.StuOloZ1 || 0) + Number(mathData.StuOloZ2 || 0) + (isExtended ? Number(mathData.StuOloZ3 || 0) : 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 mb-3 tracking-wider flex items-center space-x-2">
          <Table className="w-4 h-4 text-amber-600" />
          <span>Αριθμός Μαθητών & Τμημάτων ανά Τάξη (Δημοτικό)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold">
                <th className="p-2.5 text-left">Κατηγορία</th>
                <th className="p-2.5">Α΄</th>
                <th className="p-2.5">Β΄</th>
                <th className="p-2.5">Γ΄</th>
                <th className="p-2.5">Δ΄</th>
                <th className="p-2.5">Ε΄</th>
                <th className="p-2.5">ΣΤ΄</th>
                <th className="p-2.5 bg-amber-700 text-white font-bold">Σύνολο</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2.5 text-left font-bold text-slate-800 bg-slate-50">Μαθητές</td>
                {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map(g => (
                  <td key={g} className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={(mathData as any)[`Stu${g}`]}
                      onChange={e => updateVal(`Stu${g}` as keyof DimMathData, e.target.value)}
                      className="w-16 p-1.5 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                    />
                  </td>
                ))}
                <td className="p-2.5 font-bold text-amber-900 bg-amber-50 text-sm">{totalStu}</td>
              </tr>

              <tr>
                <td className="p-2.5 text-left font-bold text-slate-800 bg-slate-50">Τμήματα</td>
                {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map(g => (
                  <td key={g} className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={(mathData as any)[`Class${g}`]}
                      onChange={e => updateVal(`Class${g}` as keyof DimMathData, e.target.value)}
                      className="w-16 p-1.5 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                    />
                  </td>
                ))}
                <td className="p-2.5 font-bold text-amber-900 bg-amber-50 text-sm">{totalClass}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Subsections stacked vertically */}
      <div className="space-y-6">
        {/* All Day School */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 max-w-3xl">
          <h4 className="text-xs font-bold text-slate-800 tracking-wider">
            Ολοήμερο Πρόγραμμα
          </h4>
          <div className="space-y-3 text-xs">
            {/* 1η Γραμμή: Τύπος Ολοήμερου */}
            <div className="max-w-xs">
              <label className="block text-slate-600 mb-1 font-medium">Τύπος Ολοήμερου</label>
              <select
                value={mathData.OloType ?? 0}
                onChange={e => updateVal('OloType', Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value={0} className="text-slate-900 bg-white font-medium">Κλασικό</option>
                <option value={1} className="text-slate-900 bg-white font-medium">Διευρυμένου Προγράμματος</option>
              </select>
            </div>

            {/* 2η Γραμμή: Αριθμητικά Πεδία (Πρωινή Ζώνη, Σύνολο, 1η, 2η, [3η] Ζώνη) */}
            <div className={`grid grid-cols-2 ${isExtended ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-3 text-xs`}>
              {/* 1. Πρωινή Ζώνη */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium min-h-[2.5rem] flex flex-col justify-end">
                  <span>Πρωινή Ζώνη</span>
                  <span className="block text-slate-400 font-normal text-[11px]">(07:00 - 08:00)</span>
                </label>
                <input
                  type="number"
                  value={mathData.StuOloPZ}
                  onChange={e => updateVal('StuOloPZ', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* 2. Σύνολο Μαθητών Ολοήμερου */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium min-h-[2.5rem] flex flex-col justify-end">
                  <span className="flex items-center justify-between">
                    <span>Σύνολο Μαθητών</span>
                    {zSum > 0 && Number(mathData.StuOloTotal ?? zSum) !== zSum ? (
                      <span className="text-[10px] text-amber-600 font-normal">⚠️ {zSum}</span>
                    ) : zSum > 0 ? (
                      <span className="text-[10px] text-emerald-600 font-normal">✓ ({zSum})</span>
                    ) : null}
                  </span>
                  <span className="block text-slate-400 font-normal text-[11px]">Ολοήμερου</span>
                </label>
                <input
                  type="number"
                  value={mathData.StuOloTotal ?? zSum}
                  onChange={e => updateVal('StuOloTotal', e.target.value)}
                  className={`w-full p-2 bg-white border rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none ${
                    zSum > 0 && Number(mathData.StuOloTotal ?? zSum) !== zSum ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300'
                  }`}
                />
                {zSum > 0 && Number(mathData.StuOloTotal ?? zSum) !== zSum && (
                  <p className="text-[10px] text-amber-700 mt-0.5 leading-tight">
                    Πρέπει να ισούται με το άθροισμα των Ζωνών ({zSum}).
                  </p>
                )}
              </div>

              {/* 3. 1η Ζώνη */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium min-h-[2.5rem] flex flex-col justify-end">
                  <span>Αποχώρηση 1ης Ζώνης</span>
                  <span className="block text-slate-400 font-normal text-[11px]">
                    (Ώρα: {isExtended ? '14:50' : '15:00'})
                  </span>
                </label>
                <input
                  type="number"
                  value={mathData.StuOloZ1}
                  onChange={e => updateVal('StuOloZ1', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* 4. 2η Ζώνη */}
              <div>
                <label className="block text-slate-600 mb-1 font-medium min-h-[2.5rem] flex flex-col justify-end">
                  <span>Αποχώρηση 2ης Ζώνης</span>
                  <span className="block text-slate-400 font-normal text-[11px]">
                    (Ώρα: {isExtended ? '15:50' : '16:00'})
                  </span>
                </label>
                <input
                  type="number"
                  value={mathData.StuOloZ2}
                  onChange={e => updateVal('StuOloZ2', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* 5. 3η Ζώνη (Μόνο στο Διευρυμένο Πρόγραμμα) */}
              {isExtended && (
                <div>
                  <label className="block text-slate-600 mb-1 font-medium min-h-[2.5rem] flex flex-col justify-end">
                    <span>Αποχώρηση 3ης Ζώνης</span>
                    <span className="block text-slate-400 font-normal text-[11px]">(Ώρα: 17:30)</span>
                  </label>
                  <input
                    type="number"
                    value={mathData.StuOloZ3}
                    onChange={e => updateVal('StuOloZ3', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Special Education & Reception */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 max-w-2xl">
          <h4 className="text-xs font-bold text-slate-800 tracking-wider">
            Ειδικές Κατηγορίες & Δομές
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">Τμήματα Ένταξης</label>
              <input
                type="number"
                value={mathData.StuTE}
                onChange={e => updateVal('StuTE', e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">T.E. με Βεβαίωση</label>
              <input
                type="number"
                value={mathData.StuTEVEV}
                onChange={e => updateVal('StuTEVEV', e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Τάξεις Υποδοχής</label>
              <input
                type="number"
                value={mathData.StuTY}
                onChange={e => updateVal('StuTY', e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Κατ' Οίκον Διδασκαλία</label>
              <input
                type="number"
                value={mathData.StuKatOik}
                onChange={e => updateVal('StuKatOik', e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1">Παρατηρήσεις / Σημειώσεις Μαθητικού Δυναμικού</label>
        <textarea
          rows={3}
          value={mathData.Parat}
          onChange={e => setMathData({ ...mathData, Parat: e.target.value })}
          placeholder="Επιπλέον παρατηρήσεις για τις εγγραφές, μεταβολές μαθητών..."
          className="w-full p-3 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans"
        />
      </div>
    </div>
  );
};
