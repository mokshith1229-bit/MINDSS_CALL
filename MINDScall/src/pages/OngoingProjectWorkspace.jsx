import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Avatar, Chip, LinearProgress, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, IconButton, Tooltip, Snackbar
} from '@mui/material';
import {
  ArrowBack, Description, Assignment,
  FolderOpen, Autorenew, History,
  AccountTree, Speed, ReceiptLong, Forum, WarningAmber, AssignmentTurnedIn,
  PictureAsPdf, GridOn, Science, FactCheck,
  Edit as EditIcon, Close as CloseIcon
} from '@mui/icons-material';
import { formStore } from '../store/formStore';
import { authStore } from '../store/authStore';
import { exportProjectToPDF, exportProjectToExcel } from '../utils/exportReportUtils';
import OverviewTab from '../components/OngoingProjectTabs/OverviewTab';
import ProjectInitiationTab from '../components/OngoingProjectTabs/ProjectInitiationTab';
import WorkPlanTab from '../components/OngoingProjectTabs/WorkPlanTab';
import ProgressUpdatesTab from '../components/OngoingProjectTabs/ProgressUpdatesTab';
import BudgetTab from '../components/OngoingProjectTabs/BudgetTab';
import DocumentsTab from '../components/OngoingProjectTabs/DocumentsTab';
import IssuesTab from '../components/OngoingProjectTabs/IssuesTab';
import ChangeRequestsTab from '../components/OngoingProjectTabs/ChangeRequestsTab';
import FinalReportTab from '../components/OngoingProjectTabs/FinalReportTab';
import MeetingsTab from '../components/OngoingProjectTabs/MeetingsTab';
import TimelineTab from '../components/OngoingProjectTabs/TimelineTab';
import TestMatrixTab from '../components/OngoingProjectTabs/TestMatrixTab';
import SamplesTab from '../components/OngoingProjectTabs/SamplesTab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ height: '100%', overflowY: 'auto' }}>
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
    </div>
  );
}

const OngoingProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    formStore.init();
    const unsub = formStore.subscribe(() => {
      const all = formStore.getAllSubmissions();
      const found = all.find(s => s.id === id);
      setProject(found);
      setLoading(false);
    });
    
    // Initial fetch if already loaded
    const all = formStore.getAllSubmissions();
    if (all.length > 0) {
      const found = all.find(s => s.id === id);
      setProject(found);
      setLoading(false);
    }
    return unsub;
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  if (!project) {
    return <Box sx={{ p: 4 }}><Alert severity="error">Project not found or you don't have access.</Alert></Box>;
  }

  const pDetails = project.projectDetails || {};
  const status = pDetails.implementationStatus || 'Approved';
  const progress = pDetails.progressPercentage || 0;
  const owner = pDetails.owner || 'Unassigned';
  const proposerName = pDetails.proposerName || pDetails.submitterName || project.employeeName || '';
  const hodName = pDetails.hodName || project.hodName || project.answers?.hodName || '';

  const currentUser = authStore.getState()?.user;
  const isDeveloper = currentUser?.role === 'DEVELOPER';

  // Edit Header State (Title, WBS, Proposer, HOD, Owner)
  const [openEditModal, setOpenEditModal] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editWbsCode, setEditWbsCode] = useState('');
  const [editProposerName, setEditProposerName] = useState('');
  const [editHodName, setEditHodName] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editError, setEditError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleOpenEditModal = () => {
    setEditTitle(project.parsedTitle || project.title || '');
    setEditWbsCode(project.wbsCode && project.wbsCode !== 'N/A' ? project.wbsCode : '');
    setEditProposerName(pDetails.proposerName || pDetails.submitterName || project.employeeName || '');
    setEditHodName(pDetails.hodName || project.hodName || project.answers?.hodName || '');
    setEditOwner(pDetails.owner || project.projectOwner || 'chtech.in');
    setEditError('');
    setOpenEditModal(true);
  };

  const handleSaveHeader = async () => {
    if (!editTitle.trim()) {
      setEditError('Project Title is required');
      return;
    }
    try {
      setSavingHeader(true);
      setEditError('');
      await formStore.developerUpdateProjectHeader(project.id, {
        title: editTitle.trim(),
        wbsCode: editWbsCode.trim(),
        proposerName: editProposerName.trim(),
        hodName: editHodName.trim(),
        owner: editOwner.trim()
      });
      setToast({ open: true, message: 'Project details and WBS code updated successfully!', severity: 'success' });
      setOpenEditModal(false);
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || err.message || 'Failed to update project details.');
    } finally {
      setSavingHeader(false);
    }
  };

  const handleUpdate = async (updates) => {
    try {
      await formStore.updateProjectDetails(project.id, updates);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTestMatrix = async (formData) => {
    try {
      await formStore.addTestMatrix(project.id, formData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSample = async (formData) => {
    try {
      await formStore.addSample(project.id, formData);
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { label: 'Overview & Objectives', icon: Description },
    { label: 'Project Initiation', icon: Assignment },
    { label: 'Samples Inventory', icon: Science },
    { label: 'Test Matrix', icon: FactCheck },
    { label: 'Work Plan & Milestones', icon: AccountTree },
    { label: 'Progress & Reports', icon: Speed },
    { label: 'Budget & Expenditure', icon: ReceiptLong },
    { label: 'Document Repository', icon: FolderOpen },
    { label: 'Meetings & Comms', icon: Forum },
    { label: 'Issues & Risks', icon: WarningAmber },
    { label: 'Change Requests', icon: Autorenew },
    { label: 'Final Report & Closure', icon: AssignmentTurnedIn },
    { label: 'Timeline History', icon: History }
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F3F2F1' }}>
      {/* HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2,
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        {/* LEFT SIDE: BACK, ICON, TITLE, METADATA */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, minWidth: 0 }}>
          {/* BACK BUTTON */}
          <Button
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/rd-ongoing-projects')}
            sx={{
              color: '#475569',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              p: 0.5,
              minWidth: 'auto',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
            }}
          >
            Back
          </Button>

          {/* PROJECT ICON BADGE */}
          <Box
            sx={{
              bgcolor: '#10B981',
              color: '#FFFFFF',
              borderRadius: '8px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Assignment sx={{ fontSize: 24 }} />
          </Box>

          {/* TITLE & METADATA */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* TITLE & STATUS */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.75 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  color: '#0F172A',
                  lineHeight: 1.3
                }}
              >
                {project.parsedTitle || 'Untitled Project'}
              </Typography>
              <Chip
                label={status}
                size="small"
                sx={{
                  bgcolor: '#DBEAFE',
                  color: '#1D4ED8',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '16px',
                  height: 24,
                  px: 0.5
                }}
              />
              {isDeveloper && (
                <Tooltip title="Edit Project Details & WBS">
                  <IconButton
                    size="small"
                    onClick={handleOpenEditModal}
                    sx={{
                      color: '#0078D4',
                      bgcolor: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      '&:hover': { bgcolor: '#E0F2FE', color: '#0284C7' },
                      p: 0.5,
                      borderRadius: '6px'
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* METADATA LINE */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', color: '#64748B', fontSize: '0.8125rem' }}>
              <Typography component="span" sx={{ fontSize: 'inherit', color: 'inherit' }}>
                <Box component="span" sx={{ fontWeight: 600 }}>ID:</Box> {project.trackingId || 'MCP-18FEF773B'}
              </Typography>
              <Typography component="span" sx={{ color: '#CBD5E1' }}>|</Typography>
              <Typography component="span" sx={{ fontSize: 'inherit', color: 'inherit' }}>
                <Box component="span" sx={{ fontWeight: 600 }}>WBS:</Box> {project.wbsCode || 'N/A'}
              </Typography>
              <Typography component="span" sx={{ color: '#CBD5E1' }}>|</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography component="span" sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 600 }}>
                  Type:
                </Typography>
                <Chip
                  label={project.submissionType || project.proposalType || 'Proposal'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    bgcolor: '#DBEAFE',
                    color: '#2563EB',
                    borderRadius: '4px',
                    px: 0.25
                  }}
                />
              </Box>
              {proposerName && (
                <>
                  <Typography component="span" sx={{ color: '#CBD5E1' }}>|</Typography>
                  <Typography component="span" sx={{ fontSize: 'inherit', color: 'inherit' }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>Proposer:</Box> {proposerName}
                  </Typography>
                </>
              )}
              {hodName && (
                <>
                  <Typography component="span" sx={{ color: '#CBD5E1' }}>|</Typography>
                  <Typography component="span" sx={{ fontSize: 'inherit', color: 'inherit' }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>HOD:</Box> {hodName}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* RIGHT SIDE: EXPORTS, OWNER & OVERALL PROGRESS */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, minWidth: { xs: '100%', md: 240 }, flexShrink: 0 }}>
          {/* EXPORT BUTTONS & OWNER */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            {isDeveloper && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                onClick={handleOpenEditModal}
                sx={{
                  textTransform: 'none',
                  color: '#0078D4',
                  borderColor: '#0078D4',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(0, 120, 212, 0.04)', borderColor: '#0078D4' }
                }}
              >
                Edit Details
              </Button>
            )}
            <Button size="small" variant="outlined" startIcon={<PictureAsPdf />} onClick={() => exportProjectToPDF(project)} sx={{ textTransform: 'none', color: '#D32F2F', borderColor: '#D32F2F', fontSize: '0.75rem', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.04)', borderColor: '#D32F2F' } }}>PDF</Button>
            <Button size="small" variant="outlined" startIcon={<GridOn />} onClick={() => exportProjectToExcel(project)} sx={{ textTransform: 'none', color: '#107C10', borderColor: '#107C10', fontSize: '0.75rem', '&:hover': { bgcolor: 'rgba(16, 124, 16, 0.04)', borderColor: '#107C10' } }}>Excel</Button>
            <Avatar
              sx={{
                width: 22,
                height: 22,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: '#0284C7',
                ml: 0.5
              }}
            >
              {owner !== 'Unassigned' ? owner.charAt(0).toUpperCase() : '?'}
            </Avatar>
            <Typography component="span" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
              {owner}
            </Typography>
          </Box>

          {/* OVERALL PROGRESS */}
          <Typography
            sx={{
              color: '#64748B',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              mb: 0.75,
              display: 'block'
            }}
          >
            OVERALL PROGRESS: {progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Number(progress) || 0}
            sx={{
              width: { xs: '100%', md: 240 },
              height: 6,
              borderRadius: 3,
              bgcolor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#10B981',
                borderRadius: 3
              }
            }}
          />
        </Box>
      </Paper>

      {/* WORKSPACE BODY */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', gap: { xs: 2, md: 2.5 } }}>
        {/* LEFT NAV TABS */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 270 },
            minWidth: { md: 270 },
            maxWidth: { md: 270 },
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            flexShrink: 0
          }}
        >
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#94A3B8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              px: 1.5,
              py: 1,
              mb: 0.5
            }}
          >
            PROJECT WORKSPACE
          </Typography>

          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = tabIndex === index;
            return (
              <Box
                key={index}
                onClick={() => setTabIndex(index)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 1.25,
                  mb: 0.5,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  bgcolor: isActive ? '#ECFDF5' : 'transparent',
                  color: isActive ? '#10B981' : '#334155',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s ease-in-out',
                  borderLeft: isActive ? '3px solid #10B981' : '3px solid transparent',
                  '&:hover': {
                    bgcolor: isActive ? '#ECFDF5' : '#F8FAFC',
                    color: isActive ? '#10B981' : '#0F172A',
                    '& .nav-icon': {
                      color: isActive ? '#10B981' : '#1E293B'
                    }
                  }
                }}
              >
                <Box
                  className="nav-icon"
                  sx={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    flexShrink: 0,
                    color: isActive ? '#10B981' : '#64748B',
                    transition: 'color 0.15s ease-in-out'
                  }}
                >
                  <IconComponent sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 'inherit',
                    color: 'inherit',
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Paper>

        {/* TAB CONTENT AREA */}
        <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <TabPanel value={tabIndex} index={0}>
            <OverviewTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <ProjectInitiationTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <SamplesTab project={project} onUpdate={{ addSample: handleAddSample }} />
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            <TestMatrixTab project={project} onUpdate={{ addTestMatrix: handleAddTestMatrix, updateProjectDetails: handleUpdate }} />
          </TabPanel>
          <TabPanel value={tabIndex} index={4}>
            <WorkPlanTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={5}>
            <ProgressUpdatesTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={6}>
            <BudgetTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={7}>
            <DocumentsTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={8}>
            <MeetingsTab project={project} />
          </TabPanel>
          <TabPanel value={tabIndex} index={9}>
            <IssuesTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={10}>
            <ChangeRequestsTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={11}>
            <FinalReportTab project={project} onUpdate={handleUpdate} />
          </TabPanel>
          <TabPanel value={tabIndex} index={12}>
            <TimelineTab project={project} />
          </TabPanel>
        </Box>
      </Box>

      {/* DEVELOPER EDIT PROJECT HEADER MODAL */}
      <Dialog
        open={openEditModal}
        onClose={() => !savingHeader && setOpenEditModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '12px', p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: '#EBF3FC',
                color: '#0078D4',
                borderRadius: '8px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <EditIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B' }}>
                Edit Project Information & WBS
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Modify project name/title, WBS code, proposer, HOD, and owner.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setOpenEditModal(false)} disabled={savingHeader} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}>
          {editError && (
            <Alert severity="error" onClose={() => setEditError('')}>
              {editError}
            </Alert>
          )}

          <TextField
            label="Project Name / Title"
            placeholder="e.g. Study on Rubind-Modified Binder"
            required
            fullWidth
            multiline
            rows={2}
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#1E293B' } }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="WBS Code"
                placeholder="e.g. MCP-012"
                fullWidth
                size="small"
                value={editWbsCode}
                onChange={(e) => setEditWbsCode(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#1E293B' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Project Owner / Lead"
                placeholder="e.g. chtech.in"
                fullWidth
                size="small"
                value={editOwner}
                onChange={(e) => setEditOwner(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#1E293B' } }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name of the Proposer"
                placeholder="e.g. Dr. Rajesh Kumar"
                fullWidth
                size="small"
                value={editProposerName}
                onChange={(e) => setEditProposerName(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#1E293B' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="HOD"
                placeholder="e.g. Dr. Amit Sharma"
                fullWidth
                size="small"
                value={editHodName}
                onChange={(e) => setEditHodName(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#1E293B' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            disabled={savingHeader}
            sx={{ textTransform: 'none', color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveHeader}
            disabled={savingHeader}
            startIcon={savingHeader ? <CircularProgress size={18} color="inherit" /> : <EditIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#0078D4',
              '&:hover': { bgcolor: '#006CBE' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '6px',
              px: 2.5
            }}
          >
            {savingHeader ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TOAST SNACKBAR */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OngoingProjectWorkspace;
