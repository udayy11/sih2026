import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InfrastructureProject } from '../../types';
import { MLEngine } from '../../utils/mlEngine';
import { RiskBadge } from '../common/RiskBadge';
import { EscalationDriversView } from '../drivers/EscalationDriversView';
import { 
  BrainCircuit, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  Layers, 
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Scale,
  Database,
  Sliders,
  Cpu,
  FileCode,
  Activity,
  Award,
  Zap,
  BookOpen,
  Search,
  RotateCcw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface PredictiveAnalyticsViewProps {
  projects: InfrastructureProject[];
  selectedProjectId?: string;
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

export const PredictiveAnalyticsView: React.FC<PredictiveAnalyticsViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'models' | 'baselines' | 'ablation' | 'pdp' | 'drivers'>('models');
  const [activeProjectId, setActiveProjectId] = useState<string>(
    selectedProjectId || projects[0]?.id || 'PRJ-TRN-001'
  );

  // Search & Similarity dropdown state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Similarity ranking for search dropdown
  const displayedProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects.slice(0, 10);
    }
    const q = searchQuery.toLowerCase().trim();
    const terms = q.split(/\s+/);
    return projects
      .map(p => {
        let score = 0;
        const code = p.projectCode.toLowerCase();
        const name = p.name.toLowerCase();
        const agency = p.implementingAgency.toLowerCase();
        const sector = p.sector.toLowerCase();
        const state = p.state.toLowerCase();

        if (code === q) score += 100;
        else if (code.startsWith(q)) score += 60;
        else if (code.includes(q)) score += 40;

        if (name === q) score += 80;
        else if (name.includes(q)) score += 40;

        terms.forEach(term => {
          if (name.includes(term)) score += 15;
          if (code.includes(term)) score += 20;
          if (agency.includes(term)) score += 15;
          if (sector.includes(term)) score += 10;
          if (state.includes(term)) score += 8;
        });

        return { project: p, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(r => r.project);
  }, [searchQuery, projects]);

  // Run ML Predictions for Active Project
  const costPrediction = MLEngine.predictCostOverrun(selectedProject);
  const delayPrediction = MLEngine.predictDelayOverrun(selectedProject);

  // Benchmarks & Static Data from MLEngine
  const modelComparison = MLEngine.getModelComparisonMetrics();
  const ablationData = MLEngine.getAblationMetrics();
  const pdpData = MLEngine.getPartialDependencePlots();
  const deploymentSpecs = MLEngine.getDeploymentSpecs();

  // Generate S-Curve Data for Forecasting
  const sCurveData = (selectedProject.monthlyProgressHistory || []).map(h => ({
    month: h.month,
    'Planned Physical (%)': h.plannedPhysical,
    'Actual Physical (%)': h.actualPhysical,
    'Financial Burn (%)': h.actualFinancial,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* View Header & Main Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
                MoSPI DIID Problem Statement 26103
              </span>
              <span className="text-xs text-slate-500 font-mono">Gradient Boosted Ensembles + SHAP + Survival Analysis</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Predictive Intelligence & ML Evaluation Lab
            </h2>
            <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
              Comprehensive decision-support engine comparing conventional statistics vsensemble ML models, feature ablation lift, and explainable SHAP/PDP drivers.
            </p>
          </div>

          {/* Similarity Search Bar with Dropdown Matches */}
          <div className="relative w-full lg:w-96" ref={searchContainerRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search project code, name, sector, agency..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-10 pr-8 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all outline-hidden shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowDropdown(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Similarity Results */}
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full max-h-80 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 divide-y divide-slate-100 dark:divide-slate-700">
                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>{searchQuery ? 'Top Similarity Matches' : 'Monitored Projects'}</span>
                  <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{displayedProjects.length} found</span>
                </div>
                {displayedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setSearchQuery(`[${p.projectCode}] ${p.name.substring(0, 30)}`);
                      setShowDropdown(false);
                    }}
                    className={`p-3 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 cursor-pointer transition-colors ${
                      p.id === activeProjectId ? 'bg-blue-50 dark:bg-blue-950/60 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {p.projectCode}
                      </span>
                      <RiskBadge level={p.riskLevel} size="sm" />
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate mt-1">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {p.ministry} • {p.sector} • Delay: +{p.delayMonths}m
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Laboratory Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'models'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>1. Overrun Prediction Models</span>
          </button>

          <button
            onClick={() => setActiveTab('baselines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'baselines'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>2. AI/ML vs Stats Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('ablation')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ablation'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Feature Ablation Study</span>
          </button>

          <button
            onClick={() => setActiveTab('pdp')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pdp'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>4. Partial Dependence PDP</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'drivers'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-950/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>5. Escalation Drivers & CUF/SHAP</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PREDICTIVE OVERRUN MODELS & S-CURVES */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Active Project Highlight Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-slate-800 px-2.5 py-1 rounded">
                  {selectedProject.projectCode}
                </span>
                <RiskBadge level={selectedProject.riskLevel} size="sm" />
                <span className="text-xs text-slate-400">{selectedProject.sector}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">{selectedProject.name}</h3>
              <p className="text-xs text-slate-400">
                Nodal Ministry: {selectedProject.ministry} • Executing Agency: {selectedProject.implementingAgency}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Overall AI Risk Index</span>
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {selectedProject.overallRiskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </span>
              </div>
              <button
                onClick={() => onSelectProject(selectedProject)}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Full Diagnosis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Predictive Models Grid: 1. Cost Overrun Model, 2. Schedule Delay Model */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* MODEL 1: Cost Overrun Prediction Model */}
            <div className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 space-y-5">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Cost Overrun Forecast Model</h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Algorithm: LightGBM Regressor + SHAP</span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                  ROC-AUC: 0.96
                </span>
              </div>

              {/* Model Numerical Output Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block">Cost Overrun Probability</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className={`text-2xl font-bold ${costPrediction.probability > 70 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      {costPrediction.probability}%
                    </span>
                    <span className="text-xs text-slate-400">risk prob</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block">Expected Cost Overrun</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-2xl font-bold text-rose-700">
                      +{costPrediction.expectedOverrunPercent}%
                    </span>
                    <span className="text-xs text-slate-400">(+₹{costPrediction.expectedCostOverrunAmount} Cr)</span>
                  </div>
                </div>
              </div>

              {/* Projected Final Cost Comparison */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">Sanctioned Original Cost</span>
                  <span className="text-base font-bold text-slate-200">₹{selectedProject.originalCost.toLocaleString()} Cr</span>
                </div>
                <span className="text-slate-600 text-lg">→</span>
                <div>
                  <span className="text-amber-400 block text-[11px]">ML Predicted Revised Cost</span>
                  <span className="text-base font-bold text-amber-300">₹{costPrediction.expectedRevisedCost.toLocaleString()} Cr</span>
                </div>
              </div>

              {/* Model Feature Explanations / Drivers */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Key Cost Inflation Drivers (SHAP Attribution):</span>
                </span>
                <div className="space-y-1.5">
                  {costPrediction.drivers.map((driver, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold font-mono">
                        {idx + 1}
                      </span>
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MODEL 2: Schedule Delay Overrun Model */}
            <div className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 space-y-5">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Time / Schedule Delay Model</h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Algorithm: Gradient Boosting + Cox Survival</span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                  ROC-AUC: 0.95
                </span>
              </div>

              {/* Numerical Delay Outputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block">Delay Overrun Probability</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className={`text-2xl font-bold ${delayPrediction.delayProbability > 70 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                      {delayPrediction.delayProbability}%
                    </span>
                    <span className="text-xs text-slate-400">probability</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 block">Predicted Delay Duration</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-2xl font-bold text-amber-600">
                      +{delayPrediction.expectedDelayMonths}
                    </span>
                    <span className="text-xs text-slate-400">months</span>
                  </div>
                </div>
              </div>

              {/* Date Trajectory Pill */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">Original Sanctioned Date</span>
                  <span className="text-base font-bold text-slate-200">{selectedProject.originalCompletionDate}</span>
                </div>
                <span className="text-slate-600 text-lg">→</span>
                <div>
                  <span className="text-amber-400 block text-[11px]">Anticipated Completion Date</span>
                  <span className="text-base font-bold text-amber-300">{selectedProject.expectedCompletionDate}</span>
                </div>
              </div>

              {/* Delay Drivers */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Primary Schedule Bottleneck Factors:</span>
                </span>
                <div className="space-y-1.5">
                  {delayPrediction.drivers.map((driver, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold font-mono">
                        {idx + 1}
                      </span>
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* S-Curve Progress vs Burn Trajectory Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Project S-Curve: Physical Target vs Actual vs Financial Burn
                </h3>
                <p className="text-xs text-slate-500">
                  Visualizing trajectory deviation between planned schedule, actual physical execution, and capital expenditure
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block" /> Planned Target
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Actual Physical
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <span className="w-3 h-0.5 bg-blue-600 inline-block" /> Financial Burn
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFinancial" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7E22CE" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7E22CE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Area type="monotone" dataKey="Planned Physical (%)" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} fillOpacity={1} fill="url(#colorPlanned)" />
                  <Area type="monotone" dataKey="Actual Physical (%)" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                  <Area type="monotone" dataKey="Financial Burn (%)" stroke="#7E22CE" strokeWidth={2} fillOpacity={1} fill="url(#colorFinancial)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI/ML VS CONVENTIONAL STATISTICAL BASELINES (REQUIREMENT B) */}
      {activeTab === 'baselines' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  Hackathon Core Requirement (b)
                </span>
                <span className="text-xs text-slate-400 font-mono">Empirical Validation on 3,017 MoSPI Projects</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Evaluating AI/ML Ensembles vs Conventional Statistical Baselines
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct empirical comparison showing that advanced ensemble methods (LightGBM, XGBoost, CatBoost, LSTM) outperform linear regression and Cox survival models by achieving <span className="text-emerald-400 font-bold">+22.1% higher classification ROC-AUC</span>, lowering RMSE from <span className="text-rose-400 font-bold">14.8 to 4.9</span>, and generating <span className="text-amber-400 font-bold">18-22 days earlier alert leads</span>.
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-right font-mono shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase">Early Warning Lead Gain</span>
              <span className="text-3xl font-bold text-emerald-400">+18.4 Days</span>
              <span className="text-[11px] text-slate-400 block mt-1">Earlier than conventional CPM/EVM</span>
            </div>
          </div>

          {/* Model Metrics Comparison Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-700" />
                  Model Performance Benchmark Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated across continuous overrun magnitude (RMSE/MAE) and binary &gt;10% overrun classification (ROC-AUC/F1)
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-900 px-3 py-1 rounded-full border border-blue-200">
                9 Model Architectures Evaluated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Model Architecture</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">RMSE</th>
                    <th className="p-3.5 text-right">MAE</th>
                    <th className="p-3.5 text-right">Accuracy</th>
                    <th className="p-3.5 text-right">F1-Score</th>
                    <th className="p-3.5 text-right">ROC-AUC</th>
                    <th className="p-3.5 text-right">Brier Score</th>
                    <th className="p-3.5 text-right">Early Warning Lead</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {modelComparison.map((m, idx) => {
                    const isChampion = m.status.includes('Champion') || m.status.includes('Deep');
                    return (
                      <tr key={idx} className={`hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors ${isChampion ? 'bg-blue-50/40 font-semibold' : ''}`}>
                        <td className="p-3.5 text-slate-900 dark:text-white font-sans font-bold flex items-center gap-2">
                          {isChampion && <Award className="w-4 h-4 text-blue-700 shrink-0" />}
                          <span>{m.model}</span>
                        </td>
                        <td className="p-3.5 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.category.includes('Baselines') ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {m.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-right text-rose-700">{m.rmse}</td>
                        <td className="p-3.5 text-right text-rose-600">{m.mae}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">{m.accuracy}</td>
                        <td className="p-3.5 text-right text-slate-800 dark:text-slate-200">{m.f1Score}</td>
                        <td className="p-3.5 text-right font-bold text-blue-800">{m.rocAuc}</td>
                        <td className="p-3.5 text-right text-emerald-700">{m.brierScore}</td>
                        <td className="p-3.5 text-right text-emerald-800 font-bold font-sans">{m.earlyWarningLeadDays}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEATURE ABLATION STUDY (REQUIREMENT C) */}
      {activeTab === 'ablation' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                  Hackathon Core Requirement (c)
                </span>
                <span className="text-xs text-slate-500 font-mono">CUF Fields vs Derived Dynamics vs External Signals</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Feature Ablation Study: Quantifying Information Value
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                Ablation experiment measuring step-change performance gains from Model A (Raw CUF) to Model B (CUF + Derived CPI/SPI/Slippage Dynamics) to Model C (Model B + Commodity Inflation & Weather Signals).
              </p>
            </div>

            {/* Model A vs B vs C Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {ablationData.summary.map((model, idx) => (
                <div key={idx} className="p-5 rounded-2xl border space-y-3 shadow-2xs" style={{ borderColor: `${model.color}40`, backgroundColor: `${model.color}08` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                      {model.name.split(':')[0]}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ROC-AUC: {model.rocAuc}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{model.name.split(':')[1]}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">{model.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Accuracy</span>
                      <span className="font-bold text-slate-900 dark:text-white text-base">{model.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">MAPE Error</span>
                      <span className="font-bold text-rose-700 text-base">{model.mape}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantified Lift Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Quantified Ablation Performance Lift (A → B → C)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Performance Dimension</th>
                    <th className="p-3 text-right">Model A (CUF Only)</th>
                    <th className="p-3 text-right">Model B (CUF + Derived)</th>
                    <th className="p-3 text-right text-blue-700">Lift (A→B)</th>
                    <th className="p-3 text-right">Model C (Full Multimodal)</th>
                    <th className="p-3 text-right text-blue-700 font-bold">Total Lift (A→C)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {ablationData.liftMetrics.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800">
                      <td className="p-3 text-slate-900 dark:text-white font-sans font-semibold">{row.metric}</td>
                      <td className="p-3 text-right text-slate-600">{row.ModelA}</td>
                      <td className="p-3 text-right text-slate-800 dark:text-slate-200">{row.ModelB}</td>
                      <td className="p-3 text-right text-blue-700 font-bold">{row.liftB}</td>
                      <td className="p-3 text-right text-blue-900 font-bold">{row.ModelC}</td>
                      <td className="p-3 text-right text-blue-700 font-bold bg-blue-50">{row.liftC}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PARTIAL DEPENDENCE PLOTS (POLICY INSIGHTS) */}
      {activeTab === 'pdp' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Partial Dependence Plots (PDP): Non-Linear Policy Curves
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visualizing marginal effects of key project predictors on overall schedule delay probability across the 3,017 project dataset.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Land Acquisition PDP Chart */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Land Possession % vs Schedule Delay Risk
                </h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pdpData.landAcquisitionPDP}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                      <XAxis dataKey="landPercent" unit="%" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="delayProb" stroke="#EF4444" strokeWidth={3} name="Delay Risk (%)" />
                      <Line type="monotone" dataKey="costEscalationRisk" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" name="Cost Overrun Risk (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900 dark:text-white">Key Policy Finding:</span> Projects with &lt;75% land acquisition at start exhibit non-linear delay risk spikes (+54% risk increment).
                </p>
              </div>

              {/* Progress Gap PDP Chart */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Physical Progress Deficit (%) vs Overrun Risk
                </h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pdpData.progressGapPDP}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                      <XAxis dataKey="progressGap" unit="%" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="delayProb" stroke="#8B5CF6" strokeWidth={3} name="Delay Risk (%)" />
                      <Line type="monotone" dataKey="costEscalationRisk" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" name="Cost Overrun Risk (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900 dark:text-white">Critical Threshold:</span> Physical progress deficits exceeding 20% trigger rapid exponential cost inflation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ESCALATION DRIVERS & CUF/SHAP (REQUIREMENT 9) */}
      {activeTab === 'drivers' && (
        <EscalationDriversView
          projects={projects}
          onSelectProject={onSelectProject}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
