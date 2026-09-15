import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'feedback_db.json');

export const feedbackRouter = express.Router();

export interface FeedbackEvidence {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface FeedbackCase {
  id: string;
  case_id: string;
  project_id: string;
  project_code: string;
  project_name: string;
  citizen_id: string;
  citizen_name: string;
  citizen_contact?: string;
  feedback_type: 'Information / Query' | 'Ground-Level Issue';
  category: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  location: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 
    | 'SUBMITTED' 
    | 'UNDER REVIEW' 
    | 'ASSIGNED TO TRACKER' 
    | 'VERIFICATION IN PROGRESS' 
    | 'VERIFIED' 
    | 'NOT VERIFIED' 
    | 'CORRECTIVE ACTION' 
    | 'ADMIN REVIEW' 
    | 'RESOLUTION SHARED' 
    | 'CITIZEN CONFIRMATION' 
    | 'REPLIED' 
    | 'CLOSED' 
    | 'REOPENED' 
    | 'ESCALATED';
  evidence: FeedbackEvidence[];
  assigned_to?: {
    tracker_id: string;
    tracker_name: string;
    assigned_at: string;
    notes?: string;
  };
  verification?: {
    verified: boolean;
    verified_by: string;
    verified_at: string;
    notes: string;
    evidence?: FeedbackEvidence[];
  };
  corrective_action?: {
    action_taken: string;
    action_description: string;
    responsible_team: string;
    action_date: string;
    evidence?: FeedbackEvidence[];
    remarks?: string;
    recorded_by: string;
    recorded_at: string;
  };
  admin_review?: {
    reviewed_by: string;
    reviewed_at: string;
    approved: boolean;
    remarks: string;
  };
  admin_reply?: {
    replied_by: string;
    replied_at: string;
    reply_text: string;
  };
  citizen_response?: {
    satisfied: boolean;
    response_date: string;
    dissatisfaction_reason?: string;
    comments?: string;
    evidence?: FeedbackEvidence[];
  };
  ai_analysis?: {
    suggested_category: string;
    suggested_priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    is_potential_mismatch: boolean;
    summary: string;
  };
  timeline: TimelineEvent[];
  created_at: string;
  updated_at: string;
}

// In-memory array backed by persistent JSON file
let feedbackCases: FeedbackCase[] = [];

const saveFeedbackToDisk = () => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(feedbackCases, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Feedback DB] Failed saving feedback to disk:', err);
  }
};

const loadFeedbackFromDisk = () => {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      feedbackCases = JSON.parse(data);
      console.log(`[Feedback DB] Loaded ${feedbackCases.length} feedback cases from disk.`);
      return;
    } catch (err) {
      console.warn('[Feedback DB] Could not parse existing feedback DB, initializing defaults:', err);
    }
  }

  // Pre-seed with realistic demonstration cases covering each workflow step
  feedbackCases = [
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

  saveFeedbackToDisk();
};

loadFeedbackFromDisk();

// 1. GET /api/feedback/summary — Aggregated statistics for dashboards
feedbackRouter.get('/summary', (req: Request, res: Response) => {
  const total = feedbackCases.length;
  const pendingReview = feedbackCases.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER REVIEW').length;
  const groundIssues = feedbackCases.filter(c => c.feedback_type === 'Ground-Level Issue').length;
  const underVerification = feedbackCases.filter(c => c.status === 'ASSIGNED TO TRACKER' || c.status === 'VERIFICATION IN PROGRESS').length;
  const verifiedIssues = feedbackCases.filter(c => c.status === 'VERIFIED' || c.status === 'CORRECTIVE ACTION' || c.status === 'ADMIN REVIEW').length;
  const resolved = feedbackCases.filter(c => c.status === 'RESOLUTION SHARED' || c.status === 'CITIZEN CONFIRMATION' || c.status === 'CLOSED').length;
  const reopened = feedbackCases.filter(c => c.status === 'REOPENED' || c.status === 'ESCALATED').length;

  res.json({
    total,
    pendingReview,
    groundIssues,
    underVerification,
    verifiedIssues,
    resolved,
    reopened
  });
});

