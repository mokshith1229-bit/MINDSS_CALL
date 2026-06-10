import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Typography, Box, Chip, TablePagination,
} from '@mui/material';

const statusColors = {
  Pending: { bg: '#FFF8E1', color: '#F57C00', border: '#FFE082' },
  Approved: { bg: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' },
  Rejected: { bg: '#FFEBEE', color: '#C62828', border: '#EF9A9A' },
  Scheduled: { bg: '#E3F2FD', color: '#0277BD', border: '#90CAF9' },
  'Under Review': { bg: '#F3E5F5', color: '#6A1B9A', border: '#CE93D8' },
  'In Progress': { bg: '#E0F7FA', color: '#00695C', border: '#80DEEA' },
  Completed: { bg: '#F1F8E9', color: '#388E3C', border: '#AED581' },
};

const DataTable = ({ columns, rows, rowsPerPageDefault = 7 }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageDefault);

  const displayed = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #EEEEEE' }} elevation={0}>
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.align || 'left'}
                  sx={{ py: 1.8, px: 2.5 }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.map((row, idx) => (
              <TableRow
                key={row.id || idx}
                hover
                sx={{
                  '&:hover': { backgroundColor: '#F9FBE7' },
                  '&:last-child td': { border: 0 },
                  borderBottom: '1px solid #F5F5F5',
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.field} align={col.align || 'left'} sx={{ py: 1.8, px: 2.5 }}>
                    {col.renderCell ? col.renderCell(row) : (
                      <Typography variant="body2" sx={{ color: '#37474F' }}>
                        {row[col.field]}
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {displayed.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#9E9E9E' }}>No records found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > rowsPerPage && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 7, 10, 25]}
          sx={{ borderTop: '1px solid #F0F0F0' }}
        />
      )}
    </Paper>
  );
};

export const StatusChip = ({ status }) => {
  const colors = statusColors[status] || { bg: '#F5F5F5', color: '#616161', border: '#E0E0E0' };
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontWeight: 600,
        fontSize: '0.72rem',
        height: 24,
      }}
    />
  );
};

export const UserCell = ({ avatar, name, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Avatar
      sx={{
        width: 34,
        height: 34,
        background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
        fontSize: '0.72rem',
        fontWeight: 700,
      }}
    >
      {avatar}
    </Avatar>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }}>{name}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: '#9E9E9E' }}>{subtitle}</Typography>}
    </Box>
  </Box>
);

export const SLACell = ({ days, status }) => {
  if (days === undefined || days === null) return <Typography variant="caption" sx={{ color: '#9E9E9E' }}>N/A</Typography>;
  
  let colors = { bg: '#E8F5E9', color: '#2E7D32', text: `${days} Days Left` };
  if (status === 'warning' || days <= 2 && days >= 0) colors = { bg: '#FFF3E0', color: '#E65100', text: `${days} Days Left` };
  if (status === 'overdue' || days < 0) colors = { bg: '#FFEBEE', color: '#C62828', text: `${Math.abs(days)} Days Overdue` };

  return (
    <Chip
      label={colors.text}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 700,
        fontSize: '0.65rem',
        height: 22,
      }}
    />
  );
};

export const TypeBadge = ({ type }) => {
  const isIdea = String(type || '').toUpperCase() === 'IDEA';
  const label = isIdea ? 'IDEA' : 'PROPOSAL';
  const colorParams = isIdea 
    ? { bg: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' } 
    : { bg: '#E3F2FD', color: '#0277BD', border: '#90CAF9' };
    
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: colorParams.bg,
        color: colorParams.color,
        border: `1px solid ${colorParams.border}`,
        fontWeight: 700,
        fontSize: '0.65rem',
        height: 22,
      }}
    />
  );
};

export default DataTable;
