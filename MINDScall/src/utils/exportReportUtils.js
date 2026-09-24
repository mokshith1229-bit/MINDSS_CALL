import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Helper to safely format dates
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return 'Invalid Date';
  }
};

export const exportProjectToPDF = (project) => {
  if (!project) return;
  const pDetails = project.projectDetails || {};
  const parsed = project.parsedData || {};

  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.text(`Project Report: ${project.title || parsed.title || 'Untitled Project'}`, 14, y);
  y += 10;
  
  doc.setFontSize(12);
  doc.text(`ID: ${project.trackingId || 'N/A'}`, 14, y);
  doc.text(`WBS: ${project.wbsCode || 'N/A'}`, 100, y);
  y += 8;
  doc.text(`PI: ${parsed.employeeName || parsed.piName || pDetails.owner || 'N/A'}`, 14, y);
  doc.text(`Status: ${pDetails.implementationStatus || 'Approved'}`, 100, y);
  y += 15;

  // Project Initiation
  doc.setFontSize(14);
  doc.text('Project Initiation', 14, y);
  y += 6;
  const initiationData = [
    ['Approved Budget', parsed.approvedBudget || parsed.budget || 'N/A'],
    ['Approved Duration', parsed.duration || 'N/A'],
    ['Confirmed Objectives', pDetails.initiation?.confirmedObjectives || 'N/A'],
    ['Expected Outcomes', pDetails.initiation?.confirmedExpectedOutcomes || 'N/A'],
    ['Start Date', formatDate(pDetails.initiation?.startDate)],
  ];
  
  doc.autoTable({
    startY: y,
    head: [['Field', 'Details']],
    body: initiationData,
    theme: 'grid',
    headStyles: { fillColor: [0, 120, 212] }
  });
  y = doc.lastAutoTable.finalY + 15;

  // Test Matrix
  if (pDetails.testMatrix && pDetails.testMatrix.length > 0) {
    doc.setFontSize(14);
    doc.text('Test Matrix', 14, y);
    y += 6;
    const testMatrixBody = pDetails.testMatrix.map(t => [
      t.testName || 'N/A',
      t.testObjective || 'N/A',
      t.status || 'N/A',
      formatDate(t.requiredDate),
      t.estimatedDuration ? `${t.estimatedDuration} hrs` : 'N/A'
    ]);
    doc.autoTable({
      startY: y,
      head: [['Test Name', 'Objective', 'Status', 'Required Date', 'Duration']],
      body: testMatrixBody,
      theme: 'grid',
      headStyles: { fillColor: [0, 120, 212] }
    });
    y = doc.lastAutoTable.finalY + 15;
  }

  // Milestones / Phases
  if (pDetails.milestones && pDetails.milestones.length > 0) {
    doc.setFontSize(14);
    doc.text('Milestones / Phases', 14, y);
    y += 6;
    const milestoneBody = pDetails.milestones.map(m => [
      m.name || 'N/A',
      m.status || 'N/A',
      formatDate(m.plannedStartDate),
      formatDate(m.plannedCompletionDate),
      `${m.completionPercentage || 0}%`
    ]);
    doc.autoTable({
      startY: y,
      head: [['Phase Name', 'Status', 'Start Date', 'End Date', 'Progress']],
      body: milestoneBody,
      theme: 'grid',
      headStyles: { fillColor: [0, 120, 212] }
    });
    y = doc.lastAutoTable.finalY + 15;
  }

  // Budget
  if (pDetails.financials && pDetails.financials.expenditures && pDetails.financials.expenditures.length > 0) {
    doc.setFontSize(14);
    doc.text('Expenditure Logs', 14, y);
    y += 6;
    const budgetBody = pDetails.financials.expenditures.map(e => [
      e.category || 'N/A',
      e.amount || 0,
      formatDate(e.date),
      e.description || 'N/A'
    ]);
    doc.autoTable({
      startY: y,
      head: [['Category', 'Amount', 'Date', 'Description']],
      body: budgetBody,
      theme: 'grid',
      headStyles: { fillColor: [0, 120, 212] }
    });
  }

  doc.save(`${project.trackingId || 'Project'}_Report.pdf`);
};

