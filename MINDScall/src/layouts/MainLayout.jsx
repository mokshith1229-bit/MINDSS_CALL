import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F0F2F5' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header sidebarOpen={sidebarOpen} />
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <Box sx={{ p: 3, maxWidth: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
