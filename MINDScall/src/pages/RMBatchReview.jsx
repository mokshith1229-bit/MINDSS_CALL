import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Accordion, AccordionSummary, AccordionDetails,
  Button, Select, MenuItem, InputLabel, FormControl, TextField, Grid, CircularProgress, Alert, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';
import { formatKey } from '../utils/submissionParser';

const API_BASE = import.meta.env.VITE_API_URL;

const RMBatchReview = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  
  // State for decisions/remarks keyed by submission ID
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    fetchBatchDetails();
  }, [token]);

  const fetchBatchDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/reviews/rm-batch/${token}`);
      const subs = res.data.data.submissions;
      setSubmissions(subs);
      
      // Initialize state for each proposal
      const initialReviews = {};
      subs.forEach(sub => {
        initialReviews[sub._id] = { decision: 'PENDING', remarks: '' };
      });
      setReviews(initialReviews);
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired review token');
      setLoading(false);
    }
  };

  const handleReviewChange = (subId, field, value) => {
    setReviews(prev => ({
      ...prev,
      [subId]: { ...prev[subId], [field]: value }
    }));
  };

  const handleSubmitBatch = async () => {
    // Ensure all have decisions (optional, but good practice)
    const pendingCount = Object.values(reviews).filter(r => r.decision === 'PENDING').length;
    if (pendingCount > 0) {
      if (!window.confirm(`${pendingCount} proposals are still PENDING. Submit anyway?`)) {
        return;
      }
    }

    try {
      await axios.post(`${API_BASE}/public/reviews/rm-batch/${token}`, {
        reviews: reviews
      });
      alert('Batch reviews submitted successfully! You may close this window.');
      // Refresh to show completed state (or handle token expiry/removal gracefully)
      fetchBatchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit batch review');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6F8' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (submissions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          You have no pending proposals in this batch. Thank you!
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 5 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Manager Batch Review</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {submissions.length} Assigned Proposals
        </Typography>

        {submissions.map((sub, index) => (
          <Accordion key={sub._id} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <Typography sx={{ fontWeight: 700, width: '30%', flexShrink: 0 }}>Proposal {index + 1}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{sub.answers?.title || sub.answers?.proposaltitle || 'Untitled'}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: '#FAFAFA' }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976D2' }}>Submitter Information</Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}><b>Name:</b> {sub.answers?.name || sub.answers?.employeeName || 'N/A'}</Typography>
                  <Typography variant="body2" sx={{ mb: 3 }}><b>Department:</b> {sub.answers?.department || 'N/A'}</Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976D2' }}>Estimated Budget (User)</Typography>
                  <Typography variant="body2" sx={{ mb: 3, fontWeight: 700 }}>
                    {sub.answers?.budget || sub.answers?.amount || sub.answers?.cost || sub.answers?.capex || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976D2' }}>Detailed Information</Typography>
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                    {Object.entries(sub.answers || {}).map(([key, value]) => {
                      if (typeof value === 'object' || value === '' || value == null) return null;
                      return (
                        <Box key={key} sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4B5563' }}>{formatKey(key)}:</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#111827', mt: 0.5 }}>{value}</Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {sub.attachments && sub.attachments.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976D2' }}>Attachments</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                        {sub.attachments.map((att, i) => {
                          const backendBase = (import.meta.env.VITE_API_URL || '').replace('/api/v1', '');
                          const fullUrl = att.url ? (att.url.startsWith('http') ? att.url : `${backendBase}${att.url}`) : '#';
                          return (
                            <Chip 
                              key={i} 
                              icon={<PictureAsPdfIcon />} 
                              label={att.filename || 'Document'} 
                              variant="outlined" 
                              component="a" 
                              href={fullUrl} 
                              target="_blank" 
                              clickable 
                              sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#F5F5F5' } }}
                            />
                          );
                        })}
                      </Box>
                    </>
                  )}
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, boxShadow: 'none', border: '1px solid #E0E0E0', mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Your Decision</Typography>
                    
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Decision</InputLabel>
                      <Select
                        label="Decision"
                        value={reviews[sub._id]?.decision || 'PENDING'}
                        onChange={(e) => handleReviewChange(sub._id, 'decision', e.target.value)}
                      >
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="APPROVED">Approve</MenuItem>
                        <MenuItem value="REJECTED">Reject</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Remarks (Optional)"
                      size="small"
                      value={reviews[sub._id]?.remarks || ''}
                      onChange={(e) => handleReviewChange(sub._id, 'remarks', e.target.value)}
                    />
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSubmitBatch}
            sx={{ px: 5, py: 1.5, fontWeight: 700, borderRadius: 2 }}
          >
            Submit All Reviews
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default RMBatchReview;
