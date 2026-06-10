import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, InputAdornment,
  Avatar, Chip, Button, Divider, Radio, RadioGroup, FormControlLabel,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as AssignedIcon,
  HourglassEmpty as PendingIcon,
  PersonOff as UnassignedIcon,
  Send as SendIcon,
  Description as DescriptionIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { TypeBadge } from '../components/DataTable';
import api from '../utils/api';
import { parseSubmissionFields } from '../utils/submissionParser';

const statusConfig = {
  Assigned: { color: '#2E7D32', bg: '#E8F5E9', icon: <AssignedIcon sx={{ fontSize: 16 }} /> },
  Pending: { color: '#F57C00', bg: '#FFF3E0', icon: <PendingIcon sx={{ fontSize: 16 }} /> },
  Unassigned: { color: '#546E7A', bg: '#ECEFF1', icon: <UnassignedIcon sx={{ fontSize: 16 }} /> },
};

const proposalStatusConfig = {
  NEW: { color: '#546E7A', bg: '#ECEFF1', label: 'New' },
  REVIEWING: { color: '#F57C00', bg: '#FFF3E0', label: 'Reviewing' },
  AWAITING_RM_REVIEW: { color: '#1976D2', bg: '#E3F2FD', label: 'Awaiting RM Review' },
  RM_REVIEW: { color: '#1976D2', bg: '#E3F2FD', label: 'RM Review' },
  HOD_REVIEW: { color: '#9C27B0', bg: '#F3E5F5', label: 'HOD Review' },
  APPROVED: { color: '#2E7D32', bg: '#E8F5E9', label: 'Approved' },
  REJECTED: { color: '#D32F2F', bg: '#FFEBEE', label: 'Rejected' },
};

