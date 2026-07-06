import React from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Chip, Divider,
  LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import DashboardCards from '../components/DashboardCards';
import DataTable, { StatusChip, UserCell, TypeBadge } from '../components/DataTable';
import api from '../utils/api';

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

const Dashboard = () => {
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
  const implementationRate = totalSubs > 0 ? Math.round((approved / totalSubs) * 100) : 0;

  const now = new Date();
  const today = now.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const dynamicStats = [
    {
      id: 'total_subs',
      title: 'Total Ideas Submitted',
      value: totalSubs,
      change: '+12%',
      trend: 'up',
      icon: 'ListAlt',
      color: '#1D4ED8',
      bg: '#EFF6FF',
    },
    {
      id: 'approved',
      title: 'Approved Ideas',
      value: approved,
      change: '+5%',
      trend: 'up',
      icon: 'CheckCircle',
      color: '#2E7D32',
      bg: '#F0FDF4',
    },
    {
      id: 'under_review',
      title: 'Ideas Under Review',
      value: underReview,
      change: '-2%',
      trend: 'down',
      icon: 'HourglassEmpty',
      color: '#D97706',
      bg: '#FFFBEB',
    },
    {
      id: 'rate',
      title: 'Implementation Rate',
      value: implementationRate + '%',
      change: '+1.5%',
      trend: 'up',
      icon: 'TrendingUp',
      color: '#7C3AED',
      bg: '#F5F3FF',
    },
  ];

  const recent = submissions.map((s) => ({
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

  const dynamicMonthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const nowD = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(nowD.getFullYear(), nowD.getMonth() - i, 1);
      data.push({
        month: months[d.getMonth()],
        monthVal: d.getMonth(),
        yearVal: d.getFullYear(),
        submissions: 0,
        evaluations: 0,
        approvals: 0,
      });
    }
    submissions.forEach((s) => {
      const m = new Date(s.createdAt).getMonth();
      const y = new Date(s.createdAt).getFullYear();
      const bucket = data.find((b) => b.monthVal === m && b.yearVal === y);
      if (bucket) {
        bucket.submissions++;
        if (['REVIEWING', 'APPROVED', 'REJECTED'].includes(s.status)) bucket.evaluations++;
        if (s.status === 'APPROVED') bucket.approvals++;
      }
    });
    return data.map(({ month, submissions, evaluations, approvals }) => ({ month, submissions, evaluations, approvals }));
  }, [submissions]);

  const evaluationPct = totalSubs > 0 ? Math.round((underReview / totalSubs) * 100) : 0;
  const approvedPct = totalSubs > 0 ? Math.round((approved / totalSubs) * 100) : 0;
  const ideasPct = totalSubs > 0 ? Math.round((submissions.filter((s) => !s.answers?.submissionType || s.answers.submissionType.toLowerCase() === 'idea').length / totalSubs) * 100) : 0;
  const onTrackRate = totalSubs > 0 ? Math.round((submissions.filter((s) => s.status !== 'REJECTED').length / totalSubs) * 100) : 100;
  const atRiskRate = 100 - onTrackRate;

  const progressItems = [
    { label: 'Ideas vs Proposals', value: ideasPct, color: '#2E7D32' },
    { label: 'Under Evaluation', value: evaluationPct, color: '#D97706' },
    { label: 'Approved & Active', value: approvedPct, color: '#1D4ED8' },
    { label: 'Implementation Rate', value: implementationRate, color: '#7C3AED' },
  ];

  const customTooltipStyle = {
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    fontSize: 12,
    fontFamily: '"Inter", sans-serif',
  };

  return (
    <Box>
      {/* ── Executive Summary Bar ── */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
        elevation={0}
      >
        <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>
                  Innovation Management Dashboard
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                  <CalendarIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{today}</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {[
                { label: `${totalSubs} Total`, color: '#EFF6FF', textColor: '#1D4ED8', border: '#BFDBFE' },
                { label: `${pending} Pending`, color: '#FFFBEB', textColor: '#D97706', border: '#FDE68A' },
                { label: `${approved} Approved`, color: '#F0FDF4', textColor: '#2E7D32', border: '#BBF7D0' },
              ].map((tag) => (
                <Chip
                  key={tag.label}
                  label={tag.label}
                  size="small"
                  sx={{
                    bgcolor: tag.color,
                    color: tag.textColor,
                    border: `1px solid ${tag.border}`,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                />
              ))}
              <Tooltip title={`Last refreshed: ${lastRefresh.toLocaleTimeString()}`}>
                <IconButton size="small" onClick={fetchStats} sx={{ color: '#9CA3AF', '&:hover': { color: '#374151' } }}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <DashboardCards dynamicStats={dynamicStats} />

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* ── Activity Chart ── */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                title="Innovation Activity Overview"
                subtitle="Monthly submissions, evaluations & approvals"
                action={
                  <Tooltip title="More options">
                    <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              />
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dynamicMonthlyData} barGap={3} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9CA3AF', fontFamily: 'Inter' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9CA3AF', fontFamily: 'Inter' }}
                  />
                  <ReTooltip contentStyle={customTooltipStyle} cursor={{ fill: '#F9FAFB' }} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 16, fontFamily: 'Inter' }}
                  />
                  <Bar dataKey="submissions" name="Submissions" fill="#4CAF50" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="evaluations" name="Evaluations" fill="#60A5FA" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="approvals" name="Approvals" fill="#FBBF24" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Pipeline Progress ── */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                title="Pipeline Health"
                subtitle="Current quarter performance"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 0.5 }}>
                {progressItems.map((item) => (
                  <Box key={item.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: item.color }}>
                        {item.value}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.value}
                      sx={{
                        bgcolor: `${item.color}18`,
                        '& .MuiLinearProgress-bar': { bgcolor: item.color },
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#2E7D32', lineHeight: 1 }}>
                    {onTrackRate}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.4 }}>On Track</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#D97706', lineHeight: 1 }}>
                    {atRiskRate}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.4 }}>At Risk</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#1D4ED8', lineHeight: 1 }}>
                    Q{Math.ceil((now.getMonth() + 1) / 3)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.4 }}>Quarter</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Recent Activities Table ── */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                title="Recent Activities"
                subtitle="Latest innovation submissions and workflow updates"
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
              <DataTable columns={recentColumns} rows={recent} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
