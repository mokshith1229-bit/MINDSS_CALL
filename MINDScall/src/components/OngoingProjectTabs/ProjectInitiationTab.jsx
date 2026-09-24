import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider, Alert, Switch, FormControlLabel } from '@mui/material';
import { Save, RocketLaunch } from '@mui/icons-material';

const ProjectInitiationTab = ({ project, onUpdate }) => {
  const initData = project?.projectDetails?.initiation || {};
  const parsed = project?.parsedData || {};

  const [piConfirmed, setPiConfirmed] = useState(initData.piConfirmed || false);
  const [confirmedObjectives, setConfirmedObjectives] = useState(initData.confirmedObjectives || parsed.objectives || '');
  const [confirmedExpectedOutcomes, setConfirmedExpectedOutcomes] = useState(initData.confirmedExpectedOutcomes || parsed.expectedOutcomes || '');
  const [startDate, setStartDate] = useState(initData.startDate ? new Date(initData.startDate).toISOString().split('T')[0] : '');
  const [workPlan, setWorkPlan] = useState(initData.workPlan || '');

  const handleSave = () => {
    onUpdate({
      initiation: {
        ...initData,
        piConfirmed,
        confirmedObjectives,
        confirmedExpectedOutcomes,
        startDate,
        workPlan,
        status: piConfirmed ? 'SUBMITTED' : 'IN_PROGRESS'
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 4, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <RocketLaunch sx={{ color: '#0078D4', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Project Initiation Workspace</Typography>
            <Typography variant="body2" sx={{ color: '#605E5C' }}>Confirm approved proposal details and provide execution specifics.</Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Approved Proposal Details - Read Only */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Approved Proposal Details</Typography>
        <Grid container spacing={3} sx={{ mb: 4, p: 2, bgcolor: '#F8F9FA', borderRadius: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">Project Title</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{project?.title || parsed.title || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">Proposal ID / WBS</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{project?.trackingId || 'N/A'} / {project?.wbsCode || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">Principal Investigator</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{parsed.employeeName || parsed.piName || project?.projectDetails?.owner || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">Department / Organization</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{parsed.department || parsed.dept || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">Approved Budget</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{parsed.approvedBudget || parsed.budget || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">Approved Duration</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{parsed.duration || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* PI Confirmation Section */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Execution Details (PI Confirmation)</Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Please review the approved objectives and outcomes. You may refine them here for the execution phase.
        </Alert>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Confirmed Objectives</Typography>
            <TextField fullWidth multiline rows={3} value={confirmedObjectives} onChange={e => setConfirmedObjectives(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Confirmed Expected Outcomes</Typography>
            <TextField fullWidth multiline rows={3} value={confirmedExpectedOutcomes} onChange={e => setConfirmedExpectedOutcomes(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Execution Start Date</Typography>
            <TextField type="date" size="small" fullWidth value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Initial Work Plan / Methodology Notes</Typography>
            <TextField fullWidth multiline rows={3} value={workPlan} onChange={e => setWorkPlan(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel 
              control={<Switch checked={piConfirmed} onChange={(e) => setPiConfirmed(e.target.checked)} color="primary" />} 
              label={<Typography sx={{ fontWeight: 500 }}>I confirm these details and formally initiate this project.</Typography>} 
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none', px: 4 }}>
              {piConfirmed ? 'Submit Initiation' : 'Save Draft'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProjectInitiationTab;
