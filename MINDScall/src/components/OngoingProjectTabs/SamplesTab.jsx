import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Science, Edit, AttachFile } from '@mui/icons-material';
import { handleFileDownload } from '../../utils/fileUtils';

const SamplesTab = ({ project, onUpdate }) => {
  const samples = project?.projectDetails?.samples || [];
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [sampleName, setSampleName] = useState('');
  const [sampleType, setSampleType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [remarks, setRemarks] = useState('');
  const [files, setFiles] = useState([]);

  const handleOpen = (item = null) => {
    setEditItem(item);
    setSampleName(item ? item.sampleName : '');
    setSampleType(item ? item.sampleType : '');
    setQuantity(item ? item.quantity : '');
    setSource(item ? item.source : '');
    setStatus(item ? item.status : 'PENDING');
    setRemarks(item ? item.remarks : '');
    setFiles([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    const formData = new FormData();
    if (editItem) formData.append('sampleId', editItem._id);
    formData.append('sampleName', sampleName);
    formData.append('sampleType', sampleType);
    formData.append('quantity', quantity);
    formData.append('source', source);
    formData.append('status', status);
    formData.append('remarks', remarks);
    files.forEach(f => formData.append('attachments', f));

    // Assuming formStore has a method for this, otherwise we construct an API call.
    // For now, we will pass it back to onUpdate, but files need API call. 
    // We'll dispatch a custom event or let the parent handle it.
    if (onUpdate && onUpdate.addSample) {
      onUpdate.addSample(formData);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Project Samples Inventory</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ bgcolor: '#0078D4', textTransform: 'none' }}>
          Add Sample
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ border: '1px solid #EDEBE9', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F3F2F1' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Sample Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Attachments</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {samples.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#605E5C' }}>No samples added yet.</TableCell>
              </TableRow>
            ) : (
              samples.map((s, i) => (
                <TableRow key={i}>
                  <TableCell>{s.sampleName}</TableCell>
                  <TableCell>{s.sampleType}</TableCell>
                  <TableCell>{s.quantity}</TableCell>
                  <TableCell>{s.source}</TableCell>
                  <TableCell>
                    <Chip size="small" label={s.status} sx={{ fontWeight: 600, bgcolor: s.status === 'IN TESTING' ? '#FEF08A' : (s.status === 'RECEIVED' ? '#D1FAE5' : '#E5E7EB') }} />
                  </TableCell>
                  <TableCell>
                    {s.attachments && s.attachments.map((att, aIdx) => (
                      <Chip key={aIdx} icon={<AttachFile fontSize="small" />} label={att.filename} size="small" variant="outlined" onClick={() => handleFileDownload(att)} clickable sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpen(s)}><Edit fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Edit Sample' : 'Add New Sample'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField label="Sample Name" fullWidth size="small" value={sampleName} onChange={e => setSampleName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Sample Type" fullWidth size="small" value={sampleType} onChange={e => setSampleType(e.target.value)} placeholder="e.g. Biological, Chemical" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Quantity" fullWidth size="small" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Source" fullWidth size="small" value={source} onChange={e => setSource(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Status" select fullWidth size="small" value={status} onChange={e => setStatus(e.target.value)}>
                {['PENDING', 'RECEIVED', 'IN TESTING', 'CONSUMED', 'RETURNED'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Remarks" fullWidth multiline rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" startIcon={<AttachFile />}>
                Upload Document
                <input type="file" hidden multiple onChange={e => setFiles(Array.from(e.target.files))} />
              </Button>
              <Box sx={{ mt: 1 }}>
                {files.map(f => <Chip key={f.name} label={f.name} size="small" sx={{ mr: 1, mb: 1 }} />)}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!sampleName}>Save Sample</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SamplesTab;
