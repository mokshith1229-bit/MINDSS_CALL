import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Box,
  Menu, MenuItem, Divider, Tooltip, Chip, Popover, List,
  ListItem, ListItemText, ListItemAvatar,
} from '@mui/material';
import {
  NotificationsOutlined as NotifIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { authStore } from '../store/authStore';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/form-upload': 'Form Upload',
  '/auto-assign-email': 'Auto Assign Email',
  '/evaluation': 'Evaluation',
  '/meeting': 'Meeting',
  '/approval': 'Approval',
};

const getBreadcrumbs = (path) => {
  const title = routeTitles[path] || 'Dashboard';
  return ['Home', title];
};

const Header = ({ sidebarOpen }) => {
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';
  const breadcrumbs = getBreadcrumbs(location.pathname);

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
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return authStore.subscribe((state) => {
      setAuth(state);
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
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

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        color: '#212121',
        borderBottom: '1px solid #E0E0E0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ml: 0,
        width: '100%',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3, minHeight: 64 }}>
        {/* Left: breadcrumb + title */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb}>
                <Typography
                  variant="caption"
                  sx={{
                    color: i === breadcrumbs.length - 1 ? '#2E7D32' : '#9E9E9E',
                    fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                    fontSize: '0.72rem',
                  }}
                >
                  {crumb}
                </Typography>
                {i < breadcrumbs.length - 1 && (
                  <Typography variant="caption" sx={{ color: '#BDBDBD', fontSize: '0.72rem' }}>
                    /
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#212121', lineHeight: 1 }}>
            {pageTitle}
          </Typography>
        </Box>

        {/* Right: company tag, notifications, avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label="Cube Highways Technologies"
            size="small"
            sx={{
              bgcolor: '#E8F5E9',
              color: '#2E7D32',
              fontWeight: 600,
              fontSize: '0.72rem',
              display: { xs: 'none', md: 'flex' },
              border: '1px solid #C8E6C9',
            }}
          />

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotifClick} size="small" sx={{ ml: 0.5 }}>
              <Badge badgeContent={unreadCount} color="error" max={9}>
                <NotifIcon sx={{ color: '#546E7A' }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Tooltip title="Account">
            <IconButton onClick={handleAvatarClick} size="small">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {auth.user ? auth.user.name.charAt(0).toUpperCase() : 'AT'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Notification Popover */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={handleNotifClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, mt: 1, borderRadius: 2, boxShadow: 4 } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notifications</Typography>
          <Chip label={`${unreadCount} new`} size="small" color="success" />
        </Box>
        <List dense sx={{ py: 0, maxHeight: 300, overflowY: 'auto' }}>
          {notifications.map((n) => (
            <ListItem
              key={n._id || n.id}
              onClick={() => !n.read && handleMarkAsRead(n._id)}
              sx={{
                bgcolor: n.read ? 'transparent' : '#F1F8E9',
                borderBottom: '1px solid #F5F5F5',
                alignItems: 'flex-start',
                py: 1.2,
                cursor: n.read ? 'default' : 'pointer',
              }}
            >
              <ListItemAvatar sx={{ minWidth: 36, mt: 0.5 }}>
                <DotIcon sx={{ color: n.read ? '#BDBDBD' : '#4CAF50', fontSize: 12 }} />
              </ListItemAvatar>
              <ListItemText
                primary={<Typography sx={{ fontSize: '0.82rem', fontWeight: n.read ? 400 : 600 }}>{n.text}</Typography>}
                secondary={<Typography sx={{ fontSize: '0.72rem', color: '#9E9E9E' }}>{n.time}</Typography>}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid #E0E0E0' }}>
          <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600, cursor: 'pointer' }}>
            View All Notifications
          </Typography>
        </Box>
      </Popover>

      {/* Avatar Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleAvatarClose}
        PaperProps={{ sx: { mt: 1, borderRadius: 2, minWidth: 200, boxShadow: 4 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{auth.user ? auth.user.name : 'Admin User'}</Typography>
          <Typography variant="caption" sx={{ color: '#9E9E9E' }}>{auth.user ? auth.user.email : 'admin@cubehighways.com'}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleAvatarClose} sx={{ gap: 1.5 }}>
          <AccountIcon fontSize="small" sx={{ color: '#546E7A' }} />
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleAvatarClose} sx={{ gap: 1.5 }}>
          <SettingsIcon fontSize="small" sx={{ color: '#546E7A' }} />
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
          <LogoutIcon fontSize="small" sx={{ color: '#C62828' }} />
          <Typography variant="body2" sx={{ color: '#C62828' }}>Sign Out</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
