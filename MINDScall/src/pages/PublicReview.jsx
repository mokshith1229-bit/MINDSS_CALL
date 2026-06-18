import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, Typography, TextField, Button,
  Grid, Divider, CircularProgress, Chip, Alert
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as RejectIcon, Help as ClarificationIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import api from '../utils/api';

const PublicReview = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(`/public/reviews/${token}`);
        setData(res.data.data.review);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired review link');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [token]);

  const handleSubmit = async (decision) => {
    if ((decision === 'REJECTED' || decision === 'CLARIFICATION') && !remarks.trim()) {
      alert('Please provide remarks for this decision.');
      return;
    }

    try {
      setSubmitting(true);
      await api.patch(`/public/reviews/${token}`, { decision, remarks });
      setSuccess(true);
    } catch (err) {
      alert('Failed to submit review: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (success || (data && data.existingReview && data.existingReview.decision !== 'PENDING')) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Card sx={{ borderRadius: 3, textAlign: 'center', p: 4 }}>
          <ApproveIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Review Submitted</Typography>
          <Typography variant="body1" sx={{ color: '#546E7A' }}>
            Thank you! Your decision has been recorded securely. You can now close this window.
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1A237E' }}>Proposal Review ({data.stage})</Typography>
        <Typography variant="subtitle1" sx={{ color: '#546E7A', mb: 4 }}>Please review the details below and submit your decision.</Typography>

        <Card sx={{ borderRadius: 3, mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Employee Details</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Employee Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{data.employeeName}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Employee Code</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{data.employeeCode}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Department</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{data.department}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Proposal Information</Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Title</Typography>
              <Typography variant="h6" sx={{ color: '#212121', mt: 0.5 }}>{data.title}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Abstract</Typography>
              <Box sx={{ bgcolor: '#F5F7FA', p: 2, borderRadius: 2, mt: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#37474F' }}>{data.abstract}</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Benefits</Typography>
              <Box sx={{ bgcolor: '#F5F7FA', p: 2, borderRadius: 2, mt: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#37474F' }}>{data.benefits}</Typography>
              </Box>
            </Box>

            {data.attachments && data.attachments.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Attachments</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {data.attachments.map((att, i) => {
                    const fullUrl = att.url ? (att.url.startsWith('http') ? att.url : `${api.defaults.baseURL.replace('/api/v1', '')}${att.url}`) : '#';
                    return (
                      <Chip key={i} icon={<PdfIcon />} label={att.filename || 'Document'} variant="outlined" component="a" href={fullUrl} target="_blank" clickable />
                    );
                  })}
                </Box>
              </Box>
            )}

          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Your Review</Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Remarks (Required for Rejection/Clarification)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success" 
                  size="large"
                  startIcon={<ApproveIcon />}
                  disabled={submitting}
                  onClick={() => handleSubmit('APPROVED')}
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  Approve
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="warning" 
                  size="large"
                  startIcon={<ClarificationIcon />}
                  disabled={submitting}
                  onClick={() => handleSubmit('CLARIFICATION')}
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  Need Clarification
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="error" 
                  size="large"
                  startIcon={<RejectIcon />}
                  disabled={submitting}
                  onClick={() => handleSubmit('REJECTED')}
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  Reject
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PublicReview;
