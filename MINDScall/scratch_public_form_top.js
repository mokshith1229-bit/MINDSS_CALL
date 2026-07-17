import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  FormControl, Select, MenuItem,
  Snackbar, Alert, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Divider, Chip, InputAdornment,
  LinearProgress, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Send as SendIcon, Save as SaveIcon, CheckCircle as CheckIcon,
  CloudUpload as UploadIcon, Delete as DeleteIcon,
  PictureAsPdf as PdfIcon, Description as DocIcon,
  InsertDriveFile as FileIcon,
  EmojiObjects as IdeaIcon, Assignment as ProposalIcon,
  Image as ImageIcon, Slideshow as SlideshowIcon,
  Phone as PhoneIcon, Email as EmailIcon, Badge as BadgeIcon,
  ArrowForward as ArrowForwardIcon, ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Engineering', 'Traffic and AI', 'Safety', 'Finance',
  'E&S', 'Human Resource', 'R&D', 'Others'
];

const SUB_CATEGORIES = [
  'Pavement', 'Materials', 'Structures', 'Design',
  'AI and ML', 'Traffic Engineering', 'Others'
];

const INNOVATION_TYPES = ['Process Development', 'Product Development'];

const ALL_STEPS = [
  { key: 'employee',    label: 'Employee Information', description: 'Provide your personal and organizational details' },
  { key: 'submission',  label: 'Submission Details',   description: 'Select the type, category, and classification' },
  { key: 'idea',        label: 'Idea Details',          description: 'Describe your innovative idea' },
  { key: 'proposal',   label: 'Project Overview',       description: 'Provide a comprehensive project overview' },
  { key: 'attachments', label: 'Attachments',           description: 'Upload supporting documents' },
];

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#F0F2F5',
  fontFamily: "'Segoe UI', 'Inter', sans-serif",
  paddingBottom: 80,
});

const FormCard = styled(Box)({
  maxWidth: 860,
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  animation: `${fadeSlideIn} 0.4s ease`,
});

const SectionBlock = styled(Box)({
  padding: '40px 48px',
  animation: `${fadeSlideIn} 0.35s ease`,
  '@media (max-width: 600px)': {
    padding: '28px 20px',
  },
});

const SectionDivider = styled(Divider)({
  borderColor: '#EAECF0',
  margin: '0 48px',
  '@media (max-width: 600px)': {
    margin: '0 20px',
  },
});

const FormField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    backgroundColor: '#FAFBFC',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: '#D0D5DD', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: '#98A2B3' },
    '&.Mui-focused fieldset': { borderColor: '#12B76A', borderWidth: '2px' },
    '&.Mui-focused': { backgroundColor: '#F6FEF9' },
  },
  '& .MuiInputBase-input': {
    color: '#101828',
    padding: '13px 16px',
    '&::placeholder': { color: '#98A2B3', opacity: 1 },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginTop: 6,
    fontSize: '0.78rem',
  },
  width: '100%',
});

const FormSelect = styled(Select)({
  borderRadius: 10,
  backgroundColor: '#FAFBFC',
  fontSize: '0.95rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D0D5DD', borderWidth: '1.5px' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98A2B3' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#12B76A', borderWidth: '2px' },
  '& .MuiSelect-select': { padding: '13px 16px', color: '#101828' },
});

const FieldGroup = styled(Box)({ marginBottom: 24 });

const FieldLabel = ({ children, required, description }) => (
  <Box>
    <Typography
      sx={{
        fontWeight: 600,
        mb: description ? 0.25 : 0.75,
        color: '#344054',
        fontSize: '0.875rem',
        letterSpacing: '-0.01em',
      }}
    >
      {children}{required && <span style={{ color: '#F04438', marginLeft: 3 }}>*</span>}
    </Typography>
    {description && (
      <Typography sx={{ color: '#667085', fontSize: '0.78rem', mb: 1, lineHeight: 1.4 }}>
        {description}
      </Typography>
    )}
  </Box>
);

const SubmitBtn = styled(Button)({
  borderRadius: 10,
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.95rem',
  padding: '12px 32px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  '&:hover': { boxShadow: '0 4px 12px rgba(18,183,106,0.25)', transform: 'translateY(-1px)' },
  transition: 'all 0.2s ease',
});

const SecondaryBtn = styled(Button)({
  borderRadius: 10,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '11px 24px',
  borderColor: '#D0D5DD',
  color: '#344054',
  '&:hover': { borderColor: '#98A2B3', backgroundColor: '#F9FAFB' },
  transition: 'all 0.2s ease',
});

// ─── File Helpers ─────────────────────────────────────────────────────────────

const getFileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return <PdfIcon sx={{ color: '#d13438' }} />;
  if (['doc', 'docx'].includes(ext)) return <DocIcon sx={{ color: '#2b579a' }} />;
  if (['ppt', 'pptx'].includes(ext)) return <SlideshowIcon sx={{ color: '#b7472a' }} />;
  if (['png', 'jpg', 'jpeg'].includes(ext)) return <ImageIcon sx={{ color: '#0078D4' }} />;
  return <FileIcon sx={{ color: '#605E5C' }} />;
};

const formatSize = b =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

// ─── File Upload Zone ─────────────────────────────────────────────────────────

function FileZone({ files, setFiles }) {
  const onDrop = useCallback(accepted => {
    const newFiles = accepted.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }));
    setFiles(prev => [...prev, ...newFiles]);
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024
  });

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${isDragActive ? '#12B76A' : '#D0D5DD'}`,
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? '#F6FEF9' : '#FAFBFC',
          transition: 'all 0.25s ease',
          '&:hover': { borderColor: '#12B76A', bgcolor: '#F6FEF9' }
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{
          width: 56, height: 56, borderRadius: '50%',
          bgcolor: isDragActive ? '#D1FADF' : '#F2F4F7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2
        }}>
          <UploadIcon sx={{ color: isDragActive ? '#12B76A' : '#667085', fontSize: 28 }} />
        </Box>
        <Typography sx={{ fontWeight: 600, color: '#101828', fontSize: '0.95rem', mb: 0.5 }}>
          {isDragActive ? 'Drop your files here' : 'Click to upload or drag & drop'}
        </Typography>
        <Typography sx={{ color: '#667085', fontSize: '0.8rem' }}>
          PDF, DOC, DOCX, PPT, PPTX, PNG, JPG (Max 10MB each)
        </Typography>
      </Box>

      {files.length > 0 && (
        <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {files.map((f, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                p: 2, bgcolor: '#F9FAFB', borderRadius: 2,
                border: '1px solid #EAECF0',
                '&:hover': { borderColor: '#12B76A', bgcolor: '#F6FEF9' },
                transition: 'all 0.15s',
              }}
            >
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EAECF0' }}>
                {getFileIcon(f.name)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#667085' }}>{formatSize(f.size)}</Typography>
              </Box>
              <IconButton size="small" onClick={() => removeFile(i)} sx={{ color: '#F04438', '&:hover': { bgcolor: '#FEF3F2' } }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ number, title, description }) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '50%',
        bgcolor: '#ECFDF3', border: '2px solid #12B76A',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#12B76A' }}>
          {String(number).padStart(2, '0')}
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, color: '#101828', fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
        {title}
      </Typography>
    </Box>
    {description && (
      <Typography sx={{ color: '#667085', fontSize: '0.875rem', ml: '52px' }}>
        {description}
      </Typography>
    )}
    <Box sx={{ height: 2, bgcolor: '#F2F4F7', borderRadius: 1, mt: 2.5, position: 'relative' }}>
      <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', bgcolor: '#ECFDF3', borderRadius: 1, opacity: 0.6 }} />
    </Box>
  </Box>
);

// ─── Type Card (Idea / Proposal) ──────────────────────────────────────────────

const TypeCard = ({ type, selected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      p: 2.5, borderRadius: 2.5, cursor: 'pointer',
      border: `2px solid ${selected ? '#12B76A' : '#EAECF0'}`,
      bgcolor: selected ? '#F6FEF9' : '#FAFBFC',
      transition: 'all 0.2s ease',
      position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 2,
      '&:hover': { borderColor: '#12B76A', bgcolor: '#F6FEF9', transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(18,183,106,0.12)' },
    }}
  >
    {selected && (
      <Box sx={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', bgcolor: '#12B76A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckIcon sx={{ fontSize: 14, color: '#fff' }} />
      </Box>
    )}
    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: selected ? '#D1FADF' : '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {type === 'Idea'
        ? <IdeaIcon sx={{ color: selected ? '#12B76A' : '#667085', fontSize: 24 }} />
        : <ProposalIcon sx={{ color: selected ? '#12B76A' : '#667085', fontSize: 24 }} />
      }
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, color: '#101828', fontSize: '0.95rem', mb: 0.5 }}>{type}</Typography>
      <Typography sx={{ color: '#667085', fontSize: '0.8rem', lineHeight: 1.5 }}>
        {type === 'Idea'
          ? 'A new concept or innovative thought with a brief abstract for initial review.'
          : 'A structured project plan with executive summary, problem statement, and scope.'}
      </Typography>
    </Box>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

