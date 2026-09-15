import { InfrastructureProject, EarlyWarningAlert } from '../types';
import { getAllMospiProjects } from './projectParser';

// Official MoSPI Q1 2025-26 Central Sector Infrastructure Projects (Costing Rs. 150 Crore & above)
export const mockProjects: InfrastructureProject[] = getAllMospiProjects();

export const MOCK_PROJECTS = mockProjects;

// Official Macro-level MoSPI Report Statistics (From Page 4 & 5 of MoSPI Status Report)
export const MOSPI_REPORT_METRICS = {
  reportQuarter: 'Quarter-1 FY 2025-26 (April-June)',
  totalOngoingProjectsCount: 1734,
  totalOngoingOriginalCostCr: 2842540.23,
  totalOngoingRevisedCostCr: 2965542.48,
  totalOngoingAnticipatedCostCr: 3158147.58,
  cumulativeExpenditureCr: 1774657.72,
  expenditureRatioPercent: 56.19,
  megaProjectsCount: 619,
  megaProjectsCostCr: 2332736.46,
  majorProjectsCount: 1115,
  majorProjectsCostCr: 509803.77,
  completedProjectsCount: 116,
  completedProjectsCostCr: 134336.13,
  newlyAddedProjectsCount: 46,
  newlyAddedProjectsCostCr: 51155.24,
  droppedFrozenProjectsCount: 13,
  droppedFrozenProjectsCostCr: 8603.54,
  northEastProjectsCount: 224,
  northEastProjectsCostCr: 212797.85,
  projectsWithProgress80to100Count: 765,
};

