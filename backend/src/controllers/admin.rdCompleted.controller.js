const path = require('path');
const fs = require('fs');
const RDCompletedImport = require('../models/RDCompletedImport.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { generatePresignedDownloadUrl, uploadFile, deleteFile } = require('../services/s3.service');

/**
 * Helper: Parse Excel file from disk using ExcelJS if client didn't supply rows
 */
const parseExcelWithExcelJS = async (filePath, targetSheetName) => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const availableSheets = workbook.worksheets.map(ws => ws.name);
  const worksheet = targetSheetName 
    ? (workbook.getWorksheet(targetSheetName) || workbook.worksheets[0])
    : workbook.worksheets[0];

  if (!worksheet) {
    throw new ApiError(400, 'No worksheet found in Excel file');
  }

  const sheetName = worksheet.name;
  const headers = [];
  const rows = [];

  // Read row 1 as headers
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = cell.value ? String(cell.value).trim() : `Column_${colNumber}`;
  });

  // Read data rows
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip headers
    const rowObj = {};
    let hasValue = false;
    headers.forEach((h, idx) => {
      if (!h) return;
      const cellVal = row.getCell(idx + 1).value;
      if (cellVal !== null && cellVal !== undefined && cellVal !== '') {
        hasValue = true;
        // If cell has formula or rich text, extract plain text or result
        if (typeof cellVal === 'object') {
          rowObj[h] = cellVal.result !== undefined ? cellVal.result : (cellVal.text || JSON.stringify(cellVal));
        } else {
          rowObj[h] = cellVal;
        }
      } else {
        rowObj[h] = '';
      }
    });
    if (hasValue) {
      rows.push(rowObj);
    }
  });

  return {
    sheetName,
    availableSheets,
    headers: headers.filter(Boolean),
    rows,
  };
};

/**
 * @desc    Get all completed R&D imports (metadata only, excluding heavy rows array)
 * @route   GET /api/v1/admin/rd-completed
 * @access  Private (Developer, Admin, Super Admin)
 */
