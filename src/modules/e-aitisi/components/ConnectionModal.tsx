import React, { useState } from 'react';
import { Server, Cpu, Check, AlertCircle, RefreshCw, X, Terminal, Copy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { MysqlConfig } from '../types';
import { HARDCODED_DB_DEFAULTS } from '../../../config/dbDefaults';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MysqlConfig;
  onSaveConnection: (newConfig: Partial<MysqlConfig>) => Promise<boolean>;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose, config, onSaveConnection }) => {
  const [mode, setMode] = useState<'embedded' | 'external'>(config.mode === 'external' ? 'external' : 'external');
  const [host, setHost] = useState(config.host || HARDCODED_DB_DEFAULTS.host);
  const [port, setPort] = useState(config.port || HARDCODED_DB_DEFAULTS.port);
  const [user, setUser] = useState(config.user || HARDCODED_DB_DEFAULTS.user);
  const [password, setPassword] = useState(config.password !== undefined ? config.password : HARDCODED_DB_DEFAULTS.password);
  const [database, setDatabase] = useState(config.database || HARDCODED_DB_DEFAULTS.database);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTunnelHelper, setShowTunnelHelper] = useState(false);
  const [tunnelInput, setTunnelInput] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setHost(config.host || HARDCODED_DB_DEFAULTS.host);
      setPort(config.port || HARDCODED_DB_DEFAULTS.port);
      setUser(config.user || HARDCODED_DB_DEFAULTS.user);
      setPassword(config.password !== undefined ? config.password : HARDCODED_DB_DEFAULTS.password);
      setDatabase(config.database || HARDCODED_DB_DEFAULTS.database);
      setErrorMsg(null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleParseTunnel = () => {
    if (!tunnelInput.trim()) return;
    let raw = tunnelInput.trim().replace(/^(tcp|http|https|mysql):\/\//i, '');
    if (raw.includes('@')) {
      const parts = raw.split('@');
      raw = parts[parts.length - 1];
    }
    if (raw.includes(':')) {
      const [h, p] = raw.split(':');
      if (h) setHost(h);
      if (p && !isNaN(Number(p))) setPort(Number(p));
    } else {
      setHost(raw);
    }
    setTunnelInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const success = await onSaveConnection({
      mode,
      host,
      port: Number(port),
      user,
      password,
      database
    });

    setLoading(false);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Αποτυχία σύνδεσης στον MySQL Server. Ελέγξτε αν είναι ενεργό το ngrok tunnel και οι κωδικοί.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Σύνδεση MySQL / ngrok Tunnel</h3>
              <p className="text-[11px] text-slate-400">Ρύθμιση παραμέτρων διακομιστή</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs">
          
          {/* Mode Segmented Switch */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setMode('external')}
              className={`py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'external'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>External (ngrok)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('embedded')}
              className={`py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'embedded'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Embedded Sandbox</span>
            </button>
          </div>

          {mode === 'external' ? (
            <div className="space-y-3 animate-in fade-in duration-200">
              
              {/* Tunnel Paste Box */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-300">
                    Επικόλληση ngrok URL (Auto-Parse):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTunnelHelper(!showTunnelHelper)}
                    className="text-[10px] text-slate-400 hover:text-blue-300 flex items-center gap-0.5"
                  >
                    <span>{showTunnelHelper ? 'Απόκρυψη' : 'Εντολή ngrok'}</span>
                    {showTunnelHelper ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tunnelInput}
                    onChange={e => setTunnelInput(e.target.value)}
                    placeholder="π.χ. tcp://2.tcp.eu.ngrok.io:16641..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleParseTunnel}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shrink-0 transition-colors"
                  >
                    Εφαρμογή
                  </button>
                </div>

                {showTunnelHelper && (
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] space-y-1 mt-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Εντολή εκκίνησης ngrok στο PC:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('ngrok tcp 3306', 'ngrok')}
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copiedCmd === 'ngrok' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd === 'ngrok' ? 'Αντιγράφηκε' : 'Αντιγραφή'}</span>
                      </button>
                    </div>
                    <code className="block bg-black/60 text-emerald-400 p-1 rounded font-mono text-[10px]">
                      ngrok tcp 3306
                    </code>
                  </div>
                )}
              </div>

              {/* Host & Port */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Host / Domain</label>
                  <input
                    type="text"
                    value={host}
                    onChange={e => setHost(e.target.value)}
                    placeholder={HARDCODED_DB_DEFAULTS.host}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={e => setPort(Number(e.target.value))}
                    placeholder="3306"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={user}
                    onChange={e => setUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Default DB */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Προεπιλεγμένη Βάση (Default Database)</label>
                <input
                  type="text"
                  value={database}
                  onChange={e => setDatabase(e.target.value)}
                  placeholder="e_aitisi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl text-slate-300 space-y-1">
              <span className="font-bold text-cyan-300 block">Ενσωματωμένη ΒΔ Sandbox</span>
              <p className="text-[11px] text-slate-400">
                Ανεξάρτητη εκτέλεση στην μνήμη της εφαρμογής με προκατασκευασμένα δοκιμαστικά δεδομένα.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-[11px] text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{mode === 'embedded' ? 'Ενεργοποίηση Sandbox' : 'Αποθήκευση & Σύνδεση'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

