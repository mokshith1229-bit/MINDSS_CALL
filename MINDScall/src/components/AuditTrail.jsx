import React from 'react';
import { Box, Stepper, Step, StepLabel, StepContent, Typography } from '@mui/material';
import { History as HistoryIcon, Circle as CircleIcon } from '@mui/icons-material';

const AuditTrail = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#9E9E9E' }}>No audit trail available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 2, border: '1px solid #E0E0E0' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon fontSize="small" sx={{ color: '#546E7A' }} /> Audit Trail
      </Typography>
      <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { minHeight: 16, ml: '1px', borderColor: '#EEEEEE' } }}>
        {history.map((step, index) => (
          <Step key={index} active={true}>
            <StepLabel
              StepIconComponent={() => (
                <Box sx={{ color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircleIcon sx={{ fontSize: 14 }} />
                </Box>
              )}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 65, color: '#212121' }}>{step.time}</Typography>
                <Typography variant="caption" sx={{ color: '#546E7A' }}>-</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#424242' }}>{step.action}</Typography>
              </Box>
            </StepLabel>
            {step.user && (
              <StepContent sx={{ borderLeft: '2px solid #EEEEEE', ml: '6px', mt: -0.5, mb: 1.5, pb: 0 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block' }}>by {step.user}</Typography>
                {step.detail && <Typography variant="caption" sx={{ color: '#757575', display: 'block', mt: 0.5 }}>{step.detail}</Typography>}
              </StepContent>
            )}
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default AuditTrail;
