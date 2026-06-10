import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Alert, Paper, InputAdornment, IconButton,
  CircularProgress
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store/authStore';
import logo from '../assets/logo.png';

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
    
    // Redirect immediately if already authenticated
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
    <Box sx={{
      height: '100vh',
      display: 'flex',
      background: '#f4f6f8',
    }}>
      {/* Left side - Branding/Hero */}
      <Box sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: 'linear-gradient(135deg, #1A2332 0%, #243447 100%)',
        color: '#fff',
        p: 8,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Circles */}
        <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)' }} />
        
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box component="img" src={logo} alt="Logo" sx={{ width: 56, height: 56, borderRadius: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>
              CubeTech
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 300, mb: 3, lineHeight: 1.4 }}>
            Enterprise Innovation & Proposal Management
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', mb: 6 }}>
            Streamline your organizational ideas, evaluate CAPEX proposals, and drive strategic growth through our central portal.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#4CAF50' }}>10k+</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Ideas Managed</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#2196F3' }}>99%</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Approval SLA</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right side - Login Form */}
      <Box sx={{
        flex: { xs: 1, md: 0.8 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, sm: 6, md: 8 }
      }}>
        <Paper elevation={0} sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          bgcolor: '#fff',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box component="img" src={logo} alt="Logo" sx={{ width: 48, height: 48, borderRadius: 1.5, mb: 2, display: { md: 'none' } }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A2332', mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Please enter your credentials to access your dashboard
            </Typography>
          </Box>

          {auth.error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {auth.error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 0.8, display: 'block' }}>Email Address</Typography>
                <TextField
                  fullWidth
                  placeholder="admin@cubetech.com"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' } }
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>Password</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563EB', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Forgot Password?</Typography>
                </Box>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff sx={{ color: '#94A3B8', fontSize: 20 }} /> : <Visibility sx={{ color: '#94A3B8', fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: '#F8FAFC', '& fieldset': { borderColor: '#E2E8F0' } }
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={auth.loading || !email || !password}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                    boxShadow: '0 12px 20px rgba(46, 125, 50, 0.3)',
                  }
                }}
              >
                {auth.loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Hint: Use <strong>admin@cubetech.com</strong> / <strong>admin123</strong> to test.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
