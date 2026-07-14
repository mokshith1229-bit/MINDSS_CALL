import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Tabs, Tab,
  Snackbar, Alert, Chip, IconButton, TextField, Select, MenuItem,
  FormControl, InputLabel, InputAdornment, Tooltip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Skeleton, Badge, CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendIcon,
  Assessment as ReportIcon,
  PeopleAlt as PeopleIcon,
  AccountBalance as FinanceIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Science as RdIcon,
  StarRate as StarIcon,
  Close as CloseIcon,
  ExpandMore as ChevronDown,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import api from '../utils/api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAVY     = '#0D1B2A';
const GREEN    = '#2E7D32';
const GREEN_LT = '#E8F5E9';
const BLUE     = '#1565C0';
const BLUE_LT  = '#E3F2FD';
const AMBER    = '#B45309';
const AMBER_LT = '#FFF8E1';
const RED      = '#B91C1C';
const RED_LT   = '#FEF2F2';
const TEAL     = '#0F766E';
const PURPLE   = '#6D28D9';
const BORDER   = '#E2E8F0';
const BG       = '#F8FAFC';

const CHART_COLORS = [BLUE, GREEN, AMBER, RED, TEAL, PURPLE, '#0891B2', '#D97706'];

// ── Status → badge colour ─────────────────────────────────────────────────────
const STATUS_META = {
  NEW:                { label: 'Submitted',          bg: BLUE_LT,   color: BLUE },
  REVIEWING:          { label: 'RM Review',           bg: AMBER_LT,  color: AMBER },
  AWAITING_RM_REVIEW: { label: 'Awaiting RM',         bg: AMBER_LT,  color: AMBER },
  RM_REVIEW:          { label: 'RM Review',           bg: AMBER_LT,  color: AMBER },
  EVALUATION:         { label: 'Evaluation',          bg: BLUE_LT,   color: BLUE },
  EVALUATION_REJECTED:{ label: 'Eval Rejected',       bg: RED_LT,    color: RED },
  FINANCE_APPROVED:   { label: 'Finance Approved',    bg: GREEN_LT,  color: GREEN },
  APPROVAL_COMMITTEE: { label: 'Approval Committee',  bg: AMBER_LT,  color: AMBER },
  APPROVED:           { label: 'Approved',            bg: GREEN_LT,  color: GREEN },
  REJECTED:           { label: 'Rejected',            bg: RED_LT,    color: RED },
  IMPLEMENTATION:     { label: 'Implementation',      bg: '#EDE9FE', color: PURPLE },
  COMPLETED:          { label: 'Completed',           bg: GREEN_LT,  color: TEAL },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { label: status, bg: '#F3F4F6', color: '#374151' };
  return (
    <Chip label={m.label} size="small"
      sx={{ bgcolor: m.bg, color: m.color, fontWeight: 700, fontSize: '0.68rem', height: 20, border: `1px solid ${m.color}33` }} />
  );
};

