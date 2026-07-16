import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Snackbar, Alert,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  EventRepeat as RescheduleIcon,
  Visibility as ViewIcon,
  AttachFile as AttachmentIcon
} from '@mui/icons-material';
import api from '../utils/api';

const MeetingRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog state
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', request: null });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/meeting-requests');
      if (res.data.success) {
        setRequests(res.data.data.meetingRequests);
      }
    } catch (err) {
      setError('Failed to fetch meeting requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleActionClick = (type, request) => {
    setActionDialog({ open: true, type, request });
    if (type === 'reschedule') {
      setRescheduleData({
        date: request.preferredDate || '',
        time: request.preferredTime || ''
      });
    }
  };

  const submitAction = async () => {
    const { type, request } = actionDialog;
    let payload = {};

    if (type === 'approve') payload = { status: 'Approved' };
    else if (type === 'reject') payload = { status: 'Rejected' };
    else if (type === 'reschedule') {
      payload = {
        status: 'Approved', // or Rescheduled
        preferredDate: rescheduleData.date,
        preferredTime: rescheduleData.time
      };
    }

    try {
      await api.patch(`/admin/meeting-requests/${request._id}/status`, payload);
      setSnackbar({ open: true, message: `Meeting request ${type}d successfully!`, severity: 'success' });
      setActionDialog({ open: false, type: '', request: null });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: `Failed to ${type} request`, severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending Approval': return 'warning';
      case 'Rescheduled': return 'info';
      default: return 'default';
    }
  };

  const columns = [
    { field: 'trackingId', headerName: 'Tracking ID', width: 150,
      renderCell: (params) => <strong>{params.value}</strong>
    },
    { field: 'submissionTitle', headerName: 'Project', flex: 1, minWidth: 200 },
    { field: 'requestedBy', headerName: 'Requested By', width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.row.requestedBy}</Typography>
          <Typography variant="caption" color="textSecondary">{params.row.email}</Typography>
        </Box>
      )
    },
    { field: 'meetingPurpose', headerName: 'Purpose', width: 160 },
    { field: 'schedule', headerName: 'Preferred Schedule', width: 200,
      valueGetter: (params) => `${params.row.preferredDate} at ${params.row.preferredTime}`
    },
    { field: 'status', headerName: 'Status', width: 140,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={getStatusColor(params.value)} 
          variant={params.value === 'Pending Approval' ? 'outlined' : 'filled'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.attachmentUrl && (
            <Tooltip title="View Attachment">
              <IconButton size="small" onClick={() => window.open(params.row.attachmentUrl, '_blank')}>
                <AttachmentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'Pending Approval' && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" color="success" onClick={() => handleActionClick('approve', params.row)}>
                  <ApproveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => handleActionClick('reject', params.row)}>
                  <RejectIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reschedule">
                <IconButton size="small" color="info" onClick={() => handleActionClick('reschedule', params.row)}>
                  <RescheduleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#1E293B' }}>Meeting Requests</Typography>
      <Typography variant="body1" sx={{ color: '#64748B', mb: 4 }}>
        Manage and respond to public meeting requests for tracked submissions.
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <DataGrid
          rows={requests}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc', borderBottom: 'none' },
          }}
        />
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', request: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textTransform: 'capitalize' }}>
          {actionDialog.type} Meeting Request
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to {actionDialog.type} the meeting request for <strong>{actionDialog.request?.trackingId}</strong>?
          </Typography>
          
          {actionDialog.type === 'reschedule' && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="New Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              />
              <TextField
                label="New Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setActionDialog({ open: false, type: '', request: null })}>Cancel</Button>
          <Button 
            variant="contained" 
            color={actionDialog.type === 'reject' ? 'error' : 'primary'}
            onClick={submitAction}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingRequestsAdmin;
