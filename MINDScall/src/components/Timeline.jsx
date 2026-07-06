import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  RadioButtonChecked as CurrentIcon,
  RadioButtonUnchecked as PendingIcon,
  ArrowCircleUp as SubmittedIcon,
  AssignmentTurnedIn as AssignedIcon,
  RateReview as ReviewedIcon,
  PlayCircleFilled as StartedIcon,
  AccountBalanceWallet as FinanceIcon,
  Cancel as RejectedIcon,
  History as HistoryIcon,
  HourglassEmpty as WaitingIcon,
} from '@mui/icons-material';

const EVENT_CONFIG = {
  'Submission Created':              { color: '#1D4ED8', bg: '#EFF6FF', icon: <SubmittedIcon /> },
  'R&D Reviewed':                    { color: '#7C3AED', bg: '#F5F3FF', icon: <ReviewedIcon /> },
  'RM Assigned':                     { color: '#D97706', bg: '#FFFBEB', icon: <AssignedIcon /> },
  'RM Assigned (Auto Batch)':        { color: '#D97706', bg: '#FFFBEB', icon: <AssignedIcon /> },
  'HOD Assigned':                    { color: '#D97706', bg: '#FFFBEB', icon: <AssignedIcon /> },
  'RM Approved':                     { color: '#2E7D32', bg: '#F0FDF4', icon: <CompletedIcon /> },
  'RM Rejected':                     { color: '#DC2626', bg: '#FEF2F2', icon: <RejectedIcon /> },
  'HOD Approved':                    { color: '#2E7D32', bg: '#F0FDF4', icon: <CompletedIcon /> },
  'HOD Rejected':                    { color: '#DC2626', bg: '#FEF2F2', icon: <RejectedIcon /> },
  'RM Clarification Requested':      { color: '#1D4ED8', bg: '#EFF6FF', icon: <WaitingIcon /> },
  'HOD Clarification Requested':     { color: '#D97706', bg: '#FFFBEB', icon: <WaitingIcon /> },
  'Evaluation Started':              { color: '#0C4A6E', bg: '#F0F9FF', icon: <StartedIcon /> },
  'Evaluation Assigned':             { color: '#0C4A6E', bg: '#F0F9FF', icon: <AssignedIcon /> },
  'Evaluation Approved':             { color: '#2E7D32', bg: '#F0FDF4', icon: <CompletedIcon /> },
  'Evaluation Rejected':             { color: '#DC2626', bg: '#FEF2F2', icon: <RejectedIcon /> },
  'Evaluation Clarification':        { color: '#D97706', bg: '#FFFBEB', icon: <WaitingIcon /> },
  'Finance Approved':                { color: '#D97706', bg: '#FFFBEB', icon: <FinanceIcon /> },
  'Final Approval':                  { color: '#2E7D32', bg: '#F0FDF4', icon: <CompletedIcon /> },
  'Rejected':                        { color: '#DC2626', bg: '#FEF2F2', icon: <RejectedIcon /> },
};

const getEventConfig = (stage) =>
  EVENT_CONFIG[stage] || { color: '#6B7280', bg: '#F9FAFB', icon: <WaitingIcon /> };

const Timeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: '#fff',
          borderRadius: 2,
          border: '1px solid #E5E7EB',
        }}
      >
        <HistoryIcon sx={{ fontSize: 36, color: '#D1D5DB', mb: 1 }} />
        <Typography sx={{ fontSize: '0.9rem', color: '#9CA3AF', fontWeight: 600 }}>
          No timeline events recorded yet
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#D1D5DB', mt: 0.5 }}>
          Workflow events will appear here as the proposal progresses.
        </Typography>
      </Box>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        bgcolor: '#FFFFFF',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <HistoryIcon sx={{ color: '#374151', fontSize: 18 }} />
          <Typography
            sx={{
              fontWeight: 700,
              color: '#111827',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Workflow Timeline
          </Typography>
        </Box>

        {/* Timeline Events */}
        <Box sx={{ position: 'relative' }}>
          {/* Vertical connector line */}
          <Box
            sx={{
              position: 'absolute',
              left: 15,
              top: 32,
              bottom: 16,
              width: 2,
              bgcolor: '#E5E7EB',
              zIndex: 0,
            }}
          />

          {timeline.map((step, index) => {
            const config = getEventConfig(step.stage || step.event);
            const isLast = index === timeline.length - 1;
            const dateStr = new Date(step.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 2,
                  position: 'relative',
                  zIndex: 1,
                  mb: isLast ? 0 : 2.5,
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: config.bg,
                    color: config.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1.5px solid ${config.color}40`,
                    flexShrink: 0,
                    boxShadow: '0 0 0 3px #ffffff',
                  }}
                >
                  {React.cloneElement(config.icon, { sx: { fontSize: 16 } })}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 0.5,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#1F2937',
                          fontSize: '0.875rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {step.stage || step.event}
                      </Typography>
                      {(step.actionBy || step.actor) && (
                        <Typography
                          sx={{
                            fontSize: '0.78rem',
                            color: '#6B7280',
                            fontWeight: 500,
                            mt: 0.2,
                          }}
                        >
                          by {step.actionBy || step.actor}
                          {step.role ? ` (${step.role})` : ''}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        color: '#9CA3AF',
                        fontWeight: 500,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dateStr}
                    </Typography>
                  </Box>

                  {/* Remarks */}
                  {step.remarks && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        bgcolor: '#F9FAFB',
                        borderRadius: 1.5,
                        border: '1px solid #F3F4F6',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          color: '#4B5563',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {step.remarks}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default Timeline;
