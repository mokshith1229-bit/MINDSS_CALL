import React, { useState } from 'react';
import {
  Box, Typography, Card, TextField, Button, CircularProgress,
  Stepper, Step, StepLabel, StepContent, Divider, Chip, Grid, Paper,
  Container, IconButton
} from '@mui/material';
import {
  Search as SearchIcon, CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon, Cancel as CancelIcon,
  Timeline as TimelineIcon, Assignment as AssignmentIcon,
  Person as PersonIcon, TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import axios from 'axios';

const PublicTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/v1/public/track/${trackingId.trim().toUpperCase()}`);
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
      default: return '#6B7280';
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

  const workflowStages = [
    { key: 'Submitted', label: 'Submitted' },
    { key: 'RM Review', label: 'RM Review' },
    { key: 'Evaluation Committee', label: 'Evaluation Committee' },
    { key: 'Finance Review', label: 'Finance Review' },
    { key: 'Approval Committee', label: 'Final Approval' },
    { key: 'R&D Ongoing Projects', label: 'R&D Ongoing Projects' }
  ];

  // Map backend status/timeline to our UI stages
  const getCurrentStepIndex = () => {
    if (!result) return 0;
    if (['APPROVED'].includes(result.status) && result.projectDetails) return 5;
    if (['APPROVED'].includes(result.status)) return 4;
    if (['FINANCE_APPROVED', 'APPROVAL_COMMITTEE'].includes(result.status)) return 4;
    if (result.workflow?.financeReview?.decision && result.workflow.financeReview.decision !== 'PENDING') return 3;
    if (['EVALUATION'].includes(result.status) || (result.workflow?.evaluationReview?.decision && result.workflow.evaluationReview.decision !== 'PENDING')) return 2;
    if (['AWAITING_HOD_REVIEW', 'HOD_REVIEW', 'AWAITING_RM_REVIEW', 'RM_REVIEW', 'REVIEWING'].includes(result.status) || (result.workflow?.rmReview?.decision && result.workflow.rmReview.decision !== 'PENDING')) return 1;
    return 0;
  };

  const isRejected = result?.status === 'REJECTED';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F2F1' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#0078D4', color: '#fff', py: 6, px: 3, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>Track Your Submission</Typography>
        <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9 }}>Enter your Tracking ID to view the real-time status of your Idea or Proposal.</Typography>
      </Box>

      <Container maxWidth="md" sx={{ mt: -4, mb: 10 }}>
        {/* Search Box */}
        <Card sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mb: 4 }}>
          <form onSubmit={handleSearch}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="e.g. MCI-A8F4K92 or MCP-P4H8Q92"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#8A8886', mr: 1 }} />,
                  sx: { bgcolor: '#FAFAFA' }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !trackingId.trim()}
                sx={{ bgcolor: '#0078D4', '&:hover': { bgcolor: '#106EBE' }, minWidth: '150px', fontWeight: 600, py: { xs: 1.5, sm: 0 } }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Check Status'}
              </Button>
            </Box>
          </form>
        </Card>

        {/* Error Message */}
        {error && (
          <Box sx={{ p: 3, bgcolor: '#FDE7E9', color: '#A1260D', borderRadius: 1, border: '1px solid #F9D9D9', display: 'flex', alignItems: 'center', mb: 4 }}>
            <CancelIcon sx={{ mr: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{error}</Typography>
          </Box>
        )}

        {/* Result Tracking Details */}
        {result && (
          <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <Grid container spacing={4}>
              {/* Left Column: Details & R&D */}
              <Grid item xs={12} md={7}>
                <Card sx={{ p: 0, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', mb: 4, overflow: 'hidden' }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid #EDEBE9', bgcolor: '#ffffff' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="overline" sx={{ color: '#605E5C', fontWeight: 600, letterSpacing: 1 }}>{result.submissionType}</Typography>
                      <Chip 
                        label={getStatusText(result.status)} 
                        sx={{ 
                          bgcolor: `${getStatusColor(result.status)}20`, 
                          color: getStatusColor(result.status), 
                          fontWeight: 700,
                          borderRadius: 1
                        }} 
                      />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#323130', mb: 1 }}>{result.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 16, mr: 1 }} />
                      Tracking ID: <strong style={{ marginLeft: '4px', color: '#0078D4' }}>{result.trackingId}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, bgcolor: '#FAFAFA' }}>
                    <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'uppercase' }}>Submitted On</Typography>
                    <Typography variant="body1" sx={{ color: '#323130', fontWeight: 500, mb: 3 }}>{formatDate(result.createdAt)}</Typography>

                    {/* Review Information Cards */}
                    {result.workflow?.rmReview?.decision && (
                      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #EDEBE9', borderRadius: 2, bgcolor: '#ffffff' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>RM Review</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#605E5C' }}>Reviewer:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#323130' }}>{result.workflow.rmReview.reviewerName || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#605E5C' }}>Decision:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: getStatusColor(result.workflow.rmReview.decision) }}>{result.workflow.rmReview.decision}</Typography>
                        </Box>
                        {result.workflow.rmReview.remarks && (
                          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#F3F2F1', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ color: '#605E5C', fontStyle: 'italic' }}>"{result.workflow.rmReview.remarks}"</Typography>
                          </Box>
                        )}
                      </Paper>
                    )}

                    {result.workflow?.financeReview?.decision && (
                      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #EDEBE9', borderRadius: 2, bgcolor: '#ffffff' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Finance Review</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#605E5C' }}>Reviewer:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#323130' }}>{result.workflow.financeReview.reviewerName || 'Finance Committee'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#605E5C' }}>Decision:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: getStatusColor(result.workflow.financeReview.decision) }}>{result.workflow.financeReview.decision}</Typography>
                        </Box>
                        {result.workflow.financeReview.remarks && (
                          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#F3F2F1', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ color: '#605E5C', fontStyle: 'italic' }}>"{result.workflow.financeReview.remarks}"</Typography>
                          </Box>
                        )}
                      </Paper>
                    )}
                  </Box>
                </Card>

                {/* R&D Ongoing Projects Details */}
                {result.projectDetails && (
                  <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', bgcolor: '#ffffff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LightbulbIcon sx={{ color: '#D97706', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#323130' }}>R&D Implementation Phase</Typography>
                    </Box>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'uppercase' }}>Project Owner</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <PersonIcon sx={{ color: '#0078D4', fontSize: 18, mr: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#323130' }}>{result.projectDetails.owner || 'Unassigned'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'uppercase' }}>Status</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#323130', mt: 0.5 }}>{result.projectDetails.implementationStatus || 'Approved'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'uppercase', mb: 1, display: 'block' }}>Progress ({result.projectDetails.progressPercentage || 0}%)</Typography>
                        <Box sx={{ width: '100%', height: 8, bgcolor: '#EDEBE9', borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ width: `${result.projectDetails.progressPercentage || 0}%`, height: '100%', bgcolor: '#0078D4', transition: 'width 1s ease-in-out' }} />
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {result.projectDetails.latestUpdate && (
                      <Box sx={{ p: 2, bgcolor: '#F3F9FD', borderRadius: 2, borderLeft: '4px solid #0078D4' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0078D4', mb: 0.5 }}>Latest Update</Typography>
                        <Typography variant="body2" sx={{ color: '#323130', mb: 1 }}>{result.projectDetails.latestUpdate.text}</Typography>
                        <Typography variant="caption" sx={{ color: '#605E5C' }}>By {result.projectDetails.latestUpdate.user} on {formatDate(result.projectDetails.latestUpdate.timestamp)}</Typography>
                      </Box>
                    )}
                  </Card>
                )}
              </Grid>

              {/* Right Column: Timeline */}
              <Grid item xs={12} md={5}>
                <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', bgcolor: '#ffffff' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#323130', mb: 3, display: 'flex', alignItems: 'center' }}>
                    <TimelineIcon sx={{ mr: 1, color: '#0078D4' }} /> Workflow Timeline
                  </Typography>
                  
                  <Stepper activeStep={isRejected ? -1 : getCurrentStepIndex()} orientation="vertical" sx={{ '& .MuiStepLabel-label': { fontWeight: 500, color: '#605E5C' }, '& .Mui-active': { color: '#0078D4 !important', fontWeight: 700 }, '& .Mui-completed': { color: '#323130 !important', fontWeight: 600 } }}>
                    {workflowStages.map((stage, index) => {
                      const isActive = index === getCurrentStepIndex();
                      const isCompleted = index < getCurrentStepIndex();
                      const isError = isRejected && index === getCurrentStepIndex() - 1; // Mark the current stage as error if rejected

                      return (
                        <Step key={stage.key} completed={isCompleted}>
                          <StepLabel 
                            error={isError}
                            StepIconComponent={() => (
                              <Box sx={{ 
                                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: isError ? '#EF4444' : (isActive ? '#0078D4' : (isCompleted ? '#10B981' : '#EDEBE9')),
                                color: '#fff'
                              }}>
                                {isError ? <CancelIcon sx={{ fontSize: 16 }} /> : (isCompleted ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ScheduleIcon sx={{ fontSize: 16 }} />)}
                              </Box>
                            )}
                          >
                            {stage.label}
                          </StepLabel>
                          <StepContent>
                            <Box sx={{ mb: 2, mt: 1 }}>
                              {isActive && !isRejected && <Typography variant="caption" sx={{ color: '#0078D4', fontWeight: 600 }}>Currently here</Typography>}
                              {isError && <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600 }}>Rejected at this stage</Typography>}
                            </Box>
                          </StepContent>
                        </Step>
                      );
                    })}
                  </Stepper>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PublicTracking;
