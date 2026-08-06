import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadGreekFontToDoc } from '../../utils/pdfFontLoader';
import {
  SchoolUser,
  SchoolCategory,
  NipMathData,
  EidNipMathData,
  DimMathData,
  EidMathData,
  DimEkpData,
  EidEkpData
} from './types';

// Helper to convert Greek text to uppercase without accents (rule in AGENTS.md)
export function toGreekUppercase(text: any): string {
  if (text === null || text === undefined) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Helper to safely format clean label and input cell values (ignoring any validation objects/extra metadata)
function getCleanCellVal(val: any, defaultVal: string = '0'): string {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'number') {
    return isNaN(val) ? defaultVal : String(val);
  }
  if (typeof val === 'string') {
    return val.replace(/<[^>]*>/g, '').trim() || defaultVal;
  }
  if (typeof val === 'object') {
    if (val.value !== undefined && val.value !== null) {
      return String(val.value);
    }
    if (val.text !== undefined && val.text !== null) {
      return String(val.text);
    }
    return defaultVal;
  }
  return String(val);
}

// Helper for text inputs / remarks fields (Parat)
function getCleanTextVal(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    return val.replace(/<[^>]*>/g, '').trim();
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (typeof val === 'object') {
    if (typeof val.text === 'string') return val.text.replace(/<[^>]*>/g, '').trim();
    if (typeof val.value === 'string') return val.value.replace(/<[^>]*>/g, '').trim();
    return '';
  }
  return String(val).trim();
}

// Helper to get school year string for the upcoming planning year (e.g. 2026-27)
export function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1..12
  // School year starts in September (month 9)
  const currentSchoolYearStart = month >= 9 ? year : year - 1;
  // Programmatismos creates planning for the upcoming school year (+1)
  const planningStartYear = currentSchoolYearStart + 1;
  const endYearShort = String(planningStartYear + 1).slice(-2);
  return `${planningStartYear}-${endYearShort}`;
}

// Convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const commaIdx = base64data.indexOf(',');
      resolve(commaIdx >= 0 ? base64data.substring(commaIdx + 1) : base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Initialize jsPDF with embedded Greek TTF font
async function preparePdfDoc(orientation: 'portrait' | 'landscape' = 'portrait'): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  await loadGreekFontToDoc(doc);
  return doc;
}

