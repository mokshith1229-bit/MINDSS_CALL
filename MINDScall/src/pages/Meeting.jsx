import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar, Button,
  Divider, Tabs, Tab, AvatarGroup, Tooltip, IconButton, Snackbar, Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  VideoCall as JoinIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../utils/api';

const statusConfig = {
  Scheduled: { color: '#0277BD', bg: '#E3F2FD', border: '#90CAF9' },
  Upcoming: { color: '#F57C00', bg: '#FFF3E0', border: '#FFCC02' },
  Completed: { color: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7' },
};

const typeColors = {
  Strategy: '#6A1B9A',
  Planning: '#0277BD',
  Stakeholder: '#00695C',
  'Town Hall': '#E65100',
  Finance: '#2E7D32',
  Evaluation: '#AD1457',
  Vendor: '#37474F',
  Design: '#4527A0',
};

const MeetingCard = ({ meeting, onAction }) => {
  const cfg = statusConfig[meeting.status];
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${cfg.border}`,
        transition: 'all 0.25s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' },
        cursor: 'default',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flex: 1, pr: 1 }}>
            <Chip
              label={meeting.type}
              size="small"
              sx={{ mb: 1, bgcolor: `${typeColors[meeting.type]}15`, color: typeColors[meeting.type], fontWeight: 700, fontSize: '0.68rem', height: 22 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#212121', lineHeight: 1.3 }}>
              {meeting.name}
            </Typography>
          </Box>
          <Chip
            label={meeting.status}
            size="small"
            sx={{ bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontWeight: 700, fontSize: '0.7rem', height: 24, flexShrink: 0 }}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon sx={{ fontSize: 15, color: '#78909C' }} />
            <Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 500 }}>{meeting.date}</Typography>
            <TimeIcon sx={{ fontSize: 15, color: '#78909C', ml: 1 }} />
            <Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 500 }}>{meeting.time}</Typography>
            <Chip label={meeting.duration} size="small" sx={{ ml: 'auto', bgcolor: '#F5F5F5', color: '#546E7A', fontSize: '0.65rem', height: 20, fontWeight: 600 }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon sx={{ fontSize: 15, color: '#78909C' }} />
            <Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 500 }} noWrap>{meeting.location}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 15, color: '#78909C' }} />
            <Typography variant="caption" sx={{ color: '#546E7A', fontWeight: 500 }}>
              {meeting.attendees.join(', ')}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
          <IconButton size="small" onClick={() => onAction('view', meeting)}>
            <ViewIcon fontSize="small" sx={{ color: '#546E7A' }} />
          </IconButton>
          {meeting.status !== 'Completed' && (
            <Button
              size="small"
              variant={meeting.status === 'Scheduled' ? 'contained' : 'outlined'}
              startIcon={<JoinIcon />}
              onClick={() => onAction('join', meeting)}
              sx={{ fontSize: '0.72rem', py: 0.5 }}
            >
              {meeting.status === 'Scheduled' ? 'Join' : 'View'}
            </Button>
          )}
          {meeting.status === 'Completed' && (
            <Button size="small" variant="outlined" onClick={() => onAction('recap', meeting)} sx={{ fontSize: '0.72rem', py: 0.5, borderColor: '#A5D6A7', color: '#2E7D32' }}>
              View Recap
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const Meeting = () => {
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'info' });
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await api.get('/meetings');
        setMeetings(res.data.data.meetings || []);
      } catch (err) {
        console.error('Failed to load meetings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleScheduleMeeting = async () => {
    try {
      const res = await api.post('/meetings', {
        name: `Strategy Sync — ${new Date().toLocaleDateString()}`,
        date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        time: '11:00 AM',
        duration: '1h 30m',
        attendees: ['Mokshith U.', 'Priya N.', 'Amit V.'],
        location: 'Conference Room A',
        status: 'Scheduled',
        type: 'Planning',
        agenda: 'Review progress on recently submitted proposals.'
      });
      setMeetings(prev => [res.data.data.meeting, ...prev]);
      setSnack({ open: true, msg: 'Meeting scheduled successfully in MongoDB!', type: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to schedule meeting.', type: 'error' });
    }
  };

  const scheduled = meetings.filter((m) => m.status === 'Scheduled');
  const upcoming = meetings.filter((m) => m.status === 'Upcoming');
  const completed = meetings.filter((m) => m.status === 'Completed');

  const handleAction = (action, meeting) => {
    const msgs = {
      join: `Joining meeting: ${meeting.name}`,
      view: `Viewing details for: ${meeting.name}`,
      recap: `Opening recap for: ${meeting.name}`,
    };
    setSnack({ open: true, msg: msgs[action] || '', type: action === 'join' ? 'success' : 'info' });
  };

  const sections = [
    { label: 'Scheduled', count: scheduled.length, rows: scheduled },
    { label: 'Upcoming', count: upcoming.length, rows: upcoming },
    { label: 'Completed', count: completed.length, rows: completed },
  ];

  return (
    <Box>
      {/* Summary Bar */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {sections.map((s) => {
          const cfg = statusConfig[s.label];
          return (
            <Grid item xs={12} sm={4} key={s.label}>
              <Card sx={{ borderRadius: 3, border: `1px solid ${cfg.border}` }}>
                <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: cfg.bg, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarIcon sx={{ color: cfg.color, fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: cfg.color }}>{s.count}</Typography>
                    <Typography variant="body2" sx={{ color: '#78909C', fontWeight: 600 }}>{s.label} Meetings</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Meeting Calendar</Typography>
              <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Manage all your innovation meetings in one place</Typography>
            </Box>
            <Button variant="contained" size="small" startIcon={<AddIcon />} sx={{ fontSize: '0.8rem' }}
              onClick={handleScheduleMeeting}>
              Schedule Meeting
            </Button>
          </Box>

          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{
              borderBottom: '1px solid #E0E0E0',
              '& .MuiTabs-indicator': { backgroundColor: '#2E7D32', height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {sections.map((s) => (
              <Tab
                key={s.label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {s.label}
                    <Chip
                      label={s.count}
                      size="small"
                      sx={{
                        bgcolor: statusConfig[s.label].bg,
                        color: statusConfig[s.label].color,
                        fontWeight: 700,
                        height: 20,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>

          {sections.map((s, idx) => (
            <TabPanel key={s.label} value={tab} index={idx}>
              <Grid container spacing={2}>
                {s.rows.map((meeting) => (
                  <Grid item xs={12} md={6} xl={4} key={meeting.id}>
                    <MeetingCard meeting={meeting} onAction={handleAction} />
                  </Grid>
                ))}
                {s.rows.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#9E9E9E', py: 4 }}>
                      No {s.label.toLowerCase()} meetings found
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          ))}
        </CardContent>
      </Card>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.type} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Meeting;
