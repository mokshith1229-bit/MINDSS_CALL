import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Divider, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, 
  CircularProgress, Alert 
} from '@mui/material';
import { Science, DateRange, Warning, CheckCircle, Close, Build } from '@mui/icons-material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import useScheduleStore from '../store/scheduleStore';

const localizer = momentLocalizer(moment);

const statusColors = {
  'TENTATIVE': '#f59e0b',
  'PENDING_LAB_REVIEW': '#f59e0b',
  'CHANGES_REQUIRED': '#ef4444',
  'CONFIRMED': '#3b82f6',
  'IN_PROGRESS': '#10b981',
  'COMPLETED': '#059669',
  'CANCELLED': '#6b7280',
  'REJECTED': '#dc2626'
};

const LabCalendar = () => {
  const { schedules, pendingReviews, fetchSchedules, isLoading, error, approveSchedule, requestChanges, rejectSchedule } = useScheduleStore();
  
  const [openReview, setOpenReview] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewRemarks, setReviewRemarks] = useState('');
  
  // Controlled calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleOpenReview = (schedule) => {
    setSelectedSchedule(schedule);
    setReviewAction('APPROVE');
    setReviewRemarks('');
    setOpenReview(true);
  };

  const handleSaveReview = async () => {
    if (!selectedSchedule) return;
    try {
      if (reviewAction === 'APPROVE') {
        await approveSchedule(selectedSchedule._id, reviewRemarks);
      } else if (reviewAction === 'CHANGES_REQUIRED') {
        await requestChanges(selectedSchedule._id, reviewRemarks);
      } else if (reviewAction === 'REJECT') {
        await rejectSchedule(selectedSchedule._id, reviewRemarks);
      }
      setOpenReview(false);
    } catch (err) {
      console.error(err);
      // Let store handle error display
    }
  };

  const calendarEvents = useMemo(() => {
    return schedules.map(s => ({
      id: s._id,
      title: `${s.testName} (${s.lab?.name || 'Unknown Lab'})`,
      start: new Date(s.startTime),
      end: new Date(s.endTime),
      status: s.status,
      resource: s
    }));
  }, [schedules]);

  const eventStyleGetter = (event) => {
    const backgroundColor = statusColors[event.status] || '#3174ad';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Science sx={{ fontSize: 32, color: '#0078D4', mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#323130' }}>Laboratory Calendar & Reviews</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, bgcolor: '#FFF3E0', border: '1px solid #FFCC80', mb: 3, boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#E65100', mb: 2, display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 1 }} /> Pending Lab Manager Reviews
            </Typography>
            {isLoading && <CircularProgress size={24} />}
            {!isLoading && pendingReviews.length === 0 ? (
              <Typography variant="body2" color="textSecondary">No tests pending review.</Typography>
            ) : null}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '600px', overflowY: 'auto' }}>
              {pendingReviews.map(t => (
                <Card key={t._id} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' } }} onClick={() => handleOpenReview(t)}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t.testName}</Typography>
                      <Chip label={t.status} size="small" color="warning" />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Project: {t.project?.projectDetails?.title || 'Unknown'}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#605E5C' }}>
                      Lab: {t.lab?.name} <br/>
                      Date: {new Date(t.startTime).toLocaleDateString()} {new Date(t.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          {/* Quick Stats Dashboard */}
          <Paper sx={{ p: 2, border: '1px solid #EDEBE9', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: '#f3f2f1', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h4" color="#0078D4">{pendingReviews.length}</Typography>
                  <Typography variant="body2" color="textSecondary">Pending Review</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: '#f3f2f1', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h4" color="#107C10">{schedules.filter(s => s.status === 'CONFIRMED').length}</Typography>
                  <Typography variant="body2" color="textSecondary">Confirmed</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 3, boxShadow: 'none', border: '1px solid #EDEBE9', flexGrow: 1, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130', mb: 2, display: 'flex', alignItems: 'center' }}>
              <DateRange sx={{ mr: 1, color: '#0078D4' }} /> Lab Schedule
            </Typography>
            
            <Box sx={{ flexGrow: 1, position: 'relative', minHeight: '500px' }}>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                date={calendarDate}
                onNavigate={(newDate) => setCalendarDate(newDate)}
                view={calendarView}
                onView={(newView) => setCalendarView(newView)}
                onSelectEvent={(event) => handleOpenReview(event.resource)}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog open={openReview} onClose={() => setOpenReview(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Lab Schedule Request</DialogTitle>
        <DialogContent dividers>
          {selectedSchedule && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Test: {selectedSchedule.testName}</Typography>
              <Typography variant="body2"><strong>Project:</strong> {selectedSchedule.project?.projectDetails?.title}</Typography>
              <Typography variant="body2"><strong>Phase:</strong> {selectedSchedule.phase}</Typography>
              <Typography variant="body2"><strong>Laboratory:</strong> {selectedSchedule.lab?.name}</Typography>
              <Typography variant="body2">
                <strong>Requested Slot:</strong> {new Date(selectedSchedule.startTime).toLocaleString()} - {new Date(selectedSchedule.endTime).toLocaleString()}
              </Typography>
              <Typography variant="body2"><strong>Duration:</strong> {selectedSchedule.duration} mins</Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <TextField 
                label="Manager Action" 
                select 
                fullWidth 
                size="small" 
                value={reviewAction} 
                onChange={e => setReviewAction(e.target.value)}
              >
                <MenuItem value="APPROVE">Approve & Confirm</MenuItem>
                <MenuItem value="CHANGES_REQUIRED">Request Changes</MenuItem>
                <MenuItem value="REJECT">Reject</MenuItem>
              </TextField>
              
              <TextField 
                label="Remarks / Feedback" 
                fullWidth 
                multiline 
                rows={3} 
                value={reviewRemarks} 
                onChange={e => setReviewRemarks(e.target.value)} 
                placeholder="Add notes for the project initiator..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReview(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveReview} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabCalendar;
