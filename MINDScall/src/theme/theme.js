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
      main: '#475569',
      light: '#64748B',
      dark: '#334155',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F6F8',
      paper: '#ffffff',
    },
    success: {
      main: '#2E7D32',
      light: '#81C784',
      dark: '#1B5E20',
    },
    warning: {
      main: '#D97706',
      light: '#FCD34D',
      dark: '#B45309',
    },
    error: {
      main: '#DC2626',
      light: '#FCA5A5',
      dark: '#B91C1C',
    },
    info: {
      main: '#1D4ED8',
      light: '#60A5FA',
      dark: '#1E3A8A',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB',
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.5px', color: '#111827' },
    h2: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.3px', color: '#111827' },
    h3: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.2px', color: '#111827' },
    h4: { fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.2px', color: '#111827' },
    h5: { fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.1px', color: '#111827' },
    h6: { fontWeight: 600, fontSize: '1rem', color: '#111827' },
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem', color: '#1F2937' },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', color: '#374151' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: '#374151' },
    body2: { fontSize: '0.875rem', lineHeight: 1.6, color: '#4B5563' },
    caption: { fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.5 },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      color: '#9CA3AF',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0,0,0,0.06), 0px 1px 3px rgba(0,0,0,0.04)',
    '0px 1px 4px rgba(0,0,0,0.07), 0px 2px 6px rgba(0,0,0,0.05)',
    '0px 2px 8px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.04)',
    '0px 4px 12px rgba(0,0,0,0.09), 0px 2px 4px rgba(0,0,0,0.04)',
    '0px 6px 16px rgba(0,0,0,0.10), 0px 2px 6px rgba(0,0,0,0.04)',
    '0px 8px 20px rgba(0,0,0,0.10), 0px 3px 8px rgba(0,0,0,0.05)',
    '0px 10px 24px rgba(0,0,0,0.11), 0px 4px 10px rgba(0,0,0,0.05)',
    '0px 12px 28px rgba(0,0,0,0.12), 0px 4px 12px rgba(0,0,0,0.06)',
    '0px 14px 32px rgba(0,0,0,0.12), 0px 5px 14px rgba(0,0,0,0.06)',
    '0px 16px 36px rgba(0,0,0,0.13), 0px 6px 16px rgba(0,0,0,0.07)',
    '0px 18px 40px rgba(0,0,0,0.13), 0px 6px 18px rgba(0,0,0,0.07)',
    '0px 20px 44px rgba(0,0,0,0.14), 0px 7px 20px rgba(0,0,0,0.08)',
    '0px 22px 48px rgba(0,0,0,0.14), 0px 8px 22px rgba(0,0,0,0.08)',
    '0px 24px 52px rgba(0,0,0,0.15), 0px 8px 24px rgba(0,0,0,0.08)',
    '0px 26px 56px rgba(0,0,0,0.15), 0px 9px 26px rgba(0,0,0,0.09)',
    '0px 28px 60px rgba(0,0,0,0.16), 0px 10px 28px rgba(0,0,0,0.09)',
    '0px 30px 64px rgba(0,0,0,0.16), 0px 10px 30px rgba(0,0,0,0.09)',
    '0px 32px 68px rgba(0,0,0,0.17), 0px 11px 32px rgba(0,0,0,0.10)',
    '0px 34px 72px rgba(0,0,0,0.17), 0px 12px 34px rgba(0,0,0,0.10)',
    '0px 36px 76px rgba(0,0,0,0.18), 0px 12px 36px rgba(0,0,0,0.10)',
    '0px 38px 80px rgba(0,0,0,0.18), 0px 13px 38px rgba(0,0,0,0.11)',
    '0px 40px 84px rgba(0,0,0,0.19), 0px 14px 40px rgba(0,0,0,0.11)',
    '0px 42px 88px rgba(0,0,0,0.19), 0px 14px 42px rgba(0,0,0,0.11)',
    '0px 44px 92px rgba(0,0,0,0.20), 0px 15px 44px rgba(0,0,0,0.12)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
          fontSize: '0.875rem',
          padding: '8px 18px',
          letterSpacing: '0.1px',
          transition: 'all 0.18s ease',
        },
        containedPrimary: {
          backgroundColor: '#2E7D32',
          color: '#ffffff',
          boxShadow: '0 1px 3px rgba(46,125,50,0.25)',
          '&:hover': {
            backgroundColor: '#256427',
            boxShadow: '0 2px 6px rgba(46,125,50,0.35)',
          },
          '&:active': {
            backgroundColor: '#1B5E20',
          },
        },
        outlinedPrimary: {
          borderColor: '#2E7D32',
          color: '#2E7D32',
          '&:hover': {
            backgroundColor: '#F0FAF0',
            borderColor: '#256427',
          },
        },
        containedError: {
          backgroundColor: '#DC2626',
          '&:hover': { backgroundColor: '#B91C1C' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0,0,0,0.07), 0px 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid #E5E7EB',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F9FAFB',
            fontWeight: 700,
            color: '#374151',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            borderBottom: '2px solid #E5E7EB',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F3F4F6',
          padding: '14px 16px',
          fontSize: '0.875rem',
          color: '#374151',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F8FAFF',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: '#D1D5DB',
            },
            '&:hover fieldset': {
              borderColor: '#9CA3AF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2E7D32',
              borderWidth: 1.5,
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#6B7280',
          '&.Mui-selected': {
            color: '#2E7D32',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#2E7D32',
          height: 2,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: '#E5E7EB',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E5E7EB',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 20px 60px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1F2937',
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 6,
          padding: '6px 10px',
        },
        arrow: {
          color: '#1F2937',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .Mui-checked': {
            color: '#2E7D32',
          },
          '& .Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#4CAF50',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '*': { boxSizing: 'border-box' },
        },
      },
    },
  },
});

export default theme;
