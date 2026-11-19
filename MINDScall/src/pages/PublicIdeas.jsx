import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, CardMedia,
  TextField, InputAdornment, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, MenuItem, Select,
  FormControl, InputLabel, CircularProgress, Tooltip, Snackbar,
  Alert, Divider, Fade, useTheme, useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Lightbulb as LightbulbIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  AutoAwesome as SparklesIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  WhatsApp as WhatsAppIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import axios from 'axios';
import logo from '../assets/logo.png';
import trackingLogo from '../assets/tracking_logo.png';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const BRAND_GREEN = '#2E7D32';
const BRAND_GREEN_DARK = '#1B5E20';
const BRAND_NAVY = '#0F172A';

// Category color palettes for visual elegance
const CATEGORY_COLORS = {
  'Process Development': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'Product Development': { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  'Operations': { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  'Safety': { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  'Sustainability': { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  'Technology': { bg: '#F8FAFC', text: '#334155', border: '#E2E8F0' },
};

const getCategoryStyle = (cat) => {
  return CATEGORY_COLORS[cat] || { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '';
  }
};

const PublicIdeas = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [innovationTypes, setInnovationTypes] = useState([]);
  const [totalIdeaSubmissions, setTotalIdeaSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modal states
  const [activeIdea, setActiveIdea] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedType !== 'All') params.innovationType = selectedType;
      if (search.trim()) params.search = search.trim();

      const res = await axios.get(`${API_BASE}/public/ideas`, { params });
      if (res.data && res.data.success) {
        setIdeas(res.data.data.ideas || []);
        if (res.data.data.totalIdeaSubmissions !== undefined) {
          setTotalIdeaSubmissions(res.data.data.totalIdeaSubmissions);
        }
        if (res.data.data.categories?.length) {
          setCategories(res.data.data.categories);
        }
        if (res.data.data.innovationTypes?.length) {
          setInnovationTypes(res.data.data.innovationTypes);
        }
      }
    } catch (err) {
      console.error('Failed to load public ideas:', err);
      setError('Unable to load ideas at this time. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [selectedCategory, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIdeas();
  };

  const handleShare = (idea) => {
    const shareUrl = window.location.href;
    const text = `Explore "${idea.title}" on the MINDS Public Ideas Portal: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: idea.title, text, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setSnackbar({ open: true, message: 'Link copied to clipboard!' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Top Header / Brand Bar ── */}
      <Box
        component="header"
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.75
            }}
          >
            {/* Logo & Hierarchy */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src={logo || trackingLogo}
                alt="MINDS Logo"
                sx={{ height: { xs: 36, sm: 44 }, objectFit: 'contain' }}
              />
              <Box sx={{ display: { xs: 'none', sm: 'block' }, borderLeft: '1px solid #E2E8F0', pl: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    lineHeight: 1.1,
                    color: BRAND_NAVY,
                    letterSpacing: '-0.01em'
                  }}
                >
                  MINDS
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',
                    fontSize: '0.75rem',
                    display: 'block',
                    fontWeight: 500
                  }}
                >
                  Powered by Cube Highways Innovation Centre
                </Typography>
              </Box>
            </Box>

            {/* Navigation links */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Button
                variant="text"
                sx={{
                  color: BRAND_GREEN,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderBottom: `2px solid ${BRAND_GREEN}`,
                  borderRadius: 0,
                  pb: 0.5,
                  px: 1
                }}
              >
                Public Ideas
              </Button>
              <Button
                variant="text"
                onClick={() => setAboutOpen(true)}
                sx={{
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': { color: BRAND_NAVY, bgcolor: 'transparent' },
                  px: 1
                }}
              >
                About
              </Button>
              <Button
                variant="text"
                onClick={() => setContactOpen(true)}
                sx={{
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': { color: BRAND_NAVY, bgcolor: 'transparent' },
                  px: 1
                }}
              >
                Contact
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Hero Section ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #15803D 100%)',
          color: '#FFFFFF',
          pt: { xs: 6, md: 9 },
          pb: { xs: 8, md: 11 },
          px: 3,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Subtle decorative glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,222,128,0.18) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Chip
            icon={<SparklesIcon sx={{ fontSize: '1rem !important', color: '#86EFAC !important' }} />}
            label="Enterprise Innovation Portal"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.75rem',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              mb: 2.5
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              mb: 2,
              color: '#FFFFFF'
            }}
          >
            Ideas That Shape Tomorrow
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.15rem' },
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 680,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Explore innovation ideas that can create meaningful change across our organization.
          </Typography>

          {/* ── Total Idea Submissions & Impact Stats ── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 2, sm: 3 },
              mt: 3.5,
              flexWrap: 'wrap'
            }}
          >
            {/* Total Idea Submissions Metric */}
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: 2.5,
                px: { xs: 2.5, sm: 3.5 },
                py: 1.25,
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.15rem' },
                  color: '#86EFAC',
                  lineHeight: 1.1,
                  mb: 0.25
                }}
              >
                {totalIdeaSubmissions}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'block'
                }}
              >
                Total Idea Submissions
              </Typography>
            </Box>

            {/* Published Ideas Metric */}
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 2.5,
                px: { xs: 2, sm: 3 },
                py: 1.25,
                textAlign: 'center'
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.15rem' },
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                  mb: 0.25
                }}
              >
                {ideas.length}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block'
                }}
              >
                Featured Ideas
              </Typography>
            </Box>

            {/* Innovation Sectors Metric */}
            {categories.length > 0 && (
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 2.5,
                  px: { xs: 2, sm: 3 },
                  py: 1.25,
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.75rem', sm: '2.15rem' },
                    color: '#FFFFFF',
                    lineHeight: 1.1,
                    mb: 0.25
                  }}
                >
                  {categories.length}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block'
                  }}
                >
                  Focus Sectors
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* ── Search & Filters Bar (Elevated) ── */}
      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 10, mb: 5 }}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
          }}
        >
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 2
            }}
          >
            {/* Search Input */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search ideas by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: '#F8FAFC',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: BRAND_GREEN }
                }
              }}
            />

            {/* Category Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#E2E8F0' }
                }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Innovation Type Filter (if available) */}
            {innovationTypes.length > 0 && (
              <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 190 } }}>
                <InputLabel id="type-filter-label">Innovation Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  label="Innovation Type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#E2E8F0' }
                  }}
                >
                  <MenuItem value="All">All Types</MenuItem>
                  {innovationTypes.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Search Button */}
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: BRAND_GREEN,
                '&:hover': { bgcolor: BRAND_GREEN_DARK },
                minWidth: { xs: '100%', md: 110 },
                height: 40,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none'
              }}
            >
              Search
            </Button>
          </Box>
        </Card>
      </Container>

      {/* ── Main Content Area: Ideas Display ── */}
      <Container maxWidth="lg" sx={{ flex: 1, pb: 8 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
            <CircularProgress sx={{ color: BRAND_GREEN, mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Loading innovation ideas...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : ideas.length === 0 ? (
          /* ── Initial Placeholder / Empty State ── */
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 8, md: 12 },
              px: 3,
              bgcolor: '#FFFFFF',
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'rgba(46, 125, 50, 0.08)',
                color: BRAND_GREEN,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <LightbulbIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: BRAND_NAVY,
                mb: 1.5,
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              }}
            >
              Something Innovative Is Coming
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#64748B',
                maxWidth: 480,
                mx: 'auto',
                lineHeight: 1.6,
                mb: 3
              }}
            >
              We are preparing a collection of innovative ideas. Check back soon to explore them.
            </Typography>

            {totalIdeaSubmissions > 0 && (
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={`Total Idea Submissions to Date: ${totalIdeaSubmissions}`}
                  sx={{
                    bgcolor: '#F0FDF4',
                    color: BRAND_GREEN_DARK,
                    fontWeight: 700,
                    border: '1px solid #BBF7D0',
                    px: 1.5,
                    py: 2.25,
                    fontSize: '0.875rem'
                  }}
                />
              </Box>
            )}

            {(search || selectedCategory !== 'All' || selectedType !== 'All') && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                }}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          /* ── Ideas Grid ── */
          <>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  label={`Total Idea Submissions: ${totalIdeaSubmissions}`}
                  size="small"
                  sx={{
                    bgcolor: '#ECFDF5',
                    color: '#065F46',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    border: '1px solid #A7F3D0'
                  }}
                />
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                  Showing <b>{ideas.length}</b> published idea{ideas.length === 1 ? '' : 's'}
                  {(search || selectedCategory !== 'All' || selectedType !== 'All') ? ' matching filters' : ''}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {ideas.map((idea) => {
                const catStyle = getCategoryStyle(idea.category);

                return (
                  <Grid item xs={12} sm={6} md={4} key={idea.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                          borderColor: '#CBD5E1'
                        }
                      }}
                    >
                      {/* Cover Media or Top Gradient */}
                      {idea.coverImage ? (
                        <CardMedia
                          component="img"
                          height="160"
                          image={idea.coverImage}
                          alt={idea.title}
                          sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 120,
                            background: `linear-gradient(135deg, ${catStyle.bg} 0%, #FFFFFF 100%)`,
                            borderBottom: '1px solid #F1F5F9',
                            p: 2.5,
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: '#FFFFFF',
                              border: `1px solid ${catStyle.border}`,
                              color: catStyle.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                            }}
                          >
                            <LightbulbIcon sx={{ fontSize: 22 }} />
                          </Box>

                          <Tooltip title="Share Idea">
                            <IconButton
                              size="small"
                              onClick={() => handleShare(idea)}
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.8)',
                                color: '#64748B',
                                '&:hover': { bgcolor: '#FFFFFF', color: BRAND_GREEN }
                              }}
                            >
                              <ShareIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}

                      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Meta: Category & Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                          <Chip
                            label={idea.category}
                            size="small"
                            sx={{
                              bgcolor: catStyle.bg,
                              color: catStyle.text,
                              border: `1px solid ${catStyle.border}`,
                              fontWeight: 600,
                              fontSize: '0.725rem',
                              height: 24
                            }}
                          />

                          {idea.submissionDate && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontSize: '0.75rem'
                              }}
                            >
                              <CalendarIcon sx={{ fontSize: 13 }} />
                              {formatDate(idea.submissionDate)}
                            </Typography>
                          )}
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: BRAND_NAVY,
                            lineHeight: 1.35,
                            mb: 1.25
                          }}
                        >
                          {idea.title}
                        </Typography>

                        {/* Short Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64748B',
                            fontSize: '0.875rem',
                            lineHeight: 1.6,
                            mb: 2.5,
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {idea.description || 'No description provided.'}
                        </Typography>

                        {/* Read More button */}
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setActiveIdea(idea)}
                          sx={{
                            color: BRAND_GREEN,
                            borderColor: '#C8E6C9',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            fontSize: '0.85rem',
                            '&:hover': {
                              borderColor: BRAND_GREEN,
                              bgcolor: 'rgba(46, 125, 50, 0.04)'
                            }
                          }}
                        >
                          Explore Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Container>

      {/* ── Idea Details Modal ── */}
      <Dialog
        open={!!activeIdea}
        onClose={() => setActiveIdea(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        {activeIdea && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
              <Box sx={{ pr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={activeIdea.category}
                    size="small"
                    sx={{
                      ...getCategoryStyle(activeIdea.category),
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 24
                    }}
                  />
                  {activeIdea.innovationType && (
                    <Chip
                      label={activeIdea.innovationType}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem', height: 24, color: '#64748B' }}
                    />
                  )}
                  {activeIdea.submissionDate && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 14 }} />
                      {formatDate(activeIdea.submissionDate)}
                    </Typography>
                  )}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: BRAND_NAVY, lineHeight: 1.3 }}>
                  {activeIdea.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setActiveIdea(null)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 2.5 }}>
              {activeIdea.coverImage && (
                <Box
                  component="img"
                  src={activeIdea.coverImage}
                  alt={activeIdea.title}
                  sx={{
                    width: '100%',
                    maxHeight: 280,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 3
                  }}
                />
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                Overview & Impact
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.95rem'
                }}
              >
                {activeIdea.description || 'No detailed description available.'}
              </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
              <Button
                startIcon={<ShareIcon />}
                onClick={() => handleShare(activeIdea)}
                sx={{ textTransform: 'none', color: BRAND_GREEN, fontWeight: 600 }}
              >
                Share
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveIdea(null)}
                sx={{
                  bgcolor: BRAND_GREEN,
                  '&:hover': { bgcolor: BRAND_GREEN_DARK },
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── About Modal ── */}
      <Dialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(46,125,50,0.1)', color: BRAND_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <InfoIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_NAVY }}>
              About MINDS
            </Typography>
          </Box>
          <IconButton onClick={() => setAboutOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, mb: 2 }}>
            <b>MINDS</b> (Management of Ideas & New Development Submissions) is the enterprise innovation management platform developed for Cube Highways.
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, mb: 2 }}>
            Powered by the <b>Cube Highways Innovation Centre</b>, MINDS fosters a collaborative culture of continuous improvement, enabling breakthrough ideas in infrastructure, sustainability, technology, and process excellence.
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
            Selected innovation ideas featured on this public portal represent our organization's commitment to transparency, thought leadership, and forward-looking solutions.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            onClick={() => setAboutOpen(false)}
            sx={{ bgcolor: BRAND_GREEN, '&:hover': { bgcolor: BRAND_GREEN_DARK }, textTransform: 'none', borderRadius: 2 }}
          >
            Understood
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Contact Modal ── */}
      <Dialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(46,125,50,0.1)', color: BRAND_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmailIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND_NAVY }}>
              Contact Us
            </Typography>
          </Box>
          <IconButton onClick={() => setContactOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            For inquiries regarding ideas, partnerships, or the Cube Highways Innovation Centre, connect with our innovation secretariat:
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block' }}>
              INNOVATION SECRETARIAT
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: BRAND_NAVY, mt: 0.5 }}>
              Cube Highways Innovation Centre
            </Typography>
            <Typography variant="body2" sx={{ color: BRAND_GREEN, mt: 0.5 }}>
              innovation@cubehighways.com
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            component="a"
            href="mailto:innovation@cubehighways.com"
            variant="contained"
            sx={{ bgcolor: BRAND_GREEN, '&:hover': { bgcolor: BRAND_GREEN_DARK }, textTransform: 'none', borderRadius: 2, width: '100%' }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Footer ── */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          py: 4,
          mt: 'auto',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, mb: 0.5 }}>
            MINDS • Enterprise Innovation Management Platform
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Powered by Cube Highways Innovation Centre • All Rights Reserved
          </Typography>
        </Container>
      </Box>

      {/* Toast Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicIdeas;
