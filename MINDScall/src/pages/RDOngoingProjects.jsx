import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, TextField, InputAdornment, Button, Chip, Grid, ToggleButtonGroup, ToggleButton,
  LinearProgress, IconButton, Avatar, Paper, Badge
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Search as SearchIcon, Visibility as ViewIcon, BusinessCenter as ProjectIcon, CheckCircle, PlayArrow, Error, Star, Receipt, Chat, Event
} from '@mui/icons-material';
import { formStore } from '../store/formStore';
import { useNavigate } from 'react-router-dom';

const RDOngoingProjects = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    formStore.init();
    const unsub = formStore.subscribe(() => {
      setSubmissions(formStore.getAllSubmissions().filter(s => s.status === 'approved' || s.projectDetails?.implementationStatus));
    });
    setSubmissions(formStore.getAllSubmissions().filter(s => s.status === 'approved' || s.projectDetails?.implementationStatus));
    return unsub;
  }, []);

  const filteredData = submissions.filter(s => {
    const matchSearch = search.trim() === '' || 
      (s.businessId && s.businessId.toLowerCase().includes(search.toLowerCase())) ||
      (s.trackingId && s.trackingId.toLowerCase().includes(search.toLowerCase())) ||
      (s.parsedTitle && s.parsedTitle.toLowerCase().includes(search.toLowerCase()));
      
    const status = s.projectDetails?.implementationStatus || 'Approved';
    const matchType = filterType === 'all' || 
      (filterType === 'ongoing' && ['In Progress', 'Pilot Testing', 'Near Completion'].includes(status)) ||
      (filterType === 'pending' && ['Approved', 'Not Started', 'Planning'].includes(status)) ||
      (filterType === 'completed' && status === 'Completed');
      
    return matchSearch && matchType;
  });

  const totalApproved = submissions.length;
  const activeProjects = submissions.filter(s => {
    const st = s.projectDetails?.implementationStatus;
    return st === 'In Progress' || st === 'Pilot Testing' || st === 'Near Completion';
  }).length;
  const pendingProjects = submissions.filter(s => {
    const st = s.projectDetails?.implementationStatus || 'Approved';
    return ['Approved', 'Not Started', 'Planning'].includes(st);
  }).length;
  const completedProjects = submissions.filter(s => s.projectDetails?.implementationStatus === 'Completed').length;

  const getStatusIcon = (status) => {
    if(status === 'Completed') return <CheckCircle fontSize="small" sx={{ color: '#10B981' }} />;
    if(status === 'Near Completion') return <CheckCircle fontSize="small" sx={{ color: '#059669' }} />;
    if(status === 'In Progress' || status === 'Pilot Testing') return <PlayArrow fontSize="small" sx={{ color: '#3B82F6' }} />;
    if(status === 'Planning') return <Star fontSize="small" sx={{ color: '#F59E0B' }} />;
    if(status === 'On Hold') return <Error fontSize="small" sx={{ color: '#EF4444' }} />;
    return <CheckCircle fontSize="small" sx={{ color: '#6B7280' }} />;
  };

  const getStatusColor = (status) => {
    if(status === 'Completed') return '#10B981';
    if(status === 'Near Completion') return '#059669';
    if(status === 'In Progress' || status === 'Pilot Testing') return '#3B82F6';
    if(status === 'Planning') return '#F59E0B';
    if(status === 'On Hold') return '#EF4444';
    return '#6B7280';
  };

  const columns = [
    { field: 'trackingId', headerName: 'Tracking ID', width: 140, renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0078D4' }}>{params.value || params.row.businessId || 'N/A'}</Typography>
        {params.row.wbsCode && <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600 }}>{params.row.wbsCode}</Typography>}
      </Box>
    )},
    { field: 'submissionType', headerName: 'Type', width: 120, renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {params.value === 'Proposal' ? <Receipt fontSize="small" sx={{ color: '#4338CA' }} /> : <Star fontSize="small" sx={{ color: '#D97706' }} />}
        <Typography variant="body2">{params.value || 'Unknown'}</Typography>
      </Box>
    )},
    { field: 'parsedTitle', headerName: 'Project Title', flex: 1, minWidth: 250, renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 600, color: '#323130' }}>{params.value || 'Untitled'}</Typography> },
    { field: 'projectOwner', headerName: 'Owner', width: 180, renderCell: (params) => {
      const owner = params.row.projectDetails?.owner || 'Unassigned';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: owner === 'Unassigned' ? '#e1dfdd' : '#0078D4', fontSize: '0.75rem' }}>
            {owner === 'Unassigned' ? '?' : owner.charAt(0)}
          </Avatar>
          <Typography variant="body2" sx={{ color: owner === 'Unassigned' ? '#a19f9d' : '#323130' }}>{owner}</Typography>
        </Box>
      );
    }},
    { field: 'implementationStatus', headerName: 'Status', width: 150, renderCell: (params) => {
        const status = params.row.projectDetails?.implementationStatus || 'Approved';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(status)}
            <Typography variant="body2" sx={{ color: '#323130', fontWeight: 500 }}>{status}</Typography>
          </Box>
        );
    }},

    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 60,
      getActions: (params) => [
        <GridActionsCellItem icon={<ViewIcon sx={{ color: '#0078D4' }} />} label="View Project Workspace" onClick={() => navigate(`/ongoing-projects/${params.row.id}`)} />
      ],
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA' }}>
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#323130', fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif', mb: 1 }}>
          R&D Ongoing Projects
        </Typography>
        <Typography variant="body1" sx={{ color: '#605E5C' }}>
          Track implementation progress and lifecycle of all approved R&D initiatives.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #0078D4', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Total Portfolio</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>{totalApproved}</Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #F59E0B', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Initiation Pending</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>{pendingProjects}</Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #3B82F6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Active Execution</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>{activeProjects}</Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #10B981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Completed</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>{completedProjects}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Command Bar / Filters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by ID or Title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#605E5C' }} /></InputAdornment> } }}
          sx={{ minWidth: 300, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
        <ToggleButtonGroup value={filterType} exclusive onChange={(e, v) => v && setFilterType(v)} size="small" sx={{ bgcolor: '#fff' }}>
          <ToggleButton value="all" sx={{ px: 3, textTransform: 'none', fontWeight: 500 }}>All</ToggleButton>
          <ToggleButton value="pending" sx={{ px: 3, textTransform: 'none', fontWeight: 500 }}>Initiation Pending</ToggleButton>
          <ToggleButton value="ongoing" sx={{ px: 3, textTransform: 'none', fontWeight: 500 }}>Ongoing</ToggleButton>
          <ToggleButton value="completed" sx={{ px: 3, textTransform: 'none', fontWeight: 500 }}>Completed</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Main Content Area */}
      <Paper sx={{ flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 1, overflow: 'hidden', border: '1px solid #EDEBE9' }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          disableRowSelectionOnClick
          rowHeight={52}
          columnHeaderHeight={48}
          onRowClick={(params) => navigate(`/ongoing-projects/${params.row.id}`)}
          sx={{ 
            border: 'none', 
            bgcolor: '#fff',
            cursor: 'pointer',
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#F3F2F1', borderBottom: '1px solid #EDEBE9', borderRadius: 0 },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600, color: '#323130' },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #F3F2F1', color: '#323130' },
            '& .MuiDataGrid-row:hover': { bgcolor: '#F3F2F1' }
          }}
        />
      </Paper>
    </Box>
  );
};

export default RDOngoingProjects;
