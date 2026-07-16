import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Card, TextField, Button, CircularProgress,
  Chip, Grid, Container, Fade, Divider, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Snackbar, Alert, IconButton
} from '@mui/material';
import {
  Search as SearchIcon, 
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Lightbulb as LightbulbIcon,
  CalendarToday as CalendarIcon,
  FactCheck as FactCheckIcon,
  AccountBalance as AccountBalanceIcon,
  Cancel as CancelIcon,
  EventAvailable as EventAvailableIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import Timeline from '../components/Timeline';
import logo from '../assets/tracking_logo.png';

const API_BASE = import.meta.env.VITE_API_URL;

const PublicTracking = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Meeting Request States
  const [meetingRequestStatus, setMeetingRequestStatus] = useState(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingSubmitting, setMeetingSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [meetingForm, setMeetingForm] = useState({
    requestedBy: '',
    email: '',
    purpose: '',
    date: '',
    time: '',
    description: '',
    attachment: null,
  });

  useEffect(() => {
    if (searchParams.get('id')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const queryId = trackingId || searchParams.get('id');
    if (!queryId?.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setMeetingRequestStatus(null);

    try {
      const res = await axios.get(`${API_BASE}/public/forms/track/${queryId.trim().toUpperCase()}`);
      if (res.data && res.data.success) {
        setResult(res.data.data.tracking);
        // Fetch parallel meeting request info
        try {
          const meetingRes = await axios.get(`${API_BASE}/public/meeting-requests/public/${queryId.trim().toUpperCase()}`);
          if (meetingRes.data && meetingRes.data.success) {
            setMeetingRequestStatus(meetingRes.data.data.meetingRequest);
          }
        } catch (mErr) {
          console.error("Meeting request fetch error", mErr);
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No submission found with this Tracking ID.');
      } else {
        setError('An error occurred while tracking the submission. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    setMeetingSubmitting(true);
    
    const formData = new FormData();
    formData.append('trackingId', result.trackingId);
    formData.append('submissionTitle', result.title);
    formData.append('requestedBy', meetingForm.requestedBy);
    formData.append('email', meetingForm.email);
    formData.append('meetingPurpose', meetingForm.purpose);
    formData.append('preferredDate', meetingForm.date);
    formData.append('preferredTime', meetingForm.time);
    formData.append('description', meetingForm.description);
    if (meetingForm.attachment) {
      formData.append('attachment', meetingForm.attachment);
    }

    try {
      await axios.post(`${API_BASE}/public/meeting-requests/public`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSnackbar({ open: true, message: 'Meeting Request Submitted Successfully', severity: 'success' });
      setMeetingModalOpen(false);
      // Re-fetch tracking to get updated meeting request status
      handleSearch();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to submit meeting request.', severity: 'error' });
    } finally {
      setMeetingSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': case 'FINANCE_APPROVED': case 'APPROVAL_COMMITTEE': return '#10B981';
      case 'REJECTED': return '#EF4444';
      case 'REVIEWING': case 'EVALUATION': case 'HOD_REVIEW': case 'RM_REVIEW': case 'AWAITING_RM_REVIEW': case 'AWAITING_HOD_REVIEW': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'NEW': return 'Submitted';
      case 'AWAITING_RM_REVIEW': case 'RM_REVIEW': return 'Under RM Review';
      case 'AWAITING_HOD_REVIEW': case 'HOD_REVIEW': return 'Under HOD Review';
      case 'REVIEWING': return 'Under Review';
      case 'EVALUATION': return 'Under Committee Evaluation';
      case 'FINANCE_APPROVED': case 'APPROVAL_COMMITTEE': case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', pb: 10 }}>
      {/* Enterprise Header Redesign */}
      <Box sx={{ 
        bgcolor: '#FFFFFF', 
        color: '#0F172A', 
        pt: 8, 
        pb: 12, 
        px: 3, 
        textAlign: 'center',
        borderBottom: '1px solid #E2E8F0',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box component="img" src={logo} alt="MINDS Logo" sx={{ height: 64, mb: 3, objectFit: 'contain' }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em', color: '#1E293B' }}>
            Track Your Submission
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: '#64748B', maxWidth: '650px', mx: 'auto' }}>
            Track your Idea or Proposal using the Tracking ID and monitor its progress throughout the innovation workflow.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Search Box - Elevated */}
        <Card sx={{ 
          p: { xs: 2, md: 3 }, 
          borderRadius: 3, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
          mb: 6,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          width: '100%',
          maxWidth: '800px',
        }}>
          <form onSubmit={handleSearch}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Tracking ID __________________________"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#F8FAFC',
                    height: 56,
                    '&.Mui-focused fieldset': { border: '2px solid #2E7D32' },
                  }
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1.5 }} />
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading || !trackingId.trim()}
                  sx={{ 
                    bgcolor: '#2E7D32', 
                    '&:hover': { bgcolor: '#1B5E20' }, 
                    minWidth: '160px', 
                    height: '48px',
                    borderRadius: 2,
                    fontWeight: 600, 
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Track Status'}
                </Button>
                <Button 
                  variant="outlined" 
                  disabled={!result}
                  onClick={() => setMeetingModalOpen(true)}
                  sx={{ 
                    borderColor: '#2E7D32', 
                    color: '#2E7D32',
                    '&:hover': { borderColor: '#1B5E20', bgcolor: 'rgba(46, 125, 50, 0.04)' }, 
                    minWidth: '160px', 
                    height: '48px',
                    borderRadius: 2,
                    fontWeight: 600, 
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  Request Meeting
                </Button>
              </Box>
            </Box>
          </form>
        </Card>

        {/* Error Message */}
        {error && (
          <Fade in={Boolean(error)}>
            <Card sx={{ 
              p: 6, borderRadius: 3, textAlign: 'center', width: '100%', maxWidth: '600px', border: '1px solid #E2E8F0', mb: 4
            }}>
              <Box sx={{ width: 72, height: 72, bgcolor: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CancelIcon sx={{ fontSize: 36, color: '#EF4444' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>Not Found</Typography>
              <Typography variant="body1" sx={{ color: '#475569', mb: 4 }}>
                We couldn't find any submission matching the tracking ID <strong>{trackingId}</strong>.
              </Typography>
            </Card>
          </Fade>
        )}

        {/* Result Tracking Details */}
        {result && (
          <Fade in={Boolean(result)} timeout={600}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Grid container spacing={4} sx={{ width: '100%', maxWidth: '1000px' }}>
                {/* Left Column: Details & R&D */}
                <Grid item xs={12} md={5}>
                
                {/* Main Identity Card */}
                <Card sx={{ 
                  borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mb: 3, overflow: 'hidden', border: '1px solid #E2E8F0'
                }}>
                  <Box sx={{ height: 6, bgcolor: getStatusColor(result.status) }} />
                  <Box sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Chip label={result.submissionType.toUpperCase()} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700, borderRadius: 1.5 }} />
                      <Chip label={getStatusText(result.status)} size="small" sx={{ bgcolor: `${getStatusColor(result.status)}15`, color: getStatusColor(result.status), fontWeight: 700, border: `1px solid ${getStatusColor(result.status)}30` }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, lineHeight: 1.2 }}>{result.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                      <Avatar sx={{ bgcolor: '#DBEAFE', color: '#2563EB', width: 36, height: 36, mr: 2 }}>
                        <AssignmentIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>TRACKING ID</Typography>
                        <Typography variant="body1" sx={{ color: '#0F172A', fontWeight: 700 }}>{result.trackingId}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, px: 1 }}>
                      <CalendarIcon sx={{ fontSize: 18, color: '#94A3B8', mr: 1.5 }} />
                      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                        Submitted on <strong style={{ color: '#334155' }}>{formatDate(result.createdAt)}</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Meeting Request Card */}
                {meetingRequestStatus && (
                  <Card sx={{ 
                    p: 3, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', 
                    bgcolor: meetingRequestStatus.status === 'Approved' ? '#F0FDF4' : '#F8FAFC',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventAvailableIcon sx={{ color: meetingRequestStatus.status === 'Approved' ? '#16A34A' : '#475569', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {meetingRequestStatus.status === 'Approved' ? 'Meeting Confirmed' : 'Meeting Request'}
                      </Typography>
                      <Chip 
                        label={meetingRequestStatus.status} 
                        size="small" 
                        sx={{ ml: 'auto', fontWeight: 600 }} 
                        color={meetingRequestStatus.status === 'Approved' ? 'success' : 'default'}
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          {meetingRequestStatus.status === 'Approved' ? 'Date' : 'Preferred Date'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{meetingRequestStatus.preferredDate}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          {meetingRequestStatus.status === 'Approved' ? 'Time' : 'Preferred Time'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{meetingRequestStatus.preferredTime}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                )}

                {/* Review Blocks if available */}
                {(result.workflow?.rmReview?.decision || result.workflow?.financeReview?.decision) && (
                  <Typography variant="overline" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1, ml: 1, mb: 1, display: 'block' }}>Review Summary</Typography>
                )}

                {result.workflow?.rmReview?.decision && (
                  <Card sx={{ p: 3, mb: 2, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FactCheckIcon sx={{ color: '#475569', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>RM Review</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Reviewer</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{result.workflow.rmReview.reviewerName || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Decision</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: getStatusColor(result.workflow.rmReview.decision) }}>{result.workflow.rmReview.decision}</Typography>
                      </Grid>
                    </Grid>
                    {result.workflow.rmReview.remarks && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, borderLeft: '3px solid #E2E8F0' }}>
                        <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>"{result.workflow.rmReview.remarks}"</Typography>
                      </Box>
                    )}
                  </Card>
                )}

                {result.workflow?.financeReview?.decision && (
                  <Card sx={{ p: 3, mb: 2, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountBalanceIcon sx={{ color: '#475569', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>Finance Review</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Reviewer</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{result.workflow.financeReview.reviewerName || 'Finance Committee'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Decision</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: getStatusColor(result.workflow.financeReview.decision) }}>{result.workflow.financeReview.decision}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                )}

                {/* R&D Ongoing Projects Details */}
                {result.projectDetails && (
                  <Card sx={{ p: 3, mt: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)', border: '1px solid #FEF3C7', bgcolor: '#FFFBEB' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: '#FEF3C7', color: '#D97706', width: 40, height: 40, mr: 2 }}>
                        <LightbulbIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#92400E' }}>Implementation Phase</Typography>
                    </Box>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 600, textTransform: 'uppercase' }}>Project Owner</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <PersonIcon sx={{ color: '#D97706', fontSize: 18, mr: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400E' }}>{result.projectDetails.owner || 'Unassigned'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 600, textTransform: 'uppercase' }}>Status</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400E', mt: 0.5 }}>{result.projectDetails.implementationStatus || 'Approved'}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                )}
              </Grid>

              {/* Right Column: Timeline */}
              <Grid item xs={12} md={7}>
                <Timeline timeline={result.timeline} />
              </Grid>
            </Grid>
          </Box>
        </Fade>
        )}
      </Container>

      {/* Request Meeting Modal */}
      <Dialog 
        open={meetingModalOpen} 
        onClose={() => setMeetingModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h5" component="span" sx={{ fontWeight: 800, color: '#1E293B' }}>Request Project Meeting</Typography>
          <IconButton onClick={() => setMeetingModalOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <form onSubmit={handleMeetingSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Tracking ID" 
                value={result?.trackingId || ''} 
                fullWidth 
                InputProps={{ readOnly: true, sx: { bgcolor: '#F8FAFC' } }} 
                variant="filled"
              />
              <TextField 
                label="Submission Title" 
                value={result?.title || ''} 
                fullWidth 
                InputProps={{ readOnly: true, sx: { bgcolor: '#F8FAFC' } }} 
                variant="filled"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Requested By" 
                required 
                fullWidth 
                value={meetingForm.requestedBy}
                onChange={(e) => setMeetingForm({ ...meetingForm, requestedBy: e.target.value })}
              />
              <TextField 
                label="Email" 
                type="email" 
                required 
                fullWidth 
                value={meetingForm.email}
                onChange={(e) => setMeetingForm({ ...meetingForm, email: e.target.value })}
              />
            </Box>

            <TextField 
              select 
              label="Meeting Purpose" 
              required 
              fullWidth
              value={meetingForm.purpose}
              onChange={(e) => setMeetingForm({ ...meetingForm, purpose: e.target.value })}
            >
              <MenuItem value="Project Discussion">Project Discussion</MenuItem>
              <MenuItem value="Progress Review">Progress Review</MenuItem>
              <MenuItem value="Clarification">Clarification</MenuItem>
              <MenuItem value="Technical Discussion">Technical Discussion</MenuItem>
              <MenuItem value="Demonstration">Demonstration</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Preferred Date" 
                type="date" 
                required 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                value={meetingForm.date}
                onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
              />
              <TextField 
                label="Preferred Time" 
                type="time" 
                required 
                fullWidth 
                InputLabelProps={{ shrink: true }}
                value={meetingForm.time}
                onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
              />
            </Box>

            <TextField 
              label="Description" 
              multiline 
              rows={4} 
              fullWidth
              value={meetingForm.description}
              onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
            >
              {meetingForm.attachment ? meetingForm.attachment.name : 'Upload Attachment (Optional)'}
              <input
                type="file"
                hidden
                onChange={(e) => setMeetingForm({ ...meetingForm, attachment: e.target.files[0] })}
              />
            </Button>

          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setMeetingModalOpen(false)} sx={{ color: '#64748B', fontWeight: 600 }}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={meetingSubmitting}
              sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, borderRadius: 2, px: 3 }}
            >
              {meetingSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicTracking;
