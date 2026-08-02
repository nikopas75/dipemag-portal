import React, { useState, useEffect } from 'react';
import { AppId, DbConfig } from './types';
import { initialDbConfigs } from './data/mockData';
import { Header } from './components/Header';
import { SuiteHub } from './components/SuiteHub';
import EAitisiApp from './modules/e-aitisi/App';
import { ProgrammatismosModule } from './components/ProgrammatismosModule';
import { AxiologisiModule } from './components/AxiologisiModule';
import { ConnectionModal } from './modules/e-aitisi/components/ConnectionModal';
import { MysqlConfig } from './modules/e-aitisi/types';

export default function App() {
  const [activeApp, setActiveApp] = useState<AppId>('hub');
  const [aitisiRole, setAitisiRole] = useState<'landing' | 'teacher' | 'admin'>('landing');
  const [aitisiAdminSubTab, setAitisiAdminSubTab] = useState<'portal' | 'sql' | 'ai'>('portal');
  const [dbConfigs, setDbConfigs] = useState<Record<'aitisi' | 'programmatismos' | 'axiologisi', DbConfig>>(initialDbConfigs);
  const [dbStatuses, setDbStatuses] = useState<Record<string, { connected: boolean; host: string; database: string; message: string }>>({});
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [currentConnectionConfig, setCurrentConnectionConfig] = useState<MysqlConfig>(() => {
    try {
      const saved = localStorage.getItem('ngrok_db_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          mode: 'external',
          host: parsed.host || '2.tcp.eu.ngrok.io',
          port: Number(parsed.port) || 16641,
          user: parsed.user || 'plinetamag',
          password: parsed.password !== undefined ? parsed.password : 'pl!n3tAmag',
          database: parsed.database || 'e_aitisi',
          isConnected: false,
          activeConnectionMessage: 'Σύνδεση στη βάση δεδομένων MySQL...'
        };
      }
    } catch (e) {}
    return {
      mode: 'external',
      host: '2.tcp.eu.ngrok.io',
      port: 16641,
      user: 'plinetamag',
      password: 'pl!n3tAmag',
      database: 'e_aitisi',
      isConnected: false,
      activeConnectionMessage: 'Σύνδεση στη βάση δεδομένων MySQL...'
    };
  });

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
        const saved = localStorage.getItem('ngrok_db_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          const payload = {
            mode: 'external',
            host: parsed.host || '2.tcp.eu.ngrok.io',
            port: Number(parsed.port) || 16641,
            user: parsed.user || 'plinetamag',
            password: parsed.password !== undefined ? parsed.password : 'pl!n3tAmag',
            database: parsed.database || 'e_aitisi'
          };

          await fetch('/api/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
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
          localStorage.setItem('ngrok_db_config', JSON.stringify({
            host: newConfig.host,
            port: newConfig.port,
            user: newConfig.user,
            password: newConfig.password,
            database: newConfig.database
          }));
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
          <div className="rounded-3xl shadow-xl">
            <EAitisiApp
              appRole={aitisiRole}
              setAppRole={setAitisiRole}
              adminSubTab={aitisiAdminSubTab}
              setAdminSubTab={setAitisiAdminSubTab}
              onOpenDbModal={() => setIsDbModalOpen(true)}
            />
          </div>
        )}

        {activeApp === 'programmatismos' && (
          <ProgrammatismosModule
            dbConfig={dbConfigs.programmatismos}
            onUpdateDbConfig={(cfg) => handleUpdateConfig('programmatismos', cfg)}
          />
        )}

        {activeApp === 'axiologisi' && (
          <AxiologisiModule
            dbConfig={dbConfigs.axiologisi}
            onUpdateDbConfig={(cfg) => handleUpdateConfig('axiologisi', cfg)}
          />
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