export const exportProjectToExcel = (project) => {
  if (!project) return;
  const pDetails = project.projectDetails || {};
  const parsed = project.parsedData || {};

  const wb = XLSX.utils.book_new();

  // 1. Overview Sheet
  const overviewData = [
    ['Project Title', project.title || parsed.title || 'Untitled Project'],
    ['Tracking ID', project.trackingId || 'N/A'],
    ['WBS Code', project.wbsCode || 'N/A'],
    ['Principal Investigator', parsed.employeeName || parsed.piName || pDetails.owner || 'N/A'],
    ['Department', parsed.department || parsed.dept || 'N/A'],
    ['Status', pDetails.implementationStatus || 'Approved'],
    ['Overall Progress', `${pDetails.progressPercentage || 0}%`],
    ['Approved Budget', parsed.approvedBudget || parsed.budget || 'N/A'],
    ['Approved Duration', parsed.duration || 'N/A'],
    ['Confirmed Objectives', pDetails.initiation?.confirmedObjectives || 'N/A'],
    ['Expected Outcomes', pDetails.initiation?.confirmedExpectedOutcomes || 'N/A'],
    ['Start Date', formatDate(pDetails.initiation?.startDate)],
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // 2. Test Matrix Sheet
  if (pDetails.testMatrix && pDetails.testMatrix.length > 0) {
    const testMatrixHeader = ['Test Name', 'Objective', 'Procedure', 'Sample Quantity', 'Required Equipment', 'Priority', 'Status', 'Required Date', 'Duration (hrs)'];
    const testMatrixRows = pDetails.testMatrix.map(t => [
      t.testName, t.testObjective, t.testProcedure, t.sampleQuantity, t.requiredEquipment, t.priority, t.status, formatDate(t.requiredDate), t.estimatedDuration
    ]);
    const wsTests = XLSX.utils.aoa_to_sheet([testMatrixHeader, ...testMatrixRows]);
    XLSX.utils.book_append_sheet(wb, wsTests, 'Test Matrix');
  }

  // 3. Samples Sheet
  if (pDetails.samples && pDetails.samples.length > 0) {
    const sampleHeader = ['Sample Name', 'Type', 'Quantity', 'Source', 'Status', 'Remarks'];
    const sampleRows = pDetails.samples.map(s => [
      s.sampleName, s.sampleType, s.quantity, s.source, s.status, s.remarks
    ]);
    const wsSamples = XLSX.utils.aoa_to_sheet([sampleHeader, ...sampleRows]);
    XLSX.utils.book_append_sheet(wb, wsSamples, 'Samples');
  }

  // 4. Milestones Sheet
  if (pDetails.milestones && pDetails.milestones.length > 0) {
    const milestoneHeader = ['Phase Name', 'Description', 'Expected Deliverable', 'Status', 'Progress (%)', 'Start Date', 'End Date'];
    const milestoneRows = pDetails.milestones.map(m => [
      m.name, m.description, m.expectedDeliverable, m.status, m.completionPercentage, formatDate(m.plannedStartDate), formatDate(m.plannedCompletionDate)
    ]);
    const wsMilestones = XLSX.utils.aoa_to_sheet([milestoneHeader, ...milestoneRows]);
    XLSX.utils.book_append_sheet(wb, wsMilestones, 'Milestones');
  }

  // 5. Expenditures Sheet
  if (pDetails.financials && pDetails.financials.expenditures && pDetails.financials.expenditures.length > 0) {
    const expenseHeader = ['Category', 'Amount', 'Date', 'Description'];
    const expenseRows = pDetails.financials.expenditures.map(e => [
      e.category, e.amount, formatDate(e.date), e.description
    ]);
    const wsExpenses = XLSX.utils.aoa_to_sheet([expenseHeader, ...expenseRows]);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenditures');
  }

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(data, `${project.trackingId || 'Project'}_Report.xlsx`);
};
