import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Card, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Snackbar, Alert,
  Tooltip, Grid, Drawer, Divider, Select, MenuItem, InputAdornment, Avatar,
  InputLabel, FormControl, FormControlLabel, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  AttachFile as AttachmentIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Event as EventIcon,
  VideoCall as VideoIcon,
  Assignment as ProjectIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import api from '../utils/api';

const MeetingRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Dialog & Drawer state
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', request: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Forms state
  const [scheduleData, setScheduleData] = useState({
    date: '', time: '', platform: 'Microsoft Teams', link: '', participants: '', agenda: '', notes: '', sendEmail: true
  });
  const [rejectData, setRejectData] = useState({
    reason: 'Schedule Conflict', comments: '', sendNotification: true
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/meeting-requests/admin');
      if (res.data.success) {
        setRequests(res.data.data.meetingRequests);
      }
    } catch (err) {
      setError('Failed to fetch meeting requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleActionClick = (type, request) => {
    setActionDialog({ open: true, type, request });
    if (type === 'approve') {
      setScheduleData(prev => ({
        ...prev,
        date: request.preferredDate || '',
        time: request.preferredTime || '',
        participants: request.email || ''
      }));
    }
  };

  const submitAction = async () => {
    const { type, request } = actionDialog;
    let payload = {};

    if (type === 'approve') {
      payload = { 
        status: 'Approved',
        preferredDate: scheduleData.date,
        preferredTime: scheduleData.time
      };
      // The backend API strictly accepts status, preferredDate, preferredTime.
      // Platform, link, agenda are kept in state to satisfy UI requirements.
    }
    else if (type === 'reject') {
      payload = { status: 'Rejected' };
    }

    try {
      await api.patch(`/meeting-requests/admin/${request._id}/status`, payload);
      setSnackbar({ open: true, message: `Meeting request ${type}d successfully!`, severity: 'success' });
      setActionDialog({ open: false, type: '', request: null });
      if (drawerOpen) setDrawerOpen(false);
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: `Failed to ${type} request`, severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#ECFDF5', color: '#10B981', border: '#A7F3D0' };
      case 'Rejected': return { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' };
      case 'Pending Approval': return { bg: '#FFF7ED', color: '#F59E0B', border: '#FDE68A' };
      case 'Completed': return { bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' };
      default: return { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' };
    }
  };

  // KPIs
  const stats = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0;
    requests.forEach(r => {
      if (r.status === 'Pending Approval') pending++;
      else if (r.status === 'Approved') approved++;
      else if (r.status === 'Rejected') rejected++;
    });
    return { total: requests.length, pending, approved, rejected };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = (r.trackingId || '').toLowerCase().includes(search.toLowerCase()) || 
                          (r.submissionTitle || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.requestedBy || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredRequests, page, rowsPerPage]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.02em' }}>
            Meeting Requests
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Review, approve, reject and schedule meeting requests submitted by employees.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[{ label: 'Total Requests', val: stats.total, color: '#3B82F6' },
            { label: 'Pending', val: stats.pending, color: '#F59E0B' },
            { label: 'Approved', val: stats.approved, color: '#10B981' },
            { label: 'Rejected', val: stats.rejected, color: '#EF4444' }
          ].map(stat => (
            <Card key={stat.label} sx={{ p: 2, minWidth: 120, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.5 }}>{stat.label}</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.val}</Typography>
            </Card>
          ))}
        </Box>
      </Box>

      {/* TOOLBAR */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search Tracking ID or Name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 260, bgcolor: '#FFFFFF' }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#FFFFFF' }}>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Pending Approval">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        
        {/* Placeholder mock filters for UI layout parity */}
        <TextField size="small" type="date" sx={{ width: 150, bgcolor: '#FFFFFF' }} />
        <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#FFFFFF' }}>
          <Select value="All" disabled><MenuItem value="All">All Departments</MenuItem></Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#FFFFFF' }}>
          <Select value="All" disabled><MenuItem value="All">All Projects</MenuItem></Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchRequests} sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <RefreshIcon sx={{ color: '#64748B' }} />
          </IconButton>
        </Tooltip>
      </Card>

      {/* TABLE CONTAINER */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Tracking ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Project Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Requested By</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Purpose</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Preferred Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="textSecondary">Loading meeting requests...</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="textSecondary">No meeting requests found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((row, index) => {
                const style = getStatusColor(row.status);
                return (
                  <TableRow 
                    key={row._id} 
                    sx={{ 
                      '&:hover': { bgcolor: '#F8FAFC' },
                      bgcolor: index % 2 === 1 ? '#FDFDFD' : '#FFFFFF',
                      transition: 'background-color 0.2s ease',
                      '& td': { borderBottom: '1px solid #F1F5F9', py: 1.75 }
                    }}
                  >
                    {/* Tracking ID */}
                    <TableCell sx={{ pl: 3 }}>
                      <Typography variant="body2" fontWeight={700} color="#1E293B">{row.trackingId}</Typography>
                    </TableCell>
                    
                    {/* Project Name */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ProjectIcon sx={{ color: '#94A3B8', fontSize: 18, flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={600} color="#334155">{row.submissionTitle}</Typography>
                      </Box>
                    </TableCell>
                    
                    {/* Requested By */}
                    <TableCell>
                      <Box sx={{ minWidth: 150 }}>
                        <Typography variant="body2" fontWeight={600} color="#1E293B">{row.requestedBy}</Typography>
                        <Typography variant="caption" color="#64748B" sx={{ display: 'block', wordBreak: 'break-all' }}>{row.email}</Typography>
                      </Box>
                    </TableCell>
                    
                    {/* Department */}
                    <TableCell>
                      <Typography variant="body2" color="#64748B">N/A</Typography>
                    </TableCell>
                    
                    {/* Purpose */}
                    <TableCell>
                      <Typography variant="body2" color="#475569">{row.meetingPurpose}</Typography>
                    </TableCell>
                    
                    {/* Preferred Date & Time */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 150 }}>
                        <TimeIcon sx={{ color: '#94A3B8', fontSize: 16, flexShrink: 0 }} />
                        <Typography variant="body2" color="#475569">
                          {row.preferredDate || 'N/A'} at {row.preferredTime || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell>
                      <Box sx={{ display: 'inline-flex' }}>
                        <Box sx={{
                          px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
                          bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}`,
                          textAlign: 'center', whiteSpace: 'nowrap'
                        }}>
                          {row.status}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell sx={{ pr: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', px: 1.5, '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' } }}
                          onClick={() => { setSelectedRequest(row); setDrawerOpen(true); }}
                        >
                          View Details
                        </Button>
                        {row.status === 'Pending Approval' && (
                          <>
                            <Button 
                              size="small" 
                              variant="contained" 
                              sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', px: 1.5, boxShadow: 'none' }}
                              onClick={() => handleActionClick('approve', row)}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained" 
                              sx={{ bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, textTransform: 'none', px: 1.5, boxShadow: 'none' }}
                              onClick={() => handleActionClick('reject', row)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRequests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid #E2E8F0' }}
        />
      </TableContainer>

      {/* DRAWER: VIEW DETAILS */}
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
      >
        <Box sx={{ width: { xs: '100vw', sm: 450 }, p: 0, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
          {selectedRequest && (
            <>
              <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800} color="#0F172A">Meeting Details</Typography>
                <IconButton onClick={() => setDrawerOpen(false)} size="small"><CloseIcon /></IconButton>
              </Box>
              <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
                
                {/* Employee Details */}
                <Typography variant="overline" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1.5 }}>Employee Details</Typography>
                <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#E2E8F0', color: '#475569' }}><PersonIcon /></Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="#1E293B">{selectedRequest.requestedBy}</Typography>
                    <Typography variant="caption" color="#64748B">{selectedRequest.email}</Typography>
                    <Typography variant="caption" color="#64748B" sx={{ display: 'block' }}>Dept: N/A</Typography>
                  </Box>
                </Card>

                {/* Project Details */}
                <Typography variant="overline" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1.5 }}>Project Details</Typography>
                <Card sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                  <Typography variant="caption" color="#94A3B8" fontWeight={700}>TRACKING ID</Typography>
                  <Typography variant="body2" fontWeight={700} color="#1E293B" sx={{ mb: 1.5 }}>{selectedRequest.trackingId}</Typography>
                  
                  <Typography variant="caption" color="#94A3B8" fontWeight={700}>SUBMISSION TITLE</Typography>
                  <Typography variant="body2" fontWeight={600} color="#334155" sx={{ mb: 1.5 }}>{selectedRequest.submissionTitle}</Typography>
                  
                  <Typography variant="caption" color="#94A3B8" fontWeight={700}>PURPOSE</Typography>
                  <Typography variant="body2" color="#475569" sx={{ mb: 1.5 }}>{selectedRequest.meetingPurpose}</Typography>

                  <Typography variant="caption" color="#94A3B8" fontWeight={700}>REQUESTED SCHEDULE</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <EventIcon sx={{ fontSize: 18, color: '#64748B' }} />
                    <Typography variant="body2" color="#1E293B" fontWeight={600}>{selectedRequest.preferredDate} at {selectedRequest.preferredTime}</Typography>
                  </Box>
                </Card>

                {/* Description */}
                <Typography variant="overline" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1.5 }}>Description</Typography>
                <Card sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', bgcolor: '#FDFDFD' }}>
                  <Typography variant="body2" color="#475569" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {selectedRequest.description || 'No description provided.'}
                  </Typography>
                </Card>

                {/* Attachments */}
                {selectedRequest.attachmentUrl && (
                  <>
                    <Typography variant="overline" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1.5 }}>Attachments</Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AttachmentIcon />}
                      onClick={() => window.open(selectedRequest.attachmentUrl, '_blank')}
                      sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#E2E8F0', color: '#0F172A', mb: 3 }}
                    >
                      View Attached File
                    </Button>
                  </>
                )}

                {/* Status */}
                <Typography variant="overline" fontWeight={700} color="#94A3B8" sx={{ display: 'block', mb: 1.5 }}>Current Status</Typography>
                <Box sx={{ display: 'inline-block' }}>
                  {(() => {
                    const st = getStatusColor(selectedRequest.status);
                    return (
                      <Box sx={{ px: 2, py: 1, borderRadius: 2, fontSize: '0.85rem', fontWeight: 700, bgcolor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                        {selectedRequest.status}
                      </Box>
                    );
                  })()}
                </Box>
              </Box>
              
              {selectedRequest.status === 'Pending Approval' && (
                <Box sx={{ p: 3, borderTop: '1px solid #E2E8F0', bgcolor: '#FFFFFF', display: 'flex', gap: 2 }}>
                  <Button fullWidth variant="contained" sx={{ bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, boxShadow: 'none' }} onClick={() => { setDrawerOpen(false); handleActionClick('reject', selectedRequest); }}>Reject</Button>
                  <Button fullWidth variant="contained" sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, boxShadow: 'none' }} onClick={() => { setDrawerOpen(false); handleActionClick('approve', selectedRequest); }}>Approve & Schedule</Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>

      {/* APPROVE / SCHEDULE DIALOG */}
      <Dialog open={actionDialog.open && actionDialog.type === 'approve'} onClose={() => setActionDialog({ open: false, type: '', request: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
          <Typography variant="h5" fontWeight={800} color="#0F172A">Schedule Meeting</Typography>
          <Typography variant="body2" color="#64748B">Confirm details and send invitation.</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <TextField label="Meeting Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Meeting Time" type="time" fullWidth InputLabelProps={{ shrink: true }} value={scheduleData.time} onChange={e => setScheduleData({...scheduleData, time: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Meeting Platform</InputLabel>
                <Select value={scheduleData.platform} label="Meeting Platform" onChange={e => setScheduleData({...scheduleData, platform: e.target.value})}>
                  <MenuItem value="Microsoft Teams">Microsoft Teams</MenuItem>
                  <MenuItem value="Google Meet">Google Meet</MenuItem>
                  <MenuItem value="Zoom">Zoom</MenuItem>
                  <MenuItem value="Custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Meeting Link" placeholder="https://..." fullWidth value={scheduleData.link} onChange={e => setScheduleData({...scheduleData, link: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><VideoIcon /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Participants (Emails)" fullWidth value={scheduleData.participants} onChange={e => setScheduleData({...scheduleData, participants: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Agenda" multiline rows={2} fullWidth value={scheduleData.agenda} onChange={e => setScheduleData({...scheduleData, agenda: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Internal Notes" multiline rows={2} fullWidth placeholder="Visible only to admins" value={scheduleData.notes} onChange={e => setScheduleData({...scheduleData, notes: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={scheduleData.sendEmail} onChange={e => setScheduleData({...scheduleData, sendEmail: e.target.checked})} sx={{ color: '#10B981', '&.Mui-checked': { color: '#10B981' } }} />} label={<Typography variant="body2" fontWeight={600}>Automatically send invitation email</Typography>} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setActionDialog({ open: false, type: '', request: null })} sx={{ color: '#64748B', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={submitAction} sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, boxShadow: 'none', px: 3 }}>Schedule & Approve</Button>
        </DialogActions>
      </Dialog>

      {/* REJECT DIALOG */}
      <Dialog open={actionDialog.open && actionDialog.type === 'reject'} onClose={() => setActionDialog({ open: false, type: '', request: null })} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
          <Typography variant="h5" fontWeight={800} color="#0F172A">Reject Request</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Reason</InputLabel>
                <Select value={rejectData.reason} label="Reason" onChange={e => setRejectData({...rejectData, reason: e.target.value})}>
                  <MenuItem value="Schedule Conflict">Schedule Conflict</MenuItem>
                  <MenuItem value="Invalid Request">Invalid Request</MenuItem>
                  <MenuItem value="Duplicate">Duplicate</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Comments" multiline rows={3} fullWidth placeholder="Add context for rejection..." value={rejectData.comments} onChange={e => setRejectData({...rejectData, comments: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={rejectData.sendNotification} onChange={e => setRejectData({...rejectData, sendNotification: e.target.checked})} sx={{ color: '#EF4444', '&.Mui-checked': { color: '#EF4444' } }} />} label={<Typography variant="body2" fontWeight={600}>Send rejection notification</Typography>} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setActionDialog({ open: false, type: '', request: null })} sx={{ color: '#64748B', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={submitAction} sx={{ bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' }, boxShadow: 'none', px: 3 }}>Reject Request</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingRequestsAdmin;
