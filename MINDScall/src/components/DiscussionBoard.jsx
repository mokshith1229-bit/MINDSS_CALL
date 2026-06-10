import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { Forum as ChatIcon, Send as SendIcon } from '@mui/icons-material';

const DiscussionBoard = ({ comments = [], onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #EEEEEE' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon fontSize="small" sx={{ color: '#546E7A' }} /> Remarks
        </Typography>
      </Box>

      <List sx={{ flex: 1, overflowY: 'auto', maxHeight: 300, p: 0 }}>
        {comments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#9E9E9E' }}>No comments yet. Start the discussion!</Typography>
          </Box>
        ) : (
          comments.map((comment, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 30, height: 30, bgcolor: '#2E7D32', fontSize: '0.75rem', fontWeight: 600 }}>
                    {comment.user.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121' }}>{comment.user}</Typography>
                      <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.65rem' }}>{comment.time}</Typography>
                    </Box>
                  }
                  secondary={<Typography variant="body2" sx={{ color: '#424242', whiteSpace: 'pre-wrap' }}>{comment.text}</Typography>}
                />
              </ListItem>
              {index < comments.length - 1 && <Divider component="li" sx={{ ml: 7 }} />}
            </React.Fragment>
          ))
        )}
      </List>

      <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderTop: '1px solid #EEEEEE', display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Avatar sx={{ width: 30, height: 30, bgcolor: '#1976D2', fontSize: '0.75rem', fontWeight: 600 }}>AT</Avatar>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Add internal comment or recommendation..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ bgcolor: '#FFF', '& .MuiInputBase-root': { fontSize: '0.85rem' } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              endIcon={<SendIcon sx={{ fontSize: 14 }} />}
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' }, fontSize: '0.7rem' }}
            >
              Post
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DiscussionBoard;
