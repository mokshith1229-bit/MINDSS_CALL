import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Science, Edit, AttachFile, CalendarMonth, Delete } from '@mui/icons-material';
import { handleFileDownload } from '../../utils/fileUtils';
import ScheduleTestModal from '../LabCalendar/ScheduleTestModal';

const TestMatrixTab = ({ project, onUpdate }) => {
  const testMatrix = project?.projectDetails?.testMatrix || [];
  const phases = project?.projectDetails?.milestones || [];
  const samples = project?.projectDetails?.samples || [];
  
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [scheduleItem, setScheduleItem] = useState(null);

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

  const handleDelete = (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      const updatedMatrix = testMatrix.filter(t => t._id !== testId);
      if (onUpdate && onUpdate.updateProjectDetails) {
        onUpdate.updateProjectDetails({ testMatrix: updatedMatrix });
      }
    }
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
              <TableCell sx={{ fontWeight: 600, color: '#605E5C' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testMatrix.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#605E5C' }}>No tests added to the matrix.</TableCell>
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
                      <IconButton size="small" onClick={() => handleOpen(t)} title="Edit Test"><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => { setScheduleItem(t); setScheduleOpen(true); }} sx={{ color: '#0078D4' }} title="Request Lab Slot">
                        <CalendarMonth fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(t._id)} color="error" title="Delete Test">
                        <Delete fontSize="small" />
                      </IconButton>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField label="Test Name" fullWidth size="small" value={testName} onChange={e => setTestName(e.target.value)} />
              <TextField label="Related Phase (Milestone)" select fullWidth size="small" value={relatedPhase} onChange={e => setRelatedPhase(e.target.value)}>
                <MenuItem value="">None</MenuItem>
                {phases.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
              </TextField>
            </Box>
            
            <TextField label="Test Description" fullWidth multiline rows={2} value={testDescription} onChange={e => setTestDescription(e.target.value)} />
            <TextField label="Test Objective" fullWidth multiline rows={2} value={testObjective} onChange={e => setTestObjective(e.target.value)} />
            
            <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField label="Sample" select fullWidth size="small" value={sampleRef} onChange={e => setSampleRef(e.target.value)}>
                <MenuItem value="">None</MenuItem>
                {samples.map(s => <MenuItem key={s._id} value={s._id}>{s.sampleName}</MenuItem>)}
              </TextField>
              <TextField label="Sample Quantity" type="number" fullWidth size="small" value={sampleQuantity} onChange={e => setSampleQuantity(e.target.value)} />
              <TextField label="Priority" select fullWidth size="small" value={priority} onChange={e => setPriority(e.target.value)}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField label="Required Equipment / Facility" fullWidth size="small" value={requiredEquipment} onChange={e => setRequiredEquipment(e.target.value)} />
              <TextField label="Responsible Person" fullWidth size="small" value={responsiblePerson} onChange={e => setResponsiblePerson(e.target.value)} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField label="Estimated Duration (Hrs)" type="number" fullWidth size="small" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)} />
              <TextField label="Required Date" type="date" fullWidth size="small" value={requiredDate} onChange={e => setRequiredDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Status" select fullWidth size="small" value={status} onChange={e => setStatus(e.target.value)}>
                {['DRAFT', 'SUBMITTED', 'UNDER REVIEW', 'APPROVED', 'CHANGES REQUIRED', 'SCHEDULED', 'IN PROGRESS', 'COMPLETED'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            </Box>

            <TextField label="Test Procedure / Method" fullWidth multiline rows={3} value={testProcedure} onChange={e => setTestProcedure(e.target.value)} />
            <TextField label="Expected Result / Output" fullWidth multiline rows={2} value={expectedResult} onChange={e => setExpectedResult(e.target.value)} />
            <TextField label="Remarks" fullWidth multiline rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} />
            
            <Box>
              <Button variant="outlined" component="label" startIcon={<AttachFile />}>
                Upload Document
                <input type="file" hidden multiple onChange={e => setFiles(Array.from(e.target.files))} />
              </Button>
              {(files.length > 0 || (editItem && editItem.attachments && editItem.attachments.length > 0)) && (
                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {files.map(f => <Chip key={f.name} label={f.name} size="small" />)}
                  {editItem && editItem.attachments && editItem.attachments.map((att, aIdx) => (
                    <Chip key={aIdx} icon={<AttachFile fontSize="small" />} label={att.filename} size="small" variant="outlined" onClick={() => handleFileDownload(att)} clickable />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!testName}>Save Test</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Test Modal */}
      <ScheduleTestModal 
        open={scheduleOpen} 
        onClose={() => { setScheduleOpen(false); setScheduleItem(null); }} 
        test={scheduleItem}
        project={project}
      />
    </Box>
  );
};

export default TestMatrixTab;
