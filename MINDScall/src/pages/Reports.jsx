import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Tabs, Tab, Snackbar, Alert, Chip } from '@mui/material';
import { Download as DownloadIcon, BarChart as ChartIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import DataTable, { UserCell } from '../components/DataTable';

const COLORS = ['#0277BD', '#2E7D32', '#F57C00', '#6A1B9A', '#7C3AED', '#DC2626'];

const Reports = () => {
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [forms, setForms] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [subsRes, formsRes, auditRes, emailRes] = await Promise.all([
          api.get('/admin/submissions'),
          api.get('/admin/forms'),
          api.get('/admin/audit-logs').catch(() => ({ data: { data: { logs: [] } } })),
          api.get('/admin/email-logs').catch(() => ({ data: { data: { logs: [] } } }))
        ]);
        setSubmissions(subsRes.data.data.submissions || []);
        setForms(formsRes.data.data.forms || []);
        setAuditLogs(auditRes.data.data.logs || []);
        setEmailLogs(emailRes.data.data.logs || []);
      } catch (err) {
        console.error('Failed to load reports data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const dynamicMonthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        month: months[d.getMonth()],
        monthVal: d.getMonth(),
        yearVal: d.getFullYear(),
        submissions: 0
      });
    }

    submissions.forEach(s => {
      const createdAt = new Date(s.createdAt);
      const m = createdAt.getMonth();
      const y = createdAt.getFullYear();
      
      const bucket = data.find(b => b.monthVal === m && b.yearVal === y);
      if (bucket) {
        bucket.submissions++;
      }
    });

    return data;
  }, [submissions]);

  const dynamicCategoryData = React.useMemo(() => {
    const counts = {};
    submissions.forEach(s => {
      const cat = s.answers?.classification || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [submissions]);

  const handleExportCSV = async () => {
    try {
      // Assuming 'innovation-form' is the slug, but the API expects formId.
      // For now, let's just fetch the form list to get the ID, or fallback.
      // Wait, let me fetch forms first to get the ID, then download.
      const formsRes = await api.get('/admin/forms');
      const forms = formsRes.data.data.forms;
      if (forms.length === 0) throw new Error('No forms found');
      
      const formId = forms[0]._id;
      const res = await api.get(`/admin/submissions/export/${formId}`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'submissions_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSnackbar(true);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export CSV. ' + (err.response?.data?.error || err.message));
    }
  };

  const handleExport = () => setSnackbar(true);

  const auditColumns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      renderCell: (row) => new Date(row.createdAt).toLocaleString('en-IN')
    },
    {
      field: 'user',
      headerName: 'User',
      renderCell: (row) => row.user ? <UserCell avatar={row.user.name?.charAt(0) || 'U'} name={row.user.name || 'Unknown'} subtitle={row.user.email} /> : 'System / Public'
    },
    {
      field: 'action',
      headerName: 'Action',
      renderCell: (row) => <Chip label={row.action} size="small" color="primary" variant="outlined" />
    },
    { field: 'resource', headerName: 'Resource' },
    {
      field: 'details',
      headerName: 'Details',
      renderCell: (row) => (
        <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {JSON.stringify(row.details || {})}
        </Box>
      )
    },
    { field: 'ipAddress', headerName: 'IP Address' }
  ];

  const emailColumns = [
    {
      field: 'sentAt',
      headerName: 'Sent At',
      renderCell: (row) => new Date(row.sentAt).toLocaleString('en-IN')
    },
    {
      field: 'recipients',
      headerName: 'Recipients',
      renderCell: (row) => row.recipients?.join(', ')
    },
    { field: 'subject', headerName: 'Subject' },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (row) => (
        <Chip 
          label={row.status} 
          size="small" 
          sx={{
            bgcolor: row.status === 'SUCCESS' ? '#E8F5E9' : '#FFEBEE',
            color: row.status === 'SUCCESS' ? '#2E7D32' : '#C62828',
            fontWeight: 600
          }} 
        />
      )
    },
    { field: 'error', headerName: 'Error Details' }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Reports & Analytics</Typography>
          <Typography variant="caption" sx={{ color: '#78909C' }}>Generate and export workflow insights</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>Excel</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>CSV</Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>PDF</Button>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #E0E0E0', '& .MuiTabs-indicator': { bgcolor: '#2E7D32' } }}>
        <Tab label="Submission Report" />
        <Tab label="Evaluation Report" />
        <Tab label="Approval Report" />
        <Tab label="Department Report" />
        <Tab label="Audit Logs" />
        <Tab label="Email Logs" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ChartIcon fontSize="small" sx={{ color: '#546E7A' }} /> Monthly Submissions
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dynamicMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: '#F5F5F5' }} />
                      <Legend />
                      <Bar dataKey="submissions" name="Total Submissions" fill="#0277BD" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Category Distribution</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dynamicCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                        {dynamicCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab > 0 && tab < 4 && (
        <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#78909C' }}>Detailed charts for {['Submissions', 'Evaluations', 'Approvals', 'Departments'][tab]} will be rendered here.</Typography>
        </Card>
      )}

      {tab === 4 && (
        <Card sx={{ borderRadius: 3, p: 0, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
          <DataTable columns={auditColumns} rows={auditLogs} rowsPerPageDefault={10} />
        </Card>
      )}

      {tab === 5 && (
        <Card sx={{ borderRadius: 3, p: 0, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
          <DataTable columns={emailColumns} rows={emailLogs} rowsPerPageDefault={10} />
        </Card>
      )}

      <Snackbar open={snackbar} autoHideDuration={3000} onClose={() => setSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(false)} severity="success" sx={{ width: '100%' }}>Report successfully exported!</Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
