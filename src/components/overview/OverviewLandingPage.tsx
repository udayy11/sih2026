import React from 'react';
import {
  BarChart2,
  Package,
  Gauge,
  Folder,
  ArrowRight,
  ShieldAlert,
  Building2,
  TrendingUp,
  Activity,
  Database,
  Shield
} from 'lucide-react';
import { InfrastructureProject, EarlyWarningAlert } from '../../types';

interface OverviewLandingPageProps {
  projects: InfrastructureProject[];
  alerts: EarlyWarningAlert[];
  onNavigate: (view: string) => void;
  currentUserRole?: string;
}

export const OverviewLandingPage: React.FC<OverviewLandingPageProps> = ({
  projects,
  alerts,
  onNavigate,
  currentUserRole = 'Admin'
}) => {
  const criticalAlerts = alerts.filter(a => a.riskLevel === 'CRITICAL').length;
  const highRiskAlerts = alerts.filter(a => a.riskLevel === 'HIGH').length;

  const totalBudget = projects.reduce((sum, p) => sum + (p.originalCost || 0), 0);
  const totalExpenditure = projects.reduce((sum, p) => sum + (p.expenditure || 0), 0);

  const formatCurrency = (val: number) => `₹${(val / 100).toFixed(2)} Cr`;

  const launchpadItems = [
    {
      id: 'projects',
      title: 'Projects & Roadblocks',
      description: 'The master registry of all monitored national infrastructure projects with their progress metrics.',
      icon: Folder,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'early-warnings',
      title: 'AI Early Warning & Alerts',
      description: 'Real-time proactive monitoring for critical bottlenecks, land acquisition delays, and fund blocking.',
      icon: Package,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
      badge: `${criticalAlerts + highRiskAlerts} Alerts`
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics & AI',
      description: 'Machine Learning models forecasting schedule slippage and cost overruns before they happen.',
      icon: Gauge,
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600',
      badge: 'ML Engine'
    },
    {
      id: 'benchmarking',
      title: 'Benchmarking',
      description: 'Compare project performance metrics across sectors and states to identify best practices.',
      icon: Database,
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'scenario',
      title: 'Scenario What-If Simulator',
      description: 'Simulate policy interventions like budget boosts or fast-tracking clearances to see impact.',
      icon: Activity,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-600',
      badge: 'Sim'
    },
    {
      id: 'interventions',
      title: 'Interventions (PMG)',
      description: 'Track and manage Project Monitoring Group interventions for unblocking critical delays.',
      icon: Shield,
      color: 'rose',
      gradient: 'from-rose-500 to-pink-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 pointer-events-none" />
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.2 }} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldAlert className="w-4 h-4" />
              {currentUserRole} Access Enabled
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Infrastructure <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Decision Engine
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mb-8">
              Welcome to the NirmaanX centralized command center. Monitor critical bottlenecks, forecast project risks with AI, and oversee national development in real-time.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 bg-white dark:bg-slate-900 hover:bg-blue-50 text-slate-900 dark:text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2 group"
            >
              Enter Main Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:bg-white/10 transition-colors">
              <Building2 className="w-8 h-8 text-blue-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{projects.length}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:bg-white/10 transition-colors">
              <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{formatCurrency(totalBudget)}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Blueprint Budget</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:bg-white/10 transition-colors">
              <BarChart2 className="w-8 h-8 text-amber-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{formatCurrency(totalExpenditure)}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Expenditure</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:bg-white/10 transition-colors">
              <ShieldAlert className="w-8 h-8 text-red-400 mb-3" />
              <div className="text-3xl font-black text-white mb-1">{criticalAlerts}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Red Flags</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Launchpad */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform Launchpad</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {launchpadItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group cursor-pointer relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
            >
              {/* Hover Gradient Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${item.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${item.gradient} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                        <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  
                  {item.badge && (
                    <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-300 border border-${item.color}-200 dark:border-${item.color}-800`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow">
                  {item.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all mt-auto">
                  Launch Module <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
