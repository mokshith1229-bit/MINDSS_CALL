import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  FormControl, Select, MenuItem, RadioGroup, FormControlLabel,
  Radio, Stepper, Step, StepLabel, Snackbar, Alert,
  Grid, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemIcon, ListItemText, IconButton, Container, Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Send as SendIcon, Save as SaveIcon, CheckCircle as CheckIcon,
  CloudUpload as UploadIcon, Delete as DeleteIcon,
  PictureAsPdf as PdfIcon, Description as DocIcon,
  InsertDriveFile as FileIcon, Visibility as ViewIcon,
  EmojiObjects as IdeaIcon, Assignment as ProposalIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// ─── Constants ───────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { id: 'eng', label: 'Engineering & Technology' },
  { id: 'mfg', label: 'Manufacturing & Operations' },
  { id: 'quality', label: 'Quality Assurance' },
  { id: 'hr', label: 'Human Resources' },
];

const SUB_DEPARTMENTS = {
  eng: [{ id: 'sw', label: 'Software Engineering' }, { id: 'hw', label: 'Hardware Engineering' }, { id: 'rd', label: 'Research & Development' }],
  mfg: [{ id: 'assm', label: 'Assembly Line' }, { id: 'pack', label: 'Packaging' }],
  quality: [{ id: 'qc', label: 'Quality Control' }, { id: 'qa', label: 'Quality Audit' }],
  hr: [{ id: 'ta', label: 'Talent Acquisition' }, { id: 'er', label: 'Employee Relations' }],
};

const SUB_SUB_DEPARTMENTS = {
  sw: [{ id: 'fe', label: 'Frontend' }, { id: 'be', label: 'Backend' }, { id: 'devops', label: 'DevOps' }],
  hw: [{ id: 'pcb', label: 'PCB Design' }, { id: 'mech', label: 'Mechanical' }],
  rd: [{ id: 'proto', label: 'Prototyping' }, { id: 'lab', label: 'Testing Lab' }],
  assm: [{ id: 'a1', label: 'Line 1' }, { id: 'a2', label: 'Line 2' }],
};

const CLASSIFICATIONS = [
  'Process Improvement', 'Product Development', 'Innovation',
  'Automation', 'Cost Saving', 'Quality Improvement'
];

const STEPS = [
  'Submission Type', 'Employee Information', 'Organization Details',
  'Classification', 'Management Information', 'Submission Details', 'Attachments'
];

const STEP_DESCRIPTIONS = [
  'Select the nature of your submission',
  'Provide your personal details',
  'Specify your department structure',
  'Categorize your submission area',
  'Provide reporting manager and HOD details',
  'Enter the descriptive title and abstract',
  'Upload any supporting documents'
];

// ─── Styled Components ───────────────────────────────────────────────────────
const MsTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: '#8A8886',
    },
    '&:hover fieldset': {
      borderColor: '#323130',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0078D4',
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    color: '#323130',
    padding: '10px 14px',
  },
});

const MsSelect = styled(Select)({
  borderRadius: 2,
  backgroundColor: '#ffffff',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#8A8886',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#323130',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0078D4',
    borderWidth: '2px',
  },
  '& .MuiSelect-select': {
    padding: '10px 14px',
    color: '#323130',
  }
});

const MsButton = styled(Button)({
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  padding: '6px 20px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  }
});

