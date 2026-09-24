import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Card, Accordion, AccordionSummary, AccordionDetails,
  Button, Select, MenuItem, InputLabel, FormControl, TextField, Grid, Divider,
  CircularProgress, Alert, Chip, Avatar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GavelIcon from '@mui/icons-material/Gavel';
import axios from 'axios';
import { formatKey } from '../utils/submissionParser';
import { handleFileDownload } from '../utils/fileUtils';

const API_BASE = import.meta.env.VITE_API_URL;

const decisionMeta = {
  APPROVED:       { label: 'Final Approval', color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
  REJECTED:       { label: 'Reject',         color: '#C62828', bg: '#FFEBEE', icon: <CancelIcon sx={{ fontSize: 18 }} /> },
};

const PublicApprovalReview = () => {
  const { token } = useParams();

  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [batch, setBatch]           = useState(null);
  const [reviewerName, setReviewerName] = useState('');
  const [reviews, setReviews]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  useEffect(() => { fetchBatch(); }, [token]);

  const fetchBatch = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/approval-reviews/${token}`);
      const bData = res.data.data.batch;
      setBatch(bData);

      const init = {};
      bData.submissions.forEach(sub => {
        init[sub.id] = {
          decision: 'APPROVED', // Default to APPROVED
          remarks: '',
        };
      });
      setReviews(init);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired approval review token');
      setLoading(false);
    }
  };

  const handleChange = (subId, field, value) => {
    setReviews(prev => ({ ...prev, [subId]: { ...prev[subId], [field]: value } }));
  };

  const handleSubmit = async () => {
    if (!reviewerName.trim()) {
      alert('Please enter your name before submitting.');
      return;
    }

    const formattedReviews = Object.keys(reviews).map(id => ({
      submissionId: id,
      decision: reviews[id].decision,
      remarks: reviews[id].remarks,
    }));

    const pendingCount = formattedReviews.filter(r => !r.decision).length;
    if (pendingCount > 0) {
      if (!window.confirm(`${pendingCount} proposals have no decision. Submit anyway?`)) return;
    }

    setSubmitting(true);
    try {
      await axios.patch(`${API_BASE}/public/approval-reviews/${token}`, {
        reviews: formattedReviews,
        reviewerName: reviewerName.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit approval review.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / Error / Completed ──
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F0F4F8' }}>
      <CircularProgress size={48} />
    </Box>
  );

  if (error) return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Alert severity="error" sx={{ borderRadius: 3, fontSize: '1rem' }}>{error}</Alert>
    </Container>
  );

  if (submitted || batch?.status === 'COMPLETED') return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center', maxWidth: 460 }}>
        <CheckCircleIcon sx={{ fontSize: 72, color: '#2E7D32', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Final Approval Submitted!</Typography>
        <Typography variant="body1" sx={{ color: '#546E7A' }}>
          Thank you. Your decisions have been recorded. The approved proposals will now move into implementation.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F4F8', py: 5 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Avatar sx={{ bgcolor: '#4A148C', width: 52, height: 52 }}>
            <GavelIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2332', lineHeight: 1.2 }}>
              Approval Committee Portal
            </Typography>
            <Typography variant="body2" sx={{ color: '#546E7A', mt: 0.5 }}>
              Batch: <b>{batch.batchName}</b> &nbsp;•&nbsp; {batch.submissions.length} Proposal(s) Pending Final Approval
            </Typography>
          </Box>
        </Box>

        {/* Reviewer identity */}
        <Card sx={{ borderRadius: 3, mb: 3, p: 2.5, border: '1px solid #E1BEE7', bgcolor: '#F3E5F5' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6A1B9A', mb: 1.5 }}>
            Your Identity (Required)
          </Typography>
          <TextField
            size="small"
            label="Your Full Name"
            placeholder="Enter your name"
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            sx={{ minWidth: 320, bgcolor: '#fff', borderRadius: 1 }}
          />
        </Card>

        {/* Proposals */}
        {batch.submissions.map((sub, index) => (
          <Accordion
            key={sub.id}
            defaultExpanded={batch.submissions.length === 1}
            sx={{ mb: 2.5, borderRadius: 3, '&:before': { display: 'none' }, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: '#fff', borderRadius: '12px 12px 0 0', px: 3, py: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Chip
                  label={`#${index + 1}`}
                  size="small"
                  sx={{ bgcolor: '#4A148C', color: '#fff', fontWeight: 700, minWidth: 36 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: '#1A2332' }}>{sub.title}</Typography>
                  <Typography variant="caption" sx={{ color: '#78909C' }}>
                    {sub.businessId} &nbsp;•&nbsp; {sub.employeeName} &nbsp;•&nbsp; {sub.department}
                  </Typography>
                </Box>
                <Chip
                  label={reviews[sub.id]?.decision ? decisionMeta[reviews[sub.id].decision]?.label : 'Pending'}
                  size="small"
                  sx={{
                    bgcolor: decisionMeta[reviews[sub.id]?.decision]?.bg || '#ECEFF1',
                    color: decisionMeta[reviews[sub.id]?.decision]?.color || '#546E7A',
                    fontWeight: 700, fontSize: '0.68rem'
                  }}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ bgcolor: '#FAFAFA', p: 3, borderRadius: '0 0 12px 12px' }}>
              <Grid container spacing={3}>
                {/* Left — Proposal Details */}
                <Grid item xs={12} md={7}>
                  {/* Previous Approvals */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #E8F5E9' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#2E7D32', display: 'block', mb: 0.5 }}>
                        ✓ Finance Decision
                      </Typography>
                      <Chip
                        label={sub.existingFinanceReview?.decision || 'APPROVED'}
                        size="small"
                        sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                      {sub.existingFinanceReview?.remarks && <Typography variant="caption" sx={{ display: 'block', color: '#546E7A', mt: 0.5, fontStyle: 'italic' }}>"{sub.existingFinanceReview.remarks}"</Typography>}
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6A1B9A', mb: 1 }}>Proposal Details</Typography>
                  <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #E5E7EB', mb: 2 }}>
                    {Object.entries(sub.answers || {}).map(([key, value]) => {
                      if (typeof value === 'object' || value === '' || value == null) return null;
                      return (
                        <Box key={key} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid #F1F5F9', '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 } }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#4B5563', display: 'block' }}>{formatKey(key)}</Typography>
                          <Typography variant="body2" sx={{ color: '#111827', whiteSpace: 'pre-line', mt: 0.3 }}>{value}</Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32', mb: 1 }}>
                    Approved Budget (Finance Committee)
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#1A2332', mb: 2 }}>
                    {sub.existingFinanceReview?.approvedBudget ? `₹ ${Number(sub.existingFinanceReview.approvedBudget).toLocaleString('en-IN')}` : (sub.estimatedBudget || 'Not specified')}
                  </Typography>

                  {/* Attachments */}
                  {sub.attachments && sub.attachments.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6A1B9A', mb: 1 }}>Attachments</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {sub.attachments.map((att, i) => {
                          const backendBase = (import.meta.env.VITE_API_URL || '').replace('/api/v1', '');
                          const url = att.url?.startsWith('http') ? att.url : `${backendBase}${att.url}`;
                          return (
                            <Chip key={i} icon={<PictureAsPdfIcon />} label={att.filename || 'Document'}
                              variant="outlined" onClick={() => handleFileDownload(att)} clickable
                              sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#F5F5F5' } }} />
                          );
                        })}
                      </Box>
                    </>
                  )}
                </Grid>

                {/* Right — Approval Decision Panel */}
                <Grid item xs={12} md={5}>
                  <Card sx={{ p: 2.5, boxShadow: 'none', border: '2px solid #E1BEE7', borderRadius: 3, bgcolor: '#fff', position: 'sticky', top: 16 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#6A1B9A' }}>
                      Final Decision
                    </Typography>

                    {/* Decision Selector */}
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Your Decision</InputLabel>
                      <Select
                        label="Your Decision"
                        value={reviews[sub.id]?.decision || ''}
                        onChange={(e) => handleChange(sub.id, 'decision', e.target.value)}
                      >
                        <MenuItem value="APPROVED">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 18 }} />
                            Final Approval — Send to Implementation
                          </Box>
                        </MenuItem>

                        <MenuItem value="REJECTED">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CancelIcon sx={{ color: '#C62828', fontSize: 18 }} />
                            Reject Proposal
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* Remarks */}
                    <TextField
                      fullWidth multiline rows={4} size="small"
                      label="Remarks (Optional)"
                      placeholder="Enter your final remarks..."
                      value={reviews[sub.id]?.remarks || ''}
                      onChange={e => handleChange(sub.id, 'remarks', e.target.value)}
                      sx={{ mb: 1 }}
                    />

                    {/* Decision preview */}
                    {reviews[sub.id]?.decision && (
                      <Box sx={{
                        p: 1.5, borderRadius: 2, mt: 1,
                        bgcolor: decisionMeta[reviews[sub.id].decision]?.bg,
                        border: `1px solid ${decisionMeta[reviews[sub.id].decision]?.color}30`,
                        display: 'flex', alignItems: 'center', gap: 1
                      }}>
                        {decisionMeta[reviews[sub.id].decision]?.icon}
                        <Typography variant="caption" sx={{ fontWeight: 700, color: decisionMeta[reviews[sub.id].decision]?.color }}>
                          {decisionMeta[reviews[sub.id].decision]?.label}
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#78909C', alignSelf: 'center' }}>
            Reviewing as: <b>{reviewerName || '(enter your name above)'}</b>
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting || !reviewerName.trim()}
            startIcon={<GavelIcon />}
            sx={{
              px: 5, py: 1.5, fontWeight: 700, borderRadius: 2,
              bgcolor: '#6A1B9A', '&:hover': { bgcolor: '#4A148C' }
            }}
          >
            {submitting ? 'Submitting...' : `Submit Final Decisions (${batch.submissions.length} Proposals)`}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicApprovalReview;
