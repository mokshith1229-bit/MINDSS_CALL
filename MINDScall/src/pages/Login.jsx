import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Alert, Paper, InputAdornment, IconButton,
  CircularProgress, Divider,
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff,
  CheckCircleOutlined as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store/authStore';
import logo from '../assets/logo.png';

const features = [
  'End-to-end innovation lifecycle management',
  'Multi-stage evaluation & approval workflows',
  'Real-time R&D project tracking & reporting',
  'Role-based access for all stakeholders',
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [auth, setAuth] = useState(authStore.getState());
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = authStore.subscribe((state) => {
      setAuth(state);
      if (state.isAuthenticated) {
        navigate('/dashboard');
      }
    });
    if (authStore.getState().isAuthenticated) {
      navigate('/dashboard');
    }
    return unsub;
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    authStore.login(email, password);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        bgcolor: '#F4F6F8',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
      }}
    >
      {/* ── Left Panel: Brand ── */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#111C2D',
          color: '#fff',
          p: 5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(46,125,50,0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(46,125,50,0.06) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }}
        />

        {/* Top: Logo + Brand */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
            <Box
              component="img"
              src={logo}
              alt="MINDS Logo"
              sx={{ width: 54, height: 54, objectFit: 'contain' }}
            />
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1.75rem',
                  letterSpacing: '0.1em',
                  color: '#FFFFFF',
                  lineHeight: 1,
                  fontFamily: '"Inter", "Segoe UI", sans-serif',
                }}
              >
                MINDS
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: '#4CAF50',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  mt: 0.25,
                }}
              >
                Cube Highways Innovation Centre
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 300,
              color: '#E5E7EB',
              lineHeight: 1.45,
              mb: 1.5,
              maxWidth: 440,
            }}
          >
            Enterprise Innovation Management Platform
          </Typography>
          <Typography
            sx={{
              fontSize: '0.92rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.65,
              maxWidth: 420,
              mb: 4,
            }}
          >
            Streamline your organizational ideas, evaluate proposals, manage R&D projects, and drive strategic growth through a single enterprise portal.
          </Typography>

          {/* Feature checklist */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {features.map((f) => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <CheckIcon sx={{ color: '#4CAF50', fontSize: 16, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.68)', fontWeight: 400 }}>
                  {f}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom: Stats */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#4CAF50' }}>10k+</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', mt: 0.2 }}>Ideas Managed</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#60A5FA' }}>99%</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', mt: 0.2 }}>Approval SLA</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#FCD34D' }}>8</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', mt: 0.2 }}>Departments</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Right Panel: Login Form ── */}
      <Box
        sx={{
          flex: { xs: 1, md: 0 },
          width: { xs: '100%', md: 480 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F4F6F8',
          p: { xs: 3, md: 5 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: 1.5,
              mb: 4,
              justifyContent: 'center',
            }}
          >
            <Box component="img" src={logo} alt="MINDS" sx={{ width: 40, height: 40, objectFit: 'contain' }} />
            <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', letterSpacing: '0.08em', color: '#111827' }}>
              MINDS
            </Typography>
          </Box>

          {/* Form card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, md: 4.5 },
              borderRadius: 3,
              border: '1px solid #E5E7EB',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827', mb: 0.5 }}
              >
                Sign in to MINDS
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#6B7280' }}>
                Enter your credentials to access the platform
              </Typography>
            </Box>

            {auth.error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {auth.error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Email */}
                <Box>
                  <Typography
                    sx={{ fontWeight: 600, color: '#374151', mb: 0.75, display: 'block', fontSize: '0.84rem' }}
                    component="label"
                    htmlFor="login-email"
                  >
                    Email Address <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
                  </Typography>
                  <TextField
                    id="login-email"
                    fullWidth
                    placeholder="you@cubehighways.com"
                    variant="outlined"
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#9CA3AF', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { bgcolor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } },
                    }}
                  />
                </Box>

                {/* Password */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography
                      sx={{ fontWeight: 600, color: '#374151', fontSize: '0.84rem' }}
                      component="label"
                      htmlFor="login-password"
                    >
                      Password <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        color: '#2E7D32',
                        fontWeight: 600,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                  <TextField
                    id="login-password"
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    variant="outlined"
                    size="small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#9CA3AF', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword
                              ? <VisibilityOff sx={{ color: '#9CA3AF', fontSize: 18 }} />
                              : <Visibility sx={{ color: '#9CA3AF', fontSize: 18 }} />
                            }
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { bgcolor: '#F9FAFB', '& fieldset': { borderColor: '#E5E7EB' } },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={auth.loading || !email || !password}
                  sx={{
                    mt: 1,
                    py: 1.25,
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: 'none',
                    letterSpacing: '0.2px',
                  }}
                  id="login-submit"
                >
                  {auth.loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
                </Button>
              </Box>
            </form>
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#D1D5DB' }}>
              © 2026 Cube Highways Innovation Centre · All rights reserved
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#D1D5DB', mt: 0.5 }}>
              MINDS — Enterprise Innovation Management Platform
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
