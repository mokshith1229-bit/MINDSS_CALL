import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add, Delete, Save, Edit, FormatListBulleted } from '@mui/icons-material';

const WorkPlanTab = ({ project, onUpdate }) => {
  const pDetails = project?.projectDetails || {};
  const [milestones, setMilestones] = useState(pDetails.milestones || []);
  
  // Dialog state for New/Edit Milestone
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mTargetDate, setMTargetDate] = useState('');
  const [mStatus, setMStatus] = useState('Not Started');

  const handleOpenDialog = (index = -1) => {
    setEditIndex(index);
    if (index >= 0) {
      const m = milestones[index];
      setMTitle(m.title || '');
      setMDesc(m.description || '');
      setMTargetDate(m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '');
      setMStatus(m.status || 'Not Started');
    } else {
      setMTitle('');
      setMDesc('');
      setMTargetDate('');
      setMStatus('Not Started');
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSaveMilestone = () => {
    if (!mTitle.trim()) return;
    const newM = {
      title: mTitle,
      description: mDesc,
      targetDate: mTargetDate,
      status: mStatus,
      tasks: editIndex >= 0 ? milestones[editIndex].tasks || [] : []
    };

    let updated;
    if (editIndex >= 0) {
      updated = [...milestones];
      updated[editIndex] = newM;
    } else {
      updated = [...milestones, newM];
    }

    setMilestones(updated);
    setOpen(false);
  };

  const handleDelete = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSaveToProject = () => {
    onUpdate({ milestones });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return { bg: '#D1FAE5', color: '#065F46' };
      case 'In Progress': return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'Delayed': return { bg: '#FEE2E2', color: '#B91C1C' };
      default: return { bg: '#F3F2F1', color: '#323130' };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Work Plan & Milestones</Typography>
            <Typography variant="body2" sx={{ color: '#605E5C' }}>Define key project deliverables and track their status.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog(-1)} sx={{ textTransform: 'none' }}>Add Milestone</Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSaveToProject} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }}>Save Work Plan</Button>
          </Box>
        </Box>

        <TableContainer component={Box} sx={{ border: '1px solid #EDEBE9', borderRadius: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F3F2F1' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Milestone Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Target Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tasks</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {milestones.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#605E5C' }}>No milestones defined. Click 'Add Milestone' to begin.</TableCell></TableRow>
              ) : (
                milestones.map((m, idx) => {
                  const colors = getStatusColor(m.status);
                  return (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#323130' }}>{m.title}</Typography>
                        {m.description && <Typography variant="caption" sx={{ color: '#605E5C', display: 'block' }}>{m.description}</Typography>}
                      </TableCell>
                      <TableCell>{m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={m.status || 'Not Started'} sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FormatListBulleted sx={{ fontSize: 16, color: '#605E5C' }} />
                          <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600 }}>{(m.tasks || []).length} Task(s)</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(idx)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(idx)}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* DIALOG FOR MILESTONES */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #EDEBE9' }}>{editIndex >= 0 ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Title" size="small" fullWidth value={mTitle} onChange={e => setMTitle(e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" size="small" fullWidth multiline rows={2} value={mDesc} onChange={e => setMDesc(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Target Date" type="date" size="small" fullWidth value={mTargetDate} onChange={e => setMTargetDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={mStatus} label="Status" onChange={e => setMStatus(e.target.value)}>
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Delayed">Delayed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #EDEBE9' }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', color: '#605E5C' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMilestone} disabled={!mTitle.trim()} sx={{ textTransform: 'none', bgcolor: '#0078D4', boxShadow: 'none' }}>
            Save Milestone
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkPlanTab;
