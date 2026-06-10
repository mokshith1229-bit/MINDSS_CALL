import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Divider, Switch, FormControlLabel, Button, TextField, Grid } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const Settings = () => {
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
