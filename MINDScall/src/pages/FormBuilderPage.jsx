import React, { useState, useCallback, useRef } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel,
  Radio, Chip, IconButton, Divider, LinearProgress, Stepper, Step,
  StepLabel, Tooltip, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper, Badge, Avatar, Stack,
  FormHelperText, InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  ManageAccounts as ManageIcon,
  Description as DescriptionIcon,
  AttachFile as AttachIcon,
  LightbulbOutlined as IdeaIcon,
  Assignment as ProposalIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
  RestartAlt as ResetIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Slideshow as PptIcon,
  Article as DocIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { id: 'engineering', label: 'Engineering & Technology' },
  { id: 'operations', label: 'Operations' },
  { id: 'finance', label: 'Finance & Accounting' },
  { id: 'hr', label: 'Human Resources' },
  { id: 'marketing', label: 'Marketing & Communications' },
  { id: 'it', label: 'Information Technology' },
  { id: 'quality', label: 'Quality Assurance' },
  { id: 'rnd', label: 'Research & Development' },
];

const SUB_DEPARTMENTS = {
  engineering: [
    { id: 'mechanical', label: 'Mechanical Engineering' },
    { id: 'electrical', label: 'Electrical Engineering' },
    { id: 'civil', label: 'Civil Engineering' },
    { id: 'chemical', label: 'Chemical Engineering' },
  ],
  operations: [
    { id: 'supply_chain', label: 'Supply Chain' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'maintenance', label: 'Maintenance' },
  ],
  finance: [
    { id: 'budgeting', label: 'Budgeting & Planning' },
    { id: 'accounts', label: 'Accounts & Payables' },
    { id: 'treasury', label: 'Treasury' },
    { id: 'audit', label: 'Internal Audit' },
  ],
  hr: [
    { id: 'talent', label: 'Talent Acquisition' },
    { id: 'learning', label: 'Learning & Development' },
    { id: 'compensation', label: 'Compensation & Benefits' },
    { id: 'employee_relations', label: 'Employee Relations' },
  ],
  marketing: [
    { id: 'digital', label: 'Digital Marketing' },
    { id: 'brand', label: 'Brand Management' },
    { id: 'pr', label: 'Public Relations' },
    { id: 'events', label: 'Events & Campaigns' },
  ],
  it: [
    { id: 'infrastructure', label: 'IT Infrastructure' },
    { id: 'software', label: 'Software Development' },
    { id: 'security', label: 'Cybersecurity' },
    { id: 'support', label: 'IT Support' },
  ],
  quality: [
    { id: 'qa_testing', label: 'QA Testing' },
    { id: 'compliance', label: 'Compliance & Standards' },
    { id: 'process_audit', label: 'Process Audit' },
    { id: 'certifications', label: 'Certifications' },
  ],
  rnd: [
    { id: 'product_research', label: 'Product Research' },
    { id: 'innovation_lab', label: 'Innovation Lab' },
    { id: 'data_science', label: 'Data Science' },
    { id: 'prototype', label: 'Prototyping & Testing' },
  ],
};

const SUB_SUB_DEPARTMENTS = {
  mechanical: [
    { id: 'design', label: 'Design Engineering' },
    { id: 'simulation', label: 'Simulation & Analysis' },
    { id: 'tooling', label: 'Tooling' },
  ],
  electrical: [
    { id: 'power', label: 'Power Systems' },
    { id: 'instrumentation', label: 'Instrumentation' },
    { id: 'automation_ctrl', label: 'Automation & Control' },
  ],
  supply_chain: [
    { id: 'procurement', label: 'Procurement' },
    { id: 'inventory', label: 'Inventory Management' },
    { id: 'vendor_mgmt', label: 'Vendor Management' },
  ],
  manufacturing: [
    { id: 'production', label: 'Production Planning' },
    { id: 'lean', label: 'Lean Manufacturing' },
    { id: 'assembly', label: 'Assembly Operations' },
  ],
  software: [
    { id: 'frontend', label: 'Frontend Development' },
    { id: 'backend', label: 'Backend Development' },
    { id: 'devops', label: 'DevOps & CI/CD' },
  ],
  digital: [
    { id: 'seo', label: 'SEO & Content' },
    { id: 'social', label: 'Social Media' },
    { id: 'analytics', label: 'Analytics & Reporting' },
  ],
  talent: [
    { id: 'campus', label: 'Campus Recruitment' },
    { id: 'lateral', label: 'Lateral Hiring' },
    { id: 'executive', label: 'Executive Search' },
  ],
  innovation_lab: [
    { id: 'ideation', label: 'Ideation Hub' },
    { id: 'poc', label: 'Proof of Concept' },
    { id: 'incubation', label: 'Incubation' },
  ],
};

