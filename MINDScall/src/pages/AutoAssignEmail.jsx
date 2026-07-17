import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, InputAdornment,
  Avatar, Chip, Button, Divider, Snackbar, Alert, CircularProgress,
  Checkbox, Fade, Tabs, Tab, FormControl, Select, MenuItem, InputLabel,
  Tooltip, IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as AssignedIcon,
  HourglassEmpty as PendingIcon,
  PersonOff as UnassignedIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as EvalIcon,
  AccountBalance as FinanceIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { TypeBadge } from '../components/DataTable';
import api from '../utils/api';
import { parseSubmissionFields } from '../utils/submissionParser';
import Timeline from '../components/Timeline';
import ReviewBadge from '../components/ReviewBadge';

// ─── Shared helpers ────────────────────────────────────────────────
const rmStatusConfig = {
  Unassigned:    { color: '#546E7A', bg: '#ECEFF1' },
  'RM Assigned': { color: '#1565C0', bg: '#E3F2FD' },
  Completed:     { color: '#2E7D32', bg: '#E8F5E9' },
};

const STATUS_LABEL = {
  NEW: 'New', REVIEWING: 'Reviewing', AWAITING_RM_REVIEW: 'Sent to RM',
  RM_REVIEW: 'RM Reviewing', HOD_REVIEW: 'HOD Review',
  EVALUATION: 'In Evaluation', FINANCE_APPROVED: 'Eval Approved → Finance',
  APPROVAL_COMMITTEE: 'Finance Approved', APPROVED: 'Approved', REJECTED: 'Rejected',
};

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

// ─── Reusable proposal list row ────────────────────────────────────
const ProposalRow = ({ sub, isSelected, onToggle, accentColor = '#1565C0', showCommittee = false, showRMApproval = false }) => (
  <Box
    onClick={() => onToggle(sub._id)}
    sx={{
      display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5,
      borderRadius: 2, mb: 1, cursor: 'pointer',
      border: `1.5px solid ${isSelected ? accentColor : '#F0F0F0'}`,
      bgcolor: isSelected ? `${accentColor}10` : '#FAFAFA',
      transition: 'all 0.2s', '&:hover': { borderColor: accentColor + '60' },
    }}
  >
    <Checkbox
      size="small" checked={isSelected}
      onChange={() => onToggle(sub._id)} onClick={e => e.stopPropagation()}
      sx={{ color: accentColor, '&.Mui-checked': { color: accentColor }, mt: -0.3 }}
    />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: accentColor, fontFamily: 'monospace' }}>
          {sub.businessId}
        </Typography>
        <TypeBadge type={sub.submissionType} />
        {showCommittee && sub.workflow?.evaluationReview?.committeeName && (
          <Chip label={`Eval: ${sub.workflow.evaluationReview.committeeName}`} size="small"
            sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }} />
        )}
        {showRMApproval && (
          <Chip label="RM ✓ Approved" size="small"
            sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }} />
        )}
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} noWrap>{sub.title}</Typography>
      <Typography variant="caption" sx={{ color: '#78909C' }} noWrap>
        {sub.employeeName} • {sub.dept}
      </Typography>
    </Box>
  </Box>
);

