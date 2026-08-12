/**
 * Safe API fetch wrapper that handles:
 * - Direct path: /api/route
 * - Relative path: api/route
 * - Query parameter routing fallback for PHP servers without mod_rewrite: api/index.php?route=route
 * - Handles non-JSON responses (HTML 404, PHP errors, maintenance pages) gracefully without JSON.parse crash.
 */
export const safeApiFetch = async (urlPath: string, options?: RequestInit) => {
  const cleanRoute = urlPath.replace(/^\/api\//, '').replace(/^api\//, '');
  const candidateUrls = [
    urlPath,
    urlPath.startsWith('/') ? urlPath.substring(1) : urlPath,
    `api/index.php?route=${cleanRoute}`,
    `./api/index.php?route=${cleanRoute}`
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
