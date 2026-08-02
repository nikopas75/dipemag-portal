import React from 'react';
import { Application, SchoolPlan } from '../types';
import { Printer, X, Download } from 'lucide-react';

interface PrintDocumentProps {
  type: 'aitisi' | 'programmatismos';
  applicationData?: Application | null;
  planData?: SchoolPlan | null;
  onClose: () => void;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  type,
  applicationData,
  planData,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-8 shadow-2xl relative my-8 print:p-0 print:shadow-none print:m-0 print:max-w-none print:w-full">
        {/* Floating Print Controls - Hidden during print */}
        <div className="print:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-800">Προεπισκόπηση & Εκτύπωση Επίσημου Εγγράφου</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center space-x-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Εκτύπωση / Αποθήκευση PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Content Frame */}
        <div className="border border-slate-300 p-8 rounded-xl print:border-none print:p-0 font-serif">
          {/* Formal Greek Header */}
          <div className="text-center mb-6 space-y-1 border-b border-slate-300 pb-4">
            <div className="text-xl font-bold tracking-widest uppercase">ΕΛΛΗΝΙΚΗ ΔΗΜΟΚΡΑΤΙΑ</div>
            <div className="text-sm font-semibold">ΥΠΟΥΡΓΕΙΟ ΠΑΙΔΕΙΑΣ, ΘΡΗΣΚΕΥΜΑΤΩΝ ΚΑΙ ΑΘΛΗΤΙΣΜΟΥ</div>
            <div className="text-xs text-slate-700 font-sans">ΠΕΡΙΦΕΡΕΙΑΚΗ ΔΙΕΥΘΥΝΣΗ ΠΡΩΤΟΒΑΘΜΙΑΣ & ΔΕΥΤΕΡΟΒΑΘΜΙΑΣ ΕΚΠΑΙΔΕΥΣΗΣ</div>
            <div className="text-xs text-slate-600 font-sans">ΔΙΕΥΘΥΝΣΗ ΕΚΠΑΙΔΕΥΣΗΣ</div>
          </div>

          {type === 'aitisi' && applicationData && (
            <div className="space-y-6">
              <div className="flex justify-between items-start text-xs font-sans">
                <div>
                  <p><strong>ΑΡ. ΠΡΩΤΟΚΟΛΛΟΥ:</strong> {applicationData.protocolNumber}</p>
                  <p><strong>ΗΜΕΡΟΜΗΝΙΑ:</strong> {applicationData.submissionDate}</p>
                </div>
                <div className="text-right">
                  <p><strong>ΚΑΤΑΣΤΑΣΗ:</strong> {applicationData.status.toUpperCase()}</p>
                  <p><strong>ΕΙΔΟΣ ΑΙΤΗΣΗΣ:</strong> {applicationData.applicationType.toUpperCase()}</p>
                </div>
              </div>

              <div className="text-center py-2 bg-slate-100 rounded border border-slate-300 font-sans">
                <h2 className="text-lg font-bold text-slate-800 uppercase">
                  ΑΙΤΗΣΗ - ΔΗΛΩΣΗ ΕΚΠΑΙΔΕΥΤΙΚΟΥ ({applicationData.applicationType.toUpperCase()})
                </h2>
              </div>

              {/* Personal Data Section */}
              <div className="space-y-2 font-sans text-xs">
                <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-800">
                  1. ΣΤΟΙΧΕΙΑ ΑΙΤΟΥΝΤΟΣ/ΟΥΣΑΣ
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 bg-slate-50 p-3 rounded border border-slate-200">
                  <p><strong>Ονοματεπώνυμο:</strong> {applicationData.teacherName}</p>
                  <p><strong>Α.Φ.Μ.:</strong> {applicationData.teacherAfm}</p>
                  <p><strong>Ειδικότητα:</strong> {applicationData.specialty}</p>
                  <p><strong>Οικογενειακή Κατάσταση:</strong> {applicationData.maritalStatus}</p>
                  <p><strong>Αριθμός Τέκνων:</strong> {applicationData.childrenCount}</p>
                  <p><strong>Συνυπηρέτηση:</strong> {applicationData.hasCohabitation ? `Ναι (${applicationData.coHabitationMuni})` : 'Όχι'}</p>
                  <p><strong>Ειδική Κατηγορία / Λόγοι Υγείας:</strong> {applicationData.hasMedicalReason ? 'Ναι' : 'Όχι'}</p>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-2 font-sans text-xs">
                <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-800">
                  2. ΠΡΟΤΙΜΗΣΕΙΣ ΤΟΠΟΘΕΤΗΣΗΣ / ΣΧΟΛΙΚΩΝ ΜΟΝΑΔΩΝ
                </h3>
                <ol className="list-decimal pl-5 space-y-1 bg-white p-3 rounded border border-slate-200">
                  {applicationData.preferences.map((pref, idx) => (
                    <li key={idx} className="font-medium">{pref}</li>
                  ))}
                </ol>
              </div>

              {/* Comments */}
              {applicationData.comments && (
                <div className="space-y-1 font-sans text-xs">
                  <h3 className="font-bold text-slate-800">Παρατηρήσεις / Σημειώσεις:</h3>
                  <p className="italic bg-slate-50 p-2.5 rounded border border-slate-200">{applicationData.comments}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-12 font-sans text-xs text-center">
                <div>
                  <p className="font-semibold text-slate-700">Ο/Η Παραλαβών/ούσα Υπάλληλος</p>
                  <div className="h-16"></div>
                  <p className="border-t border-slate-400 pt-1 text-slate-500">(Υπογραφή & Σφραγίδα)</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Ο/Η Αιτών/ούσα Εκπαιδευτικός</p>
                  <div className="h-16 flex items-center justify-center italic text-slate-400">
                    Ψηφιακά Υποβεβλημένο
                  </div>
                  <p className="border-t border-slate-400 pt-1 text-slate-800 font-bold">{applicationData.teacherName}</p>
                </div>
              </div>
            </div>
          )}

          {type === 'programmatismos' && planData && (
            <div className="space-y-6">
              <div className="flex justify-between items-start text-xs font-sans">
                <div>
                  <p><strong>ΣΧΟΛΙΚΗ ΜΟΝΑΔΑ:</strong> {planData.schoolName}</p>
                  <p><strong>ΣΧΟΛΙΚΟ ΕΤΟΣ:</strong> {planData.academicYear}</p>
                </div>
                <div className="text-right">
                  <p><strong>ΚΩΔ. ΑΝΑΦΟΡΑΣ:</strong> {planData.id}</p>
                  <p><strong>ΥΠΟΒΟΛΗ:</strong> {planData.submittedAt || 'Πρόχειρο'}</p>
                </div>
              </div>

              <div className="text-center py-2 bg-amber-50 rounded border border-amber-300 font-sans">
                <h2 className="text-lg font-bold text-amber-900 uppercase">
                  ΕΚΘΕΣΗ ΠΡΟΓΡΑΜΜΑΤΙΣΜΟΥ ΣΧΟΛΙΚΗΣ ΜΟΝΑΔΑΣ
                </h2>
              </div>

              {/* Action Axes */}
              <div className="space-y-2 font-sans text-xs">
                <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-800">
                  1. ΑΞΟΝΕΣ ΔΡΑΣΗΣ & ΣΧΕΔΙΑ ΔΡΑΣΗΣ
                </h3>
                <table className="w-full border-collapse border border-slate-300 text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className="p-2 border border-slate-300">Άξονας</th>
                      <th className="p-2 border border-slate-300">Περιγραφή Δράσης</th>
                      <th className="p-2 border border-slate-300">Υπεύθυνος</th>
                      <th className="p-2 border border-slate-300">Προϋπολογισμός</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planData.targetAxes.map((axis, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-medium">{axis.axisTitle}</td>
                        <td className="p-2 border border-slate-300">{axis.actionDescription}</td>
                        <td className="p-2 border border-slate-300">{axis.responsiblePerson}</td>
                        <td className="p-2 border border-slate-300">{axis.budget} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Infrastructure Needs */}
              <div className="space-y-1 font-sans text-xs">
                <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-800">
                  2. ΚΤΙΡΙΑΚΕΣ & ΥΛΙΚΟΤΕΧΝΙΚΕΣ ΑΝΑΓΚΕΣ
                </h3>
                <p className="bg-slate-50 p-2.5 rounded border border-slate-200">{planData.infrastructureNeeds}</p>
              </div>

              {/* Educational Goals */}
              <div className="space-y-1 font-sans text-xs">
                <h3 className="font-bold border-b border-slate-300 pb-1 text-slate-800">
                  3. ΠΑΙΔΑΓΩΓΙΚΟΙ & ΔΙΔΑΚΤΙΚΟΙ ΣΤΟΧΟΙ
                </h3>
                <p className="bg-slate-50 p-2.5 rounded border border-slate-200">{planData.educationalGoals}</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-10 font-sans text-xs text-center">
                <div>
                  <p className="font-semibold text-slate-700">Ο/Η Επιθεωρητής / Σύμβουλος Εκπαίδευσης</p>
                  <div className="h-16"></div>
                  <p className="border-t border-slate-400 pt-1 text-slate-500">(Υπογραφή & Θεώρηση)</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Ο/Η Διευθυντής/ντρια Σχολικής Μονάδας</p>
                  <div className="h-16"></div>
                  <p className="border-t border-slate-400 pt-1 text-slate-800 font-bold">{planData.schoolName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
