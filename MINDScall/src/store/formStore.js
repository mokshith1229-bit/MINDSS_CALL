// ─────────────────────────────────────────────────────────────
//  CubeTech Innovation Portal — Form Store (Mock State)
// ─────────────────────────────────────────────────────────────
import api from '../utils/api';
import { parseSubmissionFields } from '../utils/submissionParser';

export const uid = () => `id-${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

// ── Categories ────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id:'cat-1', name:'Process Development', color:'#7C3AED', icon:'⚙️', enabled:true },
  { id:'cat-2', name:'Product Development', color:'#2563EB', icon:'📦', enabled:true },
];

// ── Field Type Registry ───────────────────────────────────────
export const FIELD_TYPES = [
  { value:'text',        label:'Single Line Text',  icon:'Abc',       group:'Basic' },
  { value:'textarea',    label:'Multi Line Text',   icon:'Notes',     group:'Basic' },
  { value:'number',      label:'Number',            icon:'Numbers',   group:'Basic' },
  { value:'email',       label:'Email',             icon:'Email',     group:'Basic' },
  { value:'phone',       label:'Phone Number',      icon:'Phone',     group:'Basic' },
  { value:'url',         label:'URL',               icon:'Link',      group:'Basic' },
  { value:'date',        label:'Date Picker',       icon:'Today',     group:'Advanced' },
  { value:'dropdown',    label:'Dropdown',          icon:'ArrowDropDownCircle', group:'Choice' },
  { value:'radio',       label:'Radio Button',      icon:'RadioButtonChecked', group:'Choice' },
  { value:'checkbox',    label:'Checkbox',          icon:'CheckBox',  group:'Choice' },
  { value:'multiselect', label:'Multi Select',      icon:'Checklist', group:'Choice' },
  { value:'card_selector',label:'Card Selector',    icon:'Style',     group:'Choice' },
  { value:'rating',      label:'Rating',            icon:'Star',      group:'Advanced' },
  { value:'file',        label:'File Upload',       icon:'AttachFile',group:'Advanced' },
  { value:'signature',   label:'Signature',         icon:'Draw',      group:'Advanced' },
  { value:'heading',     label:'Heading',           icon:'Title',     group:'Display' },
  { value:'paragraph',   label:'Paragraph',         icon:'Subject',   group:'Display' },
  { value:'divider',     label:'Divider',           icon:'HorizontalRule', group:'Display' },
];

export const FIELD_TYPE_COLORS = {
  text:'#7C3AED', textarea:'#2563EB', number:'#059669', email:'#D97706',
  phone:'#DC2626', url:'#0891B2', date:'#DB2777', dropdown:'#9333EA',
  radio:'#2563EB', checkbox:'#059669', multiselect:'#D97706', card_selector:'#0284C7',
  rating:'#F59E0B', file:'#64748B', signature:'#475569',
  heading:'#1E293B', paragraph:'#64748B', divider:'#94A3B8',
};

// ── Default Form Sections ─────────────────────────────────────
export const makeDefaultSections = () => ([
  {
    id:'sec-employee', title:'Employee Information', description:'Provide your personal and organizational details',
    fields:[
      { id:uid(), label:'Full Name', type:'text', required:true, placeholder:'e.g. Rajesh Kumar', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Employee ID', type:'text', required:true, placeholder:'e.g. EMP-1029', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Designation', type:'text', required:true, placeholder:'e.g. Senior Engineer', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Department', type:'text', required:true, placeholder:'e.g. Engineering', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Official Email ID', type:'email', required:true, placeholder:'name@company.com', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Contact Number', type:'phone', required:true, placeholder:'+91 98765 43210', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Reporting Manager Name', type:'text', required:true, placeholder:"Manager's full name", helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Reporting Manager Email ID', type:'email', required:true, placeholder:'manager@company.com', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
    ],
  },
  {
    id:'sec-type', title:'Submission Type', description:'Choose whether you are submitting an Idea or a formal Proposal.',
    fields:[
      { id:'f-sub-type', label:'Submission Type', type:'card_selector', required:true, placeholder:'', helpText:'', defaultValue:'Idea', validationRule:'', isDefault:true, options:['Idea', 'Proposal'] },
    ],
  },
  {
    id:'sec-class', title:'Classification', description:'Categorize your submission for proper routing and evaluation.',
    fields:[
      { id:uid(), label:'Category', type:'dropdown', required:true, placeholder:'Select a category', helpText:'', defaultValue:'', validationRule:'', isDefault:true, options:['Process Development', 'Product Development'] },
      { id:uid(), label:'Sub-Category', type:'dropdown', required:true, placeholder:'Select a sub-category', helpText:'', defaultValue:'', validationRule:'', isDefault:true, options:['Software', 'Hardware', 'Operations', 'Safety'] },
      { id:uid(), label:'Innovation Type', type:'dropdown', required:true, placeholder:'Select innovation type', helpText:'', defaultValue:'', validationRule:'', isDefault:true, options:['Incremental', 'Breakthrough', 'Disruptive'] },
    ],
  },
  {
    id:'sec-idea', title:'Idea Details', description:'Describe your innovative idea clearly and concisely.',
    visibilityRule: { fieldId: 'Submission Type', value: 'Idea' },
    fields:[
      { id:'f-idea-title', label:'Idea / Project Title', type:'text', required:true, placeholder:'Enter a clear and descriptive title for your idea', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:'f-idea-abs', label:'Abstract', type:'textarea', required:true, placeholder:'Describe the background, proposed idea, and expected benefits...', helpText:'Max 200 words', defaultValue:'', validationRule:'max:200', isDefault:true },
    ],
  },
  {
    id:'sec-proposal', title:'Project Overview', description:'Provide a comprehensive overview of your proposed project.',
    visibilityRule: { fieldId: 'Submission Type', value: 'Proposal' },
    fields:[
      { id:'f-prop-title', label:'Project Title', type:'text', required:true, placeholder:'Enter the project title', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Executive Summary', type:'textarea', required:true, placeholder:'Provide a brief executive summary...', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Problem Statement', type:'textarea', required:true, placeholder:'Clearly define the problem...', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Objectives', type:'textarea', required:true, placeholder:'List the key objectives...', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
      { id:uid(), label:'Scope of Work', type:'textarea', required:true, placeholder:'Define the scope and deliverables...', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
    ],
  },
  {
    id:'sec-attach', title:'Supporting Documents', description:'Upload any files that support your submission. This step is optional.',
    fields:[
      { id:'f-attach', label:'Attachments', type:'file', required:false, placeholder:'', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
    ],
  },
]);

// ── Templates ─────────────────────────────────────────────────
const TEMPLATES = [
  {
    id:'tpl-1', name:'Proposal / Idea Submission',        category:'Process Development',          icon:'💡', description:'Standard submission form with Idea and Proposal branching',
    sections: makeDefaultSections(),
  },
  {
    id:'tpl-2', name:'Employee Feedback',      category:'Product Development', icon:'📋', description:'Collect structured employee feedback',
    sections:[
      { id:'sec-a', title:'Employee Info', description:'', fields:[
        { id:uid(), label:'Name', type:'text', required:true, placeholder:'Your name', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'Department', type:'dropdown', required:true, placeholder:'', helpText:'', defaultValue:'', validationRule:'', isDefault:false, options:['Engineering','HR','Finance','Operations','Marketing'] },
      ]},
      { id:'sec-b', title:'Feedback', description:'', fields:[
        { id:uid(), label:'Overall Rating', type:'rating', required:true, placeholder:'', helpText:'Rate your overall experience', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'What went well?', type:'textarea', required:true, placeholder:'Describe positive aspects...', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'What can be improved?', type:'textarea', required:false, placeholder:'Suggest improvements...', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
      ]},
    ],
  },
  {
    id:'tpl-3', name:'Process Development',    category:'Process Development', icon:'⚙️', description:'Submit process development proposals',
    sections:[
      { id:'sec-c', title:'Submitter', description:'', fields:[
        { id:uid(), label:'Name', type:'text', required:true, placeholder:'', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'Department', type:'text', required:true, placeholder:'', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
      ]},
      { id:'sec-d', title:'Process Details', description:'', fields:[
        { id:uid(), label:'Process Name', type:'text', required:true, placeholder:'Current process name', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'Problem Statement', type:'textarea', required:true, placeholder:'Describe the current problem...', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'Proposed Solution', type:'textarea', required:true, placeholder:'Your proposed improvement...', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'Estimated Savings', type:'number', required:false, placeholder:'₹ per year', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
      ]},
    ],
  },

  {
    id:'tpl-5', name:'Safety Incident Report', category:'Process Development',              icon:'🛡️', description:'Report safety incidents or near-miss events',
    sections:[
      { id:'sec-e', title:'Reporter', description:'', fields:[
        { id:uid(), label:'Reporter Name', type:'text', required:true, placeholder:'', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'Date of Incident', type:'date', required:true, placeholder:'', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'Location', type:'text', required:true, placeholder:'Building/Floor/Area', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
      ]},
      { id:'sec-f', title:'Incident Details', description:'', fields:[
        { id:uid(), label:'Incident Type', type:'dropdown', required:true, placeholder:'', helpText:'', defaultValue:'', validationRule:'', isDefault:false, options:['Near Miss','Minor Injury','Major Injury','Property Damage','Environmental'] },
        { id:uid(), label:'Description', type:'textarea', required:true, placeholder:'Describe what happened...', helpText:'', defaultValue:'', validationRule:'', isDefault:false },
        { id:uid(), label:'Severity', type:'radio', required:true, placeholder:'', helpText:'', defaultValue:'', validationRule:'', isDefault:false, options:['Low','Medium','High','Critical'] },
      ]},
    ],
  },
];

// ── Live Submissions & Forms ──────────────────────────────────
let _categories  = DEFAULT_CATEGORIES.map(c=>({...c}));
let _forms       = [];
let _submissions = [];
let _versions    = [];
let _templates   = TEMPLATES.map(t=>({...t}));
const _listeners = new Set();

const notify = () => _listeners.forEach(fn => fn());

// ── Store API ─────────────────────────────────────────────────
export const formStore = {
  subscribe(fn){ _listeners.add(fn); return ()=>_listeners.delete(fn); },

  // — Initialization —
  async init() {
    try {
      // Fetch submissions
      try {
        const subsRes = await api.get('/admin/submissions');
        if (subsRes.data && subsRes.data.success) {
          _submissions = subsRes.data.data.submissions.map(s => {
            const parsed = parseSubmissionFields(s);

            return {
              id: s._id,
              formId: s.form?._id || s.form,
              formTitle: s.form?.title || 'Unknown Form',
              answers: s.answers || {},
              formData: s.formData || {},
              formVersion: s.formVersion || {},
              parsedTitle: parsed.title,
              employeeName: parsed.employeeName,
              employeeCode: parsed.employeeCode,
              dept: parsed.dept,
              abstract: parsed.abstract,
              benefits: parsed.benefits,
              rmValue: parsed.rmValue,
              hodValue: parsed.hodValue,
              rmEmail: parsed.rmEmail,
              rmName: parsed.rmName,
              hodEmail: parsed.hodEmail,
              hodName: parsed.hodName,
              budget: parsed.budget,
              submitterEmail: s.submitterEmail || '',
              status: s.status.toLowerCase(),
              businessId: parsed.businessId,
              trackingId: s.trackingId || '',
              submissionType: parsed.submissionType,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
              attachments: s.attachments || [],
              timeline: s.timeline || [],
              workflow: s.workflow || {},
              projectDetails: parsed.projectDetails || {
                owner: null,
                implementationStatus: 'Approved',
                progressPercentage: 0,
                updates: [],
                expectedBenefits: '',
                actualBenefits: ''
              },
            };
          });
        }
      } catch (subsErr) {
        console.error('Failed to load submissions in formStore init:', subsErr);
      }

      // Fetch forms
      try {
        const formsRes = await api.get('/admin/forms');
        if (formsRes.data && formsRes.data.success) {
          _forms = formsRes.data.data.forms.map(f => ({
            id: f._id,
            name: f.title,
            description: f.description,
            slug: f.slug,
            status: f.status.toLowerCase(), // 'published', 'draft', 'archived'
            category: f.category || 'Innovation',
            linkSettings: f.linkSettings || { expiryDate: '', maxResponses: null, onePerUser: false },
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
            sections: f.sections || [],
            currentVersion: f.currentVersion || 1,
            responses: _submissions.filter(s => s.formId === f._id).length,
          }));

          // Fetch all form versions for version history feature
          try {
            const versionsPromises = _forms.map(f => api.get(`/admin/forms/${f.id}/versions`).catch(() => ({ data: { success: false } })));
            const versionsResponses = await Promise.all(versionsPromises);
            _versions = versionsResponses.flatMap((res, index) => {
              if (res.data && res.data.success) {
                const formId = _forms[index].id;
                return res.data.data.versions.map(v => ({
                  version: v.versionNumber,
                  formId,
                  savedAt: v.createdAt,
                  note: v.versionNumber === 1 ? 'Initial Version' : 'Updated',
                  sections: v.schema
                }));
              }
              return [];
            });
          } catch (versErr) {
            console.error('Failed to load form versions in formStore init:', versErr);
          }
        }
      } catch (formsErr) {
        console.error('Failed to load forms in formStore init:', formsErr);
      }

      notify();
    } catch (err) {
      console.error('Failed to initialize formStore from backend:', err);
    }
  },

  // — Categories —
  getCategories(){ return _categories; },
  addCategory(c){ _categories=[..._categories,c]; notify(); },
  updateCategory(id,d){ _categories=_categories.map(c=>c.id===id?{...c,...d}:c); notify(); },
  deleteCategory(id){ _categories=_categories.filter(c=>c.id!==id); notify(); },
  toggleCategory(id){ _categories=_categories.map(c=>c.id===id?{...c,enabled:!c.enabled}:c); notify(); },

  // — Forms —
  getForms(){ return _forms; },
  getFormBySlug(slug){ return _forms.find(f=>f.slug===slug)||null; },
  getFormById(id){ return _forms.find(f=>f.id===id)||null; },
  
  async addForm(f){
    try {
      const res = await api.post('/admin/forms', {
        title: f.name,
        description: f.description || '',
        slug: f.slug,
        category: f.category || 'Innovation',
        schema: f.sections || [],
      });
      if (res.data && res.data.success) {
        const created = res.data.data.form;
        const activeVer = res.data.data.activeVersion;
        const newForm = {
          id: created._id,
          name: created.title,
          description: created.description,
          slug: created.slug,
          status: created.status.toLowerCase(),
          category: created.category,
          linkSettings: created.linkSettings,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          sections: activeVer ? activeVer.schema : [],
          currentVersion: activeVer ? activeVer.versionNumber : 1,
          responses: 0,
        };
        _forms = [newForm, ..._forms];
        notify();
        return newForm;
      }
    } catch (err) {
      console.error('Failed to create form:', err);
      throw err;
    }
  },

  async updateForm(id,d){
    try {
      if (d.sections) {
        // Publish new version
        const verRes = await api.put(`/admin/forms/${id}/versions`, {
          schema: d.sections
        });
        if (verRes.data && verRes.data.success) {
          const activeVer = verRes.data.data.activeVersion;
          // Prepend to in-memory versions list
          _versions = [{
            version: activeVer.versionNumber,
            formId: id,
            savedAt: activeVer.createdAt,
            note: 'Updated',
            sections: activeVer.schema
          }, ..._versions];

          _forms = _forms.map(f => f.id === id ? {
            ...f,
            sections: activeVer.schema,
            currentVersion: activeVer.versionNumber,
          } : f);
        }
      }

      // Update metadata (always update to keep titles and categories in sync)
      const res = await api.patch(`/admin/forms/${id}`, {
        title: d.name,
        description: d.description,
        slug: d.slug,
        status: d.status ? d.status.toUpperCase() : undefined,
        category: d.category,
        linkSettings: d.linkSettings,
      });

      if (res.data && res.data.success) {
        const updated = res.data.data.form;
        _forms = _forms.map(f => f.id === id ? {
          ...f,
          name: updated.title,
          description: updated.description,
          slug: updated.slug,
          status: updated.status.toLowerCase(),
          category: updated.category,
          linkSettings: updated.linkSettings,
          updatedAt: updated.updatedAt,
        } : f);
      }

      notify();
    } catch (err) {
      console.error('Failed to update form:', err);
      throw err;
    }
  },

  async deleteForm(id){
    try {
      const res = await api.delete(`/admin/forms/${id}`);
      if (res.data && res.data.success) {
        _forms = _forms.filter(f => f.id !== id);
        _submissions = _submissions.filter(s => s.formId !== id);
        notify();
      }
    } catch (err) {
      console.error('Failed to delete form:', err);
      throw err;
    }
  },

  async duplicateForm(id){
    const orig = _forms.find(f => f.id === id);
    if (!orig) return null;
    const newSlug = `${slugify(orig.name)}-copy-${Date.now().toString(36)}`;
    try {
      const res = await api.post('/admin/forms', {
        title: `${orig.name} (Copy)`,
        description: orig.description,
        slug: newSlug,
        category: orig.category,
        schema: orig.sections || [],
      });
      if (res.data && res.data.success) {
        const created = res.data.data.form;
        const activeVer = res.data.data.activeVersion;
        const copy = {
          id: created._id,
          name: created.title,
          description: created.description,
          slug: created.slug,
          status: 'draft',
          category: created.category,
          linkSettings: created.linkSettings,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          sections: activeVer ? activeVer.schema : [],
          currentVersion: activeVer ? activeVer.versionNumber : 1,
          responses: 0,
        };
        // Update status to DRAFT
        await api.patch(`/admin/forms/${created._id}`, { status: 'DRAFT' });
        
        _forms = [copy, ..._forms];
        notify();
        return copy;
      }
    } catch (err) {
      console.error('Failed to duplicate form:', err);
      throw err;
    }
  },

  async setStatus(id,status){
    try {
      const res = await api.patch(`/admin/forms/${id}`, {
        status: status.toUpperCase()
      });
      if (res.data && res.data.success) {
        _forms = _forms.map(f => f.id === id ? {
          ...f,
          status: status.toLowerCase(),
          updatedAt: res.data.data.form.updatedAt
        } : f);
        notify();
      }
    } catch (err) {
      console.error('Failed to set status:', err);
      throw err;
    }
  },

  async updateLinkSettings(id,settings){
    try {
      const res = await api.patch(`/admin/forms/${id}`, {
        linkSettings: settings
      });
      if (res.data && res.data.success) {
        _forms = _forms.map(f => f.id === id ? {
          ...f,
          linkSettings: res.data.data.form.linkSettings
        } : f);
        notify();
      }
    } catch (err) {
      console.error('Failed to update link settings:', err);
      throw err;
    }
  },

  async regenerateSlug(id){
    const f = _forms.find(fm => fm.id === id);
    if (!f) return;
    const newSlug = `${slugify(f.name)}-${Date.now().toString(36)}`;
    try {
      const res = await api.patch(`/admin/forms/${id}`, {
        slug: newSlug
      });
      if (res.data && res.data.success) {
        _forms = _forms.map(fm => fm.id === id ? {
          ...fm,
          slug: newSlug
        } : fm);
        notify();
      }
    } catch (err) {
      console.error('Failed to regenerate slug:', err);
      throw err;
    }
  },

  // — Submissions —
  getAllSubmissions(){ return _submissions; },
  getSubmissions(formId){ return _submissions.filter(s=>s.formId===formId); },
  
  addSubmission(sub){
    // Submissions are typically created by the public, but we keep this method for in-memory sync
    _submissions=[sub,..._submissions];
    _forms=_forms.map(f=>f.id===sub.formId?{...f,responses:(_submissions.filter(s=>s.formId===f.id).length)}:f);
    notify();
  },

  async updateSubmissionStatus(id,status){
    try {
      const res = await api.patch(`/admin/submissions/${id}/status`, {
        status: status.toUpperCase()
      });
      if (res.data && res.data.success) {
        _submissions = _submissions.map(s => s.id === id ? {
          ...s,
          status: status.toLowerCase()
        } : s);
        notify();
      }
    } catch (err) {
      console.error('Failed to update submission status:', err);
      throw err;
    }
  },

  async updateProjectDetails(id, details){
    try {
      const res = await api.patch(`/admin/submissions/${id}/project-details`, details);
      if (res.data && res.data.success) {
        _submissions = _submissions.map(s => s.id === id ? {
          ...s,
          projectDetails: res.data.data.submission.projectDetails
        } : s);
        notify();
      }
    } catch (err) {
      console.error('Failed to update project details:', err);
      throw err;
    }
  },

  async addProjectUpdate(id, formData){
    try {
      const res = await api.post(`/admin/submissions/${id}/project-updates`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data && res.data.success) {
        _submissions = _submissions.map(s => s.id === id ? {
          ...s,
          projectDetails: res.data.data.submission.projectDetails,
          timeline: res.data.data.submission.timeline
        } : s);
        notify();
      }
    } catch (err) {
      console.error('Failed to add project update:', err);
      throw err;
    }
  },

  async deleteSubmission(id){
    try {
      const res = await api.delete(`/admin/submissions/${id}`);
      if (res.data && res.data.success) {
        _submissions = _submissions.filter(s => s.id !== id);
        notify();
      }
    } catch (err) {
      console.error('Failed to delete submission:', err);
      throw err;
    }
  },

  // — Versions —
  getVersions(formId){ return _versions.filter(v=>v.formId===formId).sort((a,b)=>b.version-a.version); },
  
  async restoreVersion(formId,version){
    try {
      const res = await api.post(`/admin/forms/${formId}/versions/${version}/restore`);
      if (res.data && res.data.success) {
        const activeVer = res.data.data.activeVersion;
        _forms = _forms.map(f => f.id === formId ? {
          ...f,
          sections: activeVer.schema,
          currentVersion: activeVer.versionNumber,
          updatedAt: activeVer.updatedAt
        } : f);
        notify();
      }
    } catch (err) {
      console.error('Failed to restore version:', err);
      throw err;
    }
  },

  // — Templates —
  getTemplates(){ return _templates; },
  saveAsTemplate(form){
    const tpl={id:uid(),name:form.name,category:form.category,icon:'📋',description:`Template from ${form.name}`,sections:form.sections};
    _templates=[tpl,..._templates]; notify();
  },
  deleteTemplate(id){ _templates=_templates.filter(t=>t.id!==id); notify(); },

  TEMPLATES,
  FIELD_TYPES,
  FIELD_TYPE_COLORS,
};
