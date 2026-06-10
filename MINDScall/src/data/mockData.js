// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardStats = [
  { id: 1, title: 'Total Forms', value: 342, change: '+5%', trend: 'up', icon: 'Description', color: '#0277BD', bg: '#E1F5FE' },
  { id: 2, title: 'Total Responses', value: 1245, change: '+18%', trend: 'up', icon: 'ListAlt', color: '#2E7D32', bg: '#E8F5E9' },
  { id: 3, title: 'Pending Evaluation', value: 43, change: '-3%', trend: 'down', icon: 'HourglassEmpty', color: '#F57C00', bg: '#FFF3E0' },
  { id: 4, title: 'Approved', value: 198, change: '+15%', trend: 'up', icon: 'CheckCircle', color: '#6A1B9A', bg: '#F3E5F5' },
];

export const recentActivities = [
  { id: 1, subId: 'SUB-1021', category: 'Technology', stage: 'Approval', status: 'Approved', assignedTo: 'GM - Tech', lastUpdated: '10 mins ago' },
  { id: 2, subId: 'SUB-1022', category: 'HR', stage: 'Evaluation', status: 'Under Review', assignedTo: 'Priya Nair', lastUpdated: '1 hr ago' },
  { id: 3, subId: 'SUB-1023', category: 'Finance', stage: 'Auto Assign', status: 'Pending', assignedTo: 'Unassigned', lastUpdated: '2 hrs ago' },
  { id: 4, subId: 'SUB-1024', category: 'Operations', stage: 'Meeting', status: 'Scheduled', assignedTo: 'Committee A', lastUpdated: '3 hrs ago' },
];

export const monthlyData = [
  { month: 'Jan', submissions: 28, evaluations: 14, approvals: 10 },
  { month: 'Feb', submissions: 35, evaluations: 20, approvals: 15 },
  { month: 'Mar', submissions: 42, evaluations: 25, approvals: 19 },
  { month: 'Apr', submissions: 38, evaluations: 22, approvals: 17 },
  { month: 'May', submissions: 55, evaluations: 31, approvals: 24 },
  { month: 'Jun', submissions: 48, evaluations: 28, approvals: 22 },
];

// ─── Shared Mock Users ───────────────────────────────────────────────────────
export const employees = [
  { id: 1, name: 'Rahul Sharma', dept: 'Technology', email: 'rahul.s@cubehighways.com', role: 'Sr. Engineer', status: 'Unassigned', avatar: 'RS', workload: 20, activeAssignments: 1 },
  { id: 2, name: 'Priya Nair', dept: 'Innovation', email: 'priya.n@cubehighways.com', role: 'Innovation Lead', status: 'Assigned', avatar: 'PN', workload: 85, activeAssignments: 5 },
  { id: 3, name: 'Amit Verma', dept: 'Operations', email: 'amit.v@cubehighways.com', role: 'Operations Manager', status: 'Pending', avatar: 'AV', workload: 50, activeAssignments: 3 },
  { id: 4, name: 'Sneha Joshi', dept: 'Research', email: 'sneha.j@cubehighways.com', role: 'Research Analyst', status: 'Assigned', avatar: 'SJ', workload: 40, activeAssignments: 2 },
  { id: 5, name: 'Vikram Patel', dept: 'Finance', email: 'vikram.p@cubehighways.com', role: 'Finance Head', status: 'Unassigned', avatar: 'VP', workload: 10, activeAssignments: 0 },
  { id: 6, name: 'Anita Desai', dept: 'HR', email: 'anita.d@cubehighways.com', role: 'HR Manager', status: 'Assigned', avatar: 'AD', workload: 60, activeAssignments: 4 },
];

