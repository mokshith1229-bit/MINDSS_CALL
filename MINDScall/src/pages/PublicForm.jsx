import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  FormControl, Select, MenuItem,
  Snackbar, Alert, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Divider, Chip, InputAdornment,
  LinearProgress, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, RadioGroup, FormControlLabel, Checkbox, Rating,
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
  ContentCopy as CopyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import MindsLogo from '../assets/tracking_logo.png';

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

// ALL_STEPS is now a useMemo inside PublicForm so extra builder sections can be injected.

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

// ─── Schema Matching Helpers ──────────────────────────────────────────────────

// Labels already hardcoded in each section — builder fields matching these are filtered out to prevent duplication
const HARDCODED_LABELS = {
  employee: new Set([
    'full name', 'employee id', 'employee code', 'designation', 'department',
    'official email id', 'official email', 'contact number', 'phone number',
    'email id', 'email address', 'reporting manager', 'hod', 'head of department',
  ]),
  submission: new Set([
    'submission type', 'category', 'sub-category', 'subcategory', 'sub category',
    'innovation type', 'wbs code (auto-generated)', 'wbs code', 'wbs',
  ]),
  idea: new Set([
    'idea / project title', 'idea title', 'title', 'abstract', 'idea abstract',
    'idea description',
  ]),
  proposal: new Set([
    'project title', 'proposal title', 'executive summary', 'summary',
    'problem statement', 'objectives', 'objective', 'scope of work', 'scope',
    'proposed solution', 'solution', 'expected benefits', 'benefits',
    'process / product development',
  ]),
  attachments: new Set([
    'attachments', 'supporting documents', 'file upload', 'upload files', 'documents',
  ]),
};

// Returns the step key a builder section title maps to, or null if brand new
const matchStep = (title) => {
  const lower = (title || '').toLowerCase();
  for (const [key, patterns] of Object.entries(SECTION_MATCH)) {
    if (patterns.some(p => lower.includes(p))) return key;
  }
  return null;
};

// ─── Dynamic Field Renderer ───────────────────────────────────────────────────

