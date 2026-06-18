import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Drawer, IconButton,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, InputLabel, FormControl, Chip, Checkbox, Snackbar, Alert, Fade
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon, Group as GroupIcon, ViewList as ViewListIcon, Add as AddIcon } from '@mui/icons-material';
import DataTable, { StatusChip, TypeBadge } from '../components/DataTable';
import api from '../utils/api';
import { parseSubmissionFields, formatKey } from '../utils/submissionParser';
import Timeline from '../components/Timeline';
import ReviewBadge from '../components/ReviewBadge';

function a11yProps(index) {
  return { id: `eval-tab-${index}`, 'aria-controls': `eval-tabpanel-${index}` };
}

const Evaluation = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const drawerContentRef = React.useRef(null);

  // Data states
  const [proposals, setProposals] = useState([]);
  const [completedProposals, setCompletedProposals] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [batches, setBatches] = useState([]);
  
  // Selection states
  const [selectedProposals, setSelectedProposals] = useState([]);
  
  // Dialog states
  const [createCommitteeDialog, setCreateCommitteeDialog] = useState(false);
  const [createBatchDialog, setCreateBatchDialog] = useState(false);
  
  // Form states
  const [committeeName, setCommitteeName] = useState('');
  const [committeeMembers, setCommitteeMembers] = useState(''); // comma separated
  
  const [batchName, setBatchName] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProposalData, setSelectedProposalData] = useState(null);

  const [snack, setSnack] = useState({ open: false, msg: '', type: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const subRes = await api.get('/admin/submissions');
      const comRes = await api.get('/admin/evaluations/committees');
      const batRes = await api.get('/admin/evaluations/batches');

      const allSubs = subRes.data.data.submissions || [];
      const formattedSubs = allSubs.map(sub => {
          const parsed = parseSubmissionFields(sub);
          return {
            id: sub._id,
            submissionId: parsed.trackingId || parsed.businessId || 'N/A',
            businessId: parsed.businessId,
            submissionType: parsed.submissionType,
            title: parsed.title,
            submitter: parsed.employeeName,
            employeeCode: parsed.employeeCode,
            dept: parsed.dept,
            abstract: parsed.abstract,
            benefits: parsed.benefits,
            rmValue: parsed.rmValue,
            hodValue: parsed.hodValue,
            rmReview: parsed.rmReview,
            status: sub.status,
            timeline: parsed.timeline,
            attachments: parsed.attachments,
            answers: parsed.answers,
            formData: parsed.formData,
            budget: parsed.budget,
            committeeBudget: parsed.committeeBudget,
          };
        });

      // Active = EVALUATION status, History = past evaluation stages
      setProposals(formattedSubs.filter(s => s.status === 'EVALUATION'));
      setCompletedProposals(formattedSubs.filter(s => ['FINANCE_APPROVED', 'APPROVAL_COMMITTEE', 'APPROVED'].includes(s.status)));
      setCommittees(comRes.data.data.committees);
      setBatches(batRes.data.data.batches);
    } catch (err) {
      console.error('Failed to fetch evaluation data', err);
    }
  };

  const handleCreateCommittee = async () => {
    try {
      const membersArray = committeeMembers.split(',').map(e => e.trim()).filter(e => e);
      await api.post('/admin/evaluations/committees', { name: committeeName, members: membersArray });
      setCreateCommitteeDialog(false);
      setCommitteeName('');
      setCommitteeMembers('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBatch = async () => {
    try {
      await api.post('/admin/evaluations/batches', {
        name: batchName,
        committeeId: selectedCommittee,
        submissionIds: selectedProposals
      });
      setCreateBatchDialog(false);
      setBatchName('');
      setSelectedCommittee('');
      setSelectedProposals([]);
      setTabIndex(1); // Go to batches tab
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBatchEmail = async (batchId) => {
    try {
      setSnack({ open: true, msg: 'Sending email...', type: 'info' });
      await api.post(`/admin/evaluations/batches/${batchId}/send-email`);
      setSnack({ open: true, msg: 'Batch email delivered successfully to committee members.', type: 'success' });
      fetchData();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: err.response?.data?.error || 'Failed to send batch email', type: 'error' });
    }
  };

  const handleSelectProposal = (id) => {
    setSelectedProposals(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleOpenDetails = (row) => {
    setSelectedProposalData(row);
    setDrawerOpen(true);
    setTimeout(() => drawerContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };

  const proposalColumns = [
    { 
      field: 'select', 
      headerName: '', 
      renderCell: (row) => (
        <Checkbox 
          checked={selectedProposals.includes(row.id)}
          onChange={() => handleSelectProposal(row.id)}
        />
      ) 
    },
    { 
      field: 'submissionId', 
      headerName: 'ID',
      renderCell: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{row.submissionId}</Typography>
          <TypeBadge type={row.submissionType} />
        </Box>
      )
    },
    { field: 'title', headerName: 'Title' },
    { field: 'rmStatus', headerName: 'RM Status', renderCell: (row) => <ReviewBadge decision={row.workflow?.rmReview?.decision} /> },
    { field: 'hodStatus', headerName: 'HOD Status', renderCell: (row) => <ReviewBadge decision={row.workflow?.hodReview?.decision} /> },
    { field: 'status', headerName: 'Evaluation Status', renderCell: (row) => <StatusChip status={row.status} /> },
    { field: 'actions', headerName: 'Actions', renderCell: (row) => (
      <Button size="small" variant="outlined" onClick={() => handleOpenDetails(row)}>View</Button>
    )}
  ];

  const batchColumns = [
    { field: 'name', headerName: 'Batch Name' },
    { field: 'committee', headerName: 'Committee', renderCell: (row) => row.committeeId?.name || 'N/A' },
    { field: 'proposals', headerName: 'Proposals Count', renderCell: (row) => row.submissions?.length || 0 },
    { field: 'status', headerName: 'Status', renderCell: (row) => <StatusChip status={row.status} /> },
    { field: 'actions', headerName: 'Actions', renderCell: (row) => (
      <Button 
        size="small" 
        variant="contained" 
        onClick={() => handleSendBatchEmail(row._id)}
        disabled={row.status !== 'PENDING'}
        startIcon={<EmailIcon />}
      >
        Send Email
      </Button>
    )}
  ];

  const committeeColumns = [
    { field: 'name', headerName: 'Committee Name' },
    { field: 'members', headerName: 'Members', renderCell: (row) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {row.members.map((m, i) => <Chip key={i} label={m} size="small" />)}
      </Box>
    )}
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Evaluation Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<GroupIcon />} onClick={() => setCreateCommitteeDialog(true)}>
            New Committee
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ViewListIcon />} 
            onClick={() => setCreateBatchDialog(true)}
            disabled={selectedProposals.length === 0}
          >
            Create Batch ({selectedProposals.length})
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)}>
          <Tab label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>Pending <Chip label={proposals.length} size="small" sx={{ bgcolor: '#FFF3E0', color: '#F57C00', height: 20, fontWeight: 700 }} /></Box>} {...a11yProps(0)} />
          <Tab label="Evaluation Batches" {...a11yProps(1)} />
          <Tab label="Committees" {...a11yProps(2)} />
          <Tab label={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>Completed <Chip label={completedProposals.length} size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', height: 20, fontWeight: 700 }} /></Box>} {...a11yProps(3)} />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Fade in={true} timeout={300}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Proposals Awaiting Batch Assignment</Typography>
            <DataTable columns={proposalColumns} rows={proposals} />
          </CardContent>
        </Card>
        </Fade>
      )}

      {tabIndex === 1 && (
        <Fade in={true} timeout={300}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Evaluation Batches</Typography>
            <DataTable columns={batchColumns} rows={batches} getRowId={(r) => r._id} />
          </CardContent>
        </Card>
        </Fade>
      )}

      {tabIndex === 2 && (
        <Fade in={true} timeout={300}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Committees</Typography>
            <DataTable columns={committeeColumns} rows={committees} getRowId={(r) => r._id} />
          </CardContent>
        </Card>
        </Fade>
      )}

      {tabIndex === 3 && (
        <Fade in={true} timeout={300}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Completed Evaluations</Typography>
            <DataTable columns={proposalColumns.filter(c => c.field !== 'select')} rows={completedProposals} />
          </CardContent>
        </Card>
        </Fade>
      )}

      {/* Dialogs */}
      <Dialog open={createCommitteeDialog} onClose={() => setCreateCommitteeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Evaluation Committee</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Committee Name"
            fullWidth
            value={committeeName}
            onChange={(e) => setCommitteeName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Member Emails (comma separated)"
            fullWidth
            multiline
            rows={3}
            value={committeeMembers}
            onChange={(e) => setCommitteeMembers(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCommitteeDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCommittee} variant="contained" disabled={!committeeName || !committeeMembers}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createBatchDialog} onClose={() => setCreateBatchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Evaluation Batch</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            You are creating a batch with <b>{selectedProposals.length}</b> selected proposals.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Batch Name"
            fullWidth
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Assign Committee</InputLabel>
            <Select
              value={selectedCommittee}
              label="Assign Committee"
              onChange={(e) => setSelectedCommittee(e.target.value)}
            >
              {committees.map(c => (
                <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBatchDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBatch} variant="contained" disabled={!batchName || !selectedCommittee}>Create Batch</Button>
        </DialogActions>
      </Dialog>

      {/* Minimalist Premium Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 700 }, bgcolor: '#FAFAFA' } }}>
        {selectedProposalData && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Minimalist Header */}
            <Box sx={{ p: 4, bgcolor: '#ffffff', borderBottom: '1px solid #E5E7EB', position: 'relative' }}>
              <IconButton onClick={() => setDrawerOpen(false)} sx={{ position: 'absolute', top: 16, right: 16, color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' } }}>
                <CloseIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1, color: '#4B5563' }}>Proposal ID: {selectedProposalData.submissionId || 'N/A'}</Typography>
                <StatusChip status={selectedProposalData.status} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#111827', lineHeight: 1.3 }}>{selectedProposalData.title}</Typography>
              <Typography variant="body2" sx={{ color: '#4B5563', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Submitted by: <b style={{color: '#111827'}}>{selectedProposalData.submitter}</b></span> | <span>Dept: <b style={{color: '#111827'}}>{selectedProposalData.dept}</b></span>
              </Typography>
            </Box>

            {/* Scrollable Content */}
            <Box ref={drawerContentRef} sx={{ flex: 1, overflowY: 'auto', p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>

              {/* Employee & Management Info */}
              <Box sx={{ bgcolor: '#ffffff', p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 2, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #111827', display: 'inline-block', pb: 0.5 }}>Employee & Management</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Employee Name</Typography><Typography variant="body2">{selectedProposalData.submitter}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Employee Code</Typography><Typography variant="body2">{selectedProposalData.employeeCode}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Department</Typography><Typography variant="body2">{selectedProposalData.dept}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Reporting Manager</Typography><Typography variant="body2">{selectedProposalData.rmValue}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Head of Department</Typography><Typography variant="body2">{selectedProposalData.hodValue}</Typography></Grid>
                </Grid>
              </Box>

              {/* Management Decisions Info */}
              <Box sx={{ bgcolor: '#ffffff', p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 2, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #111827', display: 'inline-block', pb: 0.5 }}>Management Decisions</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2, border: '1px solid #EEEEEE' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#757575', fontWeight: 700, textTransform: 'uppercase' }}>Reporting Manager</Typography>
                        <ReviewBadge decision={selectedProposalData.workflow?.rmReview?.decision} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121', mb: 0.5 }}>{selectedProposalData.workflow?.rmReview?.reviewerName || selectedProposalData.workflow?.rmReview?.reviewerEmail || selectedProposalData.rmValue || 'Not Assigned'}</Typography>
                      {selectedProposalData.workflow?.rmReview?.timestamp && (
                        <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block', mb: 1 }}>Reviewed on: {new Date(selectedProposalData.workflow.rmReview.timestamp).toLocaleString()}</Typography>
                      )}
                      {selectedProposalData.workflow?.rmReview?.remarks && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fff', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                          <Typography variant="caption" sx={{ color: '#616161', fontStyle: 'italic', display: 'block', mb: 0.5 }}>Remarks:</Typography>
                          <Typography variant="body2" sx={{ color: '#424242' }}>"{selectedProposalData.workflow.rmReview.remarks}"</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2, border: '1px solid #EEEEEE' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#757575', fontWeight: 700, textTransform: 'uppercase' }}>Head of Department</Typography>
                        <ReviewBadge decision={selectedProposalData.workflow?.hodReview?.decision} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121', mb: 0.5 }}>{selectedProposalData.workflow?.hodReview?.reviewerName || selectedProposalData.workflow?.hodReview?.reviewerEmail || selectedProposalData.hodValue || 'Not Assigned'}</Typography>
                      {selectedProposalData.workflow?.hodReview?.timestamp && (
                        <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block', mb: 1 }}>Reviewed on: {new Date(selectedProposalData.workflow.hodReview.timestamp).toLocaleString()}</Typography>
                      )}
                      {selectedProposalData.workflow?.hodReview?.remarks && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: '#fff', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                          <Typography variant="caption" sx={{ color: '#616161', fontStyle: 'italic', display: 'block', mb: 0.5 }}>Remarks:</Typography>
                          <Typography variant="body2" sx={{ color: '#424242' }}>"{selectedProposalData.workflow.hodReview.remarks}"</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #111827', display: 'inline-block', pb: 0.5 }}>Executive Summary</Typography>
                <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{selectedProposalData.abstract}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #111827', display: 'inline-block', pb: 0.5 }}>Expected Benefits</Typography>
                <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{selectedProposalData.benefits}</Typography>
              </Box>

              {/* Attachments */}
              {selectedProposalData.attachments?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #111827', display: 'inline-block', pb: 0.5 }}>Attachments</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedProposalData.attachments.map((att, i) => (
                      <Chip key={i} label={att.filename || 'Document'} variant="outlined" component="a" href={att.url?.startsWith('http') ? att.url : `${api.defaults.baseURL?.replace('/api/v1', '')}${att.url}`} target="_blank" clickable />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Complete Form Answers */}
              {selectedProposalData.answers && Object.keys(selectedProposalData.answers).length > 0 && (
                <Box sx={{ bgcolor: '#ffffff', p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 2, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #111827', display: 'inline-block', pb: 0.5 }}>Complete Form Details</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(selectedProposalData.answers).map(([key, val], idx) => {
                      if (!val || key === 'attachments') return null;
                      return (
                        <Grid item xs={12} sm={6} key={idx}>
                          <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>{formatKey(key)}</Typography>
                          <Box sx={{ bgcolor: '#F5F7FA', p: 1.5, borderRadius: 2, mt: 0.5 }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#37474F', lineHeight: 1.5 }}>
                              {Array.isArray(val) ? val.join(', ') : val.toString()}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 2, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '2px solid #111827', display: 'inline-block', pb: 0.5 }}>Timeline & History</Typography>
                <Box sx={{ bgcolor: '#ffffff', p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <Timeline timeline={selectedProposalData.timeline} />
                </Box>
              </Box>

            </Box>
            
            {/* Footer Actions */}
            <Box sx={{ p: 3, borderTop: '1px solid #E5E7EB', bgcolor: '#ffffff', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 1.5, fontWeight: 700, borderColor: '#D1D5DB', color: '#374151', textTransform: 'none' }}>Close Panel</Button>
            </Box>
          </Box>
        )}
      </Drawer>

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.type} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Evaluation;
