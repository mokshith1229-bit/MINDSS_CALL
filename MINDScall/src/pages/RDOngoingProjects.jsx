import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, TextField, InputAdornment, Button, Chip, Drawer, Grid, Divider, ToggleButtonGroup, ToggleButton,
  FormControl, InputLabel, Select, MenuItem, LinearProgress, IconButton, Tabs, Tab, Avatar, Paper, Slider, Badge, Link
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Search as SearchIcon, Visibility as ViewIcon, BusinessCenter as ProjectIcon, AttachFile as AttachFileIcon, Close as CloseIcon, Send as SendIcon,
  CheckCircle, PlayArrow, Error, Star, Receipt, Timeline, Description, Chat, CloudUpload, Flag
} from '@mui/icons-material';
import { formStore } from '../store/formStore';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ height: '100%', overflowY: 'auto' }}>
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
    </div>
  );
}

const RDOngoingProjects = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSub, setSelectedSub] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState(0);

  // Edit states
  const [editOwner, setEditOwner] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editExpBenefits, setEditExpBenefits] = useState('');
  const [editActBenefits, setEditActBenefits] = useState('');
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateDesc, setNewUpdateDesc] = useState('');
  const [newUpdateProgress, setNewUpdateProgress] = useState(0);
  const [newUpdateFiles, setNewUpdateFiles] = useState([]);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    formStore.init(); // Fetch submissions from database on mount
    const unsub = formStore.subscribe(() => {
      setSubmissions(formStore.getAllSubmissions().filter(s => s.status === 'approved'));
    });
    setSubmissions(formStore.getAllSubmissions().filter(s => s.status === 'approved'));
    return unsub;
  }, []);

  const filteredData = submissions.filter(s => {
    const matchSearch = search.trim() === '' || 
      (s.businessId && s.businessId.toLowerCase().includes(search.toLowerCase())) ||
      (s.trackingId && s.trackingId.toLowerCase().includes(search.toLowerCase())) ||
      (s.parsedTitle && s.parsedTitle.toLowerCase().includes(search.toLowerCase()));
      
    const matchType = filterType === 'all' || 
      (s.submissionType && s.submissionType.toLowerCase() === filterType);
      
    return matchSearch && matchType;
  });

  // KPIs
  const totalApproved = submissions.length;
  const totalIdeas = submissions.filter(s => s.submissionType?.toLowerCase() === 'Idea').length;
  const totalProposals = submissions.filter(s => s.submissionType?.toLowerCase() === 'Proposal').length;
  const activeProjects = submissions.filter(s => {
    const st = s.projectDetails?.implementationStatus;
    return st !== 'Completed' && st !== 'On Hold';
  }).length;

  const getStatusIcon = (status) => {
    if(status === 'Completed') return <CheckCircle fontSize="small" sx={{ color: '#10B981' }} />;
    if(status === 'Near Completion') return <CheckCircle fontSize="small" sx={{ color: '#059669' }} />;
    if(status === 'In Progress' || status === 'Pilot Testing') return <PlayArrow fontSize="small" sx={{ color: '#3B82F6' }} />;
    if(status === 'Planning') return <Flag fontSize="small" sx={{ color: '#F59E0B' }} />;
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
    { field: 'progressPercentage', headerName: 'Progress', width: 150, renderCell: (params) => {
        const val = params.row.projectDetails?.progressPercentage || 0;
        const color = getStatusColor(params.row.projectDetails?.implementationStatus);
        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={val} sx={{ height: 6, borderRadius: 3, bgcolor: '#EDEBE9', '& .MuiLinearProgress-bar': { bgcolor: color } }} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600 }}>{`${val}%`}</Typography>
            </Box>
          </Box>
        );
    }},
    { field: 'updates', headerName: 'Updates', width: 90, renderCell: (params) => {
        const count = params.row.projectDetails?.updates?.length || 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pl: 1 }}>
            <Badge badgeContent={count} color="primary" sx={{ '& .MuiBadge-badge': { right: -3, top: 13, border: `2px solid #fff`, padding: '0 4px' } }}>
              <Chat sx={{ color: count > 0 ? '#0078D4' : '#C8C6C4', fontSize: 20 }} />
            </Badge>
          </Box>
        );
    }},
    { field: 'latestUpdate', headerName: 'Latest Update', flex: 1, minWidth: 200, renderCell: (params) => {
        const updates = params.row.projectDetails?.updates;
        if (!updates || updates.length === 0) return <Typography variant="caption" sx={{ color: '#A19F9D' }}>No updates yet</Typography>;
        const latest = updates[updates.length - 1];
        const title = latest.title || 'Update';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', pt: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#323130', noWrap: true, textOverflow: 'ellipsis', overflow: 'hidden' }}>{title}</Typography>
            <Typography variant="caption" sx={{ color: '#605E5C' }}>{new Date(latest.timestamp).toLocaleDateString()}</Typography>
          </Box>
        );
    }},
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 60,
      getActions: (params) => [
        <GridActionsCellItem icon={<ViewIcon sx={{ color: '#0078D4' }} />} label="View Details" onClick={() => handleOpenDrawer(params.row)} />
      ],
    },
  ];

  const handleOpenDrawer = (sub) => {
    setSelectedSub(sub);
    setEditOwner(sub.projectDetails?.owner || '');
    setEditStatus(sub.projectDetails?.implementationStatus || 'Approved');
    setEditProgress(sub.projectDetails?.progressPercentage || 0);
    setEditExpBenefits(sub.projectDetails?.expectedBenefits || sub.benefits || '');
    setEditActBenefits(sub.projectDetails?.actualBenefits || '');
    setNewUpdateTitle('');
    setNewUpdateDesc('');
    setNewUpdateProgress(sub.projectDetails?.progressPercentage || 0);
    setNewUpdateFiles([]);
    setDrawerTab(0);
    setDrawerOpen(true);
  };

  const handleSaveProjectDetails = async () => {
    if (!selectedSub) return;
    setSavingDetails(true);
    try {
      const details = {
        owner: editOwner,
        implementationStatus: editStatus,
        progressPercentage: editProgress,
        expectedBenefits: editExpBenefits,
        actualBenefits: editActBenefits
      };
      await formStore.updateProjectDetails(selectedSub.id, details);
      const updatedSub = formStore.getAllSubmissions().find(s => s.id === selectedSub.id);
      setSelectedSub(updatedSub);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveProjectUpdate = async () => {
    if (!selectedSub || !newUpdateTitle.trim() || !newUpdateDesc.trim()) return;
    setPostingUpdate(true);
    try {
      const formData = new FormData();
      formData.append('title', newUpdateTitle);
      formData.append('description', newUpdateDesc);
      formData.append('progressPercentage', newUpdateProgress);
      newUpdateFiles.forEach(file => {
        formData.append('attachments', file);
      });
      await formStore.addProjectUpdate(selectedSub.id, formData);
      const updatedSub = formStore.getAllSubmissions().find(s => s.id === selectedSub.id);
      setSelectedSub(updatedSub);
      setNewUpdateTitle('');
      setNewUpdateDesc('');
      setNewUpdateProgress(updatedSub?.projectDetails?.progressPercentage || 0);
      setNewUpdateFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setPostingUpdate(false);
    }
  };

  const recentUpdates = submissions
    .filter(s => s.projectDetails?.updates?.length > 0)
    .flatMap(s => s.projectDetails.updates.map(u => ({ ...u, projectId: s.businessId, title: s.parsedTitle })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA' }}>
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#323130', fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif', mb: 1 }}>
          Ongoing Projects
        </Typography>
        <Typography variant="body1" sx={{ color: '#605E5C' }}>
          Track implementation progress and lifecycle of all approved R&D initiatives.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #0078D4', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Total Approved</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>{totalApproved}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #D97706', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Total Ideas</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>{totalIdeas}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #4338CA', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Total Proposals</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>{totalProposals}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderLeft: '4px solid #10B981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Active Execution</Typography>
            <Typography variant="h4" sx={{ color: '#323130', fontWeight: 700 }}>{activeProjects}</Typography>
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
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#605E5C' }} /></InputAdornment> }}
          sx={{ minWidth: 300, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
        <ToggleButtonGroup value={filterType} exclusive onChange={(e, v) => v && setFilterType(v)} size="small" sx={{ bgcolor: '#fff' }}>
          <ToggleButton value="all" sx={{ px: 3, textTransform: 'none', fontWeight: 500 }}>All</ToggleButton>
          <ToggleButton value="idea" sx={{ px: 3, textTransform: 'none', fontWeight: 500 }}>Ideas</ToggleButton>
          <ToggleButton value="proposal" sx={{ px: 3, textTransform: 'none', fontWeight: 500 }}>Proposals</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Main Content Area */}
      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        <Grid item xs={12} lg={9} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Enhanced Enterprise Table */}
          <Paper sx={{ flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 1, overflow: 'hidden', border: '1px solid #EDEBE9' }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              disableRowSelectionOnClick
              rowHeight={52}
              columnHeaderHeight={48}
              sx={{ 
                border: 'none', 
                bgcolor: '#fff',
                '& .MuiDataGrid-columnHeaders': { bgcolor: '#F3F2F1', borderBottom: '1px solid #EDEBE9', borderRadius: 0 },
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600, color: '#323130' },
                '& .MuiDataGrid-cell': { borderBottom: '1px solid #F3F2F1', color: '#323130' },
                '& .MuiDataGrid-row:hover': { bgcolor: '#F3F2F1' }
              }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Recent Activity */}
          <Paper sx={{ flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 1, border: '1px solid #EDEBE9', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #EDEBE9', bgcolor: '#F3F2F1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130', textTransform: 'uppercase' }}>Recent Updates</Typography>
            </Box>
            <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
              {recentUpdates.length > 0 ? recentUpdates.map((update, idx) => (
                <Box key={idx} sx={{ mb: 3, pb: 2, borderBottom: idx < recentUpdates.length - 1 ? '1px solid #EDEBE9' : 'none' }}>
                  <Typography variant="caption" sx={{ color: '#0078D4', fontWeight: 600, display: 'block', mb: 0.5 }}>{update.projectId}</Typography>
                  <Typography variant="body2" sx={{ color: '#323130', mb: 1, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{update.text}</Typography>
                  <Typography variant="caption" sx={{ color: '#605E5C' }}>{update.user} • {new Date(update.timestamp).toLocaleDateString()}</Typography>
                </Box>
              )) : (
                <Typography variant="body2" sx={{ color: '#605E5C', textAlign: 'center', mt: 4 }}>No recent updates.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 600, lg: 750 }, bgcolor: '#FAFAFA' } }}>
        {selectedSub && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Drawer Header */}
            <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #EDEBE9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#323130' }}>{selectedSub.trackingId || selectedSub.businessId || 'N/A'}</Typography>
                  {selectedSub.wbsCode && <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, mt: 0.5 }}>WBS: {selectedSub.wbsCode}</Typography>}
                  <Chip label={selectedSub.submissionType || 'Idea'} size="small" sx={{ bgcolor: selectedSub.submissionType?.toLowerCase() === 'proposal' ? '#E0E7FF' : '#FEF3C7', color: selectedSub.submissionType?.toLowerCase() === 'proposal' ? '#4338CA' : '#D97706', fontWeight: 600, borderRadius: 1 }} />
                  {getStatusIcon(selectedSub.projectDetails?.implementationStatus)}
                </Box>
                <Typography variant="body1" sx={{ color: '#605E5C', fontWeight: 500 }}>{selectedSub.parsedTitle}</Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#605E5C' }}><CloseIcon /></IconButton>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: '#EDEBE9', bgcolor: '#fff', px: 3 }}>
              <Tabs value={drawerTab} onChange={(e, val) => setDrawerTab(val)} indicatorColor="primary" textColor="primary">
                <Tab icon={<Description sx={{ fontSize: 20 }}/>} iconPosition="start" label="Overview" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab icon={<Chat sx={{ fontSize: 20 }}/>} iconPosition="start" label="Updates" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab icon={<Timeline sx={{ fontSize: 20 }}/>} iconPosition="start" label="Timeline" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab icon={<Star sx={{ fontSize: 20 }}/>} iconPosition="start" label="Benefits" sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab icon={<AttachFileIcon sx={{ fontSize: 20 }}/>} iconPosition="start" label="Attachments" sx={{ textTransform: 'none', fontWeight: 600 }} />
              </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#FAFAFA' }}>
              
              {/* Overview Tab */}
              <TabPanel value={drawerTab} index={0}>
                <Paper sx={{ p: 3, mb: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#323130', fontWeight: 600, mb: 3, textTransform: 'uppercase' }}>Management Details</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Project Owner" size="small" fullWidth value={editOwner} onChange={e => setEditOwner(e.target.value)} placeholder="Assign owner..." />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl size="small" fullWidth disabled>
                        <InputLabel>Status (Auto-calculated)</InputLabel>
                        <Select value={editStatus} label="Status (Auto-calculated)" onChange={e => setEditStatus(e.target.value)}>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Planning">Planning</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Pilot Testing">Pilot Testing</MenuItem>
                          <MenuItem value="Near Completion">Near Completion</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                          <MenuItem value="On Hold">On Hold</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, mb: 1, display: 'block' }}>Implementation Progress ({editProgress}%)</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress variant="determinate" value={editProgress} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#EDEBE9', '& .MuiLinearProgress-bar': { bgcolor: '#0078D4' } }} />
                        <Typography variant="body2" sx={{ width: 80, color: '#605E5C' }}>Auto-synced</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={() => handleSaveProjectDetails()} disabled={savingDetails} sx={{ mt: 2, bgcolor: '#0078D4', textTransform: 'none', boxShadow: 'none' }}>Save Overview Details</Button>
                    </Grid>
                  </Grid>
                </Paper>
                <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
                   <Typography variant="subtitle2" sx={{ color: '#323130', fontWeight: 600, mb: 2, textTransform: 'uppercase' }}>Original Submission Data</Typography>
                   <Grid container spacing={2}>
                     <Grid item xs={12} sm={6}>
                       <Typography variant="caption" sx={{ color: '#605E5C' }}>Submitter</Typography>
                       <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedSub.employeeName} ({selectedSub.employeeCode})</Typography>
                     </Grid>
                     <Grid item xs={12} sm={6}>
                       <Typography variant="caption" sx={{ color: '#605E5C' }}>Department</Typography>
                       <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedSub.dept || 'N/A'}</Typography>
                     </Grid>
                     <Grid item xs={12}>
                       <Typography variant="caption" sx={{ color: '#605E5C' }}>Abstract</Typography>
                       <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedSub.abstract || 'No abstract provided.'}</Typography>
                     </Grid>
                   </Grid>
                </Paper>
              </TabPanel>

              {/* Updates Tab */}
              <TabPanel value={drawerTab} index={1}>
                <Paper sx={{ p: 3, mb: 4, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1, bgcolor: '#F3F2F1' }}>
                  <Typography variant="subtitle2" sx={{ color: '#323130', fontWeight: 600, mb: 2 }}>Post a New Project Update</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField size="small" fullWidth placeholder="Update Title" value={newUpdateTitle} onChange={e => setNewUpdateTitle(e.target.value)} sx={{ bgcolor: '#fff' }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField size="small" fullWidth placeholder="Describe progress, blockers, or next steps..." value={newUpdateDesc} onChange={e => setNewUpdateDesc(e.target.value)} multiline minRows={3} sx={{ bgcolor: '#fff' }} />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="caption" sx={{ color: '#605E5C', display: 'block', mb: 1 }}>Update Overall Progress ({newUpdateProgress}%)</Typography>
                      <Box sx={{ px: 1 }}>
                        <Slider value={newUpdateProgress} onChange={(e, val) => setNewUpdateProgress(val)} step={5} marks min={0} max={100} sx={{ color: '#0078D4' }} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                      <Button component="label" variant="outlined" startIcon={<CloudUpload />} sx={{ textTransform: 'none', color: '#605E5C', borderColor: '#EDEBE9', bgcolor: '#fff' }}>
                        {newUpdateFiles.length > 0 ? `${newUpdateFiles.length} file(s)` : 'Attach Files'}
                        <input type="file" hidden multiple onChange={(e) => setNewUpdateFiles(Array.from(e.target.files))} />
                      </Button>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button variant="contained" endIcon={<SendIcon />} sx={{ px: 4, bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }} onClick={handleSaveProjectUpdate} disabled={!newUpdateTitle.trim() || !newUpdateDesc.trim() || postingUpdate}>
                        {postingUpdate ? 'Posting...' : 'Post Update'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedSub.projectDetails?.updates?.length > 0 ? (
                    [...selectedSub.projectDetails.updates].reverse().map((update, idx) => (
                      <Paper key={idx} sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#0078D4', fontSize: '0.875rem' }}>{(update.updatedBy || update.user || 'U').charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130' }}>{update.title || 'Project Update'}</Typography>
                              <Typography variant="caption" sx={{ color: '#605E5C' }}>{(update.updatedBy || update.user)} • {new Date(update.timestamp).toLocaleString()}</Typography>
                            </Box>
                          </Box>
                          {update.progressPercentage !== undefined && (
                            <Chip label={`${update.progressPercentage}% Progress`} size="small" sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 600 }} />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#323130', pl: 5.5, mb: 2 }}>{update.description || update.text}</Typography>
                        
                        {update.attachments && update.attachments.length > 0 && (
                          <Box sx={{ pl: 5.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {update.attachments.map((att, aIdx) => (
                              <Chip key={aIdx} icon={<AttachFileIcon fontSize="small" />} label={att.filename} size="small" variant="outlined" component="a" href={att.url} target="_blank" clickable sx={{ borderColor: '#EDEBE9', color: '#605E5C' }} />
                            ))}
                          </Box>
                        )}

                      </Paper>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Chat sx={{ fontSize: 40, color: '#C8C6C4', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#605E5C' }}>No updates posted yet.</Typography>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Timeline Tab */}
              <TabPanel value={drawerTab} index={2}>
                <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
                  <Box sx={{ position: 'relative', ml: 1 }}>
                    <Box sx={{ position: 'absolute', top: 10, bottom: 10, left: 5, width: 2, bgcolor: '#EDEBE9' }} />
                    {selectedSub.timeline && selectedSub.timeline.length > 0 ? (
                       [...selectedSub.timeline].reverse().map((event, idx) => (
                         <Box key={idx} sx={{ position: 'relative', pl: 4, pb: 3 }}>
                           <Box sx={{ position: 'absolute', left: 0, top: 4, width: 12, height: 12, borderRadius: '50%', bgcolor: '#0078D4', border: '2px solid #fff', zIndex: 1 }} />
                           <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130' }}>{event.stage}</Typography>
                           <Typography variant="caption" sx={{ color: '#605E5C', display: 'block', mb: 0.5 }}>
                             {new Date(event.timestamp).toLocaleString()} • {event.actionBy || event.actor}
                           </Typography>
                           {event.remarks && (
                             <Typography variant="body2" sx={{ mt: 1, p: 1.5, bgcolor: '#F3F2F1', borderRadius: 1, color: '#323130' }}>
                               {event.remarks}
                             </Typography>
                           )}
                         </Box>
                       ))
                    ) : (
                      <Typography variant="body2" sx={{ color: '#605E5C', pl: 3 }}>No timeline events found.</Typography>
                    )}
                  </Box>
                </Paper>
              </TabPanel>

              {/* Benefits Tab */}
              <TabPanel value={drawerTab} index={3}>
                <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: '#323130', fontWeight: 600, mb: 1 }}>Expected Benefits</Typography>
                      <TextField size="small" fullWidth multiline rows={4} value={editExpBenefits} onChange={e => setEditExpBenefits(e.target.value)} placeholder="Describe the intended ROI, cost savings, or value..." />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: '#323130', fontWeight: 600, mb: 1 }}>Actual Realized Benefits</Typography>
                      <TextField size="small" fullWidth multiline rows={4} value={editActBenefits} onChange={e => setEditActBenefits(e.target.value)} placeholder="Describe the actual value realized post-implementation..." />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" onClick={() => handleSaveProjectDetails()} disabled={savingDetails} sx={{ bgcolor: '#0078D4', textTransform: 'none', boxShadow: 'none' }}>Save Benefits</Button>
                    </Grid>
                  </Grid>
                </Paper>
              </TabPanel>

              {/* Attachments Tab */}
              <TabPanel value={drawerTab} index={4}>
                <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
                  {selectedSub.attachments && selectedSub.attachments.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedSub.attachments.map((att, idx) => (
                         <Grid item xs={12} sm={6} key={idx}>
                           <Box sx={{ p: 2, border: '1px solid #EDEBE9', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                             <AttachFileIcon sx={{ color: '#605E5C' }} />
                             <Box>
                               <Typography variant="body2" sx={{ fontWeight: 600, color: '#323130' }}>{att.name || att.filename || 'Attachment'}</Typography>
                               {att.size && <Typography variant="caption" sx={{ color: '#605E5C' }}>{(att.size / 1024).toFixed(1)} KB</Typography>}
                             </Box>
                           </Box>
                         </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AttachFileIcon sx={{ fontSize: 40, color: '#C8C6C4', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#605E5C' }}>No files attached.</Typography>
                    </Box>
                  )}
                </Paper>
              </TabPanel>

            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default RDOngoingProjects;
