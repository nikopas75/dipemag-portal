import { DbConfig } from '../types';

export const HARDCODED_DB_DEFAULTS = {
  host: '10.2.49.42',
  port: 3306,
  user: 'plinetamag',
  password: 'Fr9KC7$c4e',
  database: 'e_aitisi',
  dbAitisi: 'e_aitisi',
  dbProgrammatismos: 'programmatismos',
  dbAxiologisi: 'axiologisi',
} as const;

export const LOCALSTORAGE_KEY = 'eaitisi_db_config';

/**
 * Resolves the database configuration following strict hierarchy:
 * 1. Saved localStorage configuration (if exists)
 * 2. Environment variables (if injected via import.meta.env)
 * 3. Central HARDCODED_DB_DEFAULTS
 */
export function getResolvedDbConfig(dbNameOverride?: string): DbConfig {
  let saved: Partial<DbConfig> | null = null;
  try {
    const item = localStorage.getItem(LOCALSTORAGE_KEY) || localStorage.getItem('ngrok_db_config');
    if (item) {
      saved = JSON.parse(item);
    }
  } catch (e) {
    saved = null;
  }

  const getEnv = (key: string) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    try {
      const meta = import.meta as any;
      return meta && meta.env ? meta.env[key] : undefined;
    } catch {
      return undefined;
    }
  };

  const host = saved?.host || getEnv('VITE_DB_HOST') || HARDCODED_DB_DEFAULTS.host;
  const port = saved?.port || (getEnv('VITE_DB_PORT') ? Number(getEnv('VITE_DB_PORT')) : HARDCODED_DB_DEFAULTS.port);
  const user = saved?.user || getEnv('VITE_DB_USER') || HARDCODED_DB_DEFAULTS.user;
  const password = saved?.password !== undefined ? saved.password : (getEnv('VITE_DB_PASSWORD') || HARDCODED_DB_DEFAULTS.password);
  const database = dbNameOverride || saved?.database || getEnv('VITE_DB_NAME') || HARDCODED_DB_DEFAULTS.database;

  return {
    mode: 'external',
    host,
    port,
    user,
    password,
    database,
    connected: false,
    isConnected: false,
    activeConnectionMessage: 'Σύνδεση στη βάση δεδομένων MySQL...'
  };
}
