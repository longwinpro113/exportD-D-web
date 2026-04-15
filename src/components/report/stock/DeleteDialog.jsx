import React, { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Snackbar,
  Typography
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { buildApiUrl } from '../../../config/api';

function DeleteDialog({ open, row, onClose, onConfirm, onNotify }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!row) return;
    setDeleting(true);
    try {
      const res = await fetch(buildApiUrl(`/api/history-export/${row.id}`), {
        method: 'DELETE'
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Xóa báo cáo thất bại.');
      }
      setError('');
      if (typeof onNotify === 'function') {
        onNotify({ severity: 'success', message: `Xóa báo cáo của ${row.ry_number} thành công.` });
      }
      onConfirm();
    } catch (err) {
      const cleanMessage = err.message.replace(/^{"error":|"$/g, '');
      const finalMessage = `Xóa báo cáo thất bại: ${cleanMessage}`;
      setError(finalMessage);
      if (typeof onNotify === 'function') {
        onNotify({ severity: 'error', message: finalMessage });
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!row) return null;

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
        <WarningAmberRoundedIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 1 }} />
        <Typography>Xóa báo cáo của <strong>{row.ry_number}</strong>?</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={onClose} variant="outlined">Hủy</Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={deleting}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
    {error && (
      <Snackbar open autoHideDuration={3500} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="standard" sx={{ borderRadius: '12px', px: 1.5, py: 1, backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', '& .MuiAlert-icon': { color: '#ef4444' } }}>
          {error}
        </Alert>
      </Snackbar>
    )}
    </>
  );
}

export default DeleteDialog;