const ProgressBar = ({ value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <LinearProgress variant="determinate" value={value || 0}
      sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E5E7EB',
        '& .MuiLinearProgress-bar': { bgcolor: value >= 100 ? GREEN : value >= 50 ? AMBER : BLUE, borderRadius: 3 } }} />
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', minWidth: 28 }}>{value || 0}%</Typography>
  </Box>
);

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon, color, bg, loading }) => (
  <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2.5,
    borderLeft: `4px solid ${color}`, transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 16px ${color}22` } }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: bg }}>{React.cloneElement(icon, { sx: { fontSize: 16, color } })}</Box>
      </Box>
      {loading ? <Skeleton width={60} height={36} /> :
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: NAVY, lineHeight: 1 }}>{value}</Typography>
      }
      {sub && <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', mt: 0.5 }}>{sub}</Typography>}
    </CardContent>
  </Card>
);

// ── Section title ─────────────────────────────────────────────────────────────
const SectionTitle = ({ title, sub }) => (
  <Box sx={{ mb: 2 }}>
    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: NAVY }}>{title}</Typography>
    {sub && <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{sub}</Typography>}
  </Box>
);

// ── Generic sortable data table ───────────────────────────────────────────────
const ReportTable = ({ columns, rows, loading, emptyLabel = 'No records found' }) => {
  const [sortCol, setSortCol]  = useState('');
  const [sortDir, setSortDir]  = useState('asc');
  const [page, setPage]        = useState(0);
  const PER_PAGE = 25;

  const sorted = useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? '';
      const bv = b[sortCol] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortCol, sortDir]);

  const paginated = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  if (loading) return (
    <Box sx={{ p: 3 }}>
      {[...Array(5)].map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 0.5 }} />)}
    </Box>
  );

  return (
    <Box>
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.key} onClick={() => handleSort(col.key)}
                  sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#374151', bgcolor: '#F9FAFB',
                    textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap',
                    borderBottom: `2px solid ${BORDER}`, py: 1.25,
                    '&:hover': { bgcolor: '#F1F5F9' },
                    minWidth: col.width || 'auto' }}>
                  {col.label}
                  {sortCol === col.key && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
                  <ReportIcon sx={{ fontSize: 36, opacity: 0.3, display: 'block', mx: 'auto', mb: 1 }} />
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : paginated.map((row, i) => (
              <TableRow key={row._id || i} sx={{ '&:hover': { bgcolor: '#FAFAFA' }, bgcolor: i % 2 === 0 ? '#fff' : '#FAFCFF' }}>
                {columns.map(col => (
                  <TableCell key={col.key} sx={{ fontSize: '0.78rem', color: '#374151', py: 1, borderColor: '#F3F4F6', whiteSpace: col.wrap ? 'normal' : 'nowrap' }}>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderTop: `1px solid ${BORDER}`, bgcolor: '#FAFAFA' }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
          Showing {Math.min(page * PER_PAGE + 1, sorted.length)}–{Math.min((page + 1) * PER_PAGE, sorted.length)} of {sorted.length} records
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)} sx={{ fontSize: '0.72rem', minWidth: 64 }}>← Prev</Button>
          <Typography sx={{ fontSize: '0.75rem', color: '#374151', px: 1, alignSelf: 'center' }}>{page + 1}/{totalPages || 1}</Typography>
          <Button size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} sx={{ fontSize: '0.72rem', minWidth: 64 }}>Next →</Button>
        </Box>
      </Box>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FILTER PANEL
// ══════════════════════════════════════════════════════════════════════════════
const FilterPanel = ({ filters, setFilters, onApply, loading }) => {
  const [local, setLocal] = useState(filters);
  const set = (k, v) => setLocal(f => ({ ...f, [k]: v }));

  return (
    <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, mb: 3 }}>
      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${BORDER}` }}>
        <FilterIcon sx={{ fontSize: 16, color: BLUE }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: NAVY }}>Report Filters</Typography>
      </Box>
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
        <TextField size="small" label="Date From" type="date" value={local.dateFrom || ''}
          onChange={e => set('dateFrom', e.target.value)} InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }} />
        <TextField size="small" label="Date To" type="date" value={local.dateTo || ''}
          onChange={e => set('dateTo', e.target.value)} InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }} />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Submission Type</InputLabel>
          <Select label="Submission Type" value={local.submissionType || ''} onChange={e => set('submissionType', e.target.value)}>
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="Idea">Idea</MenuItem>
            <MenuItem value="Proposal">Proposal</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={local.status || ''} onChange={e => set('status', e.target.value)}>
            <MenuItem value="">All Statuses</MenuItem>
            {Object.entries(STATUS_META).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField size="small" label="Department" value={local.department || ''}
          onChange={e => set('department', e.target.value)} sx={{ minWidth: 160 }} />

        <TextField size="small" label="Search Tracking ID / WBS" value={local.search || ''}
          onChange={e => set('search', e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment> }}
          sx={{ minWidth: 220 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" size="small" onClick={() => { setFilters(local); onApply(local); }}
            disabled={loading}
            sx={{ bgcolor: NAVY, fontWeight: 700, textTransform: 'none', px: 2, '&:hover': { bgcolor: '#1E3A5F' } }}>
            {loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Apply Filters'}
          </Button>
          <Button variant="outlined" size="small"
            onClick={() => { const reset = {}; setLocal(reset); setFilters(reset); onApply(reset); }}
            sx={{ fontWeight: 700, textTransform: 'none', borderColor: BORDER, color: '#6B7280' }}>
            Clear
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB 0 — EXECUTIVE DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const ExecutiveDashboard = ({ summary, loading }) => {
  const charts = summary?.charts || {};
  const monthly = (charts.monthly || []).map(m => ({ name: m.month, Submissions: m.count }));
  const deptData = Object.entries(charts.byDept || {}).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, value]) => ({ name, value }));
  const catData  = Object.entries(charts.byCategory || {}).map(([name, value]) => ({ name, value }));
  const typeData = Object.entries(charts.byType || {}).map(([name, value]) => ({ name, value }));

  if (loading) return <Box sx={{ p: 3 }}>{[...Array(4)].map((_, i) => <Skeleton key={i} height={200} sx={{ mb: 2 }} />)}</Box>;

  return (
    <Box sx={{ p: 2.5 }}>
      <Grid container spacing={3}>
        {/* Monthly trend */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionTitle title="Monthly Submission Trend" sub="Last 6 months" />
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={BLUE} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <ReTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="Submissions" stroke={BLUE} fill="url(#subGrad)" strokeWidth={2} dot={{ r: 4, fill: BLUE }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Type distribution */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionTitle title="Submission Type Split" sub="Ideas vs Proposals" />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {typeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department breakdown */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionTitle title="Department-wise Submissions" sub="Top 8 departments" />
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151' }} width={120} />
                  <ReTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" name="Submissions" fill={GREEN} radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category distribution */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <SectionTitle title="Category Distribution" sub="By innovation category" />
              {catData.length === 0 ? (
                <Typography sx={{ color: '#9CA3AF', textAlign: 'center', py: 4, fontSize: '0.82rem' }}>No category data available</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value">
                      {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <ReTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BUILD rows for each tab from raw submissions
// ══════════════════════════════════════════════════════════════════════════════
function buildMasterRows(submissions) {
  return submissions.map(sub => {
    const a  = sub.answers || {};
    const wf = sub.workflow || {};
    const rm = wf.rmReview || {};
    const ev = wf.evaluationReview || {};
    const fi = wf.financeReview || {};
    const pd = sub.projectDetails || {};
    return {
      _id: sub._id,
      trackingId:     sub.trackingId || sub.businessId || '',
      wbsCode:        sub.wbsCode || '',
      type:           sub.submissionType || 'Idea',
      title:          a.title || '',
      category:       a.classification || a.category || '',
      department:     a.department || '',
      submittedBy:    a.name || '',
      email:          sub.submitterEmail || a.email || '',
      dateSubmitted:  sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-IN') : '',
      rmDecision:     rm.decision || 'PENDING',
      evalResult:     ev.decision || 'PENDING',
      financeStatus:  fi.decision || 'PENDING',
      approvedBudget: fi.approvedBudget != null ? `₹${Number(fi.approvedBudget).toLocaleString('en-IN')}` : '',
      owner:          pd.owner || '',
      rdStatus:       pd.implementationStatus || '',
      progress:       pd.progressPercentage || 0,
      status:         sub.status,
      createdAt:      sub.createdAt,
      updatedAt:      sub.updatedAt,
    };
  });
}

function buildEvalRows(submissions) {
  const rows = [];
  submissions.forEach(sub => {
    const ev = sub.workflow?.evaluationReview?.evaluators || [];
    ev.forEach(e => rows.push({
      _id: `${sub._id}-${e.email}`,
      trackingId:    sub.trackingId || sub.businessId || '',
      title:         sub.answers?.title || '',
      department:    sub.answers?.department || '',
      evaluator:     e.email || '',
      vote:          e.decision || '',
      innovation:    e.scores?.innovation || '',
      technical:     e.scores?.technicalFeasibility || '',
      bizImpact:     e.scores?.businessImpact || '',
      scalability:   e.scores?.scalability || '',
      risk:          e.scores?.riskAssessment || '',
      comments:      e.comments || '',
      date:          e.submittedDate ? new Date(e.submittedDate).toLocaleDateString('en-IN') : '',
    }));
  });
  return rows;
}

function buildTimelineRows(submissions) {
  const rows = [];
  submissions.forEach(sub => {
    (sub.timeline || []).forEach(t => rows.push({
      _id: `${sub._id}-${t._id || Math.random()}`,
      trackingId:  sub.trackingId || sub.businessId || '',
      title:       sub.answers?.title || '',
      department:  sub.answers?.department || '',
      stage:       t.stage || t.event || '',
      actionBy:    t.actionBy || t.actor || '',
      role:        t.role || '',
      remarks:     t.remarks || '',
      timestamp:   t.timestamp ? new Date(t.timestamp).toLocaleString('en-IN') : '',
      ts:          t.timestamp,
    }));
  });
  return rows.sort((a, b) => new Date(b.ts) - new Date(a.ts));
}

function buildRdRows(submissions) {
  const rows = [];
  submissions.forEach(sub => {
    const pd = sub.projectDetails || {};
    (pd.updates || []).forEach((u, i) => rows.push({
      _id: `${sub._id}-update-${i}`,
      trackingId:  sub.trackingId || sub.businessId || '',
      title:       sub.answers?.title || '',
      owner:       pd.owner || '',
      updateNo:    i + 1,
      progress:    u.progressPercentage || 0,
      updateTitle: u.title || '',
      description: u.description || u.text || '',
      updatedBy:   u.updatedBy || u.user || '',
      date:        u.timestamp ? new Date(u.timestamp).toLocaleDateString('en-IN') : '',
      rdStatus:    pd.implementationStatus || '',
    }));
  });
  return rows;
}

function buildFinanceRows(submissions) {
  return submissions.map(sub => {
    const a  = sub.answers || {};
    const fi = sub.workflow?.financeReview || {};
    const pd = sub.projectDetails || {};
    return {
      _id: sub._id,
      trackingId:      sub.trackingId || sub.businessId || '',
      title:           a.title || '',
      department:      a.department || '',
      submittedBy:     a.name || '',
      estBudget:       a.estimatedBudget || a.budget || '',
      approvedBudget:  fi.approvedBudget != null ? fi.approvedBudget : '',
      financeStatus:   fi.decision || 'PENDING',
      reviewer:        fi.reviewerName || '',
      financeDate:     fi.timestamp ? new Date(fi.timestamp).toLocaleDateString('en-IN') : '',
      estSavings:      a.estimatedSavings || '',
      actualSavings:   a.actualSavings || '',
      bizImpact:       a.businessImpact || '',
      rdStatus:        pd.implementationStatus || '',
      progress:        pd.progressPercentage || 0,
    };
  });
}

function buildBenefitsRows(submissions) {
  return submissions.filter(s => s.projectDetails?.expectedBenefits || s.projectDetails?.actualBenefits).map(sub => ({
    _id: sub._id,
    trackingId:      sub.trackingId || sub.businessId || '',
    title:           sub.answers?.title || '',
    department:      sub.answers?.department || '',
    owner:           sub.projectDetails?.owner || '',
    rdStatus:        sub.projectDetails?.implementationStatus || '',
    progress:        sub.projectDetails?.progressPercentage || 0,
    expectedBenefits: sub.projectDetails?.expectedBenefits || '',
    actualBenefits:  sub.projectDetails?.actualBenefits || '',
    estSavings:      sub.answers?.estimatedSavings || '',
    actualSavings:   sub.answers?.actualSavings || '',
    bizImpact:       sub.answers?.businessImpact || '',
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// COLUMN DEFS for each tab
// ══════════════════════════════════════════════════════════════════════════════
const MASTER_COLS = [
  { key: 'trackingId',     label: 'Tracking ID',  width: 160, render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: BLUE }}>{r.trackingId || '—'}</Typography> },
  { key: 'wbsCode',        label: 'WBS Code',     width: 130, render: r => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6B7280' }}>{r.wbsCode || '—'}</Typography> },
  { key: 'type',           label: 'Type',         width: 90,  render: r => <Chip label={r.type} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: r.type === 'Idea' ? BLUE_LT : AMBER_LT, color: r.type === 'Idea' ? BLUE : AMBER }} /> },
  { key: 'title',          label: 'Title',        width: 200, wrap: true },
  { key: 'category',       label: 'Category',     width: 120 },
  { key: 'department',     label: 'Department',   width: 140 },
  { key: 'submittedBy',    label: 'Submitted By', width: 140 },
  { key: 'dateSubmitted',  label: 'Date',         width: 110 },
  { key: 'rmDecision',     label: 'RM',           width: 100, render: r => <StatusBadge status={r.rmDecision === 'APPROVED' ? 'APPROVED' : r.rmDecision === 'REJECTED' ? 'REJECTED' : 'REVIEWING'} /> },
  { key: 'evalResult',     label: 'Evaluation',   width: 110, render: r => <StatusBadge status={r.evalResult === 'APPROVED' ? 'APPROVED' : r.evalResult === 'REJECTED' ? 'REJECTED' : 'REVIEWING'} /> },
  { key: 'financeStatus',  label: 'Finance',      width: 100, render: r => <StatusBadge status={r.financeStatus === 'APPROVED' ? 'FINANCE_APPROVED' : r.financeStatus === 'REJECTED' ? 'REJECTED' : 'REVIEWING'} /> },
  { key: 'approvedBudget', label: 'Approved Budget', width: 140 },
  { key: 'owner',          label: 'Project Owner',  width: 140 },
  { key: 'rdStatus',       label: 'R&D Status',   width: 130 },
  { key: 'progress',       label: 'Progress',     width: 150, render: r => <ProgressBar value={r.progress} /> },
  { key: 'status',         label: 'Status',       width: 140, render: r => <StatusBadge status={r.status} /> },
];

const EVAL_COLS = [
  { key: 'trackingId',  label: 'Tracking ID', width: 160 },
  { key: 'title',       label: 'Title',       width: 200, wrap: true },
  { key: 'department',  label: 'Department',  width: 140 },
  { key: 'evaluator',   label: 'Evaluator Email', width: 200 },
  { key: 'vote',        label: 'Vote',        width: 100, render: r => r.vote ? <Chip label={r.vote} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: r.vote === 'APPROVED' ? GREEN_LT : RED_LT, color: r.vote === 'APPROVED' ? GREEN : RED }} /> : '—' },
  { key: 'innovation',  label: 'Innovation',  width: 90 },
  { key: 'technical',   label: 'Technical',   width: 90 },
  { key: 'bizImpact',   label: 'Biz Impact',  width: 90 },
  { key: 'scalability', label: 'Scalability', width: 90 },
  { key: 'risk',        label: 'Risk',        width: 90 },
  { key: 'comments',    label: 'Comments',    width: 250, wrap: true },
  { key: 'date',        label: 'Date',        width: 110 },
];

const TIMELINE_COLS = [
  { key: 'trackingId', label: 'Tracking ID', width: 160 },
  { key: 'title',      label: 'Title',       width: 180, wrap: true },
  { key: 'stage',      label: 'Stage',       width: 160 },
  { key: 'actionBy',   label: 'Action By',   width: 180 },
  { key: 'role',       label: 'Role',        width: 130 },
  { key: 'remarks',    label: 'Remarks',     width: 280, wrap: true },
  { key: 'timestamp',  label: 'Date & Time', width: 160 },
];

const RD_COLS = [
  { key: 'trackingId',   label: 'Tracking ID',  width: 160 },
  { key: 'title',        label: 'Title',         width: 180, wrap: true },
  { key: 'owner',        label: 'Project Owner', width: 150 },
  { key: 'updateNo',     label: 'Update #',      width: 80 },
  { key: 'progress',     label: 'Progress',      width: 150, render: r => <ProgressBar value={r.progress} /> },
  { key: 'updateTitle',  label: 'Update Title',  width: 180 },
  { key: 'description',  label: 'Description',   width: 280, wrap: true },
  { key: 'updatedBy',    label: 'Updated By',    width: 150 },
  { key: 'date',         label: 'Date',          width: 110 },
  { key: 'rdStatus',     label: 'R&D Status',    width: 140 },
];

const FINANCE_COLS = [
  { key: 'trackingId',     label: 'Tracking ID',    width: 160 },
  { key: 'title',          label: 'Title',           width: 180, wrap: true },
  { key: 'department',     label: 'Department',      width: 140 },
  { key: 'submittedBy',    label: 'Submitted By',    width: 140 },
  { key: 'estBudget',      label: 'Est. Budget',     width: 130 },
  { key: 'approvedBudget', label: 'Approved Budget', width: 140, render: r => r.approvedBudget !== '' ? <Typography sx={{ fontWeight: 700, color: GREEN, fontSize: '0.78rem' }}>₹{Number(r.approvedBudget).toLocaleString('en-IN')}</Typography> : '—' },
  { key: 'financeStatus',  label: 'Finance Status',  width: 130, render: r => <StatusBadge status={r.financeStatus === 'APPROVED' ? 'FINANCE_APPROVED' : r.financeStatus === 'REJECTED' ? 'REJECTED' : 'REVIEWING'} /> },
  { key: 'reviewer',       label: 'Finance Reviewer',width: 160 },
  { key: 'financeDate',    label: 'Finance Date',    width: 120 },
  { key: 'estSavings',     label: 'Est. Savings',    width: 130 },
  { key: 'actualSavings',  label: 'Actual Savings',  width: 130 },
  { key: 'bizImpact',      label: 'Biz Impact',      width: 110 },
  { key: 'progress',       label: 'Progress',        width: 140, render: r => <ProgressBar value={r.progress} /> },
];

const BENEFITS_COLS = [
  { key: 'trackingId',       label: 'Tracking ID',     width: 160 },
  { key: 'title',            label: 'Title',            width: 200, wrap: true },
  { key: 'department',       label: 'Department',       width: 140 },
  { key: 'owner',            label: 'Project Owner',    width: 150 },
  { key: 'rdStatus',         label: 'R&D Status',       width: 140 },
  { key: 'progress',         label: 'Progress',         width: 140, render: r => <ProgressBar value={r.progress} /> },
  { key: 'expectedBenefits', label: 'Expected Benefits',width: 260, wrap: true },
  { key: 'actualBenefits',   label: 'Actual Benefits',  width: 260, wrap: true },
  { key: 'estSavings',       label: 'Est. Savings',     width: 130 },
  { key: 'actualSavings',    label: 'Actual Savings',   width: 130 },
  { key: 'bizImpact',        label: 'Business Impact',  width: 120 },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN REPORTS PAGE
// ══════════════════════════════════════════════════════════════════════════════
const Reports = () => {
  const [tab, setTab]             = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [exporting, setExporting] = useState({ excel: false, csv: false });
  const [filters, setFilters]     = useState({});
  const [snack, setSnack]         = useState({ open: false, msg: '', type: 'success' });

  const toast = (msg, type = 'success') => setSnack({ open: true, msg, type });

  // ── Build query string from filters ────────────────────────────────────────
  const buildQS = useCallback((f) => {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
    return params.toString();
  }, []);

  // ── Fetch submissions ───────────────────────────────────────────────────────
  const fetchData = useCallback(async (f = {}) => {
    setLoading(true);
    setSummaryLoading(true);
    try {
      const qs = buildQS(f);
      const [subsRes, sumRes] = await Promise.all([
        api.get(`/admin/submissions${qs ? `?${qs}` : ''}`),
        api.get(`/admin/reports/summary${qs ? `?${qs}` : ''}`).catch(() => ({ data: { data: null } })),
      ]);
      setSubmissions(subsRes.data.data.submissions || []);
      setSummary(sumRes.data.data);
    } catch (err) {
      toast('Failed to load report data', 'error');
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  }, [buildQS]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived row sets ────────────────────────────────────────────────────────
  const masterRows   = useMemo(() => buildMasterRows(submissions),   [submissions]);
  const evalRows     = useMemo(() => buildEvalRows(submissions),     [submissions]);
  const timelineRows = useMemo(() => buildTimelineRows(submissions), [submissions]);
  const rdRows       = useMemo(() => buildRdRows(submissions),       [submissions]);
  const financeRows  = useMemo(() => buildFinanceRows(submissions),  [submissions]);
  const benefitRows  = useMemo(() => buildBenefitsRows(submissions), [submissions]);

  // ── KPI values ──────────────────────────────────────────────────────────────
  const kpis = summary?.kpis || {};

  // ── Export handlers ─────────────────────────────────────────────────────────
  const handleExport = async (type) => {
    setExporting(e => ({ ...e, [type]: true }));
    try {
      const qs = buildQS(filters);
      const res = await api.get(`/admin/reports/export/${type}${qs ? `?${qs}` : ''}`,
        { responseType: 'blob' });
      const ext  = type === 'excel' ? 'xlsx' : 'csv';
      const mime = type === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';
      const blob = new Blob([res.data], { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `MINDScall_Report_${new Date().toISOString().slice(0,10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast(`${type.toUpperCase()} report downloaded successfully`);
    } catch (err) {
      toast(`Export failed: ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setExporting(e => ({ ...e, [type]: false }));
    }
  };

  // ── Tab config ──────────────────────────────────────────────────────────────
  const TABS = [
    { label: 'Executive Dashboard', icon: <TrendIcon sx={{ fontSize: 14 }} /> },
    { label: 'Master Submissions',  icon: <ReportIcon sx={{ fontSize: 14 }} />, count: masterRows.length },
    { label: 'Evaluation Detail',   icon: <PeopleIcon sx={{ fontSize: 14 }} />, count: evalRows.length },
    { label: 'Workflow Timeline',   icon: <CheckIcon  sx={{ fontSize: 14 }} />, count: timelineRows.length },
    { label: 'R&D Updates',         icon: <RdIcon     sx={{ fontSize: 14 }} />, count: rdRows.length },
    { label: 'Finance Report',      icon: <FinanceIcon sx={{ fontSize: 14 }} />, count: financeRows.length },
    { label: 'Benefits Tracking',   icon: <StarIcon   sx={{ fontSize: 14 }} />, count: benefitRows.length },
  ];

  return (
    <Box sx={{ bgcolor: BG, minHeight: '100vh', pb: 6 }}>

      {/* ── Page Header ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Box sx={{ p: 1, bgcolor: NAVY, borderRadius: 1.5 }}>
                <ReportIcon sx={{ fontSize: 20, color: '#fff' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: NAVY, lineHeight: 1.2 }}>
                  Enterprise Reports & Export
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                  MINDScall Management Information System — Live data
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Export buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={() => fetchData(filters)} disabled={loading}
                sx={{ border: `1px solid ${BORDER}`, bgcolor: '#fff', borderRadius: 1.5 }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" size="small" startIcon={exporting.csv ? <CircularProgress size={14} /> : <CsvIcon />}
              onClick={() => handleExport('csv')} disabled={exporting.csv || loading}
              sx={{ textTransform: 'none', fontWeight: 700, borderColor: TEAL, color: TEAL, '&:hover': { bgcolor: '#F0FDF4', borderColor: TEAL } }}>
              Export CSV
            </Button>
            <Button variant="contained" size="small" startIcon={exporting.excel ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <ExcelIcon />}
              onClick={() => handleExport('excel')} disabled={exporting.excel || loading}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: GREEN, '&:hover': { bgcolor: '#1B5E20' }, px: 2 }}>
              Export Excel (5 Sheets)
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Submissions',  value: kpis.total ?? '—',       sub: `${kpis.ideas ?? 0} Ideas · ${kpis.proposals ?? 0} Proposals`, icon: <ReportIcon />,  color: BLUE,   bg: BLUE_LT },
          { label: 'Approval Rate',      value: `${kpis.approvalRate ?? 0}%`, sub: `${kpis.approved ?? 0} approved`,                           icon: <CheckIcon />,   color: GREEN,  bg: GREEN_LT },
          { label: 'Evaluation Passed',  value: kpis.evalPassed ?? '—',  sub: 'By committee',                                                 icon: <PeopleIcon />,  color: PURPLE, bg: '#EDE9FE' },
          { label: 'Finance Approved',   value: kpis.finApproved ?? '—', sub: 'Budget sanctioned',                                            icon: <FinanceIcon />, color: AMBER,  bg: AMBER_LT },
          { label: 'R&D Completed',      value: kpis.rdCompleted ?? '—', sub: `${kpis.rdInProgress ?? 0} in progress`,                        icon: <RdIcon />,      color: TEAL,   bg: '#CCFBF1' },
          { label: 'Pending / Open',     value: kpis.pending ?? '—',     sub: 'Awaiting action',                                              icon: <PendingIcon />, color: RED,    bg: RED_LT },
          { label: 'Avg R&D Progress',   value: `${kpis.avgProgress ?? 0}%`, sub: 'Active projects',                                          icon: <TrendIcon />,   color: BLUE,   bg: BLUE_LT },
          { label: 'Budget Approved',    value: kpis.totalBudget ? `₹${Number(kpis.totalBudget).toLocaleString('en-IN')}` : '—', sub: 'Total sanctioned budget', icon: <StarIcon />, color: GREEN, bg: GREEN_LT },
        ].map((k, i) => (
          <Grid item xs={6} sm={4} md={3} key={i}>
            <KpiCard {...k} loading={summaryLoading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Filters ── */}
      <FilterPanel filters={filters} setFilters={setFilters} onApply={fetchData} loading={loading} />

      {/* ── Report Tabs ── */}
      <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2.5, overflow: 'hidden' }}>
        {/* Tab bar */}
        <Box sx={{ borderBottom: `1px solid ${BORDER}`, bgcolor: '#fff' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ '& .MuiTabs-indicator': { bgcolor: NAVY, height: 3 }, minHeight: 46 }}>
            {TABS.map((t, i) => (
              <Tab key={i} icon={t.icon} iconPosition="start"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {t.label}
                    {t.count != null && (
                      <Chip label={t.count} size="small"
                        sx={{ height: 16, fontSize: '0.62rem', fontWeight: 800, minWidth: 20,
                          bgcolor: tab === i ? NAVY : '#F1F5F9', color: tab === i ? '#fff' : '#374151' }} />
                    )}
                  </Box>
                }
                sx={{ fontSize: '0.78rem', fontWeight: tab === i ? 700 : 500, minHeight: 46, textTransform: 'none',
                  color: tab === i ? NAVY : '#6B7280', '&.Mui-selected': { color: NAVY } }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{ bgcolor: '#fff' }}>
          {/* Record count banner */}
          {tab > 0 && (
            <Box sx={{ px: 2.5, py: 1.25, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FAFAFA' }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                {loading ? 'Loading…' : `${[masterRows, evalRows, timelineRows, rdRows, financeRows, benefitRows][tab - 1]?.length ?? 0} records`}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                Click column headers to sort · Use filters above to narrow results
              </Typography>
            </Box>
          )}

          {tab === 0 && <ExecutiveDashboard summary={summary} loading={summaryLoading} />}
          {tab === 1 && <ReportTable columns={MASTER_COLS}   rows={masterRows}   loading={loading} emptyLabel="No submissions match the applied filters" />}
          {tab === 2 && <ReportTable columns={EVAL_COLS}     rows={evalRows}     loading={loading} emptyLabel="No evaluator data available" />}
          {tab === 3 && <ReportTable columns={TIMELINE_COLS} rows={timelineRows} loading={loading} emptyLabel="No timeline events found" />}
          {tab === 4 && <ReportTable columns={RD_COLS}       rows={rdRows}       loading={loading} emptyLabel="No R&D update records found" />}
          {tab === 5 && <ReportTable columns={FINANCE_COLS}  rows={financeRows}  loading={loading} emptyLabel="No finance records found" />}
          {tab === 6 && <ReportTable columns={BENEFITS_COLS} rows={benefitRows}  loading={loading} emptyLabel="No benefits data found — add expected/actual benefits in R&D Projects" />}
        </Box>
      </Card>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
