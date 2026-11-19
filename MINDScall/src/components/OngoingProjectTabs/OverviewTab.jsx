import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Divider, CircularProgress, Snackbar, Alert, Tooltip,
  FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Description as DescriptionIcon,
  TrackChanges as TrackChangesIcon,
  BarChart as BarChartIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { authStore } from '../../store/authStore';
import { formStore } from '../../store/formStore';

const LIFECYCLE_STATUSES = [
  'Approved',
  'Initiation Pending',
  'Planning',
  'In Progress',
  'Pilot Testing',
  'Near Completion',
  'Completed',
  'On Hold'
];

const getStatusChipProps = (st) => {
  switch (st) {
    case 'Completed':
      return { bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' };
    case 'Near Completion':
      return { bgcolor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' };
    case 'In Progress':
    case 'Pilot Testing':
      return { bgcolor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' };
    case 'Planning':
      return { bgcolor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' };
    case 'On Hold':
      return { bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
    case 'Initiation Pending':
    case 'Not Started':
      return { bgcolor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' };
    case 'Approved':
    default:
      return { bgcolor: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD' };
  }
};

const getStatusDotColor = (st) => {
  switch (st) {
    case 'Completed':
    case 'Near Completion':
      return { bgcolor: '#10B981' };
    case 'In Progress':
    case 'Pilot Testing':
      return { bgcolor: '#3B82F6' };
    case 'Planning':
      return { bgcolor: '#F59E0B' };
    case 'On Hold':
      return { bgcolor: '#EF4444' };
    default:
      return { bgcolor: '#6B7280' };
  }
};

const formatLastUpdatedDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  try {
    return new Date(dateVal).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};

const OverviewTab = ({ project, onUpdate }) => {
  const currentUser = authStore.getState().user;
  const isDeveloper = currentUser?.role === 'DEVELOPER';

  const pDetails = project?.projectDetails || {};

  // ── Existing Objectives State ──
  const [objectives, setObjectives] = useState(pDetails.objectives || []);
  const [newObj, setNewObj] = useState('');

  // ── Section 0: Project Status Management State (Developer Only) ──
  const currentStatus = pDetails.implementationStatus || 'Approved';
  const lastStatusUpdate = pDetails.lastStatusUpdate || null;
  const statusHistory = Array.isArray(pDetails.statusHistory) ? pDetails.statusHistory : [];
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [statusRemarks, setStatusRemarks] = useState('');

  const lastUpdatedBy = lastStatusUpdate?.updatedBy || project?.employeeName || 'System Admin';
  const lastUpdatedDate = lastStatusUpdate?.date || project?.updatedAt || project?.createdAt;

  // ── Section 1: Abstract & Origin State (Developer Only) ──
  const [isEditingAbstractOrigin, setIsEditingAbstractOrigin] = useState(false);
  const [savingAbstractOrigin, setSavingAbstractOrigin] = useState(false);
  const [editSubmitterName, setEditSubmitterName] = useState('');
  const [editEmployeeCode, setEditEmployeeCode] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editOrigin, setEditOrigin] = useState('');
  const [editAbstract, setEditAbstract] = useState('');

  // ── Section 2: Expected vs Actual Benefits State (Developer Only) ──
  const [isEditingBenefits, setIsEditingBenefits] = useState(false);
  const [savingBenefits, setSavingBenefits] = useState(false);
  const [editExpBenefits, setEditExpBenefits] = useState('');
  const [editActBenefits, setEditActBenefits] = useState('');
  const [editBenefitMetrics, setEditBenefitMetrics] = useState([]);

  // ── Toast Notifications ──
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Current display values
  const currentSubmitterName = project?.employeeName || pDetails.submitterName || 'Unknown';
  const currentEmployeeCode = project?.employeeCode || pDetails.submitterCode || '';
  const currentDept = project?.dept || pDetails.department || 'Unknown';
  const currentOrigin = project?.origin || pDetails.origin || project?.trackingId || project?.businessId || 'Internal Submission';
  const currentAbstract = project?.abstract || pDetails.abstract || project?.answers?.abstract || '';
  const currentExpBenefits = pDetails.expectedBenefits || project?.benefits || '';
  const currentActBenefits = pDetails.actualBenefits || '';
  const currentBenefitMetrics = pDetails.benefitMetrics || [];

  const submitterDisplay = (currentSubmitterName || currentEmployeeCode)
    ? `${currentSubmitterName}${currentEmployeeCode ? ` (${currentEmployeeCode})` : ' (Unknown)'}`
    : 'Unknown (Unknown)';

  const abstractParagraphs = currentAbstract
    ? currentAbstract.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    : [];

  // ── Section 0 Handlers (Status Management) ──
  const handleStartEditStatus = () => {
    setSelectedStatus(pDetails.implementationStatus || 'Approved');
    setStatusRemarks('');
    setIsEditingStatus(true);
  };

  const handleCancelEditStatus = () => {
    setIsEditingStatus(false);
    setStatusRemarks('');
  };

  const handleSaveStatus = async () => {
    try {
      setSavingStatus(true);
      await formStore.developerUpdateProjectStatus(project.id, {
        newStatus: selectedStatus,
        remarks: statusRemarks
      });
      setToast({
        open: true,
        message: `Project status successfully updated to "${selectedStatus}".`,
        severity: 'success'
      });
      setIsEditingStatus(false);
      setStatusRemarks('');
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message: err?.response?.data?.message || 'Failed to update project status.',
        severity: 'error'
      });
    } finally {
      setSavingStatus(false);
    }
  };

  // ── Section 1 Handlers (Abstract & Origin) ──
  const handleStartEditAbstractOrigin = () => {
    setEditSubmitterName(project?.employeeName || pDetails.submitterName || '');
    setEditEmployeeCode(project?.employeeCode || pDetails.submitterCode || '');
    setEditDepartment(project?.dept || pDetails.department || '');
    setEditOrigin(project?.origin || pDetails.origin || project?.trackingId || project?.businessId || '');
    setEditAbstract(project?.abstract || pDetails.abstract || project?.answers?.abstract || '');
    setIsEditingAbstractOrigin(true);
  };

  const handleCancelEditAbstractOrigin = () => {
    setIsEditingAbstractOrigin(false);
  };

  const handleSaveAbstractOrigin = async () => {
    try {
      setSavingAbstractOrigin(true);
      await formStore.developerUpdateAbstractOrigin(project.id, {
        submitterName: editSubmitterName,
        employeeCode: editEmployeeCode,
        department: editDepartment,
        origin: editOrigin,
        abstract: editAbstract
      });
      setToast({ open: true, message: 'Project Abstract & Origin updated successfully.', severity: 'success' });
      setIsEditingAbstractOrigin(false);
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message: err?.response?.data?.message || 'Failed to update Project Abstract & Origin.',
        severity: 'error'
      });
    } finally {
      setSavingAbstractOrigin(false);
    }
  };

  // ── Section 2 Handlers (Benefits) ──
  const handleStartEditBenefits = () => {
    setEditExpBenefits(pDetails.expectedBenefits || project?.benefits || '');
    setEditActBenefits(pDetails.actualBenefits || '');
    setEditBenefitMetrics(Array.isArray(pDetails.benefitMetrics) ? [...pDetails.benefitMetrics] : []);
    setIsEditingBenefits(true);
  };

  const handleCancelEditBenefits = () => {
    setIsEditingBenefits(false);
  };

  const handleAddMetric = () => {
    setEditBenefitMetrics(prev => [...prev, { description: '', target: '', value: '', unit: '' }]);
  };

  const handleMetricChange = (index, field, val) => {
    setEditBenefitMetrics(prev => prev.map((m, i) => i === index ? { ...m, [field]: val } : m));
  };

  const handleDeleteMetric = (index) => {
    setEditBenefitMetrics(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveBenefits = async () => {
    try {
      setSavingBenefits(true);
      await formStore.developerUpdateBenefits(project.id, {
        expectedBenefits: editExpBenefits,
        actualBenefits: editActBenefits,
        benefitMetrics: editBenefitMetrics
      });
      setToast({ open: true, message: 'Expected vs Actual Benefits updated successfully.', severity: 'success' });
      setIsEditingBenefits(false);
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message: err?.response?.data?.message || 'Failed to update benefits.',
        severity: 'error'
      });
    } finally {
      setSavingBenefits(false);
    }
  };

  // ── Objectives Handlers (Preserved) ──
  const handleAddObjective = () => {
    if (!newObj.trim()) return;
    setObjectives([...objectives, { name: newObj, status: 'Not Started' }]);
    setNewObj('');
  };

  const handleDeleteObjective = (idx) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const handleSaveObjectives = () => {
    onUpdate({
      objectives
    });
    setToast({ open: true, message: 'Project objectives saved successfully.', severity: 'success' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* ─────────────────────────────────────────────────────────────
          0. PROJECT STATUS MANAGEMENT SECTION
      ───────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}
            >
              <TuneIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
              Project Status Management
            </Typography>
            {isEditingStatus && (
              <Chip
                size="small"
                label="Developer Editing"
                sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
              />
            )}
          </Box>

          {/* Developer Edit Controls */}
          {isDeveloper && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isEditingStatus ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                  onClick={handleStartEditStatus}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    borderRadius: '8px',
                    px: 1.75,
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#4F46E5', color: '#4F46E5' }
                  }}
                >
                  Edit Status
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={handleCancelEditStatus}
                    disabled={savingStatus}
                    sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveStatus}
                    disabled={savingStatus}
                    startIcon={savingStatus ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      bgcolor: '#4F46E5',
                      '&:hover': { bgcolor: '#4338CA' },
                      boxShadow: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Section Body */}
        {!isEditingStatus ? (
          /* Read-Only Mode */
          <Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 0.75 }}>
                  Current Project Status
                </Typography>
                <Chip
                  label={currentStatus}
                  size="small"
                  sx={{
                    ...getStatusChipProps(currentStatus),
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    height: 28,
                    px: 1,
                    borderRadius: '6px'
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                  Last Updated Date
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.875rem' }}>
                  {formatLastUpdatedDate(lastUpdatedDate)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                  Last Updated By
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.875rem' }}>
                  {lastUpdatedBy}
                </Typography>
              </Grid>
            </Grid>

            {/* Status Change History */}
            {statusHistory.length > 0 && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <HistoryIcon sx={{ fontSize: 16, color: '#64748B' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Status Change History ({statusHistory.length})
                  </Typography>
                </Box>
                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#475569' }}>Status Transition</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#475569' }}>Changed By</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#475569' }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#475569' }}>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...statusHistory].reverse().map((item, idx) => (
                        <TableRow key={idx} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
                                {item.previousStatus || 'Initial'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8' }}>&rarr;</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                {item.newStatus}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#334155', py: 1 }}>
                            {item.changedBy || 'Developer'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: '#64748B', py: 1 }}>
                            {formatLastUpdatedDate(item.timestamp)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#475569', fontStyle: item.remarks ? 'normal' : 'italic', py: 1 }}>
                            {item.remarks || 'No remarks provided'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        ) : (
          /* Developer Edit Mode */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Project Lifecycle Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={{ bgcolor: '#fff' }}
                  >
                    {LIFECYCLE_STATUSES.map(st => (
                      <MenuItem key={st} value={st}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', ...getStatusDotColor(st) }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{st}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Current Status Before Change
                </Typography>
                <Box sx={{ height: 40, display: 'flex', alignItems: 'center', px: 2, bgcolor: '#F8FAFC', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                    {currentStatus}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Status Change Remarks (Optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Explain reason for manual status override (e.g., Transitioned to Planning phase post initiation review)..."
                  sx={{ bgcolor: '#fff' }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* ─────────────────────────────────────────────────────────────
          1. PROJECT ABSTRACT & ORIGIN SECTION
      ───────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}
            >
              <DescriptionIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
              Project Abstract & Origin
            </Typography>
            {isEditingAbstractOrigin && (
              <Chip
                size="small"
                label="Developer Editing"
                sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
              />
            )}
          </Box>

          {/* Developer Edit Controls */}
          {isDeveloper && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isEditingAbstractOrigin ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                  onClick={handleStartEditAbstractOrigin}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    borderRadius: '8px',
                    px: 1.75,
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#10B981', color: '#059669' }
                  }}
                >
                  Edit Section
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={handleCancelEditAbstractOrigin}
                    disabled={savingAbstractOrigin}
                    sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveAbstractOrigin}
                    disabled={savingAbstractOrigin}
                    startIcon={savingAbstractOrigin ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      bgcolor: '#10B981',
                      '&:hover': { bgcolor: '#059669' },
                      boxShadow: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* ── Section 1 Body ── */}
        {!isEditingAbstractOrigin ? (
          /* Read-Only Mode */
          <Box>
            {/* Metadata Row: Submitter, Department, Origin */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3, mb: 2.5 }}>
              <Box sx={{ minWidth: 200, pr: { md: 4 } }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                  Submitter
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500, fontSize: '0.875rem' }}>
                  {submitterDisplay}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: '#E2E8F0' }} />

              <Box sx={{ minWidth: 180, pr: { md: 4 } }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                  Department
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500, fontSize: '0.875rem' }}>
                  {currentDept}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: '#E2E8F0' }} />

              <Box sx={{ minWidth: 180 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                  Origin / Source
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500, fontSize: '0.875rem' }}>
                  {currentOrigin}
                </Typography>
              </Box>
            </Box>

            {/* Abstract Header */}
            <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.8125rem', mb: 1 }}>
              Abstract / Proposal Details
            </Typography>

            {/* Abstract Text Box */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: '#F8FAFC',
                border: '1px solid #F1F5F9',
                borderRadius: '8px'
              }}
            >
              {abstractParagraphs.length > 0 ? (
                abstractParagraphs.map((para, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    sx={{
                      color: '#334155',
                      fontSize: '0.875rem',
                      lineHeight: 1.65,
                      mb: idx < abstractParagraphs.length - 1 ? 2 : 0
                    }}
                  >
                    {para}
                  </Typography>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748B',
                    fontSize: '0.875rem',
                    lineHeight: 1.65,
                    fontStyle: 'italic'
                  }}
                >
                  No abstract or details provided yet.
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          /* Developer Edit Mode */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Submitter Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editSubmitterName}
                  onChange={(e) => setEditSubmitterName(e.target.value)}
                  placeholder="e.g. Developer Admin"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Employee Code
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editEmployeeCode}
                  onChange={(e) => setEditEmployeeCode(e.target.value)}
                  placeholder="e.g. EMP001"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Department
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="e.g. Engineering"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Origin / Source Information
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editOrigin}
                  onChange={(e) => setEditOrigin(e.target.value)}
                  placeholder="e.g. Proposal MCI-1049"
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Project Abstract / Proposal Details
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                size="small"
                value={editAbstract}
                onChange={(e) => setEditAbstract(e.target.value)}
                placeholder="Enter complete project abstract or proposal details..."
                sx={{ bgcolor: '#fff' }}
              />
            </Box>
          </Box>
        )}
      </Paper>


      {/* ─────────────────────────────────────────────────────────────
          2. PROJECT OBJECTIVES (PRESERVED)
      ───────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Section Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#F43F5E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}
            >
              <TrackChangesIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
              Project Objectives
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
            onClick={handleSaveObjectives}
            sx={{
              bgcolor: '#0078D4',
              '&:hover': { bgcolor: '#006CBE' },
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              px: 2,
              py: 0.75
            }}
          >
            Save Changes
          </Button>
        </Box>

        {/* Objectives Table */}
        <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', py: 1.25, width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', py: 1.25 }}>Objective</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', py: 1.25, width: 140 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', py: 1.25, width: 80, textAlign: 'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objectives.length > 0 ? (
                objectives.map((obj, idx) => (
                  <TableRow key={idx} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>{idx + 1}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: '#1E293B', fontWeight: 500 }}>{obj.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={obj.status || 'Not Started'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: obj.status === 'Completed' ? '#ECFDF5' : obj.status === 'In Progress' ? '#EFF6FF' : '#F1F5F9',
                          color: obj.status === 'Completed' ? '#047857' : obj.status === 'In Progress' ? '#1D4ED8' : '#475569'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton size="small" onClick={() => handleDeleteObjective(idx)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: '#94A3B8', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                    No specific objectives added yet. Use the input below to add project objectives.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Objective Input */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Add new objective..."
            value={newObj}
            onChange={(e) => setNewObj(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddObjective(); }}
            sx={{ bgcolor: '#FFFFFF' }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={handleAddObjective}
            sx={{
              height: 38,
              minWidth: 140,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: '#059669',
              borderColor: '#10B981',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              px: 2,
              '&:hover': { borderColor: '#059669', bgcolor: '#ECFDF5' }
            }}
          >
            Add Objective
          </Button>
        </Box>
      </Paper>


      {/* ─────────────────────────────────────────────────────────────
          3. EXPECTED VS ACTUAL BENEFITS SECTION
      ───────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}
            >
              <BarChartIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
              Expected vs Actual Benefits
            </Typography>
            {isEditingBenefits && (
              <Chip
                size="small"
                label="Developer Editing"
                sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
              />
            )}
          </Box>

          {/* Developer Edit Controls */}
          {isDeveloper && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isEditingBenefits ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                  onClick={handleStartEditBenefits}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    borderRadius: '8px',
                    px: 1.75,
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#0284C7', color: '#0284C7' }
                  }}
                >
                  Edit Section
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={handleCancelEditBenefits}
                    disabled={savingBenefits}
                    sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveBenefits}
                    disabled={savingBenefits}
                    startIcon={savingBenefits ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      bgcolor: '#0284C7',
                      '&:hover': { bgcolor: '#0369A1' },
                      boxShadow: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* ── Section 2 Body ── */}
        {!isEditingBenefits ? (
          /* Read-Only Mode */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 1. Expected Benefits Card */}
            <Box>
              <Typography
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'block'
                }}
              >
                Expected Benefits (From Proposal)
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  p: 2.5,
                  minHeight: 90,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: currentExpBenefits ? '#334155' : '#64748B',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {currentExpBenefits || 'No benefits provided'}
                </Typography>
              </Box>
            </Box>

            {/* 2. Actual Realized Benefits Card */}
            <Box>
              <Typography
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'block'
                }}
              >
                Actual Realized Benefits
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  p: 2.5,
                  minHeight: 90,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: currentActBenefits ? '#334155' : '#64748B',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {currentActBenefits || 'No actual benefits recorded yet.'}
                </Typography>
              </Box>
            </Box>

            {/* 3. Structured Benefit Metrics (if present) */}
            {currentBenefitMetrics.length > 0 && (
              <Box>
                <Typography
                  sx={{
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    mb: 1,
                    display: 'block'
                  }}
                >
                  Benefit Metrics & Targets
                </Typography>
                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>Target</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>Actual Realized</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>Unit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentBenefitMetrics.map((bm, idx) => (
                        <TableRow key={idx} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontSize: '0.8125rem', color: '#1E293B', fontWeight: 500 }}>{bm.description || '—'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', color: '#0284C7', fontWeight: 600 }}>{bm.target || '—'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 600 }}>{bm.value || '—'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8125rem', color: '#64748B' }}>{bm.unit || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        ) : (
          /* Developer Edit Mode */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Expected Benefits Input */}
            <Box>
              <Typography
                sx={{
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'block'
                }}
              >
                Expected Benefits (From Proposal)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editExpBenefits}
                onChange={(e) => setEditExpBenefits(e.target.value)}
                placeholder="Enter expected benefits from proposal..."
                sx={{ bgcolor: '#FFFFFF' }}
              />
            </Box>

            {/* Actual Realized Benefits Input */}
            <Box>
              <Typography
                sx={{
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'block'
                }}
              >
                Actual Realized Benefits
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editActBenefits}
                onChange={(e) => setEditActBenefits(e.target.value)}
                placeholder="Actual value realized post-implementation..."
                sx={{ bgcolor: '#FFFFFF' }}
              />
            </Box>

            {/* Structured Benefit Targets & Values */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography
                  sx={{
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    display: 'block'
                  }}
                >
                  Benefit Metrics, Targets & Units
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                  onClick={handleAddMetric}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#0284C7', fontWeight: 600 }}
                >
                  Add Benefit Metric
                </Button>
              </Box>

              {editBenefitMetrics.length > 0 ? (
                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#fff' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', width: 150 }}>Target</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', width: 150 }}>Actual Value</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', width: 120 }}>Unit</TableCell>
                        <TableCell sx={{ width: 50 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editBenefitMetrics.map((m, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ py: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={m.description || ''}
                              onChange={(e) => handleMetricChange(idx, 'description', e.target.value)}
                              placeholder="e.g. Energy Saving"
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={m.target || ''}
                              onChange={(e) => handleMetricChange(idx, 'target', e.target.value)}
                              placeholder="e.g. 20%"
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={m.value || ''}
                              onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                              placeholder="e.g. 25%"
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={m.unit || ''}
                              onChange={(e) => handleMetricChange(idx, 'unit', e.target.value)}
                              placeholder="e.g. %, INR"
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1, textAlign: 'center' }}>
                            <IconButton size="small" onClick={() => handleDeleteMetric(idx)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    No metric rows added. Click "Add Benefit Metric" to define specific targets, values, and units.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* ── Snackbar Notifications ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 1.5, fontWeight: 600 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OverviewTab;