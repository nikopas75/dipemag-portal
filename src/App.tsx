import React, { useState, useEffect } from 'react';
import { AppId, DbConfig } from './types';
import { initialDbConfigs } from './data/mockData';
import { Header } from './components/Header';
import { SuiteHub } from './components/SuiteHub';
import { ConnectionModal } from './components/ConnectionModal';
import { MysqlConfig } from './modules/e-aitisi/types';
import { ErrorBoundary } from './components/ErrorBoundary';

// Direct static imports to avoid dynamic chunk failures on Apache/sch.gr
import EAitisiApp from './modules/e-aitisi/App';
import { ProgrammatismosModule } from './modules/programmatismos/ProgrammatismosModule';
import { AxiologisiModule } from './modules/axiologisi/AxiologisiModule';

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

  for (let i = 0; i < candidateUrls.length; i++) {
    const url = candidateUrls[i];
    try {
      const controller = new AbortController();
      // Increase timeout for DB connection testing (10s) vs standard API requests (6s)
      const isConnectReq = path.includes('connect');
      const timeoutMs = isConnectReq ? 10000 : 6000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const fetchOpts: RequestInit = {
        ...options,
        signal: options?.signal || controller.signal
      };

      const res = await fetch(url, fetchOpts);
      clearTimeout(timeoutId);

      lastStatus = res.status;
      const text = await res.text();
      const isHtml = text.trim().startsWith('<') || text.includes('<!doctype') || text.includes('<!DOCTYPE') || text.includes('<html');

      if (!isHtml) {
        try {
          const json = JSON.parse(text);
          if (json && (json.success !== undefined || json.mode !== undefined || json.isConnected !== undefined || json.error !== undefined)) {
            return {
              ok: json.success === true || (res.ok && !json.error),
              data: json,
              status: res.status,
              rawText: text,
              urlUsed: url
            };
          }
        } catch (_) {
          // JSON parse failed
        }
      }

      // If text is HTML, it's an SPA fallback or server startup page, NOT a valid API response
      if (isHtml) {
        lastErrorText = `Σφάλμα διακομιστή (HTTP ${res.status}): Η διαδρομή επέστρεψε σελίδα HTML αντί για δεδομένα JSON.`;
      } else {
        lastErrorText = text;
      }

      // If direct /api/ returned a 400 or 500 JSON response, don't fall back to PHP
      if (i === 0 && !isHtml && res.status >= 400 && res.status < 600) {
        try {
          const json = JSON.parse(text);
          return { ok: false, data: json, status: res.status, rawText: text, urlUsed: url };
        } catch (_) {}
      }

    } catch (e: any) {
      if (e.name === 'AbortError') {
        lastErrorText = 'Χρονικό όριο αίτησης (Timeout) - Ο διακομιστής δεν ανταποκρίθηκε εγκαίρως (π.χ. ngrok tunnel εκτός σύνδεσης).';
      } else {
        lastErrorText = e.message || String(e);
      }
    }
  }

  // Ensure lastErrorText never exposes raw HTML code
  if (lastErrorText.trim().startsWith('<') || lastErrorText.includes('<!doctype') || lastErrorText.includes('<html')) {
    lastErrorText = 'Αδυναμία επικοινωνίας με την υπηρεσία API (Επιστράφηκε σελίδα HTML).';
  }

  return {
    ok: false,
    status: lastStatus,
    statusText: 'API Error',
    rawText: lastErrorText
  };
}

const getInitialActiveApp = (): AppId => {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (hash === 'aitisi' || hash === 'programmatismos' || hash === 'axiologisi') {
      return hash as AppId;
    }
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app')?.toLowerCase();
    if (appParam === 'aitisi' || appParam === 'programmatismos' || appParam === 'axiologisi') {
      return appParam as AppId;
    }
  } catch (_) {}
  return 'hub';
};