exports.getImports = async (req, res, next) => {
  try {
    const imports = await RDCompletedImport.find({ isArchived: false })
      .select('-rows')
      .sort({ uploadDate: -1 })
      .lean();

    // Calculate overall KPIs
    const totalFiles = imports.length;
    const totalRecords = imports.reduce((acc, curr) => acc + (curr.rowCount || 0), 0);
    const lastUpdated = imports.length > 0 ? imports[0].uploadDate : null;
    const lastUploadedBy = imports.length > 0 ? imports[0].uploadedBy : null;

    // Enhance each import with a download URL
    const enhancedImports = await Promise.all(
      imports.map(async (item) => {
        let downloadUrl = null;
        if (item.storageProvider === 's3' && item.objectKey) {
          try {
            downloadUrl = await generatePresignedDownloadUrl(item.objectKey, 3600);
          } catch (e) {
            console.error('Error generating presigned URL for import:', item._id, e.message);
          }
        } else if (item.filename) {
          downloadUrl = `/uploads/${path.basename(item.filename)}`;
        }
        return {
          ...item,
          downloadUrl,
        };
      })
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          imports: enhancedImports,
          kpis: {
            totalFiles,
            totalRecords,
            lastUpdated,
            lastUploadedBy,
          },
        },
        'R&D Completed imports retrieved successfully'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single import by ID (includes full rows data)
 * @route   GET /api/v1/admin/rd-completed/:id
 * @access  Private (Developer, Admin, Super Admin)
 */
exports.getImportById = async (req, res, next) => {
  try {
    const importDoc = await RDCompletedImport.findOne({
      _id: req.params.id,
      isArchived: false,
    }).lean();

    if (!importDoc) {
      return next(new ApiError(404, 'R&D Completed import not found'));
    }

    let downloadUrl = null;
    if (importDoc.storageProvider === 's3' && importDoc.objectKey) {
      try {
        downloadUrl = await generatePresignedDownloadUrl(importDoc.objectKey, 3600);
      } catch (e) {
        console.error('Error generating presigned URL:', e.message);
      }
    } else if (importDoc.filename) {
      downloadUrl = `/uploads/${path.basename(importDoc.filename)}`;
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          ...importDoc,
          downloadUrl,
        },
        'R&D Completed import details retrieved successfully'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create / Upload new R&D Completed Excel file import
 * @route   POST /api/v1/admin/rd-completed/import
 * @access  Private (Developer, Admin, Super Admin)
 */
exports.createImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Excel file is required (.xlsx or .xls)'));
    }

    let { sheetName, availableSheets, headers, rows } = req.body;

    // Parse JSON fields if passed as strings (from FormData)
    if (typeof availableSheets === 'string') {
      try { availableSheets = JSON.parse(availableSheets); } catch (e) { availableSheets = []; }
    }
    if (typeof headers === 'string') {
      try { headers = JSON.parse(headers); } catch (e) { headers = []; }
    }
    if (typeof rows === 'string') {
      try { rows = JSON.parse(rows); } catch (e) { rows = []; }
    }

    const file = req.file;
    let storageProvider = 'local';
    let objectKey = file.filename || file.originalname;

    // Check if uploaded via multerS3
    if (file.location || file.key) {
      storageProvider = 's3';
      objectKey = file.key;
    } else if (file.path) {
      // Local file: check if AWS S3 is configured, and if so, upload to S3
      const bucketName = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET;
      if (process.env.AWS_ACCESS_KEY_ID && bucketName) {
        try {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          const targetKey = `uploads/rd-completed/${uniqueSuffix}-${safeName}`;
          await uploadFile(file.path, targetKey, file.mimetype);
          storageProvider = 's3';
          objectKey = targetKey;
          // Clean up local temp file
          fs.unlink(file.path, () => {});
        } catch (uploadErr) {
          console.warn('S3 upload fallback to local storage:', uploadErr.message);
          storageProvider = 'local';
          objectKey = file.filename;
        }
      } else {
        storageProvider = 'local';
        objectKey = file.filename;
      }
    }

    // If client didn't supply rows/headers, parse server-side with ExcelJS
    if ((!rows || !rows.length) && file.path && fs.existsSync(file.path)) {
      try {
        const parsed = await parseExcelWithExcelJS(file.path, sheetName);
        sheetName = parsed.sheetName;
        availableSheets = parsed.availableSheets;
        headers = parsed.headers;
        rows = parsed.rows;
      } catch (parseErr) {
        console.error('Server-side ExcelJS parse error:', parseErr);
      }
    }

    if (!headers || !headers.length) {
      return next(new ApiError(400, 'No column headers could be identified from the Excel sheet'));
    }

    if (!rows || !rows.length) {
      return next(new ApiError(400, 'The selected worksheet does not contain any valid data rows'));
    }

    // Format and sanitize rows to ensure all headers exist
    const sanitizedRows = rows.map((r) => {
      const cleanObj = {};
      headers.forEach((h) => {
        cleanObj[h] = r[h] !== undefined && r[h] !== null ? r[h] : '';
      });
      return cleanObj;
    });

    const newImport = await RDCompletedImport.create({
      filename: file.filename || file.key || file.originalname,
      originalName: file.originalname,
      fileSize: file.size || 0,
      mimetype: file.mimetype || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      storageProvider,
      objectKey,
      sheetName: sheetName || (availableSheets && availableSheets[0]) || 'Sheet1',
      availableSheets: Array.isArray(availableSheets) ? availableSheets : [sheetName || 'Sheet1'],
      headers,
      rows: sanitizedRows,
      rowCount: sanitizedRows.length,
      uploadedBy: {
        id: req.user?._id,
        name: req.user?.name || 'Administrator',
        email: req.user?.email || '',
        role: req.user?.role || 'DEVELOPER',
      },
      uploadDate: new Date(),
    });

    res.status(201).json(
      new ApiResponse(201, newImport, 'Excel file imported and saved successfully')
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete an import and its associated records and stored file
 * @route   DELETE /api/v1/admin/rd-completed/:id
 * @access  Private (Developer, Admin, Super Admin)
 */
exports.deleteImport = async (req, res, next) => {
  try {
    const importDoc = await RDCompletedImport.findById(req.params.id);

    if (!importDoc) {
      return next(new ApiError(404, 'Import record not found'));
    }

    // Attempt to delete stored file
    if (importDoc.storageProvider === 's3' && importDoc.objectKey) {
      try {
        await deleteFile(importDoc.objectKey);
      } catch (err) {
        console.warn('Failed to delete S3 file for import:', importDoc._id, err.message);
      }
    } else if (importDoc.filename) {
      const localPath = path.resolve('uploads', path.basename(importDoc.filename));
      if (fs.existsSync(localPath)) {
        fs.unlink(localPath, () => {});
      }
    }

    await RDCompletedImport.findByIdAndDelete(req.params.id);

    res.status(200).json(
      new ApiResponse(200, { id: req.params.id }, 'Import and all associated records deleted successfully')
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update import data (rows, headers, sheetName)
 * @route   PUT /api/v1/admin/rd-completed/:id
 * @access  Private (Developer, Admin, Super Admin)
 */
exports.updateImport = async (req, res, next) => {
  try {
    const { rows, headers, sheetName } = req.body;

    const importDoc = await RDCompletedImport.findById(req.params.id);
    if (!importDoc) {
      return next(new ApiError(404, 'Import record not found'));
    }

    if (Array.isArray(rows)) {
      importDoc.rows = rows;
      importDoc.rowCount = rows.length;
    }
    if (Array.isArray(headers) && headers.length > 0) {
      importDoc.headers = headers;
    }
    if (sheetName) {
      importDoc.sheetName = sheetName;
    }

    await importDoc.save();

    res.status(200).json(
      new ApiResponse(200, importDoc, 'Import data updated successfully')
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Download the original uploaded Excel file
 * @route   GET /api/v1/admin/rd-completed/:id/download
 * @access  Private (Developer, Admin, Super Admin)
 */
exports.downloadImportFile = async (req, res, next) => {
  try {
    const importDoc = await RDCompletedImport.findById(req.params.id);

    if (!importDoc) {
      return next(new ApiError(404, 'Import record not found'));
    }

    if (importDoc.storageProvider === 's3' && importDoc.objectKey) {
      const downloadUrl = await generatePresignedDownloadUrl(importDoc.objectKey, 3600);
      if (downloadUrl) {
        if (req.query.redirect === 'true') {
          return res.redirect(downloadUrl);
        }
        return res.status(200).json(
          new ApiResponse(200, { downloadUrl }, 'Download URL generated successfully')
        );
      }
    }

    // Local file fallback
    const localPath = path.resolve('uploads', path.basename(importDoc.objectKey || importDoc.filename));
    if (fs.existsSync(localPath)) {
      return res.download(localPath, importDoc.originalName);
    }

    return next(new ApiError(404, 'Physical Excel file not found on storage server'));
  } catch (err) {
    next(err);
  }
};
