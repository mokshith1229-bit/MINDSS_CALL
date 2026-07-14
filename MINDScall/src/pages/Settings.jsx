import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Divider, Switch, FormControlLabel, Button, TextField, Grid } from '@mui/material';
import { Save as SaveIcon, SettingsSuggest as ConfigIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store/authStore';

const Settings = () => {
  const navigate = useNavigate();
  const currentUser = authStore.getState().user;
  const isDeveloper = currentUser?.role === 'DEVELOPER';

  const [settings, setSettings] = useState({
    emailNotif: true,
    autoAssign: true,
    slaAlerts: true,
    managerSLA: 4,
    evalSLA: 4,
    approvalSLA: 5,
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>System Settings</Typography>
      <Typography variant="caption" sx={{ color: '#78909C', mb: 3, display: 'block' }}>Manage SLA configs and preferences</Typography>

      {isDeveloper && (
        <Card sx={{ borderRadius: 3, mb: 3, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#DCFCE7', borderRadius: 2, display: 'flex' }}>
                <ConfigIcon sx={{ color: '#166534', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#166534' }}>
                  Feature Visibility Management
                </Typography>
                <Typography variant="body2" sx={{ color: '#15803D' }}>
                  Control which modules and sections are visible to each role in the application.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowIcon />}
              onClick={() => navigate('/feature-management')}
              sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' }, fontWeight: 700, borderRadius: 2 }}
            >
              Manage Visibility
            </Button>
          </CardContent>
        </Card>
      )}

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>SLA Configuration (Days)</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Manager Review" size="small" value={settings.managerSLA} onChange={(e) => handleChange('managerSLA', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Evaluation" size="small" value={settings.evalSLA} onChange={(e) => handleChange('evalSLA', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Approval" size="small" value={settings.approvalSLA} onChange={(e) => handleChange('approvalSLA', e.target.value)} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>System Preferences</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <FormControlLabel control={<Switch checked={settings.emailNotif} onChange={(e) => handleChange('emailNotif', e.target.checked)} color="success" />} label="Enable Email Notifications" />
            <Divider />
            <FormControlLabel control={<Switch checked={settings.autoAssign} onChange={(e) => handleChange('autoAssign', e.target.checked)} color="success" />} label="Enable Smart Auto-Assignment" />
            <Divider />
            <FormControlLabel control={<Switch checked={settings.slaAlerts} onChange={(e) => handleChange('slaAlerts', e.target.checked)} color="success" />} label="SLA Expiry Alerts" />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<SaveIcon />} color="success" size="large">Save Settings</Button>
      </Box>
    </Box>
  );
};

export default Settings;
