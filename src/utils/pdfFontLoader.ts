import jsPDF from 'jspdf';

let cachedRegBase64: string | null = null;
let cachedBoldBase64: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}

function isValidTtfFont(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 5000) return false;
  const bytes = new Uint8Array(buffer, 0, 4);
  // HTML '<' (0x3C), JSON '{' (0x7B), or whitespace (0x20, 0x0A, 0x0D)
  if (bytes[0] === 0x3c || bytes[0] === 0x7b || bytes[0] === 0x20 || bytes[0] === 0x0a || bytes[0] === 0x0d) {
    return false;
  }
  // Standard TTF / OTF magic bytes check:
  // 0x00010000 -> TrueType v1.0
  // 0x74727565 -> 'true'
  // 0x4F54544F -> 'OTTO'
  const isTtf = (bytes[0] === 0x00 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00) ||
                (bytes[0] === 0x74 && bytes[1] === 0x72 && bytes[2] === 0x75 && bytes[3] === 0x65) ||
                (bytes[0] === 0x4f && bytes[1] === 0x54 && bytes[2] === 0x54 && bytes[3] === 0x4f);
  return isTtf;
}

async function fetchValidFontBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      return null;
    }
    const buf = await res.arrayBuffer();
    if (isValidTtfFont(buf)) {
      return arrayBufferToBase64(buf);
    }
  } catch (e) {
    // Network or CORS error
  }
  return null;
}

export async function loadGreekFontToDoc(doc: jsPDF): Promise<boolean> {
  try {
    if (!cachedRegBase64) {
      const regUrls = [
        '/fonts/Roboto-Regular.ttf',
        './fonts/Roboto-Regular.ttf',
        '/fonts/DejaVuSans.ttf',
        './fonts/DejaVuSans.ttf',
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/static/Roboto-Regular.ttf'
      ];
      for (const url of regUrls) {
        const b64 = await fetchValidFontBase64(url);
        if (b64) {
          cachedRegBase64 = b64;
          break;
        }
      }
    }

    if (!cachedBoldBase64) {
      const boldUrls = [
        '/fonts/Roboto-Bold.ttf',
        './fonts/Roboto-Bold.ttf',
        '/fonts/DejaVuSans-Bold.ttf',
        './fonts/DejaVuSans-Bold.ttf',
        'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/static/Roboto-Bold.ttf'
      ];
      for (const url of boldUrls) {
        const b64 = await fetchValidFontBase64(url);
        if (b64) {
          cachedBoldBase64 = b64;
          break;
        }
      }
    }

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
    } else {
      // Safe fallback: map 'Roboto' font name to built-in 'helvetica' so autoTable and doc.setFont('Roboto') won't crash
      try {
        doc.addFont('helvetica', 'Roboto', 'normal');
        doc.addFont('helvetica', 'Roboto', 'bold');
        doc.addFont('helvetica', 'Roboto', 'italic');
        doc.addFont('helvetica', 'Roboto', 'bolditalic');
      } catch (e) {
        // ignore
      }
      doc.setFont('helvetica', 'normal');
      return false;
    }
  } catch (err) {
    console.warn('Could not load Greek TTF font into jsPDF:', err);
    try {
      doc.addFont('helvetica', 'Roboto', 'normal');
      doc.addFont('helvetica', 'Roboto', 'bold');
    } catch (e) {
      // ignore
    }
    doc.setFont('helvetica', 'normal');
  }
  return false;
}


