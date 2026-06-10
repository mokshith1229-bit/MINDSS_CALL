export const parseSubmissionFields = (sub) => {
  if (!sub) return {};
  const ans = sub.answers || {};

  // Direct mappings
  let title = ans.title || ans.ideaTitle || ans.proposalTitle;
  let abstract = ans.abstract || ans.introduction || ans.description || ans.details || ans.ideaDetails;
  let dept = ans.department || ans.dept;
  let employeeName = ans.name || ans.employeeName || ans.fullName || ans.submitterName;
  let employeeCode = ans.employeeCode || ans.empCode || ans.code;
  let benefits = ans.benefits || ans.benefit;
  let rmValue = ans.managerName || ans.reportingManagerName || ans.rmName;
  let rmEmail = ans.managerEmail || ans.reportingManagerEmail || ans.rmEmail;
  let hodEmail = ans.hodEmail;
  let rmName = ans.managerName || ans.reportingManagerName || ans.rmName;
  let hodName = ans.hodName;
  let hodValue = ans.hodName || ans.hodEmail || '';

  // Enhance RM and HOD display
  if (ans.managerEmail || ans.reportingManagerEmail) {
    const email = ans.managerEmail || ans.reportingManagerEmail;
    const name = ans.managerName || ans.reportingManagerName;
    rmValue = name ? `${name} (${email})` : email;
  }
  if (ans.hodEmail) {
    const email = ans.hodEmail;
    const name = ans.hodName;
    hodValue = name ? `${name} (${email})` : email;
  }

  // Key-search fallbacks if properties are named differently
  const findVal = (keywords) => {
    for (const key of Object.keys(ans)) {
      const kLower = key.toLowerCase();
      if (keywords.some(kw => kLower.includes(kw))) {
        return ans[key];
      }
    }
    return null;
  };

  if (!title) title = findVal(['title']) || 'Untitled Submission';
  if (!abstract) abstract = findVal(['abstract', 'introduction', 'description', 'details']) || 'No abstract provided';
  if (!dept) dept = findVal(['department', 'dept']) || 'Unknown';
  if (!employeeName) employeeName = findVal(['name', 'fullname']) || 'Unknown';
  if (!employeeCode) employeeCode = findVal(['code', 'empcode']) || 'Unknown';
  if (!benefits) benefits = findVal(['benefit']) || 'No benefits provided';
  if (!rmEmail) rmEmail = findVal(['manageremail', 'rmemail']);
  if (!hodEmail) hodEmail = findVal(['hodemail']);
  if (!rmName) rmName = findVal(['managername', 'rmname']);
  if (!hodName) hodName = findVal(['hodname']);

  if (!rmValue) {
    if (rmName && rmEmail) rmValue = `${rmName} (${rmEmail})`;
    else rmValue = rmName || rmEmail || 'Unknown RM';
  }
  if (!hodValue) {
    if (hodName && hodEmail) hodValue = `${hodName} (${hodEmail})`;
    else hodValue = hodName || hodEmail || 'Unknown HOD';
  }

  return {
    title,
    abstract,
    dept,
    employeeName,
    employeeCode,
    benefits,
    rmValue,
    hodValue,
    rmEmail: rmEmail || '',
    hodEmail: hodEmail || '',
    rmName: rmName || '',
    hodName: hodName || '',
  };
};

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
