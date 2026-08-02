import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppId, DbConfig } from './types';
import { initialDbConfigs } from './data/mockData';
import { Header } from './components/Header';
import { SuiteHub } from './components/SuiteHub';
import { ConnectionModal } from './modules/e-aitisi/components/ConnectionModal';
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
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data && data.isConnected !== undefined) {
        setDbStatuses({
          aitisi: {
            connected: data.isConnected,
            host: data.host,
            database: data.database,
            message: data.activeConnectionMessage || 'Σύνδεση MySQL Ενεργή',
          },
          programmatismos: {
            connected: data.isConnected,
            host: data.host,
            database: 'prog_sch_db',
            message: 'Βάση Προγραμματισμού συνδεδεμένη στον ίδιο MySQL Server',
          },
          axiologisi: {
            connected: data.isConnected,
            host: data.host,
            database: 'axiologisi_db',
            message: 'Βάση Αξιολόγησης συνδεδεμένη στον ίδιο MySQL Server',
          },
        });
        setCurrentConnectionConfig(prev => ({
          ...prev,
          mode: data.mode || 'external',
          host: data.host || prev.host,
          port: data.port || prev.port,
          user: data.user || prev.user,
          database: data.database || prev.database,
          isConnected: data.isConnected,
          activeConnectionMessage: data.activeConnectionMessage
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

        await fetch('/api/connect', {
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

  const handleSaveGlobalConnection = async (newConfig: Partial<MysqlConfig>): Promise<boolean> => {
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success) {
        try {
          const configToSave = {
            host: newConfig.host,
            port: newConfig.port,
            user: newConfig.user,
            password: newConfig.password,
            database: newConfig.database
          };
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(configToSave));
          localStorage.setItem('ngrok_db_config', JSON.stringify(configToSave));
        } catch (e) {}
        await fetchDbStatuses();
        return true;
      }
      return false;
    } catch (err) {
      return false;
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

