import React, { useMemo, useState } from 'react';
import { InfrastructureProject } from '../../types';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  AlertOctagon, 
  ShieldAlert, 
  FileWarning, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  Shield,
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface IssuesViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
}

export interface ProjectIssue {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  type: 'Schedule Bottleneck' | 'Cost Escalation' | 'Regulatory Impasse' | 'Contractor Execution';
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Unresolved' | 'Pending Intervention' | 'In Progress' | 'Escalated';
}

interface ProjectWithIssues {
  project: InfrastructureProject;
  issues: ProjectIssue[];
  criticalCount: number;
  highCount: number;
}

export const IssuesView: React.FC<IssuesViewProps> = ({ projects, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 10;

  // Synthesize issues from project data and group by project
  const projectsWithIssues = useMemo<ProjectWithIssues[]>(() => {
    return projects.map(project => {
      const issues: ProjectIssue[] = [];
      let issueIdCounter = 1;

      // 1. Schedule Delay Drivers
      project.majorDelayDrivers?.forEach(driver => {
        issues.push({
          id: `${project.id}-delay-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Schedule Bottleneck',
          description: driver,
          severity: project.riskLevel === 'CRITICAL' ? 'Critical' : 'High',
          status: 'Unresolved'
        });
      });

      // 2. Cost Drivers
      project.majorCostEscalationDrivers?.forEach(driver => {
        issues.push({
          id: `${project.id}-cost-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Cost Escalation',
          description: driver,
          severity: project.costRiskScore > 80 ? 'Critical' : 'High',
          status: 'Unresolved'
        });
      });

      // 3. Regulatory Bottlenecks (Forest & Environmental Clearances)
      if (project.forestClearance === 'Pending' || project.forestClearance === 'Stage-2 Pending') {
        issues.push({
          id: `${project.id}-forest-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Regulatory Impasse',
          description: `Forest Clearance Bottleneck: ${project.forestClearance} (MoEFCC statutory review)`,
          severity: 'Critical',
          status: 'Pending Intervention'
        });
      }

      if (project.environmentalClearance === 'Pending') {
        issues.push({
          id: `${project.id}-env-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Regulatory Impasse',
          description: 'Environmental Clearance (EAC Appraisal) remains pending',
          severity: 'High',
          status: 'Pending Intervention'
        });
      }

      // 4. Land Acquisition Impasse
      if (project.landAcquiredPercent && project.landAcquiredPercent < 80) {
        issues.push({
          id: `${project.id}-land-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Schedule Bottleneck',
          description: `Right-of-Way (RoW) Deficit: Only ${project.landAcquiredPercent}% land acquired vs required possession`,
          severity: project.landAcquiredPercent < 60 ? 'Critical' : 'High',
          status: 'Unresolved'
        });
      }

      // 5. Contractor Execution Risk
      if (project.contractorRiskRating === 'High Default Risk') {
        issues.push({
          id: `${project.id}-contractor-${issueIdCounter++}`,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.projectCode,
          type: 'Contractor Execution',
          description: `Lead Contractor (${project.contractorName}) flagged with high financial/delivery default rating`,
          severity: 'Critical',
          status: 'Pending Intervention'
        });
      }

      const criticalCount = issues.filter(i => i.severity === 'Critical').length;
      const highCount = issues.filter(i => i.severity === 'High').length;

      return {
        project,
        issues,
        criticalCount,
        highCount
      };
    });
  }, [projects]);

  // Filter projects based on search query and severity
  const filteredProjectsWithIssues = useMemo(() => {
    return projectsWithIssues.filter(item => {
      const { project, issues } = item;
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issues.some(i => 
          i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.type.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesSeverity = severityFilter === 'All' || 
        issues.some(i => i.severity === severityFilter);

      return matchesSearch && matchesSeverity;
    });
  }, [projectsWithIssues, searchTerm, severityFilter]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSeverityFilterChange = (value: string) => {
    setSeverityFilter(value);
    setCurrentPage(1);
  };

  // Pagination logic (10 projects per page)
  const totalPages = Math.ceil(filteredProjectsWithIssues.length / projectsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * projectsPerPage;
  const paginatedItems = filteredProjectsWithIssues.slice(startIndex, startIndex + projectsPerPage);

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'Critical': return <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />;
      case 'High': return <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />;
      default: return <FileWarning className="w-3.5 h-3.5 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'High': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'Schedule Bottleneck': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Cost Escalation': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Regulatory Impasse': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              Project Bottleneck & Blocker Tracking
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Showing 10 Projects per page • Total {filteredProjectsWithIssues.length} matching
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Issues & Bottlenecks Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Identify and resolve critical bottlenecks, land acquisition impasses, statutory delays, and cost escalation factors.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, code, sector, or bottleneck keyword..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Issue Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => handleSeverityFilterChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-slate-800">All Severities</option>
              <option value="Critical" className="bg-white dark:bg-slate-800">Critical Only</option>
              <option value="High" className="bg-white dark:bg-slate-800">High Only</option>
              <option value="Medium" className="bg-white dark:bg-slate-800">Medium Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paginated Project Cards (10 Projects Per Page) */}
      <div className="space-y-4">
        {paginatedItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <AlertTriangle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Projects Matching Criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or severity filter to view unresolved project bottlenecks.
            </p>
          </div>
        ) : (
          paginatedItems.map(({ project, issues, criticalCount, highCount }) => (
            <div 
              key={project.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Project Card Header Strip */}
              <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {project.projectCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {project.sector} • {project.ministry}
                      </span>
                      <RiskBadge level={project.riskLevel} size="sm" />
                    </div>
                    <h3 
                      onClick={() => onSelectProject(project)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      {project.name}
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </h3>
                  </div>
                </div>

                {/* Right Side Summary Indicators */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {criticalCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      {criticalCount} Critical
                    </span>
                  )}
                  {highCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {highCount} High
                    </span>
                  )}
                  <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {issues.length} {issues.length === 1 ? 'Bottleneck' : 'Bottlenecks'}
                  </span>
                  <button
                    onClick={() => onSelectProject(project)}
                    className="text-xs font-bold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ml-1"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Issues & Bottlenecks Table */}
              <div className="overflow-x-auto">
                {issues.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    No active bottlenecks detected. Execution progressing within nominal tolerances.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3 w-44">Bottleneck Category</th>
                        <th className="px-5 py-3">Description & Impact</th>
                        <th className="px-5 py-3 text-center w-28">Severity</th>
                        <th className="px-5 py-3 text-center w-36">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {issues.map(issue => (
                        <tr key={issue.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${getTypeBadge(issue.type)}`}>
                              {issue.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                            {issue.description}
                          </td>
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${getSeverityBadge(issue.severity)}`}>
                              {getSeverityIcon(issue.severity)}
                              {issue.severity}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                              {issue.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls Footer (Mirrors MilestonesView) */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredProjectsWithIssues.length === 0 ? 0 : startIndex + 1}</span> to{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {Math.min(startIndex + projectsPerPage, filteredProjectsWithIssues.length)}
          </span>{' '}
          of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredProjectsWithIssues.length}</span> projects
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = safeCurrentPage;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (safeCurrentPage <= 3) {
                  pageNum = i + 1;
                } else if (safeCurrentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = safeCurrentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      safeCurrentPage === pageNum
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
