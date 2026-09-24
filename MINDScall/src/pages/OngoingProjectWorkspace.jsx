import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Avatar, Chip, Grid, TextField,
  Divider, LinearProgress, CircularProgress, Alert
} from '@mui/material';
import {
  ArrowBack, Dashboard, RocketLaunch, Assignment, Timeline, AttachMoney,
  FolderOpen, Group, Warning, Autorenew, CheckCircle, History,
  PictureAsPdf, GridOn
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F3F2F1' }}>
      {/* HEADER */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid #EDEBE9', borderRadius: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/rd-ongoing-projects')} sx={{ textTransform: 'none', color: '#605E5C', mr: 2, mt: 0.5 }}>Back</Button>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#323130' }}>
                {project.parsedTitle || 'Untitled Project'}
              </Typography>
              <Chip label={status} size="small" sx={{ fontWeight: 600, bgcolor: status === 'Completed' ? '#D1FAE5' : '#DBEAFE', color: status === 'Completed' ? '#065F46' : '#1E40AF' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#605E5C' }}><b>ID:</b> {project.trackingId || project.businessId}</Typography>
              <Typography variant="body2" sx={{ color: '#605E5C' }}><b>WBS:</b> {project.wbsCode || 'N/A'}</Typography>
              <Typography variant="body2" sx={{ color: '#605E5C' }}><b>Type:</b> {project.submissionType || 'Proposal'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#0078D4' }}>{owner.charAt(0)}</Avatar>
                <Typography variant="body2" sx={{ color: '#323130', fontWeight: 500 }}>{owner}</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right', minWidth: 200 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
              <Button size="small" variant="outlined" startIcon={<PictureAsPdf />} onClick={() => exportProjectToPDF(project)} sx={{ textTransform: 'none', color: '#D32F2F', borderColor: '#D32F2F', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.04)', borderColor: '#D32F2F' } }}>PDF Report</Button>
              <Button size="small" variant="outlined" startIcon={<GridOn />} onClick={() => exportProjectToExcel(project)} sx={{ textTransform: 'none', color: '#107C10', borderColor: '#107C10', '&:hover': { bgcolor: 'rgba(16, 124, 16, 0.04)', borderColor: '#107C10' } }}>Excel Report</Button>
            </Box>
            <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, mb: 0.5, display: 'block' }}>OVERALL PROGRESS: {progress}%</Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#EDEBE9', '& .MuiLinearProgress-bar': { bgcolor: '#10B981' } }} />
          </Box>
        </Box>
      </Paper>

      {/* WORKSPACE BODY */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT NAV TABS */}
        <Box sx={{ width: 240, bgcolor: '#fff', borderRight: '1px solid #EDEBE9', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={tabIndex}
            onChange={(e, v) => setTabIndex(v)}
            sx={{ 
              borderRight: 1, borderColor: 'divider',
              '& .MuiTab-root': { 
                justifyContent: 'flex-start', 
                textAlign: 'left', 
                minHeight: 48, 
                textTransform: 'none', 
                fontWeight: 600, 
                color: '#605E5C', 
                borderBottom: '1px solid #FAFAFA',
                px: 3 // Add some left padding for better aesthetics
              },
              '& .Mui-selected': { bgcolor: '#F3F2F1', color: '#0078D4' }
            }}
          >
            <Tab label="Overview & Objectives" />
            <Tab label="Project Initiation" />
            <Tab label="Samples Inventory" />
            <Tab label="Test Matrix" />
            <Tab label="Work Plan & Milestones" />
            <Tab label="Progress & Reports" />
            <Tab label="Budget & Expenditure" />
            <Tab label="Document Repository" />
            <Tab label="Meetings & Comms" />
            <Tab label="Issues & Risks" />
            <Tab label="Change Requests" />
            <Tab label="Final Report & Closure" />
            <Tab label="Timeline History" />
          </Tabs>
        </Box>

        {/* TAB CONTENT AREA */}
        <Box sx={{ flex: 1, bgcolor: '#fff', overflowY: 'auto' }}>
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
