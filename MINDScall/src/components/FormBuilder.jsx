import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, IconButton, Chip, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Divider, Paper, Collapse,
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
  Settings as SettingsIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { uid, FIELD_TYPES, FIELD_TYPE_COLORS } from '../store/formStore';

const ICON_MAP = {
  TextFields: TextIcon, Notes: TextAreaIcon, Numbers: NumberIcon,
  Email: EmailIcon, Phone: PhoneIcon, Link: LinkIcon,
  Today: DateIcon, ArrowDropDownCircle: DropdownIcon,
  RadioButtonChecked: RadioIcon, CheckBox: CheckboxIcon,
  Checklist: MultiSelectIcon, Star: StarIcon, AttachFile: FileIcon,
  Abc: TextIcon,
};

const FieldTypeIcon = ({ iconName, ...props }) => {
  const Comp = ICON_MAP[iconName] || TextIcon;
  return <Comp {...props} />;
};

// ── Field Config Inline Panel ─────────────────────────────────────────────────
const FieldConfigPanel = ({ field, onSave, onClose }) => {
  const [data, setData] = useState({ ...field });
  const set = k => e => setData(p => ({ ...p, [k]: e.target ? e.target.value : e }));
  const hasOptions = ['dropdown','radio','checkbox','multiselect'].includes(data.type);
  const [optInput, setOptInput] = useState('');

  const addOption = () => {
    if (!optInput.trim()) return;
    setData(p => ({ ...p, options: [...(p.options || []), optInput.trim()] }));
    setOptInput('');
  };
  const removeOption = idx => setData(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }));

  return (
    <Box sx={{ bgcolor: '#F0F7FF', border: '2px solid #2563EB', borderRadius: 2, p: 2.5, mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E3A5F' }}>⚙️ Field Settings</Typography>
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
        <TextField size="small" label="Default Value" value={data.defaultValue || ''} onChange={set('defaultValue')} />
        <TextField size="small" label="Help Text" value={data.helpText || ''} onChange={set('helpText')} />
        <TextField size="small" label="Validation Rule" value={data.validationRule || ''} onChange={set('validationRule')} placeholder="e.g. min:3, max:100, email" />
        <FormControlLabel
          control={<Switch checked={!!data.required} onChange={e => setData(p => ({ ...p, required: e.target.checked }))} size="small" color="primary" />}
          label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Required</Typography>}
        />
        {hasOptions && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#546E7A', display: 'block', mb: 1 }}>Options</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField size="small" value={optInput} onChange={e => setOptInput(e.target.value)} placeholder="Add option..." sx={{ flex: 1 }}
                onKeyDown={e => e.key === 'Enter' && addOption()} />
              <Button size="small" variant="outlined" onClick={addOption}>Add</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(data.options || []).map((opt, i) => (
                <Chip key={i} label={opt} size="small" onDelete={() => removeOption(i)} />
              ))}
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
          <Button variant="contained" size="small" onClick={() => onSave(data)} disabled={!data.label?.trim()}>Save</Button>
          <Button variant="text" size="small" onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    </Box>
  );
};

