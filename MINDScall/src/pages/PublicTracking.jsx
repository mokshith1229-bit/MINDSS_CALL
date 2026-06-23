import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Card, TextField, Button, CircularProgress,
  Chip, Grid, Paper, Container, IconButton, Fade, Divider, Avatar
} from '@mui/material';
import {
  Search as SearchIcon, 
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Lightbulb as LightbulbIcon,
  CalendarToday as CalendarIcon,
  FactCheck as FactCheckIcon,
  VerifiedUser as VerifiedUserIcon,
  AccountBalance as AccountBalanceIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import Timeline from '../components/Timeline';

const PublicTracking = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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

    try {
      const res = await axios.get(`http://localhost:5000/api/v1/public/forms/track/${queryId.trim().toUpperCase()}`);
      if (res.data && res.data.success) {
        setResult(res.data.data.tracking);
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
      {/* Header with Premium Gradient */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)', 
        color: '#fff', 
        pt: 8, 
        pb: 12, 
        px: 3, 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract Background Shapes */}
        <Box sx={{ position: 'absolute', top: '-20%', left: '-10%', width: '40%', height: '150%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', transform: 'rotate(15deg)' }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '30%', height: '100%', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)', transform: 'rotate(-15deg)' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em' }}>Track Your Submission</Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.8, maxWidth: '600px', mx: 'auto' }}>Enter your Tracking ID below to view the real-time status and workflow timeline of your Idea or Proposal.</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        {/* Search Box - Elevated */}
        <Card sx={{ 
          p: 1.5, 
          borderRadius: 4, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
          mb: 6,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.5)',
          maxWidth: '800px',
          mx: 'auto'
        }}>
          <form onSubmit={handleSearch}>
            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="e.g. MCI-A8F4K92 or MCP-P4H8Q92"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#F1F5F9',
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: '1px solid #38BDF8' },
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1.5 }} />
                  }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !trackingId.trim()}
                sx={{ 
                  bgcolor: '#2563EB', 
                  '&:hover': { bgcolor: '#1D4ED8', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }, 
                  minWidth: '160px', 
                  height: '56px',
                  borderRadius: 3,
                  fontWeight: 600, 
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Check Status'}
              </Button>
            </Box>
          </form>
        </Card>

        {/* Error Message */}
        {error && (
          <Fade in={Boolean(error)}>
            <Card sx={{ 
              p: 6, 
              borderRadius: 4, 
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', 
              textAlign: 'center',
              maxWidth: '600px', 
              mx: 'auto',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              mb: 4
            }}>
              <Box sx={{ 
                width: 72, height: 72, 
                bgcolor: '#FEF2F2', 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                mx: 'auto', mb: 3 
              }}>
                <CancelIcon sx={{ fontSize: 36, color: '#EF4444' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, letterSpacing: '-0.02em' }}>Not Found</Typography>
              <Typography variant="body1" sx={{ color: '#475569', mb: 4, fontWeight: 500, fontSize: '1.05rem', lineHeight: 1.6 }}>
                We couldn't find any submission matching the tracking ID <strong style={{ color: '#0F172A', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', marginLeft: '4px' }}>{trackingId}</strong>.
              </Typography>
              <Divider sx={{ mb: 3, borderColor: '#F1F5F9' }} />
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                Please double-check your email to ensure the ID is typed correctly. It typically follows a format like <strong>MCI-A8F4K92</strong>.
              </Typography>
            </Card>
          </Fade>
        )}

        {/* Result Tracking Details */}
        {result && (
          <Fade in={Boolean(result)} timeout={600}>
            <Grid container spacing={4}>
              {/* Left Column: Details & R&D */}
              <Grid item xs={12} md={5}>
                
                {/* Main Identity Card */}
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.04)', 
                  mb: 3, 
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0'
                }}>
                  {/* Top color bar depending on status */}
                  <Box sx={{ height: 6, bgcolor: getStatusColor(result.status) }} />
                  
                  <Box sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Chip 
                        label={result.submissionType.toUpperCase()} 
                        size="small"
                        sx={{ 
                          bgcolor: '#F1F5F9', 
                          color: '#475569', 
                          fontWeight: 700, 
                          letterSpacing: 1,
                          borderRadius: 1.5,
                          height: 24,
                          fontSize: '0.7rem'
                        }} 
                      />
                      <Chip 
                        label={getStatusText(result.status)} 
                        size="small"
                        sx={{ 
                          bgcolor: `${getStatusColor(result.status)}15`, 
                          color: getStatusColor(result.status), 
                          fontWeight: 700,
                          borderRadius: 1.5,
                          border: `1px solid ${getStatusColor(result.status)}30`
                        }} 
                      />
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
                    {result.workflow.financeReview.remarks && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, borderLeft: '3px solid #E2E8F0' }}>
                        <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>"{result.workflow.financeReview.remarks}"</Typography>
                      </Box>
                    )}
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
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 600, textTransform: 'uppercase' }}>Progress</Typography>
                          <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 800 }}>{result.projectDetails.progressPercentage || 0}%</Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 8, bgcolor: '#FDE68A', borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ width: `${result.projectDetails.progressPercentage || 0}%`, height: '100%', bgcolor: '#D97706', transition: 'width 1s ease-in-out' }} />
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {result.projectDetails.latestUpdate && (
                      <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2, borderLeft: '4px solid #D97706', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#D97706', mb: 0.5 }}>Latest Update</Typography>
                        <Typography variant="body2" sx={{ color: '#78350F', mb: 1 }}>{result.projectDetails.latestUpdate.text}</Typography>
                        <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 500 }}>By {result.projectDetails.latestUpdate.user} on {formatDate(result.projectDetails.latestUpdate.timestamp)}</Typography>
                      </Box>
                    )}
                  </Card>
                )}
              </Grid>

              {/* Right Column: Timeline */}
              <Grid item xs={12} md={7}>
                <Timeline timeline={result.timeline} />
              </Grid>
            </Grid>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default PublicTracking;