const AutoAssignEmail = () => {
  const [submissions, setSubmissions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'success' });

  // Review states
  const [rmRemarks, setRmRemarks] = useState('');
  const [rmDecision, setRmDecision] = useState('PENDING');
  const [managerEmail, setManagerEmail] = useState('');

  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    if (selectedProposal && selectedManager) {
      const p = selectedProposal;
      const recipientName = selectedManager.name || selectedManager.email.split('@')[0];

      const b = `Dear ${recipientName},

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
CubeTech Innovation Team`;
      setEmailBody(b);
    } else {
      setEmailBody('');
    }
  }, [selectedManager, selectedProposal]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/submissions');
      const subs = res.data.data.submissions || [];
      
      const parsedSubs = subs.map(sub => {
        const parsed = parseSubmissionFields(sub);
        const employeeInfo = sub.submitterEmail || parsed.employeeName || 'Unknown Employee';

        return { 
          ...sub, 
          businessId: sub.businessId || `SUB-${sub._id.toString().substring(18).toUpperCase()}`,
          submissionType: sub.submissionType || parsed.submissionType || parsed.SubmissionType || 'Idea',
          rmValue: parsed.rmValue, 
          rmEmail: parsed.rmEmail,
          hodEmail: parsed.hodEmail,
          rmName: parsed.rmName,
          hodName: parsed.hodName,
          title: parsed.title, 
          abstract: parsed.abstract, 
          dept: parsed.dept, 
          employeeName: parsed.employeeName, 
          employeeCode: parsed.employeeCode, 
          benefits: parsed.benefits, 
          employeeInfo 
        };
      });
      
      setSubmissions(parsedSubs);

      // Group by RM
      const rmMap = {};
      parsedSubs.forEach(sub => {
        const key = sub.rmEmail || sub.rmValue || 'unknown';
        if (!rmMap[key]) rmMap[key] = [];
        rmMap[key].push(sub);
      });

      const mngrs = Object.keys(rmMap).map(email => {
        const props = rmMap[email];
        // Compute manager status
        const hasPending = props.some(p => ['NEW', 'REVIEWING', 'AWAITING_RM_REVIEW', 'RM_REVIEW'].includes(p.status));
        const allApproved = props.every(p => ['EVALUATION', 'FINANCE_APPROVED', 'APPROVED'].includes(p.status));
        let status = 'Unassigned';
        if (hasPending) status = 'Pending';
        else if (allApproved && props.length > 0) status = 'Assigned';

        const firstProp = props[0];
        const name = firstProp.rmName || firstProp.rmValue.split(' (')[0] || 'Unknown RM';
        const displayEmail = firstProp.rmEmail || email;

        return {
          name,
          email: displayEmail,
          proposals: props,
          count: props.length,
          status,
          avatarInitials: displayEmail.split('@')[0].substring(0, 2).toUpperCase()
        };
      });
      setManagers(mngrs);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
      setSnack({ open: true, msg: 'Failed to load submissions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredManagers = managers.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch = m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
    const matchesFilter = filter === 'All' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSelectManager = (mgr) => {
    // toggle off if already selected
    if (selectedManager?.email === mgr.email) {
      setSelectedManager(null);
      setSelectedProposal(null);
    } else {
      setSelectedManager(mgr);
      setSelectedProposal(null);
    }
  };

  const handleSelectProposalById = (propId) => {
    const prop = selectedManager.proposals.find(p => p._id === propId);
    if (!prop) return;
    setSelectedProposal(prop);
    setRmRemarks(prop.workflow?.rmReview?.remarks || '');
    setRmDecision(prop.workflow?.rmReview?.decision || 'PENDING');
    setManagerEmail(prop.workflow?.rmReview?.reviewerEmail || prop.rmEmail || selectedManager.email || '');
  };

  const handleReviewSubmit = async (stage) => {
    try {
      const payload = {
        stage: 'RM',
        decision: rmDecision,
        remarks: rmRemarks,
        reviewerEmail: selectedManager.email
      };

      await api.patch(`/admin/submissions/${selectedProposal._id}/review`, payload);
      setSnack({ open: true, msg: `${stage} Review submitted successfully`, type: 'success' });
      
      // Refresh
      await fetchSubmissions();
      setSelectedProposal(null);
      setSelectedManager(null);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: 'Failed to submit review', type: 'error' });
    }
  };

  const handleOpenGmail = async () => {
    try {
      const to = managerEmail;

      if (!to) {
        setSnack({ open: true, msg: 'Please provide a Manager Email', type: 'error' });
        return;
      }

      // API call to log assignment and update status
      const res = await api.patch(`/admin/submissions/${selectedProposal._id}/assign-email`, { stage: 'RM', email: to });
      const { token } = res.data.data;
      
      const reviewLink = `http://localhost:5173/review/${token}`;
      const finalBody = `${emailBody}\n\nSecure Review Link:\n${reviewLink}`;

      setSnack({ open: true, msg: 'Email assignment logged successfully', type: 'success' });
      
      // Open Gmail
      const subject = encodeURIComponent('Proposal Review Request (RM)');
      const body = encodeURIComponent(finalBody);
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`, '_blank');
      
      // Refresh
      await fetchSubmissions();
      setSelectedProposal(null);
      setSelectedManager(null);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: 'Failed to assign email', type: 'error' });
    }
  };

  const counts = {
    Assigned: managers.filter((e) => e.status === 'Assigned').length,
    Pending: managers.filter((e) => e.status === 'Pending').length,
    Unassigned: managers.filter((e) => e.status === 'Unassigned').length,
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {/* Status Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {Object.entries(counts).map(([status, count]) => {
          const cfg = statusConfig[status];
          return (
            <Grid item xs={12} sm={4} key={status}>
              <Card
                onClick={() => setFilter(filter === status ? 'All' : status)}
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  border: filter === status ? `2px solid ${cfg.color}` : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                }}
              >
                <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: cfg.bg, color: cfg.color, width: 48, height: 48, borderRadius: 2 }}>
                    {React.cloneElement(cfg.icon, { sx: { fontSize: 22 } })}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: cfg.color }}>{count}</Typography>
                    <Typography variant="body2" sx={{ color: '#78909C', fontWeight: 600 }}>{status}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Manager List */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Reporting Managers</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by RM email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#9E9E9E', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {['All', 'Assigned', 'Pending', 'Unassigned'].map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    size="small"
                    onClick={() => setFilter(f)}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      bgcolor: filter === f ? '#2E7D32' : '#F5F5F5',
                      color: filter === f ? '#fff' : '#546E7A',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ maxHeight: 440, overflowY: 'auto', pr: 0.5 }}>
                {filteredManagers.map((mgr) => {
                  const cfg = statusConfig[mgr.status];
                  const isSelected = selectedManager?.email === mgr.email;
                  return (
                    <Box
                      key={mgr.email}
                      onClick={() => handleSelectManager(mgr)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        mb: 1,
                        cursor: 'pointer',
                        border: `1px solid ${isSelected ? '#2E7D32' : '#F0F0F0'}`,
                        bgcolor: isSelected ? '#F1F8E9' : '#FAFAFA',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: isSelected ? '#E8F5E9' : '#F5F5F5', borderColor: '#B0BEC5' },
                      }}
                    >
                      <Avatar sx={{ background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', width: 38, height: 38, fontSize: '0.75rem', fontWeight: 700 }}>
                        {mgr.avatarInitials}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }} noWrap>{mgr.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#78909C' }} noWrap>{mgr.email} • {mgr.count} Proposals</Typography>
                      </Box>
                      <Chip
                        label={mgr.status}
                        size="small"
                        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.68rem', height: 22 }}
                      />
                    </Box>
                  );
                })}
                {filteredManagers.length === 0 && (
                  <Typography variant="body2" sx={{ color: '#9E9E9E', textAlign: 'center', py: 4 }}>
                    No managers found
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Review Action */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Review Assignment</Typography>
              <Typography variant="body2" sx={{ color: '#78909C', mb: 2.5 }}>
                Select a manager from the list, choose a proposal, and submit a review.
              </Typography>

              {/* Selected Manager Box */}
              {selectedManager ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F1F8E9', borderRadius: 2, mb: 2.5, border: '1px solid #C8E6C9' }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #2E7D32, #66BB6A)', width: 44, height: 44, fontSize: '0.8rem', fontWeight: 700 }}>
                    {selectedManager.avatarInitials}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedManager.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#546E7A' }}>{selectedManager.email} • {selectedManager.count} Assigned Proposals</Typography>
                  </Box>
                  <Chip label="Selected" size="small" sx={{ bgcolor: '#2E7D32', color: '#fff', fontWeight: 700 }} />
                </Box>
              ) : (
                <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2, mb: 2.5, border: '1px dashed #CFD8DC', textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#9E9E9E' }}>← Select a manager to begin review</Typography>
                </Box>
              )}

              {/* Proposal Select */}
              {selectedManager && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Select Proposal</Typography>
                  <RadioGroup value={selectedProposal?._id || ''} onChange={(e) => handleSelectProposalById(e.target.value)}>
                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                      {selectedManager.proposals.map((t) => (
                        <Grid item xs={12} sm={6} md={4} key={t._id}>
                          <Box
                            onClick={() => handleSelectProposalById(t._id)}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              border: `1.5px solid ${selectedProposal?._id === t._id ? '#2E7D32' : '#E0E0E0'}`,
                              bgcolor: selectedProposal?._id === t._id ? '#F1F8E9' : '#FAFAFA',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: '#4CAF50' },
                            }}
                          >
                            <FormControlLabel
                              value={t._id}
                              control={<Radio size="small" sx={{ color: '#2E7D32', '&.Mui-checked': { color: '#2E7D32' } }} />}
                              label={
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565C0', fontFamily: 'monospace' }}>{t.businessId}</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{t.title}</Typography>
                                </Box>
                              }
                              sx={{ m: 0, width: '100%' }}
                            />
                            <Typography variant="caption" sx={{ display: 'block', ml: 3.5, color: '#78909C' }} noWrap>
                               {proposalStatusConfig[t.status]?.label || 'Unknown'}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </>
              )}

              {/* Review Details Box */}
              {selectedProposal && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Proposal Details & Review</Typography>
                  <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 2, border: '1px solid #E8EAED', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#9E9E9E', width: 60 }}>ID:</Typography>
                      <Typography variant="caption" sx={{ color: '#1565C0', fontWeight: 800, fontFamily: 'monospace' }}>
                        {selectedProposal.businessId}
                      </Typography>
                      <TypeBadge type={selectedProposal.submissionType} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#9E9E9E', width: 60 }}>Title:</Typography>
                      <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>
                        {selectedProposal.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#9E9E9E', width: 60 }}>Abstract:</Typography>
                      <Typography variant="caption" sx={{ color: '#546E7A', whiteSpace: 'pre-line' }}>
                        {selectedProposal.abstract}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 1.5 }} />

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Manager Email</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter Manager Email..."
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                      />
                    </Box>

                    {/* Email Preview editable */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Generated Email Content</Typography>
                    <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 2, border: '1px solid #E8EAED', mb: 3 }}>
                      <TextField 
                        fullWidth 
                        multiline 
                        minRows={8} 
                        variant="outlined" 
                        size="small" 
                        value={emailBody} 
                        onChange={(e) => setEmailBody(e.target.value)} 
                        sx={{ bgcolor: '#fff' }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      size="large"
                      onClick={handleOpenGmail}
                      startIcon={<EmailIcon />}
                      sx={{ py: 1.5, fontWeight: 700 }}
                    >
                      Open Gmail & Assign RM
                    </Button>

                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.type} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AutoAssignEmail;
