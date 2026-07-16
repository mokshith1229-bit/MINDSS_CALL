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
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import axios from 'axios';
import { formatKey } from '../utils/submissionParser';

const API_BASE = import.meta.env.VITE_API_URL;

const decisionMeta = {
  APPROVED:       { label: 'Approve Budget',        color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircleIcon sx={{ fontSize: 18 }} /> },
  REJECTED:       { label: 'Reject Budget',         color: '#C62828', bg: '#FFEBEE', icon: <CancelIcon sx={{ fontSize: 18 }} /> },
  CLARIFICATION:  { label: 'Request Clarification', color: '#E65100', bg: '#FFF3E0', icon: <HelpOutlineIcon sx={{ fontSize: 18 }} /> },
};

const PublicFinanceReview = () => {
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
      const res = await axios.get(`${API_BASE}/public/finance-reviews/${token}`);
      const bData = res.data.data.batch;
      setBatch(bData);

      const init = {};
      bData.submissions.forEach(sub => {
        init[sub.id] = {
          decision: sub.existingFinanceReview?.decision || 'APPROVED',
          remarks: sub.existingFinanceReview?.remarks || '',
          approvedBudget: sub.existingFinanceReview?.approvedBudget || '',
        };
      });
      setReviews(init);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired finance review token');
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
      approvedBudget: reviews[id].approvedBudget,
    }));

    const pendingCount = formattedReviews.filter(r => !r.decision).length;
    if (pendingCount > 0) {
      if (!window.confirm(`${pendingCount} proposals have no decision. Submit anyway?`)) return;
    }

    setSubmitting(true);
    try {
      await axios.patch(`${API_BASE}/public/finance-reviews/${token}`, {
        reviews: formattedReviews,
        reviewerName: reviewerName.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit finance review.');
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
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Finance Review Submitted!</Typography>
        <Typography variant="body1" sx={{ color: '#546E7A' }}>
          Thank you. Your finance review decisions have been recorded. The proposals will proceed to the Approval Committee queue.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F4F8', py: 5 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Avatar sx={{ bgcolor: '#1565C0', width: 52, height: 52 }}>
            <AccountBalanceIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2332', lineHeight: 1.2 }}>
              Finance Review Portal
            </Typography>
            <Typography variant="body2" sx={{ color: '#546E7A', mt: 0.5 }}>
              Batch: <b>{batch.batchName}</b> &nbsp;•&nbsp; {batch.submissions.length} Proposal(s) for Finance Approval
            </Typography>
          </Box>
        </Box>

        {/* Reviewer identity */}
        <Card sx={{ borderRadius: 3, mb: 3, p: 2.5, border: '1px solid #BBDEFB', bgcolor: '#E3F2FD' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 1.5 }}>
            Your Identity (Required)
          </Typography>
          <TextField
            size="small"
            label="Your Full Name"
            placeholder="Enter your name as Finance Reviewer"
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
                  sx={{ bgcolor: '#1565C0', color: '#fff', fontWeight: 700, minWidth: 36 }}
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
                        ✓ RM Decision
                      </Typography>
                      <Chip
                        label={sub.rmDecision || 'N/A'}
                        size="small"
                        sx={{ bgcolor: sub.rmDecision === 'APPROVED' ? '#E8F5E9' : '#ECEFF1', color: sub.rmDecision === 'APPROVED' ? '#2E7D32' : '#546E7A', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                      {sub.rmRemarks && <Typography variant="caption" sx={{ display: 'block', color: '#546E7A', mt: 0.5, fontStyle: 'italic' }}>"{sub.rmRemarks}"</Typography>}
                    </Box>
                    <Box sx={{ flex: 1, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #E3F2FD' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565C0', display: 'block', mb: 0.5 }}>
                        ✓ Evaluation Committee
                      </Typography>
                      <Chip
                        label={sub.evalDecision || 'N/A'}
                        size="small"
                        sx={{ bgcolor: sub.evalDecision === 'APPROVED' ? '#E3F2FD' : '#ECEFF1', color: sub.evalDecision === 'APPROVED' ? '#1565C0' : '#546E7A', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                      {sub.evalRemarks && <Typography variant="caption" sx={{ display: 'block', color: '#546E7A', mt: 0.5, fontStyle: 'italic' }}>"{sub.evalRemarks}"</Typography>}
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1976D2', mb: 1 }}>Proposal Details</Typography>
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

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1976D2', mb: 1 }}>
                    Estimated Budget (Submitted by Employee)
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#1A2332', mb: 2 }}>
                    {sub.estimatedBudget || 'Not specified'}
                  </Typography>

                  {/* Attachments */}
                  {sub.attachments && sub.attachments.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1976D2', mb: 1 }}>Attachments</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {sub.attachments.map((att, i) => {
                          const backendBase = (import.meta.env.VITE_API_URL || '').replace('/api/v1', '');
                          const url = att.url?.startsWith('http') ? att.url : `${backendBase}${att.url}`;
                          return (
                            <Chip key={i} icon={<PictureAsPdfIcon />} label={att.filename || 'Document'}
                              variant="outlined" component="a" href={url} target="_blank" clickable
                              sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#F5F5F5' } }} />
                          );
                        })}
                      </Box>
                    </>
                  )}
                </Grid>

                {/* Right — Finance Decision Panel */}
                <Grid item xs={12} md={5}>
                  <Card sx={{ p: 2.5, boxShadow: 'none', border: '2px solid #BBDEFB', borderRadius: 3, bgcolor: '#fff', position: 'sticky', top: 16 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#1565C0' }}>
                      Finance Decision
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
                            Budget Approved — Send to Approval Committee
                          </Box>
                        </MenuItem>

                        <MenuItem value="REJECTED">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CancelIcon sx={{ color: '#C62828', fontSize: 18 }} />
                            Budget Rejected — Reject
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* Approved Budget (shown for APPROVED decisions) */}
                    {reviews[sub.id]?.decision === 'APPROVED' && (
                      <TextField
                        fullWidth size="small"
                        label="Approved Budget (₹)"
                        placeholder="Enter approved amount"
                        type="number"
                        value={reviews[sub.id]?.approvedBudget || ''}
                        onChange={e => handleChange(sub.id, 'approvedBudget', e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#546E7A' }}>₹</Typography> }}
                      />
                    )}

                    {/* Remarks */}
                    <TextField
                      fullWidth multiline rows={4} size="small"
                      label="Finance Remarks"
                      placeholder="Enter your remarks, budget justification, or clarification request..."
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
            startIcon={<AccountBalanceIcon />}
            sx={{
              px: 5, py: 1.5, fontWeight: 700, borderRadius: 2,
              bgcolor: '#1565C0', '&:hover': { bgcolor: '#0D47A1' }
            }}
          >
            {submitting ? 'Submitting...' : `Submit Finance Review (${batch.submissions.length} Proposals)`}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicFinanceReview;
