import React, { useState, useMemo } from 'react';
import { InfrastructureProject, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Layers, 
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { IndiaMap } from './IndiaMap';

interface DashboardViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Filter projects by state if selected
  const activeProjects = useMemo(() => {
    if (!selectedState) return projects;
    return projects.filter(p => {
      if (p.state === selectedState) return true;
      if (selectedState === 'Andaman and Nicobar Islands' && p.state.includes('Andaman')) return true;
      if (selectedState === 'Delhi' && p.state.includes('Delhi')) return true;
      return false;
    });
  }, [projects, selectedState]);

  // KPIs
  const projectCount = activeProjects.length;
  
  const originalCost = activeProjects.reduce((sum, p) => sum + p.originalCost, 0);
  const revisedCost = activeProjects.reduce((sum, p) => sum + p.revisedCost, 0);
  const expenditure = activeProjects.reduce((sum, p) => sum + p.expenditure, 0);
  
  const completedProjects = activeProjects.filter(p => 
    p.status === 'Completed' ||
    p.status === 'Commissioned' ||
    p.physicalProgress >= 100 ||
    (p.status === 'Near Completion' && p.physicalProgress >= 95)
  ).length;
  const newlyAdded = activeProjects.filter(p => p.physicalProgress < 10).length;

  // Portfolio S-Curve Aggregation across all active projects
  const portfolioSCurveData = useMemo(() => {
    const monthMap = new Map<string, { plannedSum: number; actualSum: number; finSum: number; count: number }>();
    activeProjects.forEach(p => {
      (p.monthlyProgressHistory || []).forEach(h => {
        const entry = monthMap.get(h.month) || { plannedSum: 0, actualSum: 0, finSum: 0, count: 0 };
        entry.plannedSum += Number(h.plannedPhysical) || 0;
        entry.actualSum += Number(h.actualPhysical) || 0;
        entry.finSum += Number(h.actualFinancial) || 0;
        entry.count += 1;
        monthMap.set(h.month, entry);
      });
    });

    const rows = Array.from(monthMap.entries()).map(([month, val]) => ({
      month,
      plannedPhysical: Number((val.plannedSum / Math.max(1, val.count)).toFixed(1)),
      actualPhysical: Number((val.actualSum / Math.max(1, val.count)).toFixed(1)),
      actualFinancial: Number((val.finSum / Math.max(1, val.count)).toFixed(1)),
    }));

    if (rows.length >= 3) {
      return rows;
    }

    const defaultMonths = ['Jul 2025', 'Sep 2025', 'Nov 2025', 'Jan 2026', 'Mar 2026', 'May 2026', 'Jul 2026'];
    const avgCurrentPhys = activeProjects.length > 0 ? activeProjects.reduce((s, p) => s + p.physicalProgress, 0) / activeProjects.length : 52;
    const avgCurrentFin = activeProjects.length > 0 ? activeProjects.reduce((s, p) => s + p.financialProgress, 0) / activeProjects.length : 58;

    return defaultMonths.map((m, i) => {
      const step = (i + 1) / defaultMonths.length;
      return {
        month: m,
        plannedPhysical: Math.min(100, Math.round(20 + step * 65)),
        actualPhysical: Math.min(100, Math.round(15 + step * (avgCurrentPhys - 10))),
        actualFinancial: Math.min(100, Math.round(18 + step * (avgCurrentFin - 12))),
      };
    });
  }, [activeProjects]);

  // AI Risk Averages
  const avgCostRisk = projectCount > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.costRiskScore, 0) / projectCount) : 0;
  const avgScheduleRisk = projectCount > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.scheduleRiskScore, 0) / projectCount) : 0;
  const avgProgressRisk = projectCount > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.progressRiskScore, 0) / projectCount) : 0;
  const avgOverallRisk = projectCount > 0 ? Math.round(activeProjects.reduce((sum, p) => sum + p.overallRiskScore, 0) / projectCount) : 0;

  const getRiskSeverityColor = (score: number) => {
    if (score >= 80) return 'text-rose-500 bg-rose-50 border-rose-200 stroke-rose-500';
    if (score >= 60) return 'text-amber-500 bg-amber-50 border-amber-200 stroke-amber-500';
    if (score >= 40) return 'text-yellow-500 bg-yellow-50 border-yellow-200 stroke-yellow-500';
    return 'text-emerald-500 bg-emerald-50 border-emerald-200 stroke-emerald-500';
  };

  const getOverallRiskLabel = (score: number) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    if (score > 0) return 'LOW';
    return 'N/A';
  };

  const CircularProgress = ({ value, label, subtitle }: { value: number, label: string, subtitle: string }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    const colorClasses = getRiskSeverityColor(value);

    return (
      <div className="flex flex-col items-center justify-center p-3">
        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
            <circle
              className="stroke-slate-100"
              strokeWidth="4"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
            <circle
              className={`${colorClasses.split(' ')[3]} transition-all duration-1000 ease-out`}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-[13px] ${colorClasses.split(' ')[0]}`}>
            {value}%
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-700 text-center uppercase tracking-wider">{label}</span>
        <span className="text-[9px] text-slate-400 text-center">{subtitle}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title Bar */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">State-wise Infrastructure Projects</h1>
          <p className="text-sm text-slate-500 mt-1">As of July 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI-Powered Predictive Monitoring
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Prototype / Demo Data
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Statistics Card (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            
            <div className="bg-slate-900 px-6 py-5 flex flex-col justify-center border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Selected Region</span>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-6 h-6 text-blue-400" />
                <h2 className="text-3xl font-bold tracking-tight">{selectedState || 'All India'}</h2>
              </div>
            </div>

            <div className="p-6">
              {/* 2x3 KPI Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* KPI 1: Project Count */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <Layers className="w-4 h-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Project Count</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{projectCount}</div>
                </div>

                {/* KPI 2: Completed Projects */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{completedProjects}</div>
                </div>

                {/* KPI 3: Original Cost */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Original Cost</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ₹{originalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.
                  </div>
                </div>

                {/* KPI 4: Latest Revised Cost */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Revised Cost</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ₹{revisedCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.
                  </div>
                </div>

                {/* KPI 5: Cumulative Expenditure */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Expenditure</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ₹{expenditure.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr.
                  </div>
                </div>

                {/* KPI 6: Newly Added */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Newly Added</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{newlyAdded}</div>
                </div>
                
              </div>
            </div>

            {/* AI Risk Overview (4 Progress Rings) */}
            <div className="border-t border-slate-200 bg-slate-50/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  AI Risk Overview
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskSeverityColor(avgOverallRisk)}`}>
                  Risk: {getOverallRiskLabel(avgOverallRisk)}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <CircularProgress value={avgCostRisk} label="Cost Overrun" subtitle="Risk Score" />
                <CircularProgress value={avgScheduleRisk} label="Schedule Delay" subtitle="Risk Score" />
                <CircularProgress value={avgProgressRisk} label="Implementation" subtitle="Risk Score" />
                <CircularProgress value={avgOverallRisk} label="Overall Risk" subtitle="Aggregated" />
              </div>
            </div>

          </div>
          
          {/* Action Button to drop down to Priority Project table */}
          {selectedState && (
            <button 
              onClick={() => onNavigate('projects')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3.5 px-4 font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              View {projectCount} Priority Projects in {selectedState}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* RIGHT: Interactive India Map (7 columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <IndiaMap 
            projects={projects} 
            selectedState={selectedState} 
            onStateSelect={setSelectedState} 
          />
        </div>

      </div>

      {/* BOTTOM: National Portfolio S-Curve Execution Trajectory */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                Portfolio Velocity Analytics
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Aggregated Across {activeProjects.length} Projects {selectedState ? `in ${selectedState}` : 'Nationwide'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              National Portfolio S-Curve Execution Trajectory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative pacing of Portfolio Planned Physical Target (%) vs Executed Physical (%) vs Financial Expenditure Burn (%)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-500"></span>
              <span className="text-slate-600">Planned Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
              <span className="text-slate-900 font-bold">Actual Physical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500"></span>
              <span className="text-slate-600">Financial Burn</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioSCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="actualPhysGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', color: '#F8FAFC', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="actualPhysical" name="Avg Actual Physical (%)" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#actualPhysGrad)" />
              <Area type="monotone" dataKey="actualFinancial" name="Avg Financial Burn (%)" stroke="#E11D48" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#burnGrad)" />
              <Line type="monotone" dataKey="plannedPhysical" name="Avg Planned Physical (%)" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
