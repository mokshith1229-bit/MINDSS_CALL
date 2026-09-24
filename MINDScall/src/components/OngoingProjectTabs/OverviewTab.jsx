import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, TextField, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';

const OverviewTab = ({ project, onUpdate }) => {
  const pDetails = project?.projectDetails || {};
  const [objectives, setObjectives] = useState(pDetails.objectives || []);
  const [newObj, setNewObj] = useState('');
  const [expBenefits, setExpBenefits] = useState(pDetails.expectedBenefits || project?.benefits || '');
  const [actBenefits, setActBenefits] = useState(pDetails.actualBenefits || '');

  const handleAddObjective = () => {
    if (!newObj.trim()) return;
    setObjectives([...objectives, { name: newObj, status: 'Not Started' }]);
    setNewObj('');
  };

  const handleDeleteObjective = (idx) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onUpdate({
      objectives,
      expectedBenefits: expBenefits,
      actualBenefits: actBenefits
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#323130', mb: 2 }}>Project Abstract & Origin</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
             <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600 }}>Submitter</Typography>
             <Typography variant="body2">{project?.employeeName} ({project?.employeeCode})</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
             <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600 }}>Department</Typography>
             <Typography variant="body2">{project?.dept || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12}>
             <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600 }}>Abstract / Proposal Details</Typography>
             <Typography variant="body2" sx={{ mt: 0.5, p: 2, bgcolor: '#F3F2F1', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
               {project?.abstract || project?.answers?.abstract || 'No abstract provided.'}
             </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#323130' }}>Project Objectives</Typography>
          <Button variant="contained" size="small" startIcon={<Save />} onClick={handleSave} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }}>Save Changes</Button>
        </Box>
        
        <TableContainer component={Box} sx={{ border: '1px solid #EDEBE9', borderRadius: 1, mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F3F2F1' }}>
              <TableRow>
                <TableCell>Objective</TableCell>
                <TableCell width={120}>Status</TableCell>
                <TableCell width={80} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objectives.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: '#605E5C' }}>No objectives defined yet.</TableCell></TableRow>
              ) : (
                objectives.map((obj, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{obj.name || obj.text}</TableCell>
                    <TableCell>
                      <Chip size="small" label={obj.status} sx={{ bgcolor: obj.status === 'Completed' ? '#D1FAE5' : '#F3F2F1', color: obj.status === 'Completed' ? '#065F46' : '#323130' }} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleDeleteObjective(idx)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" fullWidth placeholder="Add a new objective..." value={newObj} onChange={(e) => setNewObj(e.target.value)} />
          <Button variant="outlined" startIcon={<Add />} onClick={handleAddObjective} sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}>Add Objective</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#323130', mb: 2 }}>Expected vs Actual Benefits</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, display: 'block' }}>Expected Benefits (From Proposal)</Typography>
            <TextField fullWidth multiline rows={4} value={expBenefits} onChange={(e) => setExpBenefits(e.target.value)} placeholder="Intended ROI, cost savings..." />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, display: 'block' }}>Actual Realized Benefits</Typography>
            <TextField fullWidth multiline rows={4} value={actBenefits} onChange={(e) => setActBenefits(e.target.value)} placeholder="Actual value realized post-implementation..." />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="small" startIcon={<Save />} onClick={handleSave} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }}>Save Benefits</Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default OverviewTab;