const PROCESS_PRODUCT_OPTIONS = [
  { value: 'process_development', label: 'Process Development' },
  { value: 'product_development', label: 'Product Development' },
];

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
};

const ABSTRACT_MAX_WORDS = 200;

const SECTION_STEPS = [
  { label: 'Submission Type', icon: <IdeaIcon /> },
  { label: 'Basic Info', icon: <PersonIcon /> },
  { label: 'Organization', icon: <BusinessIcon /> },
  { label: 'Classification', icon: <CategoryIcon /> },
  { label: 'Management', icon: <ManageIcon /> },
  { label: 'Submission', icon: <DescriptionIcon /> },
  { label: 'Attachments', icon: <AttachIcon /> },
];

// ─── Initial Form State ───────────────────────────────────────────────────────
const initialForm = {
  submissionType: '',
  name: '',
  dob: '',
  employeeCode: '',
  department: '',
  subDepartment: '',
  subSubDepartment: '',
  processProduct: '',
  reportingManagerName: '',
  reportingManagerEmail: '',
  hodName: '',
  hodEmail: '',
  title: '',
  introduction: '',
  methodology: '',
  benefits: '',
  attachments: [],
};

const initialErrors = {};

// ─── Helper: word count ───────────────────────────────────────────────────────
const countWords = (text) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const combinedAbstract = (form) =>
  [form.introduction, form.methodology, form.benefits].join(' ');

// ─── File Icon ────────────────────────────────────────────────────────────────
const getFileIcon = (name) => {
  const ext = name?.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <PdfIcon sx={{ color: '#E53935' }} />;
  if (ext === 'docx' || ext === 'doc') return <DocIcon sx={{ color: '#1565C0' }} />;
  if (ext === 'xlsx' || ext === 'xls') return <ExcelIcon sx={{ color: '#2E7D32' }} />;
  if (ext === 'pptx' || ext === 'ppt') return <PptIcon sx={{ color: '#E65100' }} />;
  return <FileIcon sx={{ color: '#546E7A' }} />;
};

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
const SectionCard = ({ title, subtitle, icon, children, accentColor = '#2E7D32', stepNumber }) => (
  <Card
    sx={{
      mb: 3,
      borderRadius: 3,
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      overflow: 'visible',
      position: 'relative',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: -14,
        left: 24,
        bgcolor: accentColor,
        color: '#fff',
        borderRadius: 2,
        px: 2,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        boxShadow: `0 4px 12px ${accentColor}50`,
        zIndex: 1,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 16 } })}
      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: 0.5 }}>
        {stepNumber && `${stepNumber}. `}{title}
      </Typography>
    </Box>
    <CardContent sx={{ pt: 4, px: 3, pb: 3 }}>
      {subtitle && (
        <Typography variant="body2" sx={{ color: '#78909C', mb: 2.5, fontSize: '0.82rem' }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </CardContent>
  </Card>
);

// ─── Word Counter Bar ─────────────────────────────────────────────────────────
const WordCountBar = ({ text, max }) => {
  const count = countWords(text);
  const pct = Math.min((count / max) * 100, 100);
  const over = count > max;
  const color = over ? '#C62828' : count > max * 0.85 ? '#F57C00' : '#2E7D32';
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: over ? '#C62828' : '#78909C', fontWeight: 600 }}>
          {over ? `⚠ Exceeded by ${count - max} words` : `${count} / ${max} words`}
        </Typography>
        <Typography variant="caption" sx={{ color: '#B0BEC5' }}>Max {max} words</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 5,
          borderRadius: 3,
          bgcolor: '#E0E0E0',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
    </Box>
  );
};

