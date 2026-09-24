import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Chip, Slider, CircularProgress } from '@mui/material';
import { Send, CloudUpload, AttachFile, Chat, CheckCircle } from '@mui/icons-material';
import { formStore } from '../../store/formStore';
import { handleFileDownload } from '../../utils/fileUtils';

const ProgressUpdatesTab = ({ project, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [progress, setProgress] = useState(project?.projectDetails?.progressPercentage || 0);
  const [files, setFiles] = useState([]);
  const [posting, setPosting] = useState(false);

  const updates = project?.projectDetails?.updates || [];

  const handlePostUpdate = async () => {
    if (!title.trim() || !desc.trim()) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', desc);
      formData.append('progressPercentage', progress);
      files.forEach(f => formData.append('attachments', f));
      
      await formStore.addProjectUpdate(project.id, formData);
      
      // Trigger a re-fetch or state update
      // Since it's a sub-component, we should ideally trigger onUpdate or rely on store subscription
      // The parent OngoingProjectWorkspace relies on the store subscription which gets updated!
      // But we need to clear form:
      setTitle('');
      setDesc('');
      setFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1, bgcolor: '#F3F2F1' }}>
        <Typography variant="subtitle2" sx={{ color: '#323130', fontWeight: 600, mb: 2 }}>Post a New Project Update</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField size="small" fullWidth placeholder="Update Title" value={title} onChange={e => setTitle(e.target.value)} sx={{ bgcolor: '#fff' }} />
          </Grid>
          <Grid item xs={12}>
            <TextField size="small" fullWidth placeholder="Describe progress, blockers, or next steps..." value={desc} onChange={e => setDesc(e.target.value)} multiline minRows={3} sx={{ bgcolor: '#fff' }} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="caption" sx={{ color: '#605E5C', display: 'block', mb: 1 }}>Update Overall Progress ({progress}%)</Typography>
            <Box sx={{ px: 1 }}>
              <Slider value={progress} onChange={(e, val) => setProgress(val)} step={5} marks min={0} max={100} sx={{ color: '#0078D4' }} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <Button component="label" variant="outlined" startIcon={<CloudUpload />} sx={{ textTransform: 'none', color: '#605E5C', borderColor: '#EDEBE9', bgcolor: '#fff' }}>
              {files.length > 0 ? `${files.length} file(s)` : 'Attach Files'}
              <input type="file" hidden multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button variant="contained" endIcon={posting ? <CircularProgress size={20} color="inherit" /> : <Send />} sx={{ px: 4, bgcolor: '#0078D4', boxShadow: 'none', textTransform: 'none' }} onClick={handlePostUpdate} disabled={!title.trim() || !desc.trim() || posting}>
              {posting ? 'Posting...' : 'Post Update'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {updates.length > 0 ? (
          [...updates].reverse().map((update, idx) => (
            <Paper key={idx} sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#0078D4', fontSize: '0.875rem' }}>{(update.updatedBy || update.user || 'U').charAt(0)}</Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323130' }}>{update.title || 'Project Update'}</Typography>
                      {update.title?.includes('Meeting Completed') && (
                        <Chip label="Meeting Completed" size="small" icon={<CheckCircle fontSize="small" sx={{ color: '#10B981 !important' }} />} sx={{ bgcolor: '#ECFDF5', color: '#10B981', fontWeight: 600, height: 20, '& .MuiChip-label': { px: 1 } }} />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#605E5C' }}>{(update.updatedBy || update.user)} • {new Date(update.timestamp).toLocaleString()}</Typography>
                  </Box>
                </Box>
                {update.progressPercentage !== undefined && (
                  <Chip label={`${update.progressPercentage}% Progress`} size="small" sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 600 }} />
                )}
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#323130', pl: 5.5, mb: 2 }}>{update.description || update.text}</Typography>
              
              {update.attachments && update.attachments.length > 0 && (
                <Box sx={{ pl: 5.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {update.attachments.map((att, aIdx) => (
                    <Chip key={aIdx} icon={<AttachFile fontSize="small" />} label={att.filename} size="small" variant="outlined" onClick={() => handleFileDownload(att)} clickable sx={{ borderColor: '#EDEBE9', color: '#605E5C' }} />
                  ))}
                </Box>
              )}
            </Paper>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chat sx={{ fontSize: 40, color: '#C8C6C4', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#605E5C' }}>No updates posted yet.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProgressUpdatesTab;
