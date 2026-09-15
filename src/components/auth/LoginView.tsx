import React, { useState } from 'react';
import { Layers, Lock, User as UserIcon, ArrowRight, ShieldCheck, AlertCircle, Key, UserCheck } from 'lucide-react';

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'Project Tracker' | 'Engineer';
  department: string;
}

interface LoginViewProps {
  onLogin: (user: UserSession) => void;
}

export const AUTHORIZED_USERS: Record<string, { pass: string; name: string; role: 'Admin' | 'Project Tracker' | 'Engineer'; department: string }> = {
  uday: {
    pass: 'uday',
    name: 'uday',
    role: 'Admin',
    department: 'Data Informatics & Innovation Division (DIID)',
  },
  piyush: {
    pass: 'piyush',
    name: 'piyush',
    role: 'Project Tracker',
    department: 'MoSPI Project Monitoring Group (PMG)',
  },
  nikhil: {
    pass: 'nikhil',
    name: 'nikhil',
    role: 'Engineer',
    department: 'Field Execution & Civil Engineering',
  },
  lavanya: {
    pass: 'lavanya',
    name: 'lavanya',
    role: 'Engineer',
    department: 'Structural & Quality Control Engineering',
  },
};

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectAccount = (key: string) => {
    const acc = AUTHORIZED_USERS[key];
    if (acc) {
      setUsername(key);
      setPassword(acc.pass);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const userKey = username.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userKey, password }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setIsLoading(false);
        const mappedRole: 'Admin' | 'Project Tracker' | 'Engineer' = 
          data.user.role === 'Admin' ? 'Admin' : 
          data.user.role === 'MoSPI Officer' || data.user.role === 'Project Tracker' ? 'Project Tracker' : 'Engineer';

        onLogin({
          id: data.user.id || `usr-${userKey}`,
          username: data.user.username || userKey,
          name: data.user.name,
          role: mappedRole,
          department: data.user.department || 'Field Execution & Civil Engineering',
        });
        return;
      }
    } catch (err) {
      console.warn('API login check failed, attempting fallback local verification:', err);
    }

    // Local fallback check
    setIsLoading(false);
    const match = AUTHORIZED_USERS[userKey];
    if (match && match.pass === password) {
      onLogin({
        id: `usr-${userKey}`,
        username: userKey,
        name: match.name,
        role: match.role,
        department: match.department,
      });
    } else {
      setErrorMessage('Invalid username or password. Please verify your registered database credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white relative">
      {/* Background blur decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
        <div className="p-8 pb-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500" />
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="NirmaanX Logo" className="h-16 md:h-20 object-contain mix-blend-multiply dark:mix-blend-normal" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Team InfraMinds • MoSPI Access Control Gateway</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight mb-1">Access Control Portal</h2>
          <p className="text-xs text-slate-500">Role-Based Infrastructure Decision & Monitoring Platform</p>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {/* Quick Demo Account Selector Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Select Authorized Role Account:</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectAccount('uday')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username === 'uday' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>👑 Uday</span>
                  <span className="text-[10px] font-mono opacity-80">Admin</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">pass: uday</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount('piyush')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username === 'piyush' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>📊 piyush</span>
                  <span className="text-[10px] font-mono opacity-80">Tracker</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">pass: piyush</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount('nikhil')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username === 'nikhil' ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>👷 nikhil</span>
                  <span className="text-[10px] font-mono opacity-80">Engineer</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">pass: 1234</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount('lavanya')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  username === 'lavanya' ? 'bg-amber-900 text-white border-amber-900 shadow-sm' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>👷‍♀️ lavanya</span>
                  <span className="text-[10px] font-mono opacity-80">Engineer</span>
                </div>
                <div className="text-[10px] opacity-80 mt-0.5 font-mono">pass: 1234</div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Username / ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. uday, piyush, nikhil, lavanya"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              Role-Based Access Control (RBAC) active for <span className="font-bold text-slate-700 dark:text-slate-300">MoSPI DIID Infrastructure Monitoring Platform</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
