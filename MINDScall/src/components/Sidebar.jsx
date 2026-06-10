import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Tooltip, Divider, IconButton, Typography, Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Email as EmailIcon,
  Assessment as EvaluationIcon,
  VideoCall as MeetingIcon,
  CheckCircle as ApprovalIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Business as BusinessIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  AccountBalance as FinanceIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Form Upload', icon: <UploadIcon />, path: '/form-upload' },
  { label: 'R&D Review', icon: <ScienceIcon />, path: '/rd-review' },
  { label: 'Auto Assign Email', icon: <EmailIcon />, path: '/auto-assign-email' },
  { label: 'Evaluation', icon: <EvaluationIcon />, path: '/evaluation' },
  { label: 'Meeting', icon: <MeetingIcon />, path: '/meeting' },
  { label: 'Approval', icon: <ApprovalIcon />, path: '/approval' },
  { label: 'Finance Approval', icon: <FinanceIcon />, path: '/finance-approval' },
  { label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          overflowX: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#1A2332',
          color: '#ffffff',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Logo Area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 0,
          py: 1.5,
          minHeight: 64,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(135deg, #1A2332 0%, #243447 100%)',
        }}
      >
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src={logo}
                alt="CubeTech Logo"
                sx={{ height: 36, width: 36, objectFit: 'contain', borderRadius: 1 }}
              />
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.2, fontSize: '0.95rem' }}
                >
                  CubeTech
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', display: 'block' }}
                >
                  Innovation Portal
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onToggle} sx={{ color: 'rgba(255,255,255,0.7)', p: 0.5 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Tooltip title="Expand Sidebar" placement="right">
            <IconButton onClick={onToggle} sx={{ color: 'rgba(255,255,255,0.8)', p: 1 }}>
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Nav Items */}
      <List sx={{ px: 1, pt: 2, flex: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Tooltip key={item.path} title={!open ? item.label : ''} placement="right">
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    px: open ? 2 : 1.5,
                    py: 1.2,
                    justifyContent: open ? 'flex-start' : 'center',
                    minHeight: 48,
                    position: 'relative',
                    backgroundColor: active ? 'rgba(46, 125, 50, 0.25)' : 'transparent',
                    '&::before': active ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: '60%',
                      backgroundColor: '#4CAF50',
                      borderRadius: '0 3px 3px 0',
                    } : {},
                    '&:hover': {
                      backgroundColor: active ? 'rgba(46, 125, 50, 0.30)' : 'rgba(255,255,255,0.06)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: open ? 40 : 'auto',
                      color: active ? '#4CAF50' : 'rgba(255,255,255,0.55)',
                      justifyContent: 'center',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={
                        <Typography
                          noWrap
                          sx={{
                            fontSize: '0.88rem',
                            fontWeight: active ? 700 : 400,
                            color: active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* Bottom Area */}
      <Box sx={{ pb: 2, px: 1, borderTop: '1px solid rgba(255,255,255,0.08)', pt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: open ? 1.5 : 0,
            justifyContent: open ? 'flex-start' : 'center',
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>
              AT
            </Typography>
          </Box>
          {open && (
            <Box>
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, display: 'block', fontSize: '0.8rem' }}>
                Admin User
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem' }}>
                System Administrator
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
