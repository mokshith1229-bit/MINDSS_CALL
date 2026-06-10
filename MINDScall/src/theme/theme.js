import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#37474F',
      light: '#546E7A',
      dark: '#263238',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0F2F5',
      paper: '#ffffff',
    },
    success: {
      main: '#2E7D32',
      light: '#81C784',
    },
    warning: {
      main: '#F57C00',
      light: '#FFB74D',
    },
    error: {
      main: '#C62828',
      light: '#EF9A9A',
    },
    info: {
      main: '#0277BD',
      light: '#4FC3F7',
    },
    text: {
      primary: '#212121',
      secondary: '#546E7A',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 2px 8px rgba(0,0,0,0.10)',
    '0px 4px 16px rgba(0,0,0,0.10)',
    '0px 6px 20px rgba(0,0,0,0.12)',
    '0px 8px 24px rgba(0,0,0,0.12)',
    '0px 10px 28px rgba(0,0,0,0.14)',
    '0px 12px 32px rgba(0,0,0,0.14)',
    '0px 14px 36px rgba(0,0,0,0.16)',
    '0px 16px 40px rgba(0,0,0,0.16)',
    '0px 18px 44px rgba(0,0,0,0.18)',
    '0px 20px 48px rgba(0,0,0,0.18)',
    '0px 22px 52px rgba(0,0,0,0.20)',
    '0px 24px 56px rgba(0,0,0,0.20)',
    '0px 26px 60px rgba(0,0,0,0.22)',
    '0px 28px 64px rgba(0,0,0,0.22)',
    '0px 30px 68px rgba(0,0,0,0.24)',
    '0px 32px 72px rgba(0,0,0,0.24)',
    '0px 34px 76px rgba(0,0,0,0.24)',
    '0px 36px 80px rgba(0,0,0,0.24)',
    '0px 38px 84px rgba(0,0,0,0.24)',
    '0px 40px 88px rgba(0,0,0,0.24)',
    '0px 42px 92px rgba(0,0,0,0.24)',
    '0px 44px 96px rgba(0,0,0,0.24)',
    '0px 46px 100px rgba(0,0,0,0.24)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
            boxShadow: '0 6px 16px rgba(46, 125, 50, 0.45)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F5F5F5',
            fontWeight: 700,
            color: '#37474F',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
  },
});

export default theme;
