// ─────────────────────────────────────────────────────────────
//  CubeTech Innovation Portal — Form Store (Mock State)
// ─────────────────────────────────────────────────────────────
import api from '../utils/api';
import { parseSubmissionFields } from '../utils/submissionParser';

export const uid = () => `id-${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

// ── Categories ────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id:'cat-1', name:'Innovation',          color:'#7C3AED', icon:'💡', enabled:true },
  { id:'cat-2', name:'Process Improvement', color:'#2563EB', icon:'⚙️', enabled:true },
  { id:'cat-3', name:'Cost Saving',         color:'#059669', icon:'💰', enabled:true },
  { id:'cat-4', name:'Automation',          color:'#D97706', icon:'🤖', enabled:true },
  { id:'cat-5', name:'Safety',              color:'#DC2626', icon:'🛡️', enabled:true },
  { id:'cat-6', name:'Quality Improvement', color:'#0891B2', icon:'✅', enabled:true },
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
  { value:'rating',      label:'Rating',            icon:'Star',      group:'Advanced' },
  { value:'file',        label:'File Upload',       icon:'AttachFile',group:'Advanced' },
];

export const FIELD_TYPE_COLORS = {
  text:'#7C3AED', textarea:'#2563EB', number:'#059669', email:'#D97706',
  phone:'#DC2626', url:'#0891B2', date:'#DB2777', dropdown:'#9333EA',
  radio:'#2563EB', checkbox:'#059669', multiselect:'#D97706', rating:'#F59E0B', file:'#64748B',
};

// ── Default Form Sections ─────────────────────────────────────
const makeDefaultSections = () => ([
  {
    id:'sec-1', title:'Basic Details', description:'Submitter information',
    fields:[
      { id:'f-name',  label:'Full Name',  type:'text',     required:true,  placeholder:'Your full name',   helpText:'',  defaultValue:'', validationRule:'', isDefault:true },
      { id:'f-email', label:'Email',      type:'email',    required:false, placeholder:'your@email.com',   helpText:'',  defaultValue:'', validationRule:'', isDefault:true },
      { id:'f-cat',   label:'Category',   type:'dropdown', required:true,  placeholder:'',                 helpText:'Select the category that best fits', defaultValue:'', validationRule:'', isDefault:true, options:[] },
    ],
  },
  {
    id:'sec-2', title:'Idea Information', description:'Describe your idea',
    fields:[
      { id:'f-title',   label:'Idea Title',           type:'text',     required:true,  placeholder:'Brief title of your idea',     helpText:'Keep it concise — max 100 chars', defaultValue:'', validationRule:'max:100', isDefault:true },
      { id:'f-details', label:'Idea Details',         type:'textarea', required:true,  placeholder:'Describe your idea in detail...', helpText:'Problem statement, solution, expected impact', defaultValue:'', validationRule:'', isDefault:true },
      { id:'f-collab',  label:'Collaborators',        type:'text',     required:false, placeholder:'e.g. John, Jane (comma-separated)', helpText:'',defaultValue:'',validationRule:'',isDefault:true },
      { id:'f-impact',  label:'Expected Impact',      type:'textarea', required:false, placeholder:'Quantify the expected benefits...', helpText:'', defaultValue:'', validationRule:'',isDefault:true },
    ],
  },
  {
    id:'sec-3', title:'Supporting Documents', description:'Attach any supporting files',
    fields:[
      { id:'f-file',    label:'Attachments',           type:'file',     required:false, placeholder:'', helpText:'PDF, DOC, Images up to 10MB', defaultValue:'', validationRule:'', isDefault:true },
      { id:'f-comments',label:'Additional Comments',   type:'textarea', required:false, placeholder:'Any additional context...', helpText:'', defaultValue:'', validationRule:'', isDefault:true },
    ],
  },
]);

// ── Templates ─────────────────────────────────────────────────
const TEMPLATES = [
  {
    id:'tpl-1', name:'Idea Submission',        category:'Innovation',          icon:'💡', description:'Standard idea submission form with category, title, and details',
    sections: makeDefaultSections(),
  },
  {
    id:'tpl-2', name:'Employee Feedback',      category:'Quality Improvement', icon:'📋', description:'Collect structured employee feedback',
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
    id:'tpl-3', name:'Process Improvement',    category:'Process Improvement', icon:'⚙️', description:'Submit process improvement proposals',
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
    id:'tpl-4', name:'Innovation Proposal',    category:'Innovation',          icon:'🚀', description:'Detailed innovation proposal with impact metrics',
    sections: makeDefaultSections(),
  },
  {
    id:'tpl-5', name:'Safety Incident Report', category:'Safety',              icon:'🛡️', description:'Report safety incidents or near-miss events',
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
