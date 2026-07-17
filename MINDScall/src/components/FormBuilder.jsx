import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, IconButton, Chip, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Divider, Paper, Collapse, Menu, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, List, ListItem,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  DragIndicator as DragIcon, ContentCopy as DuplicateIcon,
  ExpandMore as ExpandIcon, ExpandLess as CollapseIcon,
  TextFields as TextIcon, Notes as TextAreaIcon, Numbers as NumberIcon,
  Email as EmailIcon, Phone as PhoneIcon, Link as LinkIcon,
  Today as DateIcon, ArrowDropDownCircle as DropdownIcon,
  RadioButtonChecked as RadioIcon, CheckBox as CheckboxIcon,
  Checklist as MultiSelectIcon, Star as StarIcon, AttachFile as FileIcon,
  Settings as SettingsIcon, Close as CloseIcon, MoreVert as MenuIcon,
  ArrowUpward as MoveUpIcon, ArrowDownward as MoveDownIcon,
  Visibility as ShowIcon, VisibilityOff as HideIcon,
  Lock as LockIcon, LockOpen as UnlockIcon,
  Style as CardSelectorIcon, Draw as SignatureIcon, Title as HeadingIcon, Subject as ParagraphIcon, HorizontalRule as DividerIcon,
} from '@mui/icons-material';
import { uid, FIELD_TYPES, FIELD_TYPE_COLORS } from '../store/formStore';

const ICON_MAP = {
  TextFields: TextIcon, Notes: TextAreaIcon, Numbers: NumberIcon,
  Email: EmailIcon, Phone: PhoneIcon, Link: LinkIcon,
  Today: DateIcon, ArrowDropDownCircle: DropdownIcon,
  RadioButtonChecked: RadioIcon, CheckBox: CheckboxIcon,
  Checklist: MultiSelectIcon, Star: StarIcon, AttachFile: FileIcon,
  Style: CardSelectorIcon, Draw: SignatureIcon, Title: HeadingIcon, Subject: ParagraphIcon, HorizontalRule: DividerIcon,
  Abc: TextIcon,
};

const FieldTypeIcon = ({ iconName, ...props }) => {
  const Comp = ICON_MAP[iconName] || TextIcon;
  return <Comp {...props} />;
};

// ── Option Row Component (For Choice Fields) ──────────────────────────────────
const OptionRow = ({ option, idx, totalOptions, onEdit, onDelete, onDuplicate, onMove, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(option);

  const handleSave = () => {
    if (val.trim()) {
      onEdit(idx, val.trim());
      setIsEditing(false);
    }
  };

  return (
    <Box
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 1, borderRadius: 1,
        bgcolor: isDragOver ? '#EFF6FF' : 'transparent',
        border: `1px solid ${isDragOver ? '#2563EB' : 'transparent'}`,
        transition: 'all 0.15s',
      }}
    >
      <DragIcon sx={{ color: '#CBD5E1', fontSize: 16, cursor: 'grab' }} />
      {isEditing ? (
        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
          <TextField size="small" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} autoFocus sx={{ flex: 1 }} />
          <Button size="small" variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      ) : (
        <>
          <Typography variant="body2" sx={{ flex: 1, color: '#334155', fontWeight: 500 }}>{option}</Typography>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <Tooltip title="Edit Option">
              <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ '&:hover': { color: '#2563EB' } }}>
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate Option">
              <IconButton size="small" onClick={() => onDuplicate(idx)} sx={{ '&:hover': { color: '#D97706' } }}>
                <DuplicateIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Option">
              <IconButton size="small" onClick={() => onDelete(idx)} sx={{ '&:hover': { color: '#DC2626' } }}>
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <IconButton size="small" disabled={idx === 0} onClick={() => onMove(idx, -1)}><MoveUpIcon sx={{ fontSize: 14 }} /></IconButton>
            <IconButton size="small" disabled={idx === totalOptions - 1} onClick={() => onMove(idx, 1)}><MoveDownIcon sx={{ fontSize: 14 }} /></IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