export const DynamicField = ({ field, value, onChange, error }) => {
  const handleChange = (e) => onChange(field.id, e.target.value);
  const baseProps = {
    fullWidth: true,
    placeholder: field.placeholder || '',
    value: value !== undefined && value !== null ? value : '',
    onChange: handleChange,
    error: !!error,
    helperText: error || '',
    disabled: field.readOnly || false,
  };

  switch (field.type) {
    case 'card_selector': {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
          {(field.options || []).map(opt => (
            <TypeCard
              key={opt} type={opt}
              selected={value === opt}
              onClick={() => onChange(field.id, opt)}
            />
          ))}
        </Box>
      );
    }
    case 'signature': {
      return (
        <Box sx={{ p: 3, border: '2px dashed #D0D5DD', borderRadius: 3, bgcolor: '#FAFBFC', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#12B76A', bgcolor: '#F6FEF9' } }} onClick={() => onChange(field.id, value ? '' : 'Signed (Simulated)')}>
          <Typography sx={{ color: value ? '#101828' : '#667085', fontSize: '1rem', fontStyle: 'italic', fontWeight: value ? 600 : 400 }}>
            {value ? `Digitally Signed` : 'Click to add digital signature'}
          </Typography>
        </Box>
      );
    }
    case 'heading':
      return <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#101828', mt: 1, mb: 1 }}>{field.label}</Typography>;
    case 'paragraph':
      return <Typography sx={{ fontSize: '0.95rem', color: '#475467', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{field.placeholder || field.helpText || field.label}</Typography>;
    case 'divider':
      return <Divider sx={{ my: 1, borderColor: '#EAECF0', borderBottomWidth: 2 }} />;
      
    case 'text':
    case 'url':
      return <FormField {...baseProps} />;
    case 'email':
      return <FormField {...baseProps} type="email" />;
    case 'phone':
      return <FormField {...baseProps} type="tel" />;
    case 'number':
      return <FormField {...baseProps} type="number" />;
    case 'textarea': {
      let wordCountDisplay = null;
      if (field.validationRule && field.validationRule.startsWith('max:')) {
        const maxWords = parseInt(field.validationRule.split(':')[1], 10);
        const wordCount = String(value || '').trim().split(/\s+/).filter(Boolean).length;
        const over = wordCount > maxWords;
        wordCountDisplay = (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" sx={{ color: over ? '#F04438' : '#667085', fontWeight: 600 }}>
              {wordCount} / {maxWords} words {over && '(Limit Exceeded)'}
            </Typography>
          </Box>
        );
      }
      return (
        <Box>
          <FormField {...baseProps} multiline rows={field.rows || 4} />
          {wordCountDisplay}
        </Box>
      );
    }
    case 'date':
      return <FormField {...baseProps} type="date" InputLabelProps={{ shrink: true }} />;

    case 'dropdown':
      return (
        <FormControl fullWidth error={!!error}>
          <FormSelect
            value={value || ''}
            onChange={e => onChange(field.id, e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled sx={{ color: '#98A2B3' }}>
              {field.placeholder || 'Select an option'}
            </MenuItem>
            {(field.options || []).map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </FormSelect>
          {error && <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 0.75 }}>{error}</Typography>}
        </FormControl>
      );

    case 'radio': {
      const radioVal = value || '';
      return (
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(field.options || []).map(opt => (
              <Box
                key={opt}
                onClick={() => onChange(field.id, opt)}
                sx={{
                  p: 1.5, borderRadius: 2, cursor: 'pointer',
                  border: `1.5px solid ${radioVal === opt ? '#12B76A' : '#D0D5DD'}`,
                  bgcolor: radioVal === opt ? '#F6FEF9' : '#FAFBFC',
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: '#12B76A', bgcolor: '#F6FEF9' },
                }}
              >
                <Box sx={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${radioVal === opt ? '#12B76A' : '#D0D5DD'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {radioVal === opt && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#12B76A' }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.9rem', color: '#101828', fontWeight: radioVal === opt ? 600 : 400 }}>
                  {opt}
                </Typography>
              </Box>
            ))}
          </Box>
          {error && <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 0.5 }}>{error}</Typography>}
        </Box>
      );
    }

    case 'checkbox': {
      const cbSelected = Array.isArray(value) ? value : [];
      return (
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(field.options || []).map(opt => {
              const checked = cbSelected.includes(opt);
              return (
                <Box
                  key={opt}
                  onClick={() => {
                    const next = checked ? cbSelected.filter(v => v !== opt) : [...cbSelected, opt];
                    onChange(field.id, next);
                  }}
                  sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer',
                    border: `1.5px solid ${checked ? '#12B76A' : '#D0D5DD'}`,
                    bgcolor: checked ? '#F6FEF9' : '#FAFBFC',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#12B76A', bgcolor: '#F6FEF9' },
                  }}
                >
                  <Box sx={{
                    width: 18, height: 18, borderRadius: 1, flexShrink: 0,
                    border: `2px solid ${checked ? '#12B76A' : '#D0D5DD'}`,
                    bgcolor: checked ? '#12B76A' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}>
                    {checked && <CheckIcon sx={{ fontSize: 12, color: '#fff' }} />}
                  </Box>
                  <Typography sx={{ fontSize: '0.9rem', color: '#101828', fontWeight: checked ? 600 : 400 }}>
                    {opt}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {error && <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 0.5 }}>{error}</Typography>}
        </Box>
      );
    }

    case 'multiselect': {
      const msSelected = Array.isArray(value) ? value : [];
      return (
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(field.options || []).map(opt => {
              const isSelected = msSelected.includes(opt);
              return (
                <Chip
                  key={opt}
                  label={opt}
                  onClick={() => {
                    const next = isSelected ? msSelected.filter(v => v !== opt) : [...msSelected, opt];
                    onChange(field.id, next);
                  }}
                  sx={{
                    fontWeight: 600, fontSize: '0.82rem',
                    bgcolor: isSelected ? '#12B76A' : '#F2F4F7',
                    color: isSelected ? '#fff' : '#344054',
                    border: `1.5px solid ${isSelected ? '#12B76A' : '#D0D5DD'}`,
                    '&:hover': { bgcolor: isSelected ? '#039855' : '#EAECF0' },
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                />
              );
            })}
          </Box>
          {error && <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 0.75 }}>{error}</Typography>}
        </Box>
      );
    }

    case 'rating':
      return (
        <Box>
          <Rating
            value={Number(value) || 0}
            onChange={(e, newVal) => onChange(field.id, newVal)}
            size="large"
            sx={{ '& .MuiRating-iconFilled': { color: '#F59E0B' }, '& .MuiRating-iconEmpty': { color: '#E5E7EB' } }}
          />
          {error && <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 0.5 }}>{error}</Typography>}
        </Box>
      );

    case 'file':
      return (
        <FileZone
          files={Array.isArray(value) ? value : []}
          setFiles={(fn) => {
            const current = Array.isArray(value) ? value : [];
            const next = typeof fn === 'function' ? fn(current) : fn;
            onChange(field.id, next);
          }}
        />
      );

    default:
      return <FormField {...baseProps} />;
  }
};

