import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { Add, Delete, Save, Edit, Autorenew } from '@mui/icons-material';

const ChangeRequestsTab = ({ project, onUpdate }) => {
  const pDetails = project?.projectDetails || {};
  const [requests, setRequests] = useState(pDetails.changeRequests || []);

  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [reqType, setReqType] = useState('Scope');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('Pending');
  const [reqDate, setReqDate] = useState('');

  const handleOpenDialog = (index = -1) => {
    setEditIndex(index);
    if (index >= 0) {
      const cr = requests[index];
      setReqType(cr.type || 'Scope');
      setDesc(cr.description || '');
      setStatus(cr.status || 'Pending');
      setReqDate(cr.requestDate ? new Date(cr.requestDate).toISOString().split('T')[0] : '');
    } else {
      setReqType('Scope');
      setDesc('');
      setStatus('Pending');
      setReqDate(new Date().toISOString().split('T')[0]);
    }
    setOpen(true);
  };

  const handleSaveCR = () => {
    if (!desc.trim()) return;
    const newCR = {
      type: reqType,
      description: desc,
      status,
      requestDate: reqDate,
      resolutionDate: status === 'Approved' || status === 'Rejected' ? new Date().toISOString() : null
    };

    let updated;
    if (editIndex >= 0) {
      updated = [...requests];
      updated[editIndex] = { ...updated[editIndex], ...newCR };
    } else {
      updated = [...requests, newCR];
    }

    setRequests(updated);
    setOpen(false);
  };

  const handleDelete = (index) => {
    setRequests(requests.filter((_, i) => i !== index));
  };

  const handleSaveToProject = () => {
    onUpdate({ changeRequests: requests });
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Autorenew sx={{ color: pendingCount > 0 ? '#F59E0B' : '#0078D4', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Change Requests</Typography>
              <Typography variant="body2" sx={{ color: '#605E5C' }}>Manage requests for scope, budget, or timeline changes.</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog(-1)} sx={{ textTransform: 'none' }}>New Request</Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSaveToProject} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }}>Save Log</Button>
          </Box>
        </Box>

        <TableContainer component={Box} sx={{ border: '1px solid #EDEBE9', borderRadius: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F3F2F1' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Request Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#605E5C' }}>No change requests filed.</TableCell></TableRow>
              ) : (
                requests.map((cr, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{cr.type}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#323130' }}>{cr.description}</Typography>
                    </TableCell>
                    <TableCell>{new Date(cr.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip size="small" label={cr.status} sx={{ bgcolor: cr.status === 'Approved' ? '#D1FAE5' : cr.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7', color: cr.status === 'Approved' ? '#065F46' : cr.status === 'Rejected' ? '#B91C1C' : '#B45309' }} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(idx)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(idx)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #EDEBE9' }}>{editIndex >= 0 ? 'Edit Change Request' : 'New Change Request'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl size="small" fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select value={reqType} label="Type" onChange={e => setReqType(e.target.value)}>
                  <MenuItem value="Scope">Scope</MenuItem>
                  <MenuItem value="Budget">Budget</MenuItem>
                  <MenuItem value="Timeline">Timeline</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Request Date" type="date" size="small" fullWidth value={reqDate} onChange={e => setReqDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Justification & Description" size="small" fullWidth multiline rows={4} value={desc} onChange={e => setDesc(e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                  <MenuItem value="Pending">Pending Review</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #EDEBE9' }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', color: '#605E5C' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCR} disabled={!desc.trim()} sx={{ textTransform: 'none', bgcolor: '#0078D4', boxShadow: 'none' }}>
            Save Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChangeRequestsTab;