// ── Field Config Inline Panel ─────────────────────────────────────────────────
const FieldConfigPanel = ({ field, onSave, onClose }) => {
  const [data, setData] = useState({ ...field });
  const set = k => e => setData(p => ({ ...p, [k]: e.target ? e.target.value : e }));
  const hasOptions = ['dropdown','radio','checkbox','multiselect'].includes(data.type);
  const [optInput, setOptInput] = useState('');
  const [dragOptIdx, setDragOptIdx] = useState(null);
  const [dragOverOptIdx, setDragOverOptIdx] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Prevent saving if data hasn't actually changed from the initial field props
    if (JSON.stringify(data) === JSON.stringify(field)) return;
    
    setSaveStatus('Saving...');
    const timer = setTimeout(() => {
      try {
        onSave(data);
        setSaveStatus('✓ All changes saved');
      } catch (err) {
        setSaveStatus('Unable to save changes. Retrying...');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [data, field, onSave]);

  const addOption = () => {
    if (!optInput.trim()) return;
    setData(p => ({ ...p, options: [...(p.options || []), optInput.trim()] }));
    setOptInput('');
  };
  const editOption = (idx, newVal) => {
    setData(p => ({ ...p, options: p.options.map((o, i) => i === idx ? newVal : o) }));
  };
  const removeOption = idx => setData(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }));
  const duplicateOption = idx => {
    const opts = [...(data.options || [])];
    opts.splice(idx + 1, 0, `${opts[idx]} (Copy)`);
    setData(p => ({ ...p, options: opts }));
  };
  const moveOption = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= (data.options || []).length) return;
    const opts = [...(data.options || [])];
    [opts[idx], opts[target]] = [opts[target], opts[idx]];
    setData(p => ({ ...p, options: opts }));
  };
  const handleOptionDrop = (toIdx) => {
    if (dragOptIdx === null || dragOptIdx === toIdx) return;
    const opts = [...(data.options || [])];
    const [moved] = opts.splice(dragOptIdx, 1);
    opts.splice(toIdx, 0, moved);
    setData(p => ({ ...p, options: opts }));
    setDragOptIdx(null); setDragOverOptIdx(null);
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: 2, p: 2.5, mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>⚙️ Field Settings</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField size="small" label="Field Label *" value={data.label} onChange={set('label')} />
        <FormControl size="small" fullWidth>
          <InputLabel>Field Type</InputLabel>
          <Select value={data.type} onChange={set('type')} label="Field Type">
            {['Basic','Choice','Advanced'].map(group => [
              <MenuItem key={`g-${group}`} disabled sx={{ opacity: 1, fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase', py: 0.5 }}>{group}</MenuItem>,
              ...FIELD_TYPES.filter(t => t.group === group).map(t => (
                <MenuItem key={t.value} value={t.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: FIELD_TYPE_COLORS[t.value] }}>
                      <FieldTypeIcon iconName={t.icon} fontSize="small" />
                    </Box>
                    {t.label}
                  </Box>
                </MenuItem>
              )),
            ])}
          </Select>
        </FormControl>
        <TextField size="small" label="Placeholder" value={data.placeholder || ''} onChange={set('placeholder')} />
        <TextField size="small" label="Description / Help Text" value={data.helpText || ''} onChange={set('helpText')} />
        <TextField size="small" label="Default Value" value={data.defaultValue || ''} onChange={set('defaultValue')} />
        <TextField size="small" label="Validation Rule (Regex, Min, Max)" value={data.validationRule || ''} onChange={set('validationRule')} />
        
        <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
          <InputLabel>Field Width</InputLabel>
          <Select value={data.width || '100%'} onChange={set('width')} label="Field Width">
            <MenuItem value="100%">Full Width (100%)</MenuItem>
            <MenuItem value="50%">Half Width (50%)</MenuItem>
            <MenuItem value="33%">One Third (33%)</MenuItem>
            <MenuItem value="25%">One Quarter (25%)</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          <FormControlLabel
            control={<Switch checked={!!data.required} onChange={e => setData(p => ({ ...p, required: e.target.checked }))} size="small" color="primary" />}
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Required</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={data.enabled !== false} onChange={e => setData(p => ({ ...p, enabled: e.target.checked }))} size="small" color="success" />}
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Show Field</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={!!data.readOnly} onChange={e => setData(p => ({ ...p, readOnly: e.target.checked }))} size="small" color="warning" />}
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Read Only</Typography>}
          />
        </Box>

        {hasOptions && (
          <Box sx={{ mt: 1.5, borderTop: '1px solid #E2E8F0', pt: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 1 }}>Options Management</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField size="small" value={optInput} onChange={e => setOptInput(e.target.value)} placeholder="Add new option..." sx={{ flex: 1 }}
                onKeyDown={e => e.key === 'Enter' && addOption()} />
              <Button size="small" variant="contained" onClick={addOption} startIcon={<AddIcon />}>Add Option</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 200, overflowY: 'auto' }}>
              {(data.options || []).map((opt, i) => (
                <OptionRow
                  key={i} option={opt} idx={i} totalOptions={data.options.length}
                  onEdit={editOption} onDelete={removeOption} onDuplicate={duplicateOption} onMove={moveOption}
                  isDragOver={dragOverOptIdx === i}
                  onDragStart={() => setDragOptIdx(i)}
                  onDragOver={e => { e.preventDefault(); setDragOverOptIdx(i); }}
                  onDrop={() => handleOptionDrop(i)}
                  onDragEnd={() => { setDragOptIdx(null); setDragOverOptIdx(null); }}
                />
              ))}
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1, pt: 1.5, borderTop: '1px solid #E2E8F0', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8rem', color: saveStatus.includes('Unable') ? '#EF4444' : saveStatus.includes('saved') ? '#10B981' : '#64748B', fontWeight: 600 }}>
            {saveStatus}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="text" size="small" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Box>
  );
};

