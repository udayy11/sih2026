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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<EarlyWarningAlert | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

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

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by project name, code, warning type, or trigger..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Alert Rows Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Severity</th>
                <th className="px-5 py-3.5 font-semibold">Alert Type</th>
                <th className="px-5 py-3.5 font-semibold">Project</th>
                <th className="px-5 py-3.5 font-semibold">Dataset Trigger / Evidence Metric</th>
                <th className="px-5 py-3.5 font-semibold text-center">Risk Score</th>
                <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No active warnings found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => {
                  const isAck = acknowledgedAlerts[alert.id] || alert.status === 'Acknowledged' || alert.status === 'Action Initiated';
                  const associatedProject = projects.find(p => p.id === alert.projectId);

                  return (
                    <tr
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                    >
                      {/* Severity */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${getRiskBadge(alert.riskLevel)}`}>
                          {alert.riskLevel === 'CRITICAL' ? '🔴' : alert.riskLevel === 'HIGH' ? '🟠' : '🟡'}
                          {alert.riskLevel}
                        </span>
                      </td>

                      {/* Alert Type */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getTypeBadge(alert.riskType)}`}>
                          {alert.riskType}
                        </span>
                      </td>

                      {/* Project */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 max-w-xs">
                          {alert.projectName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {associatedProject?.projectCode || alert.projectId} • {alert.sector}
                        </div>
                      </td>

                      {/* Evidence Metric */}
                      <td className="px-5 py-4 text-xs text-slate-600 font-medium max-w-sm">
                        <span className="line-clamp-2">{alert.evidenceMetric}</span>
                      </td>

                      {/* Risk Score */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`font-mono font-bold px-2 py-1 rounded-lg text-xs ${
                          alert.riskScore >= 80 ? 'bg-rose-100 text-rose-800' :
                          alert.riskScore >= 60 ? 'bg-amber-100 text-amber-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.riskScore} / 100
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {isAck ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCheck className="w-3.5 h-3.5" />
                            Acknowledged
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedAlert(alert); }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredAlerts.length > pageSize && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * pageSize, filteredAlerts.length)}
              </span> of{' '}
              <span className="font-semibold text-slate-700">{filteredAlerts.length}</span> warnings
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL (Opens on Row Click) */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-2xl max-w-2xl w-full overflow-hidden my-8">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-white font-bold tracking-wider text-sm uppercase">
                  AI Early Warning Dossier
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">
                  ID: {selectedAlert.id}
                </span>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Project & Risk Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs text-slate-500 font-semibold mb-1">
                    Project: <span className="font-mono text-blue-600">{activeProject?.projectCode || selectedAlert.projectId}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedAlert.projectName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedAlert.ministry} • {selectedAlert.sector} • {selectedAlert.state}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-1 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold border ${getRiskBadge(selectedAlert.riskLevel)}`}>
                    {selectedAlert.riskLevel}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">
                    Risk Score: <span className="font-bold text-slate-900 font-mono text-sm">{selectedAlert.riskScore} / 100</span>
                  </div>
                </div>
              </div>

              {/* Anomaly Reason Statement */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                      {selectedAlert.riskType}
                    </h5>
                    <p className="text-sm text-amber-950 font-medium leading-relaxed">
                      {selectedAlert.reason}
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
              )}

              {/* Prescriptive Recommendation */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Prescribed Administrative Intervention
                </h4>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {selectedAlert.recommendedAction}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                {!isSelectedAck ? (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                  >
                    Acknowledge Alert
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                    <CheckCheck className="w-4 h-4" />
                    Acknowledged
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold"
                >
                  Close
                </button>
                {activeProject && (
                  <button
                    onClick={() => {
                      const proj = activeProject;
                      setSelectedAlert(null);
                      onSelectProject(proj);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Diagnose Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
