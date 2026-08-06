import jsPDF from 'jspdf';
import { ROBOTO_REGULAR_B64, ROBOTO_BOLD_B64 } from './greekFontBase64';

let cachedRegBase64: string | null = ROBOTO_REGULAR_B64;
let cachedBoldBase64: string | null = ROBOTO_BOLD_B64;

export async function loadGreekFontToDoc(doc: jsPDF): Promise<boolean> {
  try {
    if (cachedRegBase64) {
      // Register font family 'Roboto'
      doc.addFileToVFS('Roboto-Regular.ttf', cachedRegBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'italic');

      // Register font family 'DejaVuSans' as alias
      doc.addFileToVFS('DejaVuSans.ttf', cachedRegBase64);
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');

      if (cachedBoldBase64) {
        doc.addFileToVFS('Roboto-Bold.ttf', cachedBoldBase64);
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bolditalic');

        doc.addFileToVFS('DejaVuSans-Bold.ttf', cachedBoldBase64);
        doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');
      } else {
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bolditalic');
      }

      doc.setFont('Roboto', 'normal');
      return true;
    }
  } catch (err) {
    console.warn('Could not load Greek TTF font into jsPDF:', err);
  }

  try {
    doc.setFont('helvetica', 'normal');
  } catch (e) {
    // ignore
  }
  return false;
}



