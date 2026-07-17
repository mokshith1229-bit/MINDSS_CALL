import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Paper, Chip, IconButton,
  TextField, InputAdornment, LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  AssignmentTurnedIn as CompletedIcon,
  Update as InProgressIcon,
  Dashboard as TotalIcon,
  Science as PilotIcon
} from '@mui/icons-material';
import DataTable from '../components/DataTable';
import api from '../utils/api';
import { parseSubmissionFields } from '../utils/submissionParser';

const KPICard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111C2D' }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: `${color}15`, color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ProgressBar = ({ value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    <Box sx={{ width: '100%', mr: 1 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#E2E8F0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: value === 100 ? '#2E7D32' : '#1976D2',
            borderRadius: 4,
          }
        }}
      />
    </Box>
    <Box sx={{ minWidth: 35 }}>
      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 700 }}>
        {`${Math.round(value)}%`}
      </Typography>
    </Box>
  </Box>
);

const PilotProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/pilot-projects');
      const data = res.data.data.projects || [];
      
      const formatted = data.map(p => {
        const sub = p.submissionId;
        const parsed = sub ? parseSubmissionFields(sub) : {};
        
        return {
          id: p._id,
          submissionId: sub ? sub._id : '',
          projectId: sub ? (sub.businessId || `PRJ-${sub._id.toString().substring(18).toUpperCase()}`) : 'N/A',
          title: parsed.title || 'Untitled Project',
          department: parsed.dept || 'N/A',
          owner: parsed.employeeName || 'Unassigned',
          phase: p.currentPhase || 'Approved',
          progress: p.progress || 0,
          startDate: sub ? new Date(sub.createdAt).toLocaleDateString() : 'N/A',
          expectedCompletion: p.finalReport?.completionDate ? new Date(p.finalReport.completionDate).toLocaleDateString() : 'TBD',
          status: p.currentPhase === 'Completed' ? 'Completed' : 'In Progress',
          raw: p
        };
      });

      setProjects(formatted);
    } catch (err) {
      console.error('Failed to load pilot projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.projectId.toLowerCase().includes(search.toLowerCase()) ||
    p.owner.toLowerCase().includes(search.toLowerCase()) ||
    p.department.toLowerCase().includes(search.toLowerCase())
  );

  const kpis = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'In Progress').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    avgProgress: projects.length ? Math.round(projects.reduce((a, b) => a + b.progress, 0) / projects.length) : 0,
    pilotStudies: projects.filter(p => p.phase === 'Pilot Study' || p.phase === 'Pilot Successful').length
  };

  const columns = [
    { field: 'projectId', headerName: 'Project ID', sortable: true },
    { field: 'title', headerName: 'Project Title', sortable: true, renderCell: (r) => (
      <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 250 }} noWrap title={r.title}>
        {r.title}
      </Typography>
    )},
    { field: 'department', headerName: 'Department', sortable: true },
    { field: 'owner', headerName: 'Owner', sortable: true },
    { field: 'phase', headerName: 'Current Phase', sortable: true, renderCell: (r) => (
      <Chip 
        label={r.phase} 
        size="small" 
        sx={{ 
          fontWeight: 600, 
          backgroundColor: '#F1F5F9', 
          color: '#334155' 
        }} 
      />
    )},
    { field: 'progress', headerName: 'Progress', sortable: true, renderCell: (r) => <ProgressBar value={r.progress} /> },
    { field: 'startDate', headerName: 'Start Date', sortable: true },
    { field: 'status', headerName: 'Status', sortable: true, renderCell: (r) => (
      <Chip 
        label={r.status} 
        size="small" 
        sx={{ 
          fontWeight: 700, 
          backgroundColor: r.status === 'Completed' ? '#E8F5E9' : '#E3F2FD', 
          color: r.status === 'Completed' ? '#2E7D32' : '#1565C0' 
        }} 
      />
    )},
    { field: 'actions', headerName: 'Workspace', align: 'center', renderCell: (r) => (
      <IconButton 
        color="primary" 
        onClick={() => navigate(`/pilot-projects/${r.id}`)}
        sx={{ backgroundColor: '#F0F4F8', '&:hover': { backgroundColor: '#E2E8F0' } }}
      >
        <ViewIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#111C2D' }}>
        Pilot Projects Workspace
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title="Total Projects" value={kpis.total} icon={<TotalIcon />} color="#64748B" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title="In Progress" value={kpis.inProgress} icon={<InProgressIcon />} color="#0284C7" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title="Completed" value={kpis.completed} icon={<CompletedIcon />} color="#16A34A" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title="Avg Progress" value={`${kpis.avgProgress}%`} icon={<TotalIcon />} color="#8B5CF6" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title="Pilot Studies" value={kpis.pilotStudies} icon={<PilotIcon />} color="#EA580C" />
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
            Project Execution Portfolio
          </Typography>
          <TextField
            size="small"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
            sx={{ width: 300, backgroundColor: '#F8FAFC', borderRadius: 1 }}
          />
        </Box>
        <DataTable
          columns={columns}
          rows={filtered}
        />
      </Paper>
    </Box>
  );
};

export default PilotProjectsList;
