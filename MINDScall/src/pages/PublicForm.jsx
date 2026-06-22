import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  FormControl, Select, MenuItem, Stepper, Step, StepLabel,
  Snackbar, Alert, Grid, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Container, Divider, Fade, Chip, InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Send as SendIcon, Save as SaveIcon, CheckCircle as CheckIcon,
  CloudUpload as UploadIcon, Delete as DeleteIcon,
  PictureAsPdf as PdfIcon, Description as DocIcon,
  InsertDriveFile as FileIcon, Visibility as ViewIcon,
  EmojiObjects as IdeaIcon, Assignment as ProposalIcon,
  Person as PersonIcon, Business as BusinessIcon,
  Category as CategoryIcon, Image as ImageIcon,
  Slideshow as SlideshowIcon, AttachFile as AttachIcon,
  Phone as PhoneIcon, Email as EmailIcon, Badge as BadgeIcon,
  LocationOn as LocationIcon, ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Engineering',
  'Traffic and AI',
  'Safety',
  'Finance',
  'E&S',
  'Human Resource',
  'R&D',
  'Others'
];

const SUB_CATEGORIES = [
  'Pavement',
  'Materials',
  'Structures',
  'Design',
  'AI and ML',
  'Traffic Engineering',
  'Others'
];

const INNOVATION_TYPES = [
  'Process Development',
  'Product Development'
];

// All 5 logical sections
const ALL_STEPS = [
  { key: 'employee', label: 'Employee Information', description: 'Provide your personal and organizational details' },
  { key: 'submission', label: 'Submission Details', description: 'Select the type, category, and classification' },
  { key: 'idea', label: 'Idea Details', description: 'Describe your innovative idea' },
  { key: 'proposal', label: 'Project Overview', description: 'Provide a comprehensive project overview' },
  { key: 'attachments', label: 'Attachments', description: 'Upload supporting documents' },
];

// ─── Styled Components ───────────────────────────────────────────────────────

const MsTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 4,
    backgroundColor: '#ffffff',
    '& fieldset': { borderColor: '#8A8886' },
    '&:hover fieldset': { borderColor: '#323130' },
    '&.Mui-focused fieldset': { borderColor: '#0078D4', borderWidth: '2px' },
  },
  '& .MuiInputBase-input': { color: '#323130', padding: '10px 14px' },
});

const MsSelect = styled(Select)({
  borderRadius: 4,
  backgroundColor: '#ffffff',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8A8886' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#323130' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0078D4', borderWidth: '2px' },
  '& .MuiSelect-select': { padding: '10px 14px', color: '#323130' },
});

const MsButton = styled(Button)({
  borderRadius: 4,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 24px',
  boxShadow: 'none',
  '&:hover': { boxShadow: 'none' },
});

// ─── File Upload Zone ────────────────────────────────────────────────────────

const getFileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return <PdfIcon sx={{ color: '#d13438' }} />;
  if (['doc', 'docx'].includes(ext)) return <DocIcon sx={{ color: '#2b579a' }} />;
  if (['ppt', 'pptx'].includes(ext)) return <SlideshowIcon sx={{ color: '#b7472a' }} />;
  if (['png', 'jpg', 'jpeg'].includes(ext)) return <ImageIcon sx={{ color: '#0078D4' }} />;
  return <FileIcon sx={{ color: '#605E5C' }} />;
};

