import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Avatar, Chip, LinearProgress, CircularProgress, Alert
} from '@mui/material';
import {
  ArrowBack, Description, Assignment,
  FolderOpen, Autorenew, History,
  AccountTree, Speed, ReceiptLong, Forum, WarningAmber, AssignmentTurnedIn,
  PictureAsPdf, GridOn, Science, FactCheck
} from '@mui/icons-material';
import { formStore } from '../store/formStore';
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
            onClick={() => navigate('/rd-ongoing')}
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
                {project.title}
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
                  label={project.proposalType || 'Proposal'}
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
            </Box>
          </Box>
        </Box>

        {/* RIGHT SIDE: EXPORTS, OWNER & OVERALL PROGRESS */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, minWidth: { xs: '100%', md: 240 }, flexShrink: 0 }}>
          {/* EXPORT BUTTONS & OWNER */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
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
            <TestMatrixTab project={project} onUpdate={{ addTestMatrix: handleAddTestMatrix }} />
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
    </Box>
  );
};

export default OngoingProjectWorkspace;
