import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CircularProgress, Skeleton,
  Button, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, useTheme
} from '@mui/material';
import {
  AccountBalance as FinanceIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowForwardIcon,
  BarChart as ChartIcon,
  ReceiptLong as ReceiptIcon,
  NotificationsActive as AlertIcon,
  History as HistoryIcon,
  MonetizationOn as MoneyIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { authStore } from '../../store/authStore';
import { parseSubmissionFields } from '../../utils/submissionParser';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// -- Theme Constants --
const COLORS = {
  green: '#10B981', greenBg: '#ECFDF5',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  blue: '#3B82F6', blueBg: '#EFF6FF',
  red: '#EF4444', redBg: '#FEF2F2',
  slate: '#64748B', slateBg: '#F8FAFC',
  textMain: '#0F172A', textMuted: '#64748B', border: '#E2E8F0'
};

const CardStyle = {
  borderRadius: 3,
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
  height: '100%',
  bgcolor: '#FFFFFF'
};

const formatCurrency = (amount) => {
  if (!amount) return '₹ 0';
  return `₹ ${amount.toLocaleString('en-IN')}`;
};

// -- Reusable Components --
const KpiCard = ({ title, value, subtitle, icon, color, bg }) => (
  <Card elevation={0} sx={{ ...CardStyle, p: 2.5, display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Typography sx={{ color: COLORS.textMuted, fontWeight: 600, fontSize: '0.85rem' }}>{title}</Typography>
      <Box sx={{ bgcolor: bg, p: 1, borderRadius: 2, color: color, display: 'flex' }}>
        {icon}
      </Box>
    </Box>
    <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: COLORS.textMain, mb: 0.5, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted, fontWeight: 500 }}>
      {subtitle}
    </Typography>
  </Card>
);

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

// -- Main Dashboard --
const FinanceDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentUser = authStore.getState().user;
  const userName = currentUser?.name || 'Finance User';

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/submissions');
      const allSubs = res.data.data.submissions || [];
      
      const financeSubs = allSubs.map(sub => {
        const parsed = parseSubmissionFields(sub);
        const approvedBudget = parsed.approvedBudget;
        const userEstimatedAmount = parsed.userBudget || parsed.budget || 0;
        const rawAmount = (approvedBudget !== undefined && approvedBudget !== null) ? approvedBudget : userEstimatedAmount;
        const numAmount = parseFloat(String(rawAmount).replace(/[^\d.-]/g, '')) || 0;
        
        let finStatus = 'Other';
        const decision = sub.workflow?.financeReview?.decision;
        if (decision === 'APPROVED') finStatus = 'APPROVED';
        else if (decision === 'REJECTED') finStatus = 'REJECTED';
        else if (decision === 'CLARIFICATION') finStatus = 'CLARIFICATION';
        else if (['FINANCE_APPROVED', 'APPROVAL_COMMITTEE', 'APPROVED', 'REJECTED', 'EVALUATION_REJECTED'].includes(sub.status)) {
          finStatus = 'PENDING';
        }

        return { ...sub, parsed, numAmount, finStatus };
      }).filter(s => s.status !== 'DELETED' && s.finStatus !== 'Other');

      setSubmissions(financeSubs);
    } catch (err) {
      console.error('Failed to load Finance dashboard data', err);
      setError('Unable to load finance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // -- Metrics --
  const pendingCount = submissions.filter(s => s.finStatus === 'PENDING').length;
  const approvedCount = submissions.filter(s => s.finStatus === 'APPROVED').length;
  const rejectedCount = submissions.filter(s => s.finStatus === 'REJECTED').length;
  const clarificationCount = submissions.filter(s => s.finStatus === 'CLARIFICATION').length;

  const reviewedThisMonth = submissions.filter(s => {
    const ts = s.workflow?.financeReview?.timestamp;
    if (!ts || s.finStatus === 'PENDING') return false;
    const d = new Date(ts);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const totalBudgetPending = submissions.filter(s => s.finStatus === 'PENDING').reduce((acc, s) => acc + s.numAmount, 0);
  const totalBudgetApproved = submissions.filter(s => s.finStatus === 'APPROVED').reduce((acc, s) => acc + s.numAmount, 0);
  const totalBudgetRejected = submissions.filter(s => s.finStatus === 'REJECTED').reduce((acc, s) => acc + s.numAmount, 0);

  // -- Derived Lists --
  const pendingQueue = submissions.filter(s => s.finStatus === 'PENDING')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 5);

  const recentDecisions = submissions.filter(s => ['APPROVED', 'REJECTED', 'CLARIFICATION'].includes(s.finStatus))
    .sort((a, b) => new Date(b.workflow?.financeReview?.timestamp || b.updatedAt) - new Date(a.workflow?.financeReview?.timestamp || a.updatedAt))
    .slice(0, 5);

  // -- Chart Data --
  const chartData = [
    { name: 'Pending', value: pendingCount, color: COLORS.amber },
    { name: 'Approved', value: approvedCount, color: COLORS.green },
    { name: 'Rejected', value: rejectedCount, color: COLORS.red },
    { name: 'Clarification', value: clarificationCount, color: COLORS.blue }
  ].filter(d => d.value > 0);

  const hasChartData = chartData.length > 0;

  return (
    <Box sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', minWidth: 0, pb: 6 }}>
      
      {/* ── HEADER ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.textMain, letterSpacing: '-0.02em', mb: 0.5 }}>
            Good Morning, {userName}
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, fontSize: '0.9rem', maxWidth: 600 }}>
            Review innovation budgets, assess financial impact and monitor investment decisions.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip 
            label={now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} 
            sx={{ bgcolor: COLORS.slateBg, color: COLORS.textMuted, fontWeight: 600, border: `1px solid ${COLORS.border}` }} 
          />
        </Box>
      </Box>

      {/* ── QUICK ACTIONS ── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
        {[
          { label: 'Finance Review', icon: <FinanceIcon fontSize="small"/>, path: '/finance-approval' },
          { label: 'Pending Approvals', icon: <HourglassEmptyIcon fontSize="small"/>, path: '/finance-approval' },
          { label: 'Approved Projects', icon: <CheckCircleIcon fontSize="small"/>, path: '/rd-ongoing-projects' },
          { label: 'Reports', icon: <ChartIcon fontSize="small"/>, path: '/reports' }
        ].map((btn, i) => (
          <Button 
            key={i}
            variant="outlined"
            startIcon={btn.icon}
            onClick={() => navigate(btn.path)}
            sx={{ 
              borderRadius: 2, textTransform: 'none', fontWeight: 600, color: COLORS.textMain, borderColor: COLORS.border,
              bgcolor: '#FFFFFF', '&:hover': { bgcolor: COLORS.slateBg, borderColor: '#CBD5E1' }
            }}
          >
            {btn.label}
          </Button>
        ))}
      </Box>

      {/* ── ERROR STATE ── */}
      {error && (
        <Card sx={{ bgcolor: COLORS.redBg, color: COLORS.red, p: 3, mb: 4, borderRadius: 3, border: `1px solid #FECACA`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CancelIcon />
            <Typography sx={{ fontWeight: 600 }}>{error}</Typography>
          </Box>
          <Button variant="outlined" color="error" size="small" onClick={fetchDashboardData} sx={{ bgcolor: '#FFFFFF' }}>Retry</Button>
        </Card>
      )}

      {/* ── KPI SECTION ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: '20px', mb: 4 }}>
        <KpiCard 
          title="Pending Finance Reviews" 
          value={loading ? '-' : pendingCount} 
          subtitle="Awaiting financial review" 
          icon={<HourglassEmptyIcon />} 
          color={COLORS.amber} bg={COLORS.amberBg} 
        />
        <KpiCard 
          title="Reviewed This Month" 
          value={loading ? '-' : reviewedThisMonth} 
          subtitle="This month" 
          icon={<ReceiptIcon />} 
          color={COLORS.slate} bg={COLORS.slateBg} 
        />
        <KpiCard 
          title="Approved" 
          value={loading ? '-' : approvedCount} 
          subtitle="Current period" 
          icon={<CheckCircleIcon />} 
          color={COLORS.green} bg={COLORS.greenBg} 
        />
      </Box>

      {/* ── MAIN SECTION ROW 1 ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: '20px', mb: 4 }}>
        
        {/* FINANCE REVIEW QUEUE (8 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle 
              title="Finance Review Queue" 
              subtitle="Proposals requiring financial assessment" 
              action={
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/finance-approval')} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  View All
                </Button>
              }
            />
            {loading ? (
              <Box sx={{ pt: 2 }}><Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} /></Box>
            ) : pendingQueue.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: COLORS.textMuted }}>
                <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1, color: COLORS.green }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.textMain, fontSize: '1rem' }}>You're all caught up</Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>No proposals are currently waiting for financial review.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}` }}>ID</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}` }}>Proposal</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}` }}>Budget</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}` }}>Waiting</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}`, textAlign: 'right' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingQueue.map((row, i) => {
                      const waitDays = Math.floor((Date.now() - new Date(row.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 600, color: COLORS.textMain, borderBottom: `1px solid ${COLORS.border}` }}>
                            {row.trackingId || row.businessId}
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.textMain }}>{row.parsed.title}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>{row.parsed.employeeName}</Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: COLORS.blue, borderBottom: `1px solid ${COLORS.border}` }}>
                            {formatCurrency(row.numAmount)}
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <Chip label={`${waitDays} days`} size="small" sx={{ bgcolor: waitDays > 5 ? COLORS.redBg : COLORS.amberBg, color: waitDays > 5 ? COLORS.red : COLORS.amber, fontWeight: 700, fontSize: '0.7rem' }} />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <Button size="small" variant="contained" sx={{ bgcolor: COLORS.blue, '&:hover': { bgcolor: '#2563EB' }, textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem' }} onClick={() => navigate('/finance-approval')}>
                              Review
                            </Button>
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

        {/* REVIEW OVERVIEW (4 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column' }}>
            <SectionTitle title="Review Overview" subtitle="Status of finance reviews" />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {loading ? (
                <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
              ) : !hasChartData ? (
                <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                  <ChartIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                  <Typography sx={{ fontSize: '0.85rem' }}>No data available yet</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 220, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: COLORS.textMain, lineHeight: 1 }}>
                      {chartData.reduce((a, b) => a + b.value, 0)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.textMuted, letterSpacing: 1 }}>TOTAL</Typography>
                  </Box>
                </Box>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 2 }}>
                {chartData.map(d => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
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
        
        {/* BUDGET OVERVIEW (8 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle title="Budget Overview" subtitle="Requested vs Approved allocations" />
            {loading ? (
              <Box sx={{ pt: 2 }}><Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} /></Box>
            ) : (totalBudgetPending + totalBudgetApproved + totalBudgetRejected === 0) ? (
              <Box sx={{ textAlign: 'center', py: 5, color: COLORS.textMuted }}>
                <MoneyIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                <Typography sx={{ fontSize: '0.85rem' }}>Budget data will appear once proposals include financial estimates.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                {[
                  { label: 'Under Review', value: totalBudgetPending, color: COLORS.amber },
                  { label: 'Approved', value: totalBudgetApproved, color: COLORS.green },
                  { label: 'Rejected', value: totalBudgetRejected, color: COLORS.red }
                ].map((item, idx) => {
                  const max = Math.max(totalBudgetPending, totalBudgetApproved, totalBudgetRejected);
                  const pct = max === 0 ? 0 : (item.value / max) * 100;
                  return (
                    <Box key={idx}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.textMain }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.textMain }}>{formatCurrency(item.value)}</Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 10, bgcolor: COLORS.slateBg, borderRadius: 5, overflow: 'hidden' }}>
                        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: item.color, borderRadius: 5, transition: 'width 1s ease-in-out' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Card>
        </Box>

        {/* REQUIRES ATTENTION (4 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle title="Requires Attention" subtitle="Action items & alerts" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {loading ? (
                [1,2].map(i => <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />)
              ) : (
                <>
                  {pendingCount > 0 && (
                    <Box sx={{ display: 'flex', gap: 2, p: 1.5, bgcolor: COLORS.amberBg, borderRadius: 2, border: `1px solid ${COLORS.amber}30` }}>
                      <AlertIcon sx={{ color: COLORS.amber, mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>{pendingCount} pending reviews</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#B45309', mb: 1 }}>Proposals await your financial assessment.</Typography>
                        <Button size="small" variant="contained" onClick={() => navigate('/finance-approval')} sx={{ bgcolor: COLORS.amber, color: '#fff', '&:hover': { bgcolor: '#D97706' }, textTransform: 'none', fontSize: '0.7rem', py: 0.2 }}>Review Now</Button>
                      </Box>
                    </Box>
                  )}
                  {clarificationCount > 0 && (
                    <Box sx={{ display: 'flex', gap: 2, p: 1.5, bgcolor: COLORS.blueBg, borderRadius: 2, border: `1px solid ${COLORS.blue}30` }}>
                      <PendingIcon sx={{ color: COLORS.blue, mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF' }}>{clarificationCount} clarifications active</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#3B82F6', mb: 1 }}>Waiting for responses on financial queries.</Typography>
                        <Button size="small" variant="contained" onClick={() => navigate('/finance-approval')} sx={{ bgcolor: COLORS.blue, color: '#fff', '&:hover': { bgcolor: '#2563EB' }, textTransform: 'none', fontSize: '0.7rem', py: 0.2 }}>View</Button>
                      </Box>
                    </Box>
                  )}
                  {pendingCount === 0 && clarificationCount === 0 && (
                    <Box sx={{ textAlign: 'center', py: 3, color: COLORS.textMuted }}>
                      <CheckCircleIcon sx={{ fontSize: 32, opacity: 0.3, mb: 1, color: COLORS.green }} />
                      <Typography sx={{ fontSize: '0.85rem' }}>No immediate action required.</Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Card>
        </Box>
      </Box>

      {/* ── MAIN SECTION ROW 3 ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: '20px' }}>
        
        {/* RECENT DECISIONS (8 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle 
              title="Recent Financial Decisions" 
              subtitle="Latest approvals and rejections" 
              action={
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/reports')} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  View History
                </Button>
              }
            />
            {loading ? (
              <Box sx={{ pt: 2 }}><Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} /></Box>
            ) : recentDecisions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                <HistoryIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                <Typography sx={{ fontSize: '0.85rem' }}>No financial decisions yet.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}` }}>ID</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}` }}>Proposal</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}` }}>Decision</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}` }}>Budget</TableCell>
                      <TableCell sx={{ color: COLORS.textMuted, fontWeight: 600, borderBottom: `2px solid ${COLORS.border}`, textAlign: 'right' }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentDecisions.map((row, i) => {
                      const isApp = row.finStatus === 'APPROVED';
                      return (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 600, color: COLORS.textMain, borderBottom: `1px solid ${COLORS.border}` }}>
                            {row.trackingId || row.businessId}
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.textMain }}>{row.parsed.title}</Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <Chip 
                              label={row.finStatus} 
                              size="small" 
                              sx={{ 
                                bgcolor: isApp ? COLORS.greenBg : (row.finStatus === 'REJECTED' ? COLORS.redBg : COLORS.blueBg), 
                                color: isApp ? COLORS.green : (row.finStatus === 'REJECTED' ? COLORS.red : COLORS.blue), 
                                fontWeight: 700, fontSize: '0.7rem' 
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: COLORS.blue, borderBottom: `1px solid ${COLORS.border}` }}>
                            {formatCurrency(row.numAmount)}
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textMuted, fontSize: '0.75rem' }}>
                            {new Date(row.workflow?.financeReview?.timestamp || row.updatedAt).toLocaleDateString()}
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

        {/* RECENT ACTIVITY (4 cols) */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card elevation={0} sx={{ ...CardStyle, p: { xs: 2, md: 3 } }}>
            <SectionTitle title="Recent Activity" subtitle="Your latest actions" />
            {loading ? (
              <Box sx={{ pt: 2 }}><Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} /></Box>
            ) : recentDecisions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: COLORS.textMuted }}>
                <HistoryIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                <Typography sx={{ fontSize: '0.85rem' }}>No recent activities found.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {recentDecisions.slice(0,4).map((act, i) => {
                  const isApp = act.finStatus === 'APPROVED';
                  const isClar = act.finStatus === 'CLARIFICATION';
                  return (
                    <Box key={i} sx={{ 
                      display: 'flex', alignItems: 'center', gap: 2, py: 2,
                      borderBottom: i !== Math.min(3, recentDecisions.length - 1) ? `1px solid ${COLORS.border}` : 'none'
                    }}>
                      <Box sx={{ bgcolor: isApp ? COLORS.greenBg : (isClar ? COLORS.blueBg : COLORS.redBg), p: 1, borderRadius: '50%', color: isApp ? COLORS.green : (isClar ? COLORS.blue : COLORS.red), display: 'flex' }}>
                        {isApp ? <CheckCircleIcon fontSize="small" /> : (isClar ? <PendingIcon fontSize="small" /> : <CancelIcon fontSize="small" />)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMain, fontWeight: 500 }} noWrap>
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {isApp ? 'Approved' : (isClar ? 'Clarification' : 'Rejected')}
                          </Box>
                          {' • '} {act.parsed.title}
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
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                            {new Date(act.workflow?.financeReview?.timestamp || act.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Card>
        </Box>
      </Box>

    </Box>
  );
};

export default FinanceDashboard;
