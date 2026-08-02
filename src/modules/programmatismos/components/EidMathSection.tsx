import React from 'react';
import { EidMathData } from '../types';
import { Table } from 'lucide-react';

interface Props {
  mathData: EidMathData;
  setMathData: React.Dispatch<React.SetStateAction<EidMathData | null>>;
}

export const EidMathSection: React.FC<Props> = ({ mathData, setMathData }) => {
  const updateVal = (field: keyof EidMathData, val: string | number) => {
    const numVal = typeof val === 'number' ? val : Number(val) || 0;
    const updated = { ...mathData, [field]: numVal };
    
    // Auto-calculate total students & classes
    updated.StuTotal = 
      Number(updated.StuProp || 0) +
      Number(updated.StuA || 0) + Number(updated.StuB || 0) +
      Number(updated.StuC || 0) + Number(updated.StuD || 0) +
      Number(updated.StuE || 0) + Number(updated.StuF || 0);

    updated.ClassTotal = 
      Number(updated.ClassProp || 0) +
      Number(updated.ClassA || 0) + Number(updated.ClassB || 0) +
      Number(updated.ClassC || 0) + Number(updated.ClassD || 0) +
      Number(updated.ClassE || 0) + Number(updated.ClassF || 0);

    setMathData(updated);
  };

  const totalStu = 
    Number(mathData.StuProp || 0) +
    Number(mathData.StuA || 0) + Number(mathData.StuB || 0) +
    Number(mathData.StuC || 0) + Number(mathData.StuD || 0) +
    Number(mathData.StuE || 0) + Number(mathData.StuF || 0);

  const totalClass = 
    Number(mathData.ClassProp || 0) +
    Number(mathData.ClassA || 0) + Number(mathData.ClassB || 0) +
    Number(mathData.ClassC || 0) + Number(mathData.ClassD || 0) +
    Number(mathData.ClassE || 0) + Number(mathData.ClassF || 0);

  return (
    <div className="space-y-6">
      {/* 1. Μαθητές & Τμήματα Ειδικού Σχολείου */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 mb-3 tracking-wider flex items-center space-x-2">
          <Table className="w-4 h-4 text-amber-600" />
          <span>Αριθμός Μαθητών & Τμημάτων ανά Τάξη (Ειδικό Δημοτικό)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold">
                <th className="p-2.5 text-left">Κατηγορία</th>
                <th className="p-2.5">Προπαρ.</th>
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
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    value={mathData.StuProp || 0}
                    onChange={e => updateVal('StuProp', e.target.value)}
                    className="w-16 p-1.5 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                  />
                </td>
                {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map(g => (
                  <td key={g} className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={(mathData as any)[`Stu${g}`] || 0}
                      onChange={e => updateVal(`Stu${g}` as keyof EidMathData, e.target.value)}
                      className="w-16 p-1.5 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                    />
                  </td>
                ))}
                <td className="p-2.5 font-bold text-amber-900 bg-amber-50 text-sm">{totalStu}</td>
              </tr>

              <tr>
                <td className="p-2.5 text-left font-bold text-slate-800 bg-slate-50">Τμήματα</td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    value={mathData.ClassProp || 0}
                    onChange={e => updateVal('ClassProp', e.target.value)}
                    className="w-16 p-1.5 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                  />
                </td>
                {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map(g => (
                  <td key={g} className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={(mathData as any)[`Class${g}`] || 0}
                      onChange={e => updateVal(`Class${g}` as keyof EidMathData, e.target.value)}
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

      {/* 2. Ολοήμερο Πρόγραμμα Ειδικού Σχολείου */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 max-w-2xl">
        <h4 className="text-xs font-bold text-slate-800 tracking-wider">
          Ολοήμερο Πρόγραμμα Ειδικού Σχολείου
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Πρωινή Ζώνη</label>
            <input
              type="number"
              min={0}
              value={mathData.StuOloPZ || 0}
              onChange={e => updateVal('StuOloPZ', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Σύνολο Μαθητών Ολοήμερου</label>
            <input
              type="number"
              min={0}
              value={mathData.StuOlo || 0}
              onChange={e => updateVal('StuOlo', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Παρατηρήσεις */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1">Παρατηρήσεις / Σημειώσεις Μαθητικού Δυναμικού Ειδικού Σχολείου</label>
        <textarea
          rows={3}
          value={mathData.Parat || ''}
          onChange={e => setMathData({ ...mathData, Parat: e.target.value })}
          placeholder="Επιπλέον παρατηρήσεις για τις εγγραφές/δομές ειδικής αγωγής..."
          className="w-full p-3 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans"
        />
      </div>
    </div>
  );
};