// ─── Submissions (Auto Assign) ─────────────────────────────────────────────────────────────
export const submissions = [
  { id: 'SUB-1001', formName: 'Smart Traffic Management System', category: 'Technology', submitter: 'Rahul Sharma', submittedDate: '2026-05-28', priority: 'High', status: 'Pending Assignment', slaDays: 2, slaStatus: 'warning', 
    history: [{ time: '10:00 AM, May 28', action: 'Form Submitted', user: 'Rahul Sharma' }],
    comments: []
  },
  { id: 'SUB-1002', formName: 'AI-Powered Road Damage Detection', category: 'Technology', submitter: 'Karan Mehta', submittedDate: '2026-05-25', priority: 'Medium', status: 'Assigned', slaDays: -1, slaStatus: 'overdue',
    history: [
      { time: '09:30 AM, May 25', action: 'Form Submitted', user: 'Karan Mehta' }, 
      { time: '11:00 AM, May 26', action: 'Assigned to Reviewer', user: 'System', detail: 'Assigned to Vikram Patel' }
    ],
    comments: [{ user: 'Admin User', time: 'May 26, 11:05 AM', text: 'Assigned due to AI domain expertise.' }]
  },
  { id: 'SUB-1003', formName: 'Toll Automation Enhancement', category: 'Research', submitter: 'Sneha Joshi', submittedDate: '2026-05-22', priority: 'High', status: 'Escalated', slaDays: -3, slaStatus: 'overdue',
    history: [
      { time: '02:15 PM, May 22', action: 'Form Submitted', user: 'Sneha Joshi' }, 
      { time: '10:00 AM, May 23', action: 'Assigned to Reviewer', user: 'System', detail: 'Assigned to Amit Verma' }, 
      { time: '04:00 PM, May 30', action: 'SLA Escalation', user: 'System', detail: 'Review delayed by 7 days' }
    ],
    comments: [{ user: 'System', time: 'May 30, 04:00 PM', text: 'Escalated to Department Head.' }]
  },
];

// ─── Evaluations ─────────────────────────────────────────────────────────────
export const evaluations = [
  { id: 'EVAL-1001', submissionId: 'SUB-1001', title: 'Smart Traffic Management System', submitter: 'Rahul Sharma', dept: 'Technology', submitted: '2026-05-28', evaluator: 'Priya Nair', score: null, status: 'Pending', priority: 'High', slaDays: 4, slaStatus: 'ok',
    history: [
      { time: '10:00 AM, May 28', action: 'Submission Received', user: 'Rahul Sharma' }, 
      { time: '11:30 AM, May 29', action: 'Assigned for Evaluation', user: 'Admin', detail: 'Assigned to Priya Nair' }
    ], 
    attachments: [{ name: 'System Architecture.pdf', type: 'PDF' }, { name: 'Cost Breakdown.xlsx', type: 'Excel' }],
    comments: [{ user: 'Priya Nair', time: 'May 30, 09:00 AM', text: 'Started initial review. Looks promising but need more budget clarity.' }]
  },
  { id: 'EVAL-1005', submissionId: 'SUB-1005', title: 'Highway IoT Integration', submitter: 'Priya Nair', dept: 'Innovation', submitted: '2026-05-10', evaluator: 'Rahul Sharma', score: 87, status: 'Approved', priority: 'High', slaDays: 0, slaStatus: 'ok',
    history: [
      { time: '10:00 AM, May 10', action: 'Submission Received', user: 'Priya Nair' }, 
      { time: '09:00 AM, May 11', action: 'Assigned for Evaluation', user: 'System' }, 
      { time: '02:00 PM, May 15', action: 'Evaluation Approved', user: 'Rahul Sharma', detail: 'Score: 87/100' }
    ], 
    attachments: [{ name: 'IoT Spec.pdf', type: 'PDF' }], 
    comments: [
      { user: 'Rahul Sharma', time: 'May 14, 03:00 PM', text: 'Great proposal, highly feasible.' },
      { user: 'Admin User', time: 'May 15, 02:05 PM', text: 'Proceeding to Committee Meeting phase.' }
    ]
  },
];

