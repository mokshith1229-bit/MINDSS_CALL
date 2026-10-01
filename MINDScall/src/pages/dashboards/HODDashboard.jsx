import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Button,
  Tooltip, IconButton, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, LinearProgress, Skeleton
} from '@mui/material';
import {
  NotificationsOutlined as NotificationsIcon,
  Refresh as RefreshIcon,
  AssignmentOutlined as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  PlayArrowOutlined as PlayArrowIcon,
  FolderOpenOutlined as FolderIcon,
  EventOutlined as EventIcon,
  HistoryOutlined as HistoryIcon,
  OpenInNew as OpenInNewIcon,
  ArrowForward as ArrowForwardIcon,
  TaskAlt as TaskAltIcon,
  CancelOutlined as CancelIcon,
  Help as HelpOutlineIcon,
  ScienceOutlined as ScienceIcon,
  EmailOutlined as EmailIcon,
  CalendarMonthOutlined as CalendarIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { authStore } from '../../store/authStore';
import { parseSubmissionFields } from '../../utils/submissionParser';

// -- Theme Constants --
const COLORS = {
  green: '#2E7D32',
  greenBg: '#F0FDF4',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  blue: '#1D4ED8',
  blueBg: '#EFF6FF',
  red: '#DC2626',
  redBg: '#FEF2F2',
  slate: '#64748B',
  slateBg: '#F8FAFC',
  border: '#E2E8F0',
  textMain: '#0F172A',
  textMuted: '#64748B'
};

const CardStyle = {
  borderRadius: '18px',
  background: '#FFFFFF',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.02)',
  height: '100%'
};

const HODDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authStore.getState().user);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const unsub = authStore.subscribe((state) => setCurrentUser(state.user));
    return unsub;
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/submissions');
      const allSubs = res.data.data.submissions || [];
      const user = authStore.getState().user;
      
      const filtered = allSubs.filter(s => {
        if (s.status === 'DELETED') return false;
        
        const parsed = parseSubmissionFields(s);
        const submissionHodEmail = (parsed.hodEmail || '').toLowerCase().trim();
        const myEmail = (user?.email || '').toLowerCase().trim();
        
        // Let SUPER_ADMIN / DEVELOPER see all submissions on this dashboard
        if (user?.role === 'SUPER_ADMIN' || user?.role === 'DEVELOPER') return true;
        
        return submissionHodEmail === myEmail;
      });

      setSubmissions(filtered);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load HOD dashboard data', err);
      setError('Unable to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const now = new Date();
  const todayFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // -- Metrics Calculation --
  const pendingReviewsList = submissions.filter(s => {
    const decision = s.workflow?.hodReview?.decision;
    return decision === 'PENDING' || ['AWAITING_HOD_REVIEW', 'HOD_REVIEW'].includes(s.status);
  });
  const pendingCount = pendingReviewsList.length;

  const reviewedTotal = submissions.filter(s => {
    const dec = s.workflow?.hodReview?.decision;
    return dec && dec !== 'PENDING';
  }).length;

  const approvedTotal = submissions.filter(s => {
    return s.workflow?.hodReview?.decision === 'APPROVED';
  }).length;

  const activeProjectsList = submissions.filter(s => {
    const pStatus = s.projectDetails?.implementationStatus;
    return pStatus && ['Planning', 'In Progress', 'Pilot Testing', 'Near Completion'].includes(pStatus);
  });
  const activeProjectsCount = activeProjectsList.length;

  // -- Review Overview Chart Data --
  const reviewStats = { PENDING: 0, APPROVED: 0, REJECTED: 0, CLARIFICATION: 0 };
  let hasReviewData = false;
  submissions.forEach(s => {
    const decision = s.workflow?.hodReview?.decision;
    if (decision && reviewStats[decision] !== undefined) {
      reviewStats[decision]++;
      if (decision !== 'PENDING') hasReviewData = true;
    } else if (['AWAITING_HOD_REVIEW', 'HOD_REVIEW'].includes(s.status)) {
      reviewStats.PENDING++;
    }
  });
  
  const chartData = [
    { name: 'Pending', value: reviewStats.PENDING, color: COLORS.amber },
    { name: 'Approved', value: reviewStats.APPROVED, color: COLORS.green },
    { name: 'Rejected', value: reviewStats.REJECTED, color: COLORS.red },
    { name: 'Clarification', value: reviewStats.CLARIFICATION, color: COLORS.blue }
  ].filter(d => d.value > 0);

  // -- Upcoming Activities --
  const upcomingActivities = submissions.flatMap(s => 
    (s.projectDetails?.meetings || []).filter(m => m.status === 'Scheduled').map(m => ({
      ...m,
      trackingId: s.trackingId || s.businessId,
      projectTitle: s.answers?.title || 'Untitled'
    }))
  ).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 4);

  // -- Recent HOD Activity --
  const recentActivities = [];
  submissions.forEach(s => {
    const hodReview = s.workflow?.hodReview;
    if (hodReview && ['APPROVED', 'REJECTED'].includes(hodReview.decision)) {
      recentActivities.push({
        type: hodReview.decision,
        trackingId: s.trackingId || s.businessId,
        title: s.answers?.title || 'Untitled',
        timestamp: hodReview.timestamp || s.updatedAt,
        remarks: hodReview.remarks
      });
    }
  });
  recentActivities.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  const topActivities = recentActivities.slice(0, 4);

  // -- Helper Components --
  const SectionTitle = ({ title, subtitle, action }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.textMain }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: '0.8rem', color: COLORS.textMuted, mt: 0.3 }}>{subtitle}</Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );

  const KpiCard = ({ title, value, subtitle, icon, color, bg }) => (
    <Card elevation={0} sx={{ ...CardStyle, p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.textMuted, mb: 1 }}>{title}</Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: COLORS.textMain, lineHeight: 1 }}>
            {loading ? <Skeleton width={60} /> : value ?? '--'}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: COLORS.textMuted, mt: 1.5 }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: bg, p: 1.2, borderRadius: '12px', display: 'flex' }}>
          {React.cloneElement(icon, { sx: { color: color, fontSize: 22 } })}
        </Box>
      </Box>
    </Card>
  );

  const getDaysAgo = (date) => {
    if (!date) return '--';
    const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Today' : `${diff}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED': return { bg: COLORS.greenBg, text: COLORS.green };
      case 'REJECTED': return { bg: COLORS.redBg, text: COLORS.red };
      case 'PENDING':
      case 'PLANNING':
      case 'AWAITING_HOD_REVIEW': return { bg: COLORS.amberBg, text: COLORS.amber };
      default: return { bg: COLORS.blueBg, text: COLORS.blue };
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', minWidth: 0, pb: 6 }}>
      
      {/* ── HEADER ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: COLORS.textMain, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
            Good Morning, {currentUser?.name || 'HOD'}
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textMuted, mt: 0.5, fontWeight: 500 }}>
            Review innovation initiatives and monitor R&D activities.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.textMuted }}>
            {todayFormatted}
          </Typography>
          <Tooltip title="Notifications">
            <IconButton sx={{ border: `1px solid ${COLORS.border}`, bgcolor: '#FFF' }}>
              <NotificationsIcon fontSize="small" sx={{ color: COLORS.slate }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchDashboardData} sx={{ border: `1px solid ${COLORS.border}`, bgcolor: '#FFF' }}>
              <RefreshIcon fontSize="small" sx={{ color: COLORS.slate }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── ERROR STATE ── */}
      {error && (
        <Box sx={{ bgcolor: COLORS.redBg, color: COLORS.red, p: 2, borderRadius: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${COLORS.red}30` }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</Typography>
          <Button size="small" variant="outlined" color="error" onClick={fetchDashboardData}>Retry</Button>
        </Box>
      )}

      {/* ── QUICK ACTIONS ── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
        {[
          { label: 'Review Submissions', icon: <AssignmentIcon fontSize="small"/>, path: '/rd-review' },
          { label: 'R&D Projects', icon: <FolderIcon fontSize="small"/>, path: '/rd-ongoing-projects' },
          { label: 'Pilot Projects', icon: <ScienceIcon fontSize="small"/>, path: '/pilot-projects' },
          { label: 'Meeting Requests', icon: <EmailIcon fontSize="small"/>, path: '/meeting-requests' },
          { label: 'Lab Calendar', icon: <CalendarIcon fontSize="small"/>, path: '/lab-calendar' }
        ].map(action => (
          <Button
            key={action.label}
            variant="outlined"
            startIcon={action.icon}
            onClick={() => navigate(action.path)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              borderColor: COLORS.border,
              color: COLORS.textMain,
              fontWeight: 600,
              bgcolor: '#FFF',
              '&:hover': { bgcolor: COLORS.slateBg, borderColor: COLORS.slate }
            }}
          >
            {action.label}
          </Button>
        ))}
      </Box>

      {/* ── KPI SECTION ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: '20px', mb: 4 }}>
        <KpiCard 
          title="Pending Reviews" 
          value={pendingCount} 
          subtitle="Awaiting your review" 
          icon={<HourglassIcon />} 
          color={COLORS.amber} bg={COLORS.amberBg} 
        />
        <KpiCard 
          title="Reviewed" 
          value={reviewedTotal} 
          subtitle="Total reviewed" 
          icon={<TaskAltIcon />} 
          color={COLORS.slate} bg={COLORS.slateBg} 
        />
        <KpiCard 
          title="Approved" 
          value={approvedTotal} 
          subtitle="Total approved" 
          icon={<CheckCircleIcon />} 
          color={COLORS.green} bg={COLORS.greenBg} 
        />
        <KpiCard 
          title="Active R&D Projects" 
          value={activeProjectsCount} 
          subtitle="Under monitoring" 
          icon={<PlayArrowIcon />} 
          color={COLORS.blue} bg={COLORS.blueBg} 
        />
      </Box>

      {/* ── MAIN SECTION ROW 1 ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: '20px', mb: 4 }}>
        
        {/* PENDING REVIEWS (8 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle 
              title="Pending Reviews" 
              subtitle="Submissions requiring your attention" 
              action={
                <Button 
                  endIcon={<ArrowForwardIcon />} 
                  size="small" 
                  onClick={() => navigate('/rd-review')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: COLORS.blue }}
                >
                  View All
                </Button>
              }
            />
            {loading ? (
              <Box sx={{ pt: 2 }}><Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} /></Box>
            ) : pendingReviewsList.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, bgcolor: COLORS.slateBg, borderRadius: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: COLORS.green, mb: 2, opacity: 0.8 }} />
                <Typography sx={{ fontWeight: 700, color: COLORS.textMain, fontSize: '1.1rem' }}>You're all caught up</Typography>
                <Typography sx={{ color: COLORS.textMuted, fontSize: '0.85rem', mt: 0.5 }}>No submissions are currently waiting for your review.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Tracking ID</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Title</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Submitted By</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Waiting</TableCell>
                      <TableCell align="right" sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingReviewsList.slice(0, 5).map(s => (
                      <TableRow key={s._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontWeight: 600, color: COLORS.textMain, py: 2 }}>{s.trackingId || s.businessId || '--'}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, color: COLORS.textMain, fontSize: '0.875rem' }}>{s.answers?.title || 'Untitled'}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>{s.submissionType || s.answers?.submissionType || 'Idea'}</Typography>
                        </TableCell>
                        <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.875rem' }}>{s.answers?.name || 'Unknown'}</TableCell>
                        <TableCell sx={{ color: COLORS.amber, fontWeight: 600, fontSize: '0.875rem' }}>{getDaysAgo(s.updatedAt || s.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Button 
                            variant="contained" 
                            size="small" 
                            onClick={() => navigate(`/rd-review?id=${s._id}`)} 
                            sx={{ bgcolor: COLORS.textMain, '&:hover': { bgcolor: '#334155' }, textTransform: 'none', borderRadius: '8px', boxShadow: 'none' }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Box>

        {/* REVIEW OVERVIEW (4 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column' }}>
            <SectionTitle title="Review Overview" subtitle="Status of submissions reaching HOD" />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {loading ? (
                <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
              ) : !hasReviewData && reviewStats.PENDING === 0 ? (
                <Box sx={{ textAlign: 'center', color: COLORS.textMuted, py: 4 }}>
                  <HelpOutlineIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                  <Typography sx={{ fontSize: '0.85rem' }}>No review data available</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 220, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: COLORS.textMain, fontWeight: 600, fontSize: '0.85rem' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: COLORS.textMain, lineHeight: 1 }}>
                      {chartData.reduce((sum, item) => sum + item.value, 0)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', mt: 0.5 }}>
                      Total
                    </Typography>
                  </Box>
                </Box>
              )}
              {/* Legend manually created for better styling */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
                {chartData.map(d => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.textMuted }}>{d.name} ({d.value})</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* ── MAIN SECTION ROW 2 ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: '20px', mb: 4 }}>
        
        {/* R&D PROJECTS (8 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle 
              title="R&D Projects" 
              subtitle="Projects under your oversight" 
              action={
                <Button 
                  endIcon={<ArrowForwardIcon />} 
                  size="small" 
                  onClick={() => navigate('/rd-ongoing-projects')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: COLORS.blue }}
                >
                  View All Projects
                </Button>
              }
            />
            {loading ? (
              <Box sx={{ pt: 2 }}><Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} /></Box>
            ) : activeProjectsList.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: COLORS.textMuted }}>
                <FolderIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                <Typography sx={{ fontSize: '0.9rem' }}>No active projects found.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Project Name</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Owner</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Phase</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, py: 1.5 }}>Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeProjectsList.slice(0, 4).map(s => {
                      const phase = s.projectDetails?.implementationStatus || 'Planning';
                      const pColor = getStatusColor(phase);
                      const progress = s.projectDetails?.progressPercentage || 0;
                      
                      return (
                        <TableRow key={s._id} hover sx={{ '&:last-child td': { border: 0 }, cursor: 'pointer' }} onClick={() => navigate(`/ongoing-projects/${s._id}`)}>
                          <TableCell sx={{ py: 2 }}>
                            <Typography sx={{ fontWeight: 600, color: COLORS.textMain, fontSize: '0.875rem' }}>{s.answers?.title || 'Untitled Project'}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>{s.trackingId || s.businessId || '--'}</Typography>
                          </TableCell>
                          <TableCell sx={{ color: COLORS.textMuted, fontSize: '0.875rem' }}>{s.projectDetails?.owner || s.answers?.name || 'Unassigned'}</TableCell>
                          <TableCell>
                            <Chip label={phase} size="small" sx={{ bgcolor: pColor.bg, color: pColor.text, fontWeight: 700, fontSize: '0.7rem', borderRadius: '6px' }} />
                          </TableCell>
                          <TableCell sx={{ width: '25%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: '100%' }}>
                                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: COLORS.border, '& .MuiLinearProgress-bar': { bgcolor: COLORS.blue, borderRadius: 3 } }} />
                              </Box>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: COLORS.textMuted, minWidth: 35 }}>{progress}%</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Box>

        {/* UPCOMING ACTIVITIES (4 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle title="Upcoming Activities" subtitle="Meetings & Calendar Events" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {loading ? (
                [1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />)
              ) : upcomingActivities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                  <EventIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                  <Typography sx={{ fontSize: '0.85rem' }}>No upcoming activities.</Typography>
                </Box>
              ) : (
                upcomingActivities.map((act, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, p: 1.5, borderRadius: '12px', border: `1px solid ${COLORS.border}`, bgcolor: COLORS.slateBg }}>
                    <Box sx={{ bgcolor: '#FFF', borderRadius: '8px', p: 1, minWidth: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.border}` }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.red, textTransform: 'uppercase' }}>
                        {new Date(act.date).toLocaleDateString('en-US', { month: 'short' })}
                      </Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: COLORS.textMain, lineHeight: 1 }}>
                        {new Date(act.date).getDate()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: COLORS.textMain }} noWrap>{act.title}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, mt: 0.25 }} noWrap>{act.projectTitle}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.blue, mt: 0.5 }}>{act.time} ({act.duration})</Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Box>
      </Box>

      {/* ── BOTTOM SECTION: RECENT ACTIVITY ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: '20px' }}>
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 12' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle title="Recent HOD Activity" subtitle="Your recent actions and decisions" />
        {loading ? (
          <Box sx={{ pt: 2 }}><Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} /></Box>
        ) : topActivities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
            <HistoryIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
            <Typography sx={{ fontSize: '0.85rem' }}>No recent activities found.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {topActivities.map((act, i) => {
              const isApp = act.type === 'APPROVED';
              return (
              <Box key={i} sx={{ 
                display: 'flex', alignItems: 'center', gap: 2, py: 2,
                borderBottom: i !== topActivities.length - 1 ? `1px solid ${COLORS.border}` : 'none'
              }}>
                <Box sx={{ bgcolor: isApp ? COLORS.greenBg : COLORS.redBg, p: 1, borderRadius: '50%', color: isApp ? COLORS.green : COLORS.red, display: 'flex' }}>
                  {isApp ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: COLORS.textMain, fontWeight: 500 }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>{isApp ? 'Approved' : 'Rejected'}</Box>
                    {' • '} {act.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    <Typography 
                      onClick={() => navigate(`/track?id=${act.trackingId}`)}
                      sx={{ 
                        fontSize: '0.75rem', 
                        color: COLORS.blue, 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' } 
                      }}
                    >
                      {act.trackingId}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>{new Date(act.timestamp).toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Box>
            )})}
          </Box>
            )}
          </Card>
        </Box>
      </Box>

    </Box>
  );
};

export default HODDashboard;
