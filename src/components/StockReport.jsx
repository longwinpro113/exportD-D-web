import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, InputAdornment,
  CircularProgress, Alert, Snackbar, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Divider
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ClearIcon from '@mui/icons-material/Clear';


// const API_URL = "http://localhost:5000"
const API_URL = "https://exportd-d-api.onrender.com";

const buildSizes = () => {
  const s = [];
  for (let i = 3; i <= 18; i += 0.5) s.push(i);
  return s;
};
const sizes = buildSizes();
const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;

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

// ─── Edit Dialog ─────────────────────────────────────────────────────────────
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

  const computedShipped = sizes.reduce((sum, s) => sum + (parseFloat(form[sizeToCol(s)]) || 0), 0);

  const handleConfirm = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {};
      sizes.forEach(size => {
        payload[sizeToCol(size)] = parseFloat(form[sizeToCol(size)]) || 0;
      });

      const res = await fetch(`${API_URL}/api/export/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
        Edit Export Record
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 400, mt: 0.3 }}>
          {row.ry_number} — {row.export_date}
        </Typography>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
            Đơn hàng giao trong ngày: <strong style={{ color: '#1976d2' }}>{computedShipped}</strong>
          </Typography>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '12px 20px'
        }}>
          {sizes.map(size => {
            const col = sizeToCol(size);
            return (
              <Box key={size} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{size}</Typography>
                <TextField
                  size="small"
                  placeholder=""
                  value={form[col] || ''}
                  onChange={(e) => handleChange(col, e.target.value)}
                  inputProps={{ style: { textAlign: 'center', padding: '6px 0', fontSize: '0.85rem' } }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      bgcolor: (form[col] && form[col] !== '0') ? '#ffffff' : '#cbd5e1'
                    }
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#e2e8f0', color: '#475569' }}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ borderRadius: '8px', textTransform: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
const DeleteDialog = ({ open, row, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/export/${row.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      onConfirm();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (!row) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
      <DialogContent sx={{ pt: 3, pb: 1, textAlign: 'center' }}>
        <WarningAmberRoundedIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 1 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>Xóa đơn hàng?</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
          <strong>{row.ry_number}</strong> — {row.export_date}
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8', mt: 0.5 }}>
          Hành động này không thể hoàn tác.
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: '8px', textAlign: 'left' }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1, justifyContent: 'center' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#e2e8f0', color: '#475569', px: 3 }}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ borderRadius: '8px', textTransform: 'none', boxShadow: 'none', px: 3 }}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main StockReport ─────────────────────────────────────────────────────────
const StockReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);

  const isDateSearch = (s) => /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(s.trim());

  const fetchData = useCallback(async (search) => {
    setLoading(true);
    let url = `${API_URL}/api/export`;
    const trimmed = search.trim();
    if (trimmed) {
      if (isDateSearch(trimmed)) {
        url += `?date=${encodeURIComponent(trimmed)}`;
      } else {
        url += `?ry_number=${encodeURIComponent(trimmed)}`;
      }
    }

    const fetchPromise = fetch(url).then(async (res) => {
      if (!res.ok) throw new Error('Kết nối thất bại!');
      return res.json();
    });

    try {
      const data = await fetchPromise;
      setTableData(Array.isArray(data) ? groupByDate(data) : []);
    } catch (err) {
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(debouncedSearch);
  }, [debouncedSearch, fetchData]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100%' }}>
      <Paper elevation={0} sx={{
        borderRadius: '8px', backgroundColor: '#ffffff',
        display: 'flex', flexDirection: 'column',
        width: '100%', height: '100%',
        overflow: 'hidden', border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                BIỂU GIAO THÀNH PHẨM QUA CÔNG TY LẠC TỶ
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
                Đơn vị chuyển: DD (Long An)
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Đơn vị lãnh</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>Công Ty Lạc Tỷ</Typography>
            </Box>
          </Box>

          <Box sx={{ width: '360px', mt: 1 }}>
            <TextField
              placeholder="Tìm ngày (dd/mm) hoặc mã đơn hàng..."
              variant="outlined"
              size="small"
              fullWidth
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                      <ClearIcon sx={{ fontSize: '1.1rem', color: '#94a3b8' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: 400,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                    WebkitTextFillColor: '#1e293b !important',
                  }
                }
              }}
            />
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{
              width: '100%',
              flex: 1,
              overflow: 'auto',
              position: 'relative'
          }}>
            <Table size="small" sx={{ 
                minWidth: 2800, // Buộc TableContainer hiển thị thanh cuộn ngang
                '& th, & td': { border: '1px solid #f1f5f9', py: 1.1, px: 1, textAlign: 'center' },
                borderCollapse: 'separate',
                borderSpacing: 0
            }}>
              <TableHead>
                <TableRow>
                    {['STT', 'Đơn Hàng', 'Đợt', 'Article', 'Model Name', 'Tổng Cần Giao', 'Tổng Tích Lũy', 'Tổng SL Trong Ngày', 'SL Còn Lại', 'Trạng Thái'].map((h, i) => (
                        <TableCell key={h} align="center" sx={{
                            color: i >= 5 && i <= 8 ? '#1976d2' : '#1e293b',
                            bgcolor: i >= 5 && i <= 8 ? '#f1f7ff' : '#f8fafc',
                            fontWeight: 800, fontSize: '0.82rem', whiteSpace: 'nowrap',
                            minWidth: i === 0 ? 50 : i === 1 ? 160 : i === 2 ? 80 : i === 4 ? 150 : i === 9 ? 80 : 120,
                            maxWidth: i === 0 ? 50 : i === 1 ? 160 : 'none',
                            position: 'sticky !important',
                            top: 0,
                            left: i === 0 ? 0 : i === 1 ? 50 : 'auto',
                            zIndex: i === 0 ? 15 : 14,
                            zIndex: i <= 1 ? 12 : 2,
                            borderRight: i <= 1 ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                            boxShadow: i === 1 ? '2px 0 5px -1px rgba(0,0,0,0.1)' : 'none'
                        }}>{h}</TableCell>
                    ))}
                  {sizes.map(size => (
                    <TableCell key={size} sx={{ 
                        color: '#475569', fontWeight: 700, fontSize: '0.82rem', bgcolor: '#f8fafc', 
                        minWidth: 40, position: 'sticky', top: 0, zIndex: 1
                    }}>{size}</TableCell>
                  ))}
                  <TableCell sx={{ 
                      color: '#475569', fontWeight: 700, fontSize: '0.82rem', bgcolor: '#f8fafc', 
                      minWidth: 80, position: 'sticky', top: 0, right: 0, zIndex: 13 
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.map((group, groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    <TableRow>
                      <TableCell colSpan={10 + sizes.length + 1} sx={{ bgcolor: '#f0f7ff', py: 0.8, borderBottom: '2px solid #dbeafe', textAlign: 'left !important', p: 0 }}>
                        <Box sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            position: 'sticky', 
                            left: 50,
                            py: 0.8,
                            px: 2
                        }}>
                          <CalendarTodayOutlinedIcon sx={{ fontSize: '1rem', color: '#1976d2' }} />
                          <Typography sx={{ fontWeight: 700, color: '#1976d2', fontSize: '0.9rem' }}>{group.date}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {group.rows.map((row, rowIdx) => {
                      const status = getStatus(row.accumulated_total, row.total_quantity, row.remaining_quantity);
                      const remVal = parseFloat(row.remaining_quantity) || 0;
                      return (
                        <TableRow key={row.id} hover sx={{ 
                          bgcolor: '#ffffff',
                          '&:hover td': { bgcolor: '#f8fafc' },
                          '&:hover td.sticky-cell': { bgcolor: '#f8fafc !important' }
                        }}>
                          <TableCell align="center" className="sticky-cell" sx={{ 
                                                fontWeight: 500, color: '#94a3b8', fontSize: '0.82rem',
                                                position: 'sticky !important', left: '0 !important', bgcolor: '#ffffff', zIndex: 1,
                                                borderRight: '1px solid #f1f5f9'
                                            }}>{rowIdx + 1}</TableCell>
                          <TableCell align="center" className="sticky-cell" sx={{ 
                                                fontWeight: 800, color: '#1e293b',
                                                position: 'sticky !important', left: '50px !important', bgcolor: '#ffffff', zIndex: 1,
                                                borderRight: '2px solid #e2e8f0',
                                                boxShadow: '2px 0 5px -1px rgba(0,0,0,0.1)'
                                            }}>{row.ry_number}</TableCell>
                          <TableCell sx={{ color: '#1e293b', fontSize: '0.82rem', fontWeight: 800 }}>{row.delivery_round || '—'}</TableCell>
                          <TableCell sx={{ color: '#1e293b', fontSize: '0.82rem', fontWeight: 800 }}>{row.article || '—'}</TableCell>
                          <TableCell sx={{ color: '#1e293b', fontSize: '0.82rem', fontWeight: 800 }}>{row.model_name || '—'}</TableCell>
                          <TableCell sx={{ color: '#1976d2', fontWeight: 700, fontSize: '0.85rem', bgcolor: '#f8fbff !important' }}>{row.total_quantity ?? '—'}</TableCell>
                          <TableCell sx={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', bgcolor: '#faf8ff !important' }}>{row.accumulated_total ?? 0}</TableCell>
                          <TableCell sx={{ color: '#0369a1', fontWeight: 600, fontSize: '0.85rem', bgcolor: '#f8fcff !important' }}>{row.shipped_quantity ?? 0}</TableCell>
                          <TableCell sx={{
                            fontWeight: 600, fontSize: '0.85rem',
                            color: remVal < 0 ? '#ef4444' : remVal === 0 ? '#16a34a' : '#f59e0b'
                          }}>
                            {row.remaining_quantity ?? '—'}
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: `${status.bg} !important`, 
                            color: `${status.color} !important`,
                            fontWeight: 800, 
                            fontSize: '0.8rem'
                          }}>
                            {status.label}
                          </TableCell>

                          {sizes.map(size => {
                            const val = row[sizeToCol(size)];
                            return (
                              <TableCell key={size} sx={{ color: val > 0 ? '#334155' : '#e2e8f0', fontSize: '0.82rem', fontWeight: val > 0 ? 500 : 400 }}>
                                {val > 0 ? val : ''}
                              </TableCell>
                            );
                          })}

                          <TableCell sx={{ position: 'sticky', right: 0, bgcolor: '#ffffff', zIndex: 1, px: 0.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => setEditRow(row)}
                                  sx={{ color: '#1976d2', borderRadius: '6px', '&:hover': { bgcolor: '#e3f2fd' } }}
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteRow(row)}
                                  sx={{ color: '#ef4444', borderRadius: '6px', '&:hover': { bgcolor: '#fef2f2' } }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <EditDialog
        open={!!editRow}
        row={editRow}
        onClose={() => setEditRow(null)}
        onSave={() => { setEditRow(null); fetchData(searchTerm); }}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteRow}
        row={deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => { setDeleteRow(null); fetchData(searchTerm); }}
      />
    </Box>
  );
};

export default StockReport;
