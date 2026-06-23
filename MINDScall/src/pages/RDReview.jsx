import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, InputAdornment,
  Button, Drawer, IconButton, Chip, Tabs, Tab, Divider, CircularProgress,
  List, ListItem, ListItemButton, ListItemText, Tooltip, Avatar, Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Description as FormIcon,
  Lightbulb as IdeaIcon,
  BusinessCenter as ProposalIcon,
  HourglassEmpty as PendingIcon,
  PictureAsPdf as PdfIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import api from '../utils/api';
import DataTable, { StatusChip } from '../components/DataTable';
import { parseSubmissionFields, formatKey } from '../utils/submissionParser';
import Timeline from '../components/Timeline';

const RDReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('ALL');
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Ideas, 2: Proposals

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  const submissionBrowserRef = useRef(null);
  const drawerContentRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/submissions');
      const subs = res.data.data.submissions || [];
      
      const parsedSubs = subs.map(sub => {
        const parsed = parseSubmissionFields(sub);
        
        // Distinguish Idea vs Proposal
        const formTitle = sub.form?.title || '';
        const isIdea = formTitle.toLowerCase().includes('idea');
        const type = isIdea ? 'Idea' : 'Proposal';

        return { 
          ...sub, 
          parsedTitle: parsed.title, 
          wbsCode: sub.wbsCode,
          abstract: parsed.abstract, 
          dept: parsed.dept, 
          employeeName: parsed.employeeName, 
          employeeCode: parsed.employeeCode, 
          benefits: parsed.benefits, 
          rmValue: parsed.rmValue, 
          hodValue: parsed.hodValue,
          type,
          formName: formTitle,
          formId: sub.form?._id,
          submissionId: `SUB-${sub._id.toString().substring(18).toUpperCase()}`,
          submissionDate: new Date(sub.createdAt).toLocaleDateString()
        };
      });
      
      setSubmissions(parsedSubs);

      // Group by Form
      const formMap = {};
      parsedSubs.forEach(sub => {
        const fId = sub.formId;
        if (!fId) return;
        if (!formMap[fId]) {
          formMap[fId] = {
            id: fId,
            name: sub.formName,
            totalSubmissions: 0,
            totalIdeas: 0,
            totalProposals: 0,
          };
        }
        formMap[fId].totalSubmissions++;
        if (sub.type === 'Idea') formMap[fId].totalIdeas++;
        else formMap[fId].totalProposals++;
      });
      
      setForms(Object.values(formMap));
    } catch (err) {
      console.error('Failed to fetch R&D data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (row) => {
    setSelectedSub(row);
    setDrawerOpen(true);
    setTimeout(() => drawerContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };

  const handleFormSelect = (id) => {
    setSelectedFormId(id);
    setTimeout(() => submissionBrowserRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const filteredSubs = submissions.filter(s => {
    // Filter by Form
    if (selectedFormId !== 'ALL' && s.formId !== selectedFormId) return false;
    // Filter by Type Tab
    if (activeTab === 1 && s.type !== 'Idea') return false;
    if (activeTab === 2 && s.type !== 'Proposal') return false;
    // Search
    if (search) {
      const q = search.toLowerCase();
      return s.parsedTitle.toLowerCase().includes(q) || 
             s.employeeName.toLowerCase().includes(q) ||
             s.submissionId.toLowerCase().includes(q);
    }
    return true;
  });

  const columns = [
    { field: 'submissionId', headerName: 'Sub ID', renderCell: (row) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 600, fontFamily: 'monospace' }}>{row.submissionId}</Typography>
        {row.wbsCode && <Typography variant="caption" sx={{ color: '#90A4AE', fontFamily: 'monospace', fontSize: '0.65rem' }}>{row.wbsCode}</Typography>}
      </Box>
    ) },
    { field: 'parsedTitle', headerName: 'Title' },
    { field: 'employeeName', headerName: 'Employee', renderCell: (row) => `${row.employeeName} (${row.dept})` },
    { field: 'type', headerName: 'Type', renderCell: (row) => (
        <Chip size="small" icon={row.type === 'Idea' ? <IdeaIcon fontSize="small" /> : <ProposalIcon fontSize="small" />} label={row.type} color={row.type === 'Idea' ? 'info' : 'secondary'} variant="outlined" />
    )},
    { field: 'submissionDate', headerName: 'Date' },
    { field: 'status', headerName: 'Status', renderCell: (row) => <StatusChip status={row.status === 'NEW' ? 'Pending' : row.status} /> },
    { field: 'actions', headerName: 'View', renderCell: (row) => (
        <Button size="small" variant="outlined" onClick={() => handleOpenDetails(row)} sx={{ fontSize: '0.7rem' }}>Inspect</Button>
      )
    },
  ];

  const totalForms = forms.length;
  const totalIdeas = submissions.filter(s => s.type === 'Idea').length;
  const totalProposals = submissions.filter(s => s.type === 'Proposal').length;
  const pendingReview = submissions.filter(s => s.status === 'NEW').length;

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#E1F5FE', color: '#0288D1', width: 48, height: 48 }}>
          <ScienceIcon />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2332' }}>R&D Review Center</Typography>
          <Typography variant="body2" sx={{ color: '#546E7A' }}>Browse, inspect, and analyze submitted ideas and proposals.</Typography>
        </Box>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Total Forms', count: totalForms, color: '#0288D1', bg: '#E1F5FE', icon: <FormIcon /> },
          { label: 'Total Ideas', count: totalIdeas, color: '#00897B', bg: '#E0F2F1', icon: <IdeaIcon /> },
          { label: 'Total Proposals', count: totalProposals, color: '#8E24AA', bg: '#F3E5F5', icon: <ProposalIcon /> },
          { label: 'Pending Review', count: pendingReview, color: '#F57C00', bg: '#FFF3E0', icon: <PendingIcon /> },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, bgcolor: s.bg, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: s.color }}>{s.count}</Typography>
                  <Typography variant="body2" sx={{ color: '#78909C', fontWeight: 600, fontSize: '0.75rem' }}>{s.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Left Sidebar - Forms */}
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, height: '100%', minHeight: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E0E0E0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Source Forms</Typography>
              </Box>
              <List disablePadding>
                <ListItem disablePadding divider>
                  <ListItemButton 
                    selected={selectedFormId === 'ALL'} 
                    onClick={() => handleFormSelect('ALL')}
                    sx={{ '&.Mui-selected': { bgcolor: '#E3F2FD' } }}
                  >
                    <ListItemText 
                      primary="All Submissions" 
                      primaryTypographyProps={{ variant: 'body2', fontWeight: selectedFormId === 'ALL' ? 700 : 500 }} 
                    />
                    <Chip size="small" label={submissions.length} sx={{ height: 20, fontSize: '0.65rem' }} />
                  </ListItemButton>
                </ListItem>
                {forms.map(f => (
                  <ListItem disablePadding divider key={f.id}>
                    <ListItemButton 
                      selected={selectedFormId === f.id} 
                      onClick={() => handleFormSelect(f.id)}
                      sx={{ '&.Mui-selected': { bgcolor: '#E3F2FD' } }}
                    >
                      <ListItemText 
                        primary={f.name} 
                        secondary={`${f.totalIdeas} Ideas • ${f.totalProposals} Proposals`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: selectedFormId === f.id ? 700 : 500 }}
                        secondaryTypographyProps={{ variant: 'caption', fontSize: '0.65rem' }}
                      />
                      <Chip size="small" label={f.totalSubmissions} sx={{ height: 20, fontSize: '0.65rem' }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Content - Submissions */}
        <Grid item xs={12} md={9}>
          <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Submission Browser</Typography>
                  <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontWeight: 600 } }}>
                    <Tab label="All" />
                    <Tab label="Ideas" />
                    <Tab label="Proposals" />
                  </Tabs>
                </Box>
                <TextField
                  size="small"
                  placeholder="Search title, ID, or employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  }}
                  sx={{ width: 250 }}
                />
              </Box>

              <Fade in={true} timeout={400}>
                <Box ref={submissionBrowserRef}>
                  <DataTable columns={columns} rows={filteredSubs} />
                </Box>
              </Fade>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Details Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 600 }, bgcolor: '#F8FAFC' } }}>
        {selectedSub && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>R&D Inspection</Typography>
                  <Chip size="small" label="READ ONLY" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#546E7A' }}>{selectedSub.submissionId} • {selectedSub.parsedTitle}</Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
            </Box>

            <Box ref={drawerContentRef} sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PersonIcon sx={{ color: '#0288D1' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Employee Information</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Name</Typography>
                        <Typography variant="body2">{selectedSub.employeeName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Code</Typography>
                        <Typography variant="body2">{selectedSub.employeeCode}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Department</Typography>
                        <Typography variant="body2">{selectedSub.dept}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Submission Date</Typography>
                        <Typography variant="body2">{selectedSub.submissionDate}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: 'none', height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Management Chain</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Reporting Manager</Typography>
                        <Typography variant="body2">{selectedSub.rmValue}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>Head of Department</Typography>
                        <Typography variant="body2">{selectedSub.hodValue}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #BAE6FD', boxShadow: '0 4px 12px rgba(2, 136, 209, 0.05)', height: '100%', bgcolor: '#F0F9FF' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SearchIcon sx={{ color: '#0288D1', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0288D1' }}>Identifiers</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0369A1', mt: 1, letterSpacing: 0.5, fontFamily: 'monospace' }}>{selectedSub.trackingId || selectedSub.submissionId}</Typography>
                    {selectedSub.wbsCode && <Typography variant="body2" sx={{ fontWeight: 700, color: '#0288D1', mt: 0.5, letterSpacing: 0.5, fontFamily: 'monospace' }}>WBS: {selectedSub.wbsCode}</Typography>}
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <FormIcon sx={{ color: '#8E24AA' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Complete Form Details</Typography>
                    </Box>
                    <Grid container spacing={3}>
                      {Object.entries(selectedSub.answers || {}).map(([key, val], idx) => {
                        if (!val || key === 'attachments') return null;
                        return (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Typography variant="caption" sx={{ color: '#9E9E9E', fontWeight: 600 }}>{formatKey(key)}</Typography>
                            <Box sx={{ bgcolor: '#F5F7FA', p: 1.5, borderRadius: 2, mt: 0.5 }}>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#37474F', lineHeight: 1.5 }}>
                                {Array.isArray(val) ? val.join(', ') : val.toString()}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Card>
                </Grid>

                {selectedSub.attachments?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Attachments</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedSub.attachments.map((att, i) => {
                        const fullUrl = att.url ? (att.url.startsWith('http') ? att.url : `${api.defaults.baseURL.replace('/api/v1', '')}${att.url}`) : '#';
                        return (
                          <Chip 
                            key={i} 
                            icon={<PdfIcon />} 
                            label={att.filename || att.name || 'Document'} 
                            variant="outlined" 
                            component="a" 
                            href={fullUrl} 
                            target="_blank" 
                            clickable 
                            sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#F5F5F5' } }}
                          />
                        );
                      })}
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Timeline timeline={selectedSub.timeline} />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default RDReview;
