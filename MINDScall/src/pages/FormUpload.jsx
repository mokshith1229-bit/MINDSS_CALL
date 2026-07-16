import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Chip, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  Alert, Snackbar, Tab, Tabs, Badge, Avatar, Menu, ListItemIcon, ListItemText,
  InputAdornment, Breadcrumbs, Link, LinearProgress, Paper, Drawer,
  ToggleButtonGroup, ToggleButton, Accordion, AccordionSummary, AccordionDetails,
  FormHelperText, Checkbox, List, ListItem,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  ContentCopy as CopyIcon, Share as ShareIcon, Visibility as PreviewIcon,
  Link as LinkIcon, Close as CloseIcon, Category as CategoryIcon,
  Build as BuildIcon, Assessment as StatsIcon, CheckCircle as CheckIcon,
  Block as BlockIcon, FileCopy as DuplicateIcon, MoreVert as MoreVertIcon,
  OpenInNew as OpenIcon, Search as SearchIcon, FilterList as FilterIcon,
  Download as DownloadIcon, History as HistoryIcon, Bookmark as TemplateIcon,
  CloudUpload as PublishIcon, Archive as ArchiveIcon, Save as DraftIcon,
  Refresh as RegenerateIcon, ExpandMore as ExpandMoreIcon,
  NavigateNext as NavNextIcon, Home as HomeIcon, Notifications as NotifIcon,
  TrendingUp as TrendIcon, PieChart as PieIcon, BarChart as BarIcon,
  TableChart as TableChartIcon, ViewKanban as KanbanIcon,
  Star as StarIcon, Lock as LockIcon, LockOpen as UnlockIcon,
  AccessTime as ExpiryIcon, Group as GroupIcon, Restore as RestoreIcon,
  CloudUpload,
  KeyboardArrowUp as UpIcon, KeyboardArrowDown as DownIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { formStore, uid, slugify, FIELD_TYPE_COLORS } from '../store/formStore';
import FormBuilder from '../components/FormBuilder';
import { useDropzone } from 'react-dropzone';
import { formatKey } from '../utils/submissionParser';
import Timeline from '../components/Timeline';

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_META = {
  draft: { label: 'Draft', bg: '#F1F5F9', color: '#475569', icon: <DraftIcon sx={{ fontSize: 13 }} /> },
  published: { label: 'Published', bg: '#D1FAE5', color: '#059669', icon: <PublishIcon sx={{ fontSize: 13 }} /> },
  archived: { label: 'Archived', bg: '#F3F4F6', color: '#6B7280', icon: <ArchiveIcon sx={{ fontSize: 13 }} /> },
  closed: { label: 'Closed', bg: '#FEE2E2', color: '#DC2626', icon: <LockIcon sx={{ fontSize: 13 }} /> },
};

const StatusChip = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.draft;
  return (
    <Chip icon={m.icon} label={m.label} size="small"
      sx={{ bgcolor: m.bg, color: m.color, fontWeight: 700, fontSize: '0.72rem', '& .MuiChip-icon': { color: m.color } }} />
  );
};

const useStore = () => {
  const [categories, setCategories] = useState(formStore.getCategories());
  const [forms, setForms] = useState(formStore.getForms());
  const [submissions, setSubmissions] = useState(formStore.getAllSubmissions());
  const [templates, setTemplates] = useState(formStore.getTemplates());
  useEffect(() => {
    formStore.init();

    const unsub = formStore.subscribe(() => {
      setCategories(formStore.getCategories());
      setForms(formStore.getForms());
      setSubmissions(formStore.getAllSubmissions());
      setTemplates(formStore.getTemplates());
    });
    return unsub;
  }, []);
  return { categories, forms, submissions, templates };
};

