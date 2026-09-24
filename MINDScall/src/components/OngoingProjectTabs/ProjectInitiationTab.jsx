import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Divider, Switch, FormControlLabel, Alert } from '@mui/material';
import { Save, Assignment } from '@mui/icons-material';

const ProjectInitiationTab = ({ project, onUpdate }) => {
  const initData = project?.projectDetails?.initiation || {};
  const parsed = project?.parsedData || {};

  const [approvalDate, setApprovalDate] = useState(
    initData.approvalDate
      ? new Date(initData.approvalDate).toISOString().split('T')[0]
      : initData.startDate
      ? new Date(initData.startDate).toISOString().split('T')[0]
      : ''
  );
  const [kickoffDate, setKickoffDate] = useState(
    initData.kickoffDate ? new Date(initData.kickoffDate).toISOString().split('T')[0] : ''
  );
  const [sponsor, setSponsor] = useState(initData.sponsor || '');
  const [remarks, setRemarks] = useState(initData.remarks || initData.workPlan || '');

  const [piConfirmed, setPiConfirmed] = useState(initData.piConfirmed || false);
  const [confirmedObjectives, setConfirmedObjectives] = useState(initData.confirmedObjectives || parsed.objectives || '');
  const [confirmedExpectedOutcomes, setConfirmedExpectedOutcomes] = useState(initData.confirmedExpectedOutcomes || parsed.expectedOutcomes || '');

  const handleSave = () => {
    onUpdate({
      initiation: {
        ...initData,
        approvalDate,
        kickoffDate,
        sponsor,
        remarks,
        piConfirmed,
        confirmedObjectives,
        confirmedExpectedOutcomes,
        startDate: approvalDate,
        workPlan: remarks,
        status: piConfirmed ? 'SUBMITTED' : 'IN_PROGRESS'
      }
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}
    >
      {/* FORM CONTENT AREA */}
      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
        {/* HEADER TITLE & SUBTITLE WITH BLUE ICON BADGE */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
            <Box
              sx={{
                bgcolor: '#0078D4',
                color: '#FFFFFF',
                borderRadius: '8px',
                p: 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Assignment sx={{ fontSize: 20 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: '1.35rem',
                color: '#0F172A'
              }}
            >
              Project Initiation
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              color: '#64748B',
              ml: 4.5
            }}
          >
            Formalize the kickoff and document key sponsors.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3.5, borderColor: '#E2E8F0' }} />

        {/* FORM LAYOUT */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            columnGap: 4,
            rowGap: 3.5
          }}
        >
          {/* Row 1 - Left Column: Formal Approval Date */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0F172A',
                mb: 1,
                display: 'block'
              }}
            >
              Formal Approval Date
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={approvalDate}
              onChange={e => setApprovalDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  height: 48,
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#0078D4' }
                }
              }}
            />
          </Box>

          {/* Row 1 - Right Column: Kickoff Meeting Date */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0F172A',
                mb: 1,
                display: 'block'
              }}
            >
              Kickoff Meeting Date
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={kickoffDate}
              onChange={e => setKickoffDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  height: 48,
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#0078D4' }
                }
              }}
            />
          </Box>

          {/* Row 2 - Full Width: Project Sponsor / Champion */}
          <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0F172A',
                mb: 1,
                display: 'block'
              }}
            >
              Project Sponsor / Champion
            </Typography>
            <TextField
              fullWidth
              value={sponsor}
              onChange={e => setSponsor(e.target.value)}
              placeholder="e.g. John Doe (VP of R&D)"
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  height: 48,
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#0078D4' }
                }
              }}
            />
          </Box>

          {/* Row 3 - Full Width: Initiation Remarks / Notes */}
          <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' } }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0F172A',
                mb: 1,
                display: 'block'
              }}
            >
              Initiation Remarks / Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Any special constraints or instructions given during kickoff..."
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  p: 1.5,
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#0078D4' }
                }
              }}
            />
          </Box>

          {/* Confirmation Switch */}
          <Box sx={{ gridColumn: { xs: 'auto', md: '1 / -1' }, pt: 1 }}>
            <FormControlLabel
              control={<Switch checked={piConfirmed} onChange={(e) => setPiConfirmed(e.target.checked)} color="primary" />}
              label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>I confirm these details and formally initiate this project.</Typography>}
            />
          </Box>
        </Box>
      </Box>

      {/* BOTTOM ACTION BAR */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          px: { xs: 2.5, md: 3.5 },
          py: 2,
          bgcolor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0'
        }}
      >
        <Button
          variant="contained"
          startIcon={<Save sx={{ fontSize: 18 }} />}
          onClick={handleSave}
          sx={{
            height: 48,
            minWidth: 210,
            bgcolor: '#0078D4',
            '&:hover': { bgcolor: '#006CBE' },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: '8px',
            px: 3,
            boxShadow: 'none'
          }}
        >
          {piConfirmed ? 'Submit Initiation' : 'Save Initiation Details'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ProjectInitiationTab;
  );
};

export default ProjectInitiationTab;
