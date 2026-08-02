import React from 'react';
import { EidEkpData, EidMathData } from './types';
import { Shield, Info, Building2, AlertTriangle } from 'lucide-react';

interface Props {
  ekpData: EidEkpData;
  setEkpData: React.Dispatch<React.SetStateAction<EidEkpData | null>>;
  mathData?: EidMathData | null;
}

export const EidEkpSection: React.FC<Props> = ({ ekpData, setEkpData, mathData }) => {
  const classTotal = mathData
    ? Number(mathData.ClassTotal || 0) || (
        Number(mathData.ClassProp || 0) +
        Number(mathData.ClassA || 0) +
        Number(mathData.ClassB || 0) +
        Number(mathData.ClassC || 0) +
        Number(mathData.ClassD || 0) +
        Number(mathData.ClassE || 0) +
        Number(mathData.ClassF || 0)
      )
    : 0;

  const specs = [
    { key: 'PE70', label: 'ΠΕ70' },
    { key: 'PE05', label: 'ΠΕ05' },
    { key: 'PE06', label: 'ΠΕ06' },
    { key: 'PE07', label: 'ΠΕ07' },
    { key: 'PE08', label: 'ΠΕ08' },
    { key: 'PE11', label: 'ΠΕ11' },
    { key: 'PE79', label: 'ΠΕ79' },
    { key: 'PE86', label: 'ΠΕ86' },
    { key: 'PE91', label: 'ΠΕ91' },
  ] as const;

  const specialSpecs = [
    { key: 'DE1EVP', label: 'ΔΕ1ΕΒΠ' },
    { key: 'PE21', label: 'ΠΕ21' },
    { key: 'PE23', label: 'ΠΕ23' },
    { key: 'PE25', label: 'ΠΕ25' },
    { key: 'PE26', label: 'ΠΕ26' },
    { key: 'PE28', label: 'ΠΕ28' },
    { key: 'PE29', label: 'ΠΕ29' },
    { key: 'PE30', label: 'ΠΕ30' },
  ] as const;

  const proTotal = specs.reduce((acc, s) => acc + Number((ekpData as any)[`Pro${s.key}`] || 0), 0);
  const expectedRequiredHours = classTotal * 30;
  const isProMismatch = proTotal !== expectedRequiredHours;

  const invalidDiaSpecs = specs
    .map(s => ({
      key: s.key,
      label: s.label,
      val: Number((ekpData as any)[`Dia${s.key}`] || 0)
    }))
    .filter(item => item.val >= 1 && item.val <= 18);

  interface RowDef {
    key: string;
    label: string;
    tooltip?: React.ReactNode;
  }

  const rowsDef: RowDef[] = [
    {
      key: 'Dia',
      label: 'Υποχρεωτικό Ωράριο',
      tooltip: (
        <>
          Το υποχρεωτικό ωράριο (αθροιστικά ανά ειδικότητα) των εκπ/κών που ανήκουν οργανικά και θα υπηρετήσουν στη σχολική μονάδα τη νέα χρονιά.<br />
          Αποδεκτοί αριθμοί μεταξύ 21 και 24 (και αθροίσματα αυτών).<br />
          Εξαιρούνται μειώσεις (π.χ. Ώρες Δ/ντών).<br />
          30 για ολιγοθέσια.
        </>
      ),
    },
    {
      key: 'Pro',
      label: 'Απαιτούμενο Ωράριο',
      tooltip: (
        <>
          Οι ώρες (αθροιστικά ανά ειδικότητα) που θα απαιτηθούν για τη νέα σχολική χρονιά.<br />
          Προκύπτει από το ωρολόγιο πρόγραμμα της κάθε τάξης.
        </>
      ),
    },
    { key: 'EZ', label: 'Ελεύθερη Ζώνη' },
    { key: 'PY', label: 'Πρόωρη Υποδοχή' },
    { key: 'Olo', label: 'Ολοήμερο' },
    { key: 'Sit', label: 'Σίτιση' },
    { key: 'Bib', label: 'Βιβλιοθήκη' },
  ] as const;

  const updateVal = (rowKey: string, specKey: string, val: string | number) => {
    const numVal = typeof val === 'number' ? val : Number(val) || 0;
    const fieldName = `${rowKey}${specKey}` as keyof EidEkpData;
    const totalFieldName = `${rowKey}Total` as keyof EidEkpData;

    const updated = { ...ekpData, [fieldName]: numVal };

    let total = 0;
    specs.forEach(s => {
      total += Number((updated as any)[`${rowKey}${s.key}`] || 0);
    });
    (updated as any)[totalFieldName] = total;

    setEkpData(updated);
  };

  const updateSpecialVal = (specKey: string, val: string | number) => {
    const numVal = typeof val === 'number' ? val : Number(val) || 0;
    setEkpData({ ...ekpData, [specKey]: numVal });
  };

  return (
    <div className="space-y-6">
      {/* Λειτουργικότητα Σχολικής Μονάδας (ClassTotal) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-amber-600 text-white rounded-xl shadow-md flex flex-col items-center justify-center min-w-[56px] min-h-[56px]">
            <Building2 className="w-5 h-5 mb-0.5" />
            <span className="text-xs font-black leading-none">{classTotal > 0 ? `${classTotal}/θ` : '0/θ'}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">
                Λειτουργικότητα Ειδικού Σχολείου:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-600 text-white shadow-xs">
                {classTotal > 0 ? `${classTotal}/θέσιο` : 'Μη ορισμένη (0/θέσιο)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Βεβαιωθείτε ότι έχετε συμπληρώσει σωστά τον αριθμό των τμημάτων στην καρτέλα «1. Μαθητικό Δυναμικό & Τμήματα».
            </p>
          </div>
        </div>
        <div className="text-xs bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-200/60 text-slate-700 font-medium self-stretch sm:self-auto flex items-center justify-between sm:justify-start space-x-2 shadow-xs">
          <span className="text-slate-500 text-[11px]">Σύνολο Τμημάτων:</span>
          <span className="font-bold text-amber-900">{classTotal} {classTotal === 1 ? 'τμήμα' : 'τμήματα'}</span>
        </div>
      </div>

      {/* Main Teacher Hours */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 mb-3 tracking-wider flex items-center space-x-2">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>Κατανομή Ωρών Εκπαιδευτικού Προσωπικού (Ειδικό Σχολείο)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse bg-white rounded-lg border border-slate-200">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold">
                <th className="p-2.5 text-left min-w-[200px]">Κατηγορία Ωρών</th>
                {specs.map(s => (
                  <th key={s.key} className="p-2.5 min-w-[55px]">{s.label}</th>
                ))}
                <th className="p-2.5 bg-amber-700 text-white font-bold min-w-[65px]">Σύνολο</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rowsDef.map(r => {
                let rowSum = 0;
                specs.forEach(s => {
                  rowSum += Number((ekpData as any)[`${r.key}${s.key}`] || 0);
                });

                return (
                  <tr key={r.key}>
                    <td className="p-2.5 text-left font-bold text-slate-800 bg-slate-50">
                      <div className="flex items-center space-x-1.5">
                        <span>{r.label}</span>
                        {r.tooltip && (
                          <div className="relative group/tip inline-flex items-center">
                            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-amber-600 cursor-help transition-colors" />
                            <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tip:block z-50 w-72 p-3 bg-slate-900 text-slate-100 text-[11px] font-normal leading-relaxed rounded-xl shadow-2xl border border-slate-700 pointer-events-none">
                              {r.tooltip}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    {specs.map(s => {
                      const val = Number((ekpData as any)[`${r.key}${s.key}`] || 0);
                      const isInvalidDia = r.key === 'Dia' && val >= 1 && val <= 18;

                      return (
                        <td key={s.key} className="p-1.5">
                          <div className="relative inline-block">
                            <input
                              type="number"
                              min={0}
                              value={val}
                              onChange={e => updateVal(r.key, s.key, e.target.value)}
                              title={isInvalidDia ? "Μη αναμενόμενο υποχρεωτικό ωράριο (1-18 ώρες)" : undefined}
                              className={`w-14 p-1 text-center border rounded font-semibold transition-colors focus:ring-2 focus:ring-amber-500 ${
                                isInvalidDia
                                  ? 'border-amber-400 bg-amber-100/90 text-amber-950 font-bold shadow-xs'
                                  : 'border-slate-300 text-slate-800'
                              }`}
                            />
                            {isInvalidDia && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5" title="Μη αναμενόμενη τιμή (1-18 ώρες)">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className={`p-2.5 font-bold text-sm ${r.key === 'Pro' && isProMismatch ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-amber-50 text-amber-900'}`}>
                      <div className="flex items-center justify-center space-x-1">
                        <span>{rowSum}</span>
                        {r.key === 'Pro' && isProMismatch && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Runtime Check Warning for Mandatory Hours (1-18 hours) */}
        {invalidDiaSpecs.length > 0 && (
          <div className="mt-3.5 p-3 bg-amber-50/90 border border-amber-300/90 rounded-xl text-xs text-amber-900 flex items-center space-x-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="font-medium">
              <span className="font-bold text-amber-950">Ένδειξη Υποχρεωτικού Ωραρίου:</span> Στο «Υποχρεωτικό Ωράριο» καταχωρήθηκε τιμή μεταξύ 1 και 18 ωρών ({invalidDiaSpecs.map(s => `${s.label}: ${s.val} ωρ.`).join(', ')}), η οποία δεν φαίνεται να είναι έγκυρη (το υποχρεωτικό ωράριο κυμαίνεται συνήθως μεταξύ 21 και 24 ωρών).
            </div>
          </div>
        )}

        {/* Runtime Check Error Message for Required Hours */}
        {isProMismatch && (
          <div className="mt-3.5 p-3 bg-amber-50/90 border border-amber-300/90 rounded-xl text-xs text-amber-900 flex items-center space-x-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="font-medium">
              <span className="font-bold text-amber-950">Προσοχή:</span> Το Σύνολο Απαιτούμενων Ωρών ({proTotal} ωρ.) διαφέρει από το αναμενόμενο ({expectedRequiredHours} ωρ. = {classTotal} {classTotal === 1 ? 'τμήμα' : 'τμήματα'} × 30 ωρ.).
            </div>
          </div>
        )}
      </div>

      {/* Special Staff (ΕΒΠ / ΕΕΠ) */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 tracking-wider">
          Ώρες & Οργανικές Θέσεις ΕΒΠ / ΕΕΠ Ειδικού Σχολείου
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {specialSpecs.map(spec => (
            <div key={spec.key}>
              <label className="block text-slate-600 mb-1 font-medium">{spec.label}</label>
              <input
                type="number"
                value={(ekpData as any)[spec.key] || 0}
                onChange={e => updateSpecialVal(spec.key, e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1">Παρατηρήσεις Ωραρίου Ειδικού Σχολείου</label>
        <textarea
          rows={3}
          value={ekpData.Parat || ''}
          onChange={e => setEkpData({ ...ekpData, Parat: e.target.value })}
          placeholder="Επιπλέον παρατηρήσεις για τις ώρες ειδικής αγωγής..."
          className="w-full p-3 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans"
        />
      </div>
    </div>
  );
};
