import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { Add, Delete, Save, Edit, FormatListBulleted, AssignmentTurnedIn } from '@mui/icons-material';

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
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* HEADER SECTION */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: '#EFF6FF',
              color: '#0078D4',
              borderRadius: '10px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FormatListBulleted sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: '1.35rem',
                color: '#0F172A',
                lineHeight: 1.2
              }}
            >
              Work Plan & Milestones
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                color: '#64748B',
                mt: 0.25
              }}
            >
              Define key project deliverables and track their status.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            onClick={() => handleOpenDialog(-1)}
            sx={{
              height: 42,
              minWidth: 155,
              borderColor: '#10B981',
              color: '#10B981',
              bgcolor: '#FFFFFF',
              '&:hover': { borderColor: '#059669', bgcolor: '#F0FDF4' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '8px'
            }}
          >
            Add Milestone
          </Button>
          <Button
            variant="contained"
            startIcon={<Save sx={{ fontSize: 18 }} />}
            onClick={handleSaveToProject}
            sx={{
              height: 42,
              minWidth: 155,
              bgcolor: '#0078D4',
              '&:hover': { bgcolor: '#006CBE' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '8px',
              boxShadow: 'none'
            }}
          >
            Save Work Plan
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 3.5, borderColor: '#E2E8F0' }} />

      {/* TABLE CONTAINER */}
      <TableContainer
        component={Box}
        sx={{
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          overflow: 'hidden',
          bgcolor: '#FFFFFF'
        }}
      >
        <Table size="medium">
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#64748B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  width: '30%',
                  py: 1.75
                }}
              >
                Milestone Title
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#64748B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  width: '18%',
                  py: 1.75
                }}
              >
                Target Date
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#64748B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  width: '15%',
                  py: 1.75
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#64748B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  width: '15%',
                  py: 1.75
                }}
              >
                Tasks
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#64748B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  width: '22%',
                  py: 1.75
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {milestones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ borderBottom: 'none' }}>
                  <Box
                    sx={{
                      py: 7,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        bgcolor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5
                      }}
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M8 12.5l1.5 1.5 2.5-2.5" />
                        <line x1="13" y1="12.5" x2="16.5" y2="12.5" />
                        <path d="M8 16.5l1.5 1.5 2.5-2.5" />
                        <line x1="13" y1="16.5" x2="16.5" y2="16.5" />
                      </svg>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: '#0F172A',
                        mb: 0.75
                      }}
                    >
                      No milestones defined yet.
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        color: '#64748B'
                      }}
                    >
                      Click 'Add Milestone' to begin.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              milestones.map((m, idx) => {
                const colors = getStatusColor(m.status);
                return (
                  <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{m.title}</Typography>
                      {m.description && <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>{m.description}</Typography>}
                    </TableCell>
                    <TableCell sx={{ color: '#334155', fontSize: '0.875rem' }}>{m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={m.status || 'Not Started'} sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 600, borderRadius: '6px' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormatListBulleted sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{(m.tasks || []).length} Task(s)</Typography>
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

      {/* DIALOG FOR MILESTONES */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>{editIndex >= 0 ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMilestone} disabled={!mTitle.trim()} sx={{ textTransform: 'none', bgcolor: '#0078D4', boxShadow: 'none', borderRadius: '6px' }}>
            Save Milestone
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WorkPlanTab;