// 2. GET /api/feedback — Query list of feedback cases with filters
feedbackRouter.get('/', (req: Request, res: Response) => {
  const { projectId, feedback_type, status, priority, citizenId, trackerId, search } = req.query;

  let results = [...feedbackCases];

  if (projectId) {
    results = results.filter(c => c.project_id === projectId || c.project_code === projectId);
  }

  if (feedback_type) {
    results = results.filter(c => c.feedback_type === feedback_type);
  }

  if (status && status !== 'All') {
    results = results.filter(c => c.status === status);
  }

  if (priority && priority !== 'All') {
    results = results.filter(c => c.priority === priority);
  }

  if (citizenId) {
    results = results.filter(c => c.citizen_id === citizenId);
  }

  if (trackerId) {
    results = results.filter(c => c.assigned_to?.tracker_id === trackerId || c.assigned_to?.tracker_name?.toLowerCase().includes(String(trackerId).toLowerCase()));
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    results = results.filter(c =>
      c.case_id.toLowerCase().includes(q) ||
      c.project_name.toLowerCase().includes(q) ||
      c.project_code.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(results);
});

// 3. POST /api/feedback/check-duplicate — Duplicate and similarity detection
feedbackRouter.post('/check-duplicate', (req: Request, res: Response) => {
  const { project_id, category, description, location } = req.body;

  if (!project_id) {
    res.json({ isDuplicate: false });
    return;
  }

  const descWords = (description || '').toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);

  const matched = feedbackCases.find(c => {
    if (c.project_id !== project_id) return false;
    
    // Category match
    if (category && c.category.toLowerCase() === category.toLowerCase()) {
      return true;
    }

    // Significant keyword overlap
    if (descWords.length > 0) {
      const existingDesc = c.description.toLowerCase();
      const matchCount = descWords.filter((w: string) => existingDesc.includes(w)).length;
      if (matchCount >= 3) return true;
    }

    // Location keyword overlap
    if (location && c.location && c.location.toLowerCase().includes(location.toLowerCase().slice(0, 10))) {
      return true;
    }

    return false;
  });

  if (matched) {
    res.json({
      isDuplicate: true,
      existingCase: {
        case_id: matched.case_id,
        category: matched.category,
        description: matched.description.substring(0, 120) + '...',
        status: matched.status,
        submitted_at: matched.created_at
      },
      message: `A similar issue (${matched.case_id}) has already been reported for this project.`
    });
  } else {
    res.json({ isDuplicate: false });
  }
});

// 4. POST /api/feedback — Submit new citizen feedback
feedbackRouter.post('/', (req: Request, res: Response) => {
  const {
    project_id,
    project_code,
    project_name,
    citizen_id,
    citizen_name,
    citizen_contact,
    feedback_type,
    category,
    description,
    latitude,
    longitude,
    location,
    evidence
  } = req.body;

  // Validation
  if (!project_id || !description || !category) {
    res.status(400).json({ error: 'Project, Category, and Description are required.' });
    return;
  }

  if (feedback_type === 'Ground-Level Issue' && (!location || location.trim().length === 0)) {
    res.status(400).json({ error: 'Location description or coordinates are mandatory for ground-level issues.' });
    return;
  }

  // Generate unique Case ID: CASE-YYYY-XXXX
  const year = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const codePrefix = (project_code || 'PRJ').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const case_id = `CASE-${year}-${codePrefix}-${randNum}`;

  const now = new Date().toISOString();

  // Basic rule-based AI suggestion for category and priority
  const descLower = description.toLowerCase();
  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  if (descLower.includes('collapse') || descLower.includes('danger') || descLower.includes('crack') || descLower.includes('hazard') || descLower.includes('safety')) {
    priority = 'CRITICAL';
  } else if (descLower.includes('waterlog') || descLower.includes('delay') || descLower.includes('blocked') || descLower.includes('stagnant')) {
    priority = 'HIGH';
  }

  const newCase: FeedbackCase = {
    id: `fb-${Date.now()}`,
    case_id,
    project_id,
    project_code: project_code || 'PRJ-GEN',
    project_name: project_name || 'Infrastructure Project',
    citizen_id: citizen_id || 'usr-citizen-default',
    citizen_name: citizen_name || 'Citizen Contributor',
    citizen_contact: citizen_contact || '',
    feedback_type: feedback_type || 'Ground-Level Issue',
    category,
    description,
    latitude: latitude || null,
    longitude: longitude || null,
    location: location || 'Location details not specified',
    priority,
    status: 'SUBMITTED',
    evidence: Array.isArray(evidence) ? evidence : [],
    ai_analysis: {
      suggested_category: category,
      suggested_priority: priority,
      is_potential_mismatch: feedback_type === 'Ground-Level Issue',
      summary: `Automated triage: ${feedback_type} filed by citizen. Human-in-the-loop verification required before official project risk adjustments.`
    },
    timeline: [
      {
        id: `tl-${Date.now()}`,
        status: 'SUBMITTED',
        title: 'Feedback Lodged',
        description: `Feedback submitted by ${citizen_name || 'Citizen'}. Awaiting administrative review.`,
        actor: citizen_name || 'Citizen',
        timestamp: now
      }
    ],
    created_at: now,
    updated_at: now
  };

  feedbackCases.unshift(newCase);
  saveFeedbackToDisk();

  res.status(201).json(newCase);
});

// 5. GET /api/feedback/:case_id — View complete details
feedbackRouter.get('/:case_id', (req: Request, res: Response) => {
  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);
  if (!c) {
    res.status(404).json({ error: 'Feedback case not found.' });
    return;
  }
  res.json(c);
});

