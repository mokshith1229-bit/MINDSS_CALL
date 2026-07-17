import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Grid, Button,
  LinearProgress, Chip, Paper, Divider, TextField, MenuItem, IconButton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Timeline as TimelineIcon,
  Description as DocsIcon,
  Science as PilotIcon,
  Assessment as ReportIcon,
  ListAlt as LogIcon,
  Info as InfoIcon,
  Add as AddIcon
} from '@mui/icons-material';
import api from '../utils/api';
import { parseSubmissionFields } from '../utils/submissionParser';
import DataTable from '../components/DataTable';

const ALL_PHASES = [
  'Approved', 'Planning', 'Requirement Gathering', 'Design', 'Development',
  'Testing', 'Pilot Study', 'Pilot Successful', 'Documentation',
  'Final Project Report', 'Completed'
];

const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
    <Typography variant="body2" color="textSecondary">{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', textAlign: 'right', maxWidth: '60%' }}>{value}</Typography>
  </Box>
);

const PilotProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '', progressPercentage: 0, phase: '' });
  const [pilotForm, setPilotForm] = useState({});
  const [reportForm, setReportForm] = useState({});

  const fetchProject = async () => {
    try {
      const res = await api.get(`/admin/pilot-projects/${id}`);
      setProject(res.data.data.project);
      setPilotForm(res.data.data.project.pilotStudy || {});
      setReportForm(res.data.data.project.finalReport || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) return <LinearProgress />;
  if (!project) return <Typography>Project not found.</Typography>;

  const sub = project.submissionId;
  const parsed = sub ? parseSubmissionFields(sub) : {};
  const businessId = sub ? (sub.businessId || `PRJ-${sub._id.toString().substring(18).toUpperCase()}`) : 'N/A';

  const handleUpdatePilot = async () => {
    try {
      await api.patch(`/admin/pilot-projects/${id}`, { pilotStudy: pilotForm });
      alert('Pilot study updated successfully');
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('Failed to update');
    }
  };

  const handleUpdateReport = async () => {
    try {
      await api.patch(`/admin/pilot-projects/${id}`, { finalReport: reportForm });
      alert('Final report updated successfully');
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('Failed to update');
    }
  };

  const handlePostTimeline = async () => {
    if (!newUpdate.title || !newUpdate.description) return alert('Title and description required');
    try {
      await api.post(`/admin/pilot-projects/${id}/timeline`, newUpdate);
      setNewUpdate({ title: '', description: '', progressPercentage: project.progress, phase: project.currentPhase });
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('Failed to post update');
    }
  };

  const handleComplete = async () => {
    try {
      await api.post(`/admin/pilot-projects/${id}/complete`);
      alert('Project officially marked as COMPLETED!');
      fetchProject();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to complete project. Ensure progress is 100%.');
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/pilot-projects')} sx={{ mr: 2, backgroundColor: '#F1F5F9' }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111C2D' }}>
            {parsed.title || 'Project Workspace'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {businessId} • {project.currentPhase} • {project.progress}% Complete
          </Typography>
        </Box>
        {project.currentPhase !== 'Completed' && (
          <Button variant="contained" color="success" onClick={handleComplete} disabled={project.progress < 100}>
            Complete Project
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<InfoIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<TimelineIcon />} iconPosition="start" label="Timeline" />
          <Tab icon={<DocsIcon />} iconPosition="start" label="Documents" />
          <Tab icon={<PilotIcon />} iconPosition="start" label="Pilot Study" />
          <Tab icon={<ReportIcon />} iconPosition="start" label="Final Report" />
          <Tab icon={<LogIcon />} iconPosition="start" label="Activity Log" />
        </Tabs>
      </Paper>

      <Box sx={{ minHeight: 500 }}>
        {/* OVERVIEW TAB */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Project Details</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3, color: '#475569' }}>
                    {parsed.abstract || 'No description available.'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Expected Benefits</Typography>
                  <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>{parsed.benefits || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Quick Facts</Typography>
                  <InfoRow label="Project ID" value={businessId} />
                  <InfoRow label="Owner" value={parsed.employeeName || 'N/A'} />
                  <InfoRow label="Department" value={parsed.dept || 'N/A'} />
                  <InfoRow label="Start Date" value={sub ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'} />
                  <InfoRow label="Current Phase" value={project.currentPhase} />
                  <InfoRow label="Progress" value={`${project.progress}%`} />
                  <InfoRow label="Budget" value={parsed.approvedBudget || parsed.budget || 'N/A'} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* TIMELINE TAB */}
        {tab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Post Update</Typography>
                  <TextField fullWidth size="small" label="Update Title" value={newUpdate.title} onChange={e => setNewUpdate({...newUpdate, title: e.target.value})} sx={{ mb: 2 }} />
                  <TextField fullWidth size="small" select label="Phase" value={newUpdate.phase || project.currentPhase} onChange={e => setNewUpdate({...newUpdate, phase: e.target.value})} sx={{ mb: 2 }}>
                    {ALL_PHASES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </TextField>
                  <TextField fullWidth size="small" type="number" label="Progress %" value={newUpdate.progressPercentage || project.progress} onChange={e => setNewUpdate({...newUpdate, progressPercentage: Number(e.target.value)})} sx={{ mb: 2 }} />
                  <TextField fullWidth multiline rows={4} label="Description" value={newUpdate.description} onChange={e => setNewUpdate({...newUpdate, description: e.target.value})} sx={{ mb: 2 }} />
                  <Button variant="contained" fullWidth onClick={handlePostTimeline}>Post Update</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Execution Timeline</Typography>
              {project.timelineUpdates?.length === 0 ? (
                <Typography color="textSecondary">No timeline updates yet.</Typography>
              ) : (
                project.timelineUpdates.map((u, i) => (
                  <Card key={i} sx={{ mb: 2, borderLeft: '4px solid #1976D2' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{u.title}</Typography>
                        <Typography variant="caption" color="textSecondary">{new Date(u.timestamp).toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip size="small" label={`Phase: ${u.phase}`} sx={{ backgroundColor: '#F1F5F9' }} />
                        <Chip size="small" label={`Progress: ${u.progressPercentage}%`} color={u.progressPercentage === 100 ? 'success' : 'primary'} />
                        <Chip size="small" label={`By: ${u.updatedBy}`} variant="outlined" />
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#334155' }}>
                        {u.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Grid>
          </Grid>
        )}

        {/* DOCUMENTS TAB */}
        {tab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Project Documents</Typography>
              <DataTable
                columns={[
                  { field: 'filename', headerName: 'File Name' },
                  { field: 'documentType', headerName: 'Type' },
                  { field: 'uploadedBy', headerName: 'Uploaded By' },
                  { field: 'uploadedAt', headerName: 'Date', renderCell: r => new Date(r.uploadedAt).toLocaleDateString() },
                  { field: 'actions', headerName: 'Actions', renderCell: r => <Button size="small">Download</Button> }
                ]}
                rows={project.documents || []}
              />
            </CardContent>
          </Card>
        )}

        {/* PILOT STUDY TAB */}
        {tab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Pilot Study Metrics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Location" value={pilotForm.location || ''} onChange={e => setPilotForm({...pilotForm, location: e.target.value})} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={pilotForm.startDate ? pilotForm.startDate.split('T')[0] : ''} onChange={e => setPilotForm({...pilotForm, startDate: e.target.value})} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" type="date" label="End Date" InputLabelProps={{ shrink: true }} value={pilotForm.endDate ? pilotForm.endDate.split('T')[0] : ''} onChange={e => setPilotForm({...pilotForm, endDate: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Observations" value={pilotForm.observations || ''} onChange={e => setPilotForm({...pilotForm, observations: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Challenges" value={pilotForm.challenges || ''} onChange={e => setPilotForm({...pilotForm, challenges: e.target.value})} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth multiline rows={3} label="Result" value={pilotForm.result || ''} onChange={e => setPilotForm({...pilotForm, result: e.target.value})} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth multiline rows={3} label="Recommendations" value={pilotForm.recommendations || ''} onChange={e => setPilotForm({...pilotForm, recommendations: e.target.value})} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="contained" onClick={handleUpdatePilot}>Save Pilot Study</Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* FINAL REPORT TAB */}
        {tab === 4 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Final Project Report</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={4} label="Executive Summary" value={reportForm.executiveSummary || ''} onChange={e => setReportForm({...reportForm, executiveSummary: e.target.value})} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Actual Cost" value={reportForm.actualCost || ''} onChange={e => setReportForm({...reportForm, actualCost: e.target.value})} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="ROI / Savings" value={reportForm.roi || ''} onChange={e => setReportForm({...reportForm, roi: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Actual Benefits Realized" value={reportForm.actualBenefits || ''} onChange={e => setReportForm({...reportForm, actualBenefits: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Lessons Learned" value={reportForm.lessonsLearned || ''} onChange={e => setReportForm({...reportForm, lessonsLearned: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Future Improvements" value={reportForm.futureImprovements || ''} onChange={e => setReportForm({...reportForm, futureImprovements: e.target.value})} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="contained" onClick={handleUpdateReport}>Save Final Report</Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ACTIVITY LOG TAB */}
        {tab === 5 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Audit Trail</Typography>
              <DataTable
                columns={[
                  { field: 'timestamp', headerName: 'Date & Time', renderCell: r => new Date(r.timestamp).toLocaleString() },
                  { field: 'user', headerName: 'User' },
                  { field: 'action', headerName: 'Action' }
                ]}
                rows={project.activityLog || []}
              />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default PilotProjectWorkspace;
