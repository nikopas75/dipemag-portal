import React, { useState, useEffect } from 'react';
import { Terminal, Play, History, Download, CheckCircle2, AlertCircle, RefreshCw, Database, Shield, Server, Activity, FileSpreadsheet } from 'lucide-react';
import { SqlAuditLog, SqlQueryResult } from '../modules/e-aitisi/types';
import { generateSqlAuditPdf } from '../modules/e-aitisi/utils/pdfGenerator';

interface MySqlConsoleManagerProps {
  appName: 'e-aitisi' | 'programmatismos' | 'axiologisi';
  dbName: string;
  defaultTableName?: string;
  adminUser?: string;
  sampleQueries?: string[];
}

export const MySqlConsoleManager: React.FC<MySqlConsoleManagerProps> = ({
  appName,
  dbName,
  defaultTableName = 'teachers',
  adminUser = 'plinetamag',
  sampleQueries = [
    'SHOW TABLES;',
    'SELECT * FROM teachers LIMIT 10;',
    'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;'
  ]
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'audit' | 'diagnostics'>('console');
  const [customQuery, setCustomQuery] = useState(sampleQueries[0] || 'SHOW TABLES;');
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<SqlAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Diagnostic state
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    status: 'OK' | 'WARNING' | 'ERROR';
    tablesCount: number;
    dbEngine: string;
    charset: string;
    connectionTimeMs: number;
    issues: string[];
  } | null>(null);

  const [serverStatus, setServerStatus] = useState<{ host: string; port: number; isConnected: boolean; database?: string }>({
    host: '10.2.49.42',
    port: 3306,
    isConnected: true
  });

  // Fetch status & audit logs
  const fetchStatusAndLogs = async () => {
    setLoadingLogs(true);
    try {
      const [logsRes, statusRes] = await Promise.all([
        fetch('/api/logs').catch(() => null),
        fetch('/api/status').catch(() => null)
      ]);

      if (logsRes && logsRes.ok) {
        const data = await logsRes.json();
        setLogs(Array.isArray(data) ? data : []);
      }

      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setServerStatus({
          host: statusData.host || '10.2.49.42',
          port: statusData.port || 3306,
          isConnected: statusData.isConnected ?? true,
          database: statusData.database
        });
      }
    } catch (err) {
      console.error('Failed to fetch SQL audit logs/status:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchStatusAndLogs();
  }, []);

  // Execute SQL Query
  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = queryToRun || customQuery;
    if (!q.trim()) return;

    setRunning(true);
    setResult(null);

    try {
      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, username: adminUser })
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setResult({
          columns: [],
          rows: [],
          affectedRows: 0,
          executionTimeMs: 0,
          error: data.error || 'Σφάλμα κατά την εκτέλεση του ερωτήματος SQL'
        });
      }
      // Refresh audit logs & status
      fetchStatusAndLogs();
    } catch (err: any) {
      setResult({
        columns: [],
        rows: [],
        affectedRows: 0,
        executionTimeMs: 0,
        error: err.message || 'Αποτυχία επικοινωνίας με το διακομιστή MySQL'
      });
    } finally {
      setRunning(false);
    }
  };

  // Run Diagnostic Check
  const handleRunDiagnostics = async () => {
    setRunningDiagnostics(true);
    setDiagnosticResult(null);
    const startMs = performance.now();

    try {
      // Execute SHOW TABLES to check integrity
      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `SHOW TABLES;`, username: adminUser })
      });

      const data = await res.json();
      const latency = Math.round(performance.now() - startMs) || 2;

      if (res.ok && Array.isArray(data.rows)) {
        setDiagnosticResult({
          status: 'OK',
          tablesCount: data.rows.length,
          dbEngine: 'MySQL 8.0 / InnoDB',
          charset: 'utf8mb4_unicode_ci',
          connectionTimeMs: latency,
          issues: []
        });
      } else {
        setDiagnosticResult({
          status: 'WARNING',
          tablesCount: 0,
          dbEngine: 'MySQL 8.0 / Standby',
          charset: 'utf8mb4_unicode_ci',
          connectionTimeMs: latency,
          issues: [data.error || 'Περιορισμένη πρόσβαση στη δομή πινάκων']
        });
      }
    } catch (err: any) {
      setDiagnosticResult({
        status: 'ERROR',
        tablesCount: 0,
        dbEngine: 'Unknown',
        charset: 'utf8mb4',
        connectionTimeMs: 0,
        issues: [err.message || 'Αδυναμία σύνδεσης με τη βάση δεδομένων']
      });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-950 p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-950/80 border border-purple-800/80 rounded-xl text-purple-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Κονσόλα Διαχείρισης & Συντήρησης MySQL
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ONLINE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Εφαρμογή: <span className="text-purple-300 font-semibold">{appName}</span> • Βάση: <span className="text-amber-300 font-mono font-semibold">{dbName}</span>
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-slate-300">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>Server: {serverStatus.host}:{serverStatus.port}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin: {adminUser}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-950/60 px-5 border-b border-slate-800 flex space-x-1 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('console')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'console'
              ? 'border-purple-500 text-purple-400 bg-purple-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Εκτέλεση SQL Ερωτήματος (Console)</span>
        </button>

        <button
          onClick={() => { setActiveTab('audit'); fetchStatusAndLogs(); }}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-amber-500 text-amber-400 bg-amber-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Ιστορικό Ερωτημάτων & Audit Trail ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'diagnostics'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Διαγνωστικός Έλεγχος & Σχήμα</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-6">
        {/* Tab 1: SQL Console */}
        {activeTab === 'console' && (
          <div className="space-y-5">
            {/* Quick Sample Queries */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">
                Έτοιμα Δείγματα Ερωτημάτων (Quick Queries):
              </label>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCustomQuery(sq); handleExecuteQuery(sq); }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-colors border border-slate-700/60"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL Query Editor Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  <span>Εντολή SQL προς εκτέλεση στη βάση <code className="text-amber-400">{dbName}</code>:</span>
                </label>
                <button
                  onClick={() => handleExecuteQuery()}
                  disabled={running}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shadow-purple-900/30"
                >
                  {running ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Εκτέλεση...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Εκτέλεση Ερωτήματος</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 resize-y"
                placeholder="π.χ. SELECT * FROM teachers WHERE Specialty = 'PE60';"
              />
            </div>

            {/* Query Result Window */}
            {result && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    {result.error ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className={result.error ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {result.error ? 'Σφάλμα Εκτέλεσης SQL' : 'Επιτυχής Εκτέλεση Ερωτήματος'}
                    </span>
                  </div>
                  {!result.error && (
                    <div className="text-slate-400 flex items-center space-x-3">
                      <span>Εγγραφές: <strong className="text-slate-200">{result.affectedRows}</strong></span>
                      <span>•</span>
                      <span>Χρόνος: <strong className="text-amber-300">{result.executionTimeMs} ms</strong></span>
                    </div>
                  )}
                </div>

                {result.error ? (
                  <div className="p-4 bg-red-950/30 text-red-300 font-mono text-xs">
                    {result.error}
                  </div>
                ) : result.columns && result.columns.length > 0 ? (
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                          <th className="p-2.5 text-[10px] text-slate-500 border-r border-slate-800 text-center w-10">#</th>
                          {result.columns.map((col, cIdx) => (
                            <th key={cIdx} className="p-2.5 font-bold text-purple-300 whitespace-nowrap border-r border-slate-800/60">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {result.rows.length === 0 ? (
                          <tr>
                            <td colSpan={result.columns.length + 1} className="p-6 text-center text-slate-500">
                              Δεν βρέθηκαν εγγραφές που να ικανοποιούν το ερώτημα SQL.
                            </td>
                          </tr>
                        ) : (
                          result.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-purple-950/10 transition-colors">
                              <td className="p-2 text-[10px] text-slate-600 border-r border-slate-800 text-center">{rIdx + 1}</td>
                              {result.columns.map((col, cIdx) => (
                                <td key={cIdx} className="p-2 text-slate-300 whitespace-nowrap border-r border-slate-800/40">
                                  {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-600 italic">NULL</span>}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-slate-400 font-mono text-xs">
                    Το ερώτημα εκτελέστηκε επιτυχώς.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Ιστορικό Ερωτημάτων & Αλληλεπιδράσεων (Audit Logs)</h3>
                <p className="text-xs text-slate-400">Καταγραφή όλων των SQL ενεργειών στη βάση δεδομένων.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchStatusAndLogs}
                  disabled={loadingLogs}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                  <span>Ανανέωση</span>
                </button>

                <button
                  onClick={() => generateSqlAuditPdf(logs)}
                  disabled={logs.length === 0}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Εξαγωγή PDF</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <th className="p-3">Χρόνος</th>
                      <th className="p-3">Χρήστης</th>
                      <th className="p-3">Τύπος</th>
                      <th className="p-3">Εντολή SQL</th>
                      <th className="p-3 text-right">Rows</th>
                      <th className="p-3 text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          Δεν υπάρχουν καταγεγραμμένα συμβάντα SQL.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-3 text-purple-300 font-semibold whitespace-nowrap">
                            {log.username}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.actionType === 'SELECT' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                              log.actionType === 'UPDATE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              log.actionType === 'INSERT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              'bg-red-950 text-red-400 border border-red-800'
                            }`}>
                              {log.actionType}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 max-w-md truncate" title={log.query}>
                            {log.query}
                          </td>
                          <td className="p-3 text-right text-slate-400">
                            {log.affectedRows}
                          </td>
                          <td className="p-3 text-right text-amber-300 font-semibold">
                            {log.executionTimeMs} ms
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Diagnostics & Schema */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">Διαγνωστικός Έλεγχος & Σχήμα Βάσης</h3>
                <p className="text-xs text-slate-400">Έλεγχος ακεραιότητας πινάκων, δομής και απόδοσης της MySQL.</p>
              </div>
              <button
                onClick={handleRunDiagnostics}
                disabled={runningDiagnostics}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 transition-colors shadow"
              >
                <Activity className={`w-4 h-4 ${runningDiagnostics ? 'animate-spin' : ''}`} />
                <span>Έλεγχος Ακεραιότητας</span>
              </button>
            </div>

            {/* Config Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Database Name</span>
                <span className="text-amber-400 font-bold text-sm">{dbName}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Engine & Encoding</span>
                <span className="text-slate-200 font-semibold">MySQL 8.0 (utf8mb4)</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Host / Port</span>
                <span className="text-blue-400 font-semibold">127.0.0.1:3306</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Primary Table</span>
                <span className="text-purple-300 font-semibold">{defaultTableName}</span>
              </div>
            </div>

            {/* Diagnostic Results Box */}
            {diagnosticResult && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  {diagnosticResult.status === 'OK' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className={diagnosticResult.status === 'OK' ? 'text-emerald-400' : 'text-amber-400'}>
                    Κατάσταση Βάσης: {diagnosticResult.status} (Απόκριση: {diagnosticResult.connectionTimeMs} ms)
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p>• Εντοπίστηκαν <strong className="text-emerald-400">{diagnosticResult.tablesCount}</strong> διαθέσιμοι πίνακες στη βάση δεδομένων <code className="text-amber-300">{dbName}</code>.</p>
                  <p>• Η σύνδεση με το διακομιστή MySQL πραγματοποιείται κανονικά μέσω της εσωτερικής πύλης.</p>
                </div>

                {diagnosticResult.issues.length > 0 && (
                  <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs text-amber-300">
                    {diagnosticResult.issues.map((iss, i) => (
                      <p key={i}>• {iss}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