export async function exportProgrammatismosPdf(
  school: SchoolUser,
  category: SchoolCategory,
  mathData: any,
  ekpData: any,
  activeTab: 'math' | 'ekp' = 'math'
) {
  if (!school || !mathData) return;

  // Nipiagogeia only have student data (math)
  const effectiveTab = (category === 'nip' || category === 'eid_nip') ? 'math' : activeTab;

  try {
    // Timetable/Ekp exports MUST be in Landscape orientation
    const isLandscape = effectiveTab === 'ekp';
    const orientation = isLandscape ? 'landscape' : 'portrait';

    const doc = await preparePdfDoc(orientation);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    // Common Header
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(13);
    doc.text(toGreekUppercase('ΔΙΕΥΘΥΝΣΗ ΠΡΩΤΟΒΑΘΜΙΑΣ ΕΚΠΑΙΔΕΥΣΗΣ ΜΑΓΝΗΣΙΑΣ'), centerX, 14, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('Roboto', 'bold');
    const docTitle = effectiveTab === 'ekp'
      ? 'ΕΤΗΣΙΑ ΕΚΘΕΣΗ ΠΡΟΓΡΑΜΜΑΤΙΣΜΟΥ - ΩΡΑΡΙΟ & ΚΑΤΑΝΟΜΗ ΕΚΠΑΙΔΕΥΤΙΚΩΝ'
      : 'ΕΤΗΣΙΑ ΕΚΘΕΣΗ ΠΡΟΓΡΑΜΜΑΤΙΣΜΟΥ - ΜΑΘΗΤΙΚΟ ΔΥΝΑΜΙΚΟ & ΤΜΗΜΑΤΑ';
    doc.text(toGreekUppercase(docTitle), centerX, 21, { align: 'center' });

    // School Information Block
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);

    let curY = 30;
    doc.setFillColor(220, 220, 220); // Richer Grayscale
    doc.setDrawColor(128, 128, 128); // 50% tone border
    doc.setLineWidth(0.3);
    doc.roundedRect(14, curY, pageWidth - 28, 22, 2, 2, 'FD');

    doc.setFont('Roboto', 'bold');
    doc.text(`Σχολείο: ${getCleanTextVal(school.SchName)}`, 18, curY + 6);
    doc.setFont('Roboto', 'normal');
    doc.text(`Κωδικός ΥΠΑΙΘ: ${getCleanTextVal(school.SchCode)}`, 18, curY + 12);
    doc.text(`Διευθυντής/Προϊστάμενος: ${getCleanTextVal(school.PrName) || '-'}`, 18, curY + 17);

    const rightColX = centerX + 10;
    doc.text(`Οργανικότητα: ${getCleanCellVal(school.Organ)}θέσιο`, rightColX, curY + 12);
    doc.text(`Έδρα: ${getCleanTextVal(school.Location) || '-'}`, rightColX, curY + 17);

    curY += 28;

    // Grayscale AutoTable Header Style with 50% tone borders and richer header fill
    const grayscaleHeadStyles: any = { fillColor: [205, 205, 205], textColor: 0, font: 'Roboto', fontStyle: 'bold', lineColor: [128, 128, 128], lineWidth: 0.25 };
    const grayscaleTableStyles: any = { font: 'Roboto', fontStyle: 'normal', fontSize: 8.5, cellPadding: 2, textColor: 0, lineColor: [128, 128, 128], lineWidth: 0.25 };

    if (effectiveTab === 'math' || (effectiveTab as any) === 'all') {
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(10);
      doc.text(toGreekUppercase('1. ΜΑΘΗΤΙΚΟ ΔΥΝΑΜΙΚΟ & ΤΜΗΜΑΤΑ'), 14, curY);
      curY += 4;

      if (category === 'nip' || category === 'eid_nip') {
        const nipData = mathData as NipMathData | EidNipMathData;

        // Students & Morning Zone / All-day
        autoTable(doc, {
          startY: curY,
          head: [[toGreekUppercase('Κατηγορία'), toGreekUppercase('Προνήπια'), toGreekUppercase('Νήπια'), toGreekUppercase('Σύνολο')]],
          body: [
            ['Φοιτώντες Μαθητές', getCleanCellVal(nipData.StuA), getCleanCellVal(nipData.StuB), getCleanCellVal(nipData.StuTotal)],
            ['Ολοήμερο Τμήμα', getCleanCellVal(nipData.StuOloA), getCleanCellVal(nipData.StuOloB), getCleanCellVal(nipData.StuOloTotal)],
          ],
          theme: 'grid',
          headStyles: grayscaleHeadStyles,
          styles: grayscaleTableStyles
        });

        curY = ((doc as any).lastAutoTable?.finalY || curY) + 6;

        // Special structures
        autoTable(doc, {
          startY: curY,
          head: [[toGreekUppercase('Ειδική Δομή / Κατηγορία'), toGreekUppercase('Αριθμός Μαθητών')]],
          body: [
            ['Πρωινή Ζώνη', getCleanCellVal(nipData.StuPY)],
            ['Τμήμα Ένταξης (Μαθητές)', getCleanCellVal(nipData.StuTE)],
            ['Μαθητές χωρίς δυνατότητα Απορρόφησης', getCleanCellVal(nipData.StuApor)],
          ],
          theme: 'grid',
          headStyles: grayscaleHeadStyles,
          styles: grayscaleTableStyles
        });

        curY = ((doc as any).lastAutoTable?.finalY || curY) + 6;

        // Special Staff for Eidiko Nip
        if (category === 'eid_nip') {
          const eidNip = mathData as EidNipMathData;
          autoTable(doc, {
            startY: curY,
            head: [[toGreekUppercase('Ειδικότητα ΕΕΠ / ΕΒΠ'), 'ΔΕ1ΕΒΠ', 'ΠΕ21', 'ΠΕ23', 'ΠΕ25', 'ΠΕ26', 'ΠΕ28', 'ΠΕ29', 'ΠΕ30']],
            body: [
              [
                'Οργανικές / Θέσεις',
                getCleanCellVal(eidNip.DE1EVP),
                getCleanCellVal(eidNip.PE21),
                getCleanCellVal(eidNip.PE23),
                getCleanCellVal(eidNip.PE25),
                getCleanCellVal(eidNip.PE26),
                getCleanCellVal(eidNip.PE28),
                getCleanCellVal(eidNip.PE29),
                getCleanCellVal(eidNip.PE30)
              ]
            ],
            theme: 'grid',
            headStyles: grayscaleHeadStyles,
            styles: grayscaleTableStyles
          });
          curY = ((doc as any).lastAutoTable?.finalY || curY) + 6;
        }
      } else if (category === 'eid_dim') {
        const eidData = mathData as EidMathData;
        autoTable(doc, {
          startY: curY,
          head: [[toGreekUppercase('Τάξη / Κατηγορία'), 'Προπ.', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'ΣΤ', toGreekUppercase('Σύνολο')]],
          body: [
            ['Μαθητές', getCleanCellVal(eidData.StuProp), getCleanCellVal(eidData.StuA), getCleanCellVal(eidData.StuB), getCleanCellVal(eidData.StuC), getCleanCellVal(eidData.StuD), getCleanCellVal(eidData.StuE), getCleanCellVal(eidData.StuF), getCleanCellVal(eidData.StuTotal)],
            ['Τμήματα', getCleanCellVal(eidData.ClassProp), getCleanCellVal(eidData.ClassA), getCleanCellVal(eidData.ClassB), getCleanCellVal(eidData.ClassC), getCleanCellVal(eidData.ClassD), getCleanCellVal(eidData.ClassE), getCleanCellVal(eidData.ClassF), getCleanCellVal(eidData.ClassTotal)],
          ],
          theme: 'grid',
          headStyles: grayscaleHeadStyles,
          styles: grayscaleTableStyles
        });
        curY = ((doc as any).lastAutoTable?.finalY || curY) + 6;
      } else {
        // General Elementary (dim)
        const dimData = mathData as DimMathData;
        autoTable(doc, {
          startY: curY,
          head: [[toGreekUppercase('Τάξη / Κατηγορία'), 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'ΣΤ', toGreekUppercase('Σύνολο')]],
          body: [
            ['Μαθητές', getCleanCellVal(dimData.StuA), getCleanCellVal(dimData.StuB), getCleanCellVal(dimData.StuC), getCleanCellVal(dimData.StuD), getCleanCellVal(dimData.StuE), getCleanCellVal(dimData.StuF), getCleanCellVal(dimData.StuTotal)],
            ['Τμήματα', getCleanCellVal(dimData.ClassA), getCleanCellVal(dimData.ClassB), getCleanCellVal(dimData.ClassC), getCleanCellVal(dimData.ClassD), getCleanCellVal(dimData.ClassE), getCleanCellVal(dimData.ClassF), getCleanCellVal(dimData.ClassTotal)],
          ],
          theme: 'grid',
          headStyles: grayscaleHeadStyles,
          styles: grayscaleTableStyles
        });

        curY = ((doc as any).lastAutoTable?.finalY || curY) + 6;

        // Special structures & All-day
        const isExtended = Number(dimData.OloType) === 1;
        const oloTypeText = isExtended ? 'Διευρυμένου Προγράμματος' : 'Κλασικό';
        const oloRows: (string | number)[][] = [
          ['Τύπος Ολοήμερου', oloTypeText],
          ['Πρωινή Ζώνη Ολοημέρου (07:00 - 08:00)', getCleanCellVal(dimData.StuOloPZ)],
          [`Ολοήμερο (Αποχώρηση 1ης Ζώνης / ${isExtended ? '14:50' : '15:00'})`, getCleanCellVal(dimData.StuOloZ1)],
          [`Ολοήμερο (Αποχώρηση 2ης Ζώνης / ${isExtended ? '15:50' : '16:00'})`, getCleanCellVal(dimData.StuOloZ2)],
        ];

        if (isExtended) {
          oloRows.push([`Ολοήμερο (Αποχώρηση 3ης Ζώνης / 17:30)`, getCleanCellVal(dimData.StuOloZ3)]);
        }

        oloRows.push(
          ['Σύνολο Ολοημέρου', getCleanCellVal(dimData.StuOloTotal)],
          ['Τμήμα Ένταξης (Τ.Ε.)', getCleanCellVal(dimData.StuTE)],
          ['Τμήμα Υποδοχής (Τ.Υ. / Ζ.Ε.Π.)', getCleanCellVal(dimData.StuTY)],
          ['Κατ\' Οίκον Διδασκαλία', getCleanCellVal(dimData.StuKatOik)],
        );

        autoTable(doc, {
          startY: curY,
          head: [[toGreekUppercase('Ειδικές Δομές & Ολοήμερο'), toGreekUppercase('Μαθητές')]],
          body: oloRows,
          theme: 'grid',
          headStyles: grayscaleHeadStyles,
          styles: grayscaleTableStyles
        });

        curY = ((doc as any).lastAutoTable?.finalY || curY) + 6;
      }
    }

    // TAB 2 / LANDSCAPE: ΩΡΑΡΙΟ & ΚΑΤΑΝΟΜΗ ΕΚΠΑΙΔΕΥΤΙΚΩΝ
    if ((effectiveTab === 'ekp' || (effectiveTab as any) === 'all') && ekpData) {
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(10);
      doc.text(toGreekUppercase('2. ΩΡΑΡΙΟ & ΚΑΤΑΝΟΜΗ ΕΚΠΑΙΔΕΥΤΙΚΩΝ (ΩΡΕΣ)'), 14, curY);
      curY += 4;

      const ekp = ekpData as DimEkpData;

      autoTable(doc, {
        startY: curY,
        head: [[
          toGreekUppercase('Κατηγορία Ωρών'), 'ΠΕ70', 'ΠΕ05', 'ΠΕ06', 'ΠΕ07', 'ΠΕ08', 'ΠΕ11', 'ΠΕ79', 'ΠΕ86', 'ΠΕ91', toGreekUppercase('Σύνολο')
        ]],
        body: [
          ['Υποχρεωτικό Ωράριο', getCleanCellVal(ekp.DiaPE70), getCleanCellVal(ekp.DiaPE05), getCleanCellVal(ekp.DiaPE06), getCleanCellVal(ekp.DiaPE07), getCleanCellVal(ekp.DiaPE08), getCleanCellVal(ekp.DiaPE11), getCleanCellVal(ekp.DiaPE79), getCleanCellVal(ekp.DiaPE86), getCleanCellVal(ekp.DiaPE91), getCleanCellVal(ekp.DiaTotal)],
          ['Απαιτούμενο Ωράριο', getCleanCellVal(ekp.ProPE70), getCleanCellVal(ekp.ProPE05), getCleanCellVal(ekp.ProPE06), getCleanCellVal(ekp.ProPE07), getCleanCellVal(ekp.ProPE08), getCleanCellVal(ekp.ProPE11), getCleanCellVal(ekp.ProPE79), getCleanCellVal(ekp.ProPE86), getCleanCellVal(ekp.ProPE91), getCleanCellVal(ekp.ProTotal)],
          ['Ελεύθερη Ζώνη', getCleanCellVal(ekp.EZPE70), getCleanCellVal(ekp.EZPE05), getCleanCellVal(ekp.EZPE06), getCleanCellVal(ekp.EZPE07), getCleanCellVal(ekp.EZPE08), getCleanCellVal(ekp.EZPE11), getCleanCellVal(ekp.EZPE79), getCleanCellVal(ekp.EZPE86), getCleanCellVal(ekp.EZPE91), getCleanCellVal(ekp.EZTotal)],
          ['Πρόωρη Υποδοχή', getCleanCellVal(ekp.PYPE70), getCleanCellVal(ekp.PYPE05), getCleanCellVal(ekp.PYPE06), getCleanCellVal(ekp.PYPE07), getCleanCellVal(ekp.PYPE08), getCleanCellVal(ekp.PYPE11), getCleanCellVal(ekp.PYPE79), getCleanCellVal(ekp.PYPE86), getCleanCellVal(ekp.PYPE91), getCleanCellVal(ekp.PYTotal)],
          ['Ολοήμερο', getCleanCellVal(ekp.OloPE70), getCleanCellVal(ekp.OloPE05), getCleanCellVal(ekp.OloPE06), getCleanCellVal(ekp.OloPE07), getCleanCellVal(ekp.OloPE08), getCleanCellVal(ekp.OloPE11), getCleanCellVal(ekp.OloPE79), getCleanCellVal(ekp.OloPE86), getCleanCellVal(ekp.OloPE91), getCleanCellVal(ekp.OloTotal)],
          ['Σίτιση', getCleanCellVal(ekp.SitPE70), getCleanCellVal(ekp.SitPE05), getCleanCellVal(ekp.SitPE06), getCleanCellVal(ekp.SitPE07), getCleanCellVal(ekp.SitPE08), getCleanCellVal(ekp.SitPE11), getCleanCellVal(ekp.SitPE79), getCleanCellVal(ekp.SitPE86), getCleanCellVal(ekp.SitPE91), getCleanCellVal(ekp.SitTotal)],
          ['Βιβλιοθήκη', getCleanCellVal(ekp.BibPE70), getCleanCellVal(ekp.BibPE05), getCleanCellVal(ekp.BibPE06), getCleanCellVal(ekp.BibPE07), getCleanCellVal(ekp.BibPE08), getCleanCellVal(ekp.BibPE11), getCleanCellVal(ekp.BibPE79), getCleanCellVal(ekp.BibPE86), getCleanCellVal(ekp.BibPE91), getCleanCellVal(ekp.BibTotal)],
        ],
        theme: 'grid',
        headStyles: grayscaleHeadStyles,
        styles: grayscaleTableStyles
      });

      curY = ((doc as any).lastAutoTable?.finalY || curY) + 6;

      // Special Staff for Eidiko Dimotiko
      if ((category === 'eid_dim' || category === 'eid_nip') && ekpData) {
        const eidEkp = ekpData as EidEkpData;
        autoTable(doc, {
          startY: curY,
          head: [[toGreekUppercase('Ειδικότητα ΕΕΠ / ΕΒΠ'), 'ΔΕ1ΕΒΠ', 'ΠΕ21', 'ΠΕ23', 'ΠΕ25', 'ΠΕ26', 'ΠΕ28', 'ΠΕ29', 'ΠΕ30']],
          body: [
            [
              'Οργανικές / Θέσεις',
              getCleanCellVal(eidEkp.DE1EVP),
              getCleanCellVal(eidEkp.PE21),
              getCleanCellVal(eidEkp.PE23),
              getCleanCellVal(eidEkp.PE25),
              getCleanCellVal(eidEkp.PE26),
              getCleanCellVal(eidEkp.PE28),
              getCleanCellVal(eidEkp.PE29),
              getCleanCellVal(eidEkp.PE30)
            ]
          ],
          theme: 'grid',
          headStyles: grayscaleHeadStyles,
          styles: grayscaleTableStyles
        });
        curY = ((doc as any).lastAutoTable?.finalY || curY) + 6;
      }
    }

    // 1. Remarks Section
    const remarksRaw = (effectiveTab === 'ekp' ? ekpData?.Parat : mathData?.Parat);
    const remarksText = getCleanTextVal(remarksRaw);

    const remX = 14;
    const remWidth = pageWidth - 28;

    let splitRemarks: string[] = [];
    if (remarksText) {
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8.5);
      splitRemarks = doc.splitTextToSize(remarksText, remWidth);
    }

    const remarksHeight = remarksText && splitRemarks.length > 0 ? 5 + (splitRemarks.length * 4) : 5;
    const signatureHeight = school.PrName ? 28 : 22;
    const totalNeededHeight = remarksHeight + signatureHeight + 8;

    // Check page overflow for remarks & signature
    if (curY + totalNeededHeight > pageHeight - 15) {
      doc.addPage();
      curY = 20;
    } else {
      curY += 6;
    }

    // Draw Remarks
    const remY = curY;
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(9);
    doc.text('Παρατηρήσεις:', remX, remY);

    if (remarksText && splitRemarks.length > 0) {
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8.5);
      doc.text(splitRemarks, remX, remY + 5);
    }

    // 2. Signature Block on Right Side - Placed below the imaginary line of remarks
    const sigY = remY + remarksHeight + 6;
    const sigX = pageWidth - 85;

    const locationStr = getCleanTextVal(school.Location) || 'Βόλος';
    const dateStr = new Date().toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const titleText = (category === 'dim' || category === 'eid_dim')
      ? 'Ο Διευθυντής/-ντρια'
      : 'Ο Διευθυντής/-ντρια / Προϊστάμενος/-η';

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);
    doc.text(`${locationStr}, ${dateStr}`, sigX, sigY);

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(9.5);
    doc.text(titleText, sigX, sigY + 6);

    const principalName = getCleanTextVal(school.PrName);
    if (principalName) {
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(9.5);
      doc.text(principalName, sigX, sigY + 16);
    }

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(8);
    doc.text('(Υπογραφή & Σφραγίδα)', sigX, sigY + (principalName ? 22 : 16));

    // Direct download onto user's computer with School Year format 20XX-YY, tab and SchID
    const schoolYear = getCurrentSchoolYear();
    const schIdentifier = school.SchID || school.SchCode;
    doc.save(`Programmatismos_${schoolYear}_${effectiveTab}_${schIdentifier}.pdf`);
  } catch (err: any) {
    console.error('Error generating Programmatismos PDF:', err);
    const errorStr = err?.stack || err?.message || String(err);
    alert(`Προέκυψε σφάλμα κατά την παραγωγή του αρχείου PDF:\n\n${errorStr}`);
  }
}
