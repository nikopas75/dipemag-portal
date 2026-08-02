export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Data Analyst' | 'Employee';
  departmentId: number;
  departmentName: string;
  avatar: string;
  phone: string;
  location: string;
  status: 'Active' | 'On Leave' | 'Remote';
  salaryBudget: number;
  joinedDate: string;
}

export interface DataRecord {
  id: number;
  userId: number;
  ownerName: string;
  category: 'Financial Invoice' | 'Project Milestone' | 'Client Asset' | 'System Audit' | 'Expense Claim';
  title: string;
  description: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Requires Review';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  clientOrProject: string;
  recordDate: string;
  updatedAt: string;
}

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