// 6. POST /api/feedback/:case_id/assign — Admin assigns to Project Tracker
feedbackRouter.post('/:case_id/assign', (req: Request, res: Response) => {
  const { tracker_id, tracker_name, notes, admin_name } = req.body;
  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);

  if (!c) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  const now = new Date().toISOString();
  c.status = 'ASSIGNED TO TRACKER';
  c.assigned_to = {
    tracker_id: tracker_id || 'usr-003',
    tracker_name: tracker_name || 'Project Tracker',
    assigned_at: now,
    notes: notes || ''
  };

  c.timeline.push({
    id: `tl-${Date.now()}`,
    status: 'ASSIGNED TO TRACKER',
    title: 'Assigned to Project Tracker',
    description: `Assigned to ${tracker_name || 'Project Tracker'} for ground verification. ${notes ? `Instructions: ${notes}` : ''}`,
    actor: admin_name || 'Admin',
    timestamp: now
  });

  c.updated_at = now;
  saveFeedbackToDisk();

  res.json(c);
});

// 7. POST /api/feedback/:case_id/verify — Tracker verifies issue (Verified / Not Verified)
feedbackRouter.post('/:case_id/verify', (req: Request, res: Response) => {
  const { verified, notes, evidence, tracker_name } = req.body;
  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);

  if (!c) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  if (!notes || notes.trim().length === 0) {
    res.status(400).json({ error: 'Mandatory verification comments/notes are required.' });
    return;
  }

  const now = new Date().toISOString();
  const isVerified = Boolean(verified);

  c.verification = {
    verified: isVerified,
    verified_by: tracker_name || 'Project Tracker',
    verified_at: now,
    notes,
    evidence: Array.isArray(evidence) ? evidence : []
  };

  c.status = isVerified ? 'VERIFIED' : 'NOT VERIFIED';

  c.timeline.push({
    id: `tl-${Date.now()}`,
    status: c.status,
    title: isVerified ? 'Issue Verified On-Site' : 'Issue Not Verified / Dismissed',
    description: `${isVerified ? 'Ground reality audit confirmed citizen report.' : 'On-site audit could not substantiate citizen report.'} Notes: ${notes}`,
    actor: tracker_name || 'Project Tracker',
    timestamp: now
  });

  c.updated_at = now;
  saveFeedbackToDisk();

  res.json(c);
});

// 8. POST /api/feedback/:case_id/corrective-action — Record corrective action
feedbackRouter.post('/:case_id/corrective-action', (req: Request, res: Response) => {
  const {
    action_taken,
    action_description,
    responsible_team,
    action_date,
    evidence,
    remarks,
    recorded_by
  } = req.body;

  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);

  if (!c) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  if (!action_taken || !action_description) {
    res.status(400).json({ error: 'Action taken and description are required.' });
    return;
  }

  const now = new Date().toISOString();
  c.corrective_action = {
    action_taken,
    action_description,
    responsible_team: responsible_team || 'Field Contracting Authority',
    action_date: action_date || now.split('T')[0],
    evidence: Array.isArray(evidence) ? evidence : [],
    remarks: remarks || '',
    recorded_by: recorded_by || 'Project Tracker',
    recorded_at: now
  };

  c.status = 'ADMIN REVIEW';

  c.timeline.push({
    id: `tl-${Date.now()}`,
    status: 'CORRECTIVE ACTION',
    title: 'Corrective Action Recorded',
    description: `Action Taken: "${action_taken}" by ${responsible_team}. Sent to Admin for final validation.`,
    actor: recorded_by || 'Project Tracker',
    timestamp: now
  });

  c.updated_at = now;
  saveFeedbackToDisk();

  res.json(c);
});