// ── Single Field Row ──────────────────────────────────────────────────────────
const FieldRow = ({ field, onEdit, onDuplicate, onDelete, isDragOver }) => {
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
            {field.isDefault && <Chip label="Default" size="small" sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontSize: '0.6rem', height: 16, fontWeight: 700 }} />}
          </Box>
          <Typography variant="caption" sx={{ color: typeColor, fontWeight: 600, fontSize: '0.7rem' }}>{typeInfo?.label}
            {field.placeholder && <span style={{ color: '#94A3B8', fontWeight: 400 }}> · {field.placeholder}</span>}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Configure">
            <IconButton size="small" onClick={() => setConfigOpen(o => !o)} sx={{ '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
              <SettingsIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton size="small" onClick={() => onDuplicate(field)} sx={{ '&:hover': { color: '#D97706', bgcolor: '#FFFBEB' } }}>
              <DuplicateIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          {!field.isDefault && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(field.id)} sx={{ '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Collapse in={configOpen}>
        <FieldConfigPanel field={field} onSave={d => { onEdit(d); setConfigOpen(false); }} onClose={() => setConfigOpen(false)} />
      </Collapse>
    </Box>
  );
};

// ── Section Block ─────────────────────────────────────────────────────────────
const SectionBlock = ({ section, sectionIdx, totalSections, onUpdateSection, onDeleteSection, onMoveSection, onAddField }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [dragFieldIdx, setDragFieldIdx] = useState(null);
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(section.title);
  const [descVal, setDescVal] = useState(section.description || '');

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
  const handleFieldDrop = (toIdx) => {
    if (dragFieldIdx === null || dragFieldIdx === toIdx) return;
    const newFields = [...section.fields];
    const [moved] = newFields.splice(dragFieldIdx, 1);
    newFields.splice(toIdx, 0, moved);
    onUpdateSection(section.id, { fields: newFields });
    setDragFieldIdx(null); setDragOverIdx(null);
  };
  const saveTitle = () => {
    onUpdateSection(section.id, { title: titleVal, description: descVal });
    setEditTitle(false);
  };

  return (
    <Paper elevation={0} sx={{ border: '1.5px solid #E5E7EB', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
        <DragIcon sx={{ color: '#CBD5E1', cursor: 'grab' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {editTitle ? (
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
              <TextField size="small" value={titleVal} onChange={e => setTitleVal(e.target.value)} label="Section Title" autoFocus />
              <TextField size="small" value={descVal} onChange={e => setDescVal(e.target.value)} label="Description (optional)" />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={saveTitle}>Save</Button>
                <Button size="small" onClick={() => setEditTitle(false)}>Cancel</Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={`Section ${sectionIdx + 1}`} size="small" sx={{ bgcolor: '#1A2332', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A2332' }}>{section.title}</Typography>
              </Box>
              {section.description && <Typography variant="caption" sx={{ color: '#94A3B8' }}>{section.description}</Typography>}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
          <Tooltip title="Edit Section"><IconButton size="small" onClick={() => setEditTitle(o => !o)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
            <IconButton size="small" onClick={() => setCollapsed(o => !o)}>
              {collapsed ? <ExpandIcon fontSize="small" /> : <CollapseIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Move Up"><span><IconButton size="small" disabled={sectionIdx === 0} onClick={() => onMoveSection(section.id, -1)}><ExpandIcon fontSize="small" /></IconButton></span></Tooltip>
          <Tooltip title="Move Down"><span><IconButton size="small" disabled={sectionIdx === totalSections - 1} onClick={() => onMoveSection(section.id, 1)}><CollapseIcon fontSize="small" /></IconButton></span></Tooltip>
          {totalSections > 1 && (
            <Tooltip title="Delete Section"><IconButton size="small" onClick={() => onDeleteSection(section.id)} sx={{ '&:hover': { color: '#DC2626' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
          )}
        </Box>
      </Box>

      {/* Fields */}
      <Collapse in={!collapsed}>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {section.fields.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3, color: '#94A3B8', border: '2px dashed #E5E7EB', borderRadius: 2 }}>
              <Typography variant="body2">No fields yet. Add a field below.</Typography>
            </Box>
          )}
          {section.fields.map((field, idx) => (
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
                isDragOver={dragOverIdx === idx}
                onEdit={d => updateField(field.id, d)}
                onDuplicate={duplicateField}
                onDelete={deleteField}
              />
            </Box>
          ))}

          {/* Add Field to Section */}
          <AddFieldPicker onAdd={fieldType => {
            const newField = { id: uid(), label: FIELD_TYPES.find(t => t.value === fieldType)?.label || 'New Field', type: fieldType, required: false, placeholder: '', helpText: '', defaultValue: '', validationRule: '', isDefault: false };
            onUpdateSection(section.id, { fields: [...section.fields, newField] });
          }} />
        </Box>
      </Collapse>
    </Paper>
  );
};

// ── Add Field Picker ──────────────────────────────────────────────────────────
const AddFieldPicker = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Button size="small" startIcon={<AddIcon />} onClick={() => setOpen(o => !o)}
        variant="dashed" sx={{ width: '100%', border: '2px dashed #CBD5E1', borderRadius: 2, color: '#64748B', '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF', color: '#2563EB' }, py: 1 }}>
        + Add Field
      </Button>
      <Collapse in={open}>
        <Box sx={{ mt: 1.5, p: 2, bgcolor: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 2 }}>
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
const FormBuilder = ({ sections, onChange }) => {
  const addSection = () => {
    const newSec = { id: uid(), title: `Section ${sections.length + 1}`, description: '', fields: [] };
    onChange([...sections, newSec]);
  };
  const updateSection = (id, data) => {
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

  return (
    <Box>
      {sections.map((sec, idx) => (
        <SectionBlock
          key={sec.id} section={sec} sectionIdx={idx} totalSections={sections.length}
          onUpdateSection={updateSection} onDeleteSection={deleteSection}
          onMoveSection={moveSection} onAddField={() => {}}
        />
      ))}
      <Button variant="outlined" startIcon={<AddIcon />} onClick={addSection} fullWidth
        sx={{ borderColor: '#1A2332', color: '#1A2332', borderStyle: 'dashed', py: 1.5, borderRadius: 2, '&:hover': { bgcolor: '#F0F2F5' } }}>
        + Add New Section
      </Button>
    </Box>
  );
};

export default FormBuilder;
