import React from 'react';
import { Box, Stepper, Step, StepLabel, StepContent, Typography, Card, CardContent } from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  ArrowCircleUp as SubmittedIcon,
  AssignmentTurnedIn as AssignedIcon,
  RateReview as ReviewedIcon,
  PlayCircleFilled as StartedIcon,
  AccountBalanceWallet as FinanceIcon,
  History as HistoryIcon
} from '@mui/icons-material';

const EVENT_CONFIG = {
  'Submitted': { color: '#0288D1', bg: '#E1F5FE', icon: <SubmittedIcon /> },
  'R&D Reviewed': { color: '#7B1FA2', bg: '#F3E5F5', icon: <ReviewedIcon /> },
  'RM Assigned': { color: '#F57C00', bg: '#FFF3E0', icon: <AssignedIcon /> },
  'HOD Assigned': { color: '#F57C00', bg: '#FFF3E0', icon: <AssignedIcon /> },
  'RM Approved': { color: '#2E7D32', bg: '#E8F5E9', icon: <ApprovedIcon /> },
  'RM Rejected': { color: '#C62828', bg: '#FFEBEE', icon: <RejectedIcon /> },
  'HOD Approved': { color: '#2E7D32', bg: '#E8F5E9', icon: <ApprovedIcon /> },
  'HOD Rejected': { color: '#C62828', bg: '#FFEBEE', icon: <RejectedIcon /> },
  'RM Clarification Requested': { color: '#EF6C00', bg: '#FFF3E0', icon: <PendingIcon /> },
  'HOD Clarification Requested': { color: '#EF6C00', bg: '#FFF3E0', icon: <PendingIcon /> },
  'Evaluation Started': { color: '#00796B', bg: '#E0F2F1', icon: <StartedIcon /> },
  'Finance Approved': { color: '#FBC02D', bg: '#FFFDE7', icon: <FinanceIcon /> },
  'Final Approval': { color: '#2E7D32', bg: '#E8F5E9', icon: <ApprovedIcon /> },
  'Rejected': { color: '#C62828', bg: '#FFEBEE', icon: <RejectedIcon /> },
};

const getEventConfig = (event) => {
  return EVENT_CONFIG[event] || { color: '#546E7A', bg: '#ECEFF1', icon: <PendingIcon /> };
};

const Timeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fff', borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>No timeline events recorded yet.</Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', bgcolor: '#FFFFFF' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <HistoryIcon sx={{ color: '#0F172A' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: 0.5 }}>Workflow Timeline</Typography>
        </Box>
        <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { minHeight: 24, ml: '1px', borderColor: '#E2E8F0' } }}>
          {timeline.map((step, index) => {
            const config = getEventConfig(step.event);
            const dateStr = new Date(step.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <Step key={index} active={true}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{
                      width: 32,
                      height: 32,
                      bgcolor: config.bg,
                      color: config.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1.5px solid ${config.color}30`
                    }}>
                      {React.cloneElement(config.icon, { sx: { fontSize: 18 } })}
                    </Box>
                  )}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, ml: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B' }}>{step.event}</Typography>
                      {step.actor && (
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mt: 0.25 }}>
                          by {step.actor}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>
                      {dateStr}
                    </Typography>
                  </Box>
                </StepLabel>
                {step.remarks && (
                  <StepContent sx={{ borderLeft: '2px solid #E2E8F0', ml: '15px', pl: 3, pb: 2 }}>
                    <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2, border: '1px solid #F1F5F9', mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {step.remarks}
                      </Typography>
                    </Box>
                  </StepContent>
                )}
              </Step>
            );
          })}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default Timeline;