// 9. POST /api/feedback/:case_id/admin-review — Admin approves corrective action or requests more action
feedbackRouter.post('/:case_id/admin-review', (req: Request, res: Response) => {
  const { approved, remarks, admin_name } = req.body;
  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);

  if (!c) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  const now = new Date().toISOString();
  const isApproved = Boolean(approved);

  c.admin_review = {
    reviewed_by: admin_name || 'Admin',
    reviewed_at: now,
    approved: isApproved,
    remarks: remarks || ''
  };

  if (isApproved) {
    c.status = 'CITIZEN CONFIRMATION';
    c.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'RESOLUTION SHARED',
      title: 'Resolution Approved & Shared with Citizen',
      description: `Admin approved corrective action resolution. Shared with citizen for satisfaction check. Remarks: ${remarks || 'None'}`,
      actor: admin_name || 'Admin',
      timestamp: now
    });
  } else {
    c.status = 'VERIFICATION IN PROGRESS';
    c.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'UNDER REVIEW',
      title: 'Action Returned for Further Rectification',
      description: `Admin rejected initial remediation: ${remarks}`,
      actor: admin_name || 'Admin',
      timestamp: now
    });
  }

  c.updated_at = now;
  saveFeedbackToDisk();

  res.json(c);
});

// 10. POST /api/feedback/:case_id/reply — Admin replies directly to Information/Query
feedbackRouter.post('/:case_id/reply', (req: Request, res: Response) => {
  const { reply_text, admin_name } = req.body;
  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);

  if (!c) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  if (!reply_text) {
    res.status(400).json({ error: 'Reply text is required.' });
    return;
  }

  const now = new Date().toISOString();
  c.admin_reply = {
    replied_by: admin_name || 'Admin',
    replied_at: now,
    reply_text
  };

  c.status = 'REPLIED';

  c.timeline.push({
    id: `tl-${Date.now()}`,
    status: 'REPLIED',
    title: 'Official Response Provided',
    description: `Admin supplied response: "${reply_text}"`,
    actor: admin_name || 'Admin',
    timestamp: now
  });

  // Automatically mark query closed after reply
  c.status = 'CLOSED';
  c.timeline.push({
    id: `tl-${Date.now() + 1}`,
    status: 'CLOSED',
    title: 'Case Closed',
    description: 'Information enquiry resolved and closed.',
    actor: 'System',
    timestamp: now
  });

  c.updated_at = now;
  saveFeedbackToDisk();

  res.json(c);
});

// 11. POST /api/feedback/:case_id/satisfaction — Citizen satisfaction confirmation
feedbackRouter.post('/:case_id/satisfaction', (req: Request, res: Response) => {
  const { satisfied, dissatisfaction_reason, comments, evidence, citizen_name } = req.body;
  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);

  if (!c) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  const now = new Date().toISOString();
  const isSatisfied = Boolean(satisfied);

  c.citizen_response = {
    satisfied: isSatisfied,
    response_date: now,
    dissatisfaction_reason: dissatisfaction_reason || '',
    comments: comments || '',
    evidence: Array.isArray(evidence) ? evidence : []
  };

  if (isSatisfied) {
    c.status = 'CLOSED';
    c.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'CLOSED',
      title: 'Citizen Confirmed Resolution — Case Closed',
      description: `Citizen verified satisfaction with the ground-level corrective action. ${comments ? `Feedback: "${comments}"` : ''}`,
      actor: citizen_name || c.citizen_name,
      timestamp: now
    });
  } else {
    // If dissatisfied, reopen or escalate
    c.status = 'REOPENED';
    c.timeline.push({
      id: `tl-${Date.now()}`,
      status: 'REOPENED',
      title: 'Citizen Unsatisfied — Case Reopened & Escalated',
      description: `Citizen indicated issue remains unresolved. Reason: ${dissatisfaction_reason || 'Incomplete remediation'}. Comments: "${comments || ''}". Escalated to Project Monitoring Group.`,
      actor: citizen_name || c.citizen_name,
      timestamp: now
    });
  }

  c.updated_at = now;
  saveFeedbackToDisk();

  res.json(c);
});

// 12. POST /api/feedback/:case_id/close — Admin manually closes case (e.g. if Not Verified)
feedbackRouter.post('/:case_id/close', (req: Request, res: Response) => {
  const { explanation, admin_name } = req.body;
  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);

  if (!c) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  const now = new Date().toISOString();
  c.status = 'CLOSED';

  c.timeline.push({
    id: `tl-${Date.now()}`,
    status: 'CLOSED',
    title: 'Case Closed by Admin',
    description: `Case closed. Explanation: ${explanation || 'Administrative decision.'}`,
    actor: admin_name || 'Admin',
    timestamp: now
  });

  c.updated_at = now;
  saveFeedbackToDisk();

  res.json(c);
});

// 13. GET /api/feedback/:case_id/timeline — Fetch chronological timeline
feedbackRouter.get('/:case_id/timeline', (req: Request, res: Response) => {
  const c = feedbackCases.find(f => f.case_id === req.params.case_id || f.id === req.params.case_id);
  if (!c) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }
  res.json(c.timeline);
});
