/**
 * Safe API fetch wrapper that handles:
 * - Direct path: /api/route
 * - Relative path: api/route
 * - Query parameter routing fallback for PHP servers without mod_rewrite: api/index.php?route=route
 * - Handles non-JSON responses (HTML 404, PHP errors, maintenance pages) gracefully without JSON.parse crash.
 */
export const safeApiFetch = async (urlPath: string, options?: RequestInit) => {
  const cleanRoute = urlPath.replace(/^\/api\//, '').replace(/^api\//, '');
  const [routePath, queryPart] = cleanRoute.split('?');
  const phpRoute = queryPart 
    ? `api/index.php?route=${routePath}&${queryPart}` 
    : `api/index.php?route=${routePath}`;
  const dotPhpRoute = queryPart 
    ? `./api/index.php?route=${routePath}&${queryPart}` 
    : `./api/index.php?route=${routePath}`;

  const candidateUrls = [
    urlPath,
    urlPath.startsWith('/') ? urlPath.substring(1) : urlPath,
    phpRoute,
    dotPhpRoute
  ];

  let lastError = '';
  for (const candidate of candidateUrls) {
    try {
      const res = await fetch(candidate, options);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (
          res.ok ||
          json.success !== undefined ||
          json.records !== undefined ||
          json.school !== undefined ||
          Array.isArray(json) ||
          json.columns !== undefined ||
          json.rows !== undefined ||
          json.isConnected !== undefined
        ) {
          return { ok: res.ok, data: json, status: res.status, rawText: text };
        }
      } catch (jsonErr) {
        lastError = text || `HTTP ${res.status} ${res.statusText}`;
      }
    } catch (netErr: any) {
      lastError = netErr.message || String(netErr);
    }
  }

  const cleanMsg = lastError.startsWith('<')
    ? `Μη έγκυρη απόκριση από το διακομιστή (HTML/PHP): ${lastError.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 140)}...`
    : (lastError || 'Σφάλμα επικοινωνίας με το διακομιστή');

  return { ok: false, data: { success: false, error: cleanMsg }, rawText: lastError };
};

/**
 * Downloads a CSV file from an API endpoint, handling candidate URLs,
 * ensuring UTF-8 BOM, and validating that the payload is actual CSV (not PHP code or HTML).
 */
export const downloadApiCsv = async (urlPath: string, fileName: string): Promise<boolean> => {
  const cleanRoute = urlPath.replace(/^\/api\//, '').replace(/^api\//, '');
  const [routePath, queryPart] = cleanRoute.split('?');
  const phpRoute = queryPart 
    ? `api/index.php?route=${routePath}&${queryPart}` 
    : `api/index.php?route=${routePath}`;
  const dotPhpRoute = queryPart 
    ? `./api/index.php?route=${routePath}&${queryPart}` 
    : `./api/index.php?route=${routePath}`;

  const candidateUrls = [
    urlPath,
    urlPath.startsWith('/') ? urlPath.substring(1) : urlPath,
    phpRoute,
    dotPhpRoute
  ];

  let lastError = '';
  for (const candidate of candidateUrls) {
    try {
      const res = await fetch(candidate);
      if (!res.ok) {
        lastError = `HTTP ${res.status} ${res.statusText}`;
        continue;
      }
      const text = await res.text();

      // Guard against Vite static file serving returning unparsed PHP source code or HTML
      if (text.startsWith('<?php') || text.includes('<?php') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        lastError = 'Ο διακομιστής επέστρεψε μη εκτελεσμένο κώδικα ή σελίδα HTML';
        continue;
      }

      // Check if response is a JSON error payload
      try {
        const json = JSON.parse(text);
        if (json && (json.error || json.success === false)) {
          alert(`Σφάλμα εξαγωγής CSV: ${json.error || 'Άγνωστο σφάλμα'}`);
          return false;
        }
      } catch (e) {
        // Expected for valid CSV text
      }

      let csvContent = text;
      if (!csvContent.trim()) {
        lastError = 'Κενό αρχείο εξαγωγής';
        continue;
      }

      // Prepend UTF-8 BOM for Greek character support in Excel
      if (!csvContent.startsWith('\uFEFF')) {
        csvContent = '\uFEFF' + csvContent;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (netErr: any) {
      lastError = netErr.message || String(netErr);
    }
  }

  alert(`Σφάλμα κατά την εξαγωγή του αρχείου CSV (${lastError || 'Αποτυχία σύνδεσης'})`);
  return false;
};

