import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Grid, TextField, MenuItem, Button,
  Snackbar, Alert, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL;
const TRACKING_BASE_URL = window.location.origin + '/public-tracking?id=';

const TrackingManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [kpis, setKpis] = useState({ totalTrackingIds: 0, activeSubmissions: 0, completedSubmissions: 0, archivedSubmissions: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/developer/tracking`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data.trackingData);
        setKpis(res.data.data.kpis);
      }
    } catch (err) {
      console.error('Failed to fetch tracking data', err);
      setSnackbar({ open: true, message: 'Failed to load tracking data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (trackingId, actionName) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/developer/tracking/log`, {
        trackingId,
        action: actionName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to log action', err);
    }
  };

  const handleCopyLink = (trackingId) => {
    const link = `${TRACKING_BASE_URL}${trackingId}`;
    navigator.clipboard.writeText(link);
    setSnackbar({ open: true, message: 'Tracking Link Copied Successfully', severity: 'success' });
    logAction(trackingId, 'Copied Tracking Link');
  };

  const handleOpenLink = (trackingId) => {
    const link = `${TRACKING_BASE_URL}${trackingId}`;
    window.open(link, '_blank');
    logAction(trackingId, 'Opened Tracking Page');
  };

  const handleViewSubmission = (submissionId, trackingId) => {
    navigate(`/admin/submissions/${submissionId}`);
    logAction(trackingId, 'Viewed Submission');
  };

  const handleExportCSV = () => {
    const headers = [
      'Tracking ID', 'Submission Type', 'Submission Title', 'Employee Name', 
      'Department', 'Workflow Stage', 'Status', 'Tracking Link', 'Created Date'
    ];
    
    const csvRows = [headers.join(',')];
    
    filteredData.forEach(row => {
      const link = `${TRACKING_BASE_URL}${row.trackingId}`;
      const values = [
        row.trackingId,
        row.submissionType,
        `"${row.submissionTitle.replace(/"/g, '""')}"`,
        `"${row.employeeName.replace(/"/g, '""')}"`,
        `"${row.department.replace(/"/g, '""')}"`,
        row.workflowStage,
        row.status,
        link,
        new Date(row.createdAt).toLocaleDateString()
      ];
      csvRows.push(values.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Tracking_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    if (['APPROVED', 'FINANCE_APPROVED', 'APPROVAL_COMMITTEE', 'COMPLETED'].includes(status)) return '#10B981';
    if (['REJECTED', 'EVALUATION_REJECTED'].includes(status)) return '#EF4444';
    if (['REVIEWING', 'AWAITING_RM_REVIEW', 'RM_REVIEW', 'AWAITING_HOD_REVIEW', 'HOD_REVIEW', 'EVALUATION'].includes(status)) return '#F59E0B';
    return '#64748B';
  };

  // Filter Logic
  const filteredData = data.filter(row => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      row.trackingId?.toLowerCase().includes(searchLower) ||
      row.submissionTitle?.toLowerCase().includes(searchLower) ||
      row.employeeName?.toLowerCase().includes(searchLower) ||
      row.employeeId?.toLowerCase().includes(searchLower) ||
      row.department?.toLowerCase().includes(searchLower) ||
      row.wbsCode?.toLowerCase().includes(searchLower);

    // 2. Filter Type
    const matchesType = filterType === 'All' || 
      (filterType === 'Ideas' && row.submissionType === 'Idea') ||
      (filterType === 'Proposals' && row.submissionType === 'Proposal');

    // 3. Filter Status
    const matchesStatus = filterStatus === 'All' || row.workflowStage === filterStatus || row.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const columns = [
    { field: 'trackingId', headerName: 'Tracking ID', width: 150, renderCell: (params) => (<strong>{params.value}</strong>) },
    { field: 'submissionType', headerName: 'Type', width: 100 },
    { field: 'submissionTitle', headerName: 'Submission Title', width: 250 },
    { field: 'employeeName', headerName: 'Submitted By', width: 150 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'workflowStage', headerName: 'Workflow Stage', width: 180 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ 
          bgcolor: `${getStatusColor(params.value)}15`, 
          color: getStatusColor(params.value), 
          px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700 
        }}>
          {params.value}
        </Box>
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Created Date', 
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Copy Tracking Link">
            <IconButton size="small" onClick={() => handleCopyLink(params.row.trackingId)} sx={{ color: '#64748B' }}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open Tracking Page">
            <IconButton size="small" onClick={() => handleOpenLink(params.row.trackingId)} sx={{ color: '#2563EB' }}>
              <OpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Submission">
            <IconButton size="small" onClick={() => handleViewSubmission(params.row._id, params.row.trackingId)} sx={{ color: '#2E7D32' }}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>Tracking Management</Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>Search and manage existing tracking links for Ideas and Proposals.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={handleExportCSV}
          sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          Export to Excel
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Tracking IDs', value: kpis.totalTrackingIds, color: '#3B82F6' },
          { title: 'Active Submissions', value: kpis.activeSubmissions, color: '#F59E0B' },
          { title: 'Completed Submissions', value: kpis.completedSubmissions, color: '#10B981' },
          { title: 'Archived Submissions', value: kpis.archivedSubmissions, color: '#64748B' }
        ].map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>{kpi.title}</Typography>
              <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 800 }}>{kpi.value}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters and Table Card */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        
        {/* Filter Bar */}
        <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search Tracking ID, Title, Name, WBS..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '300px' }}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1 }} /> }}
          />
          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: '150px' }}
          >
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Ideas">Ideas</MenuItem>
            <MenuItem value="Proposals">Proposals</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: '220px' }}
          >
            <MenuItem value="All">All Stages</MenuItem>
            <MenuItem value="NEW">Pending</MenuItem>
            <MenuItem value="RM Review">RM Review</MenuItem>
            <MenuItem value="HOD Review">HOD Review</MenuItem>
            <MenuItem value="Evaluation Committee">Evaluation Committee</MenuItem>
            <MenuItem value="Finance Review Completed">Finance Review</MenuItem>
            <MenuItem value="Approval Committee">Approval Committee</MenuItem>
            <MenuItem value="R&D Ongoing">R&D Ongoing</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </Box>

        {/* DataGrid */}
        <Box sx={{ height: 600, width: '100%', bgcolor: '#FFFFFF' }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': { bgcolor: '#F8FAFC', color: '#475569', fontWeight: 700 },
              '& .MuiDataGrid-row:hover': { bgcolor: '#F1F5F9' },
            }}
          />
        </Box>
      </Card>

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

export default TrackingManagement;
