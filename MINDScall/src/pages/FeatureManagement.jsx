import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Switch, Chip,
  TextField, InputAdornment, IconButton, Tooltip, Button,
  Collapse, Divider, CircularProgress, Snackbar, Alert,
  Badge, LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CheckCircle as CheckIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  ViewModule as ModuleIcon,
  ViewQuilt as SectionIcon,
  SmartButton as ButtonIcon,
  RestartAlt as ResetIcon,
  Save as SaveIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
} from '@mui/icons-material';
import { useVisibility } from '../context/VisibilityContext';
import api from '../utils/api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAVY   = '#0D1B2A';
const GREEN  = '#2E7D32';
const TEAL   = '#0F766E';
const PURPLE = '#6D28D9';
const RED    = '#B91C1C';
const AMBER  = '#B45309';
const BORDER = '#E2E8F0';
const BG     = '#F8FAFC';

const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE'];

const ROLE_META = {
  SUPER_ADMIN: { label: 'Super Admin', color: NAVY, bg: '#E8EAF6' },
  ADMIN:       { label: 'Admin',       color: '#1565C0', bg: '#E3F2FD' },
  EMPLOYEE:    { label: 'Employee',    color: TEAL,      bg: '#CCFBF1' },
  EVALUATOR:   { label: 'Evaluator',   color: PURPLE,    bg: '#EDE9FE' },
  HOD:         { label: 'HOD',         color: AMBER,     bg: '#FFF8E1' },
  FINANCE:     { label: 'Finance',     color: '#0F766E', bg: '#CCFBF1' },
};

const TYPE_META = {
  module:  { label: 'Module',  icon: <ModuleIcon  sx={{ fontSize: 14 }} />, color: '#1565C0', bg: '#E3F2FD' },
  section: { label: 'Section', icon: <SectionIcon sx={{ fontSize: 14 }} />, color: PURPLE,    bg: '#EDE9FE' },
  button:  { label: 'Button',  icon: <ButtonIcon  sx={{ fontSize: 14 }} />, color: AMBER,     bg: '#FFF8E1' },
};

// ── Sidebar tree item ─────────────────────────────────────────────────────────
const TreeItem = ({ feature, selected, onSelect }) => {
  const tm = TYPE_META[feature.type] || TYPE_META.module;
  const isSelected = selected?.featureKey === feature.featureKey;

  return (
    <Box onClick={() => onSelect(feature)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.9,
        borderRadius: 1.5, cursor: 'pointer', mb: 0.25,
        bgcolor: isSelected ? `${GREEN}15` : 'transparent',
        border: isSelected ? `1px solid ${GREEN}40` : '1px solid transparent',
        '&:hover': { bgcolor: isSelected ? `${GREEN}15` : '#F8FAFC' },
        transition: 'all 0.12s',
      }}>
      <Box sx={{ p: 0.4, borderRadius: 1, bgcolor: tm.bg, color: tm.color, display: 'flex' }}>
        {tm.icon}
      </Box>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? GREEN : '#374151', flex: 1 }} noWrap>
        {feature.label}
      </Typography>
      <Chip label={tm.label} size="small"
        sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: tm.bg, color: tm.color, border: 'none' }} />
    </Box>
  );
};

