import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Chip, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Drawer, IconButton,
  TextField, Avatar, Paper, MenuItem, Select, FormControl, InputLabel, Autocomplete, Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Replay as ReworkIcon,
  AccountBalance as FinanceIcon,
  HourglassEmpty as PendingIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  ReceiptLong as ReceiptIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { TypeBadge } from '../components/DataTable';
import api from '../utils/api';
import { parseSubmissionFields } from '../utils/submissionParser';

// ── Helpers ───────────────────────────────────────────────────────────────────
const PRIORITY_META = {
  High:   { color: '#C62828', bg: '#FFEBEE' },
  Medium: { color: '#E65100', bg: '#FFF3E0' },
  Low:    { color: '#2E7D32', bg: '#E8F5E9' },
};

const STATUS_META = {
  Pending:  { color: '#F57C00', bg: '#FFF3E0', label: 'Pending' },
  Approved: { color: '#2E7D32', bg: '#E8F5E9', label: 'Approved' },
  Rejected: { color: '#C62828', bg: '#FFEBEE', label: 'Rejected' },
};

const InfoRow = ({ label, value, bold }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.9, borderBottom: '1px solid #F1F5F9' }}>
    <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600 }}>{label}</Typography>
    <Typography variant="caption" sx={{ fontWeight: bold ? 800 : 600, color: '#1A2332', textAlign: 'right', maxWidth: '65%' }}>{value}</Typography>
  </Box>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const FinanceApproval = () => {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialog, setDialog] = useState({ open: false, action: null });
  const [dialogNote, setDialogNote] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [approvedBudget, setApprovedBudget] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const infoRef = useRef(null);
  const budgetRef = useRef(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/submissions');
      const mapped = (res.data.data.submissions || []).map(sub => {
        const parsed = parseSubmissionFields(sub);

        const approvedBudget = parsed.approvedBudget;
        const userEstimatedAmount = parsed.userBudget || parsed.budget || 0;
        const rawAmount = (approvedBudget !== undefined && approvedBudget !== null) ? approvedBudget : userEstimatedAmount;
        const numAmount = parseFloat(String(rawAmount).replace(/[^\d.-]/g, '')) || 0;
        const userNumAmount = parseFloat(String(userEstimatedAmount).replace(/[^\d.-]/g, '')) || 0;

        return {
          id: sub._id,
          trackingId: sub.trackingId || sub.businessId,
          wbsCode: sub.wbsCode,
          businessId: parsed.businessId,
          submissionType: parsed.submissionType,
          title: parsed.title,
          parsedTitle: parsed.title,
          department: parsed.dept,
          requester: parsed.employeeName,
          employeeCode: parsed.employeeCode,
          rmValue: parsed.rmValue,
          hodValue: parsed.hodValue,
          amount: `₹ ${numAmount.toLocaleString('en-IN')}`,
          numAmount,
          userAmount: `₹ ${userNumAmount.toLocaleString('en-IN')}`,
          budget: parsed.budget ? 'CAPEX/OPEX' : 'General',
          category: parsed.category || 'Expenditure',
          abstract: parsed.abstract,
          benefits: parsed.benefits,
          attachments: parsed.attachments,
          answers: parsed.answers,
          // Finance view sees all submissions that have passed EVALUATION and reached FINANCE.
          // The status tab will be based on financeReview.decision if present.
          status: (sub.workflow?.financeReview?.decision === 'APPROVED') ? 'Approved' :
                  (sub.workflow?.financeReview?.decision === 'REJECTED') ? 'Rejected' :
                  ['FINANCE_APPROVED', 'APPROVAL_COMMITTEE', 'APPROVED', 'REJECTED', 'EVALUATION_REJECTED'].includes(sub.status) ? 'Pending' : 'Other',
          priority: numAmount > 1500000 ? 'High' : numAmount > 500000 ? 'Medium' : 'Low',
          submittedOn: new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          slaDays: sub.status === 'FINANCE_APPROVED' ? 2 : 0,
          description: parsed.abstract,
          history: (parsed.timeline || []).map(h => ({
            user: h.actor || 'System',
            action: h.event,
            date: new Date(h.timestamp).toLocaleString(),
            note: h.remarks || '',
          })),
          rmApproval: (parsed.timeline || []).some(t => t.event === 'RM Approved') ? 'Approved' : 'Pending',
          committeeApproval: (parsed.timeline || []).some(t => t.event === 'Evaluation Approved') ? 'Approved' : 'Pending',
        };
      });
      
      // Filter only those relevant to finance (Pending, Approved, Rejected)
      const validStatuses = ['Pending', 'Approved', 'Rejected'];
      setRequests(mapped.filter(r => validStatuses.includes(r.status)));
    } catch (err) {
      console.error('Failed to load proposals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const pending  = requests.filter(r => r.status === 'Pending');
  const approved = requests.filter(r => r.status === 'Approved');
  const rejected = requests.filter(r => r.status === 'Rejected');

  const totalValue = requests.reduce((sum, r) => sum + r.numAmount, 0);

  const openDetail = (row) => { 
    setSelected(row); 
    setDrawerOpen(true); 
    setTimeout(() => infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };
  const openDialog = (action) => { 
    setDialog({ open: true, action }); 
    setReviewer(''); 
    setReviewers(action === 'rework' ? ['Suman', 'Ravindranath'] : []); 
    setDialogNote(''); 
    setApprovedBudget(selected?.numAmount || '');
  };
  const closeDialog = () => { setDialog({ open: false, action: null }); setDialogNote(''); setReviewer(''); setReviewers([]); setApprovedBudget(''); };

  const confirmAction = async () => {
    try {
      const decision = dialog.action === 'approve' ? 'APPROVED' : 
                       dialog.action === 'rework' ? 'CLARIFICATION' : 'REJECTED';
      
      await api.patch(`/admin/submissions/${selected.id}/finance-review`, {
        decision,
        remarks: dialogNote,
        reviewerName: dialog.action === 'rework' ? reviewers.join(', ') : reviewer,
        reviewers: dialog.action === 'rework' ? reviewers : [],
        approvedBudget: approvedBudget ? Number(approvedBudget) : null
      });

      closeDialog();
      setDrawerOpen(false);
      fetchProposals(); // refresh from DB
    } catch (err) {
      console.error('Failed to update proposal status', err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const tableRows = tab === 0 ? pending : tab === 1 ? approved : rejected;

  return (
    <Box>
      {/* ── Queue Table ── */}
      <Fade in={true} timeout={300}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <FinanceIcon sx={{ color: '#1565C0' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>Finance Approval Queue</Typography>
            <Chip label="CFO Review" size="small" sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 700 }} />
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #E0E0E0', mb: 1, '& .MuiTabs-indicator': { bgcolor: '#1565C0' }, '& .Mui-selected': { color: '#1565C0 !important' } }}>
            <Tab label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>Pending <Chip label={pending.length} size="small" sx={{ bgcolor: '#FFF3E0', color: '#F57C00', height: 20, fontWeight: 700 }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>Approved <Chip label={approved.length} size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', height: 20, fontWeight: 700 }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>Rejected <Chip label={rejected.length} size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', height: 20, fontWeight: 700 }} /></Box>} />
          </Tabs>

          {/* Table Header */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr 0.9fr 0.7fr 0.6fr 0.8fr', gap: 1, px: 1.5, py: 1, bgcolor: '#F8FAFC', borderRadius: 1.5, mb: 0.5 }}>
            {['Request ID', 'Title', 'Requester', 'Amount', 'Category', 'Priority', 'Action'].map(h => (
              <Typography key={h} variant="caption" sx={{ fontWeight: 800, color: '#546E7A', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.3 }}>{h}</Typography>
            ))}
          </Box>

          {/* Rows */}
          {tableRows.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: '#90A4AE' }}>
              <ReceiptIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>No records in this category</Typography>
            </Box>
          ) : tableRows.map((row, i) => {
            const pm = PRIORITY_META[row.priority];
            return (
              <Box key={row.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr 0.9fr 0.7fr 0.6fr 0.8fr', gap: 1, px: 1.5, py: 1.5, borderBottom: i < tableRows.length - 1 ? '1px solid #F1F5F9' : 'none', alignItems: 'center', '&:hover': { bgcolor: '#F8FAFC', borderRadius: 1.5 }, transition: 'all 0.15s' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#1565C0' }}>{row.trackingId || row.businessId}</Typography>
                  {row.wbsCode && <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#546E7A', fontSize: '0.65rem' }}>{row.wbsCode}</Typography>}
                  <TypeBadge type={row.submissionType} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A2332', lineHeight: 1.3 }} noWrap>{row.title}</Typography>
                  <Typography variant="caption" sx={{ color: '#90A4AE' }}>{row.department}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#1A2332' }}>{row.requester.split(' ').map(n => n[0]).join('')}</Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{row.requester}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1A2332' }}>{row.amount}</Typography>
                <Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 500 }} noWrap>{row.category}</Typography>
                <Chip label={row.priority} size="small" sx={{ bgcolor: pm.bg, color: pm.color, fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                <Button size="small" variant="outlined" startIcon={<ViewIcon sx={{ fontSize: '13px !important' }} />} onClick={() => openDetail(row)} sx={{ fontSize: '0.72rem', borderColor: '#1565C0', color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                  Review
                </Button>
              </Box>
            );
          })}
        </CardContent>
      </Card>
      </Fade>

      {/* ── Detail Drawer ── */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 560 }, bgcolor: '#F8FAFC' } }}>
        {selected && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 3, bgcolor: '#1A2332', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>{selected.parsedTitle}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#90CAF9', fontFamily: 'monospace' }}>{selected.trackingId || selected.businessId}</Typography>
                  {selected.wbsCode && <Typography variant="caption" sx={{ color: '#B0BEC5', fontFamily: 'monospace' }}>• WBS: {selected.wbsCode}</Typography>}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button size="small" onClick={() => infoRef.current?.scrollIntoView({behavior: 'smooth'})} sx={{color: '#90CAF9', textTransform: 'none', mr: 1}}>Info</Button>
                <Button size="small" onClick={() => budgetRef.current?.scrollIntoView({behavior: 'smooth'})} sx={{color: '#90CAF9', textTransform: 'none', mr: 1}}>Budget</Button>
                <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}><CloseIcon /></IconButton>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>

              {/* Status banner */}
              <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: STATUS_META[selected.status].bg, border: `1px solid ${STATUS_META[selected.status].color}30` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STATUS_META[selected.status].color, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: STATUS_META[selected.status].color }}>
                    {selected.status === 'Approved' ? `Marked Approved by Finance` : selected.status === 'Rejected' ? 'Marked Rejected by Finance' : 'Awaiting Finance Review'}
                  </Typography>
                </Box>
              </Paper>

              {/* Title */}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A2332', mb: 0.5 }}>{selected.title}</Typography>
              <Typography variant="body2" sx={{ color: '#546E7A', mb: 2.5, lineHeight: 1.6 }}>{selected.description}</Typography>

              {/* Details */}
              <Box ref={infoRef}>
              <Card sx={{ borderRadius: 2, mb: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1565C0', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>Request Details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <InfoRow label="Tracking ID"   value={selected.trackingId || selected.businessId} bold />
                  {selected.wbsCode && <InfoRow label="WBS Code" value={selected.wbsCode} bold />}
                  <InfoRow label="Type"         value={selected.submissionType} />
                  <InfoRow label="Department"   value={selected.department} />
                  <InfoRow label="Requester"    value={selected.requester} />
                  <InfoRow label="Employee Code" value={selected.employeeCode} />
                  <InfoRow label="Reporting Manager" value={selected.rmValue} />
                  <InfoRow label="Head of Department" value={selected.hodValue} />
                  <InfoRow label="Committee Allotment" value={selected.amount} bold />
                  <InfoRow label="User Estimated" value={selected.userAmount} />
                  <InfoRow label="Budget Head"  value={selected.budget} />
                  <InfoRow label="Category"     value={selected.category} />
                  <InfoRow label="Submitted On" value={selected.submittedOn} />
                  <InfoRow label="Priority"     value={selected.priority} />
                  </Box>
                </CardContent>
              </Card>
              </Box>

              {/* Approval Chain */}
              <Card sx={{ borderRadius: 2, mb: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#6A1B9A', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>Approval Chain</Typography>
                  {[
                    { stage: 'Reporting Manager', status: selected.rmApproval },
                    { stage: 'Evaluation Committee', status: selected.committeeApproval },
                    { stage: 'Finance Review',    status: selected.status === 'Approved' ? 'Approved' : selected.status === 'Rejected' ? 'Rejected' : 'Pending' },
                  ].map((stage, i) => {
                    const isOk = stage.status === 'Approved';
                    const isBad = stage.status === 'Rejected';
                    const col = isOk ? '#2E7D32' : isBad ? '#C62828' : '#F57C00';
                    const bg  = isOk ? '#E8F5E9' : isBad ? '#FFEBEE' : '#FFF3E0';
                    return (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.9, borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: col + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: col, fontSize: '0.65rem' }}>{i + 1}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{stage.stage}</Typography>
                        </Box>
                        <Chip label={stage.status} size="small" sx={{ bgcolor: bg, color: col, fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Audit History */}
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#00838F', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>Audit Trail (Timeline)</Typography>
                  {selected.history.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#90A4AE' }}>No timeline events found.</Typography>
                  ) : selected.history.map((h, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: i < selected.history.length - 1 ? 1.5 : 0 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#1A2332' }}>{h.user.split(' ').map(n => n[0]).join('')}</Avatar>
                        {i < selected.history.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: '#E0E0E0', my: 0.5, minHeight: 16 }} />}
                      </Box>
                      <Box sx={{ flex: 1, pb: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{h.user}</Typography>
                          <Chip label={h.action} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569' }} />
                          <Typography variant="caption" sx={{ color: '#90A4AE', ml: 'auto' }}>{h.date}</Typography>
                        </Box>
                        {h.note && <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25 }}>{h.note}</Typography>}
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>

            {/* Action Footer */}
            {selected.status === 'Pending' && (
              <Box ref={budgetRef} sx={{ p: 3, borderTop: '1px solid #E0E0E0', bgcolor: '#fff', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button fullWidth variant="contained" color="success" startIcon={<ApproveIcon />} onClick={() => openDialog('approve')} sx={{ fontWeight: 700 }}>Mark Budget Approved</Button>
                <Button fullWidth variant="contained" color="error" startIcon={<RejectIcon />} onClick={() => openDialog('reject')} sx={{ fontWeight: 700 }}>Mark Budget Rejected</Button>
                <Button fullWidth variant="outlined" color="warning" startIcon={<ReworkIcon />} onClick={() => openDialog('rework')} sx={{ fontWeight: 700, borderWidth: 2 }}>Request Clarification</Button>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* ── Confirm Dialog ── */}
      <Dialog open={dialog.open} onClose={closeDialog} PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: dialog.action === 'approve' ? '#2E7D32' : dialog.action === 'reject' ? '#C62828' : '#E65100' }}>
          {dialog.action === 'approve' ? '✅ Mark Approved' : dialog.action === 'reject' ? '❌ Mark Rejected' : '🔄 Request Clarification'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {dialog.action === 'approve' ? 'You are marking this budget as approved. It will be sent to the Final Approval Committee.' : 
             dialog.action === 'reject' ? 'You are marking this budget as rejected.' : 
             'Request clarification before proceeding.'}
          </Typography>

          {dialog.action === 'rework' ? (
            <Autocomplete
              multiple
              freeSolo
              options={['Suman', 'Ravindranath']}
              value={reviewers}
              onChange={(e, val) => setReviewers(val)}
              renderInput={(params) => (
                <TextField {...params} label="Finance Committee Names/Emails *" placeholder="Select or type" />
              )}
              sx={{ mb: 2 }}
            />
          ) : (
            <Autocomplete
              freeSolo
              options={['Suman', 'Ravindranath']}
              value={reviewer}
              onChange={(e, val) => setReviewer(val)}
              onInputChange={(e, val) => setReviewer(val)}
              renderInput={(params) => (
                <TextField {...params} label="Reviewer Name *" placeholder="Select or type" />
              )}
              sx={{ mb: 2 }}
            />
          )}

          {dialog.action !== 'rework' && (
            <TextField
              fullWidth
              label="Approved Budget"
              type="number"
              value={approvedBudget}
              onChange={e => setApprovedBudget(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth multiline rows={3}
            label={dialog.action === 'reject' ? 'Rejection Reason *' : dialog.action === 'rework' ? 'Clarification Comments *' : 'Remarks'}
            value={dialogNote}
            onChange={e => setDialogNote(e.target.value)}
            placeholder={dialog.action === 'reject' ? 'e.g. ROI does not justify cost.' : dialog.action === 'rework' ? 'e.g. Please clarify software licensing tier.' : 'Any additional comments...'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeDialog} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            disabled={(dialog.action === 'rework' ? reviewers.length === 0 : !reviewer) || ((dialog.action === 'reject' || dialog.action === 'rework') && !dialogNote.trim())}
            onClick={confirmAction}
            color={dialog.action === 'approve' ? 'success' : dialog.action === 'reject' ? 'error' : 'warning'}
            sx={{ fontWeight: 700 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinanceApproval;
