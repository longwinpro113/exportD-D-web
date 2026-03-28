import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, InputAdornment,
  CircularProgress, IconButton, Tooltip, Divider, Chip
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SearchIcon from '@mui/icons-material/Search';
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

const getStatus = (accumulated, total, remaining) => {
  const acc = parseFloat(accumulated) || 0;
  const rem = parseFloat(remaining) ?? null;
  if (acc === 0) return { label: 'Chưa giao', color: '#64748b', bg: '#f1f5f9' };
  if (rem !== null && rem <= 0) return { label: 'Hoàn tất', color: '#16a34a', bg: '#dcfce7' };
  return { label: 'Còn nợ', color: '#b45309', bg: '#fef9c3' };
};

const RemainingStock = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isDateSearch = (s) => /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(s.trim());

  const fetchData = useCallback(async (search) => {
    setLoading(true);
    let url = `${API_URL}/api/remaining-stock`;
    const trimmed = search.trim();
    if (trimmed) {
      if (isDateSearch(trimmed)) {
        url += `?date=${encodeURIComponent(trimmed)}`;
      } else {
        url += `?ry_number=${encodeURIComponent(trimmed)}`;
      }
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Kết nối thất bại!');
      const data = await res.json();
      setTableData(Array.isArray(data) ? groupByDate(data) : []);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchData(debouncedSearch);
  }, [debouncedSearch, fetchData]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100%' }}>
      <Paper elevation={0} sx={{
        borderRadius: '12px',
        bgcolor: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                CHI TIẾT HÀNG CÒN NỢ (REMAINING STOCK)
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.4, fontWeight: 500 }}>
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
                endAdornment: (
                  <InputAdornment position="end">
                    {loading ? (
                      <CircularProgress size={16} sx={{ color: '#94a3b8', mr: 1 }} />
                    ) : searchTerm && (
                      <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                        <ClearIcon sx={{ fontSize: '1.1rem', color: '#94a3b8' }} />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{
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

        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ width: '100%', flex: 1, overflow: 'auto', position: 'relative' }}>
            <Table size="small" sx={{
              minWidth: 2800,
              '& th, & td': { border: '1px solid #f1f5f9', py: 1.1, px: 1, textAlign: 'center' },
              borderCollapse: 'separate',
              borderSpacing: 0
            }}>
              <TableHead>
                <TableRow>
                  {['STT', 'Đơn Hàng', 'Article', 'Model Name', 'Tổng Cần Giao', 'Tổng Tích Lũy', 'Tổng SL Trong Ngày', 'SL Còn Lại', 'Trạng Thái'].map((h, i) => (
                    <TableCell key={h} align="center" sx={{
                      color: i >= 4 && i <= 7 ? '#1976d2' : '#475569',
                      bgcolor: i >= 4 && i <= 7 ? '#f1f7ff' : '#f8fafc',
                      fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap',
                      minWidth: i === 0 ? 50 : i === 1 ? 160 : i === 3 ? 150 : 120,
                      maxWidth: i === 0 ? 50 : i === 1 ? 160 : 'none',
                      position: 'sticky !important',
                      top: 0,
                      left: i === 0 ? 0 : i === 1 ? 50 : 'auto',
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
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.map((group, groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    <TableRow>
                      <TableCell colSpan={9 + sizes.length} sx={{ bgcolor: '#fff7ed', py: 0.8, borderBottom: '2px solid #ffedd5', textAlign: 'left !important', p: 0 }}>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          position: 'sticky',
                          left: 50,
                          py: 0.8,
                          px: 2
                        }}>
                          <CalendarTodayOutlinedIcon sx={{ fontSize: '1rem', color: '#c2410c' }} />
                          <Typography sx={{ fontWeight: 700, color: '#c2410c', fontSize: '0.9rem' }}>Ngày : {group.date}</Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#9a3412', ml: 1, fontWeight: 500 }}>
                            — {group.rows.length} Mã đơn hàng
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {group.rows.map((row, rowIdx) => {
                      const status = getStatus(row.accumulated_total, row.total_quantity, row.remaining_quantity);
                      return (
                        <TableRow key={row.id} hover sx={{ bgcolor: '#ffffff' }}>
                          <TableCell align="center" sx={{
                            fontWeight: 500, color: '#94a3b8', fontSize: '0.82rem',
                            position: 'sticky !important', left: '0 !important', bgcolor: '#ffffff', zIndex: 1,
                            borderRight: '1px solid #f1f5f9'
                          }}>{rowIdx + 1}</TableCell>
                          <TableCell align="center" sx={{
                            fontWeight: 800, color: '#1e293b',
                            position: 'sticky !important', left: '50px !important', bgcolor: '#ffffff', zIndex: 1,
                            borderRight: '2px solid #e2e8f0',
                            boxShadow: '2px 0 5px -1px rgba(0,0,0,0.1)'
                          }}>{row.ry_number}</TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>{row.article || '—'}</TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>{row.model_name || '—'}</TableCell>
                          <TableCell sx={{ color: '#1976d2', fontWeight: 600, fontSize: '0.85rem' }}>{row.total_quantity ?? '—'}</TableCell>
                          <TableCell sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.85rem' }}>{row.accumulated_total ?? '—'}</TableCell>
                          <TableCell sx={{ color: '#1976d2', fontWeight: 600, fontSize: '0.85rem' }}>{row.shipped_quantity ?? '0'}</TableCell>
                          <TableCell sx={{ color: '#ea580c', fontWeight: 800, fontSize: '0.85rem', bgcolor: '#fffaf5' }}>{row.remaining_quantity ?? '—'}</TableCell>
                          <TableCell sx={{ minWidth: 100 }}>
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                bgcolor: status.bg,
                                color: status.color,
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                border: `1px solid ${status.color}20`
                              }}
                            />
                          </TableCell>

                          {sizes.map(size => {
                            const val = row[sizeToCol(size)];
                            const isEmpty = val === 0 || val === '0' || !val;
                            return (
                              <TableCell
                                key={size}
                                sx={{
                                  color: isEmpty ? '#cbd5e1' : '#ef4444', // Màu đỏ cho số lượng nợ
                                  fontSize: '0.85rem',
                                  fontWeight: isEmpty ? 400 : 700,
                                  bgcolor: isEmpty ? 'transparent' : '#fff5f5'
                                }}
                              >
                                {isEmpty ? '—' : val}
                              </TableCell>
                            );
                          })}
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
    </Box>
  );
};

export default RemainingStock;
