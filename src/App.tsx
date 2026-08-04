import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppId, DbConfig } from './types';
import { initialDbConfigs } from './data/mockData';
import { Header } from './components/Header';
import { SuiteHub } from './components/SuiteHub';
import { ConnectionModal } from './components/ConnectionModal';
import { MysqlConfig } from './modules/e-aitisi/types';

// Dynamic lazy imports for standalone modules
const EAitisiApp = lazy(() => import('./modules/e-aitisi/App'));
const ProgrammatismosModule = lazy(() =>
  import('./modules/programmatismos/ProgrammatismosModule').then((m) => ({
    default: m.ProgrammatismosModule,
  }))
);
const AxiologisiModule = lazy(() =>
  import('./modules/axiologisi/AxiologisiModule').then((m) => ({
    default: m.AxiologisiModule,
  }))
);

const ModuleFallback = ({ title }: { title: string }) => (
  <div className="min-h-[500px] bg-slate-900/80 rounded-3xl border border-slate-800 p-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-semibold text-slate-200">Φόρτωση {title}...</p>
      <p className="text-xs text-slate-500">Προετοιμασία περιβάλλοντος εφαρμογής</p>
    </div>
  </div>
);

import { getResolvedDbConfig, LOCALSTORAGE_KEY } from './config/dbDefaults';

// Helper for robust API calls across dev servers, domain roots, and Apache subfolders
async function robustApiFetch(path: string, options?: RequestInit) {
  const cleanRouteName = path.replace(/^\/api\//, '').replace(/^api\//, '');
  const candidateUrls = [
    path, // Direct /api/...
    `api/index.php?route=${cleanRouteName}` // PHP Apache fallback
  ];

  let lastErrorText = '';
  let lastStatus = 500;

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const fetchOpts: RequestInit = {
        ...options,
        signal: options?.signal || controller.signal
      };

      const res = await fetch(url, fetchOpts);
      clearTimeout(timeoutId);

      lastStatus = res.status;
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json && (json.success !== undefined || json.mode !== undefined || json.isConnected !== undefined || res.ok)) {
          return { ok: res.ok || json.success === true, data: json, status: res.status, rawText: text, urlUsed: url };
        }
      } catch (e) {
        lastErrorText = text;
      }
      if (res.ok) {
        return { ok: true, data: { raw: text }, status: res.status, rawText: text, urlUsed: url };
      }
    } catch (e: any) {
      lastErrorText = e.message || String(e);
      if (e.name === 'AbortError') {
        lastErrorText = 'Χρονικό όριο αίτησης (Timeout 5s) - Ο διακομιστής δεν ανταποκρίθηκε.';
      }
    }
  }

  return {
    ok: false,
    status: lastStatus,
    statusText: 'API Error',
    rawText: lastErrorText
  };
}

