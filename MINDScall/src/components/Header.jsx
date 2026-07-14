import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Box,
  Menu, MenuItem, Divider, Tooltip, Chip, Popover, List,
  ListItem, ListItemText, ListItemAvatar, Breadcrumbs,
} from '@mui/material';
import {
  NotificationsOutlined as NotifIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  FiberManualRecord as DotIcon,
  NavigateNext as NavNextIcon,
  Home as HomeIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { authStore } from '../store/authStore';

const routeMeta = {
  '/dashboard':          { title: 'Dashboard',               section: null },
  '/form-upload':        { title: 'Form Upload',             section: 'Innovation' },
  '/rd-review':          { title: 'R&D Review',              section: 'Innovation' },
  '/auto-assign-email':  { title: 'Auto Assign Email',       section: 'Workflow' },
  '/evaluation':         { title: 'Evaluation Committee',    section: 'Workflow' },
  '/finance-approval':   { title: 'Finance Review',          section: 'Workflow' },
  '/approval':           { title: 'Approval Committee',      section: 'Workflow' },
  '/rd-ongoing-projects':{ title: 'R&D Ongoing Projects',    section: 'Projects' },
  '/reports':            { title: 'Reports',                 section: 'Analytics' },
  '/settings':           { title: 'Settings',                section: 'Administration' },
  '/meeting':            { title: 'Meetings',                section: 'Workflow' },
  '/user-management':    { title: 'User Management',         section: 'Administration' },
};

const Header = ({ sidebarOpen }) => {
  const location = useLocation();
  const meta = routeMeta[location.pathname] || { title: 'Dashboard', section: null };
  const pageTitle = meta.title;
  const section = meta.section;

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [auth, setAuth] = useState(authStore.getState());
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return authStore.subscribe((state) => setAuth(state));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => handleMarkAsRead(n._id)));
  };

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleAvatarClose = () => setAnchorEl(null);
  const handleNotifClick = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const handleLogout = () => {
    handleAvatarClose();
    authStore.logout();
    navigate('/login');
  };

  const userName = auth.user ? auth.user.name : 'Administrator';
  const userEmail = auth.user ? auth.user.email : 'admin@cubehighways.com';
  const userInitials = userName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const userDept = auth.user?.department || 'Administration';
  const userRole = auth.user?.role || 'System Administrator';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        color: '#111827',
        borderBottom: '1px solid #E5E7EB',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: '100%',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>

        {/* ── Left: Breadcrumbs + Page Title ── */}
        <Box sx={{ minWidth: 0 }}>
          <Breadcrumbs
            separator={<NavNextIcon sx={{ fontSize: 12, color: '#D1D5DB' }} />}
            sx={{ mb: 0.25 }}
            aria-label="breadcrumb"
          >
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: '#9CA3AF',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
              }}
            >
              <HomeIcon sx={{ fontSize: 11 }} />
              MINDS
            </Typography>
            {section && (
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 500 }}>
                {section}
              </Typography>
            )}
            <Typography
              sx={{ fontSize: '0.72rem', color: '#2E7D32', fontWeight: 600 }}
            >
              {pageTitle}
            </Typography>
          </Breadcrumbs>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#111827',
              fontSize: '1rem',
              lineHeight: 1,
              letterSpacing: '-0.1px',
            }}
          >
            {pageTitle}
          </Typography>
        </Box>

        {/* ── Right: Company badge, department, notifications, avatar ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

          {/* Company badge */}
          <Chip
            label="Cube Highways Innovation Centre"
            size="small"
            sx={{
              bgcolor: '#F0FDF4',
              color: '#2E7D32',
              fontWeight: 600,
              fontSize: '0.7rem',
              border: '1px solid #BBF7D0',
              display: { xs: 'none', lg: 'flex' },
              height: 26,
              '& .MuiChip-label': { px: 1.2 },
            }}
          />

          {/* Department */}
          <Chip
            label={userDept}
            size="small"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 600,
              fontSize: '0.7rem',
              border: '1px solid #BFDBFE',
              display: { xs: 'none', md: 'flex' },
              height: 26,
              '& .MuiChip-label': { px: 1.2 },
            }}
          />

          {/* Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton
              onClick={handleNotifClick}
              size="small"
              sx={{
                color: '#6B7280',
                '&:hover': { bgcolor: '#F9FAFB', color: '#374151' },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={9}>
                <NotifIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Tooltip title={`${userName} · ${userRole}`} arrow>
            <IconButton onClick={handleAvatarClick} size="small" sx={{ ml: 0.25 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: '#2E7D32',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                {userInitials}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* ── Notification Popover ── */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={handleNotifClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 380,
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #E5E7EB',
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', mt: 0.1 }}>
                {unreadCount} unread
              </Typography>
            )}
          </Box>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllRead} sx={{ color: '#2E7D32' }}>
                <MarkReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <List dense sx={{ py: 0, maxHeight: 340, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <ListItem sx={{ py: 4, justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '0.84rem', color: '#9CA3AF', textAlign: 'center' }}>
                No notifications at this time
              </Typography>
            </ListItem>
          ) : (
            notifications.map((n) => (
              <ListItem
                key={n._id || n.id}
                onClick={() => !n.read && handleMarkAsRead(n._id)}
                sx={{
                  bgcolor: n.read ? 'transparent' : '#F0FDF4',
                  borderBottom: '1px solid #F3F4F6',
                  alignItems: 'flex-start',
                  py: 1.5,
                  px: 2.5,
                  cursor: n.read ? 'default' : 'pointer',
                  '&:hover': { bgcolor: n.read ? '#F9FAFB' : '#DCFCE7' },
                  transition: 'background 0.15s ease',
                }}
              >
                <ListItemAvatar sx={{ minWidth: 28, mt: 0.5 }}>
                  <DotIcon
                    sx={{ color: n.read ? '#D1D5DB' : '#2E7D32', fontSize: 10 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.83rem', fontWeight: n.read ? 400 : 600, color: '#1F2937' }}>
                      {n.text}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>
                      {n.time}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid #E5E7EB' }}>
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: '#2E7D32',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View all notifications
          </Typography>
        </Box>
      </Popover>

      {/* ── Avatar / Profile Menu ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleAvatarClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 220,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #E5E7EB',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Profile summary */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F3F4F6' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: '#2E7D32', fontSize: '0.85rem', fontWeight: 700 }}>
              {userInitials}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827' }} noWrap>
                {userName}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }} noWrap>
                {userEmail}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={userRole}
            size="small"
            sx={{
              mt: 1.5,
              bgcolor: '#F0FDF4',
              color: '#2E7D32',
              fontWeight: 600,
              fontSize: '0.68rem',
              border: '1px solid #BBF7D0',
            }}
          />
        </Box>

        <MenuItem
          onClick={handleAvatarClose}
          sx={{ gap: 1.5, px: 2.5, py: 1.2, '&:hover': { bgcolor: '#F9FAFB' } }}
        >
          <AccountIcon fontSize="small" sx={{ color: '#6B7280' }} />
          <Typography sx={{ fontSize: '0.875rem', color: '#374151' }}>My Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => { handleAvatarClose(); navigate('/settings'); }}
          sx={{ gap: 1.5, px: 2.5, py: 1.2, '&:hover': { bgcolor: '#F9FAFB' } }}
        >
          <SettingsIcon fontSize="small" sx={{ color: '#6B7280' }} />
          <Typography sx={{ fontSize: '0.875rem', color: '#374151' }}>Settings</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleLogout}
          sx={{ gap: 1.5, px: 2.5, py: 1.2, '&:hover': { bgcolor: '#FEF2F2' } }}
        >
          <LogoutIcon fontSize="small" sx={{ color: '#DC2626' }} />
          <Typography sx={{ fontSize: '0.875rem', color: '#DC2626', fontWeight: 600 }}>
            Sign Out
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
