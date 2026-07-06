import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent,
  Button, TextField, Grid, CircularProgress, Alert, Chip, Slider, Paper, Divider
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import axios from 'axios';
import { formatKey } from '../utils/submissionParser';

const PublicEvaluatorReview = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sub, setSub] = useState(null);
  
  const [scores, setScores] = useState({
    innovation: 5,
    technicalFeasibility: 5,
    businessImpact: 5,
    scalability: 5,
    riskAssessment: 5
  });
  const [comments, setComments] = useState('');
  
  useEffect(() => {
    fetchEvaluationDetails();
  }, [token]);

  const fetchEvaluationDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/public/evaluations/${token}`);
      const data = res.data.data.submission;
      setSub(data);
      if (data.evaluatorStatus?.submitted) {
        setScores(data.evaluatorStatus.scores || scores);
        setComments(data.evaluatorStatus.comments || '');
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired review token');
      setLoading(false);
    }
  };

  const handleScoreChange = (metric, value) => {
    setScores(prev => ({ ...prev, [metric]: value }));
  };

  const handleSubmit = async (decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this proposal? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await axios.patch(`http://localhost:5000/api/v1/public/evaluations/${token}`, {
        scores,
        comments,
        decision
      });
      alert('Your evaluation has been submitted successfully! Thank you.');
      fetchEvaluationDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit evaluation');
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

  const isSubmitted = sub?.evaluatorStatus?.submitted;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 5 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Proposal Evaluation</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          {sub.committeeName} • Evaluator Portal
        </Typography>

        {isSubmitted && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
            You have already submitted your evaluation for this proposal. ({sub.evaluatorStatus.decision})
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3, p: 1, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1565C0', fontFamily: 'monospace' }}>
                    {sub.businessId}
                  </Typography>
                  <Chip label={sub.submissionType} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{sub.title}</Typography>
                <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                  Submitted by: <b>{sub.employeeName}</b> ({sub.department})
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976D2' }}>Abstract</Typography>
                <Typography variant="body2" sx={{ mb: 3, whiteSpace: 'pre-line' }}>{sub.abstract}</Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976D2' }}>Benefits</Typography>
                <Typography variant="body2" sx={{ mb: 3, whiteSpace: 'pre-line' }}>{sub.benefits}</Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976D2' }}>Estimated Budget</Typography>
                <Typography variant="body2" sx={{ mb: 3, fontWeight: 700 }}>{sub.estimatedBudget}</Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1976D2' }}>Additional Information</Typography>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  {Object.entries(sub.answers || {}).map(([key, value]) => {
                    if (typeof value === 'object' || value === '' || value == null) return null;
                    // hide standard ones we already show
                    if (['title', 'abstract', 'benefit', 'department', 'name', 'employeeName'].some(k => key.toLowerCase().includes(k))) return null;
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
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {sub.attachments.map((att, i) => {
                        const fullUrl = att.url ? (att.url.startsWith('http') ? att.url : `http://localhost:5000${att.url}`) : '#';
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
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: 3, position: 'sticky', top: 16 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Evaluate Proposal</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Please rate the proposal on the following metrics (1-10).
                </Typography>

                {[
                  { key: 'innovation', label: 'Innovation & Creativity' },
                  { key: 'technicalFeasibility', label: 'Technical Feasibility' },
                  { key: 'businessImpact', label: 'Business Impact' },
                  { key: 'scalability', label: 'Scalability' },
                  { key: 'riskAssessment', label: 'Risk Assessment' },
                ].map((metric) => (
                  <Box key={metric.key} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{metric.label}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565C0' }}>{scores[metric.key]} / 10</Typography>
                    </Box>
                    <Slider
                      value={scores[metric.key]}
                      min={1} max={10} step={1}
                      marks
                      disabled={isSubmitted}
                      onChange={(e, val) => handleScoreChange(metric.key, val)}
                      sx={{ color: '#1565C0' }}
                    />
                  </Box>
                ))}

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Review Comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={isSubmitted}
                  sx={{ mb: 4, mt: 2 }}
                />

                {!isSubmitted && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        size="large"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => handleSubmit('APPROVED')}
                        sx={{ fontWeight: 700, py: 1.5 }}
                      >
                        Approve
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => handleSubmit('REJECTED')}
                        sx={{ fontWeight: 700, py: 1.5 }}
                      >
                        Reject
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PublicEvaluatorReview;
