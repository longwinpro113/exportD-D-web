import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography
} from '@mui/material';
import { buildApiUrl } from '../../../config/api';
import { sizeToCol, sizes } from '../shared';
import { toDateInputValue } from './helpers';

const getEditFieldSx = (hasValue, centered = false) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: hasValue ? '#ffffff' : '#dbe4f0'
  },
  '& .MuiInputBase-input': {
    textAlign: centered ? 'center' : 'left'
  }
});

function EditDialog({ open, row, onClose, onSave, onNotify }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!row) return;
    const initial = {
      export_date: toDateInputValue(row.export_date),
      note: row.note ?? ''
    };
    sizes.forEach((size) => {
      initial[sizeToCol(size)] = row[sizeToCol(size)] ?? 0;
    });
    setForm(initial);
    setError('');
  }, [row]);

  const handleChange = (col, val) => {
    if (col === 'export_date' || col === 'note') {
      setForm((prev) => ({ ...prev, [col]: val }));
      return;
    }
    if (!isNaN(val)) setForm((prev) => ({ ...prev, [col]: val }));
  };

  const handleConfirm = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const payload = {
        export_date: form.export_date || null,
        note: form.note?.trim() || null
      };
      sizes.forEach((size) => {
        payload[sizeToCol(size)] = parseFloat(form[sizeToCol(size)]) || 0;
      });

      const res = await fetch(buildApiUrl(`/api/export/${row.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Cập nhật báo cáo thất bại.');
      }

      const successMessage = `Lưu chỉnh sửa báo cáo cho ${row.ry_number} thành công.`;
      setError('');
      if (typeof onNotify === 'function') {
        onNotify({ severity: 'success', message: successMessage });
      }
      if (typeof onSave === 'function') {
        onSave();
      }
    } catch (err) {
      const cleanMessage = err.message.replace(/^{"error":|"$/g, '');
      const finalMessage = `Cập nhật báo cáo thất bại: ${cleanMessage}`;
      setError(finalMessage);
      if (typeof onNotify === 'function') {
        onNotify({ severity: 'error', message: finalMessage });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Chỉnh sửa: {row.ry_number}</DialogTitle>
      <Divider />
      <DialogContent>
        {error && <Alert severity="error" variant="standard" sx={{ mb: 2, backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' }, gap: 2, mb: 3, mt: 1 }}>
          <TextField
            label="Ngày giao hàng"
            type="date"
            value={form.export_date || ''}
            onChange={(e) => handleChange('export_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={getEditFieldSx(!!form.export_date)}
          />
          <TextField
            label="Ghi chú"
            value={form.note || ''}
            onChange={(e) => handleChange('note', e.target.value)}
            fullWidth
            sx={getEditFieldSx(!!form.note?.trim())}
          />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 2 }}>
          {sizes.map((size) => (
            <Box key={size} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', mb: 0.5 }}>{size}</Typography>
              <TextField
                size="small"
                value={form[sizeToCol(size)] || ''}
                onChange={(e) => handleChange(sizeToCol(size), e.target.value)}
                inputProps={{ style: { textAlign: 'center' } }}
                sx={getEditFieldSx(!!form[sizeToCol(size)], true)}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditDialog;
