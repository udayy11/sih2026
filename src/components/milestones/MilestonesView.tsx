import React, { useMemo, useState } from 'react';
import { InfrastructureProject, Milestone } from '../../types';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface MilestonesViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({ projects, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 10;

  // Filter projects matching search and status filter
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.milestones || []).some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || 
        (project.milestones || []).some(m => m.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Reset to page 1 whenever search query or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * projectsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Completed': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Delayed': return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      case 'In Progress': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Delayed': return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'In Progress': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Execution Critical Path Tracking
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Showing 10 Projects per page • Total {filteredProjects.length} matching
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Project Milestones & Critical Path Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor statutory clearances, land possession, foundation civil works, and commissioning milestones across infrastructure projects.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, project code, sector, or milestone..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Milestone Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-slate-800">All Statuses</option>
              <option value="Completed" className="bg-white dark:bg-slate-800">Completed</option>
              <option value="In Progress" className="bg-white dark:bg-slate-800">In Progress</option>
              <option value="Delayed" className="bg-white dark:bg-slate-800">Delayed</option>
              <option value="Pending" className="bg-white dark:bg-slate-800">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paginated Project Milestone Cards (10 Projects Per Page) */}
      <div className="space-y-4">
        {paginatedProjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1">No infrastructure projects match the selected search or milestone filter.</p>
          </div>
        ) : (
          paginatedProjects.map((project, pIdx) => {
            const milestones = project.milestones || [];
            const completedCount = milestones.filter(m => m.status === 'Completed').length;
            const delayedCount = milestones.filter(m => m.status === 'Delayed').length;

            return (
              <div 
                key={project.id || project.projectCode}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Project Header Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {project.projectCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {project.sector} • {project.state}
                      </span>
                      <RiskBadge level={project.riskLevel} size="sm" />
                    </div>
                    <h3 
                      onClick={() => onSelectProject(project)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors flex items-center gap-1.5 truncate"
                    >
                      <span>{project.name}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-50 shrink-0" />
                    </h3>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Milestones Completed</span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        <strong className="text-emerald-600">{completedCount}</strong> / {milestones.length}
                        {delayedCount > 0 && <span className="ml-1 text-rose-500 text-[10px]">({delayedCount} delayed)</span>}
                      </span>
                    </div>

                    <div className="w-28 text-right">
                      <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                        <span>Physical</span>
                        <span className="font-bold text-slate-900 dark:text-white">{project.physicalProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, project.physicalProgress)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones Horizontal / Grid Table */}
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-[11px] text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                        <th className="pb-2 font-semibold">Stage / Milestone Name</th>
                        <th className="pb-2 font-semibold">Target / Planned Date</th>
                        <th className="pb-2 font-semibold">Execution / Actual Date</th>
                        <th className="pb-2 font-semibold text-center">Project Weight</th>
                        <th className="pb-2 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {milestones.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-3 text-slate-400 italic">No milestone data recorded for this project.</td>
                        </tr>
                      ) : (
                        milestones.map((m, mIdx) => (
                          <tr key={m.id || `m-${pIdx}-${mIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 font-medium text-slate-900 dark:text-slate-200 pr-4">
                              {m.name}
                            </td>
                            <td className="py-2.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {m.plannedDate ? new Date(m.plannedDate).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              }) : '—'}
                            </td>
                            <td className="py-2.5 font-mono whitespace-nowrap">
                              {m.actualDate ? (
                                <span className={m.status === 'Delayed' ? 'text-rose-600 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                                  {new Date(m.actualDate).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic font-sans text-[11px]">Pending execution</span>
                              )}
                            </td>
                            <td className="py-2.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {m.weight}%
                            </td>
                            <td className="py-2.5 text-right whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(m.status)}`}>
                                {getStatusIcon(m.status)}
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sleek Pagination Controls (10 Projects Per Page) */}
      {filteredProjects.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900 dark:text-white font-mono">{startIndex + 1}</strong> to{' '}
            <strong className="text-slate-900 dark:text-white font-mono">
              {Math.min(startIndex + projectsPerPage, filteredProjects.length)}
            </strong>{' '}
            of <strong className="text-slate-900 dark:text-white font-mono">{filteredProjects.length}</strong> Projects
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Page Number Indicators */}
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
                        ? 'bg-emerald-600 text-white shadow-xs'
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
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
