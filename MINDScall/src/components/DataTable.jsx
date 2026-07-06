import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Typography, Box, Chip, TablePagination, InputAdornment,
  TextField, IconButton, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  InboxOutlined as InboxIcon,
} from '@mui/icons-material';

// ── Status badge color system ──────────────────────────────────────────────────
const getStatusColors = (status) => {
  const s = String(status || '').toUpperCase();
  if (s.includes('APPROVED') || s === 'APPROVED') {
    return { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
  }
  if (s.includes('REJECTED') || s === 'REJECTED') {
    return { bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' };
  }
  if (s === 'PENDING' || s.includes('PENDING')) {
    return { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' };
  }
  if (s === 'UNDER REVIEW' || s.includes('REVIEW')) {
    return { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
  }
  if (s === 'COMPLETED') {
    return { bg: '#F0FDF4', color: '#14532D', border: '#86EFAC' };
  }
  if (s === 'DRAFT') {
    return { bg: '#F9FAFB', color: '#374151', border: '#E5E7EB' };
  }
  if (s.includes('PROGRESS') || s === 'IN PROGRESS') {
    return { bg: '#F0F9FF', color: '#0C4A6E', border: '#BAE6FD' };
  }
  if (s === 'SCHEDULED') {
    return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
  }
  return { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' };
};

const DataTable = ({ columns, rows, rowsPerPageDefault = 7, searchable = false }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageDefault);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredRows = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((v) =>
        v && String(v).toLowerCase().includes(q)
      )
    );
  }, [rows, searchQuery, searchable]);

  const displayed = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {searchable && (
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            sx={{ width: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: { bgcolor: '#F9FAFB', borderRadius: 2 },
            }}
          />
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
        }}
      >
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.field}
                    align={col.align || 'left'}
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: '#F9FAFB',
                      fontWeight: 700,
                      color: '#374151',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      borderBottom: '2px solid #E5E7EB',
                      whiteSpace: 'nowrap',
                      width: col.width || 'auto',
                    }}
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
                  sx={{
                    '&:hover': {
                      backgroundColor: '#F8FAFF',
                    },
                    '&:last-child td': { border: 0 },
                    borderBottom: '1px solid #F3F4F6',
                    transition: 'background-color 0.12s ease',
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.field}
                      align={col.align || 'left'}
                      sx={{ py: 1.5, px: 2, borderBottom: '1px solid #F3F4F6' }}
                    >
                      {col.renderCell ? col.renderCell(row) : (
                        <Typography sx={{ fontSize: '0.875rem', color: '#374151' }}>
                          {row[col.field] ?? '—'}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {displayed.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6, border: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <InboxIcon sx={{ fontSize: 40, color: '#D1D5DB' }} />
                      <Typography sx={{ fontSize: '0.9rem', color: '#9CA3AF', fontWeight: 600 }}>
                        No records are currently available
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#D1D5DB' }}>
                        {searchQuery ? 'Try adjusting your search.' : 'Data will appear here once submissions are received.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredRows.length > rowsPerPage && (
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
            rowsPerPageOptions={[5, 7, 10, 25]}
            sx={{
              borderTop: '1px solid #F3F4F6',
              '& .MuiTablePagination-select': { fontSize: '0.84rem' },
              '& .MuiTablePagination-displayedRows': { fontSize: '0.84rem', color: '#6B7280' },
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

// ── Status Chip ───────────────────────────────────────────────────────────────
export const StatusChip = ({ status }) => {
  const colors = getStatusColors(status);
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontWeight: 700,
        fontSize: '0.7rem',
        height: 22,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};

// ── User Cell ─────────────────────────────────────────────────────────────────
export const UserCell = ({ avatar, name, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
    <Avatar
      sx={{
        width: 32,
        height: 32,
        bgcolor: '#2E7D32',
        fontSize: '0.72rem',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {avatar}
    </Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '0.84rem' }} noWrap>
        {name}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }} noWrap>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

// ── SLA Cell ──────────────────────────────────────────────────────────────────
export const SLACell = ({ days, status }) => {
  if (days === undefined || days === null) {
    return <Typography sx={{ fontSize: '0.78rem', color: '#D1D5DB' }}>N/A</Typography>;
  }
  let colors = { bg: '#F0FDF4', color: '#166534', text: `${days} Days Left` };
  if (days <= 2 && days >= 0) colors = { bg: '#FFFBEB', color: '#92400E', text: `${days} Days Left` };
  if (days < 0) colors = { bg: '#FEF2F2', color: '#991B1B', text: `${Math.abs(days)} Days Overdue` };

  return (
    <Chip
      label={colors.text}
      size="small"
      sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.68rem', height: 22 }}
    />
  );
};

// ── Type Badge ────────────────────────────────────────────────────────────────
export const TypeBadge = ({ type }) => {
  const isIdea = String(type || '').toUpperCase() === 'IDEA';
  const label = isIdea ? 'IDEA' : 'PROPOSAL';
  const colors = isIdea
    ? { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' }
    : { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' };
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontWeight: 700,
        fontSize: '0.62rem',
        height: 18,
        '& .MuiChip-label': { px: 0.75 },
      }}
    />
  );
};

export default DataTable;
