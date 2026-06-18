import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/HelpOutlined';

export default function ReviewBadge({ decision }) {
  // Normalize decision string, defaulting to 'PENDING'
  const normalized = (decision || 'PENDING').toUpperCase();

  let config = {
    label: 'Pending',
    color: '#9E9E9E',
    bgcolor: '#F5F5F5',
    icon: <PendingIcon sx={{ fontSize: 16 }} />
  };

  switch (normalized) {
    case 'ACCEPTED':
    case 'APPROVED':
      config = {
        label: 'Accepted',
        color: '#2E7D32',
        bgcolor: '#E8F5E9',
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
      };
      break;
    case 'REJECTED':
      config = {
        label: 'Rejected',
        color: '#D32F2F',
        bgcolor: '#FFEBEE',
        icon: <CancelIcon sx={{ fontSize: 16 }} />
      };
      break;
    case 'CLARIFICATION':
    case 'CLARIFICATION REQUESTED':
      config = {
        label: 'Clarification Req.',
        color: '#ED6C02',
        bgcolor: '#FFF3E0',
        icon: <HelpIcon sx={{ fontSize: 16 }} />
      };
      break;
    default:
      // Leave as Pending
      break;
  }

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 700,
        fontSize: '0.75rem',
        borderRadius: '8px',
        border: `1px solid ${config.color}40`, // 40% opacity border
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  );
}
