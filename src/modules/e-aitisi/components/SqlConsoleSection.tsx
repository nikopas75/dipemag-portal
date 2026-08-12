import React, { useState } from 'react';
import { Terminal, Play, History, Download, CheckCircle2, AlertCircle, RefreshCw, Code2, Database } from 'lucide-react';
import { SqlAuditLog, SqlQueryResult } from '../types';
import { generateSqlAuditPdf } from '../utils/pdfGenerator';

interface SqlConsoleSectionProps {
  logs: SqlAuditLog[];
  currentAdminUser?: string;
  onExecuteQuery: (query: string) => Promise<SqlQueryResult>;
  onRefreshLogs: () => void;
}

export const SqlConsoleSection: React.FC<SqlConsoleSectionProps> = ({
  logs,
  currentAdminUser = 'plinetamag',
  onExecuteQuery,
  onRefreshLogs
}) => {
  const [customQuery, setCustomQuery] = useState('SELECT * FROM e_aitisi.teachers LIMIT 10;');
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRunQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    setRunning(true);
    setResult(null);

    const res = await onExecuteQuery(customQuery);
    setResult(res);
    setRunning(false);
    onRefreshLogs();
  };

  const sampleQueries = [
    'SELECT * FROM e_aitisi.teachers LIMIT 10;',
    'SELECT ΑρΜητρ, ΑΦΜ, Επώνυμο, Όνομα, Ειδικότητα FROM e_aitisi.teachers;',
    'SHOW TABLES IN e_aitisi;',
    'SELECT * FROM audit_logs ORDER BY timestamp DESC;'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Terminal Input Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Interactive MySQL Query Terminal</h3>
              <p className="text-xs text-slate-400">
                Execute SQL DQL & DML commands against the active database storage engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-800">
            <Database className="w-3.5 h-3.5" />
            <span>Session: {currentAdminUser}</span>
          </div>
        </div>

        <form onSubmit={handleRunQuery} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                SQL Command Statement
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Quick Snippets:</span>
                {sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomQuery(q)}
                    className="text-[10px] font-mono bg-slate-950 hover:bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-800 transition-colors"
                  >
                    Query #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-purple-500 shadow-inner"
                placeholder="Write standard MySQL queries (e.g. SELECT, UPDATE, INSERT)..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-mono">
              Press Run to dispatch transaction to Express / MySQL pool.
            </p>
            <button
              type="submit"
              disabled={running}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all text-sm disabled:opacity-50"
            >
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Execute SQL Query</span>
            </button>
          </div>
        </form>

        {/* Query Output Table */}
        {result && (
          <div className="mt-8 pt-6 border-t border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {result.error ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                <h4 className="text-sm font-bold text-white font-mono">
                  {result.error ? 'Query Execution Error' : `Query Result Set (${result.rows?.length || 0} rows returned)`}
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Latency: <span className="text-cyan-400 font-bold">{result.executionTimeMs}ms</span> | Affected Rows:{' '}
                <span className="text-emerald-400 font-bold">{result.affectedRows || 0}</span>
              </span>
            </div>

            {result.error ? (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-xs font-mono text-red-300">
                {result.error}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                      {result.columns.map((col, idx) => (
                        <th key={idx} className="py-3 px-4">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {result.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                        {result.columns.map((col, cIdx) => (
                          <td key={cIdx} className="py-3 px-4 text-slate-300">
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {result.rows.length === 0 && (
                      <tr>
                        <td colSpan={result.columns.length || 1} className="py-6 text-center text-slate-500">
                          Query completed successfully with empty result set.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit Log Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Live MySQL Query Audit Trail</h3>
              <p className="text-xs text-slate-400">
                All SELECT, UPDATE, INSERT, and DELETE mutations recorded in chronological order
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onRefreshLogs}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
              title="Refresh Audit Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => generateSqlAuditPdf(logs)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl transition-all text-xs shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Export Audit Trail PDF</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
          {logs.map(l => (
            <div
              key={l.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start space-x-3 overflow-hidden">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                    l.actionType === 'SELECT'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : l.actionType === 'UPDATE' || l.actionType === 'INSERT'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : l.actionType === 'DELETE'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}
                >
                  {l.actionType}
                </span>
                <div className="overflow-hidden">
                  <p className="text-slate-200 truncate">{l.query}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Actor: <span className="text-cyan-400">{l.username}</span> • Latency:{' '}
                    <span className="text-slate-300">{l.executionTimeMs}ms</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  {l.affectedRows} rows affected
                </span>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center py-8 text-slate-500 font-sans">No SQL audit events recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
