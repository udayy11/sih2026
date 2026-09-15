import React, { useState, useEffect, useMemo } from 'react';
import { InfrastructureProject } from '../../types';
import {
  MessageSquare,
  Users,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Camera,
  Upload,
  ArrowRight,
  ChevronRight,
  AlertOctagon,
  FileCheck,
  Send,
  RotateCcw,
  Building2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Info,
  X,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  BadgeAlert
} from 'lucide-react';
import { FeedbackCase, TimelineEvent, FeedbackEvidence } from '../../../backend/feedback';

interface FeedbackViewProps {
  projects: InfrastructureProject[];
  currentUser?: { name: string; role: string; department?: string; id?: string };
  onSelectProject?: (project: InfrastructureProject) => void;
}

// Initial pre-seeded cases for demonstration and offline/static fallback
const INITIAL_FEEDBACK_CASES: FeedbackCase[] = [
  {
    id: 'fb-001',
    case_id: 'CASE-2026-BLR-001',
    project_id: 'PRJ-BLR-001',
    project_code: 'N28000058',
    project_name: 'BANGALORE METRO RAIL PROJECT PHASE-2',
    citizen_id: 'usr-citizen-01',
    citizen_name: 'Aarav Sharma (RWA Whitefield)',
    citizen_contact: 'aarav.sharma@whitefieldrwa.org',
    feedback_type: 'Ground-Level Issue',
    category: 'Construction Safety & Waterlogging',
    description: 'Severe structural cracking in temporary retaining wall near Pier 142 on Outer Ring Road corridor, causing deep water accumulation during recent rains and acute pedestrian safety hazards.',
    latitude: 12.9982,
    longitude: 77.6925,
    location: 'Near Outer Ring Road Mahadevapura Junction, Pier 142',
    priority: 'HIGH',
    status: 'VERIFIED',
    evidence: [
      {
        id: 'ev-001',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
        fileName: 'pier_142_waterlogging.jpg',
        fileType: 'image/jpeg',
        uploadedAt: '2026-03-10T10:15:00Z',
        uploadedBy: 'Aarav Sharma'
      }
    ],
    assigned_to: {
      tracker_id: 'usr-003',
      tracker_name: 'Piyush (MoSPI PMG Field Officer)',
      assigned_at: '2026-03-10T14:30:00Z',
      notes: 'Priority inspection requested due to ORR traffic vulnerability.'
    },
    verification: {
      verified: true,
      verified_by: 'Piyush (MoSPI PMG)',
      verified_at: '2026-03-11T11:45:00Z',
      notes: 'On-site physical inspection confirmed 1.2m soil erosion and drainage blockage behind sheet piles. Construction barricades were compromised.',
      evidence: [
        {
          id: 'ev-002',
          url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80',
          fileName: 'site_inspection_verified.jpg',
          fileType: 'image/jpeg',
          uploadedAt: '2026-03-11T11:45:00Z',
          uploadedBy: 'Piyush'
        }
      ]
    },
    ai_analysis: {
      suggested_category: 'Construction Quality & Safety',
      suggested_priority: 'HIGH',
      is_potential_mismatch: true,
      summary: 'Potential Ground Reality Mismatch — Reported civil progress does not reflect local stormwater barricade collapse at Pier 142.'
    },
    timeline: [
      {
        id: 'tl-1',
        status: 'SUBMITTED',
        title: 'Feedback Lodged by Citizen',
        description: 'Aarav Sharma submitted ground report with photographic evidence.',
        actor: 'Aarav Sharma (Citizen/RWA)',
        timestamp: '2026-03-10T10:15:00Z'
      },
      {
        id: 'tl-2',
        status: 'UNDER REVIEW',
        title: 'Admin Review & Triage',
        description: 'Classified as Ground-Level Issue; assigned high priority.',
        actor: 'Uday (DIID Admin)',
        timestamp: '2026-03-10T11:00:00Z'
      },
      {
        id: 'tl-3',
        status: 'ASSIGNED TO TRACKER',
        title: 'Assigned to MoSPI PMG Tracker',
        description: 'Case dispatched to Project Tracker Piyush for ground physical audit.',
        actor: 'Uday (Admin)',
        timestamp: '2026-03-10T14:30:00Z'
      },
      {
        id: 'tl-4',
        status: 'VERIFIED',
        title: 'Issue Verified On-Site',
        description: 'Field inspection confirmed drainage and barricade defects.',
        actor: 'Piyush (Project Tracker)',
        timestamp: '2026-03-11T11:45:00Z'
      }
    ],
    created_at: '2026-03-10T10:15:00Z',
    updated_at: '2026-03-11T11:45:00Z'
  },
  {
    id: 'fb-002',
    case_id: 'CASE-2026-DEL-002',
    project_id: 'PRJ-DEL-002',
    project_code: 'R11000042',
    project_name: 'DELHI-MEERUT REGIONAL RAPID TRANSIT SYSTEM (RRTS)',
    citizen_id: 'usr-citizen-02',
    citizen_name: 'Dr. Sunita Sen',
    citizen_contact: 'sunita.sen@delhiuniversity.ac.in',
    feedback_type: 'Information / Query',
    category: 'Completion Timeline & Station Access',
    description: 'Requesting verified official update regarding the commissioning date of Sarai Kale Khan multimodal interchange and skywalk connectivity to Hazrat Nizamuddin railway station.',
    latitude: 28.5888,
    longitude: 77.2536,
    location: 'Sarai Kale Khan RRTS Station Hub',
    priority: 'MEDIUM',
    status: 'REPLIED',
    evidence: [],
    admin_reply: {
      replied_by: 'Uday (DIID Admin)',
      replied_at: '2026-03-12T16:20:00Z',
      reply_text: 'Thank you for reaching out. As per MoSPI Table-7 Monthly Report, civil works at Sarai Kale Khan are 92% complete. Integrated multimodal skywalk linking Hazrat Nizamuddin is scheduled for safety inspection in Q3 2026, with revenue operations projected by November 2026.'
    },
    ai_analysis: {
      suggested_category: 'Progress & Completion Query',
      suggested_priority: 'MEDIUM',
      is_potential_mismatch: false,
      summary: 'Public enquiry regarding Sarai Kale Khan multimodal commissioning target.'
    },
    timeline: [
      {
        id: 'tl-1',
        status: 'SUBMITTED',
        title: 'Information Query Submitted',
        description: 'Citizen enquired regarding Sarai Kale Khan station opening date.',
        actor: 'Dr. Sunita Sen',
        timestamp: '2026-03-12T09:30:00Z'
      },
      {
        id: 'tl-2',
        status: 'UNDER REVIEW',
        title: 'Admin Review',
        description: 'Triaged directly for informational reply.',
        actor: 'Uday (Admin)',
        timestamp: '2026-03-12T11:15:00Z'
      },
      {
        id: 'tl-3',
        status: 'REPLIED',
        title: 'Official Response Provided',
        description: 'Admin supplied verified MoSPI timeline and statutory inspection targets.',
        actor: 'Uday (Admin)',
        timestamp: '2026-03-12T16:20:00Z'
      },
      {
        id: 'tl-4',
        status: 'CLOSED',
        title: 'Case Closed',
        description: 'Direct informational response completed.',
        actor: 'System',
        timestamp: '2026-03-12T16:20:00Z'
      }
    ],
    created_at: '2026-03-12T09:30:00Z',
    updated_at: '2026-03-12T16:20:00Z'
  },
  {
    id: 'fb-003',
    case_id: 'CASE-2026-MUM-003',
    project_id: 'PRJ-MUM-003',
    project_code: 'W14000019',
    project_name: 'MUMBAI TRANS HARBOUR LINK (ATAL SETU) EXTENSION',
    citizen_id: 'usr-citizen-01',
    citizen_name: 'Aarav Sharma',
    feedback_type: 'Ground-Level Issue',
    category: 'Environmental / Noise Barriers',
    description: 'Noise barriers missing on Sector 16 flyover approach, creating excessive nocturnal acoustic disturbance for surrounding residential towers.',
    latitude: 18.9950,
    longitude: 72.8620,
    location: 'Sewri-Worli Connector Section B',
    priority: 'MEDIUM',
    status: 'CITIZEN CONFIRMATION',
    evidence: [],
    assigned_to: {
      tracker_id: 'usr-003',
      tracker_name: 'Piyush',
      assigned_at: '2026-03-01T10:00:00Z'
    },
    verification: {
      verified: true,
      verified_by: 'Piyush',
      verified_at: '2026-03-03T15:00:00Z',
      notes: 'Verified: Acoustic panels were omitted during initial asphalt resurfacing phase.'
    },
    corrective_action: {
      action_taken: 'Installed 420m Acoustic Dampening Glass Barriers',
      action_description: 'Contractor deployed specialized modular sound-insulating barriers conforming to IRC:SP:112 guidelines.',
      responsible_team: 'MMRDA Highway Civil Works Division',
      action_date: '2026-03-08',
      remarks: 'Noise levels reduced by 18dB during peak traffic trials.',
      recorded_by: 'Piyush',
      recorded_at: '2026-03-08T18:00:00Z'
    },
    admin_review: {
      reviewed_by: 'Uday (DIID Admin)',
      reviewed_at: '2026-03-09T10:00:00Z',
      approved: true,
      remarks: 'Corrective action verified against contractor compliance cert.'
    },
    timeline: [
      {
        id: 'tl-1',
        status: 'SUBMITTED',
        title: 'Citizen Report Filed',
        description: 'Report regarding acoustic barrier omission.',
        actor: 'Aarav Sharma',
        timestamp: '2026-03-01T09:00:00Z'
      },
      {
        id: 'tl-2',
        status: 'ASSIGNED TO TRACKER',
        title: 'Assigned to Field Tracker',
        description: 'Assigned to Tracker Piyush.',
        actor: 'Admin',
        timestamp: '2026-03-01T10:00:00Z'
      },
      {
        id: 'tl-3',
        status: 'VERIFIED',
        title: 'Issue Verified',
        description: 'Site audit confirmed missing barriers.',
        actor: 'Piyush (Tracker)',
        timestamp: '2026-03-03T15:00:00Z'
      },
      {
        id: 'tl-4',
        status: 'CORRECTIVE ACTION',
        title: 'Corrective Action Completed',
        description: '420m noise barriers installed.',
        actor: 'MMRDA / Contractor',
        timestamp: '2026-03-08T18:00:00Z'
      },
      {
        id: 'tl-5',
        status: 'ADMIN REVIEW',
        title: 'Resolution Approved by Admin',
        description: 'Admin verified engineering submission.',
        actor: 'Uday (Admin)',
        timestamp: '2026-03-09T10:00:00Z'
      },
      {
        id: 'tl-6',
        status: 'CITIZEN CONFIRMATION',
        title: 'Pending Citizen Satisfaction',
        description: 'Resolution evidence shared with citizen for confirmation.',
        actor: 'System',
        timestamp: '2026-03-09T10:05:00Z'
      }
    ],
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-03-09T10:05:00Z'
  }
];

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  projects,
  currentUser,
  onSelectProject
}) => {
  // Role switcher for seamless testing: 'Citizen' | 'Admin' | 'Project Tracker'
  const [activeRole, setActiveRole] = useState<'Citizen' | 'Admin' | 'Project Tracker'>(() => {
    if (currentUser?.role === 'Project Tracker') return 'Project Tracker';
    if (currentUser?.role === 'Admin') return 'Admin';
    return 'Citizen';
  });

  // Local storage state initialization
  const [cases, setCases] = useState<FeedbackCase[]>(() => {
    try {
      const stored = localStorage.getItem('nirmaanx_citizen_feedback_cases');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_FEEDBACK_CASES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submit' | 'my-feedback'>('dashboard');

  // Selected Case for Modal View / Actions
  const [selectedCase, setSelectedCase] = useState<FeedbackCase | null>(null);

  // Form State for "Submit Feedback"
  const [formProject, setFormProject] = useState<string>(projects[0]?.id || '');
  const [formType, setFormType] = useState<'Ground-Level Issue' | 'Information / Query'>('Ground-Level Issue');
  const [formCategory, setFormCategory] = useState<string>('Construction Quality & Safety');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formLatitude, setFormLatitude] = useState<string>('');
  const [formLongitude, setFormLongitude] = useState<string>('');
  const [formCitizenName, setFormCitizenName] = useState<string>(currentUser?.name || 'Aarav Sharma (RWA)');
  const [formCitizenContact, setFormCitizenContact] = useState<string>('aarav.sharma@rwa-infra.org');
  const [formEvidenceUrl, setFormEvidenceUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<FeedbackCase | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  // Filter States for Admin / Tracker
  const [filterProject, setFilterProject] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Action Modals State
  const [assignModalCase, setAssignModalCase] = useState<FeedbackCase | null>(null);
  const [assignTrackerName, setAssignTrackerName] = useState<string>('Vrinda (MoSPI PMG Field Officer)');
  const [assignNotes, setAssignNotes] = useState<string>('');

  const [verifyModalCase, setVerifyModalCase] = useState<FeedbackCase | null>(null);
  const [verifyDecision, setVerifyDecision] = useState<'Verified' | 'Not Verified'>('Verified');
  const [verifyNotes, setVerifyNotes] = useState<string>('');

  const [actionModalCase, setActionModalCase] = useState<FeedbackCase | null>(null);
  const [actionTaken, setActionTaken] = useState<string>('');
  const [actionDescription, setActionDescription] = useState<string>('');
  const [actionTeam, setActionTeam] = useState<string>('');
  const [actionRemarks, setActionRemarks] = useState<string>('');

  const [replyModalCase, setReplyModalCase] = useState<FeedbackCase | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const [satisfactionModalCase, setSatisfactionModalCase] = useState<FeedbackCase | null>(null);
  const [satisfactionDecision, setSatisfactionDecision] = useState<boolean>(true);
  const [dissatisfactionReason, setDissatisfactionReason] = useState<string>('');
  const [satisfactionComments, setSatisfactionComments] = useState<string>('');

  // Helper to persist updated case array
  const updateCases = (newCases: FeedbackCase[]) => {
    setCases(newCases);
    try {
      localStorage.setItem('nirmaanx_citizen_feedback_cases', JSON.stringify(newCases));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  // Sync logged in user name
  useEffect(() => {
    if (currentUser?.name && (!formCitizenName || formCitizenName === 'Aarav Sharma (RWA)')) {
      setFormCitizenName(currentUser.name);
    }
  }, [currentUser]);

  // Sync projects dropdown when projects load
  useEffect(() => {
    if (!formProject && projects && projects.length > 0) {
      setFormProject(projects[0].id);
    }
  }, [projects, formProject]);

  // Fetch feedback cases from backend or merge with local storage
  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiData = await res.json();
          if (Array.isArray(apiData) && apiData.length > 0) {
            setCases(prev => {
              const apiIds = new Set(apiData.map((c: FeedbackCase) => c.case_id));
              const localOnly = prev.filter(c => !apiIds.has(c.case_id));
              const merged = [...localOnly, ...apiData];
              try {
                localStorage.setItem('nirmaanx_citizen_feedback_cases', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Backend feedback fetch unavailable, relying on persistent local storage:', err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Duplicate detection check
  useEffect(() => {
    if (!formProject || formDescription.length < 15) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/feedback/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: formProject,
            category: formCategory,
            description: formDescription,
            location: formLocation
          })
        });
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await res.json();
            if (data.isDuplicate) {
              setDuplicateWarning(data);
              return;
            }
          }
        }
      } catch {}

      // Fallback local duplicate check
      const match = cases.find(c =>
        c.project_id === formProject &&
        c.status !== 'CLOSED' &&
        (c.category === formCategory || (c.location && formLocation && c.location.toLowerCase().includes(formLocation.toLowerCase())))
      );
      if (match && formDescription.length > 25) {
        setDuplicateWarning({
          isDuplicate: true,
          message: `Similar issue already reported (${match.case_id}: ${match.category}).`,
          existingCase: match
        });
      } else {
        setDuplicateWarning(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formProject, formCategory, formDescription, formLocation, cases]);

  // Submit Feedback Handler
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      alert('Please provide a description of the issue or inquiry.');
      return;
    }
    if (formType === 'Ground-Level Issue' && !formLocation.trim()) {
      alert('Exact landmark/location is mandatory for ground-level issues.');
      return;
    }

    setIsSubmitting(true);

    const selectedProj = projects.find(p => p.id === formProject) || (projects.length > 0 ? projects[0] : null);
    const pId = selectedProj?.id || formProject || 'PRJ-MOSPI-001';
    const pCode = selectedProj?.projectCode || 'MOSPI-001';
    const pName = selectedProj?.name || 'Infrastructure Project';

    const generatedCaseId = `CASE-2026-IN-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedLat = formLatitude ? parseFloat(formLatitude) : (formType === 'Ground-Level Issue' ? 28.6130 : null);
    const parsedLng = formLongitude ? parseFloat(formLongitude) : (formType === 'Ground-Level Issue' ? 77.0542 : null);

    const evidenceList: FeedbackEvidence[] = formEvidenceUrl ? [
      {
        id: `ev-${Date.now()}`,
        url: formEvidenceUrl,
        fileName: 'citizen_evidence.jpg',
        fileType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
        uploadedBy: formCitizenName || 'Citizen'
      }
    ] : [];

    const localNewCase: FeedbackCase = {
      id: `fb-${Date.now()}`,
      case_id: generatedCaseId,
      project_id: pId,
      project_code: pCode,
      project_name: pName,
      citizen_id: currentUser?.id || 'usr-citizen-01',
      citizen_name: formCitizenName || currentUser?.name || 'Aarav Sharma',
      citizen_contact: formCitizenContact || 'citizen@nirmaanx.gov.in',
      feedback_type: formType,
      category: formCategory,
      description: formDescription.trim(),
      latitude: parsedLat,
      longitude: parsedLng,
      location: formLocation.trim() || 'General Project Vicinity',
      priority: formCategory.includes('Safety') || formCategory.includes('Quality') || formCategory.includes('Defect') ? 'HIGH' : 'MEDIUM',
      status: 'SUBMITTED',
      evidence: evidenceList,
      ai_analysis: {
        suggested_category: formCategory,
        suggested_priority: formCategory.includes('Safety') || formCategory.includes('Quality') ? 'HIGH' : 'MEDIUM',
        is_potential_mismatch: false,
        summary: formType === 'Ground-Level Issue'
          ? `Ground report registered: ${formCategory} at ${formLocation || 'project site'}. Dispatched for triage & verification.`
          : `Informational query registered regarding ${formCategory}. Awaiting MoSPI administrative review.`
      },
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'SUBMITTED',
          title: 'Feedback Lodged by Citizen',
          description: `${formCitizenName || 'Citizen'} submitted ${formType === 'Ground-Level Issue' ? 'ground report with location & evidence' : 'project inquiry'}.`,
          actor: `${formCitizenName || 'Citizen'} (Citizen/RWA)`,
          timestamp: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let createdCase: FeedbackCase = localNewCase;

    try {
      const payload = {
        project_id: pId,
        project_code: pCode,
        project_name: pName,
        citizen_id: currentUser?.id || 'usr-citizen-01',
        citizen_name: formCitizenName,
        citizen_contact: formCitizenContact,
        feedback_type: formType,
        category: formCategory,
        description: formDescription,
        latitude: parsedLat,
        longitude: parsedLng,
        location: formLocation || 'General Project Vicinity',
        evidence: evidenceList
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiCase = await res.json();
          if (apiCase && apiCase.case_id) {
            createdCase = apiCase;
          }
        }
      }
    } catch (err) {
      console.warn('Backend feedback submission API unavailable, using local client persistence:', err);
    }

    // Always succeed seamlessly
    const nextCases = [createdCase, ...cases.filter(c => c.case_id !== createdCase.case_id)];
    updateCases(nextCases);

    setSubmissionSuccess(createdCase);
    setFormDescription('');
    setFormLocation('');
    setFormLatitude('');
    setFormLongitude('');
    setFormEvidenceUrl('');
    setDuplicateWarning(null);
    setIsSubmitting(false);
  };

  // Assign to Tracker Handler
  const handleAssignSubmit = async () => {
    if (!assignModalCase) return;
    const targetCaseId = assignModalCase.case_id;

    let updatedCase: FeedbackCase = {
      ...assignModalCase,
      status: 'ASSIGNED TO TRACKER',
      assigned_to: {
        tracker_id: 'usr-003',
        tracker_name: assignTrackerName,
        assigned_at: new Date().toISOString(),
        notes: assignNotes
      },
      timeline: [
        ...assignModalCase.timeline,
        {
          id: `tl-${Date.now()}`,
          status: 'ASSIGNED TO TRACKER',
          title: 'Assigned to MoSPI PMG Tracker',
          description: `Dispatched to ${assignTrackerName} for physical ground audit. ${assignNotes ? `Notes: ${assignNotes}` : ''}`,
          actor: currentUser?.name || 'Uday (Admin)',
          timestamp: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`/api/feedback/${targetCaseId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracker_id: 'usr-003',
          tracker_name: assignTrackerName,
          notes: assignNotes,
          admin_name: currentUser?.name || 'Uday (DIID Admin)'
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiUpdated = await res.json();
          if (apiUpdated?.case_id) updatedCase = apiUpdated;
        }
      }
    } catch (err) {
      console.warn('Assign API unavailable, updated locally:', err);
    }

    const next = cases.map(c => c.case_id === targetCaseId ? updatedCase : c);
    updateCases(next);
    setAssignModalCase(null);
    setAssignNotes('');
    if (selectedCase?.case_id === targetCaseId) setSelectedCase(updatedCase);
  };

  // Verify Issue Handler
  const handleVerifySubmit = async () => {
    if (!verifyModalCase || !verifyNotes.trim()) {
      alert('Verification notes are mandatory.');
      return;
    }
    const targetCaseId = verifyModalCase.case_id;
    const isVerified = verifyDecision === 'Verified';

    let updatedCase: FeedbackCase = {
      ...verifyModalCase,
      status: (isVerified ? 'VERIFIED' : 'NOT VERIFIED') as any,
      verification: {
        verified: isVerified,
        verified_by: currentUser?.name || 'Vrinda (MoSPI PMG)',
        verified_at: new Date().toISOString(),
        notes: verifyNotes,
        evidence: [
          {
            id: `ev-ver-${Date.now()}`,
            url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80',
            fileName: 'inspection_audit.jpg',
            fileType: 'image/jpeg',
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUser?.name || 'Vrinda'
          }
        ]
      },
      timeline: [
        ...verifyModalCase.timeline,
        {
          id: `tl-${Date.now()}`,
          status: isVerified ? 'VERIFIED' : 'NOT VERIFIED',
          title: isVerified ? 'Issue Verified On-Site' : 'Inspection: Issue Not Verified',
          description: verifyNotes,
          actor: currentUser?.name || 'Vrinda (Project Tracker)',
          timestamp: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`/api/feedback/${targetCaseId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified: isVerified,
          notes: verifyNotes,
          tracker_name: currentUser?.name || 'Vrinda (MoSPI PMG)',
          evidence: updatedCase.verification?.evidence || []
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiUpdated = await res.json();
          if (apiUpdated?.case_id) updatedCase = apiUpdated;
        }
      }
    } catch (err) {
      console.warn('Verify API unavailable, updated locally:', err);
    }

    const next = cases.map(c => c.case_id === targetCaseId ? updatedCase : c);
    updateCases(next);
    setVerifyModalCase(null);
    setVerifyNotes('');
    if (selectedCase?.case_id === targetCaseId) setSelectedCase(updatedCase);
  };

  // Record Corrective Action Handler
  const handleActionSubmit = async () => {
    if (!actionModalCase || !actionTaken.trim() || !actionDescription.trim()) {
      alert('Action taken and description are required.');
      return;
    }
    const targetCaseId = actionModalCase.case_id;

    let updatedCase: FeedbackCase = {
      ...actionModalCase,
      status: 'ADMIN REVIEW',
      corrective_action: {
        action_taken: actionTaken,
        action_description: actionDescription,
        responsible_team: actionTeam || 'Contractor Civil Works Division',
        action_date: new Date().toISOString().split('T')[0],
        remarks: actionRemarks,
        recorded_by: currentUser?.name || 'Vrinda (Tracker)',
        recorded_at: new Date().toISOString()
      },
      timeline: [
        ...actionModalCase.timeline,
        {
          id: `tl-${Date.now()}`,
          status: 'CORRECTIVE ACTION',
          title: 'Corrective Action Recorded',
          description: `${actionTaken}: ${actionDescription}`,
          actor: currentUser?.name || 'Vrinda (Project Tracker)',
          timestamp: new Date().toISOString()
        },
        {
          id: `tl-${Date.now() + 1}`,
          status: 'ADMIN REVIEW',
          title: 'Submitted for MoSPI Admin Review',
          description: 'Resolution evidence forwarded to DIID Administrator for sign-off.',
          actor: 'System',
          timestamp: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`/api/feedback/${targetCaseId}/corrective-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_taken: actionTaken,
          action_description: actionDescription,
          responsible_team: actionTeam || 'Contractor Civil Works Division',
          action_date: new Date().toISOString().split('T')[0],
          remarks: actionRemarks,
          recorded_by: currentUser?.name || 'Vrinda (Tracker)'
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiUpdated = await res.json();
          if (apiUpdated?.case_id) updatedCase = apiUpdated;
        }
      }
    } catch (err) {
      console.warn('Action API unavailable, updated locally:', err);
    }

    const next = cases.map(c => c.case_id === targetCaseId ? updatedCase : c);
    updateCases(next);
    setActionModalCase(null);
    setActionTaken('');
    setActionDescription('');
    setActionTeam('');
    setActionRemarks('');
    if (selectedCase?.case_id === targetCaseId) setSelectedCase(updatedCase);
  };

  // Admin Review Resolution Handler
  const handleAdminReview = async (caseId: string, approved: boolean) => {
    const targetCase = cases.find(c => c.case_id === caseId);
    if (!targetCase) return;

    let updatedCase: FeedbackCase = {
      ...targetCase,
      status: approved ? 'CITIZEN CONFIRMATION' : 'ASSIGNED TO TRACKER',
      admin_review: {
        reviewed_by: currentUser?.name || 'Uday (Admin)',
        reviewed_at: new Date().toISOString(),
        approved,
        remarks: approved ? 'Approved resolution after reviewing compliance evidence.' : 'Requires additional field stabilization.'
      },
      timeline: [
        ...targetCase.timeline,
        {
          id: `tl-${Date.now()}`,
          status: approved ? 'CITIZEN CONFIRMATION' : 'ASSIGNED TO TRACKER',
          title: approved ? 'Admin Approved Resolution' : 'Admin Requested Additional Remediation',
          description: approved ? 'Resolution evidence approved; sent to citizen for confirmation.' : 'Returned to tracker for further remediation.',
          actor: currentUser?.name || 'Uday (DIID Admin)',
          timestamp: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`/api/feedback/${caseId}/admin-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          remarks: approved ? 'Approved resolution after reviewing evidence.' : 'Requires additional field stabilization.',
          admin_name: currentUser?.name || 'Uday (Admin)'
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiUpdated = await res.json();
          if (apiUpdated?.case_id) updatedCase = apiUpdated;
        }
      }
    } catch (err) {
      console.warn('Admin review API unavailable, updated locally:', err);
    }

    const next = cases.map(c => c.case_id === caseId ? updatedCase : c);
    updateCases(next);
    if (selectedCase?.case_id === caseId) setSelectedCase(updatedCase);
  };

  // Direct Reply to Information/Query Handler
  const handleReplySubmit = async () => {
    if (!replyModalCase || !replyText.trim()) {
      alert('Reply message cannot be empty.');
      return;
    }
    const targetCaseId = replyModalCase.case_id;

    let updatedCase: FeedbackCase = {
      ...replyModalCase,
      status: 'REPLIED',
      admin_reply: {
        replied_by: currentUser?.name || 'Uday (DIID Admin)',
        replied_at: new Date().toISOString(),
        reply_text: replyText
      },
      timeline: [
        ...replyModalCase.timeline,
        {
          id: `tl-${Date.now()}`,
          status: 'REPLIED',
          title: 'Official Response Provided',
          description: replyText,
          actor: currentUser?.name || 'Uday (DIID Admin)',
          timestamp: new Date().toISOString()
        },
        {
          id: `tl-${Date.now() + 1}`,
          status: 'CLOSED',
          title: 'Case Closed',
          description: 'Official informational reply completed.',
          actor: 'System',
          timestamp: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`/api/feedback/${targetCaseId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_text: replyText,
          admin_name: currentUser?.name || 'Uday (DIID Admin)'
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiUpdated = await res.json();
          if (apiUpdated?.case_id) updatedCase = apiUpdated;
        }
      }
    } catch (err) {
      console.warn('Reply API unavailable, updated locally:', err);
    }

    const next = cases.map(c => c.case_id === targetCaseId ? updatedCase : c);
    updateCases(next);
    setReplyModalCase(null);
    setReplyText('');
    if (selectedCase?.case_id === targetCaseId) setSelectedCase(updatedCase);
  };

  // Citizen Satisfaction Confirmation Handler
  const handleSatisfactionSubmit = async () => {
    if (!satisfactionModalCase) return;
    if (!satisfactionDecision && !dissatisfactionReason.trim()) {
      alert('Please specify the reason for dissatisfaction to help escalate the issue.');
      return;
    }
    const targetCaseId = satisfactionModalCase.case_id;

    let updatedCase: FeedbackCase = {
      ...satisfactionModalCase,
      status: satisfactionDecision ? 'CLOSED' : 'ESCALATED',
      citizen_response: {
        satisfied: satisfactionDecision,
        response_date: new Date().toISOString(),
        dissatisfaction_reason: dissatisfactionReason,
        comments: satisfactionComments
      },
      timeline: [
        ...satisfactionModalCase.timeline,
        {
          id: `tl-${Date.now()}`,
          status: satisfactionDecision ? 'CLOSED' : 'ESCALATED',
          title: satisfactionDecision ? 'Citizen Confirmed Resolution' : 'Citizen Dissatisfied — Escalated',
          description: satisfactionDecision
            ? 'Citizen expressed satisfaction with remedial work. Case successfully closed.'
            : `Issue escalated due to unsatisfactory remediation: "${dissatisfactionReason}"`,
          actor: currentUser?.name || 'Citizen',
          timestamp: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`/api/feedback/${targetCaseId}/satisfaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          satisfied: satisfactionDecision,
          dissatisfaction_reason: dissatisfactionReason,
          comments: satisfactionComments,
          citizen_name: currentUser?.name || 'Aarav Sharma'
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiUpdated = await res.json();
          if (apiUpdated?.case_id) updatedCase = apiUpdated;
        }
      }
    } catch (err) {
      console.warn('Satisfaction API unavailable, updated locally:', err);
    }

    const next = cases.map(c => c.case_id === targetCaseId ? updatedCase : c);
    updateCases(next);
    setSatisfactionModalCase(null);
    setDissatisfactionReason('');
    setSatisfactionComments('');
    if (selectedCase?.case_id === targetCaseId) setSelectedCase(updatedCase);
  };

  // Admin Close with explanation (e.g., if Not Verified)
  const handleAdminClose = async (caseId: string, explanation: string) => {
    const targetCase = cases.find(c => c.case_id === caseId);
    if (!targetCase) return;

    let updatedCase: FeedbackCase = {
      ...targetCase,
      status: 'CLOSED',
      timeline: [
        ...targetCase.timeline,
        {
          id: `tl-${Date.now()}`,
          status: 'CLOSED',
          title: 'Case Closed by Administrator',
          description: explanation || 'Case closed after administrative review.',
          actor: currentUser?.name || 'Admin',
          timestamp: new Date().toISOString()
        }
      ],
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`/api/feedback/${caseId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          explanation,
          admin_name: currentUser?.name || 'Admin'
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const apiUpdated = await res.json();
          if (apiUpdated?.case_id) updatedCase = apiUpdated;
        }
      }
    } catch (err) {
      console.warn('Close API unavailable, updated locally:', err);
    }

    const next = cases.map(c => c.case_id === caseId ? updatedCase : c);
    updateCases(next);
    if (selectedCase?.case_id === caseId) setSelectedCase(updatedCase);
  };

  // Filtered cases for tables
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Role filtering
      if (activeRole === 'Project Tracker') {
        // Tracker sees assigned or their project's cases
        const isAssigned = c.assigned_to?.tracker_name?.toLowerCase().includes('piyush') || 
                           c.assigned_to?.tracker_id === 'usr-003' ||
                           c.status === 'ASSIGNED TO TRACKER' || 
                           c.status === 'VERIFICATION IN PROGRESS' ||
                           c.status === 'VERIFIED';
        if (!isAssigned && filterStatus === 'All') return false;
      }

      if (filterProject !== 'All' && c.project_id !== filterProject && c.project_code !== filterProject) {
        return false;
      }
      if (filterType !== 'All' && c.feedback_type !== filterType) {
        return false;
      }
      if (filterStatus !== 'All' && c.status !== filterStatus) {
        return false;
      }
      if (filterPriority !== 'All' && c.priority !== filterPriority) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.case_id.toLowerCase().includes(q) ||
          c.project_name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cases, activeRole, filterProject, filterType, filterStatus, filterPriority, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: cases.length,
      pendingReview: cases.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER REVIEW').length,
      groundIssues: cases.filter(c => c.feedback_type === 'Ground-Level Issue').length,
      underVerification: cases.filter(c => c.status === 'ASSIGNED TO TRACKER' || c.status === 'VERIFICATION IN PROGRESS').length,
      verifiedIssues: cases.filter(c => c.status === 'VERIFIED' || c.status === 'CORRECTIVE ACTION' || c.status === 'ADMIN REVIEW').length,
      resolved: cases.filter(c => c.status === 'RESOLUTION SHARED' || c.status === 'CITIZEN CONFIRMATION' || c.status === 'CLOSED').length,
      reopened: cases.filter(c => c.status === 'REOPENED' || c.status === 'ESCALATED').length
    };
  }, [cases]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'UNDER REVIEW':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'ASSIGNED TO TRACKER':
      case 'VERIFICATION IN PROGRESS':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'VERIFIED':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'NOT VERIFIED':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
      case 'CORRECTIVE ACTION':
      case 'ADMIN REVIEW':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'RESOLUTION SHARED':
      case 'CITIZEN CONFIRMATION':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'REPLIED':
      case 'CLOSED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'REOPENED':
      case 'ESCALATED':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Top Banner with Role Switcher & Official Verification Notice */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              SIH 2026 Citizen Intelligence Module
            </span>
            <span className="text-xs text-slate-400 font-mono">End-to-End Human-in-the-Loop Resolution</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Citizen & RWA Feedback Resolution System
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              <strong>Official Principle:</strong> Citizen reports are subject to verification before official action. Citizen/RWA feedback serves as a supporting ground-level signal, not official truth.
            </span>
          </p>
        </div>

        {/* Role Persona Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Active Persona:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setActiveRole('Citizen'); setActiveTab('dashboard'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'Citizen'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Citizen / RWA
            </button>
            <button
              onClick={() => { setActiveRole('Admin'); setActiveTab('dashboard'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'Admin'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              MoSPI Admin
            </button>
            <button
              onClick={() => { setActiveRole('Project Tracker'); setActiveTab('dashboard'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'Project Tracker'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Project Tracker
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Submissions</span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{metrics.total}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-500 uppercase block">Pending Review</span>
          <span className="text-2xl font-bold font-mono text-blue-600">{metrics.pendingReview}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-500 uppercase block">Ground Issues</span>
          <span className="text-2xl font-bold font-mono text-amber-600">{metrics.groundIssues}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-500 uppercase block">Under Verification</span>
          <span className="text-2xl font-bold font-mono text-indigo-600">{metrics.underVerification}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-purple-500 uppercase block">Verified Issues</span>
          <span className="text-2xl font-bold font-mono text-purple-600">{metrics.verifiedIssues}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-500 uppercase block">Resolved Cases</span>
          <span className="text-2xl font-bold font-mono text-emerald-600">{metrics.resolved}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase block">Reopened / Escalated</span>
          <span className="text-2xl font-bold font-mono text-rose-600">{metrics.reopened}</span>
        </div>
      </div>

      {/* Citizen View Mode Tabs */}
      {activeRole === 'Citizen' && (
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Community Issues ({cases.length})
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'submit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Report Ground Issue / Query
          </button>
          <button
            onClick={() => setActiveTab('my-feedback')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my-feedback'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            My Submitted Cases
          </button>
        </div>
      )}

      {/* SUBMISSION SUCCESS BANNER */}
      {submissionSuccess && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                Feedback Successfully Submitted!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Your case ID is <strong className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">{submissionSuccess.case_id}</strong>. 
                Current status: <span className="font-bold">{submissionSuccess.status}</span>. You can track this issue in "My Submitted Cases".
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmissionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: CITIZEN SUBMIT FEEDBACK FORM */}
      {activeRole === 'Citizen' && activeTab === 'submit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Lodge Citizen Report or Project Inquiry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit ground-level infrastructure issues with photographic evidence or request official project completion timeline information.
            </p>
          </div>

          {/* DUPLICATE WARNING ALERT */}
          {duplicateWarning && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                  Similar Issue Already Reported!
                </span>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  {duplicateWarning.message} Status: <strong>{duplicateWarning.existingCase?.status}</strong>.
                </p>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const match = cases.find(c => c.case_id === duplicateWarning.existingCase?.case_id);
                      if (match) setSelectedCase(match);
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold underline cursor-pointer"
                  >
                    View Existing Case Details
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Project Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Project *
                </label>
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.name.length > 50 ? p.name.substring(0, 50) + '...' : p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback Type (Toggle) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Feedback Classification *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('Ground-Level Issue');
                      setFormCategory('Construction Quality & Safety');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      formType === 'Ground-Level Issue'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🚧 Ground-Level Issue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('Information / Query');
                      setFormCategory('Completion Timeline & Access');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      formType === 'Information / Query'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ℹ️ Information / Query
                  </button>
                </div>
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {formType === 'Ground-Level Issue' ? (
                  <>
                    <option value="Construction Quality & Safety">Construction Quality & Structural Defect</option>
                    <option value="Waterlogging & Drainage Failure">Waterlogging & Stormwater Drainage Blockage</option>
                    <option value="Traffic Diversion / Road Damage">Traffic Diversion & Pavement Deterioration</option>
                    <option value="Encroachment & Right-of-Way Impasse">Encroachment & Right-of-Way (RoW) Obstruction</option>
                    <option value="Environmental / Dust / Noise Pollution">Environmental / Air & Noise Barrier Omission</option>
                    <option value="Execution Inactivity / Prolonged Stagnation">Site Execution Inactivity / Work Stagnation</option>
                  </>
                ) : (
                  <>
                    <option value="Completion Timeline & Access">Expected Completion Date & Milestones</option>
                    <option value="Station & Multi-modal Interchange">Station / Flyover Access & Connectivity</option>
                    <option value="Project Cost & Budget Scope">Project Scope & Funding Allocations</option>
                    <option value="Utility Relocation Status">Utility Relocation (Water/Power lines) Status</option>
                  </>
                )}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={formType === 'Ground-Level Issue'
                  ? 'Describe the physical defect, exact location markers, hazard observed, and how it impacts public transit or safety...'
                  : 'Specify your informational question or query regarding project progress, targets, or official documentation...'}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {formDescription.length} characters entered
              </span>
            </div>

            {/* Location & GPS (Mandatory for Ground Issues) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Exact Landmark / Location {formType === 'Ground-Level Issue' ? '*' : '(Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Pier 142, Outer Ring Road Flyover, Mahadevapura"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required={formType === 'Ground-Level Issue'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  GPS Coordinates (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Lat, Long"
                    value={formLatitude && formLongitude ? `${formLatitude}, ${formLongitude}` : ''}
                    readOnly
                    className="w-full text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setFormLatitude(pos.coords.latitude.toFixed(4));
                            setFormLongitude(pos.coords.longitude.toFixed(4));
                          },
                          () => {
                            setFormLatitude('12.9982');
                            setFormLongitude('77.6925');
                          }
                        );
                      } else {
                        setFormLatitude('12.9982');
                        setFormLongitude('77.6925');
                      }
                    }}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0"
                    title="Auto-detect location"
                  >
                    📍 Pin
                  </button>
                </div>
              </div>
            </div>

            {/* Photo / Evidence Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-500" />
                Upload Photo Evidence / Document (URL or File)
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="url"
                  placeholder="Paste Image URL or Cloud Evidence link (e.g. https://...)"
                  value={formEvidenceUrl}
                  onChange={(e) => setFormEvidenceUrl(e.target.value)}
                  className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setFormEvidenceUrl('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Use Sample Photo
                </button>
              </div>
              {formEvidenceUrl && (
                <div className="mt-3 relative w-36 h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                  <img src={formEvidenceUrl} alt="Evidence preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormEvidenceUrl('')}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Citizen Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Citizen / RWA Name
                </label>
                <input
                  type="text"
                  value={formCitizenName}
                  onChange={(e) => setFormCitizenName(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact (Email / Mobile)
                </label>
                <input
                  type="text"
                  value={formCitizenContact}
                  onChange={(e) => setFormCitizenContact(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Submitting Case...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: CASE LIST / MANAGEMENT TABLE (Shared across roles with role-specific actions) */}
      {(activeTab === 'dashboard' || activeTab === 'my-feedback' || activeRole !== 'Citizen') && (
        <div className="space-y-4">
          
          {/* Filters Strip */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Case ID, project, description, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Project */}
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="All">All Projects</option>
                {projects.slice(0, 10).map(p => (
                  <option key={p.id} value={p.id}>[{p.projectCode}] {p.name.substring(0, 24)}...</option>
                ))}
              </select>

              {/* Filter Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="ASSIGNED TO TRACKER">ASSIGNED TO TRACKER</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="NOT VERIFIED">NOT VERIFIED</option>
                <option value="CORRECTIVE ACTION">CORRECTIVE ACTION</option>
                <option value="ADMIN REVIEW">ADMIN REVIEW</option>
                <option value="CITIZEN CONFIRMATION">CITIZEN CONFIRMATION</option>
                <option value="REPLIED">REPLIED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REOPENED">REOPENED / ESCALATED</option>
              </select>

              {/* Refresh */}
              <button
                onClick={fetchFeedback}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                title="Refresh Cases"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cases List */}
          {filteredCases.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Feedback Cases Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No reports or queries match the selected filters or search parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {c.case_id}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {c.project_name} ({c.project_code})
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details & Timeline
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {c.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {c.feedback_type}
                        </span>
                        {c.priority === 'CRITICAL' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            Critical Priority
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {c.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {c.location}
                        </span>
                        <span>•</span>
                        <span>By: {c.citizen_name}</span>
                        {c.assigned_to && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Assigned to: {c.assigned_to.tracker_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Triggers based on Role */}
                    <div className="md:col-span-4 flex flex-col items-end gap-2">
                      
                      {/* CITIZEN ACTIONS: Satisfaction Check */}
                      {activeRole === 'Citizen' && (c.status === 'CITIZEN CONFIRMATION' || c.status === 'RESOLUTION SHARED') && (
                        <button
                          onClick={() => setSatisfactionModalCase(c)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          Confirm Satisfaction
                        </button>
                      )}

                      {/* ADMIN ACTIONS */}
                      {activeRole === 'Admin' && (
                        <div className="flex flex-wrap justify-end gap-2">
                          {(c.status === 'SUBMITTED' || c.status === 'UNDER REVIEW') && c.feedback_type === 'Ground-Level Issue' && (
                            <button
                              onClick={() => setAssignModalCase(c)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              Assign to Tracker
                            </button>
                          )}

                          {(c.status === 'SUBMITTED' || c.status === 'UNDER REVIEW') && c.feedback_type === 'Information / Query' && (
                            <button
                              onClick={() => setReplyModalCase(c)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Reply to Query
                            </button>
                          )}

                          {c.status === 'NOT VERIFIED' && (
                            <button
                              onClick={() => handleAdminClose(c.case_id, 'Site audit confirmed report was unsubstantiated.')}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                            >
                              Close with Explanation
                            </button>
                          )}

                          {c.status === 'ADMIN REVIEW' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleAdminReview(c.case_id, true)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve Resolution
                              </button>
                              <button
                                onClick={() => handleAdminReview(c.case_id, false)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
                              >
                                Return
                              </button>
                            </div>
                          )}

                          {c.status === 'REOPENED' && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1">
                              <AlertOctagon className="w-3.5 h-3.5" />
                              Escalated by Citizen
                            </span>
                          )}
                        </div>
                      )}

                      {/* PROJECT TRACKER ACTIONS */}
                      {activeRole === 'Project Tracker' && (
                        <div className="flex flex-wrap justify-end gap-2">
                          {(c.status === 'ASSIGNED TO TRACKER' || c.status === 'VERIFICATION IN PROGRESS') && (
                            <button
                              onClick={() => setVerifyModalCase(c)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Audit & Verify Issue
                            </button>
                          )}

                          {c.status === 'VERIFIED' && (
                            <button
                              onClick={() => setActionModalCase(c)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Record Corrective Action
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: DETAILS & CHRONOLOGICAL TIMELINE MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                    {selectedCase.case_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCase.category} — {selectedCase.project_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Case Details Summary */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Citizen Description:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedCase.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-500">
                <div>📍 <strong>Location:</strong> {selectedCase.location}</div>
                <div>👤 <strong>Citizen:</strong> {selectedCase.citizen_name} ({selectedCase.citizen_contact || 'No contact'})</div>
              </div>

              {/* Photo Evidence */}
              {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                <div className="pt-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">Submitted Evidence:</span>
                  <div className="flex gap-3">
                    {selectedCase.evidence.map((ev, i) => (
                      <a key={i} href={ev.url} target="_blank" rel="noreferrer" className="group relative w-24 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                        <img src={ev.url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center truncate px-1">View photo</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verification & Corrective Action Highlights if available */}
            {selectedCase.verification && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-200">
                  <span>Ground Verification Report</span>
                  <span>{selectedCase.verification.verified ? '✅ Verified' : '❌ Not Verified'}</span>
                </div>
                <p className="text-purple-800 dark:text-purple-300">{selectedCase.verification.notes}</p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 block pt-1 font-mono">
                  Audited by {selectedCase.verification.verified_by} on {new Date(selectedCase.verification.verified_at).toLocaleDateString()}
                </span>
              </div>
            )}

            {selectedCase.corrective_action && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-1">
                <div className="font-bold text-blue-900 dark:text-blue-200">
                  Corrective Action: {selectedCase.corrective_action.action_taken}
                </div>
                <p className="text-blue-800 dark:text-blue-300">{selectedCase.corrective_action.action_description}</p>
                <div className="flex justify-between text-[10px] text-blue-600 dark:text-blue-400 pt-1 font-mono">
                  <span>Team: {selectedCase.corrective_action.responsible_team}</span>
                  <span>Completed: {selectedCase.corrective_action.action_date}</span>
                </div>
              </div>
            )}

            {selectedCase.admin_reply && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">Official Administration Reply:</div>
                <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">{selectedCase.admin_reply.reply_text}</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block pt-1 font-mono">
                  Replied by {selectedCase.admin_reply.replied_by} on {new Date(selectedCase.admin_reply.replied_at).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Complete Visual Journey Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Case Resolution Lifecycle Timeline
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {selectedCase.timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-xs"></div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{event.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{event.description}</p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">Actor: {event.actor}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN TO TRACKER (ADMIN) */}
      {assignModalCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Assign to Project Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Dispatch <strong className="font-mono text-blue-600">{assignModalCase.case_id}</strong> to a field officer for on-site verification.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Project Tracker Officer
                </label>
                <select
                  value={assignTrackerName}
                  onChange={(e) => setAssignTrackerName(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                >
                  <option value="Piyush (MoSPI PMG Field Officer)">Piyush (MoSPI PMG Field Officer)</option>
                  <option value="Nikhil (Quality Control Engineer)">Nikhil (Quality Control Engineer)</option>
                  <option value="Lavanya (Structural Engineer)">Lavanya (Structural Engineer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Verification Instructions / Notes
                </label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Conduct urgent site audit of retaining wall & drainage barricades..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModalCase(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TRACKER AUDIT & VERIFY ISSUE */}
      {verifyModalCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-600" />
              On-Site Audit & Verification Decision
            </h3>
            <p className="text-xs text-slate-500">
              Auditing <strong className="font-mono text-purple-600">{verifyModalCase.case_id}</strong>: "{verifyModalCase.category}".
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Verification Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVerifyDecision('Verified')}
                    className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      verifyDecision === 'Verified'
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ✅ Verified (Issue Exists)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyDecision('Not Verified')}
                    className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                      verifyDecision === 'Not Verified'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ❌ Not Verified (Dismiss)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Verification Reason / Notes *
                </label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Document the exact physical observations, dimensions of damage, or why the issue could not be substantiated..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setVerifyModalCase(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifySubmit}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RECORD CORRECTIVE ACTION (TRACKER) */}
      {actionModalCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Record Corrective Action
            </h3>
            <p className="text-xs text-slate-500">
              Record official remediation for verified issue <strong className="font-mono text-blue-600">{actionModalCase.case_id}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Action Taken (Summary) *
                </label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Reinforced sheet piles & reconstructed stormwater drainage culvert"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Description *
                </label>
                <textarea
                  rows={3}
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  placeholder="Details of civil works, materials utilized, and safety tests performed..."
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Responsible Team
                  </label>
                  <input
                    type="text"
                    value={actionTeam}
                    onChange={(e) => setActionTeam(e.target.value)}
                    placeholder="e.g. BMRCL Civil Division"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    placeholder="e.g. Complies with IRC:SP:112"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModalCase(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Send to Admin Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DIRECT REPLY FOR INFORMATION/QUERY (ADMIN) */}
      {replyModalCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              Reply to Citizen Information Query
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400 block mb-1">Citizen Query:</span>
              <p className="text-slate-800 dark:text-slate-200">{replyModalCase.description}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Administration Reply *
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Provide official completion timelines, contractor milestone progress, or statutory clearances information..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReplyModalCase(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Send Reply & Close Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CITIZEN SATISFACTION CONFIRMATION */}
      {satisfactionModalCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-blue-600" />
              Confirm Issue Resolution Satisfaction
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your issue <strong className="font-mono text-blue-600">{satisfactionModalCase.case_id}</strong> has been addressed by the project authority. Please confirm whether the resolution is satisfactory:
            </p>

            {satisfactionModalCase.corrective_action && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs">
                <span className="font-bold text-blue-900 dark:text-blue-200 block mb-0.5">Reported Action Taken:</span>
                <p className="text-blue-800 dark:text-blue-300">{satisfactionModalCase.corrective_action.action_taken}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSatisfactionDecision(true)}
                className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                  satisfactionDecision
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                Yes (Satisfied)
              </button>

              <button
                type="button"
                onClick={() => setSatisfactionDecision(false)}
                className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                  !satisfactionDecision
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-rose-600" />
                No (Reopen/Escalate)
              </button>
            </div>

            {!satisfactionDecision && (
              <div className="space-y-3 pt-2 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Dissatisfaction *
                  </label>
                  <input
                    type="text"
                    value={dissatisfactionReason}
                    onChange={(e) => setDissatisfactionReason(e.target.value)}
                    placeholder="e.g. Drainage was only partially cleared, debris still blocking sidewalk..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Additional Comments
                  </label>
                  <textarea
                    rows={2}
                    value={satisfactionComments}
                    onChange={(e) => setSatisfactionComments(e.target.value)}
                    placeholder="Provide any additional ground context to assist the escalation committee..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSatisfactionModalCase(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSatisfactionSubmit}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold ${
                  satisfactionDecision ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {satisfactionDecision ? 'Close Case (Resolved)' : 'Reopen & Escalate Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
