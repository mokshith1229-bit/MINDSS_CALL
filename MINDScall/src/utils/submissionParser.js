/**
 * ─────────────────────────────────────────────────────────────────
 *  Unified Submission Parser — Single Source of Truth
 *
 *  EVERY module page MUST use this parser instead of doing its own
 *  ad-hoc field extraction. This ensures all views show the same data.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Keyword Lists ───────────────────────────────────────────────
const TITLE_KW       = ['title', 'proposaltitle', 'ideatitle', 'projecttitle', 'projectname'];
const ABSTRACT_KW    = ['abstract', 'introduction', 'description', 'details', 'ideadetails', 'summary', 'overview'];
const BENEFITS_KW    = ['benefit', 'benefits', 'expectedbenefit', 'expectedimpact', 'impact'];
const DEPT_KW        = ['department', 'dept', 'division', 'unit', 'section'];
const NAME_KW        = ['name', 'fullname', 'employeename', 'submittername', 'applicantname'];
const CODE_KW        = ['employeecode', 'empcode', 'code', 'employeeid', 'empid', 'staffid'];
const RM_NAME_KW     = ['managername', 'reportingmanagername', 'rmname', 'supervisorname', 'linemanagername', 'reportingmanager'];
const RM_EMAIL_KW    = ['manageremail', 'reportingmanageremail', 'rmemail', 'supervisoremail', 'linemanageremail'];
const HOD_NAME_KW    = ['hodname', 'headofdepartment', 'hodmanagername', 'departmentheadname'];
const HOD_EMAIL_KW   = ['hodemail', 'headofdepartmentemail', 'departmentheademail'];
const BUDGET_KW      = ['budget', 'amount', 'cost', 'estimatedbudget', 'budgetrequired', 'capex', 'opex', 'estimatedcost', 'totalcost'];
const CATEGORY_KW    = ['category', 'type', 'area'];
const SUBTYPE_KW     = ['submissiontype'];

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Search `answers` object keys by keyword substring matching.
 * Returns the first matching value or null.
 */
const findInAnswers = (ans, keywords) => {
  if (!ans || typeof ans !== 'object') return null;
  for (const key of Object.keys(ans)) {
    const kLower = key.toLowerCase().replace(/[_\-\s]/g, '');
    if (keywords.some(kw => kLower.includes(kw))) {
      return ans[key];
    }
  }
  return null;
};

/**
 * Search `formData` (labeled) object by label keyword matching.
 * Returns the first matching value or null.
 */
const findInFormData = (fd, keywords) => {
  if (!fd || typeof fd !== 'object') return null;
  for (const [label, meta] of Object.entries(fd)) {
    const lLower = label.toLowerCase().replace(/[_\-\s]/g, '');
    if (keywords.some(kw => lLower.includes(kw))) {
      return meta?.value ?? meta;
    }
  }
  return null;
};

/**
 * Dual-source lookup: formData (labeled) first, then answers (ID-keyed).
 */
const find = (fd, ans, keywords) => {
  return findInFormData(fd, keywords) ?? findInAnswers(ans, keywords);
};

// ── Main Parser ─────────────────────────────────────────────────

export const parseSubmissionFields = (sub) => {
  if (!sub) return {};
  const ans = sub.answers || {};
  const fd  = sub.formData || {};

  // ── Core Fields ──
  let title        = find(fd, ans, TITLE_KW) || 'Untitled Submission';
  let abstract     = find(fd, ans, ABSTRACT_KW) || 'No abstract provided';
  let benefits     = find(fd, ans, BENEFITS_KW) || 'No benefits provided';
  let dept         = find(fd, ans, DEPT_KW) || 'Unknown';
  let employeeName = find(fd, ans, NAME_KW) || 'Unknown';
  let employeeCode = find(fd, ans, CODE_KW) || 'Unknown';

  // ── Management Chain ──
  let rmName   = find(fd, ans, RM_NAME_KW) || '';
  let rmEmail  = find(fd, ans, RM_EMAIL_KW) || '';
  let hodName  = find(fd, ans, HOD_NAME_KW) || '';
  let hodEmail = find(fd, ans, HOD_EMAIL_KW) || '';

  // ── Budget ──
  let budget   = find(fd, ans, BUDGET_KW) || '';
  let category = find(fd, ans, CATEGORY_KW) || '';
  let submissionType = find(fd, ans, SUBTYPE_KW) || sub.submissionType || 'Idea';

  // ── Compose Display Values ──
  let rmValue = '';
  if (rmName && rmEmail) rmValue = `${rmName} (${rmEmail})`;
  else rmValue = rmName || rmEmail || 'Unknown RM';

  let hodValue = '';
  if (hodName && hodEmail) hodValue = `${hodName} (${hodEmail})`;
  else hodValue = hodName || hodEmail || 'Unknown HOD';

  // ── Workflow Data (from submission.workflow) ──
  const workflow = sub.workflow || {};
  const rmReview = workflow.rmReview || {};
  const hodReview = workflow.hodReview || {};
  const evaluationReview = workflow.evaluationReview || {};
  const financeReview = workflow.financeReview || {};

  // ── Approved Budget ──
  const approvedBudget = financeReview.approvedBudget ?? null;
  const userBudget = budget;

  return {
    // Core proposal fields
    title,
    abstract,
    benefits,
    dept,
    employeeName,
    employeeCode,

    // Management chain
    rmValue,
    hodValue,
    rmEmail,
    rmName,
    hodEmail,
    hodName,

    // Financial
    budget,
    approvedBudget,
    userBudget,
    category,
    submissionType,

    // Workflow review data
    rmReview,
    hodReview,
    evaluationReview,
    financeReview,

    // Project Details
    projectDetails: sub.projectDetails || {
      owner: null,
      implementationStatus: 'Approved',
      progressPercentage: 0,
      updates: [],
      expectedBenefits: '',
      actualBenefits: ''
    },

    // Metadata
    businessId: sub.businessId || `SUB-${(sub._id || '').toString().substring(18).toUpperCase()}`,
    status: sub.status || 'NEW',
    submitterEmail: sub.submitterEmail || '',
    attachments: sub.attachments || [],
    timeline: sub.timeline || [],
    formData: fd,
    answers: ans,
  };
};

// ── Key Formatter ───────────────────────────────────────────────

export const formatKey = (key) => {
  if (!key) return '';
  const kLower = key.toLowerCase();
  if (kLower === 'dob') return 'Date of Birth';
  if (kLower === 'hodname') return 'HOD Name';
  if (kLower === 'hodemail') return 'HOD Email';
  if (kLower === 'hod') return 'Head of Department';
  if (kLower === 'rmemail') return 'Reporting Manager Email';
  if (kLower === 'rmname') return 'Reporting Manager Name';

  const result = key
    .replace(/([A-Z])/g, ' $1') // Insert a space before capital letters
    .replace(/[_-]/g, ' ')       // Replace underscores/hyphens with spaces
    .replace(/\s+/g, ' ')        // Collapse multiple spaces
    .trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
};
