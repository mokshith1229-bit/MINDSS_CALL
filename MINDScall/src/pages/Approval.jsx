import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Chip, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Drawer, IconButton,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Close as CloseIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon,
  Replay as ReworkIcon, PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import DataTable, { StatusChip, SLACell, UserCell, TypeBadge } from '../components/DataTable';
import AuditTrail from '../components/AuditTrail';
import DiscussionBoard from '../components/DiscussionBoard';
import api from '../utils/api';
import Timeline from '../components/Timeline';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>
);

const Approval = () => {
  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [dialog, setDialog] = useState({ open: false, action: null });
  const [dialogInput, setDialogInput] = useState('');
  const [appData, setAppData] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/submissions');
      // Map API submissions to expected UI structure
      const formatted = res.data.data.submissions.map(sub => ({
        id: sub._id,
        businessId: sub.businessId || `SUB-${sub._id.toString().substring(18).toUpperCase()}`,
        submissionType: sub.submissionType || sub.answers?.SubmissionType || sub.answers?.submissionType || 'Idea',
        title: sub.answers?.title || 'Untitled Submission',
        requester: sub.answers?.name || 'Unknown',
        dept: sub.answers?.department || '',
        amount: sub.answers?.budget || '-', // Assuming budget might be collected
        status: sub.status === 'FINANCE_APPROVED' || sub.status === 'NEW' || sub.status === 'REVIEWING' ? 'Pending Approval' :
                sub.status === 'APPROVED' ? 'Approved' : 'Rejected',
        slaDays: Math.floor((new Date() - new Date(sub.createdAt)) / (1000 * 60 * 60 * 24)),
        slaStatus: 'On Track',
        comments: [], // To be wired later
        history: [], // To be wired later
        timeline: sub.timeline || []
      }));
      setAppData(formatted);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const pending = appData.filter(a => a.status === 'Pending Approval');
  const approved = appData.filter(a => a.status === 'Approved');
  const rejected = appData.filter(a => a.status === 'Rejected');

  const handleOpenDetails = (row) => {
    setSelectedApp(row);
    setDrawerOpen(true);
  };

  const handleAddComment = (text) => {
    const newComment = { user: 'Admin User', time: 'Just now', text };
    setAppData(prev => prev.map(a => a.id === selectedApp.id ? { ...a, comments: [...a.comments, newComment] } : a));
    setSelectedApp(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
  };

  const openDialog = (action) => setDialog({ open: true, action });
  const closeDialog = () => { setDialog({ open: false, action: null }); setDialogInput(''); };
  
  const confirmAction = async () => {
    try {
      let newStatus = 'REVIEWING';
      if (dialog.action === 'approve') newStatus = 'APPROVED';
      if (dialog.action === 'reject') newStatus = 'REJECTED';
      
      await api.patch(`/admin/submissions/${selectedApp.id}/status`, { status: newStatus });
      await fetchSubmissions(); // Refresh the list
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      closeDialog();
      setDrawerOpen(false);
    }
  };

  const columns = [
    { 
      field: 'businessId', 
      headerName: 'ID', 
      renderCell: (row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>{row.businessId}</Typography>
          <TypeBadge type={row.submissionType} />
        </Box>
      ) 
    },
    { field: 'title', headerName: 'Title' },
    { field: 'requester', headerName: 'Requester', renderCell: (row) => <UserCell avatar={row.requester.split(' ').map(n => n[0]).join('')} name={row.requester} subtitle={row.dept} /> },
    { field: 'amount', headerName: 'Amount', renderCell: (row) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.amount}</Typography> },
    { field: 'status', headerName: 'Status', renderCell: (row) => <StatusChip status={row.status} /> },
    { field: 'slaDays', headerName: 'SLA', renderCell: (row) => <SLACell days={row.slaDays} status={row.slaStatus} /> },
    { field: 'actions', headerName: 'Action', renderCell: (row) => (
        <Button size="small" variant="contained" onClick={() => handleOpenDetails(row)} sx={{ fontSize: '0.7rem' }}>Details</Button>
      )
    },
  ];

  return (
    <Box>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Approval', count: pending.length, color: '#F57C00', bg: '#FFF3E0' },
          { label: 'Approved', count: approved.length, color: '#2E7D32', bg: '#E8F5E9' },
          { label: 'Rejected', count: rejected.length, color: '#C62828', bg: '#FFEBEE' },
          { label: 'Total Value', count: '₹ 2.2Cr', color: '#0277BD', bg: '#E1F5FE' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ borderRadius: 3, textAlign: 'center', py: 0.5 }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: s.color }}>{s.count}</Typography>
                <Typography variant="body2" sx={{ color: '#78909C', fontWeight: 600, mt: 0.5 }}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Approval Queue</Typography>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: '1px solid #E0E0E0', '& .MuiTabs-indicator': { backgroundColor: '#2E7D32' } }}>
            <Tab label={<Box sx={{ display: 'flex', gap: 1 }}>Pending <Chip label={pending.length} size="small" sx={{ bgcolor: '#FFF3E0', color: '#F57C00', height: 20 }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', gap: 1 }}>Approved <Chip label={approved.length} size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', height: 20 }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', gap: 1 }}>Rejected <Chip label={rejected.length} size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', height: 20 }} /></Box>} />
          </Tabs>

          <TabPanel value={tab} index={0}><DataTable columns={columns} rows={pending} /></TabPanel>
          <TabPanel value={tab} index={1}><DataTable columns={columns} rows={approved} /></TabPanel>
          <TabPanel value={tab} index={2}><DataTable columns={columns} rows={rejected} /></TabPanel>
        </CardContent>
      </Card>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 600 }, bgcolor: '#F8FAFC' } }}>
        {selectedApp && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Approval Review</Typography>
                <Typography variant="caption" sx={{ color: '#546E7A', fontFamily: 'monospace' }}>{selectedApp.businessId}</Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: 'none' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{selectedApp.title}</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}><Typography variant="caption" sx={{ color: '#9E9E9E' }}>Amount</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedApp.amount}</Typography></Grid>
                      <Grid item xs={6}><Typography variant="caption" sx={{ color: '#9E9E9E' }}>SLA</Typography><Box mt={0.5}><SLACell days={selectedApp.slaDays} status={selectedApp.slaStatus} /></Box></Grid>
                    </Grid>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Timeline timeline={selectedApp.timeline} />
                </Grid>

                <Grid item xs={12}>
                  <DiscussionBoard comments={selectedApp.comments} onAddComment={handleAddComment} />
                </Grid>

                {selectedApp.status === 'Pending Approval' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Final Decision</Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <Button fullWidth variant="contained" color="success" startIcon={<ApproveIcon />} onClick={() => openDialog('approve')}>Approve</Button>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Button fullWidth variant="contained" color="error" startIcon={<RejectIcon />} onClick={() => openDialog('reject')}>Reject</Button>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Button fullWidth variant="outlined" color="warning" startIcon={<ReworkIcon />} onClick={() => openDialog('rework')} sx={{ borderWidth: 2 }}>Rework</Button>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog open={dialog.open} onClose={closeDialog} PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: dialog.action === 'approve' ? '#2E7D32' : dialog.action === 'reject' ? '#C62828' : '#F57C00' }}>
          {dialog.action === 'approve' ? 'Confirm Approval' : dialog.action === 'reject' ? 'Reject Request' : 'Send for Rework'}
        </DialogTitle>
        <DialogContent>
          {dialog.action === 'approve' ? (
            <Typography variant="body2">Are you sure you want to grant final approval for this request?</Typography>
          ) : dialog.action === 'reject' ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>Please provide a reason for rejecting this request.</Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Rejection Reason</InputLabel>
                <Select value={dialogInput} label="Rejection Reason" onChange={(e) => setDialogInput(e.target.value)}>
                  <MenuItem value="Budget Exceeded">Budget Exceeded</MenuItem>
                  <MenuItem value="Not Strategic Priority">Not Strategic Priority</MenuItem>
                  <MenuItem value="Incomplete Information">Incomplete Information</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>Provide comments on what needs to be reworked.</Typography>
              <TextField fullWidth multiline rows={3} label="Rework Comments" value={dialogInput} onChange={(e) => setDialogInput(e.target.value)} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" color={dialog.action === 'approve' ? 'success' : dialog.action === 'reject' ? 'error' : 'warning'} disabled={(dialog.action === 'reject' || dialog.action === 'rework') && !dialogInput} onClick={confirmAction}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Approval;
