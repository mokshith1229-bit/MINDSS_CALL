import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Typography, Box, Alert, CircularProgress
} from '@mui/material';
import useLabStore from '../../store/labStore';
import useScheduleStore from '../../store/scheduleStore';

const ScheduleTestModal = ({ open, onClose, test, project }) => {
  const { labs, equipment, fetchLabs, fetchEquipmentByLab } = useLabStore();
  const { checkAvailability, requestSchedule, isLoading } = useScheduleStore();

  const [selectedLab, setSelectedLab] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState(null); // { available: boolean, reason: string }
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLabs();
      // Reset state
      setSelectedLab('');
      setSelectedEquipment('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setAvailabilityStatus(null);
    }
  }, [open, fetchLabs]);

  const handleLabChange = (e) => {
    const labId = e.target.value;
    setSelectedLab(labId);
    setSelectedEquipment('');
    if (labId) {
      fetchEquipmentByLab(labId);
    }
  };

  const handleCheckAvailability = async () => {
    if (!selectedLab || !date || !startTime || !endTime) return;
    
    setChecking(true);
    setAvailabilityStatus(null);
    
    // Construct local Date objects for start/end
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    const result = await checkAvailability({
      labId: selectedLab,
      equipmentIds: selectedEquipment ? [selectedEquipment] : [],
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });
    
    setAvailabilityStatus(result);
    setChecking(false);
  };

  const handleSubmitRequest = async () => {
    if (!availabilityStatus?.available) return;
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const durationMins = (endDateTime.getTime() - startDateTime.getTime()) / 60000;
    
    const payload = {
      project: project.id || project._id,
      phase: test.relatedPhase || 'Unknown Phase',
      testName: test.testName,
      testObjective: test.testObjective || '',
      lab: selectedLab,
      equipment: selectedEquipment ? [selectedEquipment] : [],
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: durationMins,
      priority: test.priority ? (test.priority.charAt(0).toUpperCase() + test.priority.slice(1).toLowerCase()) : 'Medium',
      remarks: 'Scheduled from Test Matrix',
    };
    
    try {
      await requestSchedule(payload);
      onClose();
      // Optional: Show success toast
    } catch (err) {
      setAvailabilityStatus({ available: false, reason: err.message });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Lab Slot for Test</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 2, color: '#605E5C' }}>
          Test: {test?.testName} <br/>
          Project: {project?.projectDetails?.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            select
            label="Select Laboratory"
            fullWidth
            size="small"
            value={selectedLab}
            onChange={handleLabChange}
          >
            {labs.length === 0 && <MenuItem disabled>No laboratories configured</MenuItem>}
            {labs.map(lab => (
              <MenuItem key={lab._id} value={lab._id}>{lab.name}</MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            label="Required Equipment (Optional)"
            fullWidth
            size="small"
            value={selectedEquipment}
            onChange={e => setSelectedEquipment(e.target.value)}
            disabled={!selectedLab || equipment.length === 0}
          >
            <MenuItem value="">None / Not Required</MenuItem>
            {equipment.map(eq => (
              <MenuItem key={eq._id} value={eq._id}>{eq.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            type="date"
            label="Preferred Date"
            fullWidth
            size="small"
            value={date}
            onChange={e => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ display: 'flex', gap: 3 }}>
            <TextField
              type="time"
              label="Start Time"
              fullWidth
              size="small"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              type="time"
              label="End Time"
              fullWidth
              size="small"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={handleCheckAvailability}
            disabled={!selectedLab || !date || !startTime || !endTime || checking}
          >
            {checking ? <CircularProgress size={24} /> : 'Check Availability'}
          </Button>
        </Box>

        {availabilityStatus && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={availabilityStatus.available ? "success" : "error"}>
              {availabilityStatus.reason}
            </Alert>
          </Box>
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmitRequest}
          disabled={!availabilityStatus?.available || isLoading}
        >
          {isLoading ? 'Requesting...' : 'Request Slot'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleTestModal;
