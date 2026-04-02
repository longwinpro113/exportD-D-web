import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography 
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import RemainingHeader from './RemainingHeader/RemainingHeader';

const API_URL = import.meta.env.VITE_API_URL;
console.log("API URL", API_URL);

const buildSizes = () => {
  const s = [];
  for (let i = 3; i <= 18; i += 0.5) s.push(i);
  return s;
};
const sizes = buildSizes();
const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;

const RemainingStock = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isDateSearch = (s) => /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(s.trim());

  const fetchData = useCallback(async (search) => {
    setLoading(true);
    let url = `${API_URL}/api/remaining-stock`;
    const trimmed = search.trim();
    
    if (trimmed) {
      if (isDateSearch(trimmed)) url += `?date=${encodeURIComponent(trimmed)}`;
      else if (trimmed.toLowerCase().startsWith('d:')) url += `?round=${encodeURIComponent(trimmed.slice(2).trim())}`;
      else url += `?ry_number=${encodeURIComponent(trimmed)}&any=${encodeURIComponent(trimmed)}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      const displayDate = isDateSearch(trimmed) ? trimmed : dayjs().format('DD/MM/YYYY');
      setTableData([{ date: displayDate, rows: Array.isArray(data) ? data : [] }]);
    } catch (err) {
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(searchQuery);
  }, [searchQuery, fetchData]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100%' }}>
      <Paper elevation={0} sx={{
        borderRadius: '12px', bgcolor: '#ffffff', height: '100%',
        display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', overflow: 'hidden'
      }}>
        
        <RemainingHeader onSearch={setSearchQuery} loading={loading} />

        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TableContainer sx={{ width: '100%', flex: 1, overflow: 'auto' }}>
            <Table size="small" sx={{ 
              minWidth: 2800, borderCollapse: 'separate', borderSpacing: 0, 
              '& th, & td': { border: '1px solid #f1f5f9', py: 1.1, px: 1, textAlign: 'center' } 
            }}>
              <TableHead>
                <TableRow>
                  {['STT', 'Đơn Hàng', 'Đợt', 'Article', 'Model Name', 'Tổng Cần Giao', 'Tổng Tích Lũy', 'SL Còn Lại', 'Trạng Thái'].map((h, i) => (
                    <TableCell key={h} sx={{
                      bgcolor: i >= 5 && i <= 8 ? '#f1f7ff' : '#f8fafc',
                      color: i >= 5 && i <= 8 ? '#1976d2' : '#475569',
                      fontWeight: 700, fontSize: '0.8rem',
                      position: 'sticky', top: 0, 
                      left: i === 0 ? 0 : i === 1 ? 50 : 'auto',
                      zIndex: i <= 1 ? 12 : 2,
                      minWidth: i === 0 ? 50 : i === 1 ? 160 : 120,
                      borderRight: i === 1 ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                      boxShadow: i === 1 ? '2px 0 5px -1px rgba(0,0,0,0.1)' : 'none'
                    }}>{h}</TableCell>
                  ))}
                  {sizes.map(size => (
                    <TableCell key={size} sx={{ bgcolor: '#f8fafc', fontWeight: 700, position: 'sticky', top: 0, zIndex: 1, minWidth: 45 }}>{size}</TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.map((group, groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    <TableRow>
                      <TableCell colSpan={10 + sizes.length} sx={{ bgcolor: '#fff7ed', p: 0, height: '40px', borderBottom: '2px solid #ffedd5' }}>
                        <Box sx={{
                          display: 'flex', alignItems: 'center', gap: 1,
                          position: 'sticky', left: 50, // Khớp với cột Đơn Hàng
                          zIndex: 10, width: 'fit-content', px: 2, height: '100%', bgcolor: '#fff7ed'
                        }}>
                          <CalendarTodayOutlinedIcon sx={{ fontSize: '1rem', color: '#c2410c' }} />
                          <Typography sx={{ fontWeight: 800, color: '#c2410c', fontSize: '0.85rem' }}>Ngày : {group.date}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {group.rows.map((row, rowIdx) => {
                      const isOk = (parseFloat(row.remaining_quantity) || 0) <= 0;
                      return (
                        <TableRow key={row.ry_number + rowIdx} hover>
                          <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1, color: '#94a3b8' }}>{rowIdx + 1}</TableCell>
                          <TableCell sx={{ position: 'sticky', left: 50, bgcolor: 'white', zIndex: 1, fontWeight: 800, borderRight: '2px solid #e2e8f0' }}>{row.ry_number}</TableCell>
                          <TableCell>{row.delivery_round || '—'}</TableCell>
                          <TableCell>{row.article || '—'}</TableCell>
                          <TableCell>{row.model_name || '—'}</TableCell>
                          <TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>{row.total_quantity}</TableCell>
                          <TableCell sx={{ color: '#6366f1', fontWeight: 600 }}>{row.accumulated_total}</TableCell>
                          <TableCell sx={{ color: '#ea580c', fontWeight: 800 }}>{row.remaining_quantity}</TableCell>
                          <TableCell sx={{ bgcolor: isOk ? '#dcfce7 !important' : '#fee2e2 !important', color: isOk ? '#16a34a !important' : '#dc2626 !important', fontWeight: 800 }}>
                            {isOk ? 'Ok' : 'Not Ok'}
                          </TableCell>
                          {sizes.map(size => {
                            const val = row[sizeToCol(size)];
                            const hasOrder = parseFloat(row[`order_${sizeToCol(size)}`]) > 0;
                            const isDone = hasOrder && val <= 0;
                            return (
                              <TableCell key={size} sx={{
                                color: isDone ? '#16a34a' : (!hasOrder ? '#cbd5e1' : '#ef4444'),
                                fontWeight: hasOrder ? 800 : 400,
                                bgcolor: isDone ? '#dcfce7' : 'transparent'
                              }}>
                                {!hasOrder ? '—' : (isDone ? 'Ok' : val)}
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