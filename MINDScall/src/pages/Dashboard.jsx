import React from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Avatar, Chip, Paper, Divider,
  LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  ArrowUpward as ArrowUpIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import DashboardCards from '../components/DashboardCards';
import DataTable, { StatusChip, UserCell, TypeBadge } from '../components/DataTable';
import api from '../utils/api';

const recentColumns = [
  { 
    field: 'trackingId', 
    headerName: 'Tracking ID', 
    width: 140, 
    renderCell: (row) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>{row.trackingId || row.businessId || 'N/A'}</Typography>
        {row.wbsCode && <Typography variant="caption" sx={{ color: '#6B7280' }}>WBS: {row.wbsCode}</Typography>}
        <TypeBadge type={row.submissionType} />
      </Box>
    ) 
  },
  {
    field: 'assignedTo',
    headerName: 'User',
    renderCell: (row) => <UserCell avatar={row.assignedTo && row.assignedTo !== 'Unassigned' ? row.assignedTo[0] : '?'} name={row.assignedTo} subtitle={row.stage} />,
  },
  { field: 'subId', headerName: 'Item / Idea' },
  { field: 'lastUpdated', headerName: 'Date' },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (row) => <StatusChip status={row.status} />,
  },
];

const Dashboard = () => {
  const [submissions, setSubmissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/submissions');
        setSubmissions(res.data.data.submissions || []);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalSubs = submissions.length;
  const pending = submissions.filter(s => s.status === 'NEW' || s.status === 'REVIEWING').length;
  const approved = submissions.filter(s => s.status === 'APPROVED').length;
  const implementationRate = totalSubs > 0 ? Math.round((approved / totalSubs) * 100) : 0;

  const dynamicStats = [
    { id: 'total_subs', title: 'Total Submissions', value: totalSubs, change: '+12%', trend: 'up', icon: 'ListAlt', color: '#1565C0', bg: '#E3F2FD' },
    { id: 'pending', title: 'Pending Reviews', value: pending, change: '-2%', trend: 'down', icon: 'HourglassEmpty', color: '#F57C00', bg: '#FFF3E0' },
    { id: 'approved', title: 'Approved Ideas', value: approved, change: '+5%', trend: 'up', icon: 'CheckCircle', color: '#2E7D32', bg: '#E8F5E9' },
    { id: 'rate', title: 'Implementation Rate', value: implementationRate + '%', change: '+1.5%', trend: 'up', icon: 'TrendingUp', color: '#6A1B9A', bg: '#F3E5F5' },
  ];

  const recent = submissions.slice(0, 5).map(s => ({
    id: s._id,
    trackingId: s.trackingId || s.businessId,
    wbsCode: s.wbsCode,
    businessId: s.businessId,
    submissionType: s.submissionType || s.answers?.submissionType || 'Idea',
    assignedTo: s.answers?.name || 'Unknown',
    stage: s.answers?.department || '',
    subId: s.answers?.title || 'Untitled',
    lastUpdated: new Date(s.createdAt).toLocaleDateString(),
    status: s.status === 'NEW' ? 'Pending' :
            s.status === 'REVIEWING' ? 'Under Review' :
            s.status === 'APPROVED' ? 'Approved' : 'Rejected'
  }));

  const dynamicMonthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        month: months[d.getMonth()],
        monthVal: d.getMonth(),
        yearVal: d.getFullYear(),
        submissions: 0,
        evaluations: 0,
        approvals: 0
      });
    }

    submissions.forEach(s => {
      const createdAt = new Date(s.createdAt);
      const m = createdAt.getMonth();
      const y = createdAt.getFullYear();
      
      const bucket = data.find(b => b.monthVal === m && b.yearVal === y);
      if (bucket) {
        bucket.submissions++;
        if (s.status === 'REVIEWING' || s.status === 'APPROVED' || s.status === 'REJECTED') {
          bucket.evaluations++;
        }
        if (s.status === 'APPROVED') {
          bucket.approvals++;
        }
      }
    });

    return data.map(({ month, submissions, evaluations, approvals }) => ({
      month,
      submissions,
      evaluations,
      approvals
    }));
  }, [submissions]);

  const ideasPct = totalSubs > 0 ? Math.round((submissions.filter(s => s.answers?.submissionType?.toLowerCase() === 'idea' || !s.answers?.submissionType).length / totalSubs) * 100) : 0;
  const evaluationPct = totalSubs > 0 ? Math.round((submissions.filter(s => s.status === 'REVIEWING').length / totalSubs) * 100) : 0;
  const approvedPct = totalSubs > 0 ? Math.round((submissions.filter(s => s.status === 'APPROVED').length / totalSubs) * 100) : 0;

  const progressItems = [
    { label: 'Ideas Submitted', value: ideasPct, color: '#2E7D32' },
    { label: 'Under Evaluation', value: evaluationPct, color: '#F57C00' },
    { label: 'Approved & Active', value: approvedPct, color: '#0277BD' },
    { label: 'Implementation Rate', value: implementationRate, color: '#6A1B9A' },
  ];

  const onTrackRate = totalSubs > 0 ? Math.round((submissions.filter(s => s.status !== 'REJECTED').length / totalSubs) * 100) : 100;
  const atRiskRate = totalSubs > 0 ? 100 - onTrackRate : 0;

  return (
    <Box>
      {/* Welcome Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: -60,
            right: 80,
            width: 150,
            height: 150,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.04)',
          },
        }}
      >
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
          Welcome back, Admin 👋
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
          Here's what's happening in your innovation pipeline today — June 5, 2026
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {[
            { label: '12 New Ideas', color: '#A5D6A7' },
            { label: '3 Pending Reviews', color: '#FFCC02' },
            { label: '1 Meeting Today', color: '#80DEEA' },
          ].map((tag) => (
            <Chip
              key={tag.label}
              label={tag.label}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: tag.color, fontWeight: 600, fontSize: '0.75rem', border: `1px solid ${tag.color}30` }}
            />
          ))}
        </Box>
      </Box>

      {/* KPI Cards */}
      <DashboardCards dynamicStats={dynamicStats} />

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* Bar Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Innovation Activity Overview</Typography>
                  <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Monthly ideas, proposals & approvals</Typography>
                </Box>
                <Tooltip title="More options">
                  <IconButton size="small"><MoreIcon /></IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dynamicMonthlyData} barGap={4} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9E9E9E' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9E9E9E' }} />
                  <ReTooltip
                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar dataKey="submissions" name="Submissions" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evaluations" name="Evaluations" fill="#2196F3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approvals" name="Approvals" fill="#FF9800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Pipeline Progress</Typography>
              <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Current quarter performance</Typography>
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {progressItems.map((item) => (
                  <Box key={item.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#37474F' }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: item.color }}>{item.value}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.value}
                      sx={{
                        bgcolor: `${item.color}20`,
                        '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 4 },
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#2E7D32' }}>{onTrackRate}%</Typography>
                  <Typography variant="caption" sx={{ color: '#9E9E9E' }}>On Track</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#F57C00' }}>{atRiskRate}%</Typography>
                  <Typography variant="caption" sx={{ color: '#9E9E9E' }}>At Risk</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0277BD' }}>Q2</Typography>
                  <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Current Quarter</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Area Chart */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Activities</Typography>
                  <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Latest innovation submissions and updates</Typography>
                </Box>
                <Chip label="Live" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '0.72rem' }} />
              </Box>
              <DataTable columns={recentColumns} rows={recent} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