// ── Module group ──────────────────────────────────────────────────────────────
const ModuleGroup = ({ moduleName, features, selected, onSelect, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen ?? true);

  return (
    <Box sx={{ mb: 0.5 }}>
      <Box onClick={() => setOpen(o => !o)}
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.6, cursor: 'pointer',
          borderRadius: 1, '&:hover': { bgcolor: '#F1F5F9' } }}>
        {open ? <CollapseIcon sx={{ fontSize: 14, color: '#9CA3AF' }} /> : <ExpandIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />}
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {moduleName}
        </Typography>
        <Chip label={features.length} size="small" sx={{ height: 14, fontSize: '0.6rem', ml: 'auto', bgcolor: '#F1F5F9', color: '#6B7280' }} />
      </Box>
      <Collapse in={open}>
        <Box sx={{ pl: 1 }}>
          {features.map(f => (
            <TreeItem key={f.featureKey} feature={f} selected={selected} onSelect={onSelect} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// ── Role toggle row ───────────────────────────────────────────────────────────
const RoleToggleRow = ({ role, visible, featureKey, onChange, saving }) => {
  const m = ROLE_META[role] || { label: role, color: '#374151', bg: '#F3F4F6' };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 1.25, px: 2,
      borderBottom: `1px solid ${BORDER}`, '&:last-child': { borderBottom: 'none' },
      bgcolor: visible ? '#FAFFFE' : '#FFF8F8', transition: 'background 0.15s' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: visible ? GREEN : '#D1D5DB', flexShrink: 0 }} />
        <Chip label={m.label} size="small"
          sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: m.bg, color: m.color, height: 22, minWidth: 90 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {saving ? <CircularProgress size={16} sx={{ color: GREEN }} /> : null}
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: visible ? GREEN : '#9CA3AF', minWidth: 50, textAlign: 'right' }}>
          {visible ? 'Visible' : 'Hidden'}
        </Typography>
        <Switch
          checked={visible}
          onChange={(e) => onChange(featureKey, role, e.target.checked)}
          size="small"
          disabled={saving}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: GREEN },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: GREEN },
          }}
        />
      </Box>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const FeatureManagement = () => {
  const { features, loading, refresh, visibilityMap } = useVisibility();

  // Local editable state (copy of visibilityMap — keyed by featureKey.role)
  const [localMap, setLocalMap]   = useState({});
  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState('');
  const [saving, setSaving]       = useState({});  // { 'featureKey.role': true }
  const [pendingChanges, setPendingChanges] = useState({}); // { 'featureKey.role': bool }
  const [snack, setSnack]         = useState({ open: false, msg: '', type: 'success' });
  const [resetting, setResetting] = useState(false);

  // Sync from context when features load
  React.useEffect(() => {
    if (!loading && Object.keys(visibilityMap).length > 0) {
      setLocalMap(JSON.parse(JSON.stringify(visibilityMap)));
    }
  }, [visibilityMap, loading]);

  const toast = (msg, type = 'success') => setSnack({ open: true, msg, type });

  // ── Filter features by search ─────────────────────────────────────────────
  const filteredFeatures = useMemo(() => {
    if (!search) return features;
    const q = search.toLowerCase();
    return features.filter(f =>
      f.label.toLowerCase().includes(q) || f.module.toLowerCase().includes(q) || f.featureKey.includes(q)
    );
  }, [features, search]);

  // ── Group by module ───────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups = {};
    filteredFeatures.forEach(f => {
      if (!groups[f.module]) groups[f.module] = [];
      groups[f.module].push(f);
    });
    return groups;
  }, [filteredFeatures]);

  // ── Get visible flag for a feature+role from local state ─────────────────
  const getVisible = useCallback((featureKey, role) => {
    return localMap[featureKey]?.[role] !== false;
  }, [localMap]);

  // ── Handle toggle (optimistic update + API call) ──────────────────────────
  const handleToggle = useCallback(async (featureKey, role, visible) => {
    const key = `${featureKey}.${role}`;

    // Optimistic UI update
    setLocalMap(prev => ({
      ...prev,
      [featureKey]: { ...(prev[featureKey] || {}), [role]: visible },
    }));
    setPendingChanges(prev => ({ ...prev, [key]: visible }));
    setSaving(prev => ({ ...prev, [key]: true }));

    try {
      await api.put(`/developer/visibility/${featureKey}`, { role, visible });
      toast(`${role} — ${visible ? 'Enabled' : 'Disabled'} successfully`);
      // Remove from pending
      setPendingChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
    } catch (err) {
      // Rollback optimistic update
      setLocalMap(prev => ({
        ...prev,
        [featureKey]: { ...(prev[featureKey] || {}), [role]: !visible },
      }));
      toast(`Failed to update: ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  }, []);

  // ── Reset all to defaults ─────────────────────────────────────────────────
  const handleReset = async () => {
    if (!window.confirm('Reset ALL feature visibility settings to defaults? This cannot be undone.')) return;
    setResetting(true);
    try {
      await api.post('/developer/visibility/reset');
      await refresh();
      setPendingChanges({});
      toast('All settings reset to defaults');
    } catch (err) {
      toast(`Reset failed: ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setResetting(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total   = features.length;
    const modules = features.filter(f => f.type === 'module').length;
    const sections = features.filter(f => f.type === 'section').length;
    const buttons = features.filter(f => f.type === 'button').length;
    const pending = Object.keys(pendingChanges).length;
    return { total, modules, sections, buttons, pending };
  }, [features, pendingChanges]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: GREEN }} />
        <Typography sx={{ mt: 2, color: '#6B7280' }}>Loading Feature Management Console…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: BG, minHeight: '100vh', pb: 6 }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, bgcolor: NAVY, borderRadius: 1.5 }}>
              <EyeIcon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', color: NAVY }}>
                Feature Visibility Management
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                Control which modules, sections and buttons are visible to each role
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh from database">
              <IconButton onClick={refresh} sx={{ border: `1px solid ${BORDER}`, bgcolor: '#fff', borderRadius: 1.5 }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" startIcon={resetting ? <CircularProgress size={14} /> : <ResetIcon />}
              onClick={handleReset} disabled={resetting}
              sx={{ textTransform: 'none', fontWeight: 700, borderColor: RED, color: RED, '&:hover': { bgcolor: '#FEF2F2', borderColor: RED } }}>
              Reset to Defaults
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── KPI Stats ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Features', value: stats.total, color: NAVY, bg: '#E8EAF6' },
          { label: 'Modules', value: stats.modules, color: '#1565C0', bg: '#E3F2FD' },
          { label: 'Sections', value: stats.sections, color: PURPLE, bg: '#EDE9FE' },
          { label: 'Buttons', value: stats.buttons, color: AMBER, bg: '#FFF8E1' },
        ].map((s, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, borderLeft: `4px solid ${s.color}` }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: NAVY }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Main Layout: Tree | Detail Panel ── */}
      <Grid container spacing={2.5}>

        {/* LEFT — Feature Tree */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, height: '100%' }}>
            {/* Search */}
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${BORDER}` }}>
              <TextField fullWidth size="small" placeholder="Search features, modules…"
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.82rem' } }} />
            </Box>

            {/* Developer badge — always visible */}
            <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${BORDER}`, bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon sx={{ fontSize: 14, color: GREEN }} />
              <Typography sx={{ fontSize: '0.72rem', color: GREEN, fontWeight: 700 }}>
                DEVELOPER role always has full access to all features
              </Typography>
            </Box>

            {/* Tree */}
            <Box sx={{ p: 1, maxHeight: 580, overflowY: 'auto' }}>
              {Object.keys(grouped).length === 0 ? (
                <Typography sx={{ p: 2, color: '#9CA3AF', textAlign: 'center', fontSize: '0.82rem' }}>No features match your search</Typography>
              ) : Object.entries(grouped).map(([mod, feats]) => (
                <ModuleGroup key={mod} moduleName={mod} features={feats}
                  selected={selected} onSelect={setSelected} defaultOpen={true} />
              ))}
            </Box>
          </Card>
        </Grid>

        {/* RIGHT — Role Visibility Matrix */}
        <Grid item xs={12} md={8}>
          {!selected ? (
            <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, minHeight: 400 }}>
              <EyeIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />
              <Typography sx={{ color: '#9CA3AF', fontWeight: 600 }}>Select a feature from the tree to manage visibility</Typography>
              <Typography sx={{ color: '#D1D5DB', fontSize: '0.8rem' }}>Click any module, section, or button on the left</Typography>
            </Card>
          ) : (
            <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2 }}>
              {/* Feature Header */}
              <Box sx={{ p: 2.5, borderBottom: `1px solid ${BORDER}`, bgcolor: '#FAFAFA' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ p: 1, bgcolor: (TYPE_META[selected.type] || TYPE_META.module).bg, borderRadius: 1.5, display: 'flex' }}>
                    {(TYPE_META[selected.type] || TYPE_META.module).icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: NAVY }}>{selected.label}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={selected.module} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#F1F5F9', color: '#374151' }} />
                      <Chip label={(TYPE_META[selected.type] || TYPE_META.module).label} size="small"
                        sx={{ height: 18, fontSize: '0.65rem', bgcolor: (TYPE_META[selected.type] || TYPE_META.module).bg, color: (TYPE_META[selected.type] || TYPE_META.module).color }} />
                      <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', fontFamily: 'monospace', alignSelf: 'center' }}>
                        {selected.featureKey}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* DEVELOPER row — always on */}
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5, px: 2, bgcolor: '#F0FDF4', borderBottom: `1px solid ${BORDER}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GREEN }} />
                  <Chip label="Developer" size="small"
                    sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#D1FAE5', color: GREEN, height: 22, minWidth: 90 }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#6B7280', fontStyle: 'italic' }}>System Role — always has access</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: GREEN }}>Always On</Typography>
                  <Switch checked size="small" disabled
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: GREEN }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: GREEN } }} />
                </Box>
              </Box>

              {/* Divider */}
              <Box sx={{ px: 2, py: 1, bgcolor: '#F9FAFB', borderBottom: `1px solid ${BORDER}` }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Role Visibility Settings
                </Typography>
              </Box>

              {/* Role rows */}
              {ALL_ROLES.map(role => {
                const visible = getVisible(selected.featureKey, role);
                const savingKey = `${selected.featureKey}.${role}`;
                return (
                  <RoleToggleRow
                    key={role}
                    role={role}
                    visible={visible}
                    featureKey={selected.featureKey}
                    onChange={handleToggle}
                    saving={!!saving[savingKey]}
                  />
                );
              })}

              {/* Quick actions */}
              <Box sx={{ p: 2, borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#6B7280', alignSelf: 'center', mr: 1 }}>Quick set:</Typography>
                <Button size="small" variant="outlined" startIcon={<CheckIcon />}
                  onClick={() => ALL_ROLES.forEach(r => handleToggle(selected.featureKey, r, true))}
                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderColor: GREEN, color: GREEN, '&:hover': { bgcolor: GREEN_LT } }}>
                  Enable All Roles
                </Button>
                <Button size="small" variant="outlined" startIcon={<BlockIcon />}
                  onClick={() => ALL_ROLES.forEach(r => handleToggle(selected.featureKey, r, false))}
                  sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderColor: RED, color: RED, '&:hover': { bgcolor: '#FEF2F2' } }}>
                  Disable All Roles
                </Button>
              </Box>
            </Card>
          )}

          {/* Role Legend */}
          <Card elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, mt: 2 }}>
            <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>Role Reference</Typography>
            </Box>
            <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Developer — Full system access (immutable)" size="small"
                sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: '#D1FAE5', color: GREEN }} />
              {ALL_ROLES.map(r => {
                const m = ROLE_META[r] || { label: r, color: '#374151', bg: '#F3F4F6' };
                return (
                  <Chip key={r} label={m.label} size="small"
                    sx={{ fontWeight: 600, fontSize: '0.65rem', bgcolor: m.bg, color: m.color }} />
                );
              })}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Missing constant referenced in Quick actions
const GREEN_LT = '#E8F5E9';

export default FeatureManagement;
