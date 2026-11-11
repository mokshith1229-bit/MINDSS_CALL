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
      default: '#F8FAFC', // Very light cool gray
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
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
    divider: '#E2E8F0',
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.03em', color: '#0F172A' }, // 28px
    h2: { fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#0F172A' },  // 24px
    h3: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em', color: '#0F172A' }, // 20px
    h4: { fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em', color: '#0F172A' },// 18px
    h5: { fontWeight: 600, fontSize: '1rem', letterSpacing: '0', color: '#0F172A' },          // 16px
    h6: { fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '0', color: '#0F172A' },     // 15px
    subtitle1: { fontWeight: 600, fontSize: '0.9375rem', color: '#1E293B' },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', color: '#334155' },
    body1: { fontSize: '0.875rem', lineHeight: 1.6, color: '#334155' }, // 14px
    body2: { fontSize: '0.8125rem', lineHeight: 1.6, color: '#475569' }, // 13px
    caption: { fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }, // 12px
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#64748B',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.04), 0px 1px 3px rgba(15, 23, 42, 0.02)', // Card subtle
    '0px 2px 4px rgba(15, 23, 42, 0.04), 0px 4px 6px rgba(15, 23, 42, 0.02)',
    '0px 4px 6px rgba(15, 23, 42, 0.05), 0px 10px 15px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)', // Dropdowns/Modals
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 10px 15px rgba(15, 23, 42, 0.06), 0px 20px 25px rgba(15, 23, 42, 0.03)',
    '0px 20px 25px rgba(15, 23, 42, 0.08), 0px 30px 40px rgba(15, 23, 42, 0.04)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          fontSize: '0.875rem',
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#2E7D32',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#256427',
          },
          '&:active': {
            transform: 'scale(0.98)',
            backgroundColor: '#1B5E20',
          },
        },
        outlinedPrimary: {
          borderColor: '#E2E8F0',
          color: '#0F172A',
          backgroundColor: '#ffffff',
          '&:hover': {
            backgroundColor: '#F8FAFC',
            borderColor: '#CBD5E1',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        containedError: {
          backgroundColor: '#DC2626',
          '&:hover': { backgroundColor: '#B91C1C' },
        },
        text: {
          color: '#475569',
          '&:hover': {
            backgroundColor: '#F1F5F9',
            color: '#0F172A',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.04), 0px 1px 3px rgba(15, 23, 42, 0.02)',
          border: '1px solid #E2E8F0',
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.04), 0px 1px 3px rgba(15, 23, 42, 0.02)',
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
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F8FAFC',
            fontWeight: 600,
            color: '#64748B',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: '1px solid #E2E8F0',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          padding: '12px 16px',
          fontSize: '0.875rem',
          color: '#334155',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
          '&:last-child td, &:last-child th': {
            borderBottom: 0,
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
            backgroundColor: '#ffffff',
            transition: 'all 0.15s ease',
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2E7D32',
              borderWidth: 1,
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.15)',
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            color: '#64748B',
            '&.Mui-focused': {
              color: '#2E7D32',
            },
          },
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
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 10px 15px -3px rgba(15, 23, 42, 0.08), 0px 4px 6px -4px rgba(15, 23, 42, 0.04)',
          border: '1px solid #E2E8F0',
          marginTop: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 6,
          margin: '2px 6px',
          '&:hover': {
            backgroundColor: '#F1F5F9',
          },
          '&.Mui-selected': {
            backgroundColor: '#F0FDF4',
            color: '#2E7D32',
            '&:hover': {
              backgroundColor: '#DCFCE7',
            },
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
          color: '#64748B',
          minHeight: 44,
          padding: '10px 16px',
          '&.Mui-selected': {
            color: '#0F172A',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderBottom: '1px solid #E2E8F0',
        },
        indicator: {
          backgroundColor: '#0F172A',
          height: 2,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: '#F1F5F9',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E2E8F0',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 8px 10px -6px rgba(15, 23, 42, 0.1)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#0F172A',
          padding: '24px 24px 16px 24px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '0 24px 24px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          borderTop: '1px solid #E2E8F0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E2E8F0',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 6,
          padding: '6px 10px',
        },
        arrow: {
          color: '#1E293B',
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
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .Mui-checked': {
            color: '#ffffff',
          },
          '& .Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#2E7D32',
            opacity: 1,
          },
        },
        track: {
          backgroundColor: '#CBD5E1',
          opacity: 1,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #F8FAFC;
          color: #0F172A;
        }
        
        /* Smooth page transitions */
        .page-fade-in {
          animation: fadeInPage 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes fadeInPage {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Premium custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `,
    },
  },
});

export default theme;