export default function App() {
  const [activeApp, setActiveApp] = useState<AppId>(getInitialActiveApp);

  useEffect(() => {
    const handleHashChange = () => {
      const appFromHash = getInitialActiveApp();
      setActiveApp(appFromHash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectApp = (app: AppId) => {
    setActiveApp(app);
    try {
      if (app === 'hub') {
        if (window.location.hash) {
          history.pushState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        window.location.hash = `#/${app}`;
      }
    } catch (_) {}
  };

  const [aitisiRole, setAitisiRole] = useState<'landing' | 'teacher' | 'admin'>('landing');
  const [aitisiAdminSubTab, setAitisiAdminSubTab] = useState<'portal' | 'sql' | 'ai'>('portal');
  const [programmatismosRole, setProgrammatismosRole] = useState<'landing' | 'director' | 'admin'>('landing');
  const [axiologisiRole, setAxiologisiRole] = useState<'landing' | 'admin'>('landing');
  const [dbConfigs, setDbConfigs] = useState<Record<'aitisi' | 'programmatismos' | 'axiologisi', DbConfig>>(initialDbConfigs);
  const [dbStatuses, setDbStatuses] = useState<Record<string, { connected: boolean; host: string; port?: number | string; database: string; message: string }>>({});
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [currentConnectionConfig, setCurrentConnectionConfig] = useState<MysqlConfig>(() => ({
    mode: 'external',
    ...getResolvedDbConfig()
  } as MysqlConfig));


  const fetchDbStatuses = async () => {
    try {
      const res = await robustApiFetch('/api/status');
      if (res.ok && res.data && res.data.isConnected !== undefined) {
        const data = res.data;
        const host = data.host || currentConnectionConfig.host || '10.2.49.42';
        const port = Number(data.port) || Number(currentConnectionConfig.port) || 3306;
        const isSchIntranetHost = host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.');
        const isConnected = Boolean(data.isConnected);

        setDbStatuses({
          aitisi: {
            connected: isConnected,
            host: host,
            port: port,
            database: data.database || 'e_aitisi',
            message: isConnected ? `Σύνδεση MySQL Ενεργή (${host}:${port} / e_aitisi)` : (isSchIntranetHost ? `Εσωτερικό Δίκτυο sch.gr (${host}:${port})` : 'Αποσυνδεδεμένο'),
          },
          programmatismos: {
            connected: isConnected,
            host: host,
            port: port,
            database: 'programmatismos',
            message: isConnected ? `Βάση Προγραμματισμού συνδεδεμένη (${host}:${port})` : 'Αποσυνδεδεμένο',
          },
          axiologisi: {
            connected: isConnected,
            host: host,
            port: port,
            database: 'axiologisi',
            message: isConnected ? `Βάση Αξιολόγησης συνδεδεμένη (${host}:${port})` : 'Αποσυνδεδεμένο',
          },
        });
        setCurrentConnectionConfig(prev => ({
          ...prev,
          mode: data.mode || 'external',
          host: host,
          port: port,
          user: data.user || prev.user,
          database: data.database || prev.database,
          isConnected: isConnected,
          activeConnectionMessage: isConnected ? `Σύνδεση MySQL Ενεργή (${host}:${port})` : (data.activeConnectionMessage || 'Αποσυνδεδεμένο')
        }));

        try {
          if (data.host) {
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({
              mode: data.mode || 'external',
              host: host,
              port: port,
              user: data.user || 'plinetamag',
              database: data.database || 'e_aitisi'
            }));
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Unable to reach /api/status endpoint:', err);
    }
  };

  useEffect(() => {
    const initConnection = async () => {
      try {
        // First check if server already has an active persisted configuration (from .active_db_config.json)
        const statusRes = await robustApiFetch('/api/status');
        if (statusRes.ok && statusRes.data && statusRes.data.host) {
          // Adopt server config without blindly overwriting with client fallbacks
          await fetchDbStatuses();
          return;
        }

        const resolved = getResolvedDbConfig();
        const payload = {
          mode: resolved.mode || 'external',
          host: resolved.host,
          port: Number(resolved.port) || 3306,
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
        mode: newConfig.mode || 'external',
        host: newConfig.host || '10.2.49.42',
        port: Number(newConfig.port) || 3306,
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
        setCurrentConnectionConfig(prev => ({ ...prev, ...configToSave, isConnected: true }));
        return { success: true };
      }

      const errorDetail = result.data?.error || result.rawText || 'Αποτυχία σύνδεσης στον διακομιστή MySQL.';

      // If host is internal sch.gr IP (10.x.x.x) and request failed because cloud container cannot reach intranet IP:
      const targetHost = configToSave.host;
      if (targetHost.startsWith('10.') || targetHost.startsWith('192.168.') || targetHost.startsWith('172.')) {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(configToSave));
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
        setActiveApp={handleSelectApp}
        dbStatuses={dbStatuses}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        aitisiRole={aitisiRole}
        setAitisiRole={setAitisiRole}
        aitisiAdminSubTab={aitisiAdminSubTab}
        setAitisiAdminSubTab={setAitisiAdminSubTab}
        programmatismosRole={programmatismosRole}
        setProgrammatismosRole={setProgrammatismosRole}
        axiologisiRole={axiologisiRole}
        setAxiologisiRole={setAxiologisiRole}
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
          <ErrorBoundary moduleTitle="Κεντρική Πύλη (Hub)" onReset={() => handleSelectApp('hub')}>
            <SuiteHub
              onSelectApp={handleSelectApp}
              dbConfigs={dbConfigs}
              dbStatuses={dbStatuses}
              onOpenDbModal={() => setIsDbModalOpen(true)}
              onRefreshDbStatuses={fetchDbStatuses}
            />
          </ErrorBoundary>
        )}

        {activeApp === 'aitisi' && (
          <ErrorBoundary moduleTitle="Η-Αίτηση (e-Aitisi)" onReset={() => handleSelectApp('hub')}>
            <div className="rounded-3xl shadow-xl">
              <EAitisiApp
                appRole={aitisiRole}
                setAppRole={setAitisiRole}
                onOpenDbModal={() => setIsDbModalOpen(true)}
              />
            </div>
          </ErrorBoundary>
        )}

        {activeApp === 'programmatismos' && (
          <ErrorBoundary moduleTitle="Προγραμματισμός Σχολικών Μονάδων" onReset={() => handleSelectApp('hub')}>
            <ProgrammatismosModule
              dbConfig={dbConfigs.programmatismos}
              onUpdateDbConfig={(cfg) => handleUpdateConfig('programmatismos', cfg)}
              appRole={programmatismosRole}
              setAppRole={setProgrammatismosRole}
            />
          </ErrorBoundary>
        )}

        {activeApp === 'axiologisi' && (
          <ErrorBoundary moduleTitle="Αξιολόγηση Εκπαιδευτικών" onReset={() => handleSelectApp('hub')}>
            <AxiologisiModule
              dbConfig={dbConfigs.axiologisi}
              onUpdateDbConfig={(cfg) => handleUpdateConfig('axiologisi', cfg)}
              appRole={axiologisiRole}
              setAppRole={setAxiologisiRole}
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs space-y-1">
        <p className="font-medium text-slate-300">EduData Suite • Ενιαία Πύλη Εκπαιδευτικών Εφαρμογών ΔΠΕ Μαγνησίας</p>
        <p className="text-[11px] text-slate-500">
          Η-Αίτηση | Προγραμματισμός Σχολικών Μονάδων | Αξιολόγηση
        </p>
      </footer>
    </div>
  );
}