// ── Single Field Row ──────────────────────────────────────────────────────────
const FieldRow = ({ field, onEdit, onDuplicate, onDelete, onMove, isFirst, isLast, isDragOver }) => {
  const [configOpen, setConfigOpen] = useState(false);
  const typeColor = FIELD_TYPE_COLORS[field.type] || '#546E7A';
  const typeInfo = FIELD_TYPES.find(t => t.value === field.type);

  return (
    <Box>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
        bgcolor: isDragOver ? '#EFF6FF' : '#FAFBFC',
        border: `1.5px solid ${isDragOver ? '#2563EB' : '#E5E7EB'}`,
        cursor: 'grab', transition: 'all 0.15s',
        opacity: field.enabled === false ? 0.6 : 1,
        '&:hover': { bgcolor: '#F0F7FF', borderColor: '#BAC8FF' },
      }}>
        <DragIcon sx={{ color: '#CBD5E1', fontSize: 18, flexShrink: 0 }} />
        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: typeColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColor, flexShrink: 0 }}>
          <FieldTypeIcon iconName={typeInfo?.icon || 'Abc'} sx={{ fontSize: 15 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1A2332', fontSize: '0.85rem' }} noWrap>{field.label || 'Untitled Field'}</Typography>
            {field.required && <Chip label="Required" size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontSize: '0.6rem', height: 16, fontWeight: 700 }} />}
            {field.readOnly && <Chip label="Read Only" size="small" sx={{ bgcolor: '#F3E8FF', color: '#6B21A8', fontSize: '0.6rem', height: 16, fontWeight: 700 }} />}
            {field.enabled === false && <Chip label="Hidden" size="small" sx={{ bgcolor: '#F3F4F6', color: '#4B5563', fontSize: '0.6rem', height: 16, fontWeight: 700 }} />}
            {field.isDefault && <Chip label="Default" size="small" sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontSize: '0.6rem', height: 16, fontWeight: 700 }} />}
          </Box>
          <Typography variant="caption" sx={{ color: typeColor, fontWeight: 600, fontSize: '0.7rem' }}>{typeInfo?.label}
            {field.placeholder && <span style={{ color: '#94A3B8', fontWeight: 400 }}> · {field.placeholder}</span>}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <Tooltip title="Edit Field Config">
            <IconButton size="small" onClick={() => setConfigOpen(o => !o)} sx={{ '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate Field">
            <IconButton size="small" onClick={() => onDuplicate(field)} sx={{ '&:hover': { color: '#D97706', bgcolor: '#FFFBEB' } }}>
              <DuplicateIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" disabled={isFirst} onClick={() => onMove(field.id, -1)}><MoveUpIcon sx={{ fontSize: 15 }} /></IconButton>
          <IconButton size="small" disabled={isLast} onClick={() => onMove(field.id, 1)}><MoveDownIcon sx={{ fontSize: 15 }} /></IconButton>
          {!field.isDefault && (
            <Tooltip title="Delete Field">
              <IconButton size="small" onClick={() => onDelete(field.id)} sx={{ '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Collapse in={configOpen}>
        <FieldConfigPanel field={field} onSave={d => { onEdit(d); }} onClose={() => setConfigOpen(false)} />
      </Collapse>
    </Box>
  );
};

// ── Sub-Section Block ────────────────────────────────────────────────────────
const SubSectionBlock = ({ subSection, sectionId, subSecIdx, totalSubSecs, onUpdateSubSec, onDeleteSubSec, onMoveSubSec, onAddField }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [dragFieldIdx, setDragFieldIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(subSection.title);

  const saveTitle = () => {
    if (titleVal.trim()) {
      onUpdateSubSec(subSection.id, { title: titleVal.trim() });
      setIsEditingTitle(false);
    }
  };

  const updateField = (fieldId, data) => {
    onUpdateSubSec(subSection.id, { fields: subSection.fields.map(f => f.id === fieldId ? { ...f, ...data } : f) });
  };
  const duplicateField = (field) => {
    const newF = { ...field, id: uid(), isDefault: false, label: `${field.label} (Copy)` };
    const idx = subSection.fields.findIndex(f => f.id === field.id);
    const newFields = [...subSection.fields];
    newFields.splice(idx + 1, 0, newF);
    onUpdateSubSec(subSection.id, { fields: newFields });
  };
  const deleteField = (fieldId) => {
    onUpdateSubSec(subSection.id, { fields: subSection.fields.filter(f => f.id !== fieldId) });
  };
  const moveField = (fieldId, direction) => {
    const idx = subSection.fields.findIndex(f => f.id === fieldId);
    const target = idx + direction;
    if (target < 0 || target >= subSection.fields.length) return;
    const newFields = [...subSection.fields];
    [newFields[idx], newFields[target]] = [newFields[target], newFields[idx]];
    onUpdateSubSec(subSection.id, { fields: newFields });
  };
  const handleFieldDrop = (toIdx) => {
    if (dragFieldIdx === null || dragFieldIdx === toIdx) return;
    const newFields = [...subSection.fields];
    const [moved] = newFields.splice(dragFieldIdx, 1);
    newFields.splice(toIdx, 0, moved);
    onUpdateSubSec(subSection.id, { fields: newFields });
    setDragFieldIdx(null); setDragOverIdx(null);
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, overflow: 'hidden', mb: 1.5, bgcolor: '#F8FAFC' }}>
      {/* Sub Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderBottom: '1px solid #E2E8F0', bgcolor: '#F1F5F9' }}>
        <DragIcon sx={{ color: '#94A3B8', cursor: 'grab', fontSize: 16 }} />
        {isEditingTitle ? (
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            <TextField size="small" value={titleVal} onChange={e => setTitleVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveTitle()} autoFocus />
            <Button size="small" variant="contained" onClick={saveTitle}>Save</Button>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155' }}>{subSection.title}</Typography>
            <IconButton size="small" onClick={() => setIsEditingTitle(true)}><EditIcon sx={{ fontSize: 13 }} /></IconButton>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
            <IconButton size="small" onClick={() => setCollapsed(o => !o)}>
              {collapsed ? <ExpandIcon sx={{ fontSize: 13 }} /> : <CollapseIcon sx={{ fontSize: 13 }} />}
            </IconButton>
          </Tooltip>
          <IconButton size="small" disabled={subSecIdx === 0} onClick={() => onMoveSubSec(subSection.id, -1)}><MoveUpIcon sx={{ fontSize: 13 }} /></IconButton>
          <IconButton size="small" disabled={subSecIdx === totalSubSecs - 1} onClick={() => onMoveSubSec(subSection.id, 1)}><MoveDownIcon sx={{ fontSize: 13 }} /></IconButton>
          <Tooltip title="Delete Sub Section">
            <IconButton size="small" onClick={() => onDeleteSubSec(subSection.id)} sx={{ '&:hover': { color: '#DC2626' } }}>
              <DeleteIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Sub Section Fields */}
      <Collapse in={!collapsed}>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {subSection.fields?.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 2, color: '#94A3B8', border: '1.5px dashed #E2E8F0', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ display: 'block' }}>No fields in this Sub Section.</Typography>
            </Box>
          )}
          {(subSection.fields || []).map((field, idx) => (
            <Box
              key={field.id}
              draggable
              onDragStart={() => setDragFieldIdx(idx)}
              onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
              onDrop={() => handleFieldDrop(idx)}
              onDragEnd={() => { setDragFieldIdx(null); setDragOverIdx(null); }}
            >
              <FieldRow
                field={field}
                isFirst={idx === 0}
                isLast={idx === subSection.fields.length - 1}
                isDragOver={dragOverIdx === idx}
                onEdit={d => updateField(field.id, d)}
                onDuplicate={duplicateField}
                onDelete={deleteField}
                onMove={moveField}
              />
            </Box>
          ))}

          {/* Add Field Picker for Sub Section */}
          <AddFieldPicker onAdd={fieldType => {
            const newField = { id: uid(), label: FIELD_TYPES.find(t => t.value === fieldType)?.label || 'New Field', type: fieldType, required: false, placeholder: '', helpText: '', defaultValue: '', validationRule: '', isDefault: false };
            onUpdateSubSec(subSection.id, { fields: [...(subSection.fields || []), newField] });
          }} />
        </Box>
      </Collapse>
    </Paper>
  );
};

