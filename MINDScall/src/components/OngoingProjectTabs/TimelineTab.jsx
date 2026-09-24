import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { History } from '@mui/icons-material';

const TimelineTab = ({ project }) => {
  const timeline = project?.timeline || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 4, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <History sx={{ color: '#0078D4', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Timeline History</Typography>
            <Typography variant="body2" sx={{ color: '#605E5C' }}>Complete audit trail of all project events and approvals.</Typography>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', ml: 2 }}>
          <Box sx={{ position: 'absolute', top: 10, bottom: 10, left: 7, width: 2, bgcolor: '#EDEBE9' }} />
          {timeline.length > 0 ? (
             [...timeline].reverse().map((event, idx) => (
               <Box key={idx} sx={{ position: 'relative', pl: 5, pb: 4 }}>
                 <Box sx={{ position: 'absolute', left: 0, top: 4, width: 16, height: 16, borderRadius: '50%', bgcolor: '#0078D4', border: '3px solid #fff', zIndex: 1, boxShadow: '0 0 0 1px #EDEBE9' }} />
                 <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#323130' }}>{event.stage}</Typography>
                 <Typography variant="caption" sx={{ color: '#605E5C', display: 'block', mb: 1 }}>
                   {new Date(event.timestamp).toLocaleString()} • Action by: {event.actionBy || event.actor}
                 </Typography>
                 {event.remarks && (
                   <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: '#F3F2F1', borderRadius: 1, color: '#323130', border: '1px solid #EDEBE9' }}>
                     {event.remarks}
                   </Typography>
                 )}
               </Box>
             ))
          ) : (
            <Typography variant="body2" sx={{ color: '#605E5C', pl: 3 }}>No timeline events found.</Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TimelineTab;
