import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, TextField, InputAdornment, Button, Chip, Grid, ToggleButtonGroup, ToggleButton,
  LinearProgress, IconButton, Avatar, Paper, Badge, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Search as SearchIcon, Visibility as ViewIcon, BusinessCenter as ProjectIcon, CheckCircle, PlayArrow,
  Error, Star, Receipt, Chat, Event, Add as AddIcon, Close as CloseIcon
} from '@mui/icons-material';
import { formStore } from '../store/formStore';
import { authStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const RDOngoingProjects = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const navigate = useNavigate();

  const currentUser = authStore.getState()?.user;

  const defaultProjectData = {
    title: '',
    submissionType: 'Proposal',
    projectOwner: 'chtech.in',
    employeeName: currentUser?.name || '',
    department: currentUser?.department || 'R&D',
    submitterEmail: currentUser?.email || '',
    implementationStatus: 'Approved',
    wbsCode: '',
    abstract: ''
  };

  const [newProjectData, setNewProjectData] = useState(defaultProjectData);

  const handleOpenDialog = () => {
    const user = authStore.getState()?.user;
    setNewProjectData({
      ...defaultProjectData,
      employeeName: user?.name || '',
      department: user?.department || 'R&D',
      submitterEmail: user?.email || '',
    });
    setAttemptedSubmit(false);
    setCreateError('');
    setOpenCreateDialog(true);
  };

  const handleCreateProject = async () => {
    if (!newProjectData.title.trim()) {
      setAttemptedSubmit(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setCreateError('');
      const created = await formStore.createManualProject(newProjectData);
      setOpenCreateDialog(false);
      setNewProjectData(defaultProjectData);
      if (created && created.id) {
        navigate(`/ongoing-projects/${created.id}`);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      setCreateError(err.response?.data?.message || err.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const owner = 'chtech.in';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: '#0078D4', fontSize: '0.75rem' }}>
            {owner.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ color: '#323130' }}>{owner}</Typography>
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#323130', fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif', mb: 1 }}>
            R&D Ongoing Projects
          </Typography>
          <Typography variant="body1" sx={{ color: '#605E5C' }}>
            Track implementation progress and lifecycle of all approved R&D initiatives.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            bgcolor: '#0078D4',
            '&:hover': { bgcolor: '#006CBE' },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderRadius: '6px',
            px: 2.5,
            py: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Add New Project
        </Button>
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

      {/* Create New Project Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => !isSubmitting && setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px', p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: '#EBF3FC',
                color: '#0078D4',
                borderRadius: '8px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ProjectIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B' }}>
                Add New R&D Project
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Enter initial details. Full workspace and tabs will be available immediately.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setOpenCreateDialog(false)} disabled={isSubmitting} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
          {createError && (
            <Alert severity="error" onClose={() => setCreateError('')}>
              {createError}
            </Alert>
          )}

          <TextField
            autoFocus
            label="Project Title"
            placeholder="e.g., High-Efficiency Heat Exchanger Redesign"
            required
            fullWidth
            size="small"
            value={newProjectData.title}
            onChange={(e) => setNewProjectData({ ...newProjectData, title: e.target.value })}
            error={!newProjectData.title.trim() && attemptedSubmit}
            helperText={!newProjectData.title.trim() && attemptedSubmit ? 'Project Title is required' : ''}
          />

          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="submission-type-label">Submission Type</InputLabel>
                <Select
                  labelId="submission-type-label"
                  label="Submission Type"
                  value={newProjectData.submissionType}
                  onChange={(e) => setNewProjectData({ ...newProjectData, submissionType: e.target.value })}
                >
                  <MenuItem value="Proposal">Proposal</MenuItem>
                  <MenuItem value="Idea">Idea</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="initial-status-label">Initial Status</InputLabel>
                <Select
                  labelId="initial-status-label"
                  label="Initial Status"
                  value={newProjectData.implementationStatus}
                  onChange={(e) => setNewProjectData({ ...newProjectData, implementationStatus: e.target.value })}
                >
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Pilot Testing">Pilot Testing</MenuItem>
                  <MenuItem value="Not Started">Not Started</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField
                label="Department"
                placeholder="e.g., Process Development"
                fullWidth
                size="small"
                value={newProjectData.department}
                onChange={(e) => setNewProjectData({ ...newProjectData, department: e.target.value })}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                label="Project Owner / Lead"
                placeholder="e.g., chtech.in"
                fullWidth
                size="small"
                value={newProjectData.projectOwner}
                onChange={(e) => setNewProjectData({ ...newProjectData, projectOwner: e.target.value })}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField
                label="Submitter / Lead Name"
                placeholder="e.g., Dr. Rajesh Kumar"
                fullWidth
                size="small"
                value={newProjectData.employeeName}
                onChange={(e) => setNewProjectData({ ...newProjectData, employeeName: e.target.value })}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                label="WBS Code (Optional)"
                placeholder="Auto-generated if blank (e.g. MCP-012)"
                fullWidth
                size="small"
                value={newProjectData.wbsCode}
                onChange={(e) => setNewProjectData({ ...newProjectData, wbsCode: e.target.value })}
              />
            </Grid>
          </Grid>

          <TextField
            label="Initial Abstract / Overview (Optional)"
            placeholder="Brief summary of the initiative, background, or goals..."
            multiline
            rows={3}
            fullWidth
            size="small"
            value={newProjectData.abstract}
            onChange={(e) => setNewProjectData({ ...newProjectData, abstract: e.target.value })}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            disabled={isSubmitting}
            sx={{ textTransform: 'none', color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
            sx={{
              bgcolor: '#0078D4',
              '&:hover': { bgcolor: '#006CBE' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '6px',
              px: 2.5
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create & Open Workspace'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RDOngoingProjects;
