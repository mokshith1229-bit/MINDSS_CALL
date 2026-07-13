import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, CircularProgress, InputAdornment, Divider, Avatar,
  Skeleton, Badge,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import { authStore } from '../store/authStore';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'EVALUATOR', 'HOD', 'FINANCE'];
const DEPARTMENTS = [
  'General', 'Engineering', 'Finance', 'Human Resources', 'Operations',
  'Research & Development', 'Legal', 'Marketing', 'Procurement',
];

const ROLE_META = {
  SUPER_ADMIN: { color: '#7C3AED', bg: '#EDE9FE', label: 'Super Admin' },
  ADMIN:       { color: '#1D4ED8', bg: '#DBEAFE', label: 'Admin' },
  EMPLOYEE:    { color: '#047857', bg: '#D1FAE5', label: 'Employee' },
  EVALUATOR:   { color: '#B45309', bg: '#FEF3C7', label: 'Evaluator' },
  HOD:         { color: '#0F766E', bg: '#CCFBF1', label: 'HOD' },
  FINANCE:     { color: '#C2410C', bg: '#FFEDD5', label: 'Finance' },
};

const RoleBadge = ({ role }) => {
  const meta = ROLE_META[role] || { color: '#6B7280', bg: '#F3F4F6', label: role };
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        bgcolor: meta.bg,
        color: meta.color,
        fontWeight: 700,
        fontSize: '0.7rem',
        height: 22,
        border: `1px solid ${meta.color}22`,
      }}
    />
  );
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const UserManagement = () => {
  const currentUser = authStore.getState().user;
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'success' });

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: '', role: 'EMPLOYEE', department: 'General',
  });
  const [createErrors, setCreateErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Role edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editing, setEditing] = useState(false);

  const showSnack = (msg, type = 'success') => setSnack({ open: true, msg, type });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.users || []);
    } catch {
      showSnack('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ─── Filtered list ─── */
  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* ─── Stats ─── */
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  /* ─── Create user ─── */
  const validateCreate = () => {
    const errs = {};
    if (!createForm.name.trim()) errs.name = 'Name is required';
    if (!createForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(createForm.email)) errs.email = 'Enter a valid email';
    if (!createForm.password) errs.password = 'Password is required';
    else if (createForm.password.length < 6) errs.password = 'Minimum 6 characters';
    if (!createForm.role) errs.role = 'Role is required';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCreate()) return;
    setCreating(true);
    try {
      await api.post('/users', createForm);
      showSnack(`User "${createForm.name}" created successfully`);
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'EMPLOYEE', department: 'General' });
      setCreateErrors({});
      fetchUsers();
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setCreating(false);
    }
  };

  /* ─── Role update ─── */
  const handleEditOpen = (user) => {
    setEditUser(user);
    setEditRole(user.role);
    setEditOpen(true);
  };

  const handleRoleUpdate = async () => {
    setEditing(true);
    try {
      await api.put(`/users/${editUser._id}/role`, { role: editRole });
      showSnack('Role updated successfully');
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setEditing(false);
    }
  };

  /* ─── Deactivate / Reactivate ─── */
  const handleToggleActive = async (user) => {
    const action = user.isActive ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} "${user.name}"?`)) return;
    try {
      if (user.isActive) {
        await api.delete(`/users/${user._id}`);
        showSnack(`${user.name} deactivated`);
      } else {
        await api.patch(`/users/${user._id}/reactivate`);
        showSnack(`${user.name} reactivated`);
      }
      fetchUsers();
    } catch (err) {
      showSnack(err.response?.data?.message || `Failed to ${action} user`, 'error');
    }
  };

  /* ─── Render ─── */
  return (
    <Box>
      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <AdminIcon sx={{ color: '#2E7D32', fontSize: 28 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.45rem', color: '#111827' }}>
              User Management
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', color: '#6B7280' }}>
            Create and manage platform users and their roles
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchUsers} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#fff' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {isSuperAdmin && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{
                bgcolor: '#2E7D32', fontWeight: 700, fontSize: '0.85rem',
                px: 2.5, py: 1, borderRadius: 2, textTransform: 'none',
                '&:hover': { bgcolor: '#1B5E20' },
              }}
            >
              Create User
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Snack ── */}
      {snack.open && (
        <Alert
          severity={snack.type}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {snack.msg}
        </Alert>
      )}

      {/* ── Stats Cards ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Users', value: stats.total, color: '#1D4ED8', bg: '#EFF6FF', icon: <PeopleIcon sx={{ fontSize: 20, color: '#1D4ED8' }} /> },
          { label: 'Active', value: stats.active, color: '#047857', bg: '#F0FDF4', icon: <ActivateIcon sx={{ fontSize: 20, color: '#047857' }} /> },
          { label: 'Inactive', value: stats.inactive, color: '#B91C1C', bg: '#FEF2F2', icon: <BlockIcon sx={{ fontSize: 20, color: '#B91C1C' }} /> },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: '#fff', flex: '1 1 140px', minWidth: 140 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>{s.label}</Typography>
              {s.icon}
            </Box>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {loading ? <Skeleton width={40} /> : s.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ── Filters ── */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment>,
              sx: { bgcolor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' }, borderRadius: 2 },
            }}
            sx={{ flex: '1 1 240px' }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ bgcolor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } }}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{ROLE_META[r]?.label || r}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* ── Users Table ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                {['User', 'Email', 'Role', 'Department', 'Status', 'Created', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#374151', py: 1.5, borderColor: '#F0F0F0' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton height={24} /></TableCell>
                    ))}
                  </TableRow>
                ))
                : filtered.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
                      <PeopleIcon sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto', opacity: 0.4 }} />
                      No users found
                    </TableCell>
                  </TableRow>
                )
                : filtered.map((user) => (
                  <TableRow
                    key={user._id}
                    sx={{
                      '&:hover': { bgcolor: '#FAFAFA' },
                      opacity: user.isActive ? 1 : 0.55,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <TableCell sx={{ borderColor: '#F5F5F5', py: 1.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 34, height: 34, fontSize: '0.75rem', fontWeight: 700,
                            bgcolor: ROLE_META[user.role]?.bg || '#E5E7EB',
                            color: ROLE_META[user.role]?.color || '#374151',
                          }}
                        >
                          {getInitials(user.name)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.84rem', color: '#111827' }}>
                          {user.name}
                          {user._id === currentUser?._id && (
                            <Chip label="You" size="small" sx={{ ml: 0.75, height: 16, fontSize: '0.6rem', bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700 }} />
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: '#F5F5F5', fontSize: '0.82rem', color: '#4B5563' }}>
                      {user.email}
                    </TableCell>
                    <TableCell sx={{ borderColor: '#F5F5F5' }}>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell sx={{ borderColor: '#F5F5F5', fontSize: '0.82rem', color: '#4B5563' }}>
                      {user.department || '—'}
                    </TableCell>
                    <TableCell sx={{ borderColor: '#F5F5F5' }}>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          bgcolor: user.isActive ? '#D1FAE5' : '#FEE2E2',
                          color: user.isActive ? '#065F46' : '#991B1B',
                          fontWeight: 700, fontSize: '0.7rem', height: 20,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: '#F5F5F5', fontSize: '0.78rem', color: '#9CA3AF' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </TableCell>
                    <TableCell sx={{ borderColor: '#F5F5F5' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {isSuperAdmin && user._id !== currentUser?._id && (
                          <>
                            <Tooltip title="Change Role">
                              <IconButton size="small" onClick={() => handleEditOpen(user)}
                                sx={{ color: '#1D4ED8', '&:hover': { bgcolor: '#DBEAFE' } }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.isActive ? 'Deactivate' : 'Reactivate'}>
                              <IconButton size="small" onClick={() => handleToggleActive(user)}
                                sx={{
                                  color: user.isActive ? '#B91C1C' : '#047857',
                                  '&:hover': { bgcolor: user.isActive ? '#FEE2E2' : '#D1FAE5' },
                                }}>
                                {user.isActive ? <BlockIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && (
          <Box sx={{ px: 2.5, py: 1.25, borderTop: '1px solid #F0F0F0', bgcolor: '#FAFAFA' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              Showing {filtered.length} of {users.length} users
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ══════════════════════════════════════
          Create User Dialog
      ══════════════════════════════════════ */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonAddIcon sx={{ color: '#2E7D32' }} />
            Create New User
          </Box>
          <IconButton size="small" onClick={() => setCreateOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Full Name *"
            fullWidth
            size="small"
            value={createForm.name}
            onChange={(e) => { setCreateForm({ ...createForm, name: e.target.value }); setCreateErrors({ ...createErrors, name: null }); }}
            error={!!createErrors.name}
            helperText={createErrors.name}
            placeholder="e.g. Rahul Sharma"
          />
          <TextField
            label="Email Address *"
            fullWidth
            size="small"
            type="email"
            value={createForm.email}
            onChange={(e) => { setCreateForm({ ...createForm, email: e.target.value }); setCreateErrors({ ...createErrors, email: null }); }}
            error={!!createErrors.email}
            helperText={createErrors.email}
            placeholder="e.g. rahul@cubehighways.com"
          />
          <TextField
            label="Password *"
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            value={createForm.password}
            onChange={(e) => { setCreateForm({ ...createForm, password: e.target.value }); setCreateErrors({ ...createErrors, password: null }); }}
            error={!!createErrors.password}
            helperText={createErrors.password || 'Minimum 6 characters'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword((p) => !p)}>
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth size="small" error={!!createErrors.role}>
            <InputLabel>Role *</InputLabel>
            <Select
              label="Role *"
              value={createForm.role}
              onChange={(e) => { setCreateForm({ ...createForm, role: e.target.value }); setCreateErrors({ ...createErrors, role: null }); }}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ROLE_META[r]?.color }} />
                    {ROLE_META[r]?.label || r}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {createErrors.role && <Typography sx={{ color: '#D32F2F', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>{createErrors.role}</Typography>}
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={createForm.department}
              onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
            >
              {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
            The user can log in immediately with the email and password you set here.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating}
            startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
            sx={{ bgcolor: '#2E7D32', fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 3, '&:hover': { bgcolor: '#1B5E20' } }}
          >
            {creating ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════
          Edit Role Dialog
      ══════════════════════════════════════ */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.05rem', pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Change Role
          <IconButton size="small" onClick={() => setEditOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {editUser && (
            <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{editUser.name}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#6B7280' }}>{editUser.email}</Typography>
            </Box>
          )}
          <FormControl fullWidth size="small">
            <InputLabel>New Role</InputLabel>
            <Select label="New Role" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ROLE_META[r]?.color }} />
                    {ROLE_META[r]?.label || r}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRoleUpdate}
            disabled={editing || editRole === editUser?.role}
            startIcon={editing ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
            sx={{ bgcolor: '#1D4ED8', fontWeight: 700, borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#1E40AF' } }}
          >
            {editing ? 'Saving...' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