// ─── Meetings ────────────────────────────────────────────────────────────────
export const meetings = [
  { id: 1, name: 'Q3 Innovation Strategy Review', date: '2026-06-12', time: '10:00 AM', duration: '2h', attendees: ['Rahul S.', 'Priya N.', 'Amit V.'], location: 'Conference Room A', status: 'Scheduled', type: 'Strategy', relatedSubmission: 'Multiple', agenda: 'Review Q3 proposals and align with yearly strategy.', notes: '', actionItems: [], recommendations: '' },
  { id: 6, name: 'Evaluation Committee Session – May', date: '2026-05-30', time: '10:00 AM', duration: '3h', attendees: ['All Evaluators'], location: 'Conference Room B', status: 'Completed', type: 'Evaluation', relatedSubmission: 'Multiple', agenda: 'Monthly review of all pending evaluations.', notes: 'Discussed 15 proposals. 5 approved, 8 rejected, 2 sent back for rework.', actionItems: ['Send rejection emails', 'Schedule follow up for reworked items'], recommendations: 'Need stricter initial filtering criteria.' },
];

// ─── Approvals ───────────────────────────────────────────────────────────────
export const approvals = [
  { id: 'APP-1001', submissionId: 'SUB-1001', title: 'Smart Traffic Management System', requester: 'Rahul Sharma', dept: 'Technology', type: 'Project Approval', amount: '₹ 45,00,000', submitted: '2026-06-01', priority: 'High', status: 'Pending Approval', evaluationResult: '85/100', recommendation: 'Strongly Recommend', slaDays: 5, slaStatus: 'ok',
    history: [
      { time: '10:00 AM, Jun 01', action: 'Form Submitted', user: 'Rahul Sharma' },
      { time: '02:00 PM, Jun 02', action: 'Evaluation Approved', user: 'Priya Nair' },
      { time: '04:00 PM, Jun 03', action: 'Meeting Completed', user: 'Committee A' },
      { time: '09:00 AM, Jun 04', action: 'Approval Pending', user: 'System' }
    ], 
    evaluationSummary: 'The system promises a 20% reduction in congestion. Technically sound.', meetingNotes: 'Committee agrees on the technical feasibility.', attachments: [{ name: 'Final Proposal.pdf', type: 'PDF' }],
    comments: [{ user: 'Committee A', time: 'Jun 03, 04:30 PM', text: 'Recommended for final approval by CFO.' }]
  },
  { id: 'APP-1008', submissionId: 'SUB-1008', title: 'Legacy ERP Migration', requester: 'Vikram Patel', dept: 'Finance', type: 'Project Approval', amount: '₹ 95,00,000', submitted: '2026-04-28', priority: 'High', status: 'Rejected', reason: 'Budget constraints – Q2 freeze', rejectedDate: '2026-05-05', evaluationResult: '45/100', recommendation: 'Do not proceed', slaDays: 0, slaStatus: 'ok',
    history: [
      { time: '01:00 PM, Apr 28', action: 'Form Submitted', user: 'Vikram Patel' },
      { time: '11:00 AM, May 05', action: 'Final Rejection', user: 'CFO', detail: 'Budget constraints' }
    ], 
    evaluationSummary: 'Too expensive for current quarter.', meetingNotes: 'Revisit in Q4.', attachments: [],
    comments: [{ user: 'CFO', time: 'May 05, 11:05 AM', text: 'Cannot approve this quarter. Pushing to next year.' }]
  },
];

export const notifications = [
  { id: 1, text: 'Rahul Sharma submitted a new idea', time: '2 min ago', read: false },
  { id: 2, text: 'Evaluation completed for Highway IoT', time: '1 hr ago', read: false },
  { id: 3, text: 'Meeting scheduled: Q3 Innovation Review', time: '3 hrs ago', read: true },
  { id: 4, text: 'Budget request approved by CFO', time: '1 day ago', read: true },
];
