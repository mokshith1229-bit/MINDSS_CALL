import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import AppRoutes from './routes/AppRoutes';
import { VisibilityProvider } from './context/VisibilityContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <VisibilityProvider>
          <AppRoutes />
        </VisibilityProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
