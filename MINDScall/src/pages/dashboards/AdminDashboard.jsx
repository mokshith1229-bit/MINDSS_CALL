import React from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Chip, Tooltip, IconButton
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
import DashboardCards from '../../components/DashboardCards';
import DataTable, { StatusChip, UserCell, TypeBadge } from '../../components/DataTable';
import api from '../../utils/api';
import { useVisibility } from '../../context/VisibilityContext';

const recentColumns = [
  {
    field: 'trackingId',
    headerName: 'Tracking ID',
    width: 150,
    renderCell: (row) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
        <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.84rem' }}>
          {row.trackingId || row.businessId || 'N/A'}
        </Typography>
        {row.wbsCode && (
          <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>WBS: {row.wbsCode}</Typography>
        )}
        <TypeBadge type={row.submissionType} />
      </Box>
    ),
  },
  {
    field: 'assignedTo',
    headerName: 'Submitted By',
    renderCell: (row) => (
      <UserCell
        avatar={row.assignedTo && row.assignedTo !== 'Unknown' ? row.assignedTo[0] : '?'}
        name={row.assignedTo}
        subtitle={row.stage}
      />
    ),
  },
  { field: 'subId', headerName: 'Title / Idea' },
  { field: 'lastUpdated', headerName: 'Date' },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (row) => <StatusChip status={row.status} />,
  },
];

const SectionHeader = ({ title, subtitle, action }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#111827' }}>{title}</Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', mt: 0.25 }}>{subtitle}</Typography>
      )}
    </Box>
    {action}
  </Box>
);

const AdminDashboard = () => {
  const { isVisible } = useVisibility();
  const [submissions, setSubmissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [lastRefresh, setLastRefresh] = React.useState(new Date());

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/submissions');
      setSubmissions((res.data.data.submissions || []).filter((s) => s.status !== 'DELETED'));
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const totalSubs = submissions.length;
  const pending = submissions.filter((s) => s.status === 'NEW' || s.status === 'REVIEWING').length;
  const approved = submissions.filter((s) => s.status === 'APPROVED').length;
  const rejected = submissions.filter((s) => s.status === 'REJECTED').length;
  const underReview = submissions.filter((s) => s.status === 'REVIEWING').length;

  const now = new Date();
  const today = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const dynamicStats = [
    {
      id: 'total_subs',
      title: 'Total Submissions',
      value: totalSubs,
      change: '+0%',
      trend: 'up',
      icon: 'ListAlt',
      color: '#1D4ED8',
      bg: '#EFF6FF',
    },
    {
      id: 'approved',
      title: 'Approved',
      value: approved,
      change: '+0%',
      trend: 'up',
      icon: 'CheckCircle',
      color: '#2E7D32',
      bg: '#F0FDF4',
    },
    {
      id: 'under_review',
      title: 'Under Review',
      value: underReview,
      change: '-0%',
      trend: 'down',
      icon: 'HourglassEmpty',
      color: '#D97706',
      bg: '#FFFBEB',
    },
  ];

  const recent = submissions.slice(0, 10).map((s) => ({
    id: s._id,
    trackingId: s.trackingId || s.businessId,
    wbsCode: s.wbsCode,
    businessId: s.businessId,
    submissionType: s.submissionType || s.answers?.submissionType || 'Idea',
    assignedTo: s.answers?.name || 'Unknown',
    stage: s.answers?.department || '',
    subId: s.answers?.title || 'Untitled',
    lastUpdated: new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    status:
      s.status === 'NEW' ? 'Pending' :
      s.status === 'REVIEWING' ? 'Under Review' :
      s.status === 'APPROVED' ? 'Approved' :
      'Rejected',
  }));

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        }}
        elevation={0}
      >
        <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1.25rem' }}>
                  Admin Dashboard
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                  <CalendarIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{today}</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title={`Last refreshed: ${lastRefresh.toLocaleTimeString()}`}>
                <IconButton size="small" onClick={fetchStats} sx={{ color: '#9CA3AF', '&:hover': { color: '#374151' } }}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {isVisible('section.dashboard.kpi_cards') && <DashboardCards dynamicStats={dynamicStats} />}

      <Grid container spacing={3} sx={{ mt: 1, width: '100%', mx: 0 }}>
        {isVisible('section.dashboard.recent_activity') && (
          <Grid xs={12}>
            <Card elevation={0} sx={{ 
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <SectionHeader
                  title="Recent Activity"
                  subtitle="Latest updates requiring your attention"
                  action={
                    <Chip
                      label="Live"
                      size="small"
                      sx={{
                        bgcolor: '#F0FDF4',
                        color: '#2E7D32',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        border: '1px solid #BBF7D0',
                      }}
                    />
                  }
                />
                {recent.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, color: '#9CA3AF' }}>
                    <FolderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography>No recent activities found.</Typography>
                  </Box>
                ) : (
                  <DataTable columns={recentColumns} rows={recent} />
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
