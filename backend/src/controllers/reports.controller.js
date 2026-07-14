const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const Submission = require('../models/Submission.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// ── Colour palette for Excel ──────────────────────────────────────────────────
const DARK_NAVY  = '0D1B2A';
const BRAND_GREEN = '2E7D32';
const LIGHT_GREEN = 'E8F5E9';
const LIGHT_BLUE  = 'E3F2FD';
const LIGHT_AMBER = 'FFF8E1';
const LIGHT_RED   = 'FFEBEE';
const HEADER_TEXT = 'FFFFFF';
const BORDER_GREY = 'D0D7DE';

// ── Helper: map submission status to human-readable workflow stage ─────────────
function getWorkflowStage(status) {
  const map = {
    NEW: 'Submitted',
    REVIEWING: 'RM Review',
    AWAITING_RM_REVIEW: 'Awaiting RM Review',
    RM_REVIEW: 'RM Review',
    AWAITING_HOD_REVIEW: 'HOD Review',
    HOD_REVIEW: 'HOD Review',
    EVALUATION: 'Evaluation Committee',
    EVALUATION_REJECTED: 'Evaluation – Rejected',
    FINANCE_APPROVED: 'Finance Approved',
    APPROVAL_COMMITTEE: 'Approval Committee',
    APPROVED: 'Approved / R&D',
    REJECTED: 'Rejected',
    IMPLEMENTATION: 'Implementation',
    COMPLETED: 'Completed',
  };
  return map[status] || status;
}

// ── Helper: compute overall status ───────────────────────────────────────────
function getOverallStatus(status) {
  if (['APPROVED', 'IMPLEMENTATION', 'COMPLETED'].includes(status)) return 'Closed';
  if (status === 'REJECTED' || status === 'EVALUATION_REJECTED') return 'Closed';
  if (status === 'COMPLETED') return 'Completed';
  return 'Open';
}

// ── Helper: build filter query from request params ────────────────────────────
function buildQuery(query) {
  const { dateFrom, dateTo, department, status, submissionType, trackingId, wbsCode, search } = query;
  const filter = {};

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo)   filter.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
  }
  if (status) {
    const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
    filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }
  if (submissionType) filter.submissionType = submissionType;
  if (trackingId)  filter.trackingId  = { $regex: trackingId,  $options: 'i' };
  if (wbsCode)     filter.wbsCode     = { $regex: wbsCode,     $options: 'i' };
  if (search) {
    filter.$or = [
      { trackingId:  { $regex: search, $options: 'i' } },
      { wbsCode:     { $regex: search, $options: 'i' } },
      { businessId:  { $regex: search, $options: 'i' } },
      { submitterEmail: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) {
    // department is stored inside answers.department
    filter['answers.department'] = { $regex: department, $options: 'i' };
  }
  return filter;
}

// ── Helper: flat master row from a submission ─────────────────────────────────
function buildMasterRow(sub, idx) {
  const a  = sub.answers || {};
  const wf = sub.workflow || {};
  const rm = wf.rmReview       || {};
  const ev = wf.evaluationReview || {};
  const fi = wf.financeReview  || {};
  const pd = sub.projectDetails || {};

  const evaluators = ev.evaluators || [];
  const approvals  = evaluators.filter(e => e.decision === 'APPROVED').length;
  const rejections = evaluators.filter(e => e.decision === 'REJECTED').length;

  // last update title/description
  const lastUpdate = (pd.updates || []).slice(-1)[0];

  return {
    '#': idx + 1,
    'Tracking ID':            sub.trackingId  || sub.businessId || sub._id.toString(),
    'WBS Code':               sub.wbsCode     || '',
    'Submission Type':        sub.submissionType || 'Idea',
    'Submission Title':       a.title         || '',
    'Category':               a.classification || a.category || '',
    'Sub Category':           a.subCategory   || '',
    'Innovation Type':        a.innovationType|| '',
    'Department':             a.department    || '',
    'Submitted By':           a.name          || '',
    'Employee ID':            a.employeeCode  || a.employeeId || '',
    'Employee Email':         sub.submitterEmail || a.email || '',
    'Designation':            a.designation   || a.jobRole || '',
    'Date Submitted':         sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-IN') : '',
    'Reporting Manager':      a.reportingManagerName || a.managerName || '',
    'RM Email':               a.reportingManagerEmail || '',
    'RM Decision':            rm.decision     || 'PENDING',
    'RM Remarks':             rm.remarks      || '',
    'RM Review Date':         rm.timestamp    ? new Date(rm.timestamp).toLocaleDateString('en-IN') : '',
    'HOD Name':               a.hodName       || '',
    'HOD Email':              a.hodEmail      || '',
    'Evaluator 1':            evaluators[0]?.email || '',
    'Evaluator 1 Vote':       evaluators[0]?.decision || '',
    'Evaluator 2':            evaluators[1]?.email || '',
    'Evaluator 2 Vote':       evaluators[1]?.decision || '',
    'Evaluator 3':            evaluators[2]?.email || '',
    'Evaluator 3 Vote':       evaluators[2]?.decision || '',
    'Evaluator 4':            evaluators[3]?.email || '',
    'Evaluator 4 Vote':       evaluators[3]?.decision || '',
    'Evaluator 5':            evaluators[4]?.email || '',
    'Evaluator 5 Vote':       evaluators[4]?.decision || '',
    'Evaluator 6':            evaluators[5]?.email || '',
    'Evaluator 6 Vote':       evaluators[5]?.decision || '',
    'Total Approvals':        approvals,
    'Total Rejections':       rejections,
    'Evaluation Result':      ev.decision     || 'PENDING',
    'Finance Status':         fi.decision     || 'PENDING',
    'Finance Reviewer':       fi.reviewerName || '',
    'Finance Remarks':        fi.remarks      || '',
    'Finance Date':           fi.timestamp    ? new Date(fi.timestamp).toLocaleDateString('en-IN') : '',
    'Approved Budget (INR)':  fi.approvedBudget != null ? fi.approvedBudget : '',
    'Approval Committee Status': ['APPROVED','IMPLEMENTATION','COMPLETED'].includes(sub.status) ? 'APPROVED'
                               : sub.status === 'APPROVAL_COMMITTEE' ? 'PENDING' : '',
    'Approval Committee Date': sub.status === 'APPROVED' && sub.updatedAt
                               ? new Date(sub.updatedAt).toLocaleDateString('en-IN') : '',
    'Project Owner':          pd.owner        || '',
    'R&D Status':             pd.implementationStatus || '',
    'Progress (%)':           pd.progressPercentage != null ? pd.progressPercentage : 0,
    'Expected Benefits':      pd.expectedBenefits || '',
    'Actual Benefits':        pd.actualBenefits   || '',
    'Estimated Budget (INR)': a.estimatedBudget || a.budget || '',
    'Estimated Savings':      a.estimatedSavings || '',
    'Actual Savings':         a.actualSavings     || '',
    'Business Impact':        a.businessImpact    || '',
    'Priority':               a.priority          || '',
    'Attachments':            (sub.attachments || []).map(att => att.url).join('; '),
    'Latest Update':          lastUpdate ? (lastUpdate.title || lastUpdate.description || lastUpdate.text || '') : '',
    'Current Workflow Stage': getWorkflowStage(sub.status),
    'Overall Status':         getOverallStatus(sub.status),
    'Created On':             sub.createdAt ? new Date(sub.createdAt).toLocaleString('en-IN') : '',
    'Last Updated':           sub.updatedAt ? new Date(sub.updatedAt).toLocaleString('en-IN') : '',
  };
}

// ── Excel helper: style a header row ─────────────────────────────────────────
function styleHeaderRow(row, bgColor = BRAND_GREEN) {
  row.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bgColor}` } };
    cell.font   = { bold: true, color: { argb: `FF${HEADER_TEXT}` }, size: 10, name: 'Calibri' };
    cell.border = {
      top:    { style: 'thin', color: { argb: `FF${BORDER_GREY}` } },
      bottom: { style: 'thin', color: { argb: `FF${BORDER_GREY}` } },
      left:   { style: 'thin', color: { argb: `FF${BORDER_GREY}` } },
      right:  { style: 'thin', color: { argb: `FF${BORDER_GREY}` } },
    };
    cell.alignment = { vertical: 'middle', wrapText: false };
  });
  row.height = 22;
}

// ── Excel helper: style a data row ───────────────────────────────────────────
function styleDataRow(row, even) {
  const bg = even ? `FF${LIGHT_BLUE}` : 'FFFFFFFF';
  row.eachCell({ includeEmpty: true }, cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cell.font   = { size: 9, name: 'Calibri' };
    cell.border = {
      top:    { style: 'hair', color: { argb: `FF${BORDER_GREY}` } },
      bottom: { style: 'hair', color: { argb: `FF${BORDER_GREY}` } },
      left:   { style: 'hair', color: { argb: `FF${BORDER_GREY}` } },
      right:  { style: 'hair', color: { argb: `FF${BORDER_GREY}` } },
    };
    cell.alignment = { vertical: 'middle', wrapText: false };
  });
  row.height = 18;
}

// ── Excel helper: add title block to a sheet ──────────────────────────────────
function addSheetTitle(sheet, title, subtitle, colCount) {
  const titleRow = sheet.addRow([title]);
  sheet.mergeCells(titleRow.number, 1, titleRow.number, colCount);
  titleRow.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${DARK_NAVY}` } };
  titleRow.getCell(1).font  = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  titleRow.height = 30;

  const subRow = sheet.addRow([subtitle]);
  sheet.mergeCells(subRow.number, 1, subRow.number, colCount);
  subRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_GREEN}` } };
  subRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF374151' }, name: 'Calibri' };
  subRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  subRow.height = 16;

  sheet.addRow([]); // empty spacer
}

// ── Excel helper: apply auto-filter to header row ────────────────────────────
function applyAutoFilter(sheet, headerRowNum, colCount) {
  sheet.autoFilter = {
    from: { row: headerRowNum, column: 1 },
    to:   { row: headerRowNum, column: colCount },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Export multi-sheet Excel report
// @route   GET /api/v1/admin/reports/export/excel
// @access  Private (SUPER_ADMIN, ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
exports.exportExcel = async (req, res, next) => {
  try {
    const filter = buildQuery(req.query);
    const submissions = await Submission.find(filter).sort('-createdAt').lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator  = 'MINDScall Enterprise Platform';
    workbook.created  = new Date();
    workbook.modified = new Date();

    const now = new Date().toLocaleString('en-IN');

    // ════════════════════════════════════════════════════════════
    // SHEET 1 — Master Submission Report
    // ════════════════════════════════════════════════════════════
    const masterSheet = workbook.addWorksheet('Master Submissions', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
    });

    const masterRows = submissions.map((sub, i) => buildMasterRow(sub, i));
    const masterCols = masterRows.length > 0 ? Object.keys(masterRows[0]) : [];

    addSheetTitle(masterSheet, 'MINDScall — Master Submission Report',
      `Generated: ${now}  |  Total Records: ${masterRows.length}`, masterCols.length);

    // Set column widths/keys WITHOUT the header property (header written as explicit addRow below)
    masterSheet.columns = masterCols.map(key => ({
      key,
      width: key === '#' ? 5 : key.includes('Date') || key.includes('On') || key.includes('Updated') ? 18
            : key.includes('Remarks') || key.includes('Benefits') || key.includes('Title') || key.includes('Update') ? 30
            : key.includes('Email') ? 28
            : 20,
    }));

    // Explicitly add the header row so it appears AFTER the title block
    const masterHeaderRow = masterSheet.addRow(masterCols);
    styleHeaderRow(masterHeaderRow, BRAND_GREEN);
    applyAutoFilter(masterSheet, masterHeaderRow.number, masterCols.length);

    masterRows.forEach((row, i) => {
      const dataRow = masterSheet.addRow(Object.values(row));
      styleDataRow(dataRow, i % 2 === 0);

      // Colour-code Status column
      const statusCol = masterCols.indexOf('Overall Status') + 1;
      const statusCell = dataRow.getCell(statusCol);
      const sVal = statusCell.value || '';
      if (sVal === 'Open')      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_BLUE}` } };
      if (sVal === 'Closed')    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_AMBER}` } };
      if (sVal === 'Completed') statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_GREEN}` } };

      // Colour-code Progress col
      const progCol = masterCols.indexOf('Progress (%)') + 1;
      const progCell = dataRow.getCell(progCol);
      const pVal = Number(progCell.value) || 0;
      if (pVal === 100) progCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_GREEN}` } };
      else if (pVal >= 50) progCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_AMBER}` } };
      else if (pVal > 0) progCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_RED}` } };
    });

    masterSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: masterHeaderRow.number, activeCell: 'A4' }];

    // ════════════════════════════════════════════════════════════
    // SHEET 2 — Evaluation Detail
    // ════════════════════════════════════════════════════════════
    const evalSheet = workbook.addWorksheet('Evaluation Detail', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
    });

    const evalHeaders = ['Tracking ID','WBS Code','Submission Title','Department','Evaluator Email','Vote','Innovation Score',
      'Technical Feasibility','Business Impact Score','Scalability','Risk Assessment','Comments','Submission Date'];
    addSheetTitle(evalSheet, 'MINDScall — Evaluation Committee Detail',
      `Generated: ${now}`, evalHeaders.length);
    evalSheet.columns = evalHeaders.map(h => ({ key: h, width: h === 'Comments' ? 40 : h.includes('Email') ? 30 : 20 }));
    const evalHeaderRow = evalSheet.addRow(evalHeaders);
    styleHeaderRow(evalHeaderRow, '1565C8');
    applyAutoFilter(evalSheet, evalHeaderRow.number, evalHeaders.length);

    let evalRowIdx = 0;
    submissions.forEach(sub => {
      const ev = (sub.workflow?.evaluationReview?.evaluators || []);
      const a  = sub.answers || {};
      ev.forEach(e => {
        const row = evalSheet.addRow([
          sub.trackingId || sub.businessId || '',
          sub.wbsCode || '',
          a.title || '',
          a.department || '',
          e.email || '',
          e.decision || '',
          e.scores?.innovation || '',
          e.scores?.technicalFeasibility || '',
          e.scores?.businessImpact || '',
          e.scores?.scalability || '',
          e.scores?.riskAssessment || '',
          e.comments || '',
          e.submittedDate ? new Date(e.submittedDate).toLocaleDateString('en-IN') : '',
        ]);
        styleDataRow(row, evalRowIdx % 2 === 0);
        const voteCell = row.getCell(6);
        if (voteCell.value === 'APPROVED') voteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_GREEN}` } };
        if (voteCell.value === 'REJECTED') voteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_RED}` } };
        evalRowIdx++;
      });
    });

    evalSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: evalHeaderRow.number, activeCell: 'A1' }];

    // ════════════════════════════════════════════════════════════
    // SHEET 3 — Timeline / Workflow History
    // ════════════════════════════════════════════════════════════
    const timeSheet = workbook.addWorksheet('Timeline', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });
    const timeHeaders = ['Tracking ID','WBS Code','Submission Title','Department','Stage','Action By','Role','Status / Remarks','Date & Time'];
    addSheetTitle(timeSheet, 'MINDScall — Workflow Timeline',
      `Generated: ${now}`, timeHeaders.length);
    timeSheet.columns = timeHeaders.map(h => ({
      key: h,
      width: h === 'Status / Remarks' ? 45 : h.includes('Title') ? 30 : h.includes('Email') ? 28 : 22,
    }));
    const timeHeaderRow = timeSheet.addRow(timeHeaders);
    styleHeaderRow(timeHeaderRow, '6D28D9');
    applyAutoFilter(timeSheet, timeHeaderRow.number, timeHeaders.length);

    let timeRowIdx = 0;
    submissions.forEach(sub => {
      const a = sub.answers || {};
      (sub.timeline || []).forEach(t => {
        const row = timeSheet.addRow([
          sub.trackingId || sub.businessId || '',
          sub.wbsCode || '',
          a.title || '',
          a.department || '',
          t.stage || t.event || '',
          t.actionBy || t.actor || '',
          t.role || '',
          t.remarks || '',
          t.timestamp ? new Date(t.timestamp).toLocaleString('en-IN') : '',
        ]);
        styleDataRow(row, timeRowIdx % 2 === 0);
        timeRowIdx++;
      });
    });

    timeSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: timeHeaderRow.number, activeCell: 'A1' }];

    // ════════════════════════════════════════════════════════════
    // SHEET 4 — R&D Updates
    // ════════════════════════════════════════════════════════════
    const rdSheet = workbook.addWorksheet('R&D Updates', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });
    const rdHeaders = ['Tracking ID','WBS Code','Submission Title','Project Owner','Update #','Progress (%)','Update Title','Description','Updated By','Date','R&D Status'];
    addSheetTitle(rdSheet, 'MINDScall — R&D Project Updates',
      `Generated: ${now}`, rdHeaders.length);
    rdSheet.columns = rdHeaders.map(h => ({
      key: h,
      width: h === 'Description' ? 50 : h.includes('Title') ? 30 : 20,
    }));
    const rdHeaderRow = rdSheet.addRow(rdHeaders);
    styleHeaderRow(rdHeaderRow, '0F766E');
    applyAutoFilter(rdSheet, rdHeaderRow.number, rdHeaders.length);

    let rdRowIdx = 0;
    submissions.forEach(sub => {
      const pd = sub.projectDetails || {};
      const a  = sub.answers || {};
      const updates = pd.updates || [];
      if (updates.length === 0) return;
      updates.forEach((u, ui) => {
        const row = rdSheet.addRow([
          sub.trackingId || sub.businessId || '',
          sub.wbsCode || '',
          a.title || '',
          pd.owner || '',
          ui + 1,
          u.progressPercentage != null ? u.progressPercentage : '',
          u.title || '',
          u.description || u.text || '',
          u.updatedBy || u.user || '',
          u.timestamp ? new Date(u.timestamp).toLocaleDateString('en-IN') : '',
          pd.implementationStatus || '',
        ]);
        styleDataRow(row, rdRowIdx % 2 === 0);
        rdRowIdx++;
      });
    });

    rdSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: rdHeaderRow.number, activeCell: 'A1' }];

    // ════════════════════════════════════════════════════════════
    // SHEET 5 — Financial Analysis
    // ════════════════════════════════════════════════════════════
    const finSheet = workbook.addWorksheet('Financial Analysis', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });
    const finHeaders = ['Tracking ID','WBS Code','Submission Title','Department','Submitted By',
      'Estimated Budget (INR)','Approved Budget (INR)','Finance Status','Finance Reviewer','Finance Date',
      'Estimated Savings','Actual Savings','Business Impact','R&D Status','Progress (%)','Overall Status'];
    addSheetTitle(finSheet, 'MINDScall — Financial Analysis Report',
      `Generated: ${now}`, finHeaders.length);
    finSheet.columns = finHeaders.map(h => ({
      key: h,
      width: h.includes('Title') ? 30 : h.includes('Budget') || h.includes('Savings') ? 22 : 20,
    }));
    const finHeaderRow = finSheet.addRow(finHeaders);
    styleHeaderRow(finHeaderRow, 'B45309');
    applyAutoFilter(finSheet, finHeaderRow.number, finHeaders.length);

    let finRowIdx = 0;
    submissions.forEach(sub => {
      const a  = sub.answers || {};
      const fi = sub.workflow?.financeReview || {};
      const pd = sub.projectDetails || {};
      const row = finSheet.addRow([
        sub.trackingId || sub.businessId || '',
        sub.wbsCode || '',
        a.title || '',
        a.department || '',
        a.name || '',
        a.estimatedBudget || a.budget || '',
        fi.approvedBudget != null ? fi.approvedBudget : '',
        fi.decision || 'PENDING',
        fi.reviewerName || '',
        fi.timestamp ? new Date(fi.timestamp).toLocaleDateString('en-IN') : '',
        a.estimatedSavings || '',
        a.actualSavings || '',
        a.businessImpact || '',
        pd.implementationStatus || '',
        pd.progressPercentage != null ? pd.progressPercentage : 0,
        getOverallStatus(sub.status),
      ]);
      styleDataRow(row, finRowIdx % 2 === 0);
      const finStatCell = row.getCell(8);
      if (finStatCell.value === 'APPROVED') finStatCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_GREEN}` } };
      if (finStatCell.value === 'REJECTED') finStatCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_RED}` } };
      if (finStatCell.value === 'PENDING')  finStatCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_AMBER}` } };
      finRowIdx++;
    });

    finSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: finHeaderRow.number, activeCell: 'A1' }];

    // ════════════════════════════════════════════════════════════
    // SHEET 6 — Executive Summary (Derived metrics)
    // ════════════════════════════════════════════════════════════
    const execSheet = workbook.addWorksheet('Executive Summary', {
      pageSetup: { paperSize: 9, orientation: 'portrait' },
    });

    const total     = submissions.length;
    const ideas     = submissions.filter(s => s.submissionType === 'Idea').length;
    const proposals = submissions.filter(s => s.submissionType === 'Proposal').length;
    const approved  = submissions.filter(s => ['APPROVED','IMPLEMENTATION','COMPLETED'].includes(s.status)).length;
    const rejected  = submissions.filter(s => ['REJECTED','EVALUATION_REJECTED'].includes(s.status)).length;
    const pending   = total - approved - rejected;
    const evalDone  = submissions.filter(s => s.workflow?.evaluationReview?.decision === 'APPROVED').length;
    const finApproved = submissions.filter(s => s.workflow?.financeReview?.decision === 'APPROVED').length;
    const rdCompleted = submissions.filter(s => s.projectDetails?.implementationStatus === 'Completed').length;
    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';

    // dept breakdown
    const deptCounts = {};
    submissions.forEach(s => {
      const dept = s.answers?.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    addSheetTitle(execSheet, 'MINDScall — Executive Summary Dashboard',
      `Generated: ${now}  |  Reporting Period: All Time`, 3);

    execSheet.columns = [
      { key: 'metric', width: 38 },
      { key: 'value',  width: 18 },
      { key: 'notes',  width: 30 },
    ];
    const execHeaderRow = execSheet.addRow(['Metric', 'Value', 'Notes']);
    styleHeaderRow(execHeaderRow, DARK_NAVY);

    const kpis = [
      ['Total Submissions', total, 'All time'],
      ['Total Ideas', ideas, ''],
      ['Total Proposals', proposals, ''],
      ['Approved', approved, `${approvalRate}% approval rate`],
      ['Rejected', rejected, ''],
      ['Pending / In Progress', pending, ''],
      ['Evaluation Passed', evalDone, ''],
      ['Finance Approved', finApproved, ''],
      ['R&D Completed', rdCompleted, ''],
      ['Approval Rate', `${approvalRate}%`, 'Approved / Total'],
      ['', '', ''],
      ['— Department Breakdown —', '', ''],
      ...Object.entries(deptCounts).sort((a,b) => b[1]-a[1]).map(([dept, cnt]) => [dept, cnt, '']),
    ];

    kpis.forEach((kpi, i) => {
      const row = execSheet.addRow(kpi);
      styleDataRow(row, i % 2 === 0);
      if (kpi[0] === '— Department Breakdown —' || kpi[0] === '') {
        row.getCell(1).font = { bold: true, size: 10, name: 'Calibri' };
      }
    });

    // ── Stream the workbook ──────────────────────────────────────
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="MINDScall_Report_${dateStr}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Export CSV — Master Submission Report (flat)
// @route   GET /api/v1/admin/reports/export/csv
// @access  Private (SUPER_ADMIN, ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
exports.exportCSV = async (req, res, next) => {
  try {
    const filter = buildQuery(req.query);
    const submissions = await Submission.find(filter).sort('-createdAt').lean();

    if (submissions.length === 0) {
      return next(new ApiError(404, 'No submissions found for the given filters'));
    }

    const flatData = submissions.map((sub, i) => buildMasterRow(sub, i));
    const parser = new Parser({ fields: Object.keys(flatData[0]) });
    const csv = parser.parse(flatData);

    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="MINDScall_MasterReport_${dateStr}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get KPI summary metrics for Reports dashboard
// @route   GET /api/v1/admin/reports/summary
// @access  Private (SUPER_ADMIN, ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const filter = buildQuery(req.query);
    const submissions = await Submission.find(filter).lean();

    const total     = submissions.length;
    const ideas     = submissions.filter(s => s.submissionType === 'Idea').length;
    const proposals = submissions.filter(s => s.submissionType === 'Proposal').length;
    const approved  = submissions.filter(s => ['APPROVED','IMPLEMENTATION','COMPLETED'].includes(s.status)).length;
    const rejected  = submissions.filter(s => ['REJECTED','EVALUATION_REJECTED'].includes(s.status)).length;
    const pending   = total - approved - rejected;

    const evalPassed  = submissions.filter(s => s.workflow?.evaluationReview?.decision === 'APPROVED').length;
    const finApproved = submissions.filter(s => s.workflow?.financeReview?.decision === 'APPROVED').length;
    const rdCompleted = submissions.filter(s => s.projectDetails?.implementationStatus === 'Completed').length;
    const rdInProgress = submissions.filter(s => {
      const st = s.projectDetails?.implementationStatus;
      return ['In Progress','Planning','Pilot Testing','Near Completion'].includes(st);
    }).length;

    // Total approved budget
    const totalBudget = submissions.reduce((sum, s) => {
      const b = s.workflow?.financeReview?.approvedBudget;
      return sum + (b != null ? Number(b) : 0);
    }, 0);

    // Avg progress of active R&D
    const rdSubs = submissions.filter(s => s.projectDetails?.progressPercentage != null && s.projectDetails.progressPercentage > 0);
    const avgProgress = rdSubs.length > 0
      ? Math.round(rdSubs.reduce((s, x) => s + x.projectDetails.progressPercentage, 0) / rdSubs.length)
      : 0;

    // Department breakdown
    const byDept = {};
    submissions.forEach(s => {
      const d = s.answers?.department || 'Unknown';
      byDept[d] = (byDept[d] || 0) + 1;
    });

    // Monthly trend (last 6 months)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }), count: 0 });
    }
    submissions.forEach(s => {
      const cd = new Date(s.createdAt);
      const label = cd.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      const bucket = months.find(m => m.month === label);
      if (bucket) bucket.count++;
    });

    // Status distribution
    const byStatus = {};
    submissions.forEach(s => {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    });

    // Category distribution
    const byCategory = {};
    submissions.forEach(s => {
      const cat = s.answers?.classification || s.answers?.category || 'General';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    // Submission type distribution
    const byType = { Idea: ideas, Proposal: proposals };

    res.status(200).json(new ApiResponse(200, {
      kpis: { total, ideas, proposals, approved, rejected, pending, evalPassed, finApproved, rdCompleted, rdInProgress, totalBudget, avgProgress,
              approvalRate: total > 0 ? +((approved / total) * 100).toFixed(1) : 0 },
      charts: { monthly: months, byDept, byStatus, byCategory, byType },
    }, 'Summary fetched'));
  } catch (err) {
    next(err);
  }
};
