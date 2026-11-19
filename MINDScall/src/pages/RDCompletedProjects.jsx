import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField,
  InputAdornment, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Tooltip,
  Snackbar, Alert, Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  TableChart as SpreadsheetIcon,
  Description as FileIcon,
  CheckCircle as SuccessIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Layers as LayersIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Check as CheckIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import useRDCompletedStore from '../store/rdCompletedStore';
import { authStore } from '../store/authStore';

const BRAND_GREEN = '#2E7D32';
const BRAND_GREEN_DARK = '#1B5E20';
const BORDER_COLOR = '#E2E8F0';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const RDCompletedProjects = () => {
  // 1. Hooks declared unconditionally at top
  const {
    imports,
    activeImport,
    isLoading,
    isUploading,
    isLoadingDetails,
    isSaving,
    fetchImports,
    selectImport,
    uploadImport,
    deleteImport,
    updateImportData,
    getDownloadUrl,
  } = useRDCompletedStore();

  const currentUser = authStore.getState()?.user;
  const isDevOrAdmin = ['DEVELOPER', 'ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  // Spreadsheet Editing State
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState([]);
  const [isSavingTable, setIsSavingTable] = useState(false);

  // Single Row Edit Modal State
  const [editRowModalOpen, setEditRowModalOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});
  const [isSavingRow, setIsSavingRow] = useState(false);

  // Add New Record Modal State
  const [addRowModalOpen, setAddRowModalOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [isAddingRow, setIsAddingRow] = useState(false);

  // Delete Row Modal State
  const [deleteRowModalOpen, setDeleteRowModalOpen] = useState(false);
  const [deletingRowIndex, setDeletingRowIndex] = useState(null);
  const [isDeletingRow, setIsDeletingRow] = useState(false);

  // Upload Dialog State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedWorkbook, setParsedWorkbook] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [totalParsedRows, setTotalParsedRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  // Delete File Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importToDelete, setImportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // 2. Fetch imports on mount
  useEffect(() => {
    fetchImports().catch((err) => {
      console.error('Error fetching R&D completed imports:', err);
    });
  }, []);

  // Reset pagination when active import or search changes
  useEffect(() => {
    setPage(0);
    setIsInlineEditMode(false);
    setEditedRows([]);
  }, [activeImport?._id, searchTerm]);

  // Set default sorting column when active import changes
  useEffect(() => {
    if (activeImport?.headers?.length > 0) {
      setOrderBy(activeImport.headers[0]);
      setOrder('asc');
    } else {
      setOrderBy('');
    }
  }, [activeImport?._id]);

  // Sync editedRows when entering inline edit mode
  const handleToggleInlineEdit = () => {
    if (isInlineEditMode) {
      // Cancel edit mode
      setIsInlineEditMode(false);
      setEditedRows([]);
    } else {
      if (!activeImport || !activeImport.rows) return;
      setEditedRows(JSON.parse(JSON.stringify(activeImport.rows)));
      setIsInlineEditMode(true);
    }
  };

  const handleCellChange = (globalRowIndex, colHeader, value) => {
    setEditedRows((prev) => {
      const updated = [...prev];
      updated[globalRowIndex] = {
        ...updated[globalRowIndex],
        [colHeader]: value,
      };
      return updated;
    });
  };

  const handleSaveAllInlineChanges = async () => {
    if (!activeImport) return;
    setIsSavingTable(true);
    try {
      await updateImportData(activeImport._id, { rows: editedRows });
      setIsInlineEditMode(false);
      setToast({
        open: true,
        message: 'All spreadsheet changes saved successfully!',
        severity: 'success',
      });
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Failed to save spreadsheet changes.',
        severity: 'error',
      });
    } finally {
      setIsSavingTable(false);
    }
  };

  // 3. Single Row Edit Modal Handlers
  const handleOpenEditRowModal = (globalRowIndex, rowData) => {
    setEditingRowIndex(globalRowIndex);
    setEditingRowData({ ...rowData });
    setEditRowModalOpen(true);
  };

  const handleSaveSingleRow = async () => {
    if (editingRowIndex === null || !activeImport) return;
    setIsSavingRow(true);
    try {
      const baseRows = isInlineEditMode ? editedRows : (activeImport.rows || []);
      const updated = [...baseRows];
      const cleanData = { ...editingRowData };
      delete cleanData._globalIndex;
      updated[editingRowIndex] = cleanData;

      await updateImportData(activeImport._id, { rows: updated });
      if (isInlineEditMode) {
        setEditedRows(updated);
      }
      setEditRowModalOpen(false);
      setToast({
        open: true,
        message: `Record #${editingRowIndex + 1} updated successfully!`,
        severity: 'success',
      });
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Failed to update record.',
        severity: 'error',
      });
    } finally {
      setIsSavingRow(false);
    }
  };

  // 4. Add Record Modal Handlers
  const handleOpenAddRowModal = () => {
    const emptyRow = {};
    (activeImport?.headers || []).forEach((h) => {
      emptyRow[h] = '';
    });
    setNewRowData(emptyRow);
    setAddRowModalOpen(true);
  };

  const handleConfirmAddRow = async () => {
    if (!activeImport) return;
    setIsAddingRow(true);
    try {
      const baseRows = isInlineEditMode ? editedRows : (activeImport.rows || []);
      const cleanData = { ...newRowData };
      delete cleanData._globalIndex;
      const updated = [cleanData, ...baseRows];

      await updateImportData(activeImport._id, { rows: updated });
      if (isInlineEditMode) {
        setEditedRows(updated);
      }
      setAddRowModalOpen(false);
      setToast({
        open: true,
        message: 'New record added to spreadsheet successfully!',
        severity: 'success',
      });
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Failed to add record.',
        severity: 'error',
      });
    } finally {
      setIsAddingRow(false);
    }
  };

  // 5. Delete Record Modal Handlers
  const handleOpenDeleteRowModal = (globalRowIndex) => {
    setDeletingRowIndex(globalRowIndex);
    setDeleteRowModalOpen(true);
  };

  const handleConfirmDeleteRow = async () => {
    if (deletingRowIndex === null || !activeImport) return;
    setIsDeletingRow(true);
    try {
      const baseRows = isInlineEditMode ? editedRows : (activeImport.rows || []);
      const updated = baseRows.filter((_, idx) => idx !== deletingRowIndex);

      await updateImportData(activeImport._id, { rows: updated });
      if (isInlineEditMode) {
        setEditedRows(updated);
      }
      setDeleteRowModalOpen(false);
      setToast({
        open: true,
        message: `Record #${deletingRowIndex + 1} deleted.`,
        severity: 'success',
      });
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Failed to delete record.',
        severity: 'error',
      });
    } finally {
      setIsDeletingRow(false);
    }
  };

  // 6. Client-side Excel parsing for Upload Modal
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      setParseError('Invalid file format. Please upload an Excel workbook (.xlsx or .xls).');
      return;
    }

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setParseError('File size exceeds the 50MB limit.');
      return;
    }

    setParseError('');
    setSelectedFile(file);
    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      setParsedWorkbook(wb);

      const sheets = wb.SheetNames || [];
      if (sheets.length === 0) {
        setParseError('The uploaded workbook contains no worksheets.');
        setIsParsing(false);
        return;
      }

      setAvailableSheets(sheets);
      const defaultSheet = sheets[0];
      setSelectedSheet(defaultSheet);
      extractSheetData(wb, defaultSheet);
    } catch (err) {
      console.error('Excel parse error:', err);
      setParseError('Failed to parse Excel file. The file may be password protected or corrupted.');
    } finally {
      setIsParsing(false);
    }
  };

  const extractSheetData = (wb, sheetName) => {
    try {
      const ws = wb.Sheets[sheetName];
      if (!ws) {
        setPreviewHeaders([]);
        setPreviewRows([]);
        setTotalParsedRows([]);
        return;
      }

      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!rawData || rawData.length === 0) {
        setPreviewHeaders([]);
        setPreviewRows([]);
        setTotalParsedRows([]);
        setParseError(`Worksheet "${sheetName}" is empty.`);
        return;
      }

      let headerIdx = 0;
      while (
        headerIdx < rawData.length &&
        !rawData[headerIdx].some((cell) => cell && String(cell).trim() !== '')
      ) {
        headerIdx++;
      }

      if (headerIdx >= rawData.length) {
        setPreviewHeaders([]);
        setPreviewRows([]);
        setTotalParsedRows([]);
        setParseError(`Worksheet "${sheetName}" contains no readable data.`);
        return;
      }

      const rawHeaders = rawData[headerIdx] || [];
      const headers = rawHeaders.map((h, i) =>
        h && String(h).trim() !== '' ? String(h).trim() : `Column_${i + 1}`
      );

      const dataRows = rawData.slice(headerIdx + 1);
      const allRows = [];

      dataRows.forEach((rowArr) => {
        const hasContent = rowArr.some(
          (c) => c !== null && c !== undefined && String(c).trim() !== ''
        );
        if (hasContent) {
          const rowObj = {};
          headers.forEach((h, colIdx) => {
            const val = rowArr[colIdx];
            rowObj[h] = val !== null && val !== undefined ? val : '';
          });
          allRows.push(rowObj);
        }
      });

      setPreviewHeaders(headers);
      setTotalParsedRows(allRows);
      setPreviewRows(allRows.slice(0, 5));
      setParseError('');
    } catch (err) {
      console.error('Error extracting worksheet data:', err);
      setParseError(`Could not extract data from worksheet: ${err.message}`);
    }
  };

  const handleSheetChange = (e) => {
    const sheet = e.target.value;
    setSelectedSheet(sheet);
    if (parsedWorkbook) {
      extractSheetData(parsedWorkbook, sheet);
    }
  };

  const handleOpenUploadModal = () => {
    setSelectedFile(null);
    setParsedWorkbook(null);
    setAvailableSheets([]);
    setSelectedSheet('');
    setPreviewHeaders([]);
    setPreviewRows([]);
    setTotalParsedRows([]);
    setParseError('');
    setUploadDialogOpen(true);
  };

  const handleCloseUploadModal = () => {
    if (isUploading) return;
    setUploadDialogOpen(false);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile || !totalParsedRows.length || !previewHeaders.length) {
      setParseError('Please select a valid Excel file with at least one row of data.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('sheetName', selectedSheet);
      formData.append('availableSheets', JSON.stringify(availableSheets));
      formData.append('headers', JSON.stringify(previewHeaders));
      formData.append('rows', JSON.stringify(totalParsedRows));

      await uploadImport(formData);

      setToast({
        open: true,
        message: `Successfully imported "${selectedFile.name}" (${totalParsedRows.length} records)!`,
        severity: 'success',
      });
      setUploadDialogOpen(false);
    } catch (err) {
      console.error('Import upload error:', err);
      setToast({
        open: true,
        message: err.message || 'Failed to import Excel file.',
        severity: 'error',
      });
    }
  };

  // 7. Download handlers
  const handleDownloadOriginal = async (importDoc) => {
    if (!importDoc) return;
    try {
      const downloadUrl = await getDownloadUrl(importDoc._id);
      if (downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = importDoc.originalName || 'completed_projects.xlsx';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setToast({ open: true, message: 'Could not generate download link.', severity: 'error' });
      }
    } catch (err) {
      console.error('Download error:', err);
      setToast({ open: true, message: err.message || 'Failed to download Excel file.', severity: 'error' });
    }
  };

  const handleExportCurrentView = () => {
    if (!activeImport || !activeImport.rows || !activeImport.rows.length) {
      setToast({ open: true, message: 'No rows available to export.', severity: 'warning' });
      return;
    }
    try {
      const exportData = filteredRows.map((r) => {
        const clean = { ...r };
        delete clean._globalIndex;
        return clean;
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeImport.sheetName || 'Sheet1');
      const filename = `${(activeImport.originalName || 'RD_Completed').replace(/\.[^/.]+$/, '')}_Export.xlsx`;
      XLSX.writeFile(wb, filename);
      setToast({ open: true, message: `Exported ${exportData.length} records to ${filename}`, severity: 'success' });
    } catch (err) {
      console.error('Export error:', err);
      setToast({ open: true, message: 'Failed to export table data.', severity: 'error' });
    }
  };

  // 8. Delete File handlers
  const handleOpenDeleteDialog = (imp) => {
    setImportToDelete(imp);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!importToDelete) return;
    setIsDeleting(true);
    try {
      await deleteImport(importToDelete._id);
      setToast({
        open: true,
        message: `Deleted import "${importToDelete.originalName}" successfully.`,
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setImportToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ open: true, message: err.message || 'Failed to delete import.', severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // 9. Filtering & Sorting data
  const filteredRows = useMemo(() => {
    const sourceRows = isInlineEditMode ? editedRows : (activeImport?.rows || []);
    if (!sourceRows.length) return [];

    let rowsWithIndex = sourceRows.map((r, idx) => ({ ...r, _globalIndex: idx }));

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      rowsWithIndex = rowsWithIndex.filter((row) =>
        Object.entries(row).some(([key, val]) =>
          key !== '_globalIndex' && val !== null && val !== undefined && String(val).toLowerCase().includes(term)
        )
      );
    }

    if (orderBy) {
      rowsWithIndex = [...rowsWithIndex].sort((a, b) => {
        const valA = a[orderBy] !== undefined && a[orderBy] !== null ? a[orderBy] : '';
        const valB = b[orderBy] !== undefined && b[orderBy] !== null ? b[orderBy] : '';

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return order === 'asc' ? numA - numB : numB - numA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return order === 'asc' ? -1 : 1;
        if (strA > strB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return rowsWithIndex;
  }, [activeImport, isInlineEditMode, editedRows, searchTerm, orderBy, order]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    if (isInlineEditMode) return; // Prevent sorting while inline editing to keep stable indices
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F8FAFC', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                bgcolor: 'rgba(46, 125, 50, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: BRAND_GREEN,
              }}
            >
              <SpreadsheetIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', fontSize: { xs: '1.5rem', sm: '1.85rem' }, letterSpacing: '-0.02em' }}>
              R&D Completed Projects
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 700 }}>
            View, edit, and manage completed R&D project records imported from Excel spreadsheets.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchImports(activeImport?._id)}
            disabled={isLoading || isInlineEditMode}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderColor: BORDER_COLOR,
              color: '#475569',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
            }}
          >
            Refresh
          </Button>

          {isDevOrAdmin && (
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={handleOpenUploadModal}
              disabled={isInlineEditMode}
              sx={{
                bgcolor: BRAND_GREEN,
                '&:hover': { bgcolor: BRAND_GREEN_DARK },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '6px',
                px: 2.5,
                py: 1,
                boxShadow: '0 2px 4px rgba(46, 125, 50, 0.25)',
              }}
            >
              Upload Excel
            </Button>
          )}
        </Stack>
      </Box>

      {/* File Selector & Details Banner */}
      {imports.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            bgcolor: '#FFFFFF',
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* File Switcher Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1, minWidth: 280 }}>
            <FormControl size="small" sx={{ minWidth: 260, maxWidth: 420 }}>
              <InputLabel id="select-import-label" sx={{ fontWeight: 500, color: '#475569' }}>
                Select Excel File
              </InputLabel>
              <Select
                labelId="select-import-label"
                value={activeImport?._id || ''}
                label="Select Excel File"
                disabled={isInlineEditMode}
                onChange={(e) => selectImport(e.target.value)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: 1.5,
                  '& .MuiSelect-select': { fontWeight: 600, color: '#1E293B' },
                }}
              >
                {imports.map((imp) => (
                  <MenuItem key={imp._id} value={imp._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileIcon fontSize="small" sx={{ color: BRAND_GREEN }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {imp.originalName}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${imp.rowCount || 0} records`}
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem', bgcolor: '#E2E8F0' }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Active file metadata chips */}
            {activeImport && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  icon={<LayersIcon sx={{ fontSize: '1rem !important' }} />}
                  label={`Sheet: ${activeImport.sheetName}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#CBD5E1', color: '#475569', fontWeight: 500 }}
                />
                <Chip
                  icon={<CalendarIcon sx={{ fontSize: '1rem !important' }} />}
                  label={`Uploaded: ${formatDate(activeImport.uploadDate)}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#CBD5E1', color: '#475569' }}
                />
                <Chip
                  icon={<PersonIcon sx={{ fontSize: '1rem !important' }} />}
                  label={`By: ${activeImport.uploadedBy?.name || 'Admin'}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#CBD5E1', color: '#475569' }}
                />
                {activeImport.fileSize > 0 && (
                  <Chip
                    label={formatFileSize(activeImport.fileSize)}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: '#CBD5E1', color: '#64748B' }}
                  />
                )}
              </Stack>
            )}
          </Box>

          {/* Action buttons on active file */}
          {activeImport && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadOriginal(activeImport)}
                disabled={isInlineEditMode}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: BRAND_GREEN,
                  color: BRAND_GREEN,
                  '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.05)', borderColor: BRAND_GREEN_DARK },
                }}
              >
                Download Excel
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ExportIcon />}
                onClick={handleExportCurrentView}
                disabled={isInlineEditMode}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                Export Table
              </Button>

              {isDevOrAdmin && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleOpenDeleteDialog(activeImport)}
                  disabled={isInlineEditMode}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Delete
                </Button>
              )}
            </Stack>
          )}
        </Paper>
      )}

      {/* Main Table Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          border: `1px solid ${BORDER_COLOR}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Inline Edit Banner */}
        {isInlineEditMode && (
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: '#FEF3C7',
              borderBottom: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon sx={{ color: '#D97706', fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400E' }}>
                Spreadsheet Edit Mode Active — Click any cell in the table to modify values. Changes persist when saved.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={handleToggleInlineEdit}
                disabled={isSavingTable}
                sx={{
                  color: '#78350F',
                  borderColor: '#D97706',
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: '#FFFBEB' },
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={isSavingTable ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveAllInlineChanges}
                disabled={isSavingTable}
                sx={{
                  bgcolor: BRAND_GREEN,
                  '&:hover': { bgcolor: BRAND_GREEN_DARK },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                }}
              >
                {isSavingTable ? 'Saving...' : 'Save All Changes'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Table Search & Editing Toolbar */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${BORDER_COLOR}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: '#FCFDFD',
          }}
        >
          {/* Search Field */}
          <TextField
            size="small"
            placeholder="Search across all columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!activeImport || !activeImport.rows?.length}
            sx={{
              minWidth: { xs: '100%', sm: 300 },
              maxWidth: 420,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFFFF',
                borderRadius: 1.5,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Right Toolbar: Edit Mode, Add Record, Row Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mr: 1 }}>
              {activeImport
                ? `Showing ${filteredRows.length} of ${(isInlineEditMode ? editedRows.length : (activeImport.rowCount || activeImport.rows?.length || 0))} records`
                : '0 records'}
            </Typography>

            {isDevOrAdmin && activeImport && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddRowModal}
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    bgcolor: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                  }}
                >
                  Add Record
                </Button>

                <Button
                  variant={isInlineEditMode ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={isInlineEditMode ? <CloseIcon /> : <EditIcon />}
                  onClick={handleToggleInlineEdit}
                  sx={{
                    bgcolor: isInlineEditMode ? '#D97706' : '#FFFFFF',
                    color: isInlineEditMode ? '#FFFFFF' : BRAND_GREEN,
                    borderColor: isInlineEditMode ? '#D97706' : BRAND_GREEN,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: isInlineEditMode ? '#B45309' : 'rgba(46, 125, 50, 0.05)',
                    },
                  }}
                >
                  {isInlineEditMode ? 'Exit Edit Mode' : 'Edit Table'}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Loading indicator */}
        {(isLoading || isLoadingDetails) && (
          <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CircularProgress size={36} sx={{ color: BRAND_GREEN }} />
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Loading spreadsheet records...
            </Typography>
          </Box>
        )}

        {/* Table Content */}
        {!isLoading && !isLoadingDetails && activeImport && activeImport.headers?.length > 0 && (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', minHeight: 320 }}>
              <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    {/* Index column */}
                    <TableCell
                      sx={{
                        bgcolor: '#F1F5F9',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        py: 1.5,
                        width: 55,
                        borderBottom: `2px solid ${BORDER_COLOR}`,
                      }}
                    >
                      #
                    </TableCell>

                    {/* Actions Column (Edit/Delete) */}
                    {isDevOrAdmin && (
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: '#F1F5F9',
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          py: 1.5,
                          width: 90,
                          borderBottom: `2px solid ${BORDER_COLOR}`,
                        }}
                      >
                        Actions
                      </TableCell>
                    )}

                    {/* Dynamic Columns */}
                    {activeImport.headers.map((colHeader) => (
                      <TableCell
                        key={colHeader}
                        sx={{
                          bgcolor: '#F1F5F9',
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          py: 1.5,
                          whiteSpace: 'nowrap',
                          borderBottom: `2px solid ${BORDER_COLOR}`,
                        }}
                      >
                        <TableSortLabel
                          active={orderBy === colHeader}
                          direction={orderBy === colHeader ? order : 'asc'}
                          onClick={() => handleRequestSort(colHeader)}
                          disabled={isInlineEditMode}
                          sx={{
                            '&.Mui-active': { color: BRAND_GREEN },
                            '& .MuiTableSortLabel-icon': { color: `${BRAND_GREEN} !important` },
                          }}
                        >
                          {colHeader}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, idx) => {
                      const globalIdx = row._globalIndex !== undefined ? row._globalIndex : (page * rowsPerPage + idx);

                      return (
                        <TableRow
                          key={globalIdx}
                          hover
                          sx={{
                            '&:nth-of-type(even)': { bgcolor: '#F8FAFC' },
                            '&:hover': { bgcolor: '#F1F5F9 !important' },
                          }}
                        >
                          {/* Row number */}
                          <TableCell sx={{ color: '#94A3B8', fontSize: '0.8rem', py: 1.25, fontWeight: 500 }}>
                            {page * rowsPerPage + idx + 1}
                          </TableCell>

                          {/* Actions (Edit row dialog, Delete row dialog) */}
                          {isDevOrAdmin && (
                            <TableCell align="center" sx={{ py: 0.5, px: 1, whiteSpace: 'nowrap' }}>
                              <Tooltip title="Edit this record">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditRowModal(globalIdx, row)}
                                  sx={{ color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }}
                                >
                                  <EditIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete this record">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDeleteRowModal(globalIdx)}
                                  sx={{ color: '#DC2626', '&:hover': { bgcolor: '#FEF2F2' }, ml: 0.5 }}
                                >
                                  <DeleteIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          )}

                          {/* Cell Values (Text or Editable Input) */}
                          {activeImport.headers.map((colHeader) => {
                            const val = row[colHeader];

                            if (isInlineEditMode) {
                              return (
                                <TableCell key={colHeader} sx={{ p: 0.75 }}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={val !== undefined && val !== null ? val : ''}
                                    onChange={(e) => handleCellChange(globalIdx, colHeader, e.target.value)}
                                    sx={{
                                      '& .MuiInputBase-input': {
                                        fontSize: '0.825rem',
                                        py: 0.6,
                                        px: 1,
                                        bgcolor: '#FFFFFF',
                                        borderRadius: '4px',
                                      },
                                    }}
                                  />
                                </TableCell>
                              );
                            }

                            const displayVal = val !== undefined && val !== null && String(val).trim() !== ''
                              ? String(val)
                              : '—';

                            return (
                              <TableCell
                                key={colHeader}
                                sx={{
                                  color: displayVal === '—' ? '#94A3B8' : '#334155',
                                  fontSize: '0.825rem',
                                  py: 1.25,
                                  maxWidth: 360,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={String(val || '')}
                              >
                                {displayVal}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={activeImport.headers.length + (isDevOrAdmin ? 2 : 1)} sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {searchTerm ? `No records matching "${searchTerm}"` : 'No records found in this worksheet.'}
                        </Typography>
                        {searchTerm && (
                          <Button size="small" onClick={() => setSearchTerm('')} sx={{ mt: 1, textTransform: 'none' }}>
                            Clear search filter
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                borderTop: `1px solid ${BORDER_COLOR}`,
                bgcolor: '#FFFFFF',
              }}
            />
          </>
        )}

        {/* Empty State: No files uploaded yet */}
        {!isLoading && !isLoadingDetails && (!activeImport || imports.length === 0) && (
          <Box sx={{ p: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'rgba(46, 125, 50, 0.08)',
                color: BRAND_GREEN,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <SpreadsheetIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600, mb: 1 }}>
              No Completed R&D Records Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 480, mb: 3 }}>
              Upload an Excel spreadsheet (.xlsx or .xls) to import and view completed project records in this interactive data workspace.
            </Typography>
            {isDevOrAdmin && (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleOpenUploadModal}
                sx={{
                  bgcolor: BRAND_GREEN,
                  '&:hover': { bgcolor: BRAND_GREEN_DARK },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                }}
              >
                Upload First Excel File
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* ========================================================= */}
      {/* EDIT RECORD MODAL (Single Row)                            */}
      {/* ========================================================= */}
      <Dialog
        open={editRowModalOpen}
        onClose={() => !isSavingRow && setEditRowModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <EditIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.15rem' }}>
                Edit Record #{editingRowIndex !== null ? editingRowIndex + 1 : ''}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Modify values for the selected row in "{activeImport?.originalName}"
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setEditRowModalOpen(false)} disabled={isSavingRow}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2.5, pb: 2.5 }}>
          <Grid container spacing={2}>
            {(activeImport?.headers || []).map((header) => (
              <Grid item xs={12} sm={6} key={header}>
                <TextField
                  label={header}
                  fullWidth
                  size="small"
                  value={editingRowData[header] !== undefined && editingRowData[header] !== null ? editingRowData[header] : ''}
                  onChange={(e) =>
                    setEditingRowData((prev) => ({
                      ...prev,
                      [header]: e.target.value,
                    }))
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC' },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditRowModalOpen(false)} disabled={isSavingRow} sx={{ color: '#64748B', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSingleRow}
            disabled={isSavingRow}
            startIcon={isSavingRow ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: BRAND_GREEN,
              '&:hover': { bgcolor: BRAND_GREEN_DARK },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {isSavingRow ? 'Saving Changes...' : 'Save Record'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* ADD NEW RECORD MODAL                                      */}
      {/* ========================================================= */}
      <Dialog
        open={addRowModalOpen}
        onClose={() => !isAddingRow && setAddRowModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'rgba(46, 125, 50, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: BRAND_GREEN,
              }}
            >
              <AddIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.15rem' }}>
                Add New Record
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Insert a new project row into "{activeImport?.originalName}"
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setAddRowModalOpen(false)} disabled={isAddingRow}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2.5, pb: 2.5 }}>
          <Grid container spacing={2}>
            {(activeImport?.headers || []).map((header) => (
              <Grid item xs={12} sm={6} key={header}>
                <TextField
                  label={header}
                  fullWidth
                  size="small"
                  value={newRowData[header] || ''}
                  onChange={(e) =>
                    setNewRowData((prev) => ({
                      ...prev,
                      [header]: e.target.value,
                    }))
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC' },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddRowModalOpen(false)} disabled={isAddingRow} sx={{ color: '#64748B', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAddRow}
            disabled={isAddingRow}
            startIcon={isAddingRow ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              bgcolor: BRAND_GREEN,
              '&:hover': { bgcolor: BRAND_GREEN_DARK },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {isAddingRow ? 'Adding...' : 'Add Record to Table'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* DELETE RECORD CONFIRMATION MODAL                          */}
      {/* ========================================================= */}
      <Dialog
        open={deleteRowModalOpen}
        onClose={() => !isDeletingRow && setDeleteRowModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          Delete Record?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>
            Are you sure you want to delete row #{deletingRowIndex !== null ? deletingRowIndex + 1 : ''}?
          </Typography>
          <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 500 }}>
            This row will be permanently removed from the saved spreadsheet.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteRowModalOpen(false)}
            disabled={isDeletingRow}
            sx={{ color: '#64748B', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteRow}
            disabled={isDeletingRow}
            startIcon={isDeletingRow ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isDeletingRow ? 'Deleting...' : 'Delete Row'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* EXCEL UPLOAD MODAL                                        */}
      {/* ========================================================= */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'rgba(46, 125, 50, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: BRAND_GREEN,
              }}
            >
              <UploadIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.15rem' }}>
                Upload R&D Completed Excel
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Import completed project records from an .xlsx or .xls workbook
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleCloseUploadModal} disabled={isUploading}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, pb: 3 }}>
          {/* File Picker Zone */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${selectedFile ? BRAND_GREEN : '#CBD5E1'}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: selectedFile ? 'rgba(46, 125, 50, 0.03)' : '#F8FAFC',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: BRAND_GREEN,
                bgcolor: 'rgba(46, 125, 50, 0.02)',
              },
              mb: 2.5,
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <SpreadsheetIcon sx={{ fontSize: 44, color: selectedFile ? BRAND_GREEN : '#94A3B8', mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
              {selectedFile ? selectedFile.name : 'Click to select or drag and drop Excel file'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Supported formats: .xlsx, .xls (Max size: 50MB)
            </Typography>
            {selectedFile && (
              <Chip
                label={formatFileSize(selectedFile.size)}
                size="small"
                sx={{ mt: 1, bgcolor: '#E2E8F0', fontWeight: 500 }}
              />
            )}
          </Box>

          {/* Parsing Spinner */}
          {isParsing && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 2 }}>
              <CircularProgress size={24} sx={{ color: BRAND_GREEN }} />
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Analyzing worksheets and columns...
              </Typography>
            </Box>
          )}

          {/* Parse error alert */}
          {parseError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {parseError}
            </Alert>
          )}

          {/* Sheet Selector (if multiple sheets) */}
          {availableSheets.length > 0 && !isParsing && (
            <Box sx={{ mb: 2.5 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="worksheet-select-label" sx={{ fontWeight: 500 }}>
                      Select Worksheet
                    </InputLabel>
                    <Select
                      labelId="worksheet-select-label"
                      value={selectedSheet}
                      label="Select Worksheet"
                      onChange={handleSheetChange}
                      sx={{ bgcolor: '#FFFFFF' }}
                    >
                      {availableSheets.map((sheet) => (
                        <MenuItem key={sheet} value={sheet}>
                          {sheet}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5}>
                    <Chip
                      icon={<LayersIcon sx={{ fontSize: '0.9rem !important' }} />}
                      label={`${previewHeaders.length} Columns detected`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<SuccessIcon sx={{ fontSize: '0.9rem !important' }} />}
                      label={`${totalParsedRows.length} Rows detected`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Preview Table */}
          {previewHeaders.length > 0 && !isParsing && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
                Excel Preview (First 5 Rows)
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxHeight: 240,
                  bgcolor: '#FFFFFF',
                  borderRadius: 1.5,
                  borderColor: BORDER_COLOR,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.75rem', width: 40 }}>
                        #
                      </TableCell>
                      {previewHeaders.map((h) => (
                        <TableCell key={h} sx={{ bgcolor: '#F8FAFC', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewRows.map((r, rIdx) => (
                      <TableRow key={rIdx}>
                        <TableCell sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                          {rIdx + 1}
                        </TableCell>
                        {previewHeaders.map((h) => (
                          <TableCell key={h} sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {r[h] !== undefined && r[h] !== null ? String(r[h]) : '—'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>
                Confirming will import all {totalParsedRows.length} rows and {previewHeaders.length} columns into the system.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseUploadModal} disabled={isUploading} sx={{ color: '#64748B', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmImport}
            disabled={!selectedFile || !totalParsedRows.length || isParsing || isUploading}
            startIcon={isUploading ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
            sx={{
              bgcolor: BRAND_GREEN,
              '&:hover': { bgcolor: BRAND_GREEN_DARK },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {isUploading ? 'Importing Data...' : 'Confirm & Import to System'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* DELETE WORKBOOK CONFIRMATION DIALOG                       */}
      {/* ========================================================= */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          Delete Imported Spreadsheet?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>
            Are you sure you want to delete <strong>"{importToDelete?.originalName}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 500 }}>
            This will permanently remove the workbook and all {importToDelete?.rowCount || 0} imported project records from the system.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
            sx={{ color: '#64748B', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RDCompletedProjects;