// ─── Preview Dialog ───────────────────────────────────────────────────────────
const PreviewDialog = ({ open, onClose, form }) => {
  const rows = [
    { label: 'Submission Type', value: form.submissionType === 'idea' ? '💡 Idea' : form.submissionType === 'proposal' ? '📋 Proposal' : '—' },
    { label: 'Name', value: form.name || '—' },
    { label: 'Date of Birth', value: form.dob || '—' },
    { label: 'Employee Code', value: form.employeeCode || '—' },
    { label: 'Department', value: DEPARTMENTS.find(d => d.id === form.department)?.label || '—' },
    { label: 'Sub Department', value: (SUB_DEPARTMENTS[form.department] || []).find(d => d.id === form.subDepartment)?.label || '—' },
    { label: 'Sub Sub Department', value: (SUB_SUB_DEPARTMENTS[form.subDepartment] || []).find(d => d.id === form.subSubDepartment)?.label || '—' },
    { label: 'Process / Product', value: PROCESS_PRODUCT_OPTIONS.find(o => o.value === form.processProduct)?.label || '—' },
    { label: 'Reporting Manager', value: form.reportingManagerName || '—' },
    { label: 'Reporting Manager Email', value: form.reportingManagerEmail || '—' },
    { label: 'HOD Name', value: form.hodName || '—' },
    { label: 'HOD Email', value: form.hodEmail || '—' },
    { label: 'Title', value: form.title || '—' },
    { label: 'Introduction', value: form.introduction || '—' },
    { label: 'Methodology', value: form.methodology || '—' },
    { label: 'Benefits', value: form.benefits || '—' },
    { label: 'Attachments', value: form.attachments.length ? form.attachments.map(f => f.name).join(', ') : 'None' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PreviewIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Form Preview</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
            borderRadius: 2,
            p: 2,
            mb: 3,
            border: '1px solid #C8E6C9',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#2E7D32', fontWeight: 700 }}>
            MINDS — Enterprise Innovation Platform · Submission Preview
          </Typography>
          <Typography variant="caption" sx={{ color: '#558B2F' }}>
            Please review your submission carefully before submitting.
          </Typography>
        </Box>
        <Grid container spacing={0}>
          {rows.map((row, i) => (
            <Grid item xs={12} key={i}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  py: 1.2,
                  px: 1,
                  borderBottom: '1px solid #F0F0F0',
                  '&:hover': { bgcolor: '#FAFAFA' },
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: '#546E7A',
                    minWidth: 200,
                    fontSize: '0.82rem',
                  }}
                >
                  {row.label}
                </Typography>
                <Typography variant="body2" sx={{ color: '#212121', flex: 1, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                  {row.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" startIcon={<CloseIcon />}>
          Close Preview
        </Button>
        <Button variant="contained" startIcon={<SendIcon />} sx={{ background: 'linear-gradient(135deg, #2E7D32, #388E3C)' }}>
          Submit Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const FormBuilderPage = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Progress calculation
  const totalFields = 16;
  const filledFields = [
    form.submissionType, form.name, form.dob, form.employeeCode,
    form.department, form.subDepartment, form.processProduct,
    form.reportingManagerName, form.reportingManagerEmail,
    form.hodName, form.hodEmail, form.title,
    form.introduction, form.methodology, form.benefits,
  ].filter(Boolean).length + (form.attachments.length > 0 ? 1 : 0);
  const progress = Math.round((filledFields / totalFields) * 100);

  const setField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      // Cascade resets
      if (key === 'department') { next.subDepartment = ''; next.subSubDepartment = ''; }
      if (key === 'subDepartment') { next.subSubDepartment = ''; }
      return next;
    });
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  // Dropzone
  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      setSnackbar({ open: true, message: 'Some files were rejected. Only PDF, DOCX, XLSX, PPTX allowed.', severity: 'warning' });
    }
    if (accepted.length > 0) {
      setForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...accepted.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }))],
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
  });

  const removeFile = (index) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  // Validation
  const validate = () => {
    const e = {};
    if (!form.submissionType) e.submissionType = 'Please select a submission type.';
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.dob) e.dob = 'Date of Birth is required.';
    if (!form.employeeCode.trim()) e.employeeCode = 'Employee Code is required.';
    if (!form.department) e.department = 'Department is required.';
    if (!form.subDepartment) e.subDepartment = 'Sub Department is required.';
    if (!form.processProduct) e.processProduct = 'Please select a classification.';
    if (!form.reportingManagerName.trim()) e.reportingManagerName = 'Reporting Manager Name is required.';
    if (!form.reportingManagerEmail.trim()) e.reportingManagerEmail = 'Reporting Manager Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reportingManagerEmail)) e.reportingManagerEmail = 'Enter a valid email.';
    if (!form.hodName.trim()) e.hodName = 'HOD Name is required.';
    if (!form.hodEmail.trim()) e.hodEmail = 'HOD Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.hodEmail)) e.hodEmail = 'Enter a valid email.';
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.introduction.trim()) e.introduction = 'Introduction is required.';
    if (!form.methodology.trim()) e.methodology = 'Methodology is required.';
    if (!form.benefits.trim()) e.benefits = 'Benefits section is required.';
    const totalWords = countWords(combinedAbstract(form));
    if (totalWords > ABSTRACT_MAX_WORDS) e.abstract = `Abstract exceeds ${ABSTRACT_MAX_WORDS} words (currently ${totalWords} words). Please reduce content.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const payload = new FormData();
        payload.append('answers', JSON.stringify(form));
        payload.append('submitterEmail', form.reportingManagerEmail || '');
        form.attachments.forEach(f => payload.append('attachments', f));

        const res = await fetch(`${import.meta.env.VITE_API_URL}/public/forms/innovation-form/submit`, {
          method: 'POST',
          body: payload
        });

        if (res.ok) {
          setSubmitSuccess(true);
          setSnackbar({ open: true, message: '✅ Submission successful! Your innovation has been recorded.', severity: 'success' });
        } else {
          const errData = await res.json();
          setSnackbar({ open: true, message: errData.error || 'Submission failed.', severity: 'error' });
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Server error. Please try again.', severity: 'error' });
      }
    } else {
      setSnackbar({ open: true, message: 'Please fix validation errors before submitting.', severity: 'error' });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    setSnackbar({ open: true, message: '💾 Draft saved successfully!', severity: 'info' });
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitSuccess(false);
    setSnackbar({ open: true, message: 'Form has been reset.', severity: 'warning' });
  };

  const abstractWordCount = countWords(combinedAbstract(form));
  const abstractOver = abstractWordCount > ABSTRACT_MAX_WORDS;

  const subDepts = SUB_DEPARTMENTS[form.department] || [];
  const subSubDepts = SUB_SUB_DEPARTMENTS[form.subDepartment] || [];

  return (
    <Box>
      {/* ── Page Header ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""', position: 'absolute', top: -50, right: -50,
            width: 220, height: 220, borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
          },
          '&::before': {
            content: '""', position: 'absolute', bottom: -70, right: 100,
            width: 160, height: 160, borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.04)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, p: 0.75,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <DescriptionIcon sx={{ color: '#fff', fontSize: 22 }} />
              </Box>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>
                Innovation Submission Form
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', ml: 0.5 }}>
              MINDS — Cube Highways Innovation Centre · Submit your ideas and proposals for review
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['Enterprise Grade', 'Secure', 'Tracked'].map(tag => (
              <Chip
                key={tag} label={tag} size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.2)' }}
              />
            ))}
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              Form Completion
            </Typography>
            <Typography variant="caption" sx={{ color: '#A5D6A7', fontWeight: 800 }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8, borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.15)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#A5D6A7', borderRadius: 4,
                background: 'linear-gradient(90deg, #A5D6A7, #69F0AE)',
              },
            }}
          />
        </Box>
      </Box>

      {/* ── Section Steps ── */}
      <Card sx={{ mb: 3, borderRadius: 3, overflow: 'visible' }}>
        <CardContent sx={{ py: 2.5, px: 3 }}>
          <Stepper alternativeLabel sx={{ '& .MuiStepConnector-line': { borderColor: '#E0E0E0' } }}>
            {SECTION_STEPS.map((step, index) => (
              <Step key={step.label} active>
                <StepLabel
                  StepIconComponent={() => (
                    <Avatar
                      sx={{
                        width: 32, height: 32,
                        bgcolor: index === 0 ? '#2E7D32' : '#E8F5E9',
                        color: index === 0 ? '#fff' : '#2E7D32',
                        fontSize: 14,
                      }}
                    >
                      {React.cloneElement(step.icon, { sx: { fontSize: 16 } })}
                    </Avatar>
                  )}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.68rem', color: '#546E7A' }}>
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════
          SECTION 0 — SUBMISSION TYPE
      ══════════════════════════════════════════════════ */}
      <SectionCard
        title="Submission Type"
        subtitle="Select whether you are submitting an Idea or a Proposal"
        icon={<IdeaIcon />}
        accentColor="#1565C0"
        stepNumber="0"
      >
        <RadioGroup
          row
          value={form.submissionType}
          onChange={(e) => setField('submissionType', e.target.value)}
        >
          <Grid container spacing={2}>
            {[
              {
                value: 'idea',
                label: 'Idea',
                desc: 'A creative concept or innovative thought that could improve processes, products or systems.',
                icon: <IdeaIcon sx={{ fontSize: 36, color: form.submissionType === 'idea' ? '#1565C0' : '#90A4AE' }} />,
                color: '#1565C0',
              },
              {
                value: 'proposal',
                label: 'Proposal',
                desc: 'A structured plan with defined objectives, methodology, timeline and expected outcomes.',
                icon: <ProposalIcon sx={{ fontSize: 36, color: form.submissionType === 'proposal' ? '#6A1B9A' : '#90A4AE' }} />,
                color: '#6A1B9A',
              },
            ].map((opt) => (
              <Grid item xs={12} sm={6} key={opt.value}>
                <FormControlLabel
                  value={opt.value}
                  control={<Radio sx={{ display: 'none' }} />}
                  label={
                    <Paper
                      elevation={0}
                      onClick={() => setField('submissionType', opt.value)}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        cursor: 'pointer',
                        border: `2px solid ${form.submissionType === opt.value ? opt.color : '#E0E0E0'}`,
                        background: form.submissionType === opt.value
                          ? `linear-gradient(135deg, ${opt.color}08 0%, ${opt.color}15 100%)`
                          : '#FAFAFA',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          border: `2px solid ${opt.color}80`,
                          background: `${opt.color}08`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${opt.color}20`,
                        },
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {form.submissionType === opt.value && (
                        <CheckIcon
                          sx={{
                            position: 'absolute', top: 10, right: 10,
                            color: opt.color, fontSize: 20,
                          }}
                        />
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{
                          p: 1.2, borderRadius: 2,
                          bgcolor: form.submissionType === opt.value ? `${opt.color}18` : '#F5F5F5',
                          flexShrink: 0,
                        }}>
                          {opt.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 800, color: form.submissionType === opt.value ? opt.color : '#37474F', mb: 0.5 }}
                          >
                            {opt.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#78909C', lineHeight: 1.5 }}>
                            {opt.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
        {errors.submissionType && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2, py: 0.5 }}>{errors.submissionType}</Alert>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════════════════
          SECTION 1 — BASIC INFORMATION
      ══════════════════════════════════════════════════ */}
      <SectionCard
        title="Basic Information"
        subtitle="Personal details of the submitter"
        icon={<PersonIcon />}
        accentColor="#2E7D32"
        stepNumber="1"
      >
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Full Name *"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="e.g. Rahul Sharma"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ fontSize: 18, color: '#90A4AE' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Date of Birth *"
              type="date"
              value={form.dob}
              onChange={(e) => setField('dob', e.target.value)}
              error={!!errors.dob}
              helperText={errors.dob}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().split('T')[0] }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Employee Code *"
              value={form.employeeCode}
              onChange={(e) => setField('employeeCode', e.target.value)}
              error={!!errors.employeeCode}
              helperText={errors.employeeCode}
              placeholder="e.g. EMP-2024-0042"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="caption" sx={{ color: '#90A4AE', fontWeight: 700 }}>#</Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — ORGANIZATION DETAILS
      ══════════════════════════════════════════════════ */}
      <SectionCard
        title="Organization Details"
        subtitle="Your departmental hierarchy — selections cascade automatically"
        icon={<BusinessIcon />}
        accentColor="#0277BD"
        stepNumber="2"
      >
        <Grid container spacing={2.5}>
          {/* Department */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth error={!!errors.department}>
              <InputLabel>Department *</InputLabel>
              <Select
                value={form.department}
                onChange={(e) => setField('department', e.target.value)}
                label="Department *"
              >
                {DEPARTMENTS.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
                ))}
              </Select>
              {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Sub Department */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth error={!!errors.subDepartment} disabled={!form.department}>
              <InputLabel>Sub Department *</InputLabel>
              <Select
                value={form.subDepartment}
                onChange={(e) => setField('subDepartment', e.target.value)}
                label="Sub Department *"
              >
                {subDepts.length === 0 ? (
                  <MenuItem disabled value="">Select Department first</MenuItem>
                ) : (
                  subDepts.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
                  ))
                )}
              </Select>
              {errors.subDepartment
                ? <FormHelperText>{errors.subDepartment}</FormHelperText>
                : !form.department && <FormHelperText>Select a Department first</FormHelperText>
              }
            </FormControl>
          </Grid>

          {/* Sub Sub Department */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth disabled={!form.subDepartment}>
              <InputLabel>Sub Sub Department</InputLabel>
              <Select
                value={form.subSubDepartment}
                onChange={(e) => setField('subSubDepartment', e.target.value)}
                label="Sub Sub Department"
              >
                {subSubDepts.length === 0 ? (
                  <MenuItem disabled value="">No sub-units available</MenuItem>
                ) : (
                  subSubDepts.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
                  ))
                )}
              </Select>
              {!form.subDepartment && <FormHelperText>Select Sub Department first</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>

        {/* Cascade hint */}
        {form.department && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ fontSize: 14, color: '#0277BD' }} />
            <Typography variant="caption" sx={{ color: '#0277BD' }}>
              Cascading based on: <strong>{DEPARTMENTS.find(d => d.id === form.department)?.label}</strong>
              {form.subDepartment && ` → ${subDepts.find(d => d.id === form.subDepartment)?.label}`}
            </Typography>
          </Box>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — CLASSIFICATION
      ══════════════════════════════════════════════════ */}
      <SectionCard
        title="Classification"
        subtitle="Categorize your submission under the appropriate initiative type"
        icon={<CategoryIcon />}
        accentColor="#E65100"
        stepNumber="3"
      >
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={8} md={6}>
            <FormControl fullWidth error={!!errors.processProduct}>
              <InputLabel>Process / Product Development *</InputLabel>
              <Select
                value={form.processProduct}
                onChange={(e) => setField('processProduct', e.target.value)}
                label="Process / Product Development *"
              >
                {PROCESS_PRODUCT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        bgcolor: {
                          process_development: '#2E7D32',
                          product_development: '#1565C0',
                        }[opt.value] || '#90A4AE',
                      }} />
                      {opt.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.processProduct && <FormHelperText>{errors.processProduct}</FormHelperText>}
            </FormControl>
          </Grid>
          {form.processProduct && (
            <Grid item xs={12} sm={4} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={PROCESS_PRODUCT_OPTIONS.find(o => o.value === form.processProduct)?.label}
                sx={{
                  bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700,
                  border: '1px solid #A5D6A7', fontSize: '0.82rem',
                }}
                icon={<CheckIcon sx={{ color: '#2E7D32 !important', fontSize: '16px !important' }} />}
              />
            </Grid>
          )}
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — MANAGEMENT INFORMATION
      ══════════════════════════════════════════════════ */}
      <SectionCard
        title="Management Information"
        subtitle="Reporting chain details for review and approval routing"
        icon={<ManageIcon />}
        accentColor="#6A1B9A"
        stepNumber="4"
      >
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6A1B9A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Reporting Manager
            </Typography>
            <Divider sx={{ mb: 2, mt: 0.5, borderColor: '#EDE7F6' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reporting Manager Name *"
              value={form.reportingManagerName}
              onChange={(e) => setField('reportingManagerName', e.target.value)}
              error={!!errors.reportingManagerName}
              helperText={errors.reportingManagerName}
              placeholder="e.g. Amit Kumar"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reporting Manager Email *"
              type="email"
              value={form.reportingManagerEmail}
              onChange={(e) => setField('reportingManagerEmail', e.target.value)}
              error={!!errors.reportingManagerEmail}
              helperText={errors.reportingManagerEmail}
              placeholder="e.g. amit.kumar@cubetech.in"
            />
          </Grid>

          <Grid item xs={12} sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6A1B9A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Head of Department (HOD)
            </Typography>
            <Divider sx={{ mb: 2, mt: 0.5, borderColor: '#EDE7F6' }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="HOD Name *"
              value={form.hodName}
              onChange={(e) => setField('hodName', e.target.value)}
              error={!!errors.hodName}
              helperText={errors.hodName}
              placeholder="e.g. Priya Singh"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="HOD Email *"
              type="email"
              value={form.hodEmail}
              onChange={(e) => setField('hodEmail', e.target.value)}
              error={!!errors.hodEmail}
              helperText={errors.hodEmail}
              placeholder="e.g. priya.singh@cubetech.in"
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — SUBMISSION DETAILS
      ══════════════════════════════════════════════════ */}
      <SectionCard
        title="Submission Details"
        subtitle={`Describe your submission clearly. Abstract is limited to ${ABSTRACT_MAX_WORDS} words total.`}
        icon={<DescriptionIcon />}
        accentColor="#00838F"
        stepNumber="5"
      >
        {/* Title */}
        <TextField
          fullWidth
          label="Submission Title *"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          error={!!errors.title}
          helperText={errors.title || 'A concise, descriptive title for your submission'}
          placeholder="e.g. Automated Quality Inspection Using Computer Vision"
          sx={{ mb: 3 }}
        />

        {/* Abstract Word Count Summary */}
        {abstractOver && (
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{ mb: 2.5, borderRadius: 2 }}
          >
            <strong>Abstract word limit exceeded!</strong> You have used {abstractWordCount} words out of {ABSTRACT_MAX_WORDS} allowed. Please shorten your content below.
          </Alert>
        )}

        {/* Global word count bar */}
        <Box
          sx={{
            bgcolor: abstractOver ? '#FFF3F3' : '#F0F7F0',
            border: `1px solid ${abstractOver ? '#FFCDD2' : '#C8E6C9'}`,
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: abstractOver ? '#C62828' : '#2E7D32' }}>
              📝 Total Abstract Word Count
            </Typography>
            <Chip
              label={`${abstractWordCount} / ${ABSTRACT_MAX_WORDS}`}
              size="small"
              sx={{
                bgcolor: abstractOver ? '#FFEBEE' : '#E8F5E9',
                color: abstractOver ? '#C62828' : '#2E7D32',
                fontWeight: 800,
                fontSize: '0.75rem',
              }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min((abstractWordCount / ABSTRACT_MAX_WORDS) * 100, 100)}
            sx={{
              height: 8, borderRadius: 4,
              bgcolor: '#E0E0E0',
              '& .MuiLinearProgress-bar': {
                bgcolor: abstractOver ? '#C62828' : abstractWordCount > 160 ? '#F57C00' : '#2E7D32',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Introduction */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 4, height: 18, bgcolor: '#00838F', borderRadius: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00838F' }}>
              Introduction
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Introduction *"
            value={form.introduction}
            onChange={(e) => setField('introduction', e.target.value)}
            error={!!errors.introduction}
            helperText={errors.introduction}
            placeholder="Provide background context and define the problem statement..."
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FAFAFA' } }}
          />
          <WordCountBar text={form.introduction} max={Math.floor(ABSTRACT_MAX_WORDS * 0.35)} />
        </Box>

        {/* Methodology */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 4, height: 18, bgcolor: '#0277BD', borderRadius: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0277BD' }}>
              Methodology
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Methodology *"
            value={form.methodology}
            onChange={(e) => setField('methodology', e.target.value)}
            error={!!errors.methodology}
            helperText={errors.methodology}
            placeholder="Describe the approach, steps, and tools you plan to use..."
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FAFAFA' } }}
          />
          <WordCountBar text={form.methodology} max={Math.floor(ABSTRACT_MAX_WORDS * 0.4)} />
        </Box>

        {/* Benefits */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 4, height: 18, bgcolor: '#2E7D32', borderRadius: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32' }}>
              Benefits
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Benefits *"
            value={form.benefits}
            onChange={(e) => setField('benefits', e.target.value)}
            error={!!errors.benefits}
            helperText={errors.benefits}
            placeholder="Explain the expected outcomes, ROI, and organizational impact..."
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FAFAFA' } }}
          />
          <WordCountBar text={form.benefits} max={Math.floor(ABSTRACT_MAX_WORDS * 0.25)} />
        </Box>

        {errors.abstract && (
          <Alert severity="error" sx={{ mt: 2.5, borderRadius: 2 }}>{errors.abstract}</Alert>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — ATTACHMENTS
      ══════════════════════════════════════════════════ */}
      <SectionCard
        title="Attachments"
        subtitle="Upload supporting documents (PDF, DOCX, XLSX, PPTX)"
        icon={<AttachIcon />}
        accentColor="#37474F"
        stepNumber="6"
      >
        {/* Dropzone */}
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? '#2E7D32' : '#B0BEC5'}`,
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? '#E8F5E9' : '#FAFAFA',
            transition: 'all 0.25s ease',
            '&:hover': {
              border: '2px dashed #2E7D32',
              bgcolor: '#F1F8E9',
              transform: 'scale(1.005)',
            },
            mb: 3,
          }}
        >
          <input {...getInputProps()} />
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '50%',
              bgcolor: isDragActive ? '#C8E6C9' : '#ECEFF1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
              transition: 'all 0.25s',
            }}
          >
            <UploadIcon sx={{ fontSize: 32, color: isDragActive ? '#2E7D32' : '#90A4AE' }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDragActive ? '#2E7D32' : '#546E7A', mb: 0.5 }}>
            {isDragActive ? 'Drop files here...' : 'Drag & Drop files here'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#90A4AE', mb: 2 }}>
            or click to browse your computer
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'PDF', color: '#FFEBEE', text: '#C62828' },
              { label: 'DOCX', color: '#E3F2FD', text: '#1565C0' },
              { label: 'XLSX', color: '#E8F5E9', text: '#2E7D32' },
              { label: 'PPTX', color: '#FFF3E0', text: '#E65100' },
            ].map(f => (
              <Chip
                key={f.label}
                label={f.label}
                size="small"
                sx={{ bgcolor: f.color, color: f.text, fontWeight: 700, fontSize: '0.72rem' }}
              />
            ))}
          </Box>
        </Box>

        {/* File List */}
        {form.attachments.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#37474F', mb: 1.5 }}>
              Attached Files ({form.attachments.length})
            </Typography>
            <Stack spacing={1}>
              {form.attachments.map((file, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    p: 1.5, borderRadius: 2,
                    border: '1px solid #E0E0E0',
                    '&:hover': { bgcolor: '#F5F5F5', borderColor: '#BDBDBD' },
                    transition: 'all 0.15s',
                  }}
                >
                  <Box sx={{
                    p: 1, borderRadius: 1.5,
                    bgcolor: '#F5F5F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {getFileIcon(file.name)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#37474F' }} noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#90A4AE' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                  <Chip
                    label={file.name.split('.').pop()?.toUpperCase()}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: '#ECEFF1', color: '#546E7A' }}
                  />
                  <Tooltip title="Remove file">
                    <IconButton
                      size="small"
                      onClick={() => removeFile(index)}
                      sx={{ '&:hover': { color: '#C62828', bgcolor: '#FFEBEE' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════════════════
          ACTION BUTTONS
      ══════════════════════════════════════════════════ */}
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            {/* Left: Reset */}
            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={handleReset}
              sx={{
                borderColor: '#CFD8DC', color: '#546E7A',
                '&:hover': { borderColor: '#C62828', color: '#C62828', bgcolor: '#FFEBEE' },
              }}
            >
              Reset Form
            </Button>

            {/* Right: Actions */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveDraft}
                sx={{ borderColor: '#0277BD', color: '#0277BD', '&:hover': { bgcolor: '#E3F2FD' } }}
              >
                Save Draft
              </Button>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => setPreviewOpen(true)}
                sx={{ borderColor: '#6A1B9A', color: '#6A1B9A', '&:hover': { bgcolor: '#F3E5F5' } }}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                sx={{
                  background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                  boxShadow: '0 4px 14px rgba(46,125,50,0.4)',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1B5E20 0%, #1B5E20 100%)',
                    boxShadow: '0 6px 18px rgba(46,125,50,0.5)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>

          {/* Completion bar */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F0F0F0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600 }}>
                Overall Completion: {progress}%
              </Typography>
              <Typography variant="caption" sx={{ color: progress === 100 ? '#2E7D32' : '#F57C00', fontWeight: 700 }}>
                {progress === 100 ? '✅ Ready to Submit' : `${totalFields - filledFields} fields remaining`}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6, borderRadius: 3,
                bgcolor: '#ECEFF1',
                '& .MuiLinearProgress-bar': {
                  bgcolor: progress === 100 ? '#2E7D32' : progress > 60 ? '#66BB6A' : '#FF9800',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════
          PREVIEW DIALOG
      ══════════════════════════════════════════════════ */}
      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        form={form}
      />

      {/* ══════════════════════════════════════════════════
          SNACKBAR
      ══════════════════════════════════════════════════ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          variant="filled"
          sx={{ borderRadius: 2, boxShadow: '0 6px 24px rgba(0,0,0,0.18)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormBuilderPage;
