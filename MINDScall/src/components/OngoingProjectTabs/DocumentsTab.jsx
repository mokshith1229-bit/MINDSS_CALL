import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Chip } from '@mui/material';
import { CloudUpload, AttachFile, Download, FolderOpen, Send } from '@mui/icons-material';
import { formStore } from '../../store/formStore';

const DocumentsTab = ({ project, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Aggregate documents from submission and updates
  const allDocs = [];
  
  if (project?.attachments) {
    project.attachments.forEach(att => {
      allDocs.push({
        name: att.originalname || att.filename || att.name || 'Submission Document',
        url: att.url || att.path,
        source: 'Original Submission',
        date: project.createdAt || new Date().toISOString(),
        size: att.size
      });
    });
  }

  if (project?.projectDetails?.updates) {
    project.projectDetails.updates.forEach(upd => {
      if (upd.attachments && upd.attachments.length > 0) {
        upd.attachments.forEach(att => {
          allDocs.push({
            name: att.originalname || att.filename || att.name || 'Update Document',
            url: att.url || att.path,
            source: `Update: ${upd.title || 'Untitled'}`,
            date: upd.timestamp,
            size: att.size
          });
        });
      }
    });
  }

  // Sort by date descending
  allDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleUpload = async () => {
    if (!title.trim() || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', `Document Upload: ${title}`);
      formData.append('description', 'Uploaded via Document Repository');
      formData.append('progressPercentage', project?.projectDetails?.progressPercentage || 0);
      files.forEach(f => formData.append('attachments', f));
      
      await formStore.addProjectUpdate(project.id, formData);
      
      setOpen(false);
      setTitle('');
      setFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FolderOpen sx={{ color: '#0078D4', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Document Repository</Typography>
              <Typography variant="body2" sx={{ color: '#605E5C' }}>Centralized storage for all project files, requirements, and reports.</Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setOpen(true)} sx={{ bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }}>
            Upload Document
          </Button>
        </Box>

        <TableContainer component={Box} sx={{ border: '1px solid #EDEBE9', borderRadius: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F3F2F1' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Upload Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Size</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allDocs.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#605E5C' }}>No documents found for this project.</TableCell></TableRow>
              ) : (
                allDocs.map((doc, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFile sx={{ color: '#605E5C', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0078D4', cursor: 'pointer' }} onClick={() => window.open(doc.url, '_blank')}>
                          {doc.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={doc.source} size="small" sx={{ bgcolor: '#F3F2F1', color: '#605E5C', fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Unknown'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => window.open(doc.url, '_blank')}><Download fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={open} onClose={() => !uploading && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #EDEBE9' }}>Upload Documents</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField label="Document Title / Category" size="small" fullWidth value={title} onChange={e => setTitle(e.target.value)} required />
            </Grid>
            <Grid item xs={12}>
              <Button component="label" variant="outlined" fullWidth sx={{ py: 3, borderStyle: 'dashed', borderColor: '#0078D4', color: '#0078D4', textTransform: 'none' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CloudUpload fontSize="large" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Click to select files</Typography>
                  {files.length > 0 && <Typography variant="caption" sx={{ color: '#605E5C' }}>{files.length} file(s) selected</Typography>}
                </Box>
                <input type="file" hidden multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
              </Button>
            </Grid>
            {files.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {files.map((f, i) => (
                    <Chip key={i} label={f.name} size="small" onDelete={() => setFiles(files.filter((_, idx) => idx !== i))} />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #EDEBE9' }}>
          <Button onClick={() => setOpen(false)} disabled={uploading} sx={{ textTransform: 'none', color: '#605E5C' }}>Cancel</Button>
          <Button variant="contained" endIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <Send />} onClick={handleUpload} disabled={!title.trim() || files.length === 0 || uploading} sx={{ textTransform: 'none', bgcolor: '#0078D4', boxShadow: 'none' }}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsTab;