// ─── File Upload Zone ────────────────────────────────────────────────────────
const getFileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return <PdfIcon sx={{ color: '#d13438' }} />;
  if (['doc', 'docx'].includes(ext)) return <DocIcon sx={{ color: '#2b579a' }} />;
  if (['ppt', 'pptx'].includes(ext)) return <FileIcon sx={{ color: '#b7472a' }} />;
  if (['xls', 'xlsx'].includes(ext)) return <FileIcon sx={{ color: '#217346' }} />;
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
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Box {...getRootProps()} sx={{ border: `2px dashed ${isDragActive ? '#0078D4' : '#C8C6C4'}`, borderRadius: 1, p: 4, textAlign: 'center', cursor: 'pointer', bgcolor: isDragActive ? '#F3F9FD' : '#ffffff', transition: 'all 0.2s', '&:hover': { borderColor: '#0078D4', bgcolor: '#F3F9FD' } }}>
        <input {...getInputProps()} />
        <UploadIcon sx={{ color: isDragActive ? '#0078D4' : '#605E5C', fontSize: 40, mb: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDragActive ? '#0078D4' : '#323130' }}>{isDragActive ? 'Drop files here…' : 'Drag & drop files here'}</Typography>
        <Typography variant="caption" sx={{ color: '#605E5C' }}>Supported: PDF, DOCX, PPTX, XLSX (Max 10MB)</Typography>
      </Box>
      {files.length > 0 && (
        <List dense sx={{ mt: 2 }}>
          {files.map((f, i) => (
            <ListItem key={i} sx={{ bgcolor: '#ffffff', borderRadius: 1, mb: 1, border: '1px solid #EDEBE9' }} secondaryAction={
              <IconButton size="small" onClick={() => removeFile(i)}><DeleteIcon sx={{ fontSize: 18, color: '#d13438' }} /></IconButton>
            }>
              <ListItemIcon sx={{ minWidth: 36 }}>{getFileIcon(f.name)}</ListItemIcon>
              <ListItemText primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#323130' }}>{f.name}</Typography>} secondary={<Typography variant="caption" sx={{color: '#605E5C'}}>{formatSize(f.size)}</Typography>} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
const PublicForm = () => {
  const { slug } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    submissionType: '', name: '', dob: '', employeeCode: '', department: '', subDepartment: '', subSubDepartment: '',
    classification: '', managerName: '', managerEmail: '', hodName: '', hodEmail: '', title: '', abstract: ''
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: '', type: 'info' });
  const [submitted, setSubmitted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const subDepts = formData.department ? (SUB_DEPARTMENTS[formData.department] || []) : [];
  const subSubDepts = formData.subDepartment ? (SUB_SUB_DEPARTMENTS[formData.subDepartment] || []) : [];

  const wordCount = formData.abstract.trim() ? formData.abstract.trim().split(/\s+/).length : 0;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));

    // Reset dependents
    if (field === 'department') setFormData(prev => ({ ...prev, subDepartment: '', subSubDepartment: '' }));
    if (field === 'subDepartment') setFormData(prev => ({ ...prev, subSubDepartment: '' }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0 && !formData.submissionType) newErrors.submissionType = 'Please select a submission type';
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.employeeCode) newErrors.employeeCode = 'Employee code is required';
    }
    if (step === 2) {
      if (!formData.department) newErrors.department = 'Department is required';
      if (subDepts.length > 0 && !formData.subDepartment) newErrors.subDepartment = 'Sub department is required';
      if (subSubDepts.length > 0 && !formData.subSubDepartment) newErrors.subSubDepartment = 'Sub sub department is required';
    }
    if (step === 3 && !formData.classification) newErrors.classification = 'Classification is required';
    if (step === 4) {
      if (!formData.managerName) newErrors.managerName = 'Reporting Manager Name is required';
      if (!formData.managerEmail || !/\S+@\S+\.\S+/.test(formData.managerEmail)) newErrors.managerEmail = 'Valid email is required';
      if (!formData.hodName) newErrors.hodName = 'HOD Name is required';
      if (!formData.hodEmail || !/\S+@\S+\.\S+/.test(formData.hodEmail)) newErrors.hodEmail = 'Valid email is required';
    }
    if (step === 5) {
      if (!formData.title) newErrors.title = 'Title is required';
      if (!formData.abstract) newErrors.abstract = 'Abstract is required';
      else if (wordCount > 200) newErrors.abstract = 'Abstract cannot exceed 200 words';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
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
    if (validateStep(activeStep)) {
      try {
        const payload = new FormData();
        payload.append('answers', JSON.stringify(formData));
        payload.append('submitterEmail', formData.managerEmail || '');
        files.forEach(f => payload.append('attachments', f));

        const res = await fetch(`http://localhost:5000/api/v1/public/forms/${slug}/submit`, {
          method: 'POST',
          body: payload
        });

        if (res.ok) {
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

  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F3F2F1', p: 3 }}>
        <Card sx={{ maxWidth: 500, p: 5, textAlign: 'center', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CheckIcon sx={{ fontSize: 64, color: '#107C10', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#323130' }}>Submission Successful</Typography>
          <Typography variant="body1" sx={{ color: '#605E5C', mb: 4 }}>Thank you for submitting your {formData.submissionType || 'idea'}. A confirmation email has been sent to you.</Typography>
          <MsButton variant="contained" onClick={() => window.location.reload()} size="large" sx={{ bgcolor: '#0078D4', '&:hover': { bgcolor: '#106EBE' } }}>Submit Another</MsButton>
        </Card>
      </Box>
    );
  }

  const renderSummaryItem = (label, value) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: value ? '#323130' : '#A19F9D', fontWeight: 500 }}>{value || '-'}</Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F2F1', pb: 10 }}>
      {/* Microsoft-style App Header */}
      <Box sx={{ bgcolor: '#0078D4', color: '#fff', height: 48, display: 'flex', alignItems: 'center', px: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>CubeTech Innovation Portal</Typography>
      </Box>

      {/* Main Container */}
      <Container maxWidth="lg" sx={{ pt: 4, px: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          {/* Left Column: Form Content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', mb: 4, overflow: 'visible' }}>
              
              {/* Form Header with Stepper */}
              <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: '1px solid #EDEBE9', bgcolor: '#ffffff' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#323130', mb: 1 }}>{STEPS[activeStep]}</Typography>
                <Typography variant="body2" sx={{ color: '#605E5C', mb: 4 }}>{STEP_DESCRIPTIONS[activeStep]}</Typography>
                
                <Stepper activeStep={activeStep} alternativeLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.75rem', mt: 0.5, color: '#605E5C' }, '& .Mui-active': { color: '#323130 !important', fontWeight: 600 }, '& .Mui-completed': { color: '#323130 !important' }, '& .MuiStepIcon-root': { color: '#EDEBE9', '&.Mui-active': { color: '#0078D4' }, '&.Mui-completed': { color: '#0078D4' } } }}>
                  {STEPS.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <CardContent sx={{ p: { xs: 3, md: 4 }, minHeight: 400, bgcolor: '#ffffff' }}>
                {/* Step 1 */}
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3, color: '#323130' }}>What type of submission is this? <span style={{ color: '#d13438' }}>*</span></Typography>
                    <Grid container spacing={3}>
                      {['Idea', 'Proposal'].map((type) => (
                        <Grid item xs={12} sm={6} key={type}>
                          <Paper 
                            elevation={0} 
                            onClick={() => handleChange('submissionType', type)} 
                            sx={{ 
                              p: 3, 
                              border: '1px solid',
                              borderColor: formData.submissionType === type ? '#0078D4' : '#C8C6C4', 
                              borderRadius: 1, 
                              cursor: 'pointer', 
                              position: 'relative',
                              display: 'flex', 
                              flexDirection: 'column', 
                              transition: 'all 0.15s ease-in-out', 
                              bgcolor: formData.submissionType === type ? '#F3F9FD' : '#ffffff', 
                              boxShadow: formData.submissionType === type ? '0 0 0 1px #0078D4' : 'none',
                              '&:hover': { borderColor: formData.submissionType === type ? '#0078D4' : '#8A8886' } 
                            }}
                          >
                            {formData.submissionType === type && (
                              <CheckIcon sx={{ position: 'absolute', top: 12, right: 12, color: '#0078D4', fontSize: 20 }} />
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              {type === 'Idea' ? <IdeaIcon sx={{ fontSize: 32, color: formData.submissionType === type ? '#0078D4' : '#605E5C', mr: 2 }} /> : <ProposalIcon sx={{ fontSize: 32, color: formData.submissionType === type ? '#0078D4' : '#605E5C', mr: 2 }} />}
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>{type}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#605E5C' }}>
                              {type === 'Idea' ? 'Submit a new concept, suggestion, or innovative thought for review and potential development.' : 'Submit a structured plan or project for approval, including methodology and expected outcomes.'}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                    {errors.submissionType && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 2 }}>{errors.submissionType}</Typography>}
                  </Box>
                )}

                {/* Step 2 */}
                {activeStep === 1 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#323130' }}>Employee Name <span style={{ color: '#d13438' }}>*</span></Typography>
                      <MsTextField fullWidth placeholder="Enter your full name" value={formData.name} onChange={e => handleChange('name', e.target.value)} error={!!errors.name} helperText={errors.name} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#323130' }}>Date of Birth <span style={{ color: '#d13438' }}>*</span></Typography>
                      <MsTextField fullWidth type="date" value={formData.dob} onChange={e => handleChange('dob', e.target.value)} error={!!errors.dob} helperText={errors.dob} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#323130' }}>Employee Code <span style={{ color: '#d13438' }}>*</span></Typography>
                      <MsTextField fullWidth placeholder="e.g. EMP-1029" value={formData.employeeCode} onChange={e => handleChange('employeeCode', e.target.value)} error={!!errors.employeeCode} helperText={errors.employeeCode} />
                    </Grid>
                  </Grid>
                )}

                {/* Step 3 */}
                {activeStep === 2 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#323130' }}>Department <span style={{ color: '#d13438' }}>*</span></Typography>
                      <FormControl fullWidth error={!!errors.department}>
                        <MsSelect value={formData.department} onChange={e => handleChange('department', e.target.value)} displayEmpty>
                          <MenuItem value="" disabled>Select Department</MenuItem>
                          {DEPARTMENTS.map(d => <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>)}
                        </MsSelect>
                        {errors.department && <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>{errors.department}</Typography>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: !formData.department ? '#A19F9D' : '#323130' }}>Sub Department {subDepts.length > 0 && <span style={{ color: '#d13438' }}>*</span>}</Typography>
                      <FormControl fullWidth error={!!errors.subDepartment} disabled={!formData.department || subDepts.length === 0}>
                        <MsSelect value={formData.subDepartment} onChange={e => handleChange('subDepartment', e.target.value)} displayEmpty sx={{ bgcolor: (!formData.department || subDepts.length === 0) ? '#F3F2F1' : '#ffffff' }}>
                          <MenuItem value="" disabled>{!formData.department ? 'Select Department first' : subDepts.length === 0 ? 'No sub departments' : 'Select Sub Department'}</MenuItem>
                          {subDepts.map(d => <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>)}
                        </MsSelect>
                        {errors.subDepartment && <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>{errors.subDepartment}</Typography>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: !formData.subDepartment ? '#A19F9D' : '#323130' }}>Sub Sub Department {subSubDepts.length > 0 && <span style={{ color: '#d13438' }}>*</span>}</Typography>
                      <FormControl fullWidth error={!!errors.subSubDepartment} disabled={!formData.subDepartment || subSubDepts.length === 0}>
                        <MsSelect value={formData.subSubDepartment} onChange={e => handleChange('subSubDepartment', e.target.value)} displayEmpty sx={{ bgcolor: (!formData.subDepartment || subSubDepts.length === 0) ? '#F3F2F1' : '#ffffff' }}>
                          <MenuItem value="" disabled>{!formData.subDepartment ? 'Select Sub Department first' : subSubDepts.length === 0 ? 'No sub-sub departments' : 'Select Sub Sub Department'}</MenuItem>
                          {subSubDepts.map(d => <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>)}
                        </MsSelect>
                        {errors.subSubDepartment && <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>{errors.subSubDepartment}</Typography>}
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {/* Step 4 */}
                {activeStep === 3 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#323130' }}>Classification <span style={{ color: '#d13438' }}>*</span></Typography>
                    <FormControl component="fieldset" error={!!errors.classification} sx={{ width: '100%' }}>
                      <RadioGroup value={formData.classification} onChange={e => handleChange('classification', e.target.value)}>
                        <Grid container spacing={2}>
                          {CLASSIFICATIONS.map((cls) => (
                            <Grid item xs={12} sm={6} key={cls}>
                              <Paper elevation={0} sx={{ border: '1px solid', borderColor: formData.classification === cls ? '#0078D4' : '#C8C6C4', borderRadius: 1, bgcolor: formData.classification === cls ? '#F3F9FD' : '#ffffff', transition: 'all 0.15s ease-in-out', '&:hover': { borderColor: formData.classification === cls ? '#0078D4' : '#8A8886' } }}>
                                <FormControlLabel value={cls} control={<Radio sx={{ color: '#605E5C', '&.Mui-checked': { color: '#0078D4' } }} />} label={<Typography sx={{ fontWeight: 500, color: '#323130' }}>{cls}</Typography>} sx={{ width: '100%', m: 0, p: 1.5 }} />
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </RadioGroup>
                      {errors.classification && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{errors.classification}</Typography>}
                    </FormControl>
                  </Box>
                )}

                {/* Step 5 */}
                {activeStep === 4 && (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, bgcolor: '#FAFAFA', borderRadius: 1, border: '1px solid #EDEBE9' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#323130' }}>Reporting Manager</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#605E5C' }}>Name <span style={{ color: '#d13438' }}>*</span></Typography>
                        <MsTextField fullWidth placeholder="Manager's Name" value={formData.managerName} onChange={e => handleChange('managerName', e.target.value)} error={!!errors.managerName} helperText={errors.managerName} sx={{ mb: 3 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#605E5C' }}>Email <span style={{ color: '#d13438' }}>*</span></Typography>
                        <MsTextField fullWidth placeholder="manager@cubetech.com" type="email" value={formData.managerEmail} onChange={e => handleChange('managerEmail', e.target.value)} error={!!errors.managerEmail} helperText={errors.managerEmail} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, bgcolor: '#FAFAFA', borderRadius: 1, border: '1px solid #EDEBE9' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#323130' }}>Head of Department (HOD)</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#605E5C' }}>Name <span style={{ color: '#d13438' }}>*</span></Typography>
                        <MsTextField fullWidth placeholder="HOD's Name" value={formData.hodName} onChange={e => handleChange('hodName', e.target.value)} error={!!errors.hodName} helperText={errors.hodName} sx={{ mb: 3 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#605E5C' }}>Email <span style={{ color: '#d13438' }}>*</span></Typography>
                        <MsTextField fullWidth placeholder="hod@cubetech.com" type="email" value={formData.hodEmail} onChange={e => handleChange('hodEmail', e.target.value)} error={!!errors.hodEmail} helperText={errors.hodEmail} />
                      </Box>
                    </Grid>
                  </Grid>
                )}

                {/* Step 6 */}
                {activeStep === 5 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#323130' }}>Title <span style={{ color: '#d13438' }}>*</span></Typography>
                      <MsTextField fullWidth placeholder="Enter a descriptive title for your idea/proposal" value={formData.title} onChange={e => handleChange('title', e.target.value)} error={!!errors.title} helperText={errors.title} />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130' }}>Abstract <span style={{ color: '#d13438' }}>*</span></Typography>
                          <Typography variant="caption" sx={{ color: '#605E5C' }}>Include Introduction, Methodology, and Expected Benefits.</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: wordCount > 200 ? '#d13438' : '#605E5C' }}>
                          {wordCount} / 200 words
                        </Typography>
                      </Box>
                      <MsTextField fullWidth multiline rows={8} placeholder="Write your abstract here..." value={formData.abstract} onChange={e => handleChange('abstract', e.target.value)} error={!!errors.abstract} helperText={errors.abstract} />
                    </Grid>
                  </Grid>
                )}

                {/* Step 7 */}
                {activeStep === 6 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#323130' }}>Supporting Documents (Optional)</Typography>
                    <FileZone files={files} setFiles={setFiles} />
                  </Box>
                )}

              </CardContent>

              {/* Footer Actions */}
              <Box sx={{ p: 3, bgcolor: '#F3F2F1', borderTop: '1px solid #EDEBE9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button startIcon={<SaveIcon />} sx={{ color: '#605E5C', fontWeight: 600, textTransform: 'none' }} onClick={() => setSnack({ open: true, msg: 'Draft saved successfully.', type: 'success' })}>Save Draft</Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep > 0 && <MsButton variant="outlined" onClick={handleBack} sx={{ color: '#323130', borderColor: '#8A8886', '&:hover': { bgcolor: '#F3F2F1', borderColor: '#323130' } }}>Back</MsButton>}
                  {activeStep < STEPS.length - 1 ? (
                    <MsButton variant="contained" onClick={handleNext} sx={{ bgcolor: '#0078D4', '&:hover': { bgcolor: '#106EBE' } }}>Next</MsButton>
                  ) : (
                    <>
                      <MsButton variant="outlined" startIcon={<ViewIcon />} onClick={() => setPreviewOpen(true)} sx={{ borderColor: '#0078D4', color: '#0078D4', '&:hover': { bgcolor: '#F3F9FD', borderColor: '#0078D4' } }}>Preview</MsButton>
                      <MsButton variant="contained" startIcon={<SendIcon />} onClick={handleSubmit} sx={{ bgcolor: '#0078D4', '&:hover': { bgcolor: '#106EBE' } }}>Submit</MsButton>
                    </>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Right Column: Review Summary Panel */}
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <Card sx={{ borderRadius: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderBottom: '1px solid #EDEBE9' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#323130' }}>Review Summary</Typography>
                </Box>
                <CardContent sx={{ p: 3, maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
                  {renderSummaryItem('Submission Type', formData.submissionType)}
                  <Divider sx={{ my: 2 }} />
                  {renderSummaryItem('Employee Name', formData.name)}
                  {renderSummaryItem('Employee Code', formData.employeeCode)}
                  <Divider sx={{ my: 2 }} />
                  {renderSummaryItem('Department', DEPARTMENTS.find(d => d.id === formData.department)?.label)}
                  {renderSummaryItem('Classification', formData.classification)}
                  <Divider sx={{ my: 2 }} />
                  {renderSummaryItem('Title', formData.title)}
                  {renderSummaryItem('Attachments', files.length > 0 ? `${files.length} file(s)` : 'None')}
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, bgcolor: '#F3F2F1' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid #EDEBE9', bgcolor: '#ffffff' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Submission Preview</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
          <Grid container spacing={4}>
            <Grid item xs={12}><Typography variant="overline" sx={{ color: '#605E5C', fontWeight: 600 }}>Submission Details</Typography><Typography variant="h5" sx={{ fontWeight: 600, mt: 1, color: '#323130' }}>{formData.title || 'Untitled'}</Typography><Typography sx={{ color: '#0078D4', fontWeight: 600, mt: 0.5 }}>{formData.submissionType}</Typography></Grid>
            <Grid item xs={12}><Typography variant="overline" sx={{ color: '#605E5C', fontWeight: 600 }}>Abstract</Typography><Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap', color: '#323130' }}>{formData.abstract || 'No abstract provided.'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="overline" sx={{ color: '#605E5C', fontWeight: 600 }}>Employee Info</Typography><Typography variant="body2" sx={{ fontWeight: 600, mt: 1, color: '#323130' }}>{formData.name}</Typography><Typography variant="body2" sx={{ color: '#605E5C' }}>{formData.employeeCode}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="overline" sx={{ color: '#605E5C', fontWeight: 600 }}>Organization</Typography><Typography variant="body2" sx={{ fontWeight: 600, mt: 1, color: '#323130' }}>Dept: {DEPARTMENTS.find(d => d.id === formData.department)?.label || formData.department}</Typography><Typography variant="body2" sx={{ color: '#605E5C' }}>Class: {formData.classification}</Typography></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #EDEBE9', bgcolor: '#FAFAFA' }}>
          <MsButton onClick={() => setPreviewOpen(false)} sx={{ color: '#323130', fontWeight: 600 }}>Edit Details</MsButton>
          <MsButton variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#0078D4', fontWeight: 600, '&:hover': { bgcolor: '#106EBE' } }}>Confirm & Submit</MsButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.type} variant="filled" sx={{ borderRadius: 1, fontWeight: 600 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicForm;