// ── Section Block ─────────────────────────────────────────────────────────────
const SectionBlock = ({ section, sectionIdx, totalSections, onUpdateSection, onDeleteSection, onMoveSection }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [dragFieldIdx, setDragFieldIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [dragSubSecIdx, setDragSubSecIdx] = useState(null);
  const [dragOverSubSecIdx, setDragOverSubSecIdx] = useState(null);
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(section.title);
  const [descVal, setDescVal] = useState(section.description || '');
  const [visFieldId, setVisFieldId] = useState(section.visibilityRule?.fieldId || '');
  const [visValue, setVisValue] = useState(section.visibilityRule?.value || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDelOpen, setConfirmDelOpen] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const updateField = (fieldId, data) => {
    onUpdateSection(section.id, { fields: section.fields.map(f => f.id === fieldId ? { ...f, ...data } : f) });
  };
  const duplicateField = (field) => {
    const newF = { ...field, id: uid(), isDefault: false, label: `${field.label} (Copy)` };
    const idx = section.fields.findIndex(f => f.id === field.id);
    const newFields = [...section.fields];
    newFields.splice(idx + 1, 0, newF);
    onUpdateSection(section.id, { fields: newFields });
  };
  const deleteField = (fieldId) => {
    onUpdateSection(section.id, { fields: section.fields.filter(f => f.id !== fieldId) });
  };
  const moveField = (fieldId, direction) => {
    const idx = section.fields.findIndex(f => f.id === fieldId);
    const target = idx + direction;
    if (target < 0 || target >= section.fields.length) return;
    const newFields = [...section.fields];
    [newFields[idx], newFields[target]] = [newFields[target], newFields[idx]];
    onUpdateSection(section.id, { fields: newFields });
  };
  const handleFieldDrop = (toIdx) => {
    if (dragFieldIdx === null || dragFieldIdx === toIdx) return;
    const newFields = [...section.fields];
    const [moved] = newFields.splice(dragFieldIdx, 1);
    newFields.splice(toIdx, 0, moved);
    onUpdateSection(section.id, { fields: newFields });
    setDragFieldIdx(null); setDragOverIdx(null);
  };

  const saveTitle = () => {
    onUpdateSection(section.id, { 
      title: titleVal, 
      description: descVal,
      visibilityRule: visFieldId ? { fieldId: visFieldId, value: visValue } : null
    });
    setEditTitle(false);
  };

  const duplicateSection = () => {
    onUpdateSection(section.id, { duplicate: true });
    handleMenuClose();
  };

  // Sub-Sections Handlers
  const addSubSection = () => {
    const subSecs = section.subSections || [];
    const newSubSec = { id: uid(), title: `Sub Section ${subSecs.length + 1}`, fields: [] };
    onUpdateSection(section.id, { subSections: [...subSecs, newSubSec] });
  };
  const updateSubSec = (subId, data) => {
    onUpdateSection(section.id, {
      subSections: (section.subSections || []).map(s => s.id === subId ? { ...s, ...data } : s)
    });
  };
  const deleteSubSec = (subId) => {
    onUpdateSection(section.id, {
      subSections: (section.subSections || []).filter(s => s.id !== subId)
    });
  };
  const moveSubSec = (subId, direction) => {
    const subSecs = [...(section.subSections || [])];
    const idx = subSecs.findIndex(s => s.id === subId);
    const target = idx + direction;
    if (target < 0 || target >= subSecs.length) return;
    [subSecs[idx], subSecs[target]] = [subSecs[target], subSecs[idx]];
    onUpdateSection(section.id, { subSections: subSecs });
  };
  const handleSubSecDrop = (toIdx) => {
    if (dragSubSecIdx === null || dragSubSecIdx === toIdx) return;
    const subSecs = [...(section.subSections || [])];
    const [moved] = subSecs.splice(dragSubSecIdx, 1);
    subSecs.splice(toIdx, 0, moved);
    onUpdateSection(section.id, { subSections: subSecs });
    setDragSubSecIdx(null); setDragOverSubSecIdx(null);
  };

  return (
    <Paper elevation={0} sx={{ border: '1.5px solid #E5E7EB', borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
        <DragIcon sx={{ color: '#CBD5E1', cursor: 'grab' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {editTitle ? (
            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}>
              <TextField size="small" value={titleVal} onChange={e => setTitleVal(e.target.value)} label="Section Title *" autoFocus fullWidth />
              <TextField size="small" value={descVal} onChange={e => setDescVal(e.target.value)} label="Description (optional)" fullWidth />
              <Box sx={{ p: 1.5, bgcolor: '#F1F5F9', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>Conditional Visibility Rule (Optional)</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" value={visFieldId} onChange={e => setVisFieldId(e.target.value)} label="Field Label or ID" sx={{ flex: 1, bgcolor: '#fff' }} />
                  <TextField size="small" value={visValue} onChange={e => setVisValue(e.target.value)} label="Must Equal Value" sx={{ flex: 1, bgcolor: '#fff' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Leave empty to always show this section.</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={saveTitle}>Save</Button>
                <Button size="small" onClick={() => setEditTitle(false)}>Cancel</Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={`Section ${sectionIdx + 1}`} size="small" sx={{ bgcolor: '#1A2332', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A2332' }}>{section.title}</Typography>
              </Box>
              {section.description && <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.25 }}>{section.description}</Typography>}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
          <Tooltip title={collapsed ? 'Expand Section' : 'Collapse Section'}>
            <IconButton size="small" onClick={() => setCollapsed(o => !o)}>
              {collapsed ? <ExpandIcon fontSize="small" /> : <CollapseIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Section Actions">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}>
            <MenuItem onClick={() => { setEditTitle(true); handleMenuClose(); }}><EditIcon fontSize="small" sx={{ mr: 1, color: '#3b82f6' }} /> Rename</MenuItem>
            <MenuItem onClick={duplicateSection}><DuplicateIcon fontSize="small" sx={{ mr: 1, color: '#d97706' }} /> Duplicate</MenuItem>
            <MenuItem onClick={() => { onMoveSection(section.id, -1); handleMenuClose(); }} disabled={sectionIdx === 0}><MoveUpIcon fontSize="small" sx={{ mr: 1 }} /> Move Up</MenuItem>
            <MenuItem onClick={() => { onMoveSection(section.id, 1); handleMenuClose(); }} disabled={sectionIdx === totalSections - 1}><MoveDownIcon fontSize="small" sx={{ mr: 1 }} /> Move Down</MenuItem>
            <Divider />
            <MenuItem onClick={() => { setConfirmDelOpen(true); handleMenuClose(); }} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" sx={{ mr: 1, color: '#ef4444' }} /> Delete</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Content */}
      <Collapse in={!collapsed}>
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          
          {/* Direct Fields List */}
          {(!section.fields || section.fields.length === 0) && (!section.subSections || section.subSections.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 3, color: '#94A3B8', border: '2px dashed #E5E7EB', borderRadius: 2 }}>
              <Typography variant="body2">No fields or sub-sections yet. Add items below.</Typography>
            </Box>
          )}
          
          {(section.fields || []).map((field, idx) => (
            <Box
              key={field.id}
              draggable
              onDragStart={() => setDragFieldIdx(idx)}
              onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
              onDrop={() => handleFieldDrop(idx)}
              onDragEnd={() => { setDragFieldIdx(null); setDragOverIdx(null); }}
            >
              <FieldRow
                field={field}
                isFirst={idx === 0}
                isLast={idx === section.fields.length - 1}
                isDragOver={dragOverIdx === idx}
                onEdit={d => updateField(field.id, d)}
                onDuplicate={duplicateField}
                onDelete={deleteField}
                onMove={moveField}
              />
            </Box>
          ))}

          {/* Sub Sections List */}
          {(section.subSections || []).map((subSec, idx) => (
            <Box
              key={subSec.id}
              draggable
              onDragStart={() => setDragSubSecIdx(idx)}
              onDragOver={e => { e.preventDefault(); setDragOverSubSecIdx(idx); }}
              onDrop={() => handleSubSecDrop(idx)}
              onDragEnd={() => { setDragSubSecIdx(null); setDragOverSubSecIdx(null); }}
              sx={{
                borderLeft: dragOverSubSecIdx === idx ? '3px solid #2563EB' : 'none',
                pl: dragOverSubSecIdx === idx ? 1 : 0,
                transition: 'all 0.15s'
              }}
            >
              <SubSectionBlock
                subSection={subSec}
                sectionId={section.id}
                subSecIdx={idx}
                totalSubSecs={section.subSections.length}
                onUpdateSubSec={updateSubSec}
                onDeleteSubSec={deleteSubSec}
                onMoveSubSec={moveSubSec}
              />
            </Box>
          ))}

          {/* Add Actions Footer */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <AddFieldPicker onAdd={fieldType => {
                const newField = { id: uid(), label: FIELD_TYPES.find(t => t.value === fieldType)?.label || 'New Field', type: fieldType, required: false, placeholder: '', helpText: '', defaultValue: '', validationRule: '', isDefault: false };
                onUpdateSection(section.id, { fields: [...(section.fields || []), newField] });
              }} />
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={addSubSection}
              startIcon={<AddIcon />}
              sx={{ borderColor: '#CBD5E1', color: '#64748B', borderRadius: 2, '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' } }}
            >
              Add Sub-Section
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* Delete Section Confirmation Dialog */}
      <Dialog open={confirmDelOpen} onClose={() => setConfirmDelOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Section?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the section <b>"{section.title}"</b>? This will permanently delete all fields and sub-sections contained inside this section.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDelOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={() => { onDeleteSection(section.id); setConfirmDelOpen(false); }} variant="contained" color="error">Delete Everything</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// ── Add Field Picker ──────────────────────────────────────────────────────────
const AddFieldPicker = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Button size="small" startIcon={<AddIcon />} onClick={() => setOpen(o => !o)}
        variant="outlined" sx={{ width: '100%', border: '1.5px dashed #CBD5E1', borderRadius: 2, color: '#64748B', '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF', color: '#2563EB' }, py: 0.85 }}>
        + Add Field
      </Button>
      <Collapse in={open}>
        <Box sx={{ mt: 1.5, p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
          {['Basic', 'Choice', 'Advanced'].map(group => (
            <Box key={group} sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.75 }}>{group}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {FIELD_TYPES.filter(t => t.group === group).map(t => (
                  <Chip
                    key={t.value} label={t.label} size="small" clickable
                    icon={<FieldTypeIcon iconName={t.icon} sx={{ fontSize: '14px !important', color: `${FIELD_TYPE_COLORS[t.value]} !important` }} />}
                    onClick={() => { onAdd(t.value); setOpen(false); }}
                    sx={{ bgcolor: '#fff', border: `1.5px solid ${FIELD_TYPE_COLORS[t.value]}30`, color: '#374151', fontWeight: 600, '&:hover': { bgcolor: FIELD_TYPE_COLORS[t.value] + '15', borderColor: FIELD_TYPE_COLORS[t.value] } }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// ── Main FormBuilder Export ───────────────────────────────────────────────────
const FormBuilder = ({ sections = [], onChange }) => {
  const [dragSecIdx, setDragSecIdx] = useState(null);
  const [dragOverSecIdx, setDragOverSecIdx] = useState(null);

  const addSection = () => {
    const newSec = { id: uid(), title: `Section ${sections.length + 1}`, description: '', fields: [], subSections: [] };
    onChange([...sections, newSec]);
  };
  
  const updateSection = (id, data) => {
    if (data.duplicate) {
      const idx = sections.findIndex(s => s.id === id);
      const targetSec = sections[idx];
      
      // Perform deep copy of the section fields and sub-sections to ensure unique IDs
      const deepCloneFields = (fieldsList) => (fieldsList || []).map(f => ({ ...f, id: uid(), isDefault: false, label: `${f.label} (Copy)` }));
      
      const newSec = {
        ...targetSec,
        id: uid(),
        title: `${targetSec.title} (Copy)`,
        fields: deepCloneFields(targetSec.fields),
        subSections: (targetSec.subSections || []).map(sub => ({
          ...sub,
          id: uid(),
          title: `${sub.title} (Copy)`,
          fields: deepCloneFields(sub.fields)
        }))
      };
      
      const next = [...sections];
      next.splice(idx + 1, 0, newSec);
      onChange(next);
      return;
    }
    onChange(sections.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSection = (id) => {
    onChange(sections.filter(s => s.id !== id));
  };

  const moveSection = (id, dir) => {
    const idx = sections.findIndex(s => s.id === id);
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const handleSectionDrop = (toIdx) => {
    if (dragSecIdx === null || dragSecIdx === toIdx) return;
    const next = [...sections];
    const [moved] = next.splice(dragSecIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
    setDragSecIdx(null); setDragOverSecIdx(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {sections.map((sec, idx) => (
        <Box
          key={sec.id}
          draggable
          onDragStart={() => setDragSecIdx(idx)}
          onDragOver={e => { e.preventDefault(); setDragOverSecIdx(idx); }}
          onDrop={() => handleSectionDrop(idx)}
          onDragEnd={() => { setDragSecIdx(null); setDragOverSecIdx(null); }}
          sx={{
            borderLeft: dragOverSecIdx === idx ? '4px solid #0277BD' : 'none',
            pl: dragOverSecIdx === idx ? 1 : 0,
            transition: 'all 0.15s'
          }}
        >
          <SectionBlock
            section={sec}
            sectionIdx={idx}
            totalSections={sections.length}
            onUpdateSection={updateSection}
            onDeleteSection={deleteSection}
            onMoveSection={moveSection}
          />
        </Box>
      ))}
      <Button variant="outlined" startIcon={<AddIcon />} onClick={addSection} fullWidth
        sx={{ borderColor: '#1A2332', color: '#1A2332', borderStyle: 'dashed', py: 1.5, borderRadius: 2, '&:hover': { bgcolor: '#F0F2F5' } }}>
        + Add New Section
      </Button>
    </Box>
  );
};

export default FormBuilder;
