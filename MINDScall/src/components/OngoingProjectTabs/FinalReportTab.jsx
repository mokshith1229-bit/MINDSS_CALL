import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Divider } from '@mui/material';
import { Save, CheckCircle } from '@mui/icons-material';

const FinalReportTab = ({ project, onUpdate }) => {
  const finalReport = project?.projectDetails?.finalReport || {};

  const [summary, setSummary] = useState(finalReport.summary || '');
  const [commercializationPlan, setCommercializationPlan] = useState(finalReport.commercializationPlan || '');
  const [finalStatus, setFinalStatus] = useState(finalReport.finalStatus || 'Pending');
  const [deliverablesConfirmed, setDeliverablesConfirmed] = useState(finalReport.deliverablesConfirmed || false);
  const [submissionDate, setSubmissionDate] = useState(finalReport.submissionDate ? new Date(finalReport.submissionDate).toISOString().split('T')[0] : '');

  const handleSave = () => {
    onUpdate({
      finalReport: {
        summary,
        commercializationPlan,
        finalStatus,
        deliverablesConfirmed,
        submissionDate: submissionDate || new Date().toISOString()
      },
      // Optionally auto-update overall status if marked completed
      ...(finalStatus === 'Completed' ? { implementationStatus: 'Completed', progressPercentage: 100 } : {})
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 4, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CheckCircle sx={{ color: finalStatus === 'Completed' ? '#10B981' : '#0078D4', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Final Report & Closure</Typography>
            <Typography variant="body2" sx={{ color: '#605E5C' }}>Document final outcomes and formally close the project.</Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Executive Summary of Outcomes</Typography>
            <TextField fullWidth multiline rows={4} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summarize the final results, what worked, what didn't..." />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Commercialization / Next Phase Plan</Typography>
            <TextField fullWidth multiline rows={4} value={commercializationPlan} onChange={e => setCommercializationPlan(e.target.value)} placeholder="Describe the path to production, handover, or scaling..." />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Final Closure Status</InputLabel>
              <Select value={finalStatus} label="Final Closure Status" onChange={e => setFinalStatus(e.target.value)}>
                <MenuItem value="Pending">Pending / Incomplete</MenuItem>
                <MenuItem value="Completed">Completed (Successful)</MenuItem>
                <MenuItem value="Terminated">Terminated (Unsuccessful)</MenuItem>
                <MenuItem value="Transferred">Transferred to Ops</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField label="Closure Date" type="date" size="small" fullWidth value={submissionDate} onChange={e => setSubmissionDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={deliverablesConfirmed} onChange={e => setDeliverablesConfirmed(e.target.checked)} color="primary" />}
              label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#323130' }}>All Deliverables Met</Typography>}
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave} sx={{ bgcolor: finalStatus === 'Completed' ? '#10B981' : '#0078D4', boxShadow: 'none', textTransform: 'none', px: 4 }}>
              Submit Final Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FinalReportTab;
