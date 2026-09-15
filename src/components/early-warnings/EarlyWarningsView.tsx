import React, { useState } from 'react';
import { EarlyWarningAlert, InfrastructureProject } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { 
  AlertTriangle, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Send, 
  Building2, 
  Layers, 
  ArrowRight,
  Sparkles,
  CheckCheck,
  ChevronLeft,
  ChevronRight
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const alertsPerPage = 10;

  const filteredAlerts = alerts.filter(a => {
    if (activeTab !== 'ALL' && a.riskLevel !== activeTab) return false;
    if (selectedCategory !== 'ALL' && a.riskType !== selectedCategory) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * alertsPerPage;
  const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + alertsPerPage);

  const handleTabChange = (tab: 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL').length;
  const highCount = alerts.filter(a => a.riskLevel === 'HIGH').length;
  const mediumCount = alerts.filter(a => a.riskLevel === 'MEDIUM').length;

  const handleAcknowledge = (id: string) => {
    setAcknowledgedAlerts(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
              Real-Time AI Anomaly Detection
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Active Warnings: {alerts.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Early Warning System
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated predictive warning triggers identifying cost surges, critical schedule slippages, and clearance impasses before crisis escalation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-500">Filter Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Warning Types</option>
            <option value="Cost Escalation Alert">Cost Escalation</option>
            <option value="Schedule Delay Alert">Schedule Delay</option>
            <option value="Progress-Expenditure Divergence">Progress-Expenditure Divergence</option>
            <option value="Regulatory Stagnation">Regulatory Stagnation</option>
          </select>
        </div>
      </div>

      {/* Warning Severity Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ALL */}
        <button
          onClick={() => handleTabChange('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">All Active Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'ALL' ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold font-mono mt-2">{alerts.length}</div>
          <p className={`text-[11px] mt-1 ${activeTab === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            Comprehensive trigger log
          </p>
        </button>

        {/* CRITICAL */}
        <button
          onClick={() => handleTabChange('CRITICAL')}
          className={`group relative overflow-hidden p-4 rounded-2xl border text-left transition-all hover:shadow-xl hover:-translate-y-1 ${
            activeTab === 'CRITICAL'
              ? 'bg-rose-900 text-white border-rose-900 shadow-lg shadow-rose-900/20'
              : 'bg-white dark:bg-slate-800 text-rose-900 dark:text-rose-100 border-rose-200 dark:border-rose-800 hover:border-rose-400'
          }`}
        >
          <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-rose-500 to-red-600 rounded-full blur-2xl transition-opacity duration-500 ${activeTab === 'CRITICAL' ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}`} />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Alerts 🔴</span>
            <ShieldAlert className={`w-4 h-4 ${activeTab === 'CRITICAL' ? 'text-rose-300' : 'text-rose-500'}`} />
          </div>
          <div className={`relative z-10 text-2xl font-bold font-mono mt-2 ${activeTab === 'CRITICAL' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`}>{criticalCount}</div>
          <p className={`relative z-10 text-[11px] mt-1 ${activeTab === 'CRITICAL' ? 'text-rose-200' : 'text-slate-500 dark:text-slate-400'}`}>
            Requires immediate PMG escalation
          </p>
        </button>

        {/* HIGH */}
        <button
          onClick={() => handleTabChange('HIGH')}
          className={`group relative overflow-hidden p-4 rounded-2xl border text-left transition-all hover:shadow-xl hover:-translate-y-1 ${
            activeTab === 'HIGH'
              ? 'bg-amber-900 text-white border-amber-900 shadow-lg shadow-amber-900/20'
              : 'bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800 hover:border-amber-400'
          }`}
        >
          <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-2xl transition-opacity duration-500 ${activeTab === 'HIGH' ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}`} />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">High Alerts 🟠</span>
            <AlertTriangle className={`w-4 h-4 ${activeTab === 'HIGH' ? 'text-amber-300' : 'text-amber-500'}`} />
          </div>
          <div className={`relative z-10 text-2xl font-bold font-mono mt-2 ${activeTab === 'HIGH' ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`}>{highCount}</div>
          <p className={`relative z-10 text-[11px] mt-1 ${activeTab === 'HIGH' ? 'text-amber-200' : 'text-slate-500 dark:text-slate-400'}`}>
            Inter-ministerial review needed
          </p>
        </button>

        {/* MEDIUM */}
        <button
          onClick={() => handleTabChange('MEDIUM')}
          className={`group relative overflow-hidden p-4 rounded-2xl border text-left transition-all hover:shadow-xl hover:-translate-y-1 ${
            activeTab === 'MEDIUM'
              ? 'bg-yellow-900 text-white border-yellow-900 shadow-lg shadow-yellow-900/20'
              : 'bg-white dark:bg-slate-800 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800 hover:border-yellow-400'
          }`}
        >
          <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full blur-2xl transition-opacity duration-500 ${activeTab === 'MEDIUM' ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}`} />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Medium Alerts 🟡</span>
            <AlertCircle className={`w-4 h-4 ${activeTab === 'MEDIUM' ? 'text-yellow-300' : 'text-yellow-600'}`} />
          </div>
          <div className={`relative z-10 text-2xl font-bold font-mono mt-2 ${activeTab === 'MEDIUM' ? 'text-white' : 'text-yellow-700 dark:text-yellow-500'}`}>{mediumCount}</div>
          <p className={`relative z-10 text-[11px] mt-1 ${activeTab === 'MEDIUM' ? 'text-yellow-200' : 'text-slate-500 dark:text-slate-400'}`}>
            Quarterly milestone monitoring
          </p>
        </button>
      </div>

      {/* Alert Feed Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Warning Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No active warnings found in this category.
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => {
                const associatedProject = projects.find(p => p.id === alert.projectId);
                const isAck = acknowledgedAlerts[alert.id] || alert.status === 'Acknowledged' || alert.status === 'Action Initiated';

                const isCritical = alert.riskLevel === 'CRITICAL';
                const isHigh = alert.riskLevel === 'HIGH';
                const isExpanded = expandedAlertId === alert.id;

                const cardBorder = isCritical ? 'border-rose-300' : isHigh ? 'border-amber-300' : 'border-slate-200 dark:border-slate-700';

                // Generate AI predictive text
                const predictiveText = `This project has an ${alert.riskScore}% predicted risk of schedule delay because its physical progress (${associatedProject?.physicalProgress}%) is below expected progress (${associatedProject?.plannedPhysicalProgress}%) and its completion deadline is approaching.`;

                return (
                  <React.Fragment key={alert.id}>
                    <tr 
                      onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                      className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors duration-200 ${isExpanded ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{alert.projectName}</span>
                          <span className="text-xs font-mono text-blue-600 mt-0.5">{associatedProject?.projectCode || alert.projectId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-rose-500' : isHigh ? 'text-amber-500' : 'text-yellow-500'}`} />
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{alert.riskType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${isCritical ? 'bg-rose-100 text-rose-800' : isHigh ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {isCritical ? '🔴 CRITICAL' : isHigh ? '🟠 HIGH' : '🟡 MEDIUM'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{alert.riskScore} / 100</span>
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
                        <td colSpan={5} className="p-0 border-b border-slate-200 dark:border-slate-700">
                          <div className={`bg-gradient-to-br from-white to-slate-50 border-l-4 ${isCritical ? 'border-l-rose-500 shadow-[inset_0_4px_15px_rgba(244,63,94,0.05)]' : isHigh ? 'border-l-amber-500 shadow-[inset_0_4px_15px_rgba(245,158,11,0.05)]' : 'border-l-yellow-500 shadow-[inset_0_4px_15px_rgba(234,179,8,0.05)]'} overflow-hidden transition-all shadow-inner`}>
                            {/* Body */}
                            <div className="p-6 space-y-6">
                              {/* Project Info & Overall Risk */}
                              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 pt-2">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
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

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Risk Scores */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Risk Factor Breakdown</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Schedule Risk:</span>
                        <span className="font-bold font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{associatedProject?.scheduleRiskScore || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Cost Risk:</span>
                        <span className="font-bold font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{associatedProject?.costRiskScore || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Progress Risk:</span>
                        <span className="font-bold font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{associatedProject?.progressRiskScore || 0}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Expected Delay:</span>
                        <span className="text-sm font-bold text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded">
                          {associatedProject?.delayMonths ? `${Math.max(1, associatedProject.delayMonths - 2)}–${associatedProject.delayMonths + 2} months` : 'On Schedule'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Factors & Actions */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Main Warning Factors</h4>
                      <ul className="space-y-2 mt-3">
                        {associatedProject?.topContributingFactors?.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="text-rose-500 mt-0.5">•</span>
                            <span>{f.factor}</span>
                          </li>
                        )) || (
                          <>
                            <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"><span className="text-rose-500 mt-0.5">•</span><span>Completion date approaching</span></li>
                            <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"><span className="text-rose-500 mt-0.5">•</span><span>Physical progress is lower than expected</span></li>
                            <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"><span className="text-rose-500 mt-0.5">•</span><span>Progress velocity has plateaued</span></li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-blue-100 dark:border-blue-900/40 shadow-[0_4px_20px_rgba(59,130,246,0.03)] rounded-xl p-5">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Prescriptive Recommendation
                  </h4>
                  <ul className="space-y-2">
                    {alert.recommendedAction.split('. ').filter(Boolean).map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200 font-medium">
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
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all"
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
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Early Warnings Pagination Footer (10 per page) */}
        {filteredAlerts.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900 dark:text-white font-mono">{startIndex + 1}</strong> to{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {Math.min(startIndex + alertsPerPage, filteredAlerts.length)}
              </strong>{' '}
              of <strong className="text-slate-900 dark:text-white font-mono">{filteredAlerts.length}</strong> Alerts
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && safeCurrentPage > 3) {
                    pageNum = safeCurrentPage - 3 + i;
                    if (pageNum + 4 > totalPages) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                        safeCurrentPage === pageNum
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
