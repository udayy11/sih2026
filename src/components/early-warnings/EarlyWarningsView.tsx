import React, { useState, useMemo } from 'react';
import { EarlyWarningAlert, InfrastructureProject } from '../../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Building2, 
  ArrowRight,
  Sparkles,
  CheckCheck,
  X,
  ChevronRight,
  ChevronLeft,
  Search
} from 'lucide-react';

interface EarlyWarningsViewProps {
  alerts: EarlyWarningAlert[];
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const EarlyWarningsView: React.FC<EarlyWarningsViewProps> = ({
  alerts,
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (activeTab !== 'ALL' && a.riskLevel !== activeTab) return false;
      if (selectedCategory !== 'ALL' && a.riskType !== selectedCategory) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          a.projectName.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.riskType.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [alerts, activeTab, selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;
  const paginatedAlerts = useMemo(() => {
    return filteredAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredAlerts, currentPage, pageSize]);

  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL').length;
  const highCount = alerts.filter(a => a.riskLevel === 'HIGH').length;
  const mediumCount = alerts.filter(a => a.riskLevel === 'MEDIUM').length;

  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAcknowledgedAlerts(prev => ({ ...prev, [id]: true }));
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Cost Escalation Alert':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Schedule Delay Alert':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Progress-Expenditure Divergence':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Regulatory Stagnation':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const activeProject = selectedAlert ? projects.find(p => p.id === selectedAlert.projectId) : null;
  const isSelectedAck = selectedAlert ? (acknowledgedAlerts[selectedAlert.id] || selectedAlert.status === 'Acknowledged' || selectedAlert.status === 'Action Initiated') : false;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
              Real-Time AI Anomaly Detection
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Active Warnings: {alerts.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            AI Early Warning System
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated predictive warning triggers identifying cost surges, schedule slippages, and clearance impasses from official dataset indicators.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Warning Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-hidden"
          >
            <option value="ALL">All Warning Types</option>
            <option value="Cost Escalation Alert">Cost Escalation</option>
            <option value="Schedule Delay Alert">Schedule Delay</option>
            <option value="Progress-Expenditure Divergence">Progress-Expenditure Divergence</option>
            <option value="Regulatory Stagnation">Regulatory Stagnation</option>
            <option value="Contractor Anomaly">Contractor Execution Risk</option>
          </select>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => { setActiveTab('ALL'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">All Active Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'ALL' ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold font-mono mt-2">{alerts.length}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            Cross-portfolio anomalies
          </p>
        </button>

        <button
          onClick={() => { setActiveTab('CRITICAL'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'CRITICAL'
              ? 'bg-rose-900 text-white border-rose-900 shadow-md'
              : 'bg-rose-50/50 text-rose-900 border-rose-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Alerts 🔴</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-2">{criticalCount}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'CRITICAL' ? 'text-rose-200' : 'text-rose-700'}`}>
            Requires immediate executive intervention
          </p>
        </button>

        <button
          onClick={() => { setActiveTab('HIGH'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'HIGH'
              ? 'bg-amber-900 text-white border-amber-900 shadow-md'
              : 'bg-amber-50/50 text-amber-900 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">High Alerts 🟠</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-2">{highCount}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'HIGH' ? 'text-amber-200' : 'text-amber-700'}`}>
            Inter-ministerial review needed
          </p>
        </button>

        <button
          onClick={() => { setActiveTab('MEDIUM'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'MEDIUM'
              ? 'bg-yellow-900 text-white border-yellow-900 shadow-md'
              : 'bg-yellow-50/50 text-yellow-900 border-yellow-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Medium Alerts 🟡</span>
            <AlertCircle className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-700 mt-2">{mediumCount}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'MEDIUM' ? 'text-yellow-200' : 'text-yellow-700'}`}>
            Quarterly milestone monitoring
          </p>
        </button>
      </div>

      {/* Alert Feed Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Warning Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.map((alert) => {
                const associatedProject = projects.find(p => p.id === alert.projectId);
                const isAck = acknowledgedAlerts[alert.id] || alert.status === 'Acknowledged' || alert.status === 'Action Initiated';

                const isCritical = alert.riskLevel === 'CRITICAL';
                const isHigh = alert.riskLevel === 'HIGH';
                const isExpanded = expandedAlertId === alert.id;

                const cardBorder = isCritical ? 'border-rose-300' : isHigh ? 'border-amber-300' : 'border-slate-200';

                // Generate AI predictive text
                const predictiveText = `This project has an ${alert.riskScore}% predicted risk of schedule delay because its physical progress (${associatedProject?.physicalProgress}%) is below expected progress (${associatedProject?.plannedPhysicalProgress}%) and its completion deadline is approaching.`;

                return (
                  <React.Fragment key={alert.id}>
                    <tr 
                      onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                      className={`hover:bg-blue-50/50 cursor-pointer transition-colors duration-200 ${isExpanded ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{alert.projectName}</span>
                          <span className="text-xs font-mono text-blue-600 mt-0.5">{associatedProject?.projectCode || alert.projectId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-rose-500' : isHigh ? 'text-amber-500' : 'text-yellow-500'}`} />
                          <span className="text-sm text-slate-700 font-medium">{alert.riskType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${isCritical ? 'bg-rose-100 text-rose-800' : isHigh ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {isCritical ? '🔴 CRITICAL' : isHigh ? '🟠 HIGH' : '🟡 MEDIUM'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold font-mono text-slate-900">{alert.riskScore} / 100</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAck ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCheck className="w-3.5 h-3.5" /> Acknowledged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold">
                            Pending Review
                          </span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-0 border-b border-slate-200">
                          <div className={`bg-gradient-to-br from-white to-slate-50 border-l-4 ${isCritical ? 'border-l-rose-500 shadow-[inset_0_4px_15px_rgba(244,63,94,0.05)]' : isHigh ? 'border-l-amber-500 shadow-[inset_0_4px_15px_rgba(245,158,11,0.05)]' : 'border-l-yellow-500 shadow-[inset_0_4px_15px_rgba(234,179,8,0.05)]'} overflow-hidden transition-all shadow-inner`}>
                            {/* Body */}
                            <div className="p-6 space-y-6">
                              {/* Project Info & Overall Risk */}
                              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-5 pt-2">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                  Diagnostic Detail
                                </h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">
                                  Alert ID: {alert.id}
                                </span>
                              </div>
                            </div>

                {/* The Predictive Statement */}
                <div className="bg-amber-50/80 backdrop-blur-sm border-l-4 border-amber-400 p-4 rounded-r-xl shadow-[0_2px_10px_rgba(245,158,11,0.05)]">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900 font-medium leading-relaxed">
                      {predictiveText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trigger / Evidence Metric */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Dataset Trigger Metric
                </h5>
                <p className="text-sm font-semibold text-slate-800 font-mono">
                  {selectedAlert.evidenceMetric}
                </p>
              </div>

              {/* Risk Factor Breakdown */}
              {activeProject && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 font-medium">Schedule Risk</span>
                    <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                      {activeProject.scheduleRiskScore}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 font-medium">Cost Risk</span>
                    <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                      {activeProject.costRiskScore}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 font-medium">Delay Months</span>
                    <div className="text-base font-bold font-mono text-rose-600 mt-0.5">
                      +{activeProject.delayMonths} mos
                    </div>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-[0_4px_20px_rgba(59,130,246,0.03)] rounded-xl p-5">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Prescriptive Recommendation
                  </h4>
                  <ul className="space-y-2">
                    {alert.recommendedAction.split('. ').filter(Boolean).map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-800 font-medium">
                        <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{action.trim().endsWith('.') ? action.trim() : action.trim() + '.'}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end items-center gap-3 pt-2">
                  {!isAck ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center gap-1 border border-emerald-200">
                      <CheckCheck className="w-4 h-4" />
                      Acknowledged
                    </span>
                  )}

                  {associatedProject && (
                    <button
                      onClick={() => onSelectProject(associatedProject)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <span>Diagnose Project</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
