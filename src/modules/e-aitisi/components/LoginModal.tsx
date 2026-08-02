import React, { useState } from 'react';
import { Database, Lock, User, CheckCircle2, X } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  onLogin: (username: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, users, onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<string>(users[0]?.username || 'alex.rivera');
  const [customUsername, setCustomUsername] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = useCustom && customUsername.trim() ? customUsername.trim() : selectedUser;
    onLogin(finalUsername);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">MySQL Database Login</h3>
              <p className="text-xs text-slate-400">Authenticate session to retrieve & alter table data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Pre-seeded Profiles Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Pre-Loaded Personnel Profile
              </label>
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-xs text-cyan-400 hover:underline font-medium"
              >
                {useCustom ? 'Pick Demo User' : 'Enter Custom Username'}
              </button>
            </div>

            {!useCustom ? (
              <div className="space-y-2.5">
                {users.map(u => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u.username)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedUser === u.username
                        ? 'bg-cyan-950/50 border-cyan-500/70 shadow-sm shadow-cyan-900/30'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={u.avatar} alt={u.fullName} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{u.fullName}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          @{u.username} • <span className="text-cyan-400">{u.role}</span>
                        </p>
                      </div>
                    </div>
                    {selectedUser === u.username && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={customUsername}
                    onChange={e => setCustomUsername(e.target.value)}
                    placeholder="Enter database username (e.g., alex.rivera)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required={useCustom}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 font-mono space-y-1">
            <p className="text-cyan-400 font-bold">Query Execution Preview:</p>
            <p>SELECT * FROM users WHERE username = ? LIMIT 1;</p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <Lock className="w-4 h-4" />
            <span>Establish Session & Retrieve User DB Record</span>
          </button>
        </form>
      </div>
    </div>
  );
};
