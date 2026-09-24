import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, LinearProgress } from '@mui/material';
import { Save, Add, Delete, AccountBalanceWallet } from '@mui/icons-material';

const BudgetTab = ({ project, onUpdate }) => {
  const pDetails = project?.projectDetails || {};
  const financials = pDetails.financials || {};
  
  const [totalBudget, setTotalBudget] = useState(financials.totalBudget || project?.answers?.budget || 0);
  const [spentToDate, setSpentToDate] = useState(financials.spentToDate || 0);
  const [logs, setLogs] = useState(financials.expenditureLogs || []);

  const [open, setOpen] = useState(false);
  const [newLogAmt, setNewLogAmt] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [newLogDate, setNewLogDate] = useState('');
  const [newLogCat, setNewLogCat] = useState('Hardware');

  const handleSaveBudget = () => {
    onUpdate({
      financials: {
        totalBudget: Number(totalBudget),
        spentToDate: Number(spentToDate),
        remainingBudget: Number(totalBudget) - Number(spentToDate),
        expenditureLogs: logs
      }
    });
  };

  const handleAddLog = () => {
    if (!newLogAmt || !newLogDesc) return;
    const log = {
      amount: Number(newLogAmt),
      description: newLogDesc,
      date: newLogDate || new Date().toISOString(),
      category: newLogCat
    };
    const updatedLogs = [...logs, log];
    const newSpent = Number(spentToDate) + log.amount;
    
    setLogs(updatedLogs);
    setSpentToDate(newSpent);
    setOpen(false);
    
    // Auto-save
    onUpdate({
      financials: {
        totalBudget: Number(totalBudget),
        spentToDate: newSpent,
        remainingBudget: Number(totalBudget) - newSpent,
        expenditureLogs: updatedLogs
      }
    });
  };

  const handleDeleteLog = (idx) => {
    const logAmt = logs[idx].amount;
    const updatedLogs = logs.filter((_, i) => i !== idx);
    const newSpent = Number(spentToDate) - logAmt;

    setLogs(updatedLogs);
    setSpentToDate(newSpent);
    
    // Auto-save
    onUpdate({
      financials: {
        totalBudget: Number(totalBudget),
        spentToDate: newSpent,
        remainingBudget: Number(totalBudget) - newSpent,
        expenditureLogs: updatedLogs
      }
    });
  };

  const remaining = Number(totalBudget) - Number(spentToDate);
  const pct = Number(totalBudget) > 0 ? (Number(spentToDate) / Number(totalBudget)) * 100 : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #0078D4', boxShadow: 'none', borderTop: '1px solid #EDEBE9', borderRight: '1px solid #EDEBE9', borderBottom: '1px solid #EDEBE9', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Total Budget</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>₹{Number(totalBudget).toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #D97706', boxShadow: 'none', borderTop: '1px solid #EDEBE9', borderRight: '1px solid #EDEBE9', borderBottom: '1px solid #EDEBE9', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Spent To Date</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>₹{Number(spentToDate).toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #10B981', boxShadow: 'none', borderTop: '1px solid #EDEBE9', borderRight: '1px solid #EDEBE9', borderBottom: '1px solid #EDEBE9', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Remaining</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>₹{remaining.toLocaleString()}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#323130' }}>Budget Settings</Typography>
            <Typography variant="body2" sx={{ color: '#605E5C' }}>Update the baseline approved budget for this project.</Typography>
          </Box>
          <Button variant="contained" size="small" startIcon={<Save />} onClick={handleSaveBudget} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }}>Save Baseline</Button>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField label="Total Approved Budget (₹)" type="number" size="small" fullWidth value={totalBudget} onChange={e => setTotalBudget(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
               <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600 }}>Budget Utilization ({pct.toFixed(1)}%)</Typography>
               <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{ height: 8, borderRadius: 4, bgcolor: '#EDEBE9', '& .MuiLinearProgress-bar': { bgcolor: pct > 90 ? '#B91C1C' : '#D97706' } }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#323130' }}>Expenditure Log</Typography>
          <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ textTransform: 'none' }}>Add Expense</Button>
        </Box>
        
        <TableContainer component={Box} sx={{ border: '1px solid #EDEBE9', borderRadius: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F3F2F1' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Amount (₹)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: '#605E5C' }}>No expenses logged yet.</TableCell></TableRow>
              ) : (
                logs.map((log, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell>{log.category}</TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell align="right">₹{Number(log.amount).toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleDeleteLog(idx)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #EDEBE9' }}>Log Expense</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Amount (₹)" type="number" size="small" fullWidth value={newLogAmt} onChange={e => setNewLogAmt(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date" type="date" size="small" fullWidth value={newLogDate} onChange={e => setNewLogDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select value={newLogCat} label="Category" onChange={e => setNewLogCat(e.target.value)}>
                  <MenuItem value="Hardware">Hardware / Equipment</MenuItem>
                  <MenuItem value="Software">Software / Licensing</MenuItem>
                  <MenuItem value="Consulting">Consulting / Services</MenuItem>
                  <MenuItem value="Travel">Travel</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" size="small" fullWidth value={newLogDesc} onChange={e => setNewLogDesc(e.target.value)} required />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #EDEBE9' }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', color: '#605E5C' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLog} disabled={!newLogAmt || !newLogDesc} sx={{ textTransform: 'none', bgcolor: '#0078D4', boxShadow: 'none' }}>Save Expense</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetTab;
