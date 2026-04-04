import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, TextField
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ReportHeader from './common/ReportHeader';
import useQuery from '../hooks/useQuery';
import useFetchList from '../hooks/useFetchList';
import { exportStockReportPdf } from '../utils/pdfExport';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
// const API_URL = "http://localhost:5000";

const buildSizes = () => {
  const s = [];
  for (let i = 3; i <= 18; i += 0.5) s.push(i);
  return s;
};

const sizes = buildSizes();
const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;
const cellStyle = { color: '#1e293b', fontSize: '0.85rem', height: 38, borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' };

// Hàm convert sang ngày giờ Việt Nam
const formatVietnameseDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  });
};

const groupByDate = (rows) => {
  const map = new Map();
  rows.forEach(row => {
    const d = row.export_date;
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(row);
  });
  const result = [];
  map.forEach((rows, date) => result.push({ date, rows }));
  return result;
};

const getStatus = (remaining) => {
  const rem = parseFloat(remaining) ?? null;
  if (rem !== null && rem <= 0) return { label: 'Ok', color: '#16a34a', bg: '#dcfce7' };
  return { label: 'Not Ok', color: '#dc2626', bg: '#fee2e2' };
};

// ─── COMPONENTS DIALOG (GỘP CHUNG THEO YÊU CẦU) ──────────────────────────────