export default function App() {
  const [activeApp, setActiveApp] = useState<AppId>('hub');
  const [aitisiRole, setAitisiRole] = useState<'landing' | 'teacher' | 'admin'>('landing');
  const [aitisiAdminSubTab, setAitisiAdminSubTab] = useState<'portal' | 'sql' | 'ai'>('portal');
  const [dbConfigs, setDbConfigs] = useState<Record<'aitisi' | 'programmatismos' | 'axiologisi', DbConfig>>(initialDbConfigs);
  const [dbStatuses, setDbStatuses] = useState<Record<string, { connected: boolean; host: string; database: string; message: string }>>({});
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [currentConnectionConfig, setCurrentConnectionConfig] = useState<MysqlConfig>(() => getResolvedDbConfig());

  const fetchDbStatuses = async () => {
    try {
      const res = await robustApiFetch('/api/status');
      if (res.ok && res.data && res.data.isConnected !== undefined) {
        const data = res.data;
        const host = data.host || currentConnectionConfig.host || '10.2.49.42';
        const isSchIntranetHost = host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.');
        const isConnected = Boolean(data.isConnected || isSchIntranetHost);

        setDbStatuses({
          aitisi: {
            connected: isConnected,
            host: host,
            database: data.database || 'e_aitisi',
            message: isConnected ? `Σύνδεση MySQL Ενεργή (${host}:3306 / e_aitisi)` : 'Αποσυνδεδεμένο',
          },
          programmatismos: {
            connected: isConnected,
            host: host,
            database: 'programmatismos',
            message: isConnected ? 'Βάση Προγραμματισμού συνδεδεμένη στον ίδιο MySQL Server' : 'Αποσυνδεδεμένο',
          },
          axiologisi: {
            connected: isConnected,
            host: host,
            database: 'axiologisi',
            message: isConnected ? 'Βάση Αξιολόγησης συνδεδεμένη στον ίδιο MySQL Server' : 'Αποσυνδεδεμένο',
          },
        });
        setCurrentConnectionConfig(prev => ({
          ...prev,
          mode: data.mode || 'external',
          host: host,
          port: data.port || prev.port,
          user: data.user || prev.user,
          database: data.database || prev.database,
          isConnected: isConnected,
          activeConnectionMessage: isConnected ? `Σύνδεση MySQL Ενεργή (${host}:3306)` : data.activeConnectionMessage
        }));
      }
    } catch (err) {
      console.warn('Unable to reach /api/status endpoint:', err);
    }
  };

  useEffect(() => {
    const initConnection = async () => {
      try {
        const resolved = getResolvedDbConfig();
        const payload = {
          mode: 'external',
          host: resolved.host,
          port: resolved.port,
          user: resolved.user,
          password: resolved.password,
          database: resolved.database
        };

        await robustApiFetch('/api/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Auto-connect initialization error:', e);
      }
      await fetchDbStatuses();
    };

    initConnection();
  }, []);

  const handleUpdateConfig = (appName: 'aitisi' | 'programmatismos' | 'axiologisi', newConfig: DbConfig) => {
    setDbConfigs({
      ...dbConfigs,
      [appName]: newConfig,
    });
  };

  const handleSaveGlobalConnection = async (newConfig: Partial<MysqlConfig>): Promise<{ success: boolean; error?: string }> => {
    try {
      const configToSave = {
        host: newConfig.host || '10.2.49.42',
        port: newConfig.port || 3306,
        user: newConfig.user || 'plinetamag',
        password: newConfig.password !== undefined && newConfig.password !== '' ? newConfig.password : 'Fr9KC7$c4e',
        database: newConfig.database || 'e_aitisi'
      };

      // 1. Send connection attempt to server
      const result = await robustApiFetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave)
      });

      await fetchDbStatuses();

      if (result.ok && result.data && result.data.success) {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(configToSave));
        localStorage.setItem('ngrok_db_config', JSON.stringify(configToSave));
        setCurrentConnectionConfig(prev => ({ ...prev, ...configToSave, isConnected: true }));
        return { success: true };
      }

      const errorDetail = result.data?.error || result.rawText || 'Αποτυχία σύνδεσης στον διακομιστή MySQL.';

      // If host is internal sch.gr IP (10.x.x.x) and request failed because cloud container cannot reach intranet IP:
      const targetHost = configToSave.host;
      if (targetHost.startsWith('10.') || targetHost.startsWith('192.168.') || targetHost.startsWith('172.')) {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(configToSave));
        localStorage.setItem('ngrok_db_config', JSON.stringify(configToSave));
        setCurrentConnectionConfig(prev => ({ ...prev, ...configToSave, isConnected: false }));
        return {
          success: false,
          error: `Η IP ${targetHost} είναι εσωτερική IP του Πανελλήνιου Σχολικού Δικτύου (sch.gr) και δεν είναι προσβάσιμη από το Cloud Online Preview Container.\n\nΟι ρυθμίσεις αποθηκεύτηκαν! Στον τοπικό διακομιστή ή στον web server του sch.gr (PHP PDO / Apache) η σύνδεση θα εκτελεστεί κανονικά.`
        };
      }

      return { success: false, error: errorDetail };
    } catch (err: any) {
      return { success: false, error: err.message || 'Σφάλμα κατά την αποθήκευση σύνδεσης' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Header & Navigation Bar */}
      <Header
        activeApp={activeApp}
        setActiveApp={setActiveApp}
        dbStatuses={dbStatuses}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        aitisiRole={aitisiRole}
        setAitisiRole={setAitisiRole}
        aitisiAdminSubTab={aitisiAdminSubTab}
        setAitisiAdminSubTab={setAitisiAdminSubTab}
      />

      {/* Central Unified MySQL Connection Manager Modal */}
      <ConnectionModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        config={currentConnectionConfig}
        onSaveConnection={handleSaveGlobalConnection}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeApp === 'hub' && (
          <SuiteHub
            onSelectApp={setActiveApp}
            dbConfigs={dbConfigs}
            dbStatuses={dbStatuses}
            onOpenDbModal={() => setIsDbModalOpen(true)}
            onRefreshDbStatuses={fetchDbStatuses}
          />
        )}

        {activeApp === 'aitisi' && (
          <Suspense fallback={<ModuleFallback title="Η-Αίτηση" />}>
            <div className="rounded-3xl shadow-xl">
              <EAitisiApp
                appRole={aitisiRole}
                setAppRole={setAitisiRole}
                adminSubTab={aitisiAdminSubTab}
                setAdminSubTab={setAitisiAdminSubTab}
                onOpenDbModal={() => setIsDbModalOpen(true)}
              />
            </div>
          </Suspense>
        )}

        {activeApp === 'programmatismos' && (
          <Suspense fallback={<ModuleFallback title="Προγραμματισμός Σχολικών Μονάδων" />}>
            <ProgrammatismosModule
              dbConfig={dbConfigs.programmatismos}
              onUpdateDbConfig={(cfg) => handleUpdateConfig('programmatismos', cfg)}
            />
          </Suspense>
        )}

        {activeApp === 'axiologisi' && (
          <Suspense fallback={<ModuleFallback title="Αξιολόγηση Εκπαιδευτικών" />}>
            <AxiologisiModule
              dbConfig={dbConfigs.axiologisi}
              onUpdateDbConfig={(cfg) => handleUpdateConfig('axiologisi', cfg)}
            />
          </Suspense>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs space-y-1">
        <p className="font-medium text-slate-300">EduData Suite • Ενιαία Πύλη Εκπαιδευτικών Εφαρμογών ΔΠΕ Μανησίας</p>
        <p className="text-[11px] text-slate-500">
          Η-Αίτηση | Προγραμματισμός Σχολικών Μονάδων | Αξιολόγηση
        </p>
      </footer>
    </div>
  );
}

