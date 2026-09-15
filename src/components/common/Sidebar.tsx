import React, { useState } from 'react';
import {
  BarChart2,
  Users,
  Package,
  Gauge,
  Database,
  Folder,
  Shield,
  LayoutGrid,
  Settings,
  Zap,
  Menu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Home,
  Sliders,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  criticalCount: number;
  highRiskCount: number;
  currentUserRole?: 'Admin' | 'Project Tracker' | 'Engineer' | 'Citizen' | string;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | null;
  badgeColor?: string;
  allowedRoles?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  criticalCount,
  highRiskCount,
  currentUserRole = 'Admin',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // All sidebar navigation items
  const allNavItems: NavItem[] = [
    { id: 'overview', label: 'Platform Overview', icon: Home, badge: null, allowedRoles: ['Admin', 'Project Tracker', 'Engineer', 'Citizen'] },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, badge: null, allowedRoles: ['Admin', 'Project Tracker', 'Engineer'] },
    { id: 'projects', label: 'Projects & Roadblocks', icon: Folder, badge: null, allowedRoles: ['Admin', 'Project Tracker', 'Engineer', 'Citizen'] },
    { id: 'early-warnings', label: 'AI Early Warning & Alerts', icon: Package, badge: `${criticalCount + highRiskCount}`, badgeColor: 'bg-amber-400 text-slate-950 font-bold', allowedRoles: ['Admin', 'Project Tracker', 'Engineer'] },
    { id: 'predictive', label: 'Predictive Analytics', icon: Gauge, badge: 'ML', allowedRoles: ['Admin', 'Project Tracker', 'Engineer'] },
    { id: 'feedback', label: 'Citizen & RWA Feedback', icon: MessageSquare, badge: 'NEW', badgeColor: 'bg-amber-400 text-slate-950 font-bold', allowedRoles: ['Admin', 'Project Tracker', 'Engineer', 'Citizen'] },
    { id: 'benchmarking', label: 'Benchmarking', icon: Database, badge: null, allowedRoles: ['Admin', 'Project Tracker'] },
    { id: 'scenario', label: 'Scenario What-If', icon: Folder, badge: 'Sim', allowedRoles: ['Admin', 'Project Tracker'] },
    { id: 'interventions', label: 'Interventions (PMG)', icon: Shield, badge: null, allowedRoles: ['Admin', 'Project Tracker'] },
    { id: 'data-quality', label: 'Data Quality', icon: Database, badge: null, allowedRoles: ['Admin', 'Project Tracker', 'Engineer'] },
    { id: 'data-import', label: 'Data Import (CSV)', icon: FileSpreadsheet, badge: 'NEW', badgeColor: 'bg-emerald-500 text-white', allowedRoles: ['Admin'] },
    { id: 'users', label: 'User Management', icon: ShieldCheck, badge: null, allowedRoles: ['Admin'] },
    { id: 'assistant', label: 'AI Assistant (LLM)', icon: LayoutGrid, badge: 'AI', badgeColor: 'bg-fuchsia-500 text-white', allowedRoles: ['Admin', 'Project Tracker', 'Engineer', 'Citizen'] },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null, allowedRoles: ['Admin'] },
  ];

  // Filter nav items according to the current user's role
  const navItems = allNavItems.filter(item => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(currentUserRole);
  });

  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-gradient-to-b from-slate-900 via-[#0a1128] to-slate-900 text-white flex flex-col shrink-0 z-20 h-full max-h-full select-none shadow-2xl border-r border-blue-900/40 sticky top-0 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Top Toggle Button & Role Tag */}
      <div className="p-3.5 flex items-center justify-between border-b border-blue-900/50">
        {isExpanded ? (
          <div className="flex items-center justify-between w-full pl-2">
            <div className="flex flex-col">
              <span className="text-[13px] uppercase tracking-wider text-blue-200 font-bold">Portal Menu</span>
              <span className="text-[11px] text-amber-300 font-medium">{currentUserRole} Access</span>
            </div> 
            <button
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-blue-200 hover:text-white transition-all focus:outline-hidden cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-blue-200 hover:text-white transition-all mx-auto focus:outline-hidden cursor-pointer"
            title="Expand sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items with Isolated Independent Scrollbar */}
      <nav className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto sidebar-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full group relative flex items-center ${
                isExpanded ? 'px-3.5 justify-between' : 'justify-center px-0'
              } py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:translate-x-1 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/80 to-blue-500/80 backdrop-blur-md text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-white/30'
                  : 'text-blue-200/80 hover:bg-white/10 hover:text-white hover:shadow-inner'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1 rounded-lg shrink-0 transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-blue-200 group-hover:text-white'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isExpanded && (
                  <span className="truncate text-xs font-medium tracking-normal transition-opacity duration-200">
                    {item.label}
                  </span>
                )}
              </div>

              {item.badge && isExpanded && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    item.badgeColor || (isActive ? 'bg-blue-900 text-blue-100' : 'bg-blue-950/80 text-blue-200 border border-blue-800/60')
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Floating Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-50 border border-slate-700">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-amber-300 font-bold">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer with Role Status */}
      <div className="p-3 border-t border-blue-900/40 text-center shrink-0">
        {isExpanded ? (
          <div className="bg-blue-950/50 rounded-xl p-2.5 text-left border border-blue-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                <Zap className="w-3 h-3" />
                <span>NirmaanX</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200">
                v2.6
              </span>
            </div>
            <p className="text-[10px] text-blue-300/80 mt-1">
              Logged in as <strong className="text-white">{currentUserRole}</strong>
            </p>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/40 mx-auto flex items-center justify-center text-amber-400" title={`Role: ${currentUserRole}`}>
            <Zap className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
};
