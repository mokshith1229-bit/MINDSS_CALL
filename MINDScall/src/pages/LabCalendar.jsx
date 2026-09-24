import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { formStore } from '../store/formStore';
import { Science, DateRange, CheckCircle, Warning } from '@mui/icons-material';

const LabCalendar = () => {
  const [submissions, setSubmissions] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [openReview, setOpenReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewRemarks, setReviewRemarks] = useState('');

  useEffect(() => {
    formStore.init();
    const unsub = formStore.subscribe(() => {
      const all = formStore.getAllSubmissions();
      setSubmissions(all);
      
      const allTests = [];
      all.forEach(sub => {
        if (sub.projectDetails && sub.projectDetails.testMatrix) {
          sub.projectDetails.testMatrix.forEach(t => {
            if (t.status !== 'DRAFT') {
              allTests.push({ ...t, projectId: sub.id, projectTitle: sub.title || sub.parsedTitle || 'Untitled Project' });
            }
          });
        }
      });
      // Sort by required date ascending
      allTests.sort((a, b) => new Date(a.requiredDate || 0) - new Date(b.requiredDate || 0));
      setTests(allTests);
    });
    
    return unsub;
  }, []);

  const handleOpenReview = (test) => {
    setSelectedTest(test);
    setReviewStatus(test.status === 'SUBMITTED' ? 'UNDER REVIEW' : test.status);
    setReviewRemarks(test.remarks || '');
    setOpenReview(true);
  };

  const handleSaveReview = async () => {
    if (!selectedTest) return;
    try {
      // we need to call updateTestMatrixStatus
      const formData = { status: reviewStatus, remarks: reviewRemarks };
      // we can do a quick fetch since formStore might not have this method yet
      // Actually, we should add updateTestMatrixStatus to formStore. Let's just mock it here or use fetch directly
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/api/v1/admin/submissions/${selectedTest.projectId}/test-matrix/${selectedTest._id || selectedTest.testId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        formStore.fetchSubmissions(); // refresh
      }
    } catch (err) {
      console.error(err);
    }
    setOpenReview(false);
  };

  const pendingTests = tests.filter(t => ['SUBMITTED', 'UNDER REVIEW', 'CHANGES REQUIRED'].includes(t.status));
  const scheduledTests = tests.filter(t => ['APPROVED', 'SCHEDULED', 'IN PROGRESS', 'COMPLETED'].includes(t.status));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Science sx={{ fontSize: 32, color: '#0078D4', mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#323130' }}>Laboratory Calendar & Reviews</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, bgcolor: '#FFF3E0', border: '1px solid #FFCC80', mb: 3, boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#E65100', mb: 2, display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1 }} /> Pending Lab Manager Reviews
            </Typography>
            {pendingTests.length === 0 ? <Typography variant="body2" color="textSecondary">No tests pending review.</Typography> : null}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pendingTests.map(t => (
                <Card key={t.testId || t._id} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' } }} onClick={() => handleOpenReview(t)}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t.testName}</Typography>
                      <Chip label={t.status} size="small" color={t.status === 'SUBMITTED' ? 'warning' : 'info'} />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Project: {t.projectTitle}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Req. Date: {t.requiredDate ? new Date(t.requiredDate).toLocaleDateString() : 'N/A'}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #EDEBE9' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130', mb: 2, display: 'flex', alignItems: 'center' }}>
              <DateRange sx={{ mr: 1, color: '#0078D4' }} /> Lab Calendar (Scheduled Tests)
            </Typography>
            {scheduledTests.length === 0 ? <Typography variant="body2" color="textSecondary">No scheduled tests.</Typography> : null}
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {scheduledTests.map(t => (
                <Box key={t.testId || t._id} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t.testName}</Typography>
                    <Typography variant="body2" color="textSecondary">{t.projectTitle}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#0078D4', fontWeight: 500 }}>{t.estimatedDuration} Hrs</Typography>
                      <Typography variant="caption" sx={{ color: '#107C10', fontWeight: 500 }}>{t.priority} Priority</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip label={t.status} size="small" sx={{ mb: 1, fontWeight: 600, bgcolor: t.status === 'COMPLETED' ? '#D1FAE5' : '#DBEAFE', color: t.status === 'COMPLETED' ? '#065F46' : '#1E40AF' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#323130' }}>
                      {t.requiredDate ? new Date(t.requiredDate).toLocaleDateString() : 'Unscheduled'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openReview} onClose={() => setOpenReview(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Test Matrix</DialogTitle>
        <DialogContent dividers>
          {selectedTest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2">Test: {selectedTest.testName}</Typography>
              <Typography variant="body2">Objective: {selectedTest.testObjective}</Typography>
              <Typography variant="body2">Procedure: {selectedTest.testProcedure}</Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <TextField 
                label="Review Status" 
                select 
                fullWidth 
                size="small" 
                value={reviewStatus} 
                onChange={e => setReviewStatus(e.target.value)}
              >
                {['UNDER REVIEW', 'CHANGES REQUIRED', 'APPROVED', 'SCHEDULED', 'IN PROGRESS', 'COMPLETED'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
              
              <TextField 
                label="Lab Manager Remarks" 
                fullWidth 
                multiline 
                rows={3} 
                value={reviewRemarks} 
                onChange={e => setReviewRemarks(e.target.value)} 
                placeholder="Add notes, requested changes, or schedule confirmation..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReview(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveReview}>Save Review</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabCalendar;