const formatSize = b => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

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

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${isDragActive ? '#0078D4' : '#C8C6C4'}`,
          borderRadius: 2,
          p: 5,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? '#F3F9FD' : '#FAFAFA',
          transition: 'all 0.25s ease',
          '&:hover': { borderColor: '#0078D4', bgcolor: '#F3F9FD' }
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ color: isDragActive ? '#0078D4' : '#605E5C', fontSize: 48, mb: 1.5 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDragActive ? '#0078D4' : '#323130' }}>
          {isDragActive ? 'Drop files here…' : 'Drag & drop files here, or click to browse'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#605E5C', display: 'block', mt: 0.5 }}>
          Supported: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, JPEG (Max 10MB each)
        </Typography>
      </Box>
      {files.length > 0 && (
        <List dense sx={{ mt: 2 }}>
          {files.map((f, i) => (
            <ListItem
              key={i}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: 1,
                mb: 1,
                border: '1px solid #EDEBE9',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#F3F9FD', borderColor: '#0078D4' }
              }}
              secondaryAction={
                <IconButton size="small" onClick={() => removeFile(i)}>
                  <DeleteIcon sx={{ fontSize: 18, color: '#d13438' }} />
                </IconButton>
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{getFileIcon(f.name)}</ListItemIcon>
              <ListItemText
                primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#323130' }}>{f.name}</Typography>}
                secondary={<Typography variant="caption" sx={{ color: '#605E5C' }}>{formatSize(f.size)}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

// ─── Helper: Labeled Field ──────────────────────────────────────────────────

const FieldLabel = ({ children, required }) => (
  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.75, color: '#323130', fontSize: '0.82rem' }}>
    {children} {required && <span style={{ color: '#d13438' }}>*</span>}
  </Typography>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const PublicForm = () => {
  const { slug } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Section 1: Employee Information
    employeeName: '',
    employeeId: '',
    designation: '',
    department: '',
    subDepartment: '',
    areaOfWork: '',
    location: '',
    officialEmail: '',
    contactNumber: '',
    rmName: '',
    rmEmail: '',
    hodName: '',
    hodEmail: '',
    // Section 2: Submission Details
    submissionType: '',
    category: '',
    subCategory: '',
    innovationType: '',
    // Section 3: Idea Details
    projectTitle: '',
    abstract: '',
    // Section 4: Project Overview
    proposalTitle: '',
    executiveSummary: '',
    problemStatement: '',
    objectives: '',
    scopeOfWork: '',
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'info' });
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [wbsCode, setWbsCode] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Compute visible steps based on submission type
  const visibleSteps = useMemo(() => {
    return ALL_STEPS.filter(step => {
      if (step.key === 'idea') return formData.submissionType === 'Idea';
      if (step.key === 'proposal') return formData.submissionType === 'Proposal';
      return true;
    });
  }, [formData.submissionType]);

  const currentStepKey = visibleSteps[activeStep]?.key || 'employee';

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
      if (!formData.subDepartment.trim()) newErrors.subDepartment = 'Sub-Department is required';
      if (!formData.areaOfWork.trim()) newErrors.areaOfWork = 'Area of Work is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
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

    // Attachments step has no mandatory fields
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
      try {
        const payload = new FormData();
        // Map formData to answers, using projectTitle or proposalTitle as unified "title"
        const answersPayload = {
          ...formData,
          title: formData.submissionType === 'Proposal' ? formData.proposalTitle : formData.projectTitle,
          // Keep legacy keys for downstream compatibility
          name: formData.employeeName,
          managerName: formData.rmName,
          managerEmail: formData.rmEmail,
        };
        payload.append('answers', JSON.stringify(answersPayload));
        payload.append('submitterEmail', formData.officialEmail);
        files.forEach(f => payload.append('attachments', f));

        const res = await fetch(`http://localhost:5000/api/v1/public/forms/${slug}/submit`, {
          method: 'POST',
          body: payload
        });

        if (res.ok) {
          const data = await res.json();
          if (data.data?.trackingId) setTrackingId(data.data.trackingId);
          if (data.data?.businessId || data.data?.wbsCode) setWbsCode(data.data.businessId || data.data.wbsCode);
          setPreviewOpen(false);
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const errData = await res.json();
          setSnack({ open: true, msg: errData.error || 'Submission failed. Please try again.', type: 'error' });
        }
      } catch (err) {
        setSnack({ open: true, msg: 'Server error. Please try again.', type: 'error' });
      }
    }
  };

  // ─── Success Screen ──────────────────────────────────────────────────────

  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F3F2F1', p: 3 }}>
        <Card sx={{ maxWidth: 520, p: 5, textAlign: 'center', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#DFF6DD', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <CheckIcon sx={{ fontSize: 40, color: '#107C10' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#323130' }}>Submission Successful</Typography>

          {trackingId && (
            <Box sx={{ my: 3, p: 2.5, bgcolor: '#F3F9FD', borderRadius: 2, border: '1px dashed #0078D4' }}>
              <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tracking ID</Typography>
              <Typography variant="h5" sx={{ color: '#0078D4', fontWeight: 700, letterSpacing: 1, mt: 0.5 }}>{trackingId}</Typography>
            </Box>
          )}

          {wbsCode && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#FFF4CE', borderRadius: 2, border: '1px dashed #C19C00' }}>
              <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>WBS Code</Typography>
              <Typography variant="h6" sx={{ color: '#6B5900', fontWeight: 700, letterSpacing: 1, mt: 0.5 }}>{wbsCode}</Typography>
            </Box>
          )}

          <Typography variant="body1" sx={{ color: '#605E5C', mb: 4 }}>
            Thank you for submitting your {formData.submissionType?.toLowerCase() || 'idea'}. A confirmation email has been sent to your official email.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <MsButton variant="outlined" onClick={() => window.location.href = '/track'} size="large" sx={{ borderColor: '#0078D4', color: '#0078D4', '&:hover': { bgcolor: '#F3F9FD' } }}>Track Status</MsButton>
            <MsButton variant="contained" onClick={() => window.location.reload()} size="large" sx={{ bgcolor: '#0078D4', '&:hover': { bgcolor: '#106EBE' } }}>Submit Another</MsButton>
          </Box>
        </Card>
      </Box>
    );
  }

  // ─── Summary Item ──────────────────────────────────────────────────────────

  const renderSummaryItem = (label, value) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.8 }}>
      <Box sx={{ width: 3, minHeight: 28, borderRadius: 2, bgcolor: value ? '#0078D4' : '#E1DFDD', flexShrink: 0, mt: 0.2 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#8A8886', letterSpacing: 0.2, lineHeight: 1.3 }}>{label}</Typography>
        <Typography sx={{
          fontSize: '0.82rem', fontWeight: value ? 600 : 400, color: value ? '#323130' : '#C8C6C4',
          lineHeight: 1.35, mt: 0.15,
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word',
        }}>{value || '—'}</Typography>
      </Box>
    </Box>
  );

  const SummarySection = ({ icon, title, children, color = '#0078D4' }) => (
    <Box sx={{ mb: 0.5 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 1.5, mx: -1.5,
        bgcolor: `${color}08`, borderRadius: 1, mb: 0.5,
      }}>
        <Box sx={{ width: 22, height: 22, borderRadius: '6px', bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(icon, { sx: { fontSize: 13, color } })}
        </Box>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color, letterSpacing: 0.6, textTransform: 'uppercase' }}>{title}</Typography>
      </Box>
      <Box sx={{ pl: 0.5 }}>
        {children}
      </Box>
    </Box>
  );

  // ─── Step Content Renderers ────────────────────────────────────────────────

  const renderEmployeeInfo = () => (
    <Fade in timeout={300}>
      <Box>
        {/* Personal Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ bgcolor: '#E8F0FE', p: 1, borderRadius: 1.5, display: 'flex' }}>
            <PersonIcon sx={{ color: '#0078D4', fontSize: 20 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#323130' }}>Personal Details</Typography>
        </Box>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Employee Name</FieldLabel>
            <MsTextField fullWidth placeholder="Enter your full name" value={formData.employeeName} onChange={e => handleChange('employeeName', e.target.value)} error={!!errors.employeeName} helperText={errors.employeeName} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Employee ID</FieldLabel>
            <MsTextField fullWidth placeholder="e.g. EMP-1029" value={formData.employeeId} onChange={e => handleChange('employeeId', e.target.value)} error={!!errors.employeeId} helperText={errors.employeeId} InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#605E5C', fontSize: 18 }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Designation</FieldLabel>
            <MsTextField fullWidth placeholder="e.g. Senior Engineer" value={formData.designation} onChange={e => handleChange('designation', e.target.value)} error={!!errors.designation} helperText={errors.designation} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Department</FieldLabel>
            <MsTextField fullWidth placeholder="e.g. Engineering" value={formData.department} onChange={e => handleChange('department', e.target.value)} error={!!errors.department} helperText={errors.department} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Sub-Department</FieldLabel>
            <MsTextField fullWidth placeholder="e.g. R&D" value={formData.subDepartment} onChange={e => handleChange('subDepartment', e.target.value)} error={!!errors.subDepartment} helperText={errors.subDepartment} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Area of Work</FieldLabel>
            <MsTextField fullWidth placeholder="e.g. Pavement Materials" value={formData.areaOfWork} onChange={e => handleChange('areaOfWork', e.target.value)} error={!!errors.areaOfWork} helperText={errors.areaOfWork} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Location</FieldLabel>
            <MsTextField fullWidth placeholder="e.g. Hyderabad" value={formData.location} onChange={e => handleChange('location', e.target.value)} error={!!errors.location} helperText={errors.location} InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon sx={{ color: '#605E5C', fontSize: 18 }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Official Email ID</FieldLabel>
            <MsTextField fullWidth placeholder="name@company.com" type="email" value={formData.officialEmail} onChange={e => handleChange('officialEmail', e.target.value)} error={!!errors.officialEmail} helperText={errors.officialEmail} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#605E5C', fontSize: 18 }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FieldLabel required>Contact Number</FieldLabel>
            <MsTextField fullWidth placeholder="+91 9876543210" value={formData.contactNumber} onChange={e => handleChange('contactNumber', e.target.value)} error={!!errors.contactNumber} helperText={errors.contactNumber} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#605E5C', fontSize: 18 }} /></InputAdornment> }} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Reporting Manager & HOD */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: '#FAFAFA', borderRadius: 2, border: '1px solid #EDEBE9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, color: '#323130' }}>Reporting Manager</Typography>
              <FieldLabel required>Name</FieldLabel>
              <MsTextField fullWidth placeholder="Manager's full name" value={formData.rmName} onChange={e => handleChange('rmName', e.target.value)} error={!!errors.rmName} helperText={errors.rmName} sx={{ mb: 2.5 }} />
              <FieldLabel required>Email ID</FieldLabel>
              <MsTextField fullWidth placeholder="manager@company.com" type="email" value={formData.rmEmail} onChange={e => handleChange('rmEmail', e.target.value)} error={!!errors.rmEmail} helperText={errors.rmEmail} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, bgcolor: '#FAFAFA', borderRadius: 2, border: '1px solid #EDEBE9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, color: '#323130' }}>Head of Department (HOD)</Typography>
              <FieldLabel required>Name</FieldLabel>
              <MsTextField fullWidth placeholder="HOD's full name" value={formData.hodName} onChange={e => handleChange('hodName', e.target.value)} error={!!errors.hodName} helperText={errors.hodName} sx={{ mb: 2.5 }} />
              <FieldLabel required>Email ID</FieldLabel>
              <MsTextField fullWidth placeholder="hod@company.com" type="email" value={formData.hodEmail} onChange={e => handleChange('hodEmail', e.target.value)} error={!!errors.hodEmail} helperText={errors.hodEmail} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderSubmissionDetails = () => (
    <Fade in timeout={300}>
      <Box>
        {/* Submission Type Selection */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: '#323130', fontSize: '0.9rem' }}>
          Submission Type <span style={{ color: '#d13438' }}>*</span>
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {['Idea', 'Proposal'].map((type) => (
            <Grid item xs={12} sm={6} key={type}>
              <Paper
                elevation={0}
                onClick={() => handleChange('submissionType', type)}
                sx={{
                  p: 3,
                  border: '2px solid',
                  borderColor: formData.submissionType === type ? '#0078D4' : '#E1DFDD',
                  borderRadius: 2,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  bgcolor: formData.submissionType === type ? '#F3F9FD' : '#ffffff',
                  boxShadow: formData.submissionType === type ? '0 0 0 1px #0078D4' : 'none',
                  '&:hover': {
                    borderColor: formData.submissionType === type ? '#0078D4' : '#8A8886',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }
                }}
              >
                {formData.submissionType === type && (
                  <CheckIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#0078D4', fontSize: 22 }} />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  {type === 'Idea'
                    ? <IdeaIcon sx={{ fontSize: 32, color: formData.submissionType === type ? '#0078D4' : '#605E5C', mr: 1.5 }} />
                    : <ProposalIcon sx={{ fontSize: 32, color: formData.submissionType === type ? '#0078D4' : '#605E5C', mr: 1.5 }} />
                  }
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#323130' }}>{type}</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#605E5C', lineHeight: 1.5 }}>
                  {type === 'Idea'
                    ? 'Submit a new concept or innovative thought with a brief abstract for initial review.'
                    : 'Submit a structured project plan with executive summary, problem statement, and scope of work.'}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {errors.submissionType && <Typography color="error" variant="caption" sx={{ display: 'block', mt: -2, mb: 2 }}>{errors.submissionType}</Typography>}

        <Divider sx={{ my: 3 }} />

        {/* Category, Sub-Category, Innovation Type */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ bgcolor: '#E8F0FE', p: 1, borderRadius: 1.5, display: 'flex' }}>
            <CategoryIcon sx={{ color: '#0078D4', fontSize: 20 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#323130' }}>Classification</Typography>
        </Box>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <FieldLabel required>Category</FieldLabel>
            <FormControl fullWidth error={!!errors.category}>
              <MsSelect value={formData.category} onChange={e => handleChange('category', e.target.value)} displayEmpty>
                <MenuItem value="" disabled>Select Category</MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </MsSelect>
              {errors.category && <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1 }}>{errors.category}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel required>Sub-Category</FieldLabel>
            <FormControl fullWidth error={!!errors.subCategory}>
              <MsSelect value={formData.subCategory} onChange={e => handleChange('subCategory', e.target.value)} displayEmpty>
                <MenuItem value="" disabled>Select Sub-Category</MenuItem>
                {SUB_CATEGORIES.map(sc => <MenuItem key={sc} value={sc}>{sc}</MenuItem>)}
              </MsSelect>
              {errors.subCategory && <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1 }}>{errors.subCategory}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldLabel required>Innovation Type</FieldLabel>
            <FormControl fullWidth error={!!errors.innovationType}>
              <MsSelect value={formData.innovationType} onChange={e => handleChange('innovationType', e.target.value)} displayEmpty>
                <MenuItem value="" disabled>Select Innovation Type</MenuItem>
                {INNOVATION_TYPES.map(it => <MenuItem key={it} value={it}>{it}</MenuItem>)}
              </MsSelect>
              {errors.innovationType && <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1 }}>{errors.innovationType}</Typography>}
            </FormControl>
          </Grid>
        </Grid>

        {/* WBS Code - Auto Generated / Read Only */}
        <Box sx={{ mt: 3 }}>
          <FieldLabel>WBS Code</FieldLabel>
          <MsTextField
            fullWidth
            disabled
            value="Auto-generated upon submission"
            InputProps={{
              sx: { bgcolor: '#F3F2F1', color: '#A19F9D' }
            }}
          />
          <Typography variant="caption" sx={{ color: '#605E5C', mt: 0.5, display: 'block' }}>
            A unique WBS code will be system-generated when you submit the form.
          </Typography>
        </Box>
      </Box>
    </Fade>
  );

  const renderIdeaDetails = () => (
    <Fade in timeout={300}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ bgcolor: '#FFF4CE', p: 1, borderRadius: 1.5, display: 'flex' }}>
            <IdeaIcon sx={{ color: '#C19C00', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#323130' }}>Idea Details</Typography>
            <Typography variant="caption" sx={{ color: '#605E5C' }}>Describe your innovative idea clearly and concisely</Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FieldLabel required>Project Title</FieldLabel>
            <MsTextField
              fullWidth
              placeholder="Enter a clear and descriptive title for your idea"
              value={formData.projectTitle}
              onChange={e => handleChange('projectTitle', e.target.value)}
              error={!!errors.projectTitle}
              helperText={errors.projectTitle}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 0.75 }}>
              <Box>
                <FieldLabel required>Abstract</FieldLabel>
                <Typography variant="caption" sx={{ color: '#605E5C', display: 'block', mt: -0.5 }}>
                  Clearly describe the Introduction, Proposed Idea, and Expected Benefits.
                </Typography>
              </Box>
              <Chip
                label={`${abstractWordCount} / 200 words`}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  bgcolor: abstractWordCount > 200 ? '#FDE7E9' : abstractWordCount > 150 ? '#FFF4CE' : '#DFF6DD',
                  color: abstractWordCount > 200 ? '#d13438' : abstractWordCount > 150 ? '#6B5900' : '#107C10',
                }}
              />
            </Box>
            <MsTextField
              fullWidth
              multiline
              rows={8}
              placeholder={`Introduction:\nDescribe the background and context of your idea...\n\nProposed Idea:\nExplain what you are proposing...\n\nExpected Benefits:\nList the anticipated outcomes and benefits...`}
              value={formData.abstract}
              onChange={e => handleChange('abstract', e.target.value)}
              error={!!errors.abstract}
              helperText={errors.abstract}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderProjectOverview = () => (
    <Fade in timeout={300}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ bgcolor: '#E8F0FE', p: 1, borderRadius: 1.5, display: 'flex' }}>
            <ProposalIcon sx={{ color: '#0078D4', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#323130' }}>Project Overview</Typography>
            <Typography variant="caption" sx={{ color: '#605E5C' }}>Provide a comprehensive overview of your proposed project</Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FieldLabel required>Project Title</FieldLabel>
            <MsTextField
              fullWidth
              placeholder="Enter the project title"
              value={formData.proposalTitle}
              onChange={e => handleChange('proposalTitle', e.target.value)}
              error={!!errors.proposalTitle}
              helperText={errors.proposalTitle}
            />
          </Grid>
          <Grid item xs={12}>
            <FieldLabel required>Executive Summary</FieldLabel>
            <MsTextField
              fullWidth
              multiline
              rows={4}
              placeholder="Provide a brief executive summary of the project..."
              value={formData.executiveSummary}
              onChange={e => handleChange('executiveSummary', e.target.value)}
              error={!!errors.executiveSummary}
              helperText={errors.executiveSummary}
            />
          </Grid>
          <Grid item xs={12}>
            <FieldLabel required>Problem Statement</FieldLabel>
            <MsTextField
              fullWidth
              multiline
              rows={4}
              placeholder="Clearly define the problem this project aims to solve..."
              value={formData.problemStatement}
              onChange={e => handleChange('problemStatement', e.target.value)}
              error={!!errors.problemStatement}
              helperText={errors.problemStatement}
            />
          </Grid>
          <Grid item xs={12}>
            <FieldLabel required>Objectives</FieldLabel>
            <MsTextField
              fullWidth
              multiline
              rows={3}
              placeholder="List the key objectives of this project..."
              value={formData.objectives}
              onChange={e => handleChange('objectives', e.target.value)}
              error={!!errors.objectives}
              helperText={errors.objectives}
            />
          </Grid>
          <Grid item xs={12}>
            <FieldLabel required>Scope of Work</FieldLabel>
            <MsTextField
              fullWidth
              multiline
              rows={4}
              placeholder="Define the scope, deliverables, and boundaries of this project..."
              value={formData.scopeOfWork}
              onChange={e => handleChange('scopeOfWork', e.target.value)}
              error={!!errors.scopeOfWork}
              helperText={errors.scopeOfWork}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderAttachments = () => (
    <Fade in timeout={300}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ bgcolor: '#E8F0FE', p: 1, borderRadius: 1.5, display: 'flex' }}>
            <AttachIcon sx={{ color: '#0078D4', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#323130' }}>Supporting Documents</Typography>
            <Typography variant="caption" sx={{ color: '#605E5C' }}>Upload any documents that support your submission (optional)</Typography>
          </Box>
        </Box>
        <FileZone files={files} setFiles={setFiles} />
      </Box>
    </Fade>
  );

  const renderStepContent = () => {
    switch (currentStepKey) {
      case 'employee': return renderEmployeeInfo();
      case 'submission': return renderSubmissionDetails();
      case 'idea': return renderIdeaDetails();
      case 'proposal': return renderProjectOverview();
      case 'attachments': return renderAttachments();
      default: return null;
    }
  };

  // ─── Preview ─────────────────────────────────────────────────────────────

  const renderPreviewSection = (title, icon, children) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#323130' }}>{title}</Typography>
      </Box>
      {children}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F2F1', pb: 10 }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#0078D4', color: '#fff', height: 52, display: 'flex', alignItems: 'center', px: 3, boxShadow: '0 2px 8px rgba(0,120,212,0.25)' }}>
        <IdeaIcon sx={{ mr: 1.5, fontSize: 24 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>Innovation Portal — Idea / Proposal Submission</Typography>
      </Box>

      {/* Main Container */}
      <Container maxWidth="lg" sx={{ pt: 4, px: { xs: 2, md: 4 } }}>
        <Grid container spacing={4} sx={{ flexWrap: { md: 'nowrap', xs: 'wrap' } }}>
          {/* Left Column: Form Content */}
          <Grid item xs={12} md={8} sx={{ minWidth: 0 }}>
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 4, overflow: 'visible' }}>

              {/* Form Header with Stepper */}
              <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: '1px solid #EDEBE9', bgcolor: '#ffffff' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#323130', mb: 0.5 }}>
                  {visibleSteps[activeStep]?.label}
                </Typography>
                <Typography variant="body2" sx={{ color: '#605E5C', mb: 3 }}>
                  {visibleSteps[activeStep]?.description}
                </Typography>

                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{
                    '& .MuiStepLabel-label': { fontSize: '0.72rem', mt: 0.5, color: '#605E5C', fontWeight: 500 },
                    '& .Mui-active': { color: '#323130 !important', fontWeight: '700 !important' },
                    '& .Mui-completed': { color: '#323130 !important' },
                    '& .MuiStepIcon-root': {
                      color: '#E1DFDD',
                      '&.Mui-active': { color: '#0078D4' },
                      '&.Mui-completed': { color: '#0078D4' }
                    }
                  }}
                >
                  {visibleSteps.map((step) => (
                    <Step key={step.key}>
                      <StepLabel>{step.label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <CardContent sx={{ p: { xs: 3, md: 4 }, minHeight: 400, bgcolor: '#ffffff' }}>
                {renderStepContent()}
              </CardContent>

              {/* Footer Actions */}
              <Box sx={{ p: 3, bgcolor: '#F8F8F8', borderTop: '1px solid #EDEBE9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  startIcon={<SaveIcon />}
                  sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'none' }}
                  onClick={() => setSnack({ open: true, msg: 'Draft saved successfully.', type: 'success' })}
                >
                  Save Draft
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep > 0 && (
                    <MsButton
                      variant="outlined"
                      onClick={handleBack}
                      sx={{ color: '#323130', borderColor: '#8A8886', '&:hover': { bgcolor: '#F3F2F1', borderColor: '#323130' } }}
                    >
                      Back
                    </MsButton>
                  )}
                  {activeStep < visibleSteps.length - 1 ? (
                    <MsButton
                      variant="contained"
                      onClick={handleNext}
                      sx={{ bgcolor: '#0078D4', '&:hover': { bgcolor: '#106EBE' } }}
                    >
                      Next
                    </MsButton>
                  ) : (
                    <>
                      <MsButton
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => setPreviewOpen(true)}
                        sx={{ borderColor: '#0078D4', color: '#0078D4', '&:hover': { bgcolor: '#F3F9FD', borderColor: '#0078D4' } }}
                      >
                        Preview
                      </MsButton>
                      <MsButton
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={handleSubmit}
                        sx={{ bgcolor: '#0078D4', '&:hover': { bgcolor: '#106EBE' } }}
                      >
                        Submit
                      </MsButton>
                    </>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Right Column: Review Summary */}
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' }, minWidth: 300, maxWidth: 340 }}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Card sx={{
                borderRadius: 3,
                border: '1px solid #E1DFDD',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>
                {/* Header */}
                <Box sx={{
                  p: 2.5,
                  background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
                  color: '#fff',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ViewIcon sx={{ fontSize: 18, opacity: 0.9 }} />
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: 0.3 }}>Review Summary</Typography>
                    </Box>
                    <Chip
                      label={`Step ${activeStep + 1}/${visibleSteps.length}`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 22,
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                  {/* Progress bar */}
                  <Box sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%',
                      bgcolor: '#fff',
                      borderRadius: 4,
                      width: `${((activeStep + 1) / visibleSteps.length) * 100}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </Box>
                </Box>

                {/* Content */}
                <CardContent sx={{
                  p: 2.5,
                  maxHeight: 'calc(100vh - 200px)',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#C8C6C4', borderRadius: 2 },
                }}>
                  {/* Employee Section */}
                  <SummarySection icon={<PersonIcon />} title="Employee" color="#0078D4">
                    {renderSummaryItem('Name', formData.employeeName)}
                    {renderSummaryItem('Employee ID', formData.employeeId)}
                    {renderSummaryItem('Department', formData.department)}
                    {renderSummaryItem('Designation', formData.designation)}
                    {renderSummaryItem('Location', formData.location)}
                    {renderSummaryItem('Email', formData.officialEmail)}
                  </SummarySection>

                  {/* Submission Section */}
                  <SummarySection icon={<CategoryIcon />} title="Submission" color="#8764B8">
                    {renderSummaryItem('Type', formData.submissionType)}
                    {renderSummaryItem('Category', formData.category)}
                    {renderSummaryItem('Sub-Category', formData.subCategory)}
                    {renderSummaryItem('Innovation Type', formData.innovationType)}
                  </SummarySection>

                  {/* Details Section — conditional */}
                  <SummarySection
                    icon={formData.submissionType === 'Proposal' ? <ProposalIcon /> : <IdeaIcon />}
                    title={formData.submissionType === 'Proposal' ? 'Project Overview' : 'Idea Details'}
                    color={formData.submissionType === 'Proposal' ? '#0078D4' : '#C19C00'}
                  >
                    {formData.submissionType === 'Proposal' ? (
                      <>
                        {renderSummaryItem('Project Title', formData.proposalTitle)}
                        {renderSummaryItem('Executive Summary', formData.executiveSummary ? (formData.executiveSummary.length > 100 ? formData.executiveSummary.slice(0, 100) + '…' : formData.executiveSummary) : '')}
                        {renderSummaryItem('Problem Statement', formData.problemStatement ? (formData.problemStatement.length > 100 ? formData.problemStatement.slice(0, 100) + '…' : formData.problemStatement) : '')}
                      </>
                    ) : (
                      <>
                        {renderSummaryItem('Project Title', formData.projectTitle)}
                        {renderSummaryItem('Abstract', formData.abstract ? (formData.abstract.length > 100 ? formData.abstract.slice(0, 100) + '…' : formData.abstract) : '')}
                      </>
                    )}
                  </SummarySection>

                  {/* Management Section */}
                  <SummarySection icon={<BusinessIcon />} title="Management" color="#107C10">
                    {renderSummaryItem('Reporting Manager', formData.rmName)}
                    {renderSummaryItem('RM Email', formData.rmEmail)}
                    {renderSummaryItem('HOD', formData.hodName)}
                    {renderSummaryItem('HOD Email', formData.hodEmail)}
                  </SummarySection>

                  {/* Attachments Section */}
                  <SummarySection icon={<AttachIcon />} title="Attachments" color="#605E5C">
                    {files.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>
                        {files.map((f, i) => (
                          <Box key={i} sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            py: 0.5, px: 1, bgcolor: '#F8F8F8', borderRadius: 1,
                            border: '1px solid #EDEBE9',
                          }}>
                            {getFileIcon(f.name)}
                            <Typography sx={{
                              fontSize: '0.72rem', fontWeight: 500, color: '#323130',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                            }}>{f.name}</Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: '#8A8886', flexShrink: 0 }}>{formatSize(f.size)}</Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: '0.78rem', color: '#C8C6C4', py: 1, pl: 0.5, fontStyle: 'italic' }}>No files uploaded</Typography>
                    )}
                  </SummarySection>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2, bgcolor: '#ffffff' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #EDEBE9', bgcolor: '#F8FAFC', py: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#323130' }}>Submission Preview</Typography>
          <Typography variant="caption" sx={{ color: '#605E5C' }}>Review all details before submitting</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {/* Employee Info */}
          {renderPreviewSection('Employee Information', <PersonIcon sx={{ color: '#0078D4' }} />, (
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Name</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.employeeName || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Employee ID</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.employeeId || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Designation</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.designation || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Department</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.department || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Sub-Department</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.subDepartment || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Area of Work</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.areaOfWork || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Location</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.location || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Email</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.officialEmail || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>Contact</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.contactNumber || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>RM Name</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.rmName || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>RM Email</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.rmEmail || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>HOD Name</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.hodName || '—'}</Typography></Grid>
              <Grid item xs={6} sm={4}><Typography variant="caption" sx={{ color: '#605E5C' }}>HOD Email</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.hodEmail || '—'}</Typography></Grid>
            </Grid>
          ))}

          {/* Submission Details */}
          {renderPreviewSection('Submission Details', <CategoryIcon sx={{ color: '#0078D4' }} />, (
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}><Typography variant="caption" sx={{ color: '#605E5C' }}>Type</Typography><Chip label={formData.submissionType || '—'} size="small" color={formData.submissionType === 'Idea' ? 'warning' : 'primary'} sx={{ fontWeight: 600 }} /></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" sx={{ color: '#605E5C' }}>Category</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.category || '—'}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" sx={{ color: '#605E5C' }}>Sub-Category</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.subCategory || '—'}</Typography></Grid>
              <Grid item xs={6} sm={3}><Typography variant="caption" sx={{ color: '#605E5C' }}>Innovation Type</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.innovationType || '—'}</Typography></Grid>
            </Grid>
          ))}

          {/* Idea or Proposal Details */}
          {formData.submissionType === 'Idea' && renderPreviewSection('Idea Details', <IdeaIcon sx={{ color: '#C19C00' }} />, (
            <Box>
              <Typography variant="caption" sx={{ color: '#605E5C' }}>Project Title</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{formData.projectTitle || '—'}</Typography>
              <Typography variant="caption" sx={{ color: '#605E5C' }}>Abstract</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', color: '#323130', lineHeight: 1.6 }}>{formData.abstract || '—'}</Typography>
            </Box>
          ))}

          {formData.submissionType === 'Proposal' && renderPreviewSection('Project Overview', <ProposalIcon sx={{ color: '#0078D4' }} />, (
            <Box>
              <Typography variant="caption" sx={{ color: '#605E5C' }}>Project Title</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>{formData.proposalTitle || '—'}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><Typography variant="caption" sx={{ color: '#605E5C' }}>Executive Summary</Typography><Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{formData.executiveSummary || '—'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="caption" sx={{ color: '#605E5C' }}>Problem Statement</Typography><Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{formData.problemStatement || '—'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="caption" sx={{ color: '#605E5C' }}>Objectives</Typography><Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{formData.objectives || '—'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="caption" sx={{ color: '#605E5C' }}>Scope of Work</Typography><Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{formData.scopeOfWork || '—'}</Typography></Grid>
              </Grid>
            </Box>
          ))}

          {/* Attachments */}
          {files.length > 0 && renderPreviewSection('Attachments', <AttachIcon sx={{ color: '#0078D4' }} />, (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {files.map((f, i) => (
                <Chip key={i} icon={getFileIcon(f.name)} label={f.name} variant="outlined" sx={{ borderColor: '#EDEBE9' }} />
              ))}
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #EDEBE9', bgcolor: '#F8FAFC' }}>
          <MsButton onClick={() => setPreviewOpen(false)} sx={{ color: '#323130', fontWeight: 600 }}>Edit Details</MsButton>
          <MsButton variant="contained" startIcon={<SendIcon />} onClick={handleSubmit} sx={{ bgcolor: '#0078D4', fontWeight: 600, '&:hover': { bgcolor: '#106EBE' } }}>Confirm & Submit</MsButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.type} variant="filled" sx={{ borderRadius: 1, fontWeight: 600 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicForm;
