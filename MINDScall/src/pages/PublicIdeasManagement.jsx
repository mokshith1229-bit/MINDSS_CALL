import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Card, Grid, Button, TextField,
  InputAdornment, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, CircularProgress, Tooltip,
  Snackbar, Alert, Tabs, Tab, Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  WhatsApp as WhatsAppIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as PublishedIcon,
  HourglassEmpty as DraftIcon,
  VisibilityOff as UnpublishedIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  AutoAwesome as FeaturedIcon
} from '@mui/icons-material';
import api from '../utils/api';

const BRAND_GREEN = '#2E7D32';
const BRAND_GREEN_DARK = '#1B5E20';
const DEFAULT_PUBLIC_URL = 'https://mindss-call.vercel.app/public/ideas';

const getPublicUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    if (window.location.hostname === 'localhost') {
      return `${window.location.origin}/public/ideas`;
    }
  }
  return DEFAULT_PUBLIC_URL;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

const PublicIdeasManagement = () => {
  const [ideas, setIdeas] = useState([]);
  const [counts, setCounts] = useState({ total: 0, published: 0, draft: 0, unpublished: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit / Configuration Dialog State
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'Draft',
    customTitle: '',
    customDescription: '',
    coverImageUrl: '',
    featured: false,
  });
  const [saving, setSaving] = useState(false);

  // Snackbar Toast
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/public-ideas', { params });
      if (res.data && res.data.success) {
        setIdeas(res.data.data.ideas || []);
        if (res.data.data.counts) {
          setCounts(res.data.data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to load admin ideas:', err);
      setSnackbar({ open: true, message: 'Failed to load ideas.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [statusFilter]);

  const handleCopyLink = () => {
    const url = getPublicUrl();
    navigator.clipboard.writeText(url);
    setSnackbar({ open: true, message: 'Public Ideas link copied to clipboard!', severity: 'success' });
  };

  const handleWhatsAppShare = () => {
    const url = getPublicUrl();
    const text = encodeURIComponent(`Explore our innovation ideas on the MINDS Public Portal:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleOpenPublicPortal = () => {
    window.open('/public/ideas', '_blank');
  };

  const handleOpenEdit = (idea) => {
    setSelectedIdea(idea);
    setEditForm({
      status: idea.publicVisibility.status || 'Draft',
      customTitle: idea.publicVisibility.customTitle || '',
      customDescription: idea.publicVisibility.customDescription || '',
      coverImageUrl: idea.publicVisibility.coverImageUrl || '',
      featured: !!idea.publicVisibility.featured,
    });
  };

  const handleQuickToggle = async (idea) => {
    const nextStatus = idea.publicVisibility.status === 'Published' ? 'Unpublished' : 'Published';
    try {
      const res = await api.patch(`/admin/public-ideas/${idea.id}/visibility`, {
        status: nextStatus
      });
      if (res.data && res.data.success) {
        setSnackbar({
          open: true,
          message: `Idea "${idea.title}" marked as ${nextStatus}.`,
          severity: 'success'
        });
        fetchIdeas();
      }
    } catch (err) {
      console.error('Failed to update visibility:', err);
      setSnackbar({ open: true, message: 'Failed to update publication status.', severity: 'error' });
    }
  };

  const handleSaveVisibility = async () => {
    if (!selectedIdea) return;
    try {
      setSaving(true);
      const res = await api.patch(`/admin/public-ideas/${selectedIdea.id}/visibility`, editForm);
      if (res.data && res.data.success) {
        setSnackbar({
          open: true,
          message: 'Public display settings updated successfully!',
          severity: 'success'
        });
        setSelectedIdea(null);
        fetchIdeas();
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSnackbar({ open: true, message: 'Failed to save settings.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusChip = (status) => {
    if (status === 'Published') {
      return (
        <Chip
          icon={<PublishedIcon sx={{ fontSize: '14px !important', color: '#15803D !important' }} />}
          label="Published"
          size="small"
          sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 600, fontSize: '0.75rem' }}
        />
      );
    }
    if (status === 'Unpublished') {
      return (
        <Chip
          icon={<UnpublishedIcon sx={{ fontSize: '14px !important', color: '#B91C1C !important' }} />}
          label="Unpublished"
          size="small"
          sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 600, fontSize: '0.75rem' }}
        />
      );
    }
    return (
      <Chip
        icon={<DraftIcon sx={{ fontSize: '14px !important', color: '#B45309 !important' }} />}
        label="Draft"
        size="small"
        sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600, fontSize: '0.75rem' }}
      />
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#FAFAFA', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Page Header ── */}
      <Box sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5, letterSpacing: '-0.02em' }}>
            Public Ideas Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Select, curate, and share innovation ideas with employees and the public.
          </Typography>
        </Box>

        {/* Share & Open Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={handleCopyLink}
            sx={{
              bgcolor: BRAND_GREEN,
              '&:hover': { bgcolor: BRAND_GREEN_DARK },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: 2,
              px: 2,
              boxShadow: 'none'
            }}
          >
            Copy Public Link
          </Button>

          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
            onClick={handleWhatsAppShare}
            sx={{
              borderColor: '#CBD5E1',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: 2,
              px: 2,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
            }}
          >
            WhatsApp
          </Button>

          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenPublicPortal}
            sx={{
              borderColor: '#CBD5E1',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: 2,
              px: 2,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' }
            }}
          >
            Preview Portal
          </Button>
        </Box>
      </Box>

      {/* ── KPI Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', borderLeft: '4px solid #0078D4', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Idea Submissions
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mt: 0.5 }}>
              {counts.total}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', borderLeft: `4px solid ${BRAND_GREEN}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Published (Public Live)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: BRAND_GREEN, mt: 0.5 }}>
              {counts.published}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', borderLeft: '4px solid #F59E0B', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Drafts (Internal Only)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#F59E0B', mt: 0.5 }}>
              {counts.draft}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', borderLeft: '4px solid #EF4444', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
              Unpublished (Hidden)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#EF4444', mt: 0.5 }}>
              {counts.unpublished}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Filter & Search Toolbar ── */}
      <Paper sx={{ p: 2, mb: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          sx={{
            minHeight: 38,
            '& .MuiTab-root': {
              minHeight: 38,
              py: 0.5,
              px: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem'
            },
            '& .Mui-selected': { color: `${BRAND_GREEN} !important` },
            '& .MuiTabs-indicator': { bgcolor: BRAND_GREEN }
          }}
        >
          <Tab value="All" label={`All (${counts.total})`} />
          <Tab value="Published" label={`Published (${counts.published})`} />
          <Tab value="Draft" label={`Drafts (${counts.draft})`} />
          <Tab value="Unpublished" label={`Unpublished (${counts.unpublished})`} />
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            size="small"
            placeholder="Search ideas or submitters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchIdeas(); }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment>
              }
            }}
            sx={{ minWidth: { xs: '100%', sm: 260 }, bgcolor: '#FFFFFF' }}
          />
          <IconButton size="small" onClick={fetchIdeas} title="Refresh">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      {/* ── Ideas Management Table ── */}
      <Paper sx={{ flex: 1, borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.5 }}>IDEA TITLE & ABSTRACT</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.5 }} width={160}>CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.5 }} width={180}>SUBMITTER</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.5 }} width={130}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.5 }} width={130} align="center">PUBLIC STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.5 }} width={180} align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: BRAND_GREEN, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Loading ideas...</Typography>
                  </TableCell>
                </TableRow>
              ) : ideas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <LightbulbIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                      No ideas found matching your current filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ideas.map((idea) => {
                  const isPublished = idea.publicVisibility.status === 'Published';
                  return (
                    <TableRow key={idea.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ py: 1.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
                          {idea.publicVisibility.customTitle || idea.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748B',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4
                          }}
                        >
                          {idea.publicVisibility.customDescription || idea.abstract || 'No abstract'}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <Chip
                          label={idea.category}
                          size="small"
                          sx={{ fontSize: '0.725rem', height: 22, bgcolor: '#F1F5F9', color: '#475569', fontWeight: 500 }}
                        />
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                          {idea.submitterName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {idea.submitterEmail}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {formatDate(idea.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }} align="center">
                        {getStatusChip(idea.publicVisibility.status)}
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }} align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Button
                            size="small"
                            variant={isPublished ? 'outlined' : 'contained'}
                            onClick={() => handleQuickToggle(idea)}
                            sx={{
                              minWidth: 84,
                              height: 28,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 1.5,
                              boxShadow: 'none',
                              bgcolor: isPublished ? 'transparent' : BRAND_GREEN,
                              borderColor: isPublished ? '#EF4444' : 'transparent',
                              color: isPublished ? '#EF4444' : '#FFFFFF',
                              '&:hover': {
                                bgcolor: isPublished ? 'rgba(239, 68, 68, 0.04)' : BRAND_GREEN_DARK,
                                borderColor: isPublished ? '#DC2626' : 'transparent',
                              }
                            }}
                          >
                            {isPublished ? 'Unpublish' : 'Publish'}
                          </Button>

                          <Tooltip title="Configure Public Card & Details">
                            <IconButton size="small" onClick={() => handleOpenEdit(idea)} sx={{ color: '#0078D4' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Configure Public Card Modal ── */}
      <Dialog
        open={!!selectedIdea}
        onClose={() => !saving && setSelectedIdea(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        {selectedIdea && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                  Configure Public Idea Display
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Customize how this idea appears on the public-facing portal.
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedIdea(null)} disabled={saving} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
              {/* Publication Status Selector */}
              <FormControl fullWidth size="small">
                <InputLabel id="pub-status-label">Publication Status</InputLabel>
                <Select
                  labelId="pub-status-label"
                  label="Publication Status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <MenuItem value="Published">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PublishedIcon sx={{ color: '#15803D', fontSize: 18 }} />
                      <b>Published</b> (Visible on Public Portal)
                    </Box>
                  </MenuItem>
                  <MenuItem value="Draft">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DraftIcon sx={{ color: '#B45309', fontSize: 18 }} />
                      <b>Draft</b> (Internal only, not published)
                    </Box>
                  </MenuItem>
                  <MenuItem value="Unpublished">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UnpublishedIcon sx={{ color: '#B91C1C', fontSize: 18 }} />
                      <b>Unpublished</b> (Hidden from Public Portal)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Custom Title Override */}
              <TextField
                label="Public Title (Override)"
                placeholder={selectedIdea.title}
                fullWidth
                size="small"
                value={editForm.customTitle}
                onChange={(e) => setEditForm({ ...editForm, customTitle: e.target.value })}
                helperText="Leave blank to use original submitted title."
              />

              {/* Custom Description Override */}
              <TextField
                label="Public Summary / Description (Override)"
                placeholder={selectedIdea.abstract}
                multiline
                rows={4}
                fullWidth
                size="small"
                value={editForm.customDescription}
                onChange={(e) => setEditForm({ ...editForm, customDescription: e.target.value })}
                helperText="Ensure this contains no confidential or sensitive internal data."
              />

              {/* Cover Image URL */}
              <TextField
                label="Cover Image URL (Optional)"
                placeholder="https://example.com/banner.jpg"
                fullWidth
                size="small"
                value={editForm.coverImageUrl}
                onChange={(e) => setEditForm({ ...editForm, coverImageUrl: e.target.value })}
                helperText="URL to a high-resolution banner image for the idea card."
              />
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setSelectedIdea(null)} disabled={saving} sx={{ color: '#64748B', textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveVisibility}
                disabled={saving}
                startIcon={saving && <CircularProgress size={16} color="inherit" />}
                sx={{
                  bgcolor: BRAND_GREEN,
                  '&:hover': { bgcolor: BRAND_GREEN_DARK },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3
                }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicIdeasManagement;
