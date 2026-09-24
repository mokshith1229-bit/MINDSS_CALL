import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Divider
} from '@mui/material';
import {
  Add, Delete, Save, Description, TrackChanges, BarChart
} from '@mui/icons-material';

const OverviewTab = ({ project, onUpdate }) => {
  const pDetails = project?.projectDetails || {};
  const [objectives, setObjectives] = useState(pDetails.objectives || []);
  const [newObj, setNewObj] = useState('');
  const [expBenefits, setExpBenefits] = useState(pDetails.expectedBenefits || project?.benefits || '');
  const [actBenefits, setActBenefits] = useState(pDetails.actualBenefits || '');

  const handleAddObjective = () => {
    if (!newObj.trim()) return;
    setObjectives([...objectives, { name: newObj, status: 'Not Started' }]);
    setNewObj('');
  };

  const handleDeleteObjective = (idx) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onUpdate({
      objectives,
      expectedBenefits: expBenefits,
      actualBenefits: actBenefits
    });
  };

  const submitter = (project?.employeeName || project?.employeeCode)
    ? `${project?.employeeName || 'Unknown'}${project?.employeeCode ? ` (${project.employeeCode})` : ' (Unknown)'}`
    : 'Unknown (Unknown)';
  const department = project?.dept || 'Unknown';
  const rawAbstract = project?.abstract || project?.answers?.abstract || project?.projectDetails?.abstract || '';
  const abstractParagraphs = rawAbstract ? rawAbstract.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean) : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* PROJECT ABSTRACT & ORIGIN */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}
          >
            <Description sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
            Project Abstract & Origin
          </Typography>
        </Box>

        {/* Submitter and Department */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3, mb: 2.5 }}>
          <Box sx={{ minWidth: 200, pr: { md: 4 } }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
              Submitter
            </Typography>
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500, fontSize: '0.875rem' }}>
              {submitter}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: '#E2E8F0' }} />

          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
              Department
            </Typography>
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500, fontSize: '0.875rem' }}>
              {department}
            </Typography>
          </Box>
        </Box>

        {/* Abstract / Proposal Details Header */}
        <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.8125rem', mb: 1.25 }}>
          Abstract / Proposal Details
        </Typography>

        {/* Abstract Content Box */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: '#F8FAFC',
            border: '1px solid #F1F5F9',
            borderRadius: '8px'
          }}
        >
          {abstractParagraphs.length > 0 ? (
            abstractParagraphs.map((para, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{
                  color: '#334155',
                  fontSize: '0.875rem',
                  lineHeight: 1.65,
                  mb: idx < abstractParagraphs.length - 1 ? 2 : 0
                }}
              >
                {para}
              </Typography>
            ))
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: '#334155',
                fontSize: '0.875rem',
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap'
              }}
            >
              {rawAbstract || 'No abstract provided.'}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* PROJECT OBJECTIVES */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Section Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#F43F5E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}
            >
              <TrackChanges sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
              Project Objectives
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<Save sx={{ fontSize: 16 }} />}
            onClick={handleSave}
            sx={{
              bgcolor: '#0078D4',
              '&:hover': { bgcolor: '#006CBE' },
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              px: 2,
              py: 0.75
            }}
          >
            Save Changes
          </Button>
        </Box>

        {/* Objectives Table */}
        <TableContainer
          component={Box}
          sx={{
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            overflow: 'hidden',
            mb: 2.5
          }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.25, borderBottom: '1px solid #E2E8F0' }}>
                  OBJECTIVE
                </TableCell>
                <TableCell width={120} sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.25, borderBottom: '1px solid #E2E8F0' }}>
                  STATUS
                </TableCell>
                <TableCell width={80} align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.25, borderBottom: '1px solid #E2E8F0' }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objectives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4.5, borderBottom: 'none' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Description sx={{ fontSize: 18, color: '#94A3B8' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748B' }}>
                        No objectives defined yet.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                objectives.map((obj, idx) => (
                  <TableRow key={idx} sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell sx={{ color: '#1E293B', fontWeight: 500, fontSize: '0.875rem', py: 1.5 }}>
                      {obj.name || obj.text}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        size="small"
                        label={obj.status}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: obj.status === 'Completed' ? '#D1FAE5' : '#F1F5F9',
                          color: obj.status === 'Completed' ? '#065F46' : '#334155',
                          borderRadius: '4px'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteObjective(idx)}
                        sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Objective Input Area */}
        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Add a new objective..."
            value={newObj}
            onChange={(e) => setNewObj(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddObjective(); }}
            sx={{
              bgcolor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.875rem',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#10B981' }
              }
            }}
          />
          <Button
            variant="outlined"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            onClick={handleAddObjective}
            sx={{
              whiteSpace: 'nowrap',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#059669',
              borderColor: '#10B981',
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              px: 2.5,
              '&:hover': {
                borderColor: '#059669',
                bgcolor: '#ECFDF5'
              }
            }}
          >
            Add Objective
          </Button>
        </Box>
      </Paper>

      {/* EXPECTED VS ACTUAL BENEFITS */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}
          >
            <BarChart sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>
            Expected vs Actual Benefits
          </Typography>
        </Box>

        {/* 1. Full-Width Expected Benefits */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              mb: 1,
              display: 'block'
            }}
          >
            Expected Benefits (From Proposal)
          </Typography>
          <Box
            sx={{
              width: '100%',
              p: 2.5,
              minHeight: 110,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxSizing: 'border-box'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: expBenefits ? '#334155' : '#64748B',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}
            >
              {expBenefits || 'No benefits provided'}
            </Typography>
          </Box>
        </Box>

        {/* 2. Full-Width Actual Realized Benefits */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              mb: 1,
              display: 'block'
            }}
          >
            Actual Realized Benefits
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={actBenefits}
            onChange={(e) => setActBenefits(e.target.value)}
            placeholder="Actual value realized post-implementation..."
            sx={{
              bgcolor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.875rem',
                p: 2,
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#0078D4' }
              }
            }}
          />
        </Box>

        {/* 3. Save Benefits Button (Right Aligned) */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<Save sx={{ fontSize: 16 }} />}
            onClick={handleSave}
            sx={{
              height: 42,
              minWidth: 150,
              bgcolor: '#0078D4',
              '&:hover': { bgcolor: '#006CBE' },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '8px',
              px: 2.5,
              boxShadow: 'none'
            }}
          >
            Save Benefits
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OverviewTab;