// Generate active Early Warnings based on official high-risk projects from the MoSPI report
export function generateEarlyWarnings(projectsList: InfrastructureProject[] = mockProjects): EarlyWarningAlert[] {
  const eligible = (projectsList && projectsList.length > 0) ? projectsList : mockProjects;
  const alerts: EarlyWarningAlert[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  eligible.forEach((p) => {
    // 1. Cost Escalation Alert (Cost overrun >= 10% or >= 50 Cr)
    if (p.costOverrunPercent >= 10 || p.costOverrunAmount >= 50) {
      alerts.push({
        id: `WARN-COST-${p.projectCode || p.id}`,
        projectId: p.id,
        projectName: p.name,
        ministry: p.ministry,
        sector: p.sector,
        state: p.state,
        riskLevel: p.costOverrunPercent >= 30 ? 'CRITICAL' : 'HIGH',
        riskType: 'Cost Escalation Alert',
        riskScore: Math.min(99, Math.round(p.costRiskScore || (p.costOverrunPercent * 1.5))),
        reason: `Anticipated cost escalation of ₹${p.costOverrunAmount.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent.toFixed(1)}%) exceeding approved budget.`,
        evidenceMetric: `Original: ₹${p.originalCost.toLocaleString('en-IN')} Cr → Revised: ₹${p.revisedCost.toLocaleString('en-IN')} Cr (+${p.costOverrunPercent.toFixed(1)}%)`,
        recommendedAction: p.recommendedIntervention || `Submit Revised Cost Estimate (RCE) to CCEA / PIB for fiscal re-authorization.`,
        alertDate: todayStr,
        status: p.costOverrunPercent >= 30 ? 'Active' : 'Acknowledged',
        actionDeadline: '2026-10-15'
      });
    }

    // 2. Schedule Delay Alert (Delay >= 6 months or target lagging by >= 15%)
    const progressLag = p.plannedPhysicalProgress - p.physicalProgress;
    if (p.delayMonths >= 6 || progressLag >= 15) {
      alerts.push({
        id: `WARN-SCHED-${p.projectCode || p.id}`,
        projectId: p.id,
        projectName: p.name,
        ministry: p.ministry,
        sector: p.sector,
        state: p.state,
        riskLevel: p.delayMonths >= 24 ? 'CRITICAL' : (p.delayMonths >= 12 ? 'HIGH' : 'MEDIUM'),
        riskType: 'Schedule Delay Alert',
        riskScore: Math.min(99, Math.round(p.scheduleRiskScore || (p.delayMonths * 2.2))),
        reason: `Project is delayed by ${p.delayMonths} months. Physical execution (${p.physicalProgress.toFixed(1)}%) is lagging target (${p.plannedPhysicalProgress.toFixed(1)}%).`,
        evidenceMetric: `Delay: +${p.delayMonths} mos | Expected COD: ${p.expectedCompletionDate}`,
        recommendedAction: `Convene Project Monitoring Group (PMG) inter-departmental review with ${p.implementingAgency || 'implementing agency'}.`,
        alertDate: todayStr,
        status: p.delayMonths >= 18 ? 'Active' : 'Action Initiated',
        actionDeadline: '2026-10-01'
      });
    }

    // 3. Progress-Expenditure Divergence (Financial Progress outstripping Physical Progress by >= 10%)
    const burnDivergence = p.financialProgress - p.physicalProgress;
    if (burnDivergence >= 10) {
      alerts.push({
        id: `WARN-BURN-${p.projectCode || p.id}`,
        projectId: p.id,
        projectName: p.name,
        ministry: p.ministry,
        sector: p.sector,
        state: p.state,
        riskLevel: burnDivergence >= 20 ? 'CRITICAL' : 'HIGH',
        riskType: 'Progress-Expenditure Divergence',
        riskScore: Math.min(95, Math.round(60 + burnDivergence * 1.5)),
        reason: `Financial capital burn (${p.financialProgress.toFixed(1)}%) is outpacing physical progress (${p.physicalProgress.toFixed(1)}%) by ${burnDivergence.toFixed(1)}%.`,
        evidenceMetric: `Expenditure: ₹${p.expenditure.toLocaleString('en-IN')} Cr (${p.financialProgress.toFixed(1)}%) vs Physical: ${p.physicalProgress.toFixed(1)}%`,
        recommendedAction: `Conduct forensic audit of work completion certificates and withhold milestone release tranches pending physical verification.`,
        alertDate: todayStr,
        status: 'Active',
        actionDeadline: '2026-09-30'
      });
    }

    // 4. Regulatory Stagnation (Forest clearance pending or Stage-2 pending, or Land acquisition lagging < 70%)
    if (p.forestClearance === 'Pending' || p.forestClearance === 'Stage-2 Pending' || (p.landAcquiredPercent > 0 && p.landAcquiredPercent < 70)) {
      alerts.push({
        id: `WARN-REG-${p.projectCode || p.id}`,
        projectId: p.id,
        projectName: p.name,
        ministry: p.ministry,
        sector: p.sector,
        state: p.state,
        riskLevel: p.forestClearance === 'Pending' ? 'HIGH' : 'MEDIUM',
        riskType: 'Regulatory Stagnation',
        riskScore: 72,
        reason: `Critical statutory bottleneck: Forest clearance is ${p.forestClearance} and Land Acquired is ${p.landAcquiredPercent}%.`,
        evidenceMetric: `Forest: ${p.forestClearance} | Land Acquisition: ${p.landAcquiredPercent}%`,
        recommendedAction: `Escalate to State Empowered Committee under Chief Secretary, ${p.state} for fast-track statutory clearance.`,
        alertDate: todayStr,
        status: 'Active',
        actionDeadline: '2026-10-31'
      });
    }

    // 5. Contractor Execution Risk
    if (p.contractorRiskRating === 'High Default Risk') {
      alerts.push({
        id: `WARN-CONT-${p.projectCode || p.id}`,
        projectId: p.id,
        projectName: p.name,
        ministry: p.ministry,
        sector: p.sector,
        state: p.state,
        riskLevel: 'CRITICAL',
        riskType: 'Contractor Anomaly',
        riskScore: 88,
        reason: `Contractor ${p.contractorName || 'assigned'} flagged with High Default Risk rating.`,
        evidenceMetric: `Contractor: ${p.contractorName} | Risk Rating: High Default Risk`,
        recommendedAction: `Review contractor performance guarantee and consider joint venture substitution or supplemental contracting.`,
        alertDate: todayStr,
        status: 'Active',
        actionDeadline: '2026-10-05'
      });
    }
  });

  // Sort by risk priority: CRITICAL > HIGH > MEDIUM > LOW, then by riskScore desc
  const riskPriority: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  alerts.sort((a, b) => {
    const diff = (riskPriority[a.riskLevel] || 0) - (riskPriority[b.riskLevel] || 0);
    if (diff !== 0) return (riskPriority[b.riskLevel] || 0) - (riskPriority[a.riskLevel] || 0);
    return b.riskScore - a.riskScore;
  });

  return alerts;
}
