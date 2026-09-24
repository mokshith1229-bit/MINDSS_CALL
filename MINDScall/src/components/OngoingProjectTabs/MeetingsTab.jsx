import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Event } from '@mui/icons-material';

const MeetingsTab = ({ project }) => {
  const meetings = project?.projectDetails?.meetings || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, border: '1px solid #EDEBE9', boxShadow: 'none', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Event sx={{ color: '#0078D4', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#323130' }}>Meetings & Communication</Typography>
            <Typography variant="body2" sx={{ color: '#605E5C' }}>Record of all formal meetings related to this project.</Typography>
          </Box>
        </Box>

        <TableContainer component={Box} sx={{ border: '1px solid #EDEBE9', borderRadius: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F3F2F1' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Outcomes / Decisions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#605E5C' }}>No meetings scheduled.</TableCell></TableRow>
              ) : (
                meetings.sort((a,b) => new Date(b.date) - new Date(a.date)).map((m, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(m.date).toLocaleDateString()}</TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: '#323130' }}>{m.title || 'Meeting'}</Typography></TableCell>
                    <TableCell>
                      <Chip size="small" label={m.status} sx={{ bgcolor: m.status === 'Completed' ? '#D1FAE5' : '#E0E7FF', color: m.status === 'Completed' ? '#065F46' : '#4338CA', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#605E5C', whiteSpace: 'pre-wrap' }}>
                        {m.keyDecisions || m.discussionSummary || 'Pending Completion'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MeetingsTab;
