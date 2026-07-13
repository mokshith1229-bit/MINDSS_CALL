import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Alert, InputAdornment, IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store/authStore';
import logo from '../assets/logo.png';
import bgImage from '../assets/login-bg.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [auth, setAuth] = useState(authStore.getState());
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = authStore.subscribe((state) => {
      setAuth(state);
      if (state.isAuthenticated) navigate('/dashboard');
    });
    if (authStore.getState().isAuthenticated) navigate('/dashboard');
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        // Background Image
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ── Dark Overlay for readability ── */}
      <Box sx={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // adjust darkness here
        zIndex: 0,
      }} />

      {/* ── Ambient orbs (optional, can be removed if too busy with image) ── */}
      <Box sx={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,125,50,0.22) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(21,101,192,0.18) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', top: '40%', right: '15%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(76,175,80,0.10) 0%, transparent 70%)',
        filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      {/* ── Floating particles ── */}
      {[
        { top: '12%', left: '8%', size: 6, opacity: 0.25 },
        { top: '70%', left: '5%', size: 4, opacity: 0.18 },
        { top: '25%', right: '10%', size: 5, opacity: 0.20 },
        { top: '80%', right: '8%', size: 7, opacity: 0.15 },
        { top: '50%', left: '20%', size: 3, opacity: 0.22 },
        { top: '15%', right: '28%', size: 4, opacity: 0.18 },
      ].map((p, i) => (
        <Box key={i} sx={{
          position: 'absolute',
          top: p.top, left: p.left, right: p.right,
          width: p.size, height: p.size, borderRadius: '50%',
          bgcolor: `rgba(76,175,80,${p.opacity})`,
          pointerEvents: 'none',
          animation: `float-${i % 3} ${4 + i}s ease-in-out infinite`,
        }} />
      ))}

      {/* ── Glass Card ── */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          mx: 2,
          // Glassmorphism
          background: 'rgba(20, 30, 40, 0.45)', // Slightly darker tint for light images
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `
            0 32px 64px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 1px 0 rgba(255,255,255,0.2) inset
          `,
          overflow: 'hidden',
        }}
      >
        {/* Top shimmer line */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
        }} />

        {/* Inner content */}
        <Box sx={{ px: { xs: 4, sm: 5 }, pt: 5.5, pb: 5 }}>

          {/* Logo + Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: '12px',
                background: 'rgba(46,125,50,0.18)',
                border: '1px solid rgba(76,175,80,0.30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                flexShrink: 0,
              }}
            >
              <Box component="img" src={logo} alt="MINDS"
                sx={{ width: 28, height: 28, objectFit: 'contain' }} />
            </Box>
            <Box>
              <Typography sx={{
                fontWeight: 900, fontSize: '1.15rem', letterSpacing: '0.1em',
                color: '#FFFFFF', lineHeight: 1.1,
              }}>
                MINDS
              </Typography>
              <Typography sx={{
                fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)',
                fontWeight: 500, letterSpacing: '0.04em', lineHeight: 1.4,
              }}>
                Cube Highways Innovation Centre
              </Typography>
            </Box>
          </Box>

          {/* Heading */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{
              fontWeight: 800, fontSize: '1.6rem', color: '#FFFFFF',
              lineHeight: 1.2, mb: 0.5,
              letterSpacing: '-0.01em',
            }}>
              Welcome back
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)' }}>
              Sign in to your account to continue
            </Typography>
          </Box>

          {/* Error */}
          {auth.error && (
            <Alert severity="error" sx={{
              mb: 3, borderRadius: 2, fontSize: '0.84rem',
              bgcolor: 'rgba(211,47,47,0.15)',
              color: '#FCA5A5',
              border: '1px solid rgba(211,47,47,0.30)',
              '& .MuiAlert-icon': { color: '#FCA5A5' },
            }}>
              {auth.error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Email */}
              <Box>
                <Typography component="label" htmlFor="login-email" sx={{
                  display: 'block', fontWeight: 600, fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.65)', mb: 0.75,
                }}>
                  Email address
                </Typography>
                <TextField
                  id="login-email"
                  fullWidth
                  placeholder="you@cubehighways.com"
                  variant="outlined"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.07)',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s ease',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                      '&.Mui-focused': {
                        bgcolor: 'rgba(255,255,255,0.10)',
                        boxShadow: '0 0 0 3px rgba(76,175,80,0.18)',
                      },
                      '&.Mui-focused fieldset': { borderColor: 'rgba(76,175,80,0.60)', borderWidth: 1.5 },
                    },
                    '& input::placeholder': { color: 'rgba(255,255,255,0.25)', opacity: 1 },
                    '& input': { color: '#FFFFFF' },
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Typography component="label" htmlFor="login-password" sx={{
                  display: 'block', fontWeight: 600, fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.65)', mb: 0.75,
                }}>
                  Password
                </Typography>
                <TextField
                  id="login-password"
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  variant="outlined"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                          sx={{ color: 'rgba(255,255,255,0.35)', '&:hover': { color: 'rgba(255,255,255,0.65)' } }}
                        >
                          {showPassword
                            ? <VisibilityOff sx={{ fontSize: 17 }} />
                            : <Visibility sx={{ fontSize: 17 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.07)',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s ease',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                      '&.Mui-focused': {
                        bgcolor: 'rgba(255,255,255,0.10)',
                        boxShadow: '0 0 0 3px rgba(76,175,80,0.18)',
                      },
                      '&.Mui-focused fieldset': { borderColor: 'rgba(76,175,80,0.60)', borderWidth: 1.5 },
                    },
                    '& input::placeholder': { color: 'rgba(255,255,255,0.25)', opacity: 1 },
                    '& input': { color: '#FFFFFF' },
                  }}
                />
              </Box>

              {/* Sign In Button */}
              <Button
                id="login-submit"
                type="submit"
                fullWidth
                variant="contained"
                disabled={auth.loading || !email || !password}
                sx={{
                  mt: 0.5,
                  py: 1.4,
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  textTransform: 'none',
                  letterSpacing: '0.3px',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 50%, #2E7D32 100%)',
                  backgroundSize: '200% 100%',
                  boxShadow: '0 4px 24px rgba(46,125,50,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
                  border: '1px solid rgba(76,175,80,0.40)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundPosition: '100% 0',
                    boxShadow: '0 6px 32px rgba(46,125,50,0.60)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': { transform: 'translateY(0px)' },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.25)',
                    boxShadow: 'none',
                    border: '1px solid rgba(255,255,255,0.08)',
                  },
                }}
              >
                {auth.loading
                  ? <CircularProgress size={20} color="inherit" />
                  : 'Sign In'}
              </Button>
            </Box>
          </form>
        </Box>

        {/* Footer */}
        <Box sx={{
          px: 5, py: 2.5,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(0,0,0,0.15)',
          textAlign: 'center',
        }}>
          <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.02em' }}>
            © 2026 Cube Highways Innovation Centre · All rights reserved
          </Typography>
        </Box>
      </Box>

      {/* CSS keyframes for floating particles */}
      <style>{`
        @keyframes float-0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes float-1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes float-2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-15px)} }
      `}</style>
    </Box>
  );
};

export default Login;
