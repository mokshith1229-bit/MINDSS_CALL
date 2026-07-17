import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Tooltip, Divider, IconButton, Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Email as EmailIcon,
  Assessment as EvaluationIcon,
  CheckCircle as ApprovalIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  AccountBalance as FinanceIcon,
  Assignment as RDReviewIcon,
  FolderOpen as ProjectsIcon,
  ManageAccounts as ManageAccountsIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { authStore } from '../store/authStore';
import { useVisibility } from '../context/VisibilityContext';

const EXPANDED_WIDTH = 264;
const COLLAPSED_WIDTH = 68;

// Brand green extracted from MINDS logo
const BRAND_GREEN = '#2E7D32';
const BRAND_GREEN_BG = 'rgba(46, 125, 50, 0.14)';
const BRAND_GREEN_HOVER = 'rgba(46, 125, 50, 0.08)';
const SIDEBAR_BG = '#111C2D';
const SIDEBAR_SECTION_LABEL = 'rgba(255,255,255,0.32)';
const NAV_TEXT_ACTIVE = '#FFFFFF';
const NAV_TEXT_DEFAULT = 'rgba(255,255,255,0.58)';
const NAV_ICON_ACTIVE = '#5EC265';
const NAV_ICON_DEFAULT = 'rgba(255,255,255,0.42)';