const EditDialog = ({ open, row, onClose, onSave }) => {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (row) {
      const initial = {};
      sizes.forEach(size => {
        initial[sizeToCol(size)] = row[sizeToCol(size)] ?? 0;
      });
      setForm(initial);
      setError('');
    }
  }, [row]);

  const handleChange = (col, val) => {
    if (!isNaN(val)) setForm(prev => ({ ...prev, [col]: val }));
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const payload = {};
      sizes.forEach(size => { payload[sizeToCol(size)] = parseFloat(form[sizeToCol(size)]) || 0; });
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/export/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Update failed');
      onSave();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Chỉnh sửa: {row.ry_number}</DialogTitle>
      <Divider />
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 2 }}>
          {sizes.map(size => (
            <Box key={size} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', mb: 0.5 }}>{size}</Typography>
              <TextField size="small" value={form[sizeToCol(size)] || ''} onChange={(e) => handleChange(sizeToCol(size), e.target.value)} />
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteDialog = ({ open, row, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const handleConfirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/export/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Update failed');
      onConfirm();
    } finally { setDeleting(false); }
  };
  if (!row) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
        <WarningAmberRoundedIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 1 }} />
        <Typography>Xóa đơn hàng <strong>{row.ry_number}</strong>?</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={onClose} variant="outlined">Hủy</Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={deleting}>Xác nhận</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const StockReport = () => {
  const [query, updateQuery] = useQuery({ q: '', client: '' });
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const [data, loading, , refetch] = useFetchList('/api/export', query);
  const [clients] = useFetchList('/api/orders/clients', {});
  
  const tableData = useMemo(() => Array.isArray(data) ? groupByDate(data) : [], [data]);

  const handleClientChange = (newClient) => {
    setSelectedClient(newClient);
    updateQuery({ client: newClient ? newClient.client : '' });
  };

  const memoizedTable = useMemo(() => {
    if (loading && tableData.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
      <TableContainer sx={{ width: '100%', flex: 1, overflow: 'auto' }}>
        <Table size="small" sx={{
          minWidth: 2400, // Tăng nhẹ minWidth để chứa cột thời gian mới
          borderCollapse: 'separate',
          borderSpacing: 0,
          '& th, & td': {
            borderBottom: '1px solid #f1f5f9',
            borderRight: '1px solid #f1f5f9',
            px: 1,
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }
        }}>
          <TableHead>
            <TableRow>
              {['STT', 'Đơn Hàng', 'Đợt', 'Article', 'Model Name', 'SL Đơn Hàng', 'SL Tích Lũy', 'SL Ngày', 'SL Còn Lại', 'Trạng Thái'].map((h, i) => (
                <TableCell key={h} sx={{
                  bgcolor: i >= 5 && i <= 8 ? '#f1f7ff' : '#f8fafc',
                  fontWeight: 800, fontSize: '0.82rem',
                  position: 'sticky', top: 0,
                  left: i === 0 ? 0 : i === 1 ? '40px' : 'auto',
                  width: i === 0 ? '40px' : i === 1 ? '120px' : i === 2 ? '60px' : i === 3 ? '80px' : i === 4 ? '130px' : '75px',
                  minWidth: i === 0 ? '40px' : i === 1 ? '120px' : i === 2 ? '60px' : i === 3 ? '80px' : i === 4 ? '130px' : '75px',
                  zIndex: i <= 1 ? 12 : 2,
                  borderRight: i === 1 ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                  boxShadow: i === 1 ? '2px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
                }}>{h}</TableCell>
              ))}
              {sizes.map(size => (
                <TableCell key={size} sx={{
                  bgcolor: '#f8fafc', fontWeight: 700, position: 'sticky', top: 0, zIndex: 1,
                  minWidth: 45, width: 45, maxWidth: 45, p: '0 !important'
                }}>{size}</TableCell>
              ))}
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, position: 'sticky', top: 0, zIndex: 1, minWidth: '100px' }}>Ghi chú</TableCell>
              {/* CỘT CẬP NHẬT LÚC MỚI */}
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, position: 'sticky', top: 0, zIndex: 1, minWidth: '120px' }}>Cập nhật lúc</TableCell>
              <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, position: 'sticky', top: 0, right: 0, zIndex: 13, borderLeft: '2px solid #e2e8f0' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                <TableRow>
                  <TableCell colSpan={sizes.length + 13} sx={{ bgcolor: '#f0f7ff', textAlign: 'left !important', py: 0, height: 38, borderBottom: '1px solid #cbd5e1' }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, position: 'sticky', left: '40px', width: '120px', justifyContent: 'center' }}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: '0.85rem', color: '#1976d2' }} />
                      <Typography sx={{ fontWeight: 700, color: '#1976d2', fontSize: '0.8rem' }}>{group.date}</Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => exportStockReportPdf(group, sizes)}
                        sx={{ color: '#1976d2', p: 0.5 }}>
                        <PrintOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                {group.rows.map((row, rIdx) => {
                  const status = getStatus(row.remaining_quantity);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ ...cellStyle, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 5, width: '40px', fontWeight: 800 }}>{rIdx + 1}</TableCell>
                      <TableCell sx={{ ...cellStyle, position: 'sticky', left: '40px', bgcolor: 'white', zIndex: 5, fontWeight: 800, borderRight: '2px solid #e2e8f0', width: '120px' }}>{row.ry_number}</TableCell>
                      <TableCell sx={{ ...cellStyle, fontWeight: 800, color: '#DAA06D' }}>{row.delivery_round}</TableCell>
                      <TableCell sx={{ ...cellStyle, fontWeight: 800, color: '#DAA06D', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.article}</TableCell>
                      <TableCell sx={{ ...cellStyle, fontWeight: 800, color: '#DAA06D', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.model_name}</TableCell>
                      <TableCell sx={{ ...cellStyle, color: '#1976d2', fontWeight: 700 }}>{row.total_quantity}</TableCell>
                      <TableCell sx={{ ...cellStyle, color: '#7c3aed', fontWeight: 700 }}>{row.accumulated_total}</TableCell>
                      <TableCell sx={{ ...cellStyle, color: '#0369a1', fontWeight: 600 }}>{row.shipped_quantity}</TableCell>
                      <TableCell sx={{ ...cellStyle, fontWeight: 600, color: row.remaining_quantity <= 0 ? '#16a34a' : '#ef4444' }}>{row.remaining_quantity}</TableCell>
                      <TableCell sx={{ ...cellStyle, bgcolor: status.bg, color: status.color, fontWeight: 800, fontSize: '0.75rem' }}>{status.label}</TableCell>
                      {sizes.map(s => {
                        const val = row[sizeToCol(s)];
                        return (
                          <TableCell key={s} sx={{
                            ...cellStyle,
                            color: val > 0 ? '#334155' : '#94a3b8',
                            fontWeight: val > 0 ? 800 : 400,
                            bgcolor: val > 0 ? 'transparent' : '#e2e8f0',
                            minWidth: 45, width: 45, maxWidth: 45, p: '0 !important'
                          }}>
                            {val > 0 ? val : ''}
                          </TableCell>
                        );
                      })}
                      <TableCell sx={{ ...cellStyle, color: '#475569', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.note || '-'}</TableCell>
                      {/* DỮ LIỆU CỘT THỜI GIAN CẬP NHẬT */}
                      <TableCell sx={{ ...cellStyle, color: 'black', fontSize: '0.82rem', fontWeight: 800 }}>
                        {formatVietnameseDateTime(row.updated_at)}
                      </TableCell>
                      <TableCell sx={{ ...cellStyle, position: 'sticky', right: 0, bgcolor: 'white', zIndex: 5, borderLeft: '2px solid #e2e8f0' }}>
                        <IconButton size="small" onClick={() => setEditRow(row)} color="primary"><EditOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setDeleteRow(row)} color="error"><DeleteOutlineIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [tableData, loading]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: '#fff' }}>

        <ReportHeader
          title="BIỂU GIAO THÀNH PHẨM"
          receiver={selectedClient ? selectedClient.client : '-'}
          placeholder="Tìm ngày (dd/mm), mã đơn hàng hoặc đợt..."
          onSearch={(t) => updateQuery({ q: t })}
          loading={loading}
          clients={clients}
          selectedClient={selectedClient}
          onClientChange={handleClientChange}
        />

        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {memoizedTable}
        </Box>
      </Paper>

      {editRow && <EditDialog open={!!editRow} row={editRow} onClose={() => setEditRow(null)} onSave={() => { setEditRow(null); refetch(); }} />}
      {deleteRow && <DeleteDialog open={!!deleteRow} row={deleteRow} onClose={() => setDeleteRow(null)} onConfirm={() => { setDeleteRow(null); refetch(); }} />}
    </Box>
  );
};

export default StockReport;