// ─── Main Component ─────────────────────────────────────────────────
const AutoAssignEmail = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [snack, setSnack]       = useState({ open: false, msg: '', type: 'success' });

  // ── All submissions (shared pool) ──
  const [allSubs, setAllSubs]   = useState([]);

  // ── Tab 1: RM Assignment ──
  const [managers, setManagers] = useState([]);
  const [rmSearch, setRmSearch] = useState('');
  const [rmFilter, setRmFilter] = useState('All');
  const [selMgr, setSelMgr]     = useState(null);
  const [selProp, setSelProp]   = useState(null);
  const [selPropIds, setSelPropIds] = useState([]);
  const [managerEmail, setManagerEmail] = useState('');
  const [emailBody, setEmailBody]       = useState('');
  const propListRef = useRef(null);
  const detailsRef  = useRef(null);

  // ── Tab 2: Evaluation Committee ──
  const [evalSubs, setEvalSubs]           = useState([]);
  const [evalSearch, setEvalSearch]       = useState('');
  const [evalFilter, setEvalFilter]       = useState('All');
  const [selEvalIds, setSelEvalIds]       = useState([]);
  const [selEvalProp, setSelEvalProp]     = useState(null);
  const [committees, setCommittees]       = useState([]);
  const [evalEmails, setEvalEmails]       = useState(['', '', '', '', '', '']);

  // ── Tab 3: Finance Assignment ──
  const [financeSubs, setFinanceSubs] = useState([]);
  const [finSearch, setFinSearch]     = useState('');
  const [finFilter, setFinFilter]     = useState('All');
  const [selFinIds, setSelFinIds]     = useState([]);
  const [finReviewerEmails, setFinReviewerEmails] = useState(['']);
  const [finBatchName, setFinBatchName] = useState('');
  const [selFinProp, setSelFinProp]   = useState(null);

  // ── Tab 4: Approval Committee Assignment ──
  const [approvalSubs, setApprovalSubs] = useState([]);
  const [approvalSearch, setApprovalSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('All');
  const [selApprovalIds, setSelApprovalIds] = useState([]);
  const [approvalReviewerEmails, setApprovalReviewerEmails] = useState(['']);
  const [approvalBatchName, setApprovalBatchName] = useState('');
  const [selApprovalProp, setSelApprovalProp] = useState(null);

  // ─── Fetch All Data ──────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes] = await Promise.all([
        api.get('/admin/submissions'),
      ]);

      const raw = subRes.data.data.submissions || [];
      const parsed = raw.map(sub => {
        const p = parseSubmissionFields(sub);
        return {
          ...sub,
          businessId:     sub.businessId || `SUB-${sub._id.toString().substring(18).toUpperCase()}`,
          submissionType: sub.submissionType || p.submissionType || 'Idea',
          rmEmail: p.rmEmail, rmName: p.rmName, rmValue: p.rmValue,
          hodEmail: p.hodEmail, hodName: p.hodName,
          title: p.title, abstract: p.abstract, dept: p.dept,
          employeeName: p.employeeName, employeeCode: p.employeeCode,
          benefits: p.benefits,
        };
      });
      setAllSubs(parsed);

      // ── Build RM manager list ──
      const rmMap = {};
      parsed.forEach(sub => {
        const key = sub.rmEmail || sub.rmValue || 'unknown';
        if (!rmMap[key]) rmMap[key] = [];
        rmMap[key].push(sub);
      });
      const mngrs = Object.keys(rmMap).map(email => {
        const props = rmMap[email];
        const rmAssigned = props.some(p => ['AWAITING_RM_REVIEW', 'RM_REVIEW', 'AWAITING_HOD_REVIEW', 'HOD_REVIEW'].includes(p.status));
        const hasNew     = props.some(p => ['NEW', 'REVIEWING'].includes(p.status));
        let status = 'Completed';
        if (hasNew) status = 'Unassigned';
        if (rmAssigned) status = 'RM Assigned';
        const first = props[0];
        const name  = first.rmName || (first.rmValue || email).split(' (')[0] || 'Unknown RM';
        return {
          name, email: first.rmEmail || email,
          proposals: props, count: props.length, status,
          avatarInitials: (first.rmEmail || email).split('@')[0].substring(0, 2).toUpperCase(),
        };
      });
      setManagers(mngrs);

      // ── Eval pool: proposals where RM approved (status = EVALUATION) ──
      setEvalSubs(parsed.filter(s =>
        s.status === 'EVALUATION' ||
        (s.workflow?.rmReview?.decision === 'APPROVED' &&
          !['FINANCE_APPROVED', 'APPROVAL_COMMITTEE', 'APPROVED', 'REJECTED'].includes(s.status))
      ));

      // ── Finance pool: FINANCE_APPROVED (both eval-approved and eval-rejected route here) ──
      setFinanceSubs(parsed.filter(s => s.status === 'FINANCE_APPROVED'));

      // ── Approval Committee pool: FINANCE_APPROVED or APPROVAL_COMMITTEE ──
      setApprovalSubs(parsed.filter(s => s.status === 'FINANCE_APPROVED' || s.status === 'APPROVAL_COMMITTEE'));

      // ── Fetch active committees ──
      const commRes = await api.get('/admin/evaluations/committees');
      setCommittees(commRes.data.data.committees.filter(c => c.active !== false));
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setSnack({ open: true, msg: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Auto-build RM email body ──
  useEffect(() => {
    if (selProp && selMgr) {
      const p = selProp;
      const name = selMgr.name || selMgr.email.split('@')[0];
      setEmailBody(`Dear ${name},

A new proposal has been assigned to you for review. Please review the details below:

Business ID: ${p.businessId}
Type: ${p.submissionType}
Employee Name: ${p.employeeName}
Employee Code: ${p.employeeCode}
Department: ${p.dept}

Title: ${p.title}

Abstract:
${p.abstract}

Benefits:
${p.benefits}

Please log in to the portal to review this proposal and provide your feedback.

Best regards,
MINDS Innovation Team — Cube Highways Innovation Centre`);
    } else {
      setEmailBody('');
    }
  }, [selMgr, selProp]);

  // ─── Tab 1: RM handlers ─────────────────────────────────────────
  const filteredManagers = managers.filter(m => {
    const q = rmSearch.toLowerCase();
    const matchSearch = m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
    return matchSearch && (rmFilter === 'All' || m.status === rmFilter);
  });

  const handleSelectMgr = mgr => {
    if (selMgr?.email === mgr.email) { setSelMgr(null); setSelProp(null); setSelPropIds([]); }
    else {
      setSelMgr(mgr); setSelProp(null);
      setSelPropIds(mgr.proposals.map(p => p._id));
      setTimeout(() => propListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  const handleSelectPropById = id => {
    const prop = selMgr.proposals.find(p => p._id === id);
    if (!prop) return;
    setSelProp(prop);
    setManagerEmail(prop.workflow?.rmReview?.reviewerEmail || prop.rmEmail || selMgr.email || '');
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleTogglePropId = (id, e) => {
    e.stopPropagation();
    setSelPropIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    handleSelectPropById(id);
  };

  const handleSendEmailNative = async () => {
    if (!managerEmail) { setSnack({ open: true, msg: 'Please provide a Manager Email', type: 'error' }); return; }
    try {
      await api.post('/admin/submissions/auto-assign-rm', {
        email: managerEmail, 
        managerName: selMgr?.name || managerEmail.split('@')[0], 
        proposalIds: [selProp._id]
      });
      setSnack({ open: true, msg: 'Email assigned and sent successfully!', type: 'success' });
      await fetchData(); setSelProp(null); setSelMgr(null);
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to assign and send email', type: 'error' });
    }
  };

  const handleAutoAssignRM = async () => {
    if (!selMgr || selPropIds.length === 0) return;
    try {
      await api.post('/admin/submissions/auto-assign-rm', {
        email: selMgr.email, managerName: selMgr.name, proposalIds: selPropIds,
      });
      setSnack({ open: true, msg: `Auto-assigned ${selPropIds.length} proposals to ${selMgr.name} and email sent!`, type: 'success' });
      await fetchData(); setSelProp(null); setSelPropIds([]); setSelMgr(null);
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to auto-assign proposals', type: 'error' });
    }
  };

  const rmCounts = {
    All: managers.length,
    Unassigned: managers.filter(m => m.status === 'Unassigned').length,
    'RM Assigned': managers.filter(m => m.status === 'RM Assigned').length,
    Completed: managers.filter(m => m.status === 'Completed').length,
  };

  // ─── Tab 2: Eval handlers ────────────────────────────────────────────────────
  const filteredEvalSubs = evalSubs.filter(s => {
    const q = evalSearch.toLowerCase();
    const matchSearch = (s.title || '').toLowerCase().includes(q) ||
      (s.businessId || '').toLowerCase().includes(q) || (s.employeeName || '').toLowerCase().includes(q);
    if (evalFilter === 'Assigned') return matchSearch && s.workflow?.evaluationReview?.committeeName;
    if (evalFilter === 'Unassigned') return matchSearch && !s.workflow?.evaluationReview?.committeeName;
    return matchSearch;
  });

  const handleEvalEmailChange = (idx, val) => setEvalEmails(prev => prev.map((e, i) => i === idx ? val : e));

  const handleAutoAssignEvalCommittee = async () => {
    const validEmails = evalEmails.filter(e => e.trim());
    if (validEmails.length !== 6 || selEvalIds.length === 0) {
      setSnack({ open: true, msg: 'Please provide exactly 6 evaluator emails and select at least one proposal', type: 'error' }); return;
    }
    const uniqueEmails = [...new Set(validEmails.map(e => e.trim().toLowerCase()))];
    if (uniqueEmails.length !== 6) {
      setSnack({ open: true, msg: 'All 6 evaluator emails must be unique', type: 'error' }); return;
    }
    try {
      await api.post('/admin/evaluations/auto-assign-eval-committee', {
        evaluatorEmails: uniqueEmails, submissionIds: selEvalIds,
      });
      setSnack({ open: true, msg: `${selEvalIds.length} proposal(s) assigned — 6 secure emails dispatched per proposal!`, type: 'success' });
      setSelEvalIds([]); setEvalEmails(['', '', '', '', '', '']); setSelEvalProp(null);
      await fetchData();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to assign evaluators', type: 'error' });
    }
  };

  const evalCounts = {
    All: evalSubs.length,
    Unassigned: evalSubs.filter(s => !s.workflow?.evaluationReview?.committeeName).length,
    Assigned: evalSubs.filter(s => !!s.workflow?.evaluationReview?.committeeName).length,
  };

  // ─── Tab 3: Finance Assignment handlers ─────────────────────────
  const filteredFinSubs = financeSubs.filter(s => {
    const q = finSearch.toLowerCase();
    const matchSearch = (s.title || '').toLowerCase().includes(q) ||
      (s.businessId || '').toLowerCase().includes(q) || (s.employeeName || '').toLowerCase().includes(q);
    if (finFilter === 'Assigned') return matchSearch && s.workflow?.financeReview?.reviewerName;
    if (finFilter === 'Unassigned') return matchSearch && !s.workflow?.financeReview?.reviewerName;
    return matchSearch;
  });

  const handleAddReviewerEmail = () => setFinReviewerEmails(prev => [...prev, '']);
  const handleRemoveReviewerEmail = idx => setFinReviewerEmails(prev => prev.filter((_, i) => i !== idx));
  const handleReviewerEmailChange = (idx, val) => setFinReviewerEmails(prev => prev.map((e, i) => i === idx ? val : e));

  const handleAutoAssignFinance = async () => {
    const validEmails = finReviewerEmails.filter(e => e.trim());
    if (validEmails.length === 0 || selFinIds.length === 0) {
      setSnack({ open: true, msg: 'Add at least one reviewer email and select proposals', type: 'error' }); return;
    }
    try {
      await api.post('/admin/evaluations/auto-assign-finance', {
        reviewerEmails: validEmails, submissionIds: selFinIds, batchName: finBatchName || undefined,
      });
      setSnack({ open: true, msg: `${selFinIds.length} proposal(s) assigned to finance reviewers — email sent!`, type: 'success' });
      setSelFinIds([]); setFinReviewerEmails(['']); setFinBatchName(''); setSelFinProp(null);
      await fetchData();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to assign to finance reviewers', type: 'error' });
    }
  };

  const finCounts = {
    All: financeSubs.length,
    Unassigned: financeSubs.filter(s => !s.workflow?.financeReview?.reviewerName).length,
    Assigned: financeSubs.filter(s => !!s.workflow?.financeReview?.reviewerName).length,
  };

  // ─── Tab 4: Approval Committee Assignment handlers ──────────────
  const filteredApprovalSubs = approvalSubs.filter(s => {
    const q = approvalSearch.toLowerCase();
    const matchSearch = (s.title || '').toLowerCase().includes(q) ||
      (s.businessId || '').toLowerCase().includes(q) || (s.employeeName || '').toLowerCase().includes(q);
    if (approvalFilter === 'Assigned') return matchSearch && s.status === 'APPROVAL_COMMITTEE';
    if (approvalFilter === 'Unassigned') return matchSearch && s.status !== 'APPROVAL_COMMITTEE';
    return matchSearch;
  });

  const handleAddApprovalEmail = () => setApprovalReviewerEmails(prev => [...prev, '']);
  const handleRemoveApprovalEmail = idx => setApprovalReviewerEmails(prev => prev.filter((_, i) => i !== idx));
  const handleApprovalEmailChange = (idx, val) => setApprovalReviewerEmails(prev => prev.map((e, i) => i === idx ? val : e));

  const handleAutoAssignApproval = async () => {
    const validEmails = approvalReviewerEmails.filter(e => e.trim());
    if (validEmails.length === 0 || selApprovalIds.length === 0) {
      setSnack({ open: true, msg: 'Add at least one reviewer email and select proposals', type: 'error' }); return;
    }
    try {
      await api.post('/admin/evaluations/auto-assign-approval', {
        reviewerEmails: validEmails, submissionIds: selApprovalIds, batchName: approvalBatchName || undefined,
      });
      setSnack({ open: true, msg: `${selApprovalIds.length} proposal(s) assigned to approval committee — email sent!`, type: 'success' });
      setSelApprovalIds([]); setApprovalReviewerEmails(['']); setApprovalBatchName(''); setSelApprovalProp(null);
      await fetchData();
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to assign to approval committee', type: 'error' });
    }
  };

  const approvalCounts = {
    All: approvalSubs.length,
    Unassigned: approvalSubs.filter(s => s.status !== 'APPROVAL_COMMITTEE').length,
    Assigned: approvalSubs.filter(s => s.status === 'APPROVAL_COMMITTEE').length,
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
  );

  // ─── RENDER ─────────────────────────────────────────────────────
  return (
    <Box>
      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #E0E0E0', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.875rem', minHeight: 48 },
            '& .Mui-selected': { color: '#1565C0' },
            '& .MuiTabs-indicator': { backgroundColor: '#1565C0', height: 3 },
          }}
        >
          <Tab
            icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                RM Assignment
                <Chip label={rmCounts.Unassigned} size="small"
                  sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 700 }} />
              </Box>
            }
          />
          <Tab
            icon={<GroupIcon sx={{ fontSize: 18 }} />} iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Evaluation Committee
                <Chip label={evalCounts.Unassigned} size="small"
                  sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }} />
              </Box>
            }
          />
          <Tab
            icon={<FinanceIcon sx={{ fontSize: 18 }} />} iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Finance Assignment
                <Chip label={finCounts.Unassigned} size="small"
                  sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 700 }} />
              </Box>
            }
          />
          <Tab
            icon={<AssignedIcon sx={{ fontSize: 18 }} />} iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Approval Committee
                <Chip label={approvalCounts.Unassigned} size="small"
                  sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#FFF8E1', color: '#F57F17', fontWeight: 700 }} />
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          TAB 1 — RM Assignment
      ══════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabIndex} index={0}>
        <Grid container spacing={3}>
          {/* Manager List */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Reporting Managers</Typography>
                  <Tooltip title="Refresh"><IconButton size="small" onClick={fetchData}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
                <TextField fullWidth size="small" placeholder="Search RM name or email..."
                  value={rmSearch} onChange={e => setRmSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} /></InputAdornment> }}
                  sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {['All', 'Unassigned', 'RM Assigned', 'Completed'].map(f => (
                    <Chip key={f} label={`${f} (${rmCounts[f] ?? 0})`} size="small" onClick={() => setRmFilter(f)}
                      sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
                        bgcolor: rmFilter === f ? '#1565C0' : '#F5F5F5',
                        color: rmFilter === f ? '#fff' : '#546E7A' }} />
                  ))}
                </Box>
                <Box sx={{ maxHeight: 480, overflowY: 'auto', pr: 0.5 }}>
                  {filteredManagers.map(mgr => {
                    const cfg = rmStatusConfig[mgr.status] || rmStatusConfig.Completed;
                    const isSel = selMgr?.email === mgr.email;
                    return (
                      <Box key={mgr.email} onClick={() => handleSelectMgr(mgr)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, mb: 1,
                          cursor: 'pointer', border: `1px solid ${isSel ? '#1565C0' : '#F0F0F0'}`,
                          bgcolor: isSel ? '#EEF2FF' : '#FAFAFA', transition: 'all 0.2s',
                          '&:hover': { bgcolor: isSel ? '#E3EAF7' : '#F5F5F5' } }}>
                        <Avatar sx={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)', width: 38, height: 38, fontSize: '0.75rem', fontWeight: 700 }}>
                          {mgr.avatarInitials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }} noWrap>{mgr.name}</Typography>
                          <Typography variant="caption" sx={{ color: '#78909C' }} noWrap>{mgr.email} • {mgr.count} Proposals</Typography>
                        </Box>
                        <Chip label={mgr.status} size="small"
                          sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.68rem', height: 22 }} />
                      </Box>
                    );
                  })}
                  {filteredManagers.length === 0 && (
                    <Typography variant="body2" sx={{ color: '#9E9E9E', textAlign: 'center', py: 4 }}>No managers found</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Review Panel */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Review Assignment</Typography>
                <Typography variant="body2" sx={{ color: '#78909C', mb: 2.5 }}>
                  Select a manager from the list, choose proposals, and send the review email.
                </Typography>

                {selMgr ? (
                  <Box sx={{ p: 2, bgcolor: '#EEF2FF', borderRadius: 2, mb: 2.5, border: '1px solid #BBDEFB' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                      <Avatar sx={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)', width: 40, height: 40, fontSize: '0.8rem', fontWeight: 700 }}>
                        {selMgr.avatarInitials}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selMgr.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#546E7A' }}>{selMgr.email} • {selMgr.count} Proposals</Typography>
                      </Box>
                      <Chip label="Selected" size="small" sx={{ bgcolor: '#1565C0', color: '#fff', fontWeight: 700 }} />
                    </Box>
                    <Button variant="contained" fullWidth disabled={selPropIds.length === 0}
                      onClick={handleAutoAssignRM} startIcon={<SendIcon />} sx={{ fontWeight: 700, bgcolor: '#1565C0' }}>
                      Auto Assign Selected ({selPropIds.length}) → Send RM Email
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2, mb: 2.5, border: '1px dashed #CFD8DC', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#9E9E9E' }}>← Select a manager to begin</Typography>
                  </Box>
                )}

                {selMgr && (
                  <Fade in timeout={400}>
                    <Box ref={propListRef}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Select Proposal(s)</Typography>
                        <Box>
                          <Button size="small" sx={{ textTransform: 'none', fontWeight: 600, minWidth: 'auto', p: 0, mr: 2 }}
                            onClick={() => setSelPropIds(selMgr.proposals.map(p => p._id))}>Select All</Button>
                          <Button size="small" color="inherit" sx={{ textTransform: 'none', fontWeight: 600, minWidth: 'auto', p: 0, color: '#78909C' }}
                            onClick={() => setSelPropIds([])}>Deselect All</Button>
                        </Box>
                      </Box>
                      <Grid container spacing={1.5} sx={{ mb: 2 }}>
                        {selMgr.proposals.map(t => (
                          <Grid item xs={12} sm={6} md={4} key={t._id}>
                            <Box
                              onClick={() => handleSelectPropById(t._id)}
                              sx={{ p: 1.5, borderRadius: 2, cursor: 'pointer',
                                border: `1.5px solid ${selProp?._id === t._id ? '#1565C0' : '#E0E0E0'}`,
                                bgcolor: selProp?._id === t._id ? '#EEF2FF' : '#FAFAFA',
                                transition: 'all 0.2s', '&:hover': { borderColor: '#90CAF9' } }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Checkbox size="small" checked={selPropIds.includes(t._id)}
                                  onChange={e => handleTogglePropId(t._id, e)}
                                  onClick={e => e.stopPropagation()}
                                  sx={{ color: '#1565C0', '&.Mui-checked': { color: '#1565C0' }, mt: -0.5 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565C0', fontFamily: 'monospace', display: 'block' }}>{t.businessId}</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} noWrap>{t.title}</Typography>
                                  <Typography variant="caption" sx={{ color: '#78909C', display: 'block' }}>{STATUS_LABEL[t.status] || 'Unknown'}</Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Fade>
                )}

                {selProp && (
                  <Fade in timeout={400}>
                    <Box ref={detailsRef}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Proposal Details</Typography>
                      <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 2, border: '1px solid #E8EAED', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#9E9E9E', width: 60 }}>ID:</Typography>
                          <Typography variant="caption" sx={{ color: '#1565C0', fontWeight: 800, fontFamily: 'monospace' }}>{selProp.businessId}</Typography>
                          <TypeBadge type={selProp.submissionType} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                          <Typography variant="caption" sx={{ color: '#9E9E9E', width: 60 }}>Abstract:</Typography>
                          <Typography variant="caption" sx={{ color: '#546E7A', whiteSpace: 'pre-line' }}>{selProp.abstract}</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Manager Email</Typography>
                          <TextField fullWidth size="small" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Generated Email</Typography>
                        <TextField fullWidth multiline minRows={8} variant="outlined" size="small"
                          value={emailBody} onChange={e => setEmailBody(e.target.value)} sx={{ bgcolor: '#fff', mb: 2 }} />
                        <Button variant="contained" fullWidth size="large" onClick={handleSendEmailNative}
                          startIcon={<SendIcon />} sx={{ py: 1.5, fontWeight: 700, bgcolor: '#1565C0' }}>
                          Send Email & Assign RM
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════════════
          TAB 2 — Evaluation Committee
      ══════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabIndex} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>RM-Accepted Proposals</Typography>
                    <Typography variant="caption" sx={{ color: '#78909C' }}>
                      Proposals approved by their Reporting Manager — ready for Evaluation Committee review.
                    </Typography>
                  </Box>
                  <Tooltip title="Refresh"><IconButton size="small" onClick={fetchData}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
                </Box>

                <TextField fullWidth size="small" placeholder="Search by ID, title, or employee..."
                  value={evalSearch} onChange={e => setEvalSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} /></InputAdornment> }}
                  sx={{ mb: 1.5 }} />

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {['All', 'Unassigned', 'Assigned'].map(f => (
                    <Chip key={f} label={`${f} (${evalCounts[f] ?? 0})`} size="small" onClick={() => setEvalFilter(f)}
                      sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
                        bgcolor: evalFilter === f ? '#2E7D32' : '#F5F5F5',
                        color: evalFilter === f ? '#fff' : '#546E7A' }} />
                  ))}
                </Box>

                <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 0.5 }}>
                  {filteredEvalSubs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <EvalIcon sx={{ fontSize: 48, color: '#E0E0E0', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#9E9E9E' }}>
                        {evalSubs.length === 0 ? 'No RM-accepted proposals yet.' : 'No proposals match the current filter.'}
                      </Typography>
                    </Box>
                  ) : filteredEvalSubs.map(sub => (
                    <ProposalRow
                      key={sub._id} sub={sub}
                      isSelected={selEvalIds.includes(sub._id)}
                      onToggle={() => { setSelEvalIds(prev => prev.includes(sub._id) ? prev.filter(x => x !== sub._id) : [...prev, sub._id]); setSelEvalProp(sub); }}
                      accentColor="#2E7D32" showCommittee showRMApproval
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
              position: 'sticky', top: 16 
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <EvalIcon sx={{ color: '#2E7D32', fontSize: 26 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Send to Evaluators</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#78909C', mb: 2.5 }}>
                  Select proposals → choose a 6-member evaluation committee → system generates 6 secure links.
                  Each evaluator submits their vote individually.
                </Typography>

                {/* Selected count */}
                <Box sx={{ p: 1.5, bgcolor: selEvalIds.length > 0 ? '#E8F5E9' : '#FAFAFA', borderRadius: 2, mb: 2,
                  border: `1px solid ${selEvalIds.length > 0 ? '#A5D6A7' : '#E0E0E0'}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: selEvalIds.length > 0 ? '#2E7D32' : '#9E9E9E' }}>
                    {selEvalIds.length > 0 ? `${selEvalIds.length} proposal(s) selected` : '← Select proposals from the list'}
                  </Typography>
                </Box>

                {/* Manual 6-Email Inputs */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Evaluator Emails (Required: exactly 6)</Typography>
                  {evalEmails.map((email, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth size="small"
                        type="email"
                        placeholder={`Evaluator email ${idx + 1}`}
                        value={email}
                        onChange={e => handleEvalEmailChange(idx, e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: '#9E9E9E' }} /></InputAdornment>
                        }}
                      />
                    </Box>
                  ))}
                </Box>

                {/* Info box */}
                <Box sx={{ p: 1.5, bgcolor: '#F3E5F5', borderRadius: 2, mb: 2, border: '1px solid #CE93D8' }}>
                  <Typography variant="caption" sx={{ color: '#6A1B9A', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    📋 What happens next?
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4A148C' }}>
                    Evaluators receive a secure link. When they submit their review, <b>both approved AND rejected</b> proposals move to the <b>Finance Assignment</b> tab — rejected ones show a rejection tag.
                  </Typography>
                </Box>

                <Button variant="contained" fullWidth size="large"
                  disabled={selEvalIds.length === 0 || evalEmails.filter(e => e.trim()).length !== 6}
                  onClick={handleAutoAssignEvalCommittee} startIcon={<SendIcon />}
                  sx={{ fontWeight: 700, py: 1.5, bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
                  Assign Evaluators & Send Emails ({selEvalIds.length})
                </Button>

                {selEvalProp && (
                  <Fade in timeout={400}>
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Last Selected Proposal</Typography>
                      <Box sx={{ bgcolor: '#F9FAFB', p: 1.5, borderRadius: 2, border: '1px solid #E8EAED' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#2E7D32', fontFamily: 'monospace' }}>{selEvalProp.businessId}</Typography>
                          <TypeBadge type={selEvalProp.submissionType} />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>{selEvalProp.title}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#546E7A' }}>RM Decision</Typography>
                          <ReviewBadge decision={selEvalProp.workflow?.rmReview?.decision} />
                        </Box>
                      </Box>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════════════
          TAB 3 — Finance Assignment
      ══════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabIndex} index={2}>
        <Grid container spacing={3}>
          {/* Proposals pool */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Post-Evaluation Proposals</Typography>
                    <Typography variant="caption" sx={{ color: '#78909C' }}>
                      All proposals that completed evaluation — both approved and rejected — require Finance Assignment.
                    </Typography>
                  </Box>
                  <Tooltip title="Refresh"><IconButton size="small" onClick={fetchData}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
                </Box>

                <TextField fullWidth size="small" placeholder="Search by ID, title, or employee..."
                  value={finSearch} onChange={e => setFinSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} /></InputAdornment> }}
                  sx={{ mb: 1.5 }} />

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {['All', 'Unassigned', 'Assigned'].map(f => (
                    <Chip key={f} label={`${f} (${finCounts[f] ?? 0})`} size="small" onClick={() => setFinFilter(f)}
                      sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
                        bgcolor: finFilter === f ? '#1565C0' : '#F5F5F5',
                        color: finFilter === f ? '#fff' : '#546E7A' }} />
                  ))}
                </Box>

                <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 0.5 }}>
                  {filteredFinSubs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <FinanceIcon sx={{ fontSize: 48, color: '#E0E0E0', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#9E9E9E' }}>
                        {financeSubs.length === 0
                          ? 'No post-evaluation proposals yet. Once evaluators submit their decisions, proposals will appear here.'
                          : 'No proposals match the current filter.'}
                      </Typography>
                    </Box>
                  ) : filteredFinSubs.map(sub => {
                    const isSel = selFinIds.includes(sub._id);
                    const assignedTo = sub.workflow?.financeReview?.reviewerName;
                    const evalDecision = sub.workflow?.evaluationReview?.decision;
                    const isEvalRejected = evalDecision === 'REJECTED';
                    return (
                      <Box key={sub._id}
                        onClick={() => { setSelFinIds(prev => prev.includes(sub._id) ? prev.filter(x => x !== sub._id) : [...prev, sub._id]); setSelFinProp(sub); }}
                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, mb: 1, cursor: 'pointer',
                          border: `1.5px solid ${isSel ? (isEvalRejected ? '#C62828' : '#1565C0') : isEvalRejected ? '#FFCDD2' : '#F0F0F0'}`,
                          bgcolor: isSel ? (isEvalRejected ? '#FFF3F3' : '#EEF2FF') : isEvalRejected ? '#FFF8F8' : '#FAFAFA',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: isEvalRejected ? '#EF9A9A' : '#90CAF9' } }}>
                        <Checkbox size="small" checked={isSel}
                          onChange={() => { setSelFinIds(prev => prev.includes(sub._id) ? prev.filter(x => x !== sub._id) : [...prev, sub._id]); }}
                          onClick={e => e.stopPropagation()}
                          sx={{ color: isEvalRejected ? '#C62828' : '#1565C0', '&.Mui-checked': { color: isEvalRejected ? '#C62828' : '#1565C0' }, mt: -0.3 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: isEvalRejected ? '#C62828' : '#1565C0', fontFamily: 'monospace' }}>{sub.businessId}</Typography>
                            <TypeBadge type={sub.submissionType} />
                            {isEvalRejected ? (
                              <Chip label="Eval ✗ Rejected" size="small"
                                sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 700 }} />
                            ) : (
                              <Chip label="Eval ✓ Approved" size="small"
                                sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700 }} />
                            )}
                            {assignedTo && (
                              <Chip label={`Finance: ${assignedTo}`} size="small"
                                sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 700 }} />
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} noWrap>{sub.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#78909C' }} noWrap>
                            {sub.employeeName} • {sub.dept} •{' '}
                            <span style={{ color: isEvalRejected ? '#C62828' : '#2E7D32', fontWeight: 600 }}>
                              Eval: {sub.workflow?.evaluationReview?.committeeName || 'Committee'} {isEvalRejected ? '✗' : '✓'}
                            </span>
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Finance Assignment Panel */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
              position: 'sticky', top: 16 
            }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <FinanceIcon sx={{ color: '#1565C0', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Assign to Finance Reviewers</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#78909C', mb: 2.5 }}>
                  Select proposals → add finance reviewer emails → send a secure review link via email.
                  Finance reviewers click the link and submit their budget decision.
                </Typography>

                {/* Selected count */}
                <Box sx={{ p: 1.5, bgcolor: selFinIds.length > 0 ? '#E3F2FD' : '#FAFAFA', borderRadius: 2, mb: 2,
                  border: `1px solid ${selFinIds.length > 0 ? '#90CAF9' : '#E0E0E0'}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: selFinIds.length > 0 ? '#1565C0' : '#9E9E9E' }}>
                    {selFinIds.length > 0 ? `${selFinIds.length} proposal(s) selected for finance review` : '← Select proposals from the list'}
                  </Typography>
                </Box>

                {/* Finance Reviewer Emails */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Finance Reviewer Emails</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddReviewerEmail}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}>
                      Add Reviewer
                    </Button>
                  </Box>
                  {finReviewerEmails.map((email, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth size="small"
                        type="email"
                        placeholder={`Finance reviewer email ${idx + 1}`}
                        value={email}
                        onChange={e => handleReviewerEmailChange(idx, e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: '#9E9E9E' }} /></InputAdornment>
                        }}
                      />
                      {finReviewerEmails.length > 1 && (
                        <IconButton size="small" onClick={() => handleRemoveReviewerEmail(idx)} sx={{ color: '#EF5350' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Typography variant="caption" sx={{ color: '#78909C' }}>
                    Each reviewer will receive a single email with a secure link to review all selected proposals.
                  </Typography>
                </Box>

                {/* Optional batch name */}
                <TextField fullWidth size="small" label="Batch Name (optional)"
                  placeholder={`Finance-Batch-${new Date().toLocaleDateString('en-IN')}`}
                  value={finBatchName} onChange={e => setFinBatchName(e.target.value)} sx={{ mb: 2 }} />

                {/* Info box about what happens next */}
                <Box sx={{ p: 1.5, bgcolor: '#FFF8E1', borderRadius: 2, mb: 2, border: '1px solid #FFE082' }}>
                  <Typography variant="caption" sx={{ color: '#F57F17', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    📋 What happens next?
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#795548' }}>
                    Finance reviewers receive an email with a secure link. When they approve a proposal's budget, 
                    it automatically moves to the <b>Finance Approval</b> tab for final committee action.
                  </Typography>
                </Box>

                <Button variant="contained" fullWidth size="large"
                  disabled={selFinIds.length === 0 || !finReviewerEmails.some(e => e.trim())}
                  onClick={handleAutoAssignFinance} startIcon={<SendIcon />}
                  sx={{ fontWeight: 700, py: 1.5, bgcolor: '#1565C0', '&:hover': { bgcolor: '#0D47A1' } }}>
                  Send Finance Review Email ({selFinIds.length})
                </Button>

                {/* Selected proposal preview */}
                {selFinProp && (
                  <Fade in timeout={400}>
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Last Selected Proposal</Typography>
                      <Box sx={{ bgcolor: '#F9FAFB', p: 1.5, borderRadius: 2, border: '1px solid #E8EAED' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#1565C0', fontFamily: 'monospace' }}>{selFinProp.businessId}</Typography>
                          <TypeBadge type={selFinProp.submissionType} />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>{selFinProp.title}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#757575', fontWeight: 700 }}>RM Decision</Typography>
                          <ReviewBadge decision={selFinProp.workflow?.rmReview?.decision} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#757575', fontWeight: 700 }}>Eval Decision</Typography>
                          <ReviewBadge decision={selFinProp.workflow?.evaluationReview?.decision} />
                        </Box>
                        {selFinProp.workflow?.evaluationReview?.remarks && (
                          <Typography variant="caption" sx={{ color: '#546E7A', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                            "{selFinProp.workflow.evaluationReview.remarks}"
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ══════════════════════════════════════════════════════════════
          TAB 4 — Approval Committee Assignment
      ══════════════════════════════════════════════════════════════ */}
      <TabPanel value={tabIndex} index={3}>
        <Grid container spacing={3}>
          {/* List */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Proposals for Approval</Typography>
                  <Tooltip title="Refresh"><IconButton size="small" onClick={fetchData}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
                <TextField fullWidth size="small" placeholder="Search proposal title, ID, or employee..."
                  value={approvalSearch} onChange={e => setApprovalSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} /></InputAdornment> }}
                  sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {['All', 'Unassigned', 'Assigned'].map(f => (
                    <Chip key={f} label={`${f} (${approvalCounts[f] ?? 0})`} size="small" onClick={() => setApprovalFilter(f)}
                      sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
                        bgcolor: approvalFilter === f ? '#1565C0' : '#F5F5F5',
                        color: approvalFilter === f ? '#fff' : '#546E7A' }} />
                  ))}
                </Box>
                <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 0.5 }}>
                  {filteredApprovalSubs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 4, color: '#9E9E9E' }}>
                      <UnassignedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                      <Typography>No proposals found</Typography>
                    </Box>
                  ) : filteredApprovalSubs.map(sub => {
                    const isSelected = selApprovalIds.includes(sub._id);
                    return (
                      <Box key={sub._id} onClick={() => {
                        setSelApprovalIds(prev => prev.includes(sub._id) ? prev.filter(x => x !== sub._id) : [...prev, sub._id]);
                        setSelApprovalProp(sub);
                      }}
                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 2, mb: 1, cursor: 'pointer',
                          border: `1.5px solid ${isSelected ? '#1565C0' : '#F0F0F0'}`, bgcolor: isSelected ? '#1565C010' : '#FAFAFA',
                          transition: 'all 0.2s', '&:hover': { borderColor: '#1565C060' } }}>
                        <Checkbox size="small" checked={isSelected} sx={{ color: '#1565C0', '&.Mui-checked': { color: '#1565C0' }, mt: -0.3 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1565C0', fontFamily: 'monospace' }}>{sub.businessId}</Typography>
                            <TypeBadge type={sub.submissionType} />
                            {sub.status === 'APPROVAL_COMMITTEE' && (
                              <Chip label="Assigned" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FFF8E1', color: '#F57F17', fontWeight: 700 }} />
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} noWrap>{sub.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#78909C' }} noWrap>{sub.employeeName} • {sub.dept}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Assignment Panel */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', position: 'sticky', top: 16 }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <AssignedIcon sx={{ color: '#F57F17', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Assign to Approval Committee</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#78909C', mb: 2.5 }}>
                  Select proposals → add committee reviewer emails → send a secure review link.
                  Reviewers click the link to provide their final approval.
                </Typography>

                {/* Selected count */}
                <Box sx={{ p: 1.5, bgcolor: selApprovalIds.length > 0 ? '#FFF8E1' : '#FAFAFA', borderRadius: 2, mb: 2,
                  border: `1px solid ${selApprovalIds.length > 0 ? '#FFE082' : '#E0E0E0'}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: selApprovalIds.length > 0 ? '#F57F17' : '#9E9E9E' }}>
                    {selApprovalIds.length > 0 ? `${selApprovalIds.length} proposal(s) selected for final approval` : '← Select proposals from the list'}
                  </Typography>
                </Box>

                {/* Reviewer Emails */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Committee Member Emails</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddApprovalEmail}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}>
                      Add Reviewer
                    </Button>
                  </Box>
                  {approvalReviewerEmails.map((email, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                      <TextField fullWidth size="small" type="email" placeholder={`Reviewer email ${idx + 1}`}
                        value={email} onChange={e => handleApprovalEmailChange(idx, e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 18, color: '#9E9E9E' }} /></InputAdornment> }} />
                      {approvalReviewerEmails.length > 1 && (
                        <IconButton size="small" onClick={() => handleRemoveApprovalEmail(idx)} sx={{ color: '#EF5350' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Typography variant="caption" sx={{ color: '#78909C' }}>
                    Each reviewer receives one email with a link to review all selected proposals.
                  </Typography>
                </Box>

                <TextField fullWidth size="small" label="Batch Name (optional)"
                  placeholder={`Approval-Batch-${new Date().toLocaleDateString('en-IN')}`}
                  value={approvalBatchName} onChange={e => setApprovalBatchName(e.target.value)} sx={{ mb: 2 }} />

                <Box sx={{ p: 1.5, bgcolor: '#E8F5E9', borderRadius: 2, mb: 2, border: '1px solid #C8E6C9' }}>
                  <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    📋 What happens next?
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#1B5E20' }}>
                    Approval Committee members receive an email with a secure link. When they provide final approval, the proposal is marked as Approved.
                  </Typography>
                </Box>

                <Button variant="contained" fullWidth size="large"
                  disabled={selApprovalIds.length === 0 || !approvalReviewerEmails.some(e => e.trim())}
                  onClick={handleAutoAssignApproval} startIcon={<SendIcon />}
                  sx={{ fontWeight: 700, py: 1.5, bgcolor: '#F57F17', color: '#fff', '&:hover': { bgcolor: '#F9A825' } }}>
                  Send Approval Email ({selApprovalIds.length})
                </Button>

                {/* Selected proposal preview */}
                {selApprovalProp && (
                  <Fade in timeout={400}>
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Last Selected Proposal</Typography>
                      <Box sx={{ bgcolor: '#F9FAFB', p: 1.5, borderRadius: 2, border: '1px solid #E8EAED' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#1565C0', fontFamily: 'monospace' }}>{selApprovalProp.businessId}</Typography>
                          <TypeBadge type={selApprovalProp.submissionType} />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>{selApprovalProp.title}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#757575', fontWeight: 700 }}>RM Decision</Typography>
                          <ReviewBadge decision={selApprovalProp.workflow?.rmReview?.decision} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#757575', fontWeight: 700 }}>Eval Decision</Typography>
                          <ReviewBadge decision={selApprovalProp.workflow?.evaluationReview?.decision} />
                        </Box>
                        {selApprovalProp.workflow?.evaluationReview?.remarks && (
                          <Typography variant="caption" sx={{ color: '#546E7A', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                            "{selApprovalProp.workflow.evaluationReview.remarks}"
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#757575', fontWeight: 700 }}>Finance Decision</Typography>
                          <ReviewBadge decision={selApprovalProp.workflow?.financeReview?.decision} />
                        </Box>
                      </Box>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.type} variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AutoAssignEmail;
