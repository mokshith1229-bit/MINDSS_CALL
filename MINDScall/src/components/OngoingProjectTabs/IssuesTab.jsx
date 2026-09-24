import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { Add, Delete, Save, Edit, Warning } from '@mui/icons-material';

const IssuesTab = ({ project, onUpdate }) => {
  const pDetails = project?.projectDetails || {};
  const [issues, setIssues] = useState(pDetails.issues || []);

  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [status, setStatus] = useState('Open');
  const [reportedDate, setReportedDate] = useState('');

  const handleOpenDialog = (index = -1) => {
    setEditIndex(index);
    if (index >= 0) {
      const issue = issues[index];
      setTitle(issue.title || '');
      setDesc(issue.description || '');
      setSeverity(issue.severity || 'Medium');
      setStatus(issue.status || 'Open');
      setReportedDate(issue.reportedDate ? new Date(issue.reportedDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setDesc('');
      setSeverity('Medium');
      setStatus('Open');
      setReportedDate(new Date().toISOString().split('T')[0]);
    }
    setOpen(true);
  };

  const handleSaveIssue = () => {
    if (!title.trim()) return;
    const newIssue = {
      title,
      description: desc,
      severity,
      status,
      reportedDate,
      resolutionDate: status === 'Closed' || status === 'Mitigated' ? new Date().toISOString() : null
    };

    let updated;
    if (editIndex >= 0) {
      updated = [...issues];
      updated[editIndex] = { ...updated[editIndex], ...newIssue };
    } else {
      updated = [...issues, newIssue];
    }

    setIssues(updated);
    setOpen(false);
  };

  const handleDelete = (index) => {
    setIssues(issues.filter((_, i) => i !== index));
  };

  const handleSaveToProject = () => {
    onUpdate({ issues });
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Critical': return '#991B1B';
      case 'High': return '#DC2626';
      case 'Medium': return '#D97706';
      case 'Low': return '#059669';
      default: return '#605E5C';
    }
  };

  const openCount = issues.filter(i => i.status === 'Open' || i.status === 'Investigating').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Warning sx={{ color: openCount > 0 ? '#DC2626' : '#10B981', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Issues & Risks</Typography>
              <Typography variant="body2" sx={{ color: '#605E5C' }}>Track project blockers, risks, and their mitigation status.</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog(-1)} sx={{ textTransform: 'none' }}>Log Issue</Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSaveToProject} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }}>Save Log</Button>
          </Box>
        </Box>

        <TableContainer component={Box} sx={{ border: '1px solid #EDEBE9', borderRadius: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F3F2F1' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Issue Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date Reported</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#605E5C' }}>No issues logged. Good job!</TableCell></TableRow>
              ) : (
                issues.map((i, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#323130' }}>{i.title}</Typography>
                      {i.description && <Typography variant="caption" sx={{ color: '#605E5C', display: 'block', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.description}</Typography>}
                    </TableCell>
                    <TableCell>{new Date(i.reportedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip size="small" label={i.severity} sx={{ bgcolor: 'transparent', color: getSeverityColor(i.severity), border: `1px solid ${getSeverityColor(i.severity)}`, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={i.status} sx={{ bgcolor: i.status === 'Closed' || i.status === 'Mitigated' ? '#D1FAE5' : '#FEE2E2', color: i.status === 'Closed' || i.status === 'Mitigated' ? '#065F46' : '#B91C1C' }} />
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
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #EDEBE9' }}>{editIndex >= 0 ? 'Edit Issue' : 'Log New Issue'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Issue/Risk Title" size="small" fullWidth value={title} onChange={e => setTitle(e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description & Impact" size="small" fullWidth multiline rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl size="small" fullWidth required>
                <InputLabel>Severity</InputLabel>
                <Select value={severity} label="Severity" onChange={e => setSeverity(e.target.value)}>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl size="small" fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Investigating">Investigating</MenuItem>
                  <MenuItem value="Mitigated">Mitigated</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Date Reported" type="date" size="small" fullWidth value={reportedDate} onChange={e => setReportedDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #EDEBE9' }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', color: '#605E5C' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveIssue} disabled={!title.trim()} sx={{ textTransform: 'none', bgcolor: '#0078D4', boxShadow: 'none' }}>
            Save Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssuesTab;