// ════════════════════════════════════════════════════════════════
//  ANALYTICS TAB
// ════════════════════════════════════════════════════════════════
const AnalyticsTab = ({ forms, submissions, categories }) => {
  const total = submissions.length;
  const pending = submissions.filter(s => s.status === 'pending').length;
  const approved = submissions.filter(s => s.status === 'approved').length;
  const rejected = submissions.filter(s => s.status === 'rejected').length;

  const monthlyTrendData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        month: months[d.getMonth()],
        monthVal: d.getMonth(),
        yearVal: d.getFullYear(),
        responses: 0,
        forms: 0
      });
    }

    submissions.forEach(s => {
      const createdAt = new Date(s.createdAt);
      const m = createdAt.getMonth();
      const y = createdAt.getFullYear();
      
      const bucket = data.find(b => b.monthVal === m && b.yearVal === y);
      if (bucket) {
        bucket.responses++;
      }
    });

    forms.forEach(f => {
      const createdAt = new Date(f.createdAt);
      const m = createdAt.getMonth();
      const y = createdAt.getFullYear();
      
      const bucket = data.find(b => b.monthVal === m && b.yearVal === y);
      if (bucket) {
        bucket.forms++;
      }
    });

    return data;
  }, [submissions, forms]);

  const catData = categories.map(c => ({
    name: c.name, value: submissions.filter(s => s.category === c.name).length, color: c.color,
  })).filter(c => c.value > 0);

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Responses', value: total, color: '#2563EB', bg: '#DBEAFE', change: '+12%' },
          { label: 'Pending Review', value: pending, color: '#D97706', bg: '#FEF3C7', change: 'Active' },
          { label: 'Approved', value: approved, color: '#059669', bg: '#D1FAE5', change: `${total ? Math.round(approved / total * 100) : 0}%` },
          { label: 'Rejected', value: rejected, color: '#DC2626', bg: '#FEE2E2', change: `${total ? Math.round(rejected / total * 100) : 0}%` },
          { label: 'Active Forms', value: forms.filter(f => f.status === 'published').length, color: '#7C3AED', bg: '#F5F3FF', change: 'Live' },
          { label: 'Total Forms', value: forms.length, color: '#0891B2', bg: '#E0F2FE', change: 'All time' },
        ].map(k => (
          <Grid xs={6} sm={4} md={2} key={k.label}>
            <Card sx={{ borderRadius: 2.5, border: `1px solid ${k.color}20` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</Typography>
                <Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 600, display: 'block', mt: 0.5 }}>{k.label}</Typography>
                <Chip label={k.change} size="small" sx={{ mt: 0.5, bgcolor: k.bg, color: k.color, fontSize: '0.65rem', height: 18, fontWeight: 700 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Trend */}
        <Grid xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendIcon sx={{ color: '#2563EB' }} /> Monthly Submission Trends
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyTrendData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <RechartTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                  <Legend />
                  <Bar dataKey="responses" name="Responses" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="forms" name="Forms Created" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Pie */}
        <Grid xs={12} md={5}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieIcon sx={{ color: '#7C3AED' }} /> Category Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={renderLabel}>
                    {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <RechartTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                {catData.map(c => (
                  <Chip key={c.name} label={`${c.name}: ${c.value}`} size="small"
                    sx={{ bgcolor: c.color + '18', color: c.color, fontWeight: 700, fontSize: '0.68rem' }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Response trend line */}
        <Grid xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5 }}>Response Velocity</Typography>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <RechartTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                  <Line type="monotone" dataKey="responses" stroke="#2563EB" strokeWidth={3} dot={{ fill: '#2563EB', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ════════════════════════════════════════════════════════════════
//  CATEGORY MANAGEMENT TAB
// ════════════════════════════════════════════════════════════════
const CategoryTab = ({ categories }) => {
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7C3AED');
  const [icon, setIcon] = useState('💡');
  const [snack, setSnack] = useState({ open: false, msg: '' });
  const toast = m => setSnack({ open: true, msg: m });

  const COLORS = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#0891B2', '#DB2777', '#9333EA', '#0284C7', '#16A34A'];
  const ICONS = ['💡', '⚙️', '💰', '🤖', '🛡️', '✅', '🚀', '📊', '🔬', '🌱', '🏆', '⭐', '🎯', '💼'];

  const reset = () => { setEditId(null); setName(''); setColor('#7C3AED'); setIcon('💡'); };
  const save = () => {
    if (!name.trim()) return;
    if (editId) { formStore.updateCategory(editId, { name: name.trim(), color, icon }); toast('Category updated'); }
    else { formStore.addCategory({ id: uid(), name: name.trim(), color, icon, enabled: true }); toast('Category added'); }
    reset();
  };
  const startEdit = c => { setEditId(c.id); setName(c.name); setColor(c.color); setIcon(c.icon); };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Left: Form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: '1.5px solid #E9D5FF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5, color: '#7C3AED' }}>
                {editId ? '✏️ Edit Category' : '➕ New Category'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Category Name *" fullWidth size="small" value={name} onChange={e => setName(e.target.value)} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#546E7A', mb: 1, display: 'block' }}>Color</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {COLORS.map(c => (
                      <Box key={c} onClick={() => setColor(c)} sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: color === c ? '3px solid #1A2332' : '3px solid transparent', '&:hover': { transform: 'scale(1.2)' }, transition: 'all 0.15s' }} />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#546E7A', mb: 1, display: 'block' }}>Icon</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {ICONS.map(ic => (
                      <Box key={ic} onClick={() => setIcon(ic)} sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer', bgcolor: icon === ic ? '#E9D5FF' : '#F8F7FF', border: icon === ic ? '2px solid #7C3AED' : '2px solid transparent', '&:hover': { bgcolor: '#E9D5FF' }, transition: 'all 0.15s' }}>{ic}</Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={save} disabled={!name.trim()} sx={{ background: 'linear-gradient(135deg,#7C3AED,#9333EA)', boxShadow: 'none' }}>
                    {editId ? 'Update' : 'Add Category'}
                  </Button>
                  {editId && <Button variant="outlined" onClick={reset}>Cancel</Button>}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Grid */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {categories.map(cat => {
              const formCount = formStore.getForms().filter(f => f.category === cat.name).length;
              return (
                <Grid item xs={12} sm={6} key={cat.id}>
                  <Card sx={{ borderRadius: 2.5, border: `1.5px solid ${cat.color}25`, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${cat.color}20` } }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: cat.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{cat.icon}</Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A2332', lineHeight: 1.2 }}>{cat.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cat.color }} />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: cat.color, fontSize: '0.68rem' }}>{cat.color}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                          <Chip label={`${formCount} form${formCount !== 1 ? 's' : ''}`} size="small" sx={{ bgcolor: cat.color + '10', color: cat.color, fontWeight: 700, fontSize: '0.68rem' }} />
                          <Chip label={cat.enabled ? 'Active' : 'Disabled'} size="small"
                            sx={{ bgcolor: cat.enabled ? '#D1FAE5' : '#F3F4F6', color: cat.enabled ? '#059669' : '#6B7280', fontWeight: 700, fontSize: '0.68rem' }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title={cat.enabled ? 'Disable' : 'Enable'}>
                            <IconButton size="small" onClick={() => formStore.toggleCategory(cat.id)}>
                              {cat.enabled ? <UnlockIcon sx={{ fontSize: 15, color: '#059669' }} /> : <LockIcon sx={{ fontSize: 15, color: '#94A3B8' }} />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => startEdit(cat)} sx={{ '&:hover': { color: '#2563EB' } }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => formStore.deleteCategory(cat.id)} sx={{ '&:hover': { color: '#DC2626' } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ════════════════════════════════════════════════════════════════
//  TEMPLATES TAB
// ════════════════════════════════════════════════════════════════
const TemplatesTab = ({ templates, categories, onUseTemplate }) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="body2" sx={{ color: '#546E7A', mb: 3 }}>Start with a pre-built template to save time. You can fully customise it after selection.</Typography>
    <Grid container spacing={2.5}>
      {templates.map(tpl => {
        const cat = categories.find(c => c.name === tpl.category);
        return (
          <Grid item xs={12} sm={6} md={4} key={tpl.id}>
            <Card sx={{ borderRadius: 3, border: '1.5px solid #E5E7EB', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', borderColor: '#2563EB' } }}
              onClick={() => onUseTemplate(tpl)}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ fontSize: '2.5rem', mb: 1.5 }}>{tpl.icon}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A2332', mb: 0.5 }}>{tpl.name}</Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2, fontSize: '0.82rem', lineHeight: 1.5 }}>{tpl.description}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {cat && <Chip label={`${cat.icon} ${cat.name}`} size="small" sx={{ bgcolor: cat.color + '12', color: cat.color, fontWeight: 700, fontSize: '0.7rem' }} />}
                  <Chip label={`${(tpl.sections || []).reduce((a, s) => a + (s.fields || []).length, 0)} fields`} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
              </CardContent>
              <Box sx={{ px: 3, pb: 2.5 }}>
                <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: '#2563EB', color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }}>
                  Use Template
                </Button>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);

// ════════════════════════════════════════════════════════════════
//  RESPONSE TABLE
// ════════════════════════════════════════════════════════════════
const ResponsesDialog = ({ open, onClose, form }) => {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => { if (form) setSubs(formStore.getSubmissions(form.id)); }, [form]);
  useEffect(() => {
    const unsub = formStore.subscribe(() => { if (form) setSubs(formStore.getSubmissions(form.id)); });
    return unsub;
  }, [form]);

  const filtered = subs.filter(s => {
    const matchStatus = filter === 'all' || s.status === filter;
    const matchSearch = !search || 
      (s.employeeName && s.employeeName.toLowerCase().includes(search.toLowerCase())) || 
      (s.parsedTitle && s.parsedTitle.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const rows = [['#', 'Employee', 'Department', 'Idea Title', 'Status', 'Submitted At'], ...filtered.map((s, i) => [i + 1, s.employeeName, s.dept, s.parsedTitle, s.status, new Date(s.createdAt).toLocaleString()])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `responses-${form?.slug || 'export'}.csv`; a.click();
  };

  const handleOpenDetails = (row) => {
    setSelectedSub(row);
    setDrawerOpen(true);
  };

  if (!form) return null;
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <StatsIcon sx={{ color: '#2563EB' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Responses — {form.name}</Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>{subs.length} total responses</Typography>
          </Box>
          <Button startIcon={<DownloadIcon />} variant="outlined" size="small" onClick={exportCSV} sx={{ mr: 1 }}>Export CSV</Button>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <Box sx={{ px: 3, py: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
            {[['all', 'All'], ['new', 'New'], ['reviewing', 'Under Review'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([v, l]) => (
              <ToggleButton 
                key={v} 
                value={v} 
                sx={{ 
                  px: 2, 
                  fontWeight: 600, 
                  fontSize: '0.78rem',
                  ...(v === 'rejected' ? { 
                    '&.Mui-selected': { color: '#DC2626', bgcolor: '#FEE2E2', '&:hover': { bgcolor: '#FEE2E2' } },
                    color: '#DC2626'
                  } : {})
                }}
              >
                {l}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <TextField size="small" placeholder="Search responses..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 200 }} />
        </Box>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#94A3B8' }}>
              <StatsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>No responses found</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {['#', 'Employee', 'Department', 'Idea Title', 'Submitted At', 'Status', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#475569', bgcolor: '#F8FAFC' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((sub, idx) => (
                    <TableRow key={sub.id} hover>
                      <TableCell sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', fontWeight: 800, bgcolor: '#1A2332' }}>{sub.employeeName?.[0]}</Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{sub.employeeName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#475569' }}>{sub.dept}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{sub.parsedTitle}</Typography></TableCell>
                      <TableCell><Typography variant="caption" sx={{ color: '#94A3B8' }}>{new Date(sub.createdAt).toLocaleDateString()}</Typography></TableCell>
                      <TableCell>
                        <FormControl size="small" variant="standard">
                          <Select value={sub.status || 'new'} onChange={e => formStore.updateSubmissionStatus(sub.id, e.target.value)} disableUnderline
                            sx={{ fontWeight: 700, fontSize: '0.78rem', color: sub.status === 'approved' ? '#059669' : sub.status === 'rejected' ? '#DC2626' : '#D97706' }}>
                            <MenuItem value="new">Pending</MenuItem>
                            <MenuItem value="reviewing">Under Review</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Inspect Details">
                          <IconButton size="small" onClick={() => handleOpenDetails(sub)} sx={{ '&:hover': { color: '#059669' } }}>
                            <PreviewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => formStore.deleteSubmission(sub.id)} sx={{ '&:hover': { color: '#DC2626' } }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', md: 600 }, bgcolor: '#F8FAFC' } }}>
        {selectedSub && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Submission Details</Typography>
                <Typography variant="caption" sx={{ color: '#546E7A' }}>{selectedSub.parsedTitle}</Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: 'none' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Employee Information</Typography>
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
                        <Typography variant="body2">{new Date(selectedSub.createdAt).toLocaleDateString()}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: 'none' }}>
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

                <Grid item xs={12}>
                  <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E0E0E0', boxShadow: 'none' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Complete Form Details</Typography>
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

                <Grid item xs={12}>
                  <Timeline timeline={selectedSub.timeline} />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Drawer>
    </>
  );
};

// ════════════════════════════════════════════════════════════════
//  LINK SETTINGS DIALOG
// ════════════════════════════════════════════════════════════════
const LinkSettingsDialog = ({ open, onClose, form, onSave }) => {
  // ⚠️ ALL hooks must come before any conditional returns (Rules of Hooks)
  const [settings, setSettings] = useState(form?.linkSettings || {});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (form) setSettings({ ...form.linkSettings });
  }, [form]);

  // helpers – defined after hooks, before any early return
  const set = k => e => setSettings(p => ({ ...p, [k]: e.target?.value ?? e }));
  const url = form ? `${window.location.origin}/form/${form.slug}` : '';
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <LinkIcon sx={{ color: '#059669' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>Link Settings — {form.name}</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* URL Display */}
        <Box sx={{ bgcolor: '#F0FFF4', border: '1px solid #A7F3D0', borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669', display: 'block', mb: 0.5 }}>Public Form URL</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace', color: '#1E293B', wordBreak: 'break-all', fontSize: '0.8rem' }}>{url}</Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy'}><IconButton size="small" onClick={copy} sx={{ color: copied ? '#059669' : '#2563EB' }}>{copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}</IconButton></Tooltip>
            <Tooltip title="Open Form"><IconButton size="small" onClick={() => window.open(`/form/${form.slug}`, '_blank')} sx={{ color: '#7C3AED' }}><OpenIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        </Box>
        <FormControlLabel control={<Switch checked={!!settings.active} onChange={e => setSettings(p => ({ ...p, active: e.target.checked }))} color="success" />}
          label={<Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Link Active</Typography><Typography variant="caption" sx={{ color: '#94A3B8' }}>External users can access this form</Typography></Box>} />
        <Divider />
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>Expiry Date</Typography>
          <TextField type="date" size="small" fullWidth value={settings.expiryDate || ''} onChange={set('expiryDate')}
            InputProps={{ startAdornment: <InputAdornment position="start"><ExpiryIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment> }} />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>Maximum Responses</Typography>
          <TextField type="number" size="small" fullWidth value={settings.maxResponses || ''} onChange={set('maxResponses')}
            placeholder="Leave blank for unlimited"
            InputProps={{ startAdornment: <InputAdornment position="start"><GroupIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment> }} />
        </Box>
        <FormControlLabel control={<Switch checked={!!settings.onePerUser} onChange={e => setSettings(p => ({ ...p, onePerUser: e.target.checked }))} />}
          label={<Box><Typography variant="body2" sx={{ fontWeight: 700 }}>One Response Per User</Typography><Typography variant="caption" sx={{ color: '#94A3B8' }}>Prevents duplicate submissions</Typography></Box>} />
        <Divider />
        <Button variant="outlined" startIcon={<RegenerateIcon />} onClick={() => { formStore.regenerateSlug(form.id); onClose(); }}
          sx={{ borderColor: '#D97706', color: '#D97706', '&:hover': { bgcolor: '#FFFBEB' } }}>
          Regenerate Link Slug
        </Button>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#E5E7EB' }}>Cancel</Button>
        <Button variant="contained" onClick={() => { formStore.updateLinkSettings(form.id, settings); onSave?.(); onClose(); }}>Save Settings</Button>
      </DialogActions>
    </Dialog>
  );
};

// ════════════════════════════════════════════════════════════════
//  VERSION HISTORY DIALOG
// ════════════════════════════════════════════════════════════════
const VersionHistoryDialog = ({ open, onClose, form }) => {
  if (!form) return null;
  const versions = formStore.getVersions(form.id);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <HistoryIcon sx={{ color: '#7C3AED' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>Version History</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {versions.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', py: 4 }}>No version history available.</Typography>
        ) : versions.map((v, i) => (
          <Box key={v.version} sx={{ display: 'flex', gap: 2, py: 2, borderBottom: i < versions.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: v.version === form.currentVersion ? '#1A2332' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: v.version === form.currentVersion ? '#fff' : '#475569' }}>v{v.version}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Version {v.version}</Typography>
                {v.version === form.currentVersion && <Chip label="Current" size="small" sx={{ bgcolor: '#D1FAE5', color: '#059669', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />}
              </Box>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>{new Date(v.savedAt).toLocaleString()} · {v.note}</Typography>
            </Box>
            {v.version !== form.currentVersion && (
              <Tooltip title="Restore this version">
                <Button size="small" startIcon={<RestoreIcon />} variant="outlined" onClick={() => { formStore.restoreVersion(form.id, v.version); onClose(); }}
                  sx={{ borderColor: '#7C3AED', color: '#7C3AED', '&:hover': { bgcolor: '#F5F3FF' }, flexShrink: 0 }}>
                  Restore
                </Button>
              </Tooltip>
            )}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

// ════════════════════════════════════════════════════════════════
//  FORM BUILDER / EDITOR DIALOG
// ════════════════════════════════════════════════════════════════
// ── Inline Form Builder Data ─────────────────────────────────────────────────
const FB_DEPARTMENTS = [
  { id: 'engineering', label: 'Engineering & Technology' },
  { id: 'operations', label: 'Operations' },
  { id: 'finance', label: 'Finance & Accounting' },
  { id: 'hr', label: 'Human Resources' },
  { id: 'marketing', label: 'Marketing & Communications' },
  { id: 'it', label: 'Information Technology' },
  { id: 'quality', label: 'Quality Assurance' },
  { id: 'rnd', label: 'Research & Development' },
];
const FB_SUB_DEPARTMENTS = {
  engineering: [{ id: 'mechanical', label: 'Mechanical Engineering' }, { id: 'electrical', label: 'Electrical Engineering' }, { id: 'civil', label: 'Civil Engineering' }, { id: 'chemical', label: 'Chemical Engineering' }],
  operations: [{ id: 'supply_chain', label: 'Supply Chain' }, { id: 'manufacturing', label: 'Manufacturing' }, { id: 'logistics', label: 'Logistics' }, { id: 'maintenance', label: 'Maintenance' }],
  finance: [{ id: 'budgeting', label: 'Budgeting & Planning' }, { id: 'accounts', label: 'Accounts & Payables' }, { id: 'treasury', label: 'Treasury' }, { id: 'audit', label: 'Internal Audit' }],
  hr: [{ id: 'talent', label: 'Talent Acquisition' }, { id: 'learning', label: 'Learning & Development' }, { id: 'compensation', label: 'Compensation & Benefits' }, { id: 'employee_relations', label: 'Employee Relations' }],
  marketing: [{ id: 'digital', label: 'Digital Marketing' }, { id: 'brand', label: 'Brand Management' }, { id: 'pr', label: 'Public Relations' }, { id: 'events', label: 'Events & Campaigns' }],
  it: [{ id: 'infrastructure', label: 'IT Infrastructure' }, { id: 'software', label: 'Software Development' }, { id: 'security', label: 'Cybersecurity' }, { id: 'support', label: 'IT Support' }],
  quality: [{ id: 'qa_testing', label: 'QA Testing' }, { id: 'compliance', label: 'Compliance & Standards' }, { id: 'process_audit', label: 'Process Audit' }, { id: 'certifications', label: 'Certifications' }],
  rnd: [{ id: 'product_research', label: 'Product Research' }, { id: 'innovation_lab', label: 'Innovation Lab' }, { id: 'data_science', label: 'Data Science' }, { id: 'prototype', label: 'Prototyping & Testing' }],
};
const FB_SUB_SUB_DEPARTMENTS = {
  mechanical: [{ id: 'design', label: 'Design Engineering' }, { id: 'simulation', label: 'Simulation & Analysis' }, { id: 'tooling', label: 'Tooling' }],
  electrical: [{ id: 'power', label: 'Power Systems' }, { id: 'instrumentation', label: 'Instrumentation' }, { id: 'automation_ctrl', label: 'Automation & Control' }],
  supply_chain: [{ id: 'procurement', label: 'Procurement' }, { id: 'inventory', label: 'Inventory Management' }, { id: 'vendor_mgmt', label: 'Vendor Management' }],
  manufacturing: [{ id: 'production', label: 'Production Planning' }, { id: 'lean', label: 'Lean Manufacturing' }, { id: 'assembly', label: 'Assembly Operations' }],
  software: [{ id: 'frontend', label: 'Frontend Development' }, { id: 'backend', label: 'Backend Development' }, { id: 'devops', label: 'DevOps & CI/CD' }],
  digital: [{ id: 'seo', label: 'SEO & Content' }, { id: 'social', label: 'Social Media' }, { id: 'analytics', label: 'Analytics & Reporting' }],
  talent: [{ id: 'campus', label: 'Campus Recruitment' }, { id: 'lateral', label: 'Lateral Hiring' }, { id: 'executive', label: 'Executive Search' }],
  innovation_lab: [{ id: 'ideation', label: 'Ideation Hub' }, { id: 'poc', label: 'Proof of Concept' }, { id: 'incubation', label: 'Incubation' }],
};
const FB_PROCESS_OPTIONS = [
  { value: 'process_development', label: 'Process Development' },
  { value: 'product_development', label: 'Product Development' },
];
const FB_ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
};
const FB_MAX_WORDS = 200;
const fbCountWords = t => (!t || !t.trim() ? 0 : t.trim().split(/\s+/).filter(Boolean).length);

const FB_INITIAL = { submissionType: '', name: '', dob: '', employeeCode: '', department: '', subDepartment: '', subSubDepartment: '', processProduct: '', reportingManagerName: '', reportingManagerEmail: '', hodName: '', hodEmail: '', title: '', introduction: '', methodology: '', benefits: '', attachments: [] };

// ── Sub-components used inside the dialog ─────────────────────────────────────
const FBWordBar = ({ text, max }) => {
  const c = fbCountWords(text), over = c > max;
  const pct = Math.min((c / max) * 100, 100);
  const col = over ? '#C62828' : c > max * 0.85 ? '#F57C00' : '#2E7D32';
  return (
    <Box sx={{ mt: 0.75 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
        <Typography variant="caption" sx={{ color: over ? '#C62828' : '#78909C', fontWeight: 600, fontSize: '0.72rem' }}>
          {over ? `⚠ +${c - max} words over limit` : `${c} / ${max} words`}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2, bgcolor: '#E0E0E0', '& .MuiLinearProgress-bar': { bgcolor: col, borderRadius: 2 } }} />
    </Box>
  );
};

const FBSecCard = ({ title, icon, accentColor = '#2E7D32', children }) => (
  <Card sx={{ mb: 2.5, borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'visible', position: 'relative' }}>
    <Box sx={{ position: 'absolute', top: -13, left: 20, bgcolor: accentColor, color: '#fff', borderRadius: 1.5, px: 1.5, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.75, boxShadow: `0 3px 10px ${accentColor}50`, zIndex: 1 }}>
      {React.cloneElement(icon, { sx: { fontSize: 14 } })}
      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', letterSpacing: 0.4 }}>{title}</Typography>
    </Box>
    <CardContent sx={{ pt: 3.5, px: 2.5, pb: 2.5 }}>{children}</CardContent>
  </Card>
);

// ── The Main Dialog ───────────────────────────────────────────────────────────
const DEFAULT_SECTIONS = [
  { id: 'sec-0', title: 'Submission Type', fields: [{ id: 'submissionType', label: 'Submission Type', type: 'radio', options: ['Idea', 'Proposal'], required: true, enabled: true }] },
  { id: 'sec-1', title: 'Basic Information', fields: [{ id: 'name', label: 'Full Name', type: 'text', required: true, enabled: true }, { id: 'dob', label: 'Date of Birth', type: 'date', required: true, enabled: true }, { id: 'employeeCode', label: 'Employee Code', type: 'text', required: true, enabled: true }] },
  { id: 'sec-2', title: 'Organization Details', fields: [{ id: 'department', label: 'Department', type: 'dropdown', required: true, enabled: true }, { id: 'subDepartment', label: 'Sub Department', type: 'dropdown', required: true, enabled: true }, { id: 'subSubDepartment', label: 'Sub Sub Department', type: 'dropdown', required: false, enabled: true }] },
  { id: 'sec-3', title: 'Classification', fields: [{ id: 'processProduct', label: 'Process / Product Development', type: 'dropdown', required: true, enabled: true }] },
  { id: 'sec-4', title: 'Management Information', fields: [{ id: 'reportingManagerName', label: 'Reporting Manager Name', type: 'text', required: true, enabled: true }, { id: 'reportingManagerEmail', label: 'Reporting Manager Email', type: 'email', required: true, enabled: true }, { id: 'hodName', label: 'HOD Name', type: 'text', required: true, enabled: true }, { id: 'hodEmail', label: 'HOD Email', type: 'email', required: true, enabled: true }] },
  { id: 'sec-5', title: 'Submission Details', fields: [
    { id: 'title', label: 'Project title', type: 'text', required: true, enabled: true },
    { id: 'problemStatement', label: 'PROBLEM STATEMENT', type: 'textarea', required: true, enabled: true },
    { id: 'proposedSolution', label: 'Proposed solution', type: 'textarea', required: true, enabled: true },
    { id: 'objectives', label: 'Objectives', type: 'textarea', required: true, enabled: true },
    { id: 'keyDeliverables', label: 'Key Deliverables', type: 'textarea', required: true, enabled: true },
    { id: 'timelinesAndBudget', label: 'Timelines and Budget', type: 'textarea', required: true, enabled: true },
    { id: 'overallBudget', label: 'Overall Budget', type: 'textarea', required: true, enabled: true },
    { id: 'expectedBenefits', label: 'Expected Benefits', type: 'textarea', required: true, enabled: true },
    { id: 'projectTeam', label: 'Project Team', type: 'textarea', required: true, enabled: true }
  ] },
  { id: 'sec-6', title: 'Attachments', fields: [{ id: 'attachments', label: 'Attachments', type: 'file', required: false, enabled: true }] }
];

const FormEditorDialog = ({ open, onClose, formToEdit, categories, onSave }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    category: '',
    description: '',
    sections: JSON.parse(JSON.stringify(DEFAULT_SECTIONS))
  });

  const [expandedSec, setExpandedSec] = React.useState('sec-0');

  React.useEffect(() => {
    if (open) {
      if (formToEdit) {
        let parsedSections = formToEdit.sections && formToEdit.sections.length > 0 && formToEdit.sections[0].fields 
          ? JSON.parse(JSON.stringify(formToEdit.sections))
          : JSON.parse(JSON.stringify(DEFAULT_SECTIONS));

        if (formToEdit.sections && formToEdit.sections.length > 0 && !formToEdit.sections[0].fields) {
           const activeTitles = formToEdit.sections.map(s => s.title);
           parsedSections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS)).map(sec => ({
             ...sec,
             fields: sec.fields.map(f => ({ ...f, enabled: activeTitles.includes(sec.title) }))
           }));
        }

        setFormData({
          name: formToEdit.name || '',
          category: formToEdit.category || '',
          description: formToEdit.description || '',
          sections: parsedSections
        });
      } else {
        setFormData({ name: '', category: '', description: '', sections: JSON.parse(JSON.stringify(DEFAULT_SECTIONS)) });
      }
      setExpandedSec('sec-0');
    }
  }, [open, formToEdit]);

  // Auto-save to backend whenever formData changes (only for existing forms)
  React.useEffect(() => {
    if (!open || !formToEdit || !formData.name) return;

    const timer = setTimeout(() => {
      try {
        const newForm = {
          id: formToEdit.id,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          status: formToEdit.status,
          slug: formToEdit.slug,
          createdAt: formToEdit.createdAt,
          updatedAt: new Date().toISOString(),
          sections: formData.sections,
          linkSettings: formToEdit.linkSettings,
          responses: formToEdit.responses,
          currentVersion: formToEdit.currentVersion
        };
        formStore.updateForm(newForm.id, newForm).catch(err => console.error("Auto-save failed", err));
      } catch (err) {
        console.error("Auto-save error", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, open, formToEdit]);

  const handleFieldChange = (secId, fieldId, key, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          fields: sec.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f)
        };
      })
    }));
  };

  const moveField = (secId, fieldIdx, direction) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id !== secId) return sec;
        const newFields = [...sec.fields];
        if (direction === -1 && fieldIdx > 0) {
          [newFields[fieldIdx - 1], newFields[fieldIdx]] = [newFields[fieldIdx], newFields[fieldIdx - 1]];
        } else if (direction === 1 && fieldIdx < newFields.length - 1) {
          [newFields[fieldIdx + 1], newFields[fieldIdx]] = [newFields[fieldIdx], newFields[fieldIdx + 1]];
        }
        return { ...sec, fields: newFields };
      })
    }));
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    const newForm = {
      id: formToEdit ? formToEdit.id : `form-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      status: formToEdit ? formToEdit.status : 'published',
      slug: formToEdit ? formToEdit.slug : slugify(formData.name),
      createdAt: formToEdit ? formToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: formData.sections,
      linkSettings: formToEdit ? formToEdit.linkSettings : { active: true, expiryDate: '', maxResponses: 500, onePerUser: false },
      responses: formToEdit ? formToEdit.responses : 0,
      currentVersion: formToEdit ? formToEdit.currentVersion : 1
    };

    if (formToEdit) {
      formStore.updateForm(newForm.id, newForm);
    } else {
      formStore.addForm(newForm);
    }
    
    if (onSave) onSave(newForm);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #E5E7EB', bgcolor: '#fff' }}>
        <BuildIcon sx={{ color: '#0277BD' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>{formToEdit ? 'Edit Form Settings' : 'Create New Form'}</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: '#F9FAFB', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* LEFT COLUMN - BUILDER */}
        <Box sx={{ width: { xs: '100%', md: '50%' }, p: 3, borderRight: { md: '1px solid #E5E7EB' }, overflowY: 'auto' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#374151' }}>Form Name <span style={{color: '#EF4444'}}>*</span></Typography>
          <TextField fullWidth size="small" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Innovation Ideas 2026" sx={{ mb: 3, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#374151' }}>Category <span style={{color: '#EF4444'}}>*</span></Typography>
              <FormControl fullWidth size="small" sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <Select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} displayEmpty>
                  <MenuItem value="" disabled>Select Category</MenuItem>
                  {categories?.map(c => <MenuItem key={c.id || c.name} value={c.name}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#374151' }}>Description</Typography>
              <TextField fullWidth size="small" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short description..." sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Form Sections & Fields
            <Chip label="Enterprise Builder" size="small" sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 700, fontSize: '0.7rem' }} />
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <FormBuilder
              sections={formData.sections}
              onChange={(newSecs) => setFormData(p => ({ ...p, sections: newSecs }))}
            />
          </Box>
        </Box>

        {/* RIGHT COLUMN - LIVE PREVIEW */}
        <Box sx={{ width: { xs: '100%', md: '50%' }, bgcolor: '#F0F2F5', p: 3, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PreviewIcon sx={{ color: '#059669' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, flex: 1 }}>Live Form Preview</Typography>
            <Chip label="Updates in real-time" size="small" sx={{ bgcolor: '#D1FAE5', color: '#059669', fontWeight: 800, fontSize: '0.7rem' }} />
          </Box>

          <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <Box sx={{ background: 'linear-gradient(135deg,#1A2332 0%,#2E3D52 100%)', px: 3, py: 2.5 }}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>{formData.name || 'Untitled Form'}</Typography>
              {formData.description && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>{formData.description}</Typography>}
            </Box>
            <CardContent sx={{ p: 3 }}>
              {formData.sections.map((sec, si) => {
                const hasSubSecs = sec.subSections && sec.subSections.length > 0;
                const hasFields = sec.fields && sec.fields.length > 0;
                if (!hasSubSecs && !hasFields) return null;

                return (
                  <Box key={sec.id} sx={{ mb: 3.5 }}>
                    <Box sx={{ mb: 2, pb: 1, borderBottom: '2px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`Section ${si + 1}`} size="small" sx={{ bgcolor: '#1A2332', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1A2332' }}>{sec.title}</Typography>
                    </Box>
                    
                    {/* Flat fields */}
                    <Grid container spacing={2} sx={{ mb: hasSubSecs ? 2 : 0 }}>
                      {(sec.fields || []).filter(f => f.enabled !== false).map(field => (
                        <Grid item xs={12} sm={['textarea', 'file'].includes(field.type) ? 12 : 6} key={field.id}>
                          {field.type === 'textarea' ? <TextField label={`${field.label}${field.required ? ' *' : ''}`} fullWidth multiline rows={2} placeholder={field.placeholder} InputLabelProps={{ shrink: true }} disabled size="small" />
                            : field.type === 'file' ? <Box sx={{ border: '2px dashed #CBD5E1', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: '#F8FAFC' }}><Typography variant="body2" sx={{ color: '#94A3B8' }}>📎 {field.label}{field.required ? ' *' : ''}</Typography></Box>
                              : field.type === 'dropdown' ? <FormControl fullWidth disabled size="small"><InputLabel shrink>{field.label}{field.required ? ' *' : ''}</InputLabel><Select label={field.label} value="" notched>{(field.options || []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></FormControl>
                                : field.type === 'radio' ? <FormControl disabled size="small"><Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 600 }}>{field.label}{field.required ? ' *' : ''}</Typography><Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>{(field.options || []).map(o => <FormControlLabel key={o} control={<Checkbox disabled size="small" />} label={o} />)}</Box></FormControl>
                                  : <TextField label={`${field.label}${field.required ? ' *' : ''}`} fullWidth type={field.type === 'date' ? 'date' : 'text'} placeholder={field.placeholder} InputLabelProps={{ shrink: true }} disabled size="small" />}
                        </Grid>
                      ))}
                    </Grid>

                    {/* Sub-sections */}
                    {(sec.subSections || []).map((sub) => (
                      <Box key={sub.id} sx={{ mb: 2, ml: 2, p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FAFBFB' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155', mb: 1.5 }}>{sub.title}</Typography>
                        <Grid container spacing={2}>
                          {(sub.fields || []).filter(f => f.enabled !== false).map(field => (
                            <Grid item xs={12} sm={['textarea', 'file'].includes(field.type) ? 12 : 6} key={field.id}>
                              {field.type === 'textarea' ? <TextField label={`${field.label}${field.required ? ' *' : ''}`} fullWidth multiline rows={2} placeholder={field.placeholder} InputLabelProps={{ shrink: true }} disabled size="small" />
                                : field.type === 'file' ? <Box sx={{ border: '2px dashed #CBD5E1', borderRadius: 2, p: 2, textAlign: 'center', bgcolor: '#F8FAFC' }}><Typography variant="body2" sx={{ color: '#94A3B8' }}>📎 {field.label}{field.required ? ' *' : ''}</Typography></Box>
                                  : field.type === 'dropdown' ? <FormControl fullWidth disabled size="small"><InputLabel shrink>{field.label}{field.required ? ' *' : ''}</InputLabel><Select label={field.label} value="" notched>{(field.options || []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></FormControl>
                                    : field.type === 'radio' ? <FormControl disabled size="small"><Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 600 }}>{field.label}{field.required ? ' *' : ''}</Typography><Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>{(field.options || []).map(o => <FormControlLabel key={o} control={<Checkbox disabled size="small" />} label={o} />)}</Box></FormControl>
                                      : <TextField label={`${field.label}${field.required ? ' *' : ''}`} fullWidth type={field.type === 'date' ? 'date' : 'text'} placeholder={field.placeholder} InputLabelProps={{ shrink: true }} disabled size="small" />}
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                );
              })}
              {formData.sections.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                  <Typography variant="body2">No fields are enabled. Enable fields in the builder to see the preview.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E5E7EB', bgcolor: '#fff' }}>
        <Button onClick={onClose} sx={{ color: '#4B5563', fontWeight: 600 }}>Cancel</Button>
        <Button variant="contained" disabled={!formData.name || !formData.category} onClick={handleSave} sx={{ bgcolor: '#0277BD', fontWeight: 700, px: 3, borderRadius: 2, '&:hover': { bgcolor: '#01579B' } }}>{formToEdit ? 'Save Changes' : 'Create & Generate Link'}</Button>
      </DialogActions>
    </Dialog>
  );
};

// ════════════════════════════════════════════════════════════════
//  FORM PREVIEW DIALOG
// ════════════════════════════════════════════════════════════════
const FormPreviewDialog = ({ open, onClose, form, categories }) => {
  if (!form) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#F0F2F5' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff', borderBottom: '1px solid #F0F0F0' }}>
        <PreviewIcon sx={{ color: '#059669' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>Form Preview</Typography>
        <Chip label="External User View" size="small" sx={{ bgcolor: '#D1FAE5', color: '#059669', fontWeight: 800 }} />
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <Box sx={{ background: 'linear-gradient(135deg,#1A2332 0%,#2E3D52 100%)', px: 4, py: 3 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>{form.name}</Typography>
            {form.description && <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>{form.description}</Typography>}
          </Box>
          <CardContent sx={{ p: 3.5 }}>
            {(form.sections || []).filter(sec => (sec.fields || []).some(f => f.enabled !== false)).map((sec, si) => (
              <Box key={sec.id} sx={{ mb: 3 }}>
                <Box sx={{ mb: 2, pb: 1, borderBottom: '2px solid #F1F5F9' }}>
                  <Chip label={`Section ${si + 1}`} size="small" sx={{ bgcolor: '#1A2332', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 18, mr: 1 }} />
                  <Typography component="span" variant="subtitle1" sx={{ fontWeight: 800, color: '#1A2332' }}>{sec.title}</Typography>
                  {sec.description && <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.25 }}>{sec.description}</Typography>}
                </Box>
                <Grid container spacing={2}>
                  {(sec.fields || []).filter(f => f.enabled !== false).map(field => (
                    <Grid item xs={12} sm={['textarea', 'file'].includes(field.type) ? 12 : 6} key={field.id}>
                      {field.type === 'textarea' ? <TextField label={`${field.label}${field.required ? ' *' : ''}`} fullWidth multiline rows={3} placeholder={field.placeholder} InputLabelProps={{ shrink: true }} disabled />
                        : field.type === 'file' ? <Box sx={{ border: '2px dashed #CBD5E1', borderRadius: 2, p: 2.5, textAlign: 'center', bgcolor: '#F8FAFC' }}><Typography variant="body2" sx={{ color: '#94A3B8' }}>📎 {field.label}{field.required ? ' *' : ''}</Typography></Box>
                          : field.type === 'dropdown' ? <FormControl fullWidth disabled><InputLabel shrink>{field.label}{field.required ? ' *' : ''}</InputLabel><Select label={field.label} value="" notched>{(field.options || categories.map(c => c.name)).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></FormControl>
                            : field.type === 'rating' ? <Box><Typography variant="caption" sx={{ fontWeight: 700, color: '#546E7A' }}>{field.label}{field.required ? ' *' : ''}</Typography><Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>{[1, 2, 3, 4, 5].map(n => <StarIcon key={n} sx={{ color: '#F59E0B', fontSize: 24 }} />)}</Box></Box>
                              : <TextField label={`${field.label}${field.required ? ' *' : ''}`} fullWidth type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'} placeholder={field.placeholder} InputLabelProps={{ shrink: true }} disabled />}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
            <Divider sx={{ my: 2.5 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" disabled>Save Draft</Button>
              <Button variant="contained" disabled>Submit Idea</Button>
            </Box>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

// ════════════════════════════════════════════════════════════════
//  SUBMISSIONS TABLE (Main Tab)
// ════════════════════════════════════════════════════════════════
const SubmissionsTab = ({ forms, categories, submissions }) => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [responsesForm, setResponsesForm] = useState(null);
  const [previewForm, setPreviewForm] = useState(null);
  const [linkSettingsForm, setLinkSettingsForm] = useState(null);
  const [versionsForm, setVersionsForm] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuForm, setMenuForm] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'success' });
  const [editorOpen, setEditorOpen] = useState(false);
  const [formToEdit, setFormToEdit] = useState(null);

  const toast = (msg, type = 'success') => setSnack({ open: true, msg, type });

  const filtered = forms.filter(f => {
    const q = search.toLowerCase();
    const matchQ = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || f.category === catFilter;
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  const openMenu = (e, form) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuForm(form); };
  const closeMenu = () => { setMenuAnchor(null); setMenuForm(null); };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" placeholder="Search forms, categories..."
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 200 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} label="Category">
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c.id} value={c.name}>{c.icon} {c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Status">
            {[['all', 'All Status'], ['draft', 'Draft'], ['published', 'Published'], ['archived', 'Archived'], ['closed', 'Closed']].map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        <Chip label={`${filtered.length} forms`} size="small" sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569' }} />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2.5 }}>
        <Table>
          <TableHead>
            <TableRow>
              {['Form Name', 'Category', 'Created By', 'Created', 'Updated', 'Responses', 'Status', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', py: 1.5 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                <BuildIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3, display: 'block', mx: 'auto' }} />
                <Typography variant="body2">No forms found. Try adjusting filters.</Typography>
              </TableCell></TableRow>
            ) : filtered.map(form => {
              const cat = categories.find(c => c.name === form.category);
              return (
                <TableRow key={form.id} hover sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: '#1A2332', fontSize: '0.8rem', fontWeight: 800 }}>{form.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1A2332', fontSize: '0.85rem' }}>{form.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94A3B8', fontSize: '0.68rem' }}>/form/{form.slug}</Typography>
                          <Tooltip title="Copy link"><IconButton size="small" sx={{ p: 0.25 }} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/form/${form.slug}`); toast('Link copied!'); }}>
                            <CopyIcon sx={{ fontSize: 11, color: '#CBD5E1' }} />
                          </IconButton></Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {cat ? <Chip label={`${cat.icon} ${cat.name}`} size="small" sx={{ bgcolor: cat.color + '15', color: cat.color, fontWeight: 700, fontSize: '0.72rem' }} /> : '—'}
                  </TableCell>
                  <TableCell><Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 600 }}>{form.createdBy}</Typography></TableCell>
                  <TableCell><Typography variant="caption" sx={{ color: '#94A3B8' }}>{new Date(form.createdAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell><Typography variant="caption" sx={{ color: '#94A3B8' }}>{new Date(form.updatedAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => setResponsesForm(form)} sx={{ fontWeight: 800, color: form.responses > 0 ? '#2563EB' : '#94A3B8', minWidth: 0 }}>
                      {form.responses || 0}
                    </Button>
                  </TableCell>
                  <TableCell><StatusChip status={form.status} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Responses"><IconButton size="small" onClick={() => setResponsesForm(form)} sx={{ '&:hover': { color: '#2563EB' } }}><StatsIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                      <Tooltip title="Preview Form"><IconButton size="small" onClick={() => setPreviewForm(form)} sx={{ '&:hover': { color: '#059669' } }}><PreviewIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                      <Tooltip title="Link Settings"><IconButton size="small" onClick={() => setLinkSettingsForm(form)} sx={{ '&:hover': { color: '#7C3AED' } }}><LinkIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                      <Tooltip title="More"><IconButton size="small" onClick={e => openMenu(e, form)}><MoreVertIcon sx={{ fontSize: 17 }} /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* More Actions Menu */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu} PaperProps={{ sx: { borderRadius: 2.5, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 210 } }}>
        {menuForm && [
          <MenuItem key="edit" onClick={() => { setFormToEdit(menuForm); setEditorOpen(true); closeMenu(); }}>
            <ListItemIcon><EditIcon fontSize="small" sx={{ color: '#2563EB' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Edit Form</Typography>} />
          </MenuItem>,
          <MenuItem key="versions" onClick={() => { setVersionsForm(menuForm); closeMenu(); }}>
            <ListItemIcon><HistoryIcon fontSize="small" sx={{ color: '#7C3AED' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Version History</Typography>} />
          </MenuItem>,
          <MenuItem key="dup" onClick={() => { const c = formStore.duplicateForm(menuForm.id); toast(`Duplicated as "${c?.name}"`); closeMenu(); }}>
            <ListItemIcon><DuplicateIcon fontSize="small" sx={{ color: '#D97706' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Duplicate</Typography>} />
          </MenuItem>,
          <MenuItem key="tpl" onClick={() => { formStore.saveAsTemplate(menuForm); toast('Saved as template'); closeMenu(); }}>
            <ListItemIcon><TemplateIcon fontSize="small" sx={{ color: '#059669' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Save as Template</Typography>} />
          </MenuItem>,
          <MenuItem key="open" onClick={() => { window.open(`/form/${menuForm.slug}`, '_blank'); closeMenu(); }}>
            <ListItemIcon><OpenIcon fontSize="small" sx={{ color: '#0891B2' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Open Public Form</Typography>} />
          </MenuItem>,
          <Divider key="d1" />,
          menuForm.status === 'published'
            ? <MenuItem key="arch" onClick={() => { formStore.setStatus(menuForm.id, 'archived'); toast('Form archived'); closeMenu(); }}>
              <ListItemIcon><ArchiveIcon fontSize="small" sx={{ color: '#6B7280' }} /></ListItemIcon>
              <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Archive</Typography>} />
            </MenuItem>
            : <MenuItem key="pub" onClick={() => { formStore.setStatus(menuForm.id, 'published'); toast('Form published'); closeMenu(); }}>
              <ListItemIcon><PublishIcon fontSize="small" sx={{ color: '#059669' }} /></ListItemIcon>
              <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Publish</Typography>} />
            </MenuItem>,
          menuForm.status !== 'closed'
            ? <MenuItem key="close" onClick={() => { formStore.setStatus(menuForm.id, 'closed'); toast('Form closed'); closeMenu(); }}>
              <ListItemIcon><LockIcon fontSize="small" sx={{ color: '#DC2626' }} /></ListItemIcon>
              <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#DC2626' }}>Close Responses</Typography>} />
            </MenuItem>
            : null,
          <Divider key="d2" />,
          <MenuItem key="del" onClick={() => { formStore.deleteForm(menuForm.id); toast('Form deleted', 'info'); closeMenu(); }}>
            <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: '#DC2626' }} /></ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#DC2626' }}>Delete Form</Typography>} />
          </MenuItem>,
        ]}
      </Menu>

      <ResponsesDialog open={!!responsesForm} onClose={() => setResponsesForm(null)} form={responsesForm} />
      <FormPreviewDialog open={!!previewForm} onClose={() => setPreviewForm(null)} form={previewForm} categories={categories} />
      <LinkSettingsDialog open={!!linkSettingsForm} onClose={() => setLinkSettingsForm(null)} form={linkSettingsForm} onSave={() => toast('Link settings saved')} />
      <VersionHistoryDialog open={!!versionsForm} onClose={() => setVersionsForm(null)} form={versionsForm} />
      <FormEditorDialog open={editorOpen} onClose={() => { setEditorOpen(false); setFormToEdit(null); }} formToEdit={formToEdit} categories={categories} onSave={() => toast('Form updated')} />
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.type} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

// ════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════════
const FormUpload = () => {
  const { categories, forms, submissions, templates } = useStore();
  const [tab, setTab] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [formToEdit, setFormToEdit] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'success' });

  const toast = (msg, type = 'success') => setSnack({ open: true, msg, type });

  const notifications = [
    forms.filter(f => f.status === 'published' && f.linkSettings?.expiryDate && new Date(f.linkSettings.expiryDate) < new Date(Date.now() + 7 * 86400000)).length > 0 && 'Forms expiring soon',
    submissions.filter(s => s.status === 'pending').length > 0 && `${submissions.filter(s => s.status === 'pending').length} pending reviews`,
  ].filter(Boolean);

  const TABS = [
    { label: 'Forms', badge: forms.length },
    { label: 'Categories', badge: categories.length },
    { label: 'Templates', badge: templates.length },
    { label: 'Analytics', badge: null },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavNextIcon fontSize="small" sx={{ color: '#CBD5E1' }} />} sx={{ mb: 1 }}>
          <Link underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.82rem', color: '#94A3B8', cursor: 'pointer' }}>
            <HomeIcon sx={{ fontSize: 14 }} /> Admin
          </Link>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A2332' }}>Form Upload Manager</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1A2332', letterSpacing: '-0.5px' }}>Form Upload Manager</Typography>
            <Typography variant="body2" sx={{ color: '#78909C', mt: 0.5 }}>Create dynamic forms, generate shareable links and manage submissions</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {notifications.length > 0 && (
              <Tooltip title={notifications.join(', ')}>
                <Badge badgeContent={notifications.length} color="warning">
                  <IconButton sx={{ bgcolor: '#FEF3C7', color: '#D97706', '&:hover': { bgcolor: '#FDE68A' } }}><NotifIcon /></IconButton>
                </Badge>
              </Tooltip>
            )}
            <Button variant="outlined" startIcon={<CategoryIcon />} onClick={() => setTab(1)} sx={{ borderColor: '#7C3AED', color: '#7C3AED', '&:hover': { bgcolor: '#F5F3FF' } }}>
              Categories
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormToEdit(null); setEditorOpen(true); }}>
              Create Form
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Forms', value: forms.length, color: '#2563EB', bg: '#EFF6FF', sub: '+2 this month' },
          { label: 'Published', value: forms.filter(f => f.status === 'published').length, color: '#059669', bg: '#ECFDF5', sub: 'Live & accepting' },
          { label: 'Drafts', value: forms.filter(f => f.status === 'draft').length, color: '#D97706', bg: '#FFFBEB', sub: 'In progress' },
          { label: 'Total Responses', value: submissions.length, color: '#7C3AED', bg: '#F5F3FF', sub: '+5 this week' },
          { label: 'Pending Review', value: submissions.filter(s => s.status === 'pending').length, color: '#DC2626', bg: '#FEF2F2', sub: 'Need attention' },
          { label: 'Categories', value: categories.filter(c => c.enabled).length, color: '#0891B2', bg: '#E0F2FE', sub: `${categories.length} total` },
        ].map(s => (
          <Grid xs={6} sm={4} md={2} key={s.label}>
            <Card sx={{ borderRadius: 2.5, border: `1px solid ${s.color}18`, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 6px 20px ${s.color}18` } }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: s.color, lineHeight: 1, mb: 0.25 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', display: 'block' }}>{s.label}</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>{s.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: '1px solid #F0F0F0' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ px: 2 }}>
            {TABS.map((t, i) => (
              <Tab key={i} label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t.label}
                  {t.badge != null && <Chip label={t.badge} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, minWidth: 24, bgcolor: tab === i ? '#1A2332' : '#F1F5F9', color: tab === i ? '#fff' : '#475569' }} />}
                </Box>
              } />
            ))}
          </Tabs>
        </Box>

        {tab === 0 && <SubmissionsTab forms={forms} categories={categories} submissions={submissions} />}
        {tab === 1 && <CategoryTab categories={categories} />}
        {tab === 2 && <TemplatesTab templates={templates} categories={categories} onUseTemplate={tpl => { setFormToEdit(null); setEditorOpen(true); }} />}
        {tab === 3 && <AnalyticsTab forms={forms} submissions={submissions} categories={categories} />}
      </Card>

      {/* Create/Edit Form Dialog */}
      <FormEditorDialog
        open={editorOpen} onClose={() => { setEditorOpen(false); setFormToEdit(null); }}
        formToEdit={formToEdit} categories={categories}
        onSave={form => { toast(formToEdit ? 'Form updated!' : 'Form created! Share the generated link.'); }}
      />

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.type} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FormUpload;
