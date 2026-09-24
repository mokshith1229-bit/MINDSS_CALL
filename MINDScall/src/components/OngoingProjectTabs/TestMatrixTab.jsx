import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Science, Edit, AttachFile } from '@mui/icons-material';
import { handleFileDownload } from '../../utils/fileUtils';

const TestMatrixTab = ({ project, onUpdate }) => {
  const testMatrix = project?.projectDetails?.testMatrix || [];
  const phases = project?.projectDetails?.milestones || [];
  const samples = project?.projectDetails?.samples || [];
  
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [relatedPhase, setRelatedPhase] = useState('');
  const [testObjective, setTestObjective] = useState('');
  const [sampleRef, setSampleRef] = useState('');
  const [sampleQuantity, setSampleQuantity] = useState('');
  const [requiredEquipment, setRequiredEquipment] = useState('');
  const [testProcedure, setTestProcedure] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('DRAFT');
  const [remarks, setRemarks] = useState('');
  const [files, setFiles] = useState([]);

  const handleOpen = (item = null) => {
    setEditItem(item);
    setTestName(item ? item.testName : '');
    setTestDescription(item ? item.testDescription : '');
    setRelatedPhase(item ? item.relatedPhase : '');
    setTestObjective(item ? item.testObjective : '');
    setSampleRef(item ? item.sampleRef : '');
    setSampleQuantity(item ? item.sampleQuantity : '');
    setRequiredEquipment(item ? item.requiredEquipment : '');
    setTestProcedure(item ? item.testProcedure : '');
    setExpectedResult(item ? item.expectedResult : '');
    setResponsiblePerson(item ? item.responsiblePerson : '');
    setEstimatedDuration(item ? item.estimatedDuration : '');
    setRequiredDate(item && item.requiredDate ? new Date(item.requiredDate).toISOString().split('T')[0] : '');
    setPriority(item ? item.priority : 'MEDIUM');
    setStatus(item ? item.status : 'DRAFT');
    setRemarks(item ? item.remarks : '');
    setFiles([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    const formData = new FormData();
    if (editItem) formData.append('testId', editItem._id);
    formData.append('testName', testName);
    formData.append('testDescription', testDescription);
    if (relatedPhase) formData.append('relatedPhase', relatedPhase);
    formData.append('testObjective', testObjective);
    if (sampleRef) formData.append('sampleRef', sampleRef);
    formData.append('sampleQuantity', sampleQuantity);
    formData.append('requiredEquipment', requiredEquipment);
    formData.append('testProcedure', testProcedure);
    formData.append('expectedResult', expectedResult);
    formData.append('responsiblePerson', responsiblePerson);
    formData.append('estimatedDuration', estimatedDuration);
    if (requiredDate) formData.append('requiredDate', requiredDate);
    formData.append('priority', priority);
    formData.append('status', status);
    formData.append('remarks', remarks);
    files.forEach(f => formData.append('attachments', f));

    if (onUpdate && onUpdate.addTestMatrix) {
      onUpdate.addTestMatrix(formData);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Test Matrix</Typography>
          <Typography variant="body2" sx={{ color: '#605E5C' }}>Define and plan required tests for this project.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ bgcolor: '#0078D4', textTransform: 'none' }}>
          Add Test
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ border: '1px solid #EDEBE9', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F3F2F1' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Test Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Phase</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Req. Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testMatrix.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#605E5C' }}>No tests added to the matrix.</TableCell>
              </TableRow>
            ) : (
              testMatrix.map((t, i) => {
                const p = phases.find(ph => ph._id === t.relatedPhase);
                return (
                  <TableRow key={i}>
                    <TableCell>{t.testName}</TableCell>
                    <TableCell>{p ? p.name : 'N/A'}</TableCell>
                    <TableCell>{t.requiredDate ? new Date(t.requiredDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{t.estimatedDuration} hrs</TableCell>
                    <TableCell>{t.priority}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.status} sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(t)}><Edit fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editItem ? 'Edit Test' : 'Add New Test'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField label="Test Name" fullWidth size="small" value={testName} onChange={e => setTestName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Related Phase (Milestone)" select fullWidth size="small" value={relatedPhase} onChange={e => setRelatedPhase(e.target.value)}>
                <MenuItem value="">None</MenuItem>
                {phases.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Test Description" fullWidth multiline rows={2} value={testDescription} onChange={e => setTestDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Test Objective" fullWidth multiline rows={2} value={testObjective} onChange={e => setTestObjective(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Sample" select fullWidth size="small" value={sampleRef} onChange={e => setSampleRef(e.target.value)}>
                <MenuItem value="">None</MenuItem>
                {samples.map(s => <MenuItem key={s._id} value={s._id}>{s.sampleName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Sample Quantity" type="number" fullWidth size="small" value={sampleQuantity} onChange={e => setSampleQuantity(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Priority" select fullWidth size="small" value={priority} onChange={e => setPriority(e.target.value)}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Required Equipment / Facility" fullWidth size="small" value={requiredEquipment} onChange={e => setRequiredEquipment(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Responsible Person" fullWidth size="small" value={responsiblePerson} onChange={e => setResponsiblePerson(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Estimated Duration (Hrs)" type="number" fullWidth size="small" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Required Date" type="date" fullWidth size="small" value={requiredDate} onChange={e => setRequiredDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Status" select fullWidth size="small" value={status} onChange={e => setStatus(e.target.value)}>
                {['DRAFT', 'SUBMITTED', 'UNDER REVIEW', 'APPROVED', 'CHANGES REQUIRED', 'SCHEDULED', 'IN PROGRESS', 'COMPLETED'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Test Procedure / Method" fullWidth multiline rows={3} value={testProcedure} onChange={e => setTestProcedure(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Expected Result / Output" fullWidth multiline rows={2} value={expectedResult} onChange={e => setExpectedResult(e.target.value)} />
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
                {editItem && editItem.attachments && editItem.attachments.map((att, aIdx) => (
                  <Chip key={aIdx} icon={<AttachFile fontSize="small" />} label={att.filename} size="small" variant="outlined" onClick={() => handleFileDownload(att)} clickable sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!testName}>Save Test</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestMatrixTab;