// ─── Dynamic Section Renderer (for brand-new builder sections) ────────────────

export const DynamicSection = ({ section, formData, onFieldChange, errors = {} }) => {
  const visibleFields = (section.fields || []).filter(f => !f.hidden && f.enabled !== false);
  const visibleSubSections = (section.subSections || []).filter(s => !s.hidden);

  return (
    <Box>
      <SectionBlock sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2.5, sm: 4 } }}>
        <SectionHeader number={1} title={section.title} description={section.description} />
        {visibleFields.map((field, idx) => {
          const isLayout = ['heading', 'paragraph', 'divider'].includes(field.type);
          return (
            <FieldGroup key={field.id} sx={{ mb: (idx === visibleFields.length - 1 && visibleSubSections.length === 0) ? 0 : undefined }}>
              {!isLayout && (
                <FieldLabel required={field.required} description={field.helpText}>
                  {field.label}
                </FieldLabel>
              )}
              <DynamicField
                field={field}
                value={formData[field.id]}
                onChange={onFieldChange}
                error={errors[field.id]}
              />
            </FieldGroup>
          );
        })}
        {visibleSubSections.map((subSec) => (
          <Box key={subSec.id} sx={{ mt: 3, p: { xs: 2, sm: 3 }, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FAFBFB' }}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#334155', mb: 2 }}>{subSec.title}</Typography>
            {(subSec.fields || []).filter(f => !f.hidden && f.enabled !== false).map((field, fIdx, arr) => {
              const isLayout = ['heading', 'paragraph', 'divider'].includes(field.type);
              return (
                <FieldGroup key={field.id} sx={{ mb: fIdx === arr.length - 1 ? 0 : undefined }}>
                  {!isLayout && (
                    <FieldLabel required={field.required} description={field.helpText}>
                      {field.label}
                    </FieldLabel>
                  )}
                  <DynamicField
                    field={field}
                    value={formData[field.id]}
                    onChange={onFieldChange}
                    error={errors[field.id]}
                  />
                </FieldGroup>
              );
            })}
          </Box>
        ))}
      </SectionBlock>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const PublicForm = () => {
  const { slug } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    employeeName: '', employeeId: '', designation: '', department: '',
    officialEmail: '', contactNumber: '',
    rmName: '', rmEmail: '', hodName: '', hodEmail: '',
    submissionType: '', category: '', subCategory: '', innovationType: '',
    projectTitle: '', abstract: '',
    proposalTitle: '', executiveSummary: '', problemStatement: '', objectives: '', scopeOfWork: '',
  });
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'info' });
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [wbsCode, setWbsCode] = useState('');
  const [wbsPreview, setWbsPreview] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schemaConfigs, setSchemaConfigs] = useState({});
  const [extraSections, setExtraSections] = useState([]);

  React.useEffect(() => {
    const fetchSchema = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/public/forms/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const sections = data.data?.schema || [];

          // ── Build schemaConfigs (unchanged — powers getHelpText / getPlaceholder) ──
          const configs = {};
          sections.forEach(sec => {
            (sec.fields || []).forEach(f => {
              if (f.label) configs[f.label.toLowerCase().trim()] = f;
            });
            (sec.subSections || []).forEach(sub => {
              (sub.fields || []).forEach(f => {
                if (f.label) configs[f.label.toLowerCase().trim()] = f;
              });
            });
          });
          setSchemaConfigs(configs);

          // ── Set completely dynamic sections ──
          setExtraSections(sections);

          const dynamicDefaults = {};
          sections.forEach(sec => {
            (sec.fields || []).forEach(f => {
              if (f && f.id) dynamicDefaults[f.id] = f.defaultValue || '';
            });
          });
          if (Object.keys(dynamicDefaults).length > 0) {
            setFormData(prev => ({ ...prev, ...dynamicDefaults }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch schema', err);
      }
    };
    fetchSchema();
  }, [slug]);

  const getHelpText = (label) => {
    const field = schemaConfigs[label.toLowerCase().trim()];
    return field ? field.helpText : null;
  };

  const getPlaceholder = (label, defaultPlaceholder) => {
    const field = schemaConfigs[label.toLowerCase().trim()];
    return (field && field.placeholder) ? field.placeholder : defaultPlaceholder;
  };

  React.useEffect(() => {
    let cat = '';
    let subCat = '';
    let inno = '';
    for (const sec of extraSections) {
      for (const f of (sec.fields || [])) {
        const label = (f.label || '').toLowerCase().trim();
        if (label === 'category') cat = formData[f.id];
        if (label === 'sub-category' || label === 'subcategory') subCat = formData[f.id];
        if (label === 'innovation type') inno = formData[f.id];
      }
    }

    if (cat && subCat && inno) {
      const fetchWbs = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/public/forms/wbs/preview?category=${encodeURIComponent(cat)}&subCategory=${encodeURIComponent(subCat)}&innovationType=${encodeURIComponent(inno)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.data?.wbsCode) setWbsPreview(data.data.wbsCode);
          }
        } catch (err) { console.error('Failed to fetch WBS preview', err); }
      };
      fetchWbs();
    } else {
      setWbsPreview('');
    }
  }, [formData, extraSections]);

  const processedSections = useMemo(() => {
    let subType = '';
    for (const sec of extraSections) {
      const f = (sec.fields || []).find(fld => (fld.label || '').toLowerCase().trim() === 'submission type');
      if (f && formData[f.id]) {
        subType = String(formData[f.id]).toLowerCase().trim();
        break;
      }
    }
    const isIdea = subType === 'idea';

    const cloned = JSON.parse(JSON.stringify(extraSections));
    return cloned.filter(sec => {
      const titleLower = (sec.title || '').toLowerCase().trim();
      if (isIdea && (titleLower === 'classification' || titleLower === 'management information')) {
        return false;
      }
      return true;
    }).map(sec => {
      const titleLower = (sec.title || '').toLowerCase().trim();
      if (isIdea && titleLower === 'submission details') {
        let hasAbstract = false;
        sec.fields = (sec.fields || []).filter(f => {
          const labelLower = (f.label || '').toLowerCase();
          if (labelLower.includes('abstract')) hasAbstract = true;
          return labelLower.includes('title') || labelLower.includes('abstract');
        });

        if (!hasAbstract) {
          sec.fields.push({
            id: 'abstract',
            type: 'textarea',
            label: 'Abstract',
            required: true,
            validationRule: 'max:200',
            helpText: 'Provide a brief abstract of your idea (max 200 words).'
          });
        }
      }
      return sec;
    });
  }, [extraSections, formData]);

  // Build dynamic steps purely from Form Builder sections
  const ALL_STEPS = useMemo(() => {
    return processedSections.map(sec => ({
      key: `dyn-${sec.id}`,
      label: sec.title,
      description: sec.description || '',
      sectionData: sec,
    }));
  }, [processedSections]);

  const visibleSteps = useMemo(() => {
    return ALL_STEPS.filter(step => {
      const rule = step.sectionData?.visibilityRule;
      if (rule && rule.fieldId && rule.value) {
        // Try to find the field value either by field ID or by label
        const targetValue = formData[rule.fieldId];
        let labelValue = undefined;
        // Search all fields to find matching label
        if (targetValue === undefined) {
          for (const sec of processedSections) {
            const f = (sec.fields || []).find(fld => fld.label === rule.fieldId);
            if (f) {
              labelValue = formData[f.id];
              break;
            }
          }
        }
        
        const actualValue = targetValue !== undefined ? targetValue : labelValue;
        return String(actualValue || '').toLowerCase() === String(rule.value || '').toLowerCase();
      }
      return true;
    });
  }, [ALL_STEPS, formData, processedSections]);

  const currentStepKey = visibleSteps[activeStep]?.key;
  const progressPct = visibleSteps.length > 0 ? Math.round(((activeStep + 1) / visibleSteps.length) * 100) : 0;
  const abstractWordCount = 0; // Deprecated hardcoded state

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateStep = (stepKey) => {
    const newErrors = {};
    const step = visibleSteps[activeStep];
    
    if (step?.sectionData?.fields) {
      step.sectionData.fields.forEach(field => {
        if (!field.hidden) {
          const val = formData[field.id];
          const hasValue = Array.isArray(val) ? val.length > 0 : !!String(val ?? '').trim();
          
          if (field.required && !hasValue) {
            newErrors[field.id] = `${field.label} is required`;
          } else if (hasValue && field.validationRule && field.validationRule.startsWith('max:')) {
            const maxWords = parseInt(field.validationRule.split(':')[1], 10);
            const wordCount = String(val).trim().split(/\s+/).filter(Boolean).length;
            if (wordCount > maxWords) {
              newErrors[field.id] = `${field.label} must be ${maxWords} words or less (currently ${wordCount})`;
            }
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStepKey)) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSnack({ open: true, msg: 'Please complete all required fields correctly.', type: 'error' });
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (validateStep(currentStepKey)) {
      setIsSubmitting(true);
      try {
        const payload = new FormData();
        let name = '';
        let managerName = '';
        let managerEmail = '';
        let title = '';
        let extractedSubEmail = '';
        let submissionTypeStr = 'Submission';

        for (const sec of extraSections) {
          for (const f of (sec.fields || [])) {
            const label = (f.label || '').toLowerCase().trim();
            const val = formData[f.id];
            if (!val) continue;

            if (label === 'full name' || label === 'employee name') name = val;
            if (label === 'reporting manager name' || label === 'manager name' || label === 'rm name') managerName = val;
            if (label === 'reporting manager email id' || label === 'rm email' || label === 'manager email') managerEmail = val;
            if (label === 'idea / project title' || label === 'project title' || label === 'proposal title') title = val;
            if (label === 'official email id' || label === 'official email' || label === 'email') extractedSubEmail = val;
            if (label === 'submission type') submissionTypeStr = val;
          }
        }

        const answersPayload = {
          ...formData,
          title: title,
          name: name,
          managerName: managerName,
          managerEmail: managerEmail,
        };
        payload.append('answers', JSON.stringify(answersPayload));
        payload.append('submitterEmail', extractedSubEmail);
        
        // Find any file arrays in formData and append them to attachments
        Object.values(formData).forEach(val => {
          if (Array.isArray(val)) {
            val.forEach(item => {
              if (item instanceof File) {
                payload.append('attachments', item);
              }
            });
          }
        });

        const res = await fetch(`${import.meta.env.VITE_API_URL}/public/forms/${slug}/submit`, {
          method: 'POST',
          body: payload
        });

        if (res.ok) {
          const data = await res.json();
          if (data.data?.trackingId) setTrackingId(data.data.trackingId);
          if (data.data?.businessId || data.data?.wbsCode) setWbsCode(data.data.businessId || data.data.wbsCode);
          setPreviewOpen(false);
          setIsSubmitting(false);
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const errData = await res.json();
          setIsSubmitting(false);
          setSnack({ open: true, msg: errData.error || 'Submission failed. Please try again.', type: 'error' });
        }
      } catch (err) {
        setIsSubmitting(false);
        setSnack({ open: true, msg: 'Server error. Please try again.', type: 'error' });
      }
    }
  };

  // ─── Success Screen ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <PageWrapper sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{
          maxWidth: 520, width: '100%', bgcolor: '#fff',
          borderRadius: 4, boxShadow: '0 8px 48px rgba(0,0,0,0.10)',
          p: { xs: 4, md: 6 }, textAlign: 'center',
          animation: `${fadeSlideIn} 0.5s ease`,
        }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #12B76A, #039855)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
            boxShadow: '0 8px 24px rgba(18,183,106,0.3)',
          }}>
            <CheckIcon sx={{ fontSize: 44, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#101828', letterSpacing: '-0.02em' }}>
            Submission Successful!
          </Typography>
          <Typography sx={{ color: '#667085', mb: 4, fontSize: '0.95rem' }}>
            Your submission has been received. A confirmation email has been sent to your official email address.
          </Typography>

          {trackingId && (
            <Box sx={{ mb: 2.5, p: 3, bgcolor: '#F0FDF4', borderRadius: 2.5, border: '1.5px solid #A9EFC5' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#027A48', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Tracking ID</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#12B76A', letterSpacing: 2 }}>{trackingId}</Typography>
            </Box>
          )}


          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <SecondaryBtn variant="outlined" onClick={() => window.location.href = '/track'} size="large">Track Status</SecondaryBtn>
            <SubmitBtn variant="contained" onClick={() => window.location.reload()} size="large" sx={{ bgcolor: '#12B76A', '&:hover': { bgcolor: '#039855' } }}>Submit Another</SubmitBtn>
          </Box>
        </Box>
      </PageWrapper>
    );
  }

  // ─── Render Sections ────────────────────────────────────────────────────────
  
  const renderStepContent = () => {
    const step = visibleSteps[activeStep];
    if (step?.sectionData) {
      return (
        <DynamicSection
          section={step.sectionData}
          formData={formData}
          onFieldChange={handleChange}
          errors={errors}
        />
      );
    }
    return null;
  };

  const isLastStep = activeStep === visibleSteps.length - 1;

  // ─── Preview Dialog ──────────────────────────────────────────────────────────

  const PreviewRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', py: 1.5, borderBottom: '1px solid #F2F4F7' }}>
      <Typography sx={{ width: 180, flexShrink: 0, fontSize: '0.82rem', color: '#667085', fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.85rem', color: '#101828', fontWeight: 500, flex: 1 }}>{value || '—'}</Typography>
    </Box>
  );

  return (
    <PageWrapper>
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <Box sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid #EAECF0',
        px: { xs: 3, md: 6 }, py: 2.5,
        display: 'flex', alignItems: 'center', gap: 2.5,
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          background: 'linear-gradient(135deg, #12B76A 0%, #039855 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ProposalIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#101828', fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            MINDS Innovation Portal
          </Typography>
          <Typography sx={{ color: '#667085', fontSize: '0.78rem' }}>
            Enterprise Innovation Management Platform
          </Typography>
        </Box>
      </Box>

      {/* ── Page Content ─────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2, md: 3 }, pt: 5 }}>

        {/* Page Title & Branding */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <img src={MindsLogo} alt="MINDScall Logo" style={{ height: '70px', objectFit: 'contain', display: 'block', mixBlendMode: 'multiply' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, color: '#101828', letterSpacing: '-0.03em', mb: 0.5 }}>
            MINDScall Innovation Portal
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' }, color: '#344054', mb: 1.5 }}>
            Idea &amp; Proposal Submission Form
          </Typography>
          <Typography sx={{ color: '#667085', fontSize: '0.95rem', maxWidth: 560, mx: 'auto', lineHeight: 1.6 }}>
            Submit your innovative ideas and formal project proposals for review by the R&amp;D &amp; Innovation Team.
          </Typography>
        </Box>

        {/* ── Progress Bar ─────────────────────────────────────────────── */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#344054' }}>
              Section {activeStep + 1} of {visibleSteps.length} — {visibleSteps[activeStep]?.label}
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#12B76A' }}>
              {progressPct}% Completed
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={progressPct}
            sx={{
              height: 8, borderRadius: 4, bgcolor: '#EAECF0',
              '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: '#12B76A' },
            }}
          />
          {/* Step Dots */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'center' }}>
            {visibleSteps.map((step, idx) => (
              <Box
                key={step.key}
                sx={{
                  height: 6, borderRadius: 3, transition: 'all 0.3s ease',
                  width: idx === activeStep ? 24 : 6,
                  bgcolor: idx < activeStep ? '#12B76A' : idx === activeStep ? '#039855' : '#EAECF0',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* ── Form Card ─────────────────────────────────────────────────── */}
        <FormCard>
          {/* Section Content */}
          {renderStepContent()}

          {/* ── Action Footer ────────────────────────────────────────────── */}
          <Box sx={{
            px: { xs: 3, md: 6 }, py: 3,
            borderTop: '1px solid #EAECF0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            bgcolor: '#FAFBFC',
            flexWrap: 'wrap', gap: 2,
          }}>
            <SecondaryBtn
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setSnack({ open: true, msg: 'Draft saved successfully.', type: 'success' })}
            >
              Save Draft
            </SecondaryBtn>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {activeStep > 0 && (
                <SecondaryBtn variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
                  Back
                </SecondaryBtn>
              )}
              {!isLastStep ? (
                <SubmitBtn
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  sx={{ bgcolor: '#12B76A', '&:hover': { bgcolor: '#039855' } }}
                >
                  Continue
                </SubmitBtn>
              ) : (
                <>
                  <SecondaryBtn variant="outlined" startIcon={<ViewIcon />} onClick={() => setPreviewOpen(true)}>
                    Preview
                  </SecondaryBtn>
                  <SubmitBtn
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{ bgcolor: '#12B76A', '&:hover': { bgcolor: '#039855' } }}
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit Proposal'}
                  </SubmitBtn>
                </>
              )}
            </Box>
          </Box>
        </FormCard>

        <Typography sx={{ textAlign: 'center', color: '#98A2B3', fontSize: '0.78rem', mt: 4 }}>
          © MINDS Innovation Management Platform · All submissions are confidential
        </Typography>
      </Box>

      {/* ── Preview Dialog ──────────────────────────────────────────────── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#fff' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #EAECF0', p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#101828' }}>Submission Preview</Typography>
          <Typography sx={{ color: '#667085', fontSize: '0.82rem', mt: 0.25 }}>Review all details before submitting</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {processedSections.map(sec => {
            const secFields = (sec.fields || []).filter(f => !f.hidden && !['heading', 'paragraph', 'divider'].includes(f.type));
            if (secFields.length === 0) return null;

            // Only show section if it passes visibility rule
            const rule = sec.visibilityRule;
            if (rule && rule.fieldId && rule.value) {
              const targetValue = formData[rule.fieldId];
              let labelValue = undefined;
              if (targetValue === undefined) {
                for (const s of processedSections) {
                  const f = (s.fields || []).find(fld => fld.label === rule.fieldId);
                  if (f) {
                    labelValue = formData[f.id];
                    break;
                  }
                }
              }
              const actualValue = targetValue !== undefined ? targetValue : labelValue;
              if (String(actualValue || '').toLowerCase() !== String(rule.value || '').toLowerCase()) {
                return null; // hide section in preview
              }
            }

            return (
              <Box key={sec.id}>
                <Typography sx={{ fontWeight: 700, color: '#344054', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1, mt: 3, mb: 1.5 }}>
                  {sec.title}
                </Typography>
                {secFields.map(f => {
                  let val = formData[f.id];
                  let displayVal = String(val ?? '—');
                  
                  if (Array.isArray(val)) {
                    if (f.type === 'file') {
                      displayVal = val.length > 0 ? val.map(file => file.name).join(', ') : 'None';
                    } else {
                      displayVal = val.join(', ') || '—';
                    }
                  } else if (f.type === 'signature' && val) {
                    displayVal = val;
                  }
                  
                  return (
                    <PreviewRow
                      key={f.id}
                      label={f.label}
                      value={displayVal}
                    />
                  );
                })}
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #EAECF0', gap: 2 }}>
          <SecondaryBtn variant="outlined" onClick={() => setPreviewOpen(false)}>Edit</SecondaryBtn>
          <SubmitBtn
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{ bgcolor: '#12B76A', '&:hover': { bgcolor: '#039855' } }}
          >
            {isSubmitting ? 'Submitting…' : 'Confirm & Submit'}
          </SubmitBtn>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ───────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.type}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default PublicForm;
