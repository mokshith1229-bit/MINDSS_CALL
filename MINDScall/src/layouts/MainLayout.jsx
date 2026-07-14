import React, { useState } from 'react';
import { Box, Toolbar, Typography, Divider } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6F8' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header sidebarOpen={sidebarOpen} />
        <Toolbar sx={{ minHeight: '64px !important', flexShrink: 0 }} />

        {/* ── Page Content ── */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            width: '100%',
            boxSizing: 'border-box',
            minWidth: 0,
          }}
          className="page-fade-in"
        >
          <Outlet />
        </Box>

        {/* ── Enterprise Footer ── */}
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid #E5E7EB',
            bgcolor: '#ffffff',
            py: 1.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '0.8rem',
                color: '#2E7D32',
                letterSpacing: '0.05em',
              }}
            >
              MINDS
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ borderColor: '#E5E7EB', height: 14, alignSelf: 'center' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 500 }}>
              Enterprise Innovation Management Platform
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ borderColor: '#E5E7EB', height: 14, alignSelf: 'center', display: { xs: 'none', md: 'block' } }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', display: { xs: 'none', md: 'block' } }}>
              Powered by Cube Highways Innovation Centre
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.72rem', color: '#D1D5DB' }}>
            © 2026 Cube Highways Innovation Centre. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
