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

export async function loadGreekFontToDoc(doc: jsPDF): Promise<boolean> {
  try {
    if (!cachedRegBase64) {
      // 1. Try local static Roboto-Regular.ttf
      try {
        const res = await fetch('/fonts/Roboto-Regular.ttf');
        if (res.ok) {
          const buf = await res.arrayBuffer();
          // Verify it's not a huge variable font (>400KB usually indicates variable font)
          if (buf.byteLength > 5000) {
            cachedRegBase64 = arrayBufferToBase64(buf);
          }
        }
      } catch (e) {
        // ignore
      }

      // 2. Fallback to local DejaVuSans.ttf
      if (!cachedRegBase64) {
        try {
          const res = await fetch('/fonts/DejaVuSans.ttf');
          if (res.ok) {
            const buf = await res.arrayBuffer();
            if (buf.byteLength > 5000) {
              cachedRegBase64 = arrayBufferToBase64(buf);
            }
          }
        } catch (e) {
          // ignore
        }
      }

      // 3. Fallback to CDN static Roboto-Regular.ttf
      if (!cachedRegBase64) {
        try {
          const res = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
          if (res.ok) {
            const buf = await res.arrayBuffer();
            if (buf.byteLength > 5000) {
              cachedRegBase64 = arrayBufferToBase64(buf);
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (!cachedBoldBase64) {
      // 1. Try local static Roboto-Bold.ttf
      try {
        const res = await fetch('/fonts/Roboto-Bold.ttf');
        if (res.ok) {
          const buf = await res.arrayBuffer();
          if (buf.byteLength > 5000) {
            cachedBoldBase64 = arrayBufferToBase64(buf);
          }
        }
      } catch (e) {
        // ignore
      }

      // 2. Fallback to local DejaVuSans-Bold.ttf
      if (!cachedBoldBase64) {
        try {
          const res = await fetch('/fonts/DejaVuSans-Bold.ttf');
          if (res.ok) {
            const buf = await res.arrayBuffer();
            if (buf.byteLength > 5000) {
              cachedBoldBase64 = arrayBufferToBase64(buf);
            }
          }
        } catch (e) {
          // ignore
        }
      }

      // 3. Fallback to CDN static Roboto-Medium.ttf
      if (!cachedBoldBase64) {
        try {
          const res = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf');
          if (res.ok) {
            const buf = await res.arrayBuffer();
            if (buf.byteLength > 5000) {
              cachedBoldBase64 = arrayBufferToBase64(buf);
            }
          }
        } catch (e) {
          // ignore
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
    }
  } catch (err) {
    console.warn('Could not load Greek TTF font into jsPDF:', err);
  }
  return false;
}

