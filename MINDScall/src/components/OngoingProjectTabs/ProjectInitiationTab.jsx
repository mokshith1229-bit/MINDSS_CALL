import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Divider, Alert } from '@mui/material';
import { Save, RocketLaunch } from '@mui/icons-material';

const ProjectInitiationTab = ({ project, onUpdate }) => {
  const initData = project?.projectDetails?.initiation || {};
  const [approvalDate, setApprovalDate] = useState(initData.approvalDate ? new Date(initData.approvalDate).toISOString().split('T')[0] : '');
  const [kickoffDate, setKickoffDate] = useState(initData.kickoffDate ? new Date(initData.kickoffDate).toISOString().split('T')[0] : '');
  const [sponsor, setSponsor] = useState(initData.sponsor || '');
  const [remarks, setRemarks] = useState(initData.remarks || '');

  const handleSave = () => {
    onUpdate({
      initiation: {
        approvalDate,
        kickoffDate,
        sponsor,
        remarks
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 4, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <RocketLaunch sx={{ color: '#0078D4', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Project Initiation</Typography>
            <Typography variant="body2" sx={{ color: '#605E5C' }}>Formalize the kickoff and document key sponsors.</Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Alert severity="info" sx={{ mb: 4, '& .MuiAlert-message': { width: '100%' } }}>
          Once the initiation details are saved, the project moves from 'Approved' state into 'Planning' or 'In Progress' execution tracks.
        </Alert>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Formal Approval Date</Typography>
            <TextField type="date" size="small" fullWidth value={approvalDate} onChange={e => setApprovalDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Kickoff Meeting Date</Typography>
            <TextField type="date" size="small" fullWidth value={kickoffDate} onChange={e => setKickoffDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Project Sponsor / Champion</Typography>
            <TextField size="small" fullWidth value={sponsor} onChange={e => setSponsor(e.target.value)} placeholder="e.g. John Doe (VP of R&D)" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>Initiation Remarks / Notes</Typography>
            <TextField fullWidth multiline rows={4} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any special constraints or instructions given during kickoff..." />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none', px: 4 }}>
              Save Initiation Details
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProjectInitiationTab;
