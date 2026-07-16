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
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'info' });
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [wbsCode, setWbsCode] = useState('');
  const [wbsPreview, setWbsPreview] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schemaConfigs, setSchemaConfigs] = useState({});

  React.useEffect(() => {
    const fetchSchema = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/public/forms/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const schema = data.data?.schema || [];
          const configs = {};
          schema.forEach(sec => {
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
    if (formData.category && formData.subCategory && formData.innovationType) {
      const fetchWbs = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/public/forms/wbs/preview?category=${encodeURIComponent(formData.category)}&subCategory=${encodeURIComponent(formData.subCategory)}&innovationType=${encodeURIComponent(formData.innovationType)}`);
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
  }, [formData.category, formData.subCategory, formData.innovationType]);

  const visibleSteps = useMemo(() => {
    return ALL_STEPS.filter(step => {
      if (step.key === 'idea') return formData.submissionType === 'Idea';
      if (step.key === 'proposal') return formData.submissionType === 'Proposal';
      return true;
    });
  }, [formData.submissionType]);

  const currentStepKey = visibleSteps[activeStep]?.key || 'employee';
  const progressPct = Math.round(((activeStep + 1) / visibleSteps.length) * 100);
  const abstractWordCount = formData.abstract.trim() ? formData.abstract.trim().split(/\s+/).length : 0;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateStep = (stepKey) => {
    const newErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^[0-9+\-() ]{7,15}$/;

    if (stepKey === 'employee') {
      if (!formData.employeeName.trim()) newErrors.employeeName = 'Employee Name is required';
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
      if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
      if (!formData.department.trim()) newErrors.department = 'Department is required';
      if (!formData.officialEmail.trim()) newErrors.officialEmail = 'Official Email is required';
      else if (!emailRegex.test(formData.officialEmail)) newErrors.officialEmail = 'Enter a valid email address';
      if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required';
      else if (!phoneRegex.test(formData.contactNumber)) newErrors.contactNumber = 'Enter a valid contact number';
      if (!formData.rmName.trim()) newErrors.rmName = 'Reporting Manager Name is required';
      if (!formData.rmEmail.trim()) newErrors.rmEmail = 'Reporting Manager Email is required';
      else if (!emailRegex.test(formData.rmEmail)) newErrors.rmEmail = 'Enter a valid email address';
      if (!formData.hodName.trim()) newErrors.hodName = 'HOD Name is required';
      if (!formData.hodEmail.trim()) newErrors.hodEmail = 'HOD Email is required';
      else if (!emailRegex.test(formData.hodEmail)) newErrors.hodEmail = 'Enter a valid email address';
    }
    if (stepKey === 'submission') {
      if (!formData.submissionType) newErrors.submissionType = 'Submission Type is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.subCategory) newErrors.subCategory = 'Sub-Category is required';
      if (!formData.innovationType) newErrors.innovationType = 'Innovation Type is required';
    }
    if (stepKey === 'idea') {
      if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project Title is required';
      if (!formData.abstract.trim()) newErrors.abstract = 'Abstract is required';
      else if (abstractWordCount > 200) newErrors.abstract = 'Abstract cannot exceed 200 words';
    }
    if (stepKey === 'proposal') {
      if (!formData.proposalTitle.trim()) newErrors.proposalTitle = 'Project Title is required';
      if (!formData.executiveSummary.trim()) newErrors.executiveSummary = 'Executive Summary is required';
      if (!formData.problemStatement.trim()) newErrors.problemStatement = 'Problem Statement is required';
      if (!formData.objectives.trim()) newErrors.objectives = 'Objectives are required';
      if (!formData.scopeOfWork.trim()) newErrors.scopeOfWork = 'Scope of Work is required';
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
        const answersPayload = {
          ...formData,
          title: formData.submissionType === 'Proposal' ? formData.proposalTitle : formData.projectTitle,
          name: formData.employeeName,
          managerName: formData.rmName,
          managerEmail: formData.rmEmail,
        };
        payload.append('answers', JSON.stringify(answersPayload));
        payload.append('submitterEmail', formData.officialEmail);
        files.forEach(f => payload.append('attachments', f));

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
            Your {formData.submissionType?.toLowerCase() || 'submission'} has been received. A confirmation email has been sent to your official email address.
          </Typography>

          {trackingId && (
            <Box sx={{ mb: 2.5, p: 3, bgcolor: '#F0FDF4', borderRadius: 2.5, border: '1.5px solid #A9EFC5' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#027A48', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Tracking ID</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#12B76A', letterSpacing: 2 }}>{trackingId}</Typography>
            </Box>
          )}
          {wbsCode && (
            <Box sx={{ mb: 3, p: 2.5, bgcolor: '#FFFCF0', borderRadius: 2.5, border: '1.5px solid #FEC84B' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#B54708', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>WBS Code</Typography>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#B54708' }}>{wbsCode}</Typography>
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

  const renderEmployeeInfo = () => (
    <Box key="employee">
      {/* Personal Details */}
      <SectionBlock>
        <SectionHeader number={1} title="Personal Details" description="Please provide your personal and professional information." />

        <FieldGroup>
          <FieldLabel required description={getHelpText('Full Name')}>Full Name</FieldLabel>
          <FormField
            fullWidth placeholder={getPlaceholder('Full Name', "e.g. Rajesh Kumar")}
            value={formData.employeeName}
            onChange={e => handleChange('employeeName', e.target.value)}
            error={!!errors.employeeName} helperText={errors.employeeName}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Employee ID')}>Employee ID</FieldLabel>
          <FormField
            fullWidth placeholder={getPlaceholder('Employee ID', "e.g. EMP-1029")}
            value={formData.employeeId}
            onChange={e => handleChange('employeeId', e.target.value)}
            error={!!errors.employeeId} helperText={errors.employeeId}
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#98A2B3', fontSize: 18 }} /></InputAdornment> }}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Designation')}>Designation</FieldLabel>
          <FormField
            fullWidth placeholder={getPlaceholder('Designation', "e.g. Senior Engineer")}
            value={formData.designation}
            onChange={e => handleChange('designation', e.target.value)}
            error={!!errors.designation} helperText={errors.designation}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Department')}>Department</FieldLabel>
          <FormField
            fullWidth placeholder={getPlaceholder('Department', "e.g. Engineering & Infrastructure")}
            value={formData.department}
            onChange={e => handleChange('department', e.target.value)}
            error={!!errors.department} helperText={errors.department}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Official Email ID')}>Official Email ID</FieldLabel>
          <FormField
            fullWidth placeholder={getPlaceholder('Official Email ID', "name@company.com")} type="email"
            value={formData.officialEmail}
            onChange={e => handleChange('officialEmail', e.target.value)}
            error={!!errors.officialEmail} helperText={errors.officialEmail}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#98A2B3', fontSize: 18 }} /></InputAdornment> }}
          />
        </FieldGroup>

        <FieldGroup sx={{ mb: 0 }}>
          <FieldLabel required description={getHelpText('Contact Number')}>Contact Number</FieldLabel>
          <FormField
            fullWidth placeholder={getPlaceholder('Contact Number', "+91 98765 43210")}
            value={formData.contactNumber}
            onChange={e => handleChange('contactNumber', e.target.value)}
            error={!!errors.contactNumber} helperText={errors.contactNumber}
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#98A2B3', fontSize: 18 }} /></InputAdornment> }}
          />
        </FieldGroup>
      </SectionBlock>

      <SectionDivider />

      {/* Reporting Manager & HOD */}
      <SectionBlock>
        <SectionHeader number={2} title="Reporting Hierarchy" description="Details of your Reporting Manager and Head of Department." />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: '#FAFBFC', borderRadius: 3, border: '1.5px solid #EAECF0', height: '100%' }}>
              <Typography sx={{ fontWeight: 700, color: '#101828', fontSize: '0.9rem', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#12B76A' }} />
                Reporting Manager
              </Typography>
              <FieldGroup>
                <FieldLabel required description={getHelpText('Full Name')}>Full Name</FieldLabel>
                <FormField fullWidth placeholder={getPlaceholder('Full Name', "Manager's full name")} value={formData.rmName} onChange={e => handleChange('rmName', e.target.value)} error={!!errors.rmName} helperText={errors.rmName} />
              </FieldGroup>
              <FieldGroup sx={{ mb: 0 }}>
                <FieldLabel required description={getHelpText('Email ID')}>Email ID</FieldLabel>
                <FormField fullWidth placeholder={getPlaceholder('Email ID', "manager@company.com")} type="email" value={formData.rmEmail} onChange={e => handleChange('rmEmail', e.target.value)} error={!!errors.rmEmail} helperText={errors.rmEmail} />
              </FieldGroup>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: '#FAFBFC', borderRadius: 3, border: '1.5px solid #EAECF0', height: '100%' }}>
              <Typography sx={{ fontWeight: 700, color: '#101828', fontSize: '0.9rem', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6941C6' }} />
                Head of Department (HOD)
              </Typography>
              <FieldGroup>
                <FieldLabel required description={getHelpText('Full Name')}>Full Name</FieldLabel>
                <FormField fullWidth placeholder={getPlaceholder('Full Name', "HOD's full name")} value={formData.hodName} onChange={e => handleChange('hodName', e.target.value)} error={!!errors.hodName} helperText={errors.hodName} />
              </FieldGroup>
              <FieldGroup sx={{ mb: 0 }}>
                <FieldLabel required description={getHelpText('Email ID')}>Email ID</FieldLabel>
                <FormField fullWidth placeholder={getPlaceholder('Email ID', "hod@company.com")} type="email" value={formData.hodEmail} onChange={e => handleChange('hodEmail', e.target.value)} error={!!errors.hodEmail} helperText={errors.hodEmail} />
              </FieldGroup>
            </Box>
          </Grid>
        </Grid>
      </SectionBlock>
    </Box>
  );

  const renderSubmissionDetails = () => (
    <Box key="submission">
      <SectionBlock>
        <SectionHeader number={1} title="Submission Type" description="Choose whether you are submitting an Idea or a formal Proposal." />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 1 }}>
          {['Idea', 'Proposal'].map(type => (
            <TypeCard
              key={type} type={type}
              selected={formData.submissionType === type}
              onClick={() => handleChange('submissionType', type)}
            />
          ))}
        </Box>
        {errors.submissionType && (
          <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 1 }}>{errors.submissionType}</Typography>
        )}
      </SectionBlock>

      <SectionDivider />

      <SectionBlock>
        <SectionHeader number={2} title="Classification" description="Categorize your submission for proper routing and evaluation." />

        <FieldGroup>
          <FieldLabel required description={getHelpText('Category')}>Category</FieldLabel>
          <FormControl fullWidth error={!!errors.category}>
            <FormSelect value={formData.category} onChange={e => handleChange('category', e.target.value)} displayEmpty>
              <MenuItem value="" disabled sx={{ color: '#98A2B3' }}>Select a category</MenuItem>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </FormSelect>
            {errors.category && <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 0.75 }}>{errors.category}</Typography>}
          </FormControl>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Sub-Category')}>Sub-Category</FieldLabel>
          <FormControl fullWidth error={!!errors.subCategory}>
            <FormSelect value={formData.subCategory} onChange={e => handleChange('subCategory', e.target.value)} displayEmpty>
              <MenuItem value="" disabled sx={{ color: '#98A2B3' }}>Select a sub-category</MenuItem>
              {SUB_CATEGORIES.map(sc => <MenuItem key={sc} value={sc}>{sc}</MenuItem>)}
            </FormSelect>
            {errors.subCategory && <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 0.75 }}>{errors.subCategory}</Typography>}
          </FormControl>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Innovation Type')}>Innovation Type</FieldLabel>
          <FormControl fullWidth error={!!errors.innovationType}>
            <FormSelect value={formData.innovationType} onChange={e => handleChange('innovationType', e.target.value)} displayEmpty>
              <MenuItem value="" disabled sx={{ color: '#98A2B3' }}>Select innovation type</MenuItem>
              {INNOVATION_TYPES.map(it => <MenuItem key={it} value={it}>{it}</MenuItem>)}
            </FormSelect>
            {errors.innovationType && <Typography sx={{ color: '#F04438', fontSize: '0.78rem', mt: 0.75 }}>{errors.innovationType}</Typography>}
          </FormControl>
        </FieldGroup>

        {/* WBS Preview */}
        <FieldGroup sx={{ mb: 0 }}>
          <FieldLabel description={getHelpText('WBS Code (Auto-generated)')}>WBS Code (Auto-generated)</FieldLabel>
          <FormField
            fullWidth disabled
            value={wbsPreview || 'Will be generated when category fields are selected'}
            InputProps={{ sx: { bgcolor: '#F9FAFB', color: wbsPreview ? '#101828' : '#98A2B3', fontWeight: wbsPreview ? 700 : 400 } }}
          />
          <Typography sx={{ color: '#667085', fontSize: '0.78rem', mt: 0.75 }}>
            A unique WBS code will be assigned when you submit the form.
          </Typography>
        </FieldGroup>
      </SectionBlock>
    </Box>
  );

  const renderIdeaDetails = () => (
    <Box key="idea">
      <SectionBlock>
        <SectionHeader number={1} title="Idea Details" description="Describe your innovative idea clearly and concisely." />

        <FieldGroup>
          <FieldLabel required description={getHelpText('Idea / Project Title')}>Idea / Project Title</FieldLabel>
          <FormField
            fullWidth placeholder={getPlaceholder('Idea / Project Title', "Enter a clear and descriptive title for your idea")}
            value={formData.projectTitle}
            onChange={e => handleChange('projectTitle', e.target.value)}
            error={!!errors.projectTitle} helperText={errors.projectTitle}
          />
        </FieldGroup>

        <FieldGroup sx={{ mb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 0.75 }}>
            <FieldLabel required description={getHelpText('Abstract')}>Abstract</FieldLabel>
            <Chip
              label={`${abstractWordCount} / 200 words`}
              size="small"
              sx={{
                fontWeight: 700, fontSize: '0.72rem', height: 24,
                bgcolor: abstractWordCount > 200 ? '#FEF3F2' : abstractWordCount > 150 ? '#FFFAEB' : '#ECFDF3',
                color: abstractWordCount > 200 ? '#F04438' : abstractWordCount > 150 ? '#B54708' : '#027A48',
                border: `1px solid ${abstractWordCount > 200 ? '#FECDCA' : abstractWordCount > 150 ? '#FEC84B' : '#A9EFC5'}`,
              }}
            />
          </Box>
          <Typography sx={{ color: '#667085', fontSize: '0.8rem', mb: 1 }}>
            Include: Introduction · Proposed Idea · Expected Benefits
          </Typography>
          <FormField
            fullWidth multiline rows={8}
            placeholder={`Introduction:\nDescribe the background and context of your idea...\n\nProposed Idea:\nExplain what you are proposing...\n\nExpected Benefits:\nList the anticipated outcomes and benefits...`}
            value={formData.abstract}
            onChange={e => handleChange('abstract', e.target.value)}
            error={!!errors.abstract} helperText={errors.abstract}
          />
        </FieldGroup>
      </SectionBlock>
    </Box>
  );

  const renderProjectOverview = () => (
    <Box key="proposal">
      <SectionBlock>
        <SectionHeader number={1} title="Project Overview" description="Provide a comprehensive overview of your proposed project." />

        <FieldGroup>
          <FieldLabel required description={getHelpText('Project Title')}>Project Title</FieldLabel>
          <FormField fullWidth placeholder={getPlaceholder('Project Title', "Enter the project title")} value={formData.proposalTitle} onChange={e => handleChange('proposalTitle', e.target.value)} error={!!errors.proposalTitle} helperText={errors.proposalTitle} />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Executive Summary')}>Executive Summary</FieldLabel>
          <FormField fullWidth multiline rows={4} placeholder={getPlaceholder('Executive Summary', "Provide a brief executive summary of the project...")} value={formData.executiveSummary} onChange={e => handleChange('executiveSummary', e.target.value)} error={!!errors.executiveSummary} helperText={errors.executiveSummary} />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Problem Statement')}>Problem Statement</FieldLabel>
          <FormField fullWidth multiline rows={4} placeholder={getPlaceholder('Problem Statement', "Clearly define the problem this project aims to solve...")} value={formData.problemStatement} onChange={e => handleChange('problemStatement', e.target.value)} error={!!errors.problemStatement} helperText={errors.problemStatement} />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel required description={getHelpText('Objectives')}>Objectives</FieldLabel>
          <FormField fullWidth multiline rows={3} placeholder={getPlaceholder('Objectives', "List the key objectives of this project...")} value={formData.objectives} onChange={e => handleChange('objectives', e.target.value)} error={!!errors.objectives} helperText={errors.objectives} />
        </FieldGroup>

        <FieldGroup sx={{ mb: 0 }}>
          <FieldLabel required description={getHelpText('Scope of Work')}>Scope of Work</FieldLabel>
          <FormField fullWidth multiline rows={4} placeholder={getPlaceholder('Scope of Work', "Define the scope, deliverables, and boundaries of this project...")} value={formData.scopeOfWork} onChange={e => handleChange('scopeOfWork', e.target.value)} error={!!errors.scopeOfWork} helperText={errors.scopeOfWork} />
        </FieldGroup>
      </SectionBlock>
    </Box>
  );

  const renderAttachments = () => (
    <Box key="attachments">
      <SectionBlock>
        <SectionHeader number={1} title="Supporting Documents" description="Upload any files that support your submission. This step is optional." />
        <FileZone files={files} setFiles={setFiles} />
      </SectionBlock>
    </Box>
  );

  const renderStepContent = () => {
    switch (currentStepKey) {
      case 'employee':    return renderEmployeeInfo();
      case 'submission':  return renderSubmissionDetails();
      case 'idea':        return renderIdeaDetails();
      case 'proposal':    return renderProjectOverview();
      case 'attachments': return renderAttachments();
      default:            return null;
    }
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

        {/* Page Title */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.9rem' }, color: '#101828', letterSpacing: '-0.03em', mb: 1 }}>
            Idea &amp; Proposal Submission Form
          </Typography>
          <Typography sx={{ color: '#667085', fontSize: '0.95rem', maxWidth: 560, mx: 'auto', lineHeight: 1.6 }}>
            Submit your innovative ideas or formal project proposals for review by the R&amp;D and Innovation team.
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
          <Typography sx={{ fontWeight: 700, color: '#344054', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>Employee Information</Typography>
          <PreviewRow label="Name" value={formData.employeeName} />
          <PreviewRow label="Employee ID" value={formData.employeeId} />
          <PreviewRow label="Designation" value={formData.designation} />
          <PreviewRow label="Department" value={formData.department} />
          <PreviewRow label="Email" value={formData.officialEmail} />
          <PreviewRow label="Contact" value={formData.contactNumber} />
          <PreviewRow label="RM Name" value={formData.rmName} />
          <PreviewRow label="RM Email" value={formData.rmEmail} />
          <PreviewRow label="HOD Name" value={formData.hodName} />
          <PreviewRow label="HOD Email" value={formData.hodEmail} />

          <Typography sx={{ fontWeight: 700, color: '#344054', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1, mt: 3, mb: 1.5 }}>Submission Details</Typography>
          <PreviewRow label="Type" value={formData.submissionType} />
          <PreviewRow label="Category" value={formData.category} />
          <PreviewRow label="Sub-Category" value={formData.subCategory} />
          <PreviewRow label="Innovation Type" value={formData.innovationType} />

          {formData.submissionType === 'Idea' && (
            <>
              <Typography sx={{ fontWeight: 700, color: '#344054', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1, mt: 3, mb: 1.5 }}>Idea Details</Typography>
              <PreviewRow label="Project Title" value={formData.projectTitle} />
              <PreviewRow label="Abstract" value={formData.abstract?.slice(0, 200) + (formData.abstract?.length > 200 ? '…' : '')} />
            </>
          )}
          {formData.submissionType === 'Proposal' && (
            <>
              <Typography sx={{ fontWeight: 700, color: '#344054', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1, mt: 3, mb: 1.5 }}>Project Overview</Typography>
              <PreviewRow label="Project Title" value={formData.proposalTitle} />
              <PreviewRow label="Executive Summary" value={formData.executiveSummary?.slice(0, 150) + (formData.executiveSummary?.length > 150 ? '…' : '')} />
              <PreviewRow label="Problem Statement" value={formData.problemStatement?.slice(0, 150) + (formData.problemStatement?.length > 150 ? '…' : '')} />
            </>
          )}

          <Typography sx={{ fontWeight: 700, color: '#344054', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: 1, mt: 3, mb: 1.5 }}>Attachments</Typography>
          <PreviewRow label="Files" value={files.length > 0 ? files.map(f => f.name).join(', ') : 'None'} />
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