const navSections = [
  {
    sectionLabel: null,
    items: [
      { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard', featureKey: 'module.dashboard' },
    ],
  },
  {
    sectionLabel: 'Innovation',
    items: [
      { label: 'Form Upload', icon: <UploadIcon fontSize="small" />, path: '/form-upload', featureKey: 'module.form_upload' },
      { label: 'R&D Review', icon: <RDReviewIcon fontSize="small" />, path: '/rd-review', featureKey: 'module.rd_review' },
    ],
  },
  {
    sectionLabel: 'Workflow',
    items: [
      { label: 'Auto Assign Email', icon: <EmailIcon fontSize="small" />, path: '/auto-assign-email', featureKey: 'module.auto_assign_email' },
      { label: 'Evaluation Committee', icon: <EvaluationIcon fontSize="small" />, path: '/evaluation', featureKey: 'module.evaluation' },
      { label: 'Finance Review', icon: <FinanceIcon fontSize="small" />, path: '/finance-approval', featureKey: 'module.finance_review' },
      { label: 'Approval Committee', icon: <ApprovalIcon fontSize="small" />, path: '/approval', featureKey: 'module.approval' },
    ],
  },
  {
    sectionLabel: 'Projects',
    items: [
      { label: 'R&D Ongoing Projects', icon: <ProjectsIcon fontSize="small" />, path: '/rd-ongoing-projects', featureKey: 'module.rd_ongoing_projects' },
      { label: 'Pilot Projects', icon: <ProjectsIcon fontSize="small" />, path: '/pilot-projects', featureKey: 'module.pilot_projects' },
      { label: 'Meeting Requests', icon: <EmailIcon fontSize="small" />, path: '/meeting-requests', featureKey: 'module.meeting_requests' },
    ],
  },
  {
    sectionLabel: 'Analytics',
    items: [
      { label: 'Reports', icon: <ReportsIcon fontSize="small" />, path: '/reports', featureKey: 'module.reports' },
    ],
  },
  {
    sectionLabel: 'Administration',
    items: [
      { label: 'User Management', icon: <ManageAccountsIcon fontSize="small" />, path: '/user-management', featureKey: 'module.user_management' },
      { label: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/settings', featureKey: 'module.settings' },
      { label: 'Feature Management', icon: <SettingsIcon fontSize="small" />, path: '/feature-management', featureKey: 'module.feature_management' },
      { label: 'Tracking Management', icon: <TimelineIcon fontSize="small" />, path: '/tracking-management', featureKey: 'module.feature_management' },
    ],
  },
];

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authStore.getState().user;
  const { isVisible } = useVisibility();

  const isActive = (path) =>
    location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          overflowX: 'hidden',
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: SIDEBAR_BG,
          color: '#ffffff',
          borderRight: 'none',
          boxShadow: '2px 0 12px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* ── Logo / Brand Area ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 0,
          py: 0,
          minHeight: 64,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      >
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src={logo}
                alt="MINDS Logo"
                sx={{ height: 38, width: 38, objectFit: 'contain', flexShrink: 0 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    letterSpacing: '0.06em',
                    lineHeight: 1.15,
                    fontFamily: '"Inter", "Segoe UI", sans-serif',
                  }}
                >
                  MINDS
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '0.6rem',
                    lineHeight: 1.3,
                    display: 'block',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Enterprise Innovation Platform
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Collapse sidebar" placement="right">
              <IconButton
                onClick={onToggle}
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.45)',
                  flexShrink: 0,
                  '&:hover': { color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                color: 'rgba(255,255,255,0.55)',
                '&:hover': { color: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* ── Navigation ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5 }}>
        {navSections.map((section, sIdx) => (
          <Box key={sIdx}>
            {/* Section Label */}
            {open && section.sectionLabel && (
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.9px',
                  textTransform: 'uppercase',
                  color: SIDEBAR_SECTION_LABEL,
                  px: 2.5,
                  pt: sIdx === 0 ? 0.5 : 1.5,
                  pb: 0.5,
                  display: 'block',
                }}
              >
                {section.sectionLabel}
              </Typography>
            )}
            {!open && section.sectionLabel && sIdx > 0 && (
              <Divider sx={{ my: 0.75, borderColor: 'rgba(255,255,255,0.07)', mx: 1.5 }} />
            )}

            <List sx={{ px: 1, py: 0 }}>
              {section.items
                .filter((item) => item.featureKey ? isVisible(item.featureKey) : true)
                .map((item) => {
                const active = isActive(item.path);
                return (
                  <Tooltip key={item.path} title={!open ? item.label : ''} placement="right" arrow>
                    <ListItem disablePadding sx={{ mb: 0.25 }}>
                      <ListItemButton
                        onClick={() => navigate(item.path)}
                        sx={{
                          borderRadius: '6px',
                          px: open ? 1.5 : 1,
                          py: 0.85,
                          justifyContent: open ? 'flex-start' : 'center',
                          minHeight: 40,
                          position: 'relative',
                          backgroundColor: active ? BRAND_GREEN_BG : 'transparent',
                          // Green left border for active item
                          '&::before': active ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 3,
                            height: '65%',
                            backgroundColor: BRAND_GREEN,
                            borderRadius: '0 3px 3px 0',
                          } : {},
                          '&:hover': {
                            backgroundColor: active
                              ? BRAND_GREEN_BG
                              : BRAND_GREEN_HOVER,
                          },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: open ? 34 : 'auto',
                            color: active ? NAV_ICON_ACTIVE : NAV_ICON_DEFAULT,
                            justifyContent: 'center',
                            transition: 'color 0.15s ease',
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
                                  fontSize: '0.8375rem',
                                  fontWeight: active ? 700 : 500,
                                  color: active ? NAV_TEXT_ACTIVE : NAV_TEXT_DEFAULT,
                                  transition: 'all 0.15s ease',
                                  lineHeight: 1.3,
                                }}
                              >
                                {item.label}
                              </Typography>
                            }
                            sx={{ my: 0 }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* ── Bottom: Powered by & User ── */}
      <Box
        sx={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          py: 1.5,
          px: open ? 1.5 : 0.5,
          flexShrink: 0,
        }}
      >
        {/* User section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            px: 0.5,
            py: 0.75,
            borderRadius: '6px',
            justifyContent: open ? 'flex-start' : 'center',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            cursor: 'default',
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>
              AD
            </Typography>
          </Box>
          {open && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ color: '#E5E7EB', fontWeight: 600, fontSize: '0.775rem', lineHeight: 1.2 }}
                noWrap
              >
                {currentUser?.name || 'Administrator'}
              </Typography>
              <Typography
                sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.625rem', lineHeight: 1.2 }}
                noWrap
              >
                Cube Highways Innovation Centre
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
