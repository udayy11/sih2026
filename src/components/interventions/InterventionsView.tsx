import React, { useState, useMemo } from 'react';
import { InfrastructureProject } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Download, 
  Printer, 
  Building2, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Layers, 
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface InterventionsViewProps {
  projects: InfrastructureProject[];
  selectedProjectId?: string;
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const InterventionsView: React.FC<InterventionsViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onNavigate,
}) => {
  const highRiskProjects = projects.filter(
    p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH'
  );

  // Search & Pagination States
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 6;

  const searchedProjects = useMemo(() => {
    return highRiskProjects.filter(p => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q) ||
        p.ministry.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        (p.detectedIssue || '').toLowerCase().includes(q) ||
        (p.recommendedIntervention || '').toLowerCase().includes(q)
      );
    });
  }, [highRiskProjects, searchTerm]);

  const totalPages = Math.ceil(searchedProjects.length / projectsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * projectsPerPage;
  const paginatedProjects = searchedProjects.slice(startIndex, startIndex + projectsPerPage);

  const [activeProjectId, setActiveProjectId] = useState<string>(
    selectedProjectId || highRiskProjects[0]?.id || projects[0]?.id
  );

  const selectedProject = projects.find(p => p.id === activeProjectId) || searchedProjects[0] || projects[0];
  const [showMemoModal, setShowMemoModal] = useState(false);

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const downloadDirectiveMemo = () => {
    const text = `=============================================================================
GOVERNMENT OF INDIA
MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION (MoSPI)
PROJECT MONITORING DIVISION - NIRMAANX INFRASTRUCTURE INTELLIGENCE
=============================================================================

OFFICIAL DECISION-SUPPORT INTERVENTION MEMORANDUM
Date of Issue: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
File Ref No: MoSPI/PMD/NIRMAANX/${selectedProject.projectCode}/${new Date().getFullYear()}

PROJECT IDENTITY:
-----------------
Project Code         : ${selectedProject.projectCode}
Project Name         : ${selectedProject.name}
Nodal Ministry       : ${selectedProject.ministry}
Implementing Agency  : ${selectedProject.implementingAgency}
Lead EPC Contractor  : ${selectedProject.contractorName}
Location             : ${selectedProject.state} (${selectedProject.district})

DIAGNOSTIC STATUS & RISK ASSESSMENT:
------------------------------------
Overall AI Risk Score: ${selectedProject.overallRiskScore} / 100 [${selectedProject.riskLevel}]
Original Approved Cost: ₹${selectedProject.originalCost} Crore
Current Revised Cost : ₹${selectedProject.revisedCost} Crore (+${selectedProject.costOverrunPercent}%)
Physical Execution   : ${selectedProject.physicalProgress}% (Planned Target: ${selectedProject.plannedPhysicalProgress}%)
Financial Burn       : ${selectedProject.financialProgress}% (Expenditure: ₹${selectedProject.expenditure} Cr)
Schedule Slippage    : ${selectedProject.delayMonths} Months (Revised ECD: ${selectedProject.expectedCompletionDate})

1. DETECTED CRITICAL ISSUE:
---------------------------
${selectedProject.detectedIssue}

2. STATISTICAL & SATELLITE EVIDENCE:
------------------------------------
${selectedProject.evidence}

3. PRESCRIPTIVE INTERVENTION DIRECTIVE:
---------------------------------------
${selectedProject.recommendedIntervention}

ENFORCING AUTHORITY & ESCALATION PATHWAY:
-----------------------------------------
Designated Authority : ${selectedProject.interventionAuthority}
Target Action Window : Within 14 Calendar Days
Follow-Up Review     : Next NIP / PMG Review Meeting

=============================================================================
CONFIDENTIAL & PRIVILEGED - FOR OFFICIAL USE ONLY (MoSPI NIRMAANX PORTAL)
=============================================================================
`;

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `MoSPI_Directive_${selectedProject.projectCode}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Stats Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              Prescriptive Decision-Support Framework
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Actionable Interventions: {highRiskProjects.length} Projects
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recommended Interventions & Directives
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Structured three-tier prescription format: <strong className="text-slate-700 dark:text-slate-300">Detected Issue → Empirical Evidence → Actionable Directive</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMemoModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-amber-300 hover:bg-slate-800 text-xs font-bold transition-all shadow-md"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>View Official Directive Memo</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Projects Sidebar on Left, Active Prescription on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of High-Risk Projects with Search & Pagination */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              High-Risk Project Registry
            </span>
            <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
              {searchedProjects.length} Filtered
            </span>
          </div>

          {/* Search Bar with Explicit Search Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search code, name, sector, ministry..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs shrink-0"
              title="Execute Search"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            {searchTerm && (
              <button
                onClick={handleResetSearch}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition-all shrink-0"
                title="Reset search"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Paginated Project Cards List */}
          <div className="space-y-2 min-h-[420px]">
            {paginatedProjects.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
                No high-risk projects matched your search.
              </div>
            ) : (
              paginatedProjects.map((p) => {
                const isSelected = p.id === activeProjectId;

                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProjectId(p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-400'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {p.projectCode}
                      </span>
                      <RiskBadge level={p.riskLevel} size="sm" />
                    </div>

                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                      {p.name}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                      <span>Delay: <strong className="text-rose-600">+{p.delayMonths} mos</strong></span>
                      <span>Cost Overrun: <strong className="text-rose-600">+{p.costOverrunPercent}%</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Interventions Left Column Pagination Controls */}
          {searchedProjects.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                Page {safeCurrentPage} of {totalPages} ({searchedProjects.length} total)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                  {safeCurrentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Prescriptive 3-Box Protocol */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Active Project Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">
                  {selectedProject.projectCode}
                </span>
                <RiskBadge level={selectedProject.riskLevel} size="sm" />
                <span className="text-xs text-slate-400">{selectedProject.sector}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{selectedProject.name}</h3>
              <p className="text-xs text-slate-400">
                {selectedProject.ministry} • State: {selectedProject.state}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadDirectiveMemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Memo</span>
              </button>
            </div>
          </div>

          {/* BOX 1: DETECTED ISSUE */}
          <div className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-5 border border-rose-200 dark:border-rose-800 shadow-xs space-y-2 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-600 bg-rose-50/10 dark:bg-rose-900/10">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-rose-400 to-red-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>1. Detected Issue</span>
            </div>
            <p className="relative z-10 text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
              {selectedProject.detectedIssue}
            </p>
          </div>

          {/* BOX 2: EVIDENCE */}
          <div className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-5 border border-amber-200 dark:border-amber-800 shadow-xs space-y-2 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-600 bg-amber-50/10 dark:bg-amber-900/10">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>2. Supporting Empirical Evidence & Data Signals</span>
            </div>
            <p className="relative z-10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedProject.evidence}
            </p>
            <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 group-hover:border-amber-200 dark:group-hover:border-amber-700 transition-colors">
                <span className="text-slate-400 block">Physical Progress</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-xs">{selectedProject.physicalProgress}%</strong>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 group-hover:border-amber-200 dark:group-hover:border-amber-700 transition-colors">
                <span className="text-slate-400 block">Financial Progress</span>
                <strong className="text-rose-700 dark:text-rose-400 text-xs">{selectedProject.financialProgress}%</strong>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 group-hover:border-amber-200 dark:group-hover:border-amber-700 transition-colors">
                <span className="text-slate-400 block">Schedule Delay</span>
                <strong className="text-rose-700 dark:text-rose-400 text-xs">+{selectedProject.delayMonths} mos</strong>
              </div>
            </div>
          </div>

          {/* BOX 3: RECOMMENDED INTERVENTION */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-md space-y-3 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/30">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>3. Recommended Policy & Operational Intervention</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-800 text-blue-200">
                Action Mandate
              </span>
            </div>

            <p className="relative z-10 text-sm font-medium text-slate-100 leading-relaxed group-hover:text-white transition-colors">
              {selectedProject.recommendedIntervention}
            </p>

            <div className="relative z-10 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300">
              <span>
                Nodal Enforcing Body: <strong className="text-amber-300">{selectedProject.interventionAuthority}</strong>
              </span>
              <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                Target Resolution SLA: 14 Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Memo Modal */}
      {showMemoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 max-w-3xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  MoSPI Official Project Intervention Memorandum
                </h3>
              </div>
              <button
                onClick={() => setShowMemoModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Close ✕
              </button>
            </div>

            {/* Memo Document Body */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4 max-h-[60vh] overflow-y-auto leading-relaxed">
              <div className="text-center border-b border-slate-300 dark:border-slate-700 pb-3">
                <div className="font-bold text-sm">GOVERNMENT OF INDIA</div>
                <div className="text-slate-600">MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION</div>
                <div className="text-slate-500 text-[11px]">PROJECT MONITORING DIVISION (NIRMAANX INFRASTRUCTURE DECISION ENGINE)</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 dark:border-slate-700 pb-3">
                <div><strong>Ref No:</strong> MoSPI/PMD/{selectedProject.projectCode}/2026</div>
                <div><strong>Date:</strong> 29-Aug-2026</div>
                <div><strong>Project:</strong> {selectedProject.name}</div>
                <div><strong>Ministry:</strong> {selectedProject.ministry}</div>
                <div><strong>Executing Agency:</strong> {selectedProject.implementingAgency}</div>
                <div><strong>Contractor:</strong> {selectedProject.contractorName}</div>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">1. DETECTED CRITICAL BOTTLENECK:</strong>
                <p className="text-slate-700 dark:text-slate-300">{selectedProject.detectedIssue}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">2. EMPIRICAL DATA EVIDENCE:</strong>
                <p className="text-slate-700 dark:text-slate-300">{selectedProject.evidence}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">3. ACTIONABLE DIRECTIVE & PROTOCOL:</strong>
                <p className="text-slate-900 dark:text-white font-semibold bg-amber-50 p-2.5 rounded border border-amber-200">
                  {selectedProject.recommendedIntervention}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-300 dark:border-slate-700 flex justify-between text-[11px] text-slate-600">
                <span>Action Responsibility: {selectedProject.interventionAuthority}</span>
                <span>Authorised Signatory: Joint Secretary (PMD), MoSPI</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={downloadDirectiveMemo}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Memo (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
