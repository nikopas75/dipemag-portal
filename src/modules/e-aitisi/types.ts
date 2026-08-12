export interface SqlAuditLog {
  id: number;
  timestamp: string;
  username: string;
  query: string;
  actionType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CONNECT';
  affectedRows: number;
  executionTimeMs: number;
}

export interface MysqlConfig {
  mode: 'embedded' | 'external';
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  isConnected: boolean;
  activeConnectionMessage?: string;
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  affectedRows?: number;
  executionTimeMs: number;
  error?: string;
}
