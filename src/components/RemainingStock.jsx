import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography 
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ReportHeader from './common/ReportHeader';
import useQuery from '../hooks/useQuery';
import useFetchList from '../hooks/useFetchList';

const buildSizes = () => {
  const s = [];
  for (let i = 3; i <= 18; i += 0.5) s.push(i);
  return s;
};
const sizes = buildSizes();
const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;

const RemainingStock = () => {
  const [query, updateQuery] = useQuery({ q: '' });
  const [data, loading] = useFetchList('/api/remaining-stock', query);

  const trimmedSearch = (query.q || '').trim();
  const isDateSearch = trimmedSearch && /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(trimmedSearch);
  const displayDate = isDateSearch ? trimmedSearch : dayjs().format('DD/MM/YYYY');
  
  const tableData = [{ date: displayDate, rows: Array.isArray(data) ? data : [] }];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100%' }}>
      <Paper elevation={0} sx={{
        borderRadius: '12px', bgcolor: '#ffffff', height: '100%',
        display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', overflow: 'hidden'
      }}>
        
        <ReportHeader 
          title="CHI TIẾT HÀNG CÒN NỢ (REMAINING STOCK)" 
          placeholder="Tìm ngày (dd/mm), mã đơn hàng hoặc đợt..." 
          onSearch={(t) => updateQuery({ q: t })} 
          loading={loading} 
        />

        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TableContainer sx={{ width: '100%', flex: 1, overflow: 'auto' }}>
            <Table size="small" sx={{ 
              minWidth: 2800, borderCollapse: 'separate', borderSpacing: 0, 
              '& th, & td': { 
                border: '1px solid #f1f5f9', 
                py: 0.6, px: 1, 
                textAlign: 'center',
                whiteSpace: 'nowrap'
              } 
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
                      minWidth: i === 0 ? 50 : i === 1 ? 150 : (i >= 5 ? 110 : 'auto'),
                      borderRight: i === 1 ? '2px solid #e2e8f0' : '1px solid #f1f5f9',
                      boxShadow: i === 1 ? '2px 0 5px -1px rgba(0,0,0,0.1)' : 'none'
                    }}>{h}</TableCell>
                  ))}
                  {sizes.map(size => (
                    <TableCell key={size} sx={{ 
                      bgcolor: '#f8fafc', fontWeight: 700, position: 'sticky', top: 0, zIndex: 1, 
                      minWidth: 45, width: 45, maxWidth: 45, p: '0 !important'
                    }}>{size}</TableCell>
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
                          <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1, color: '#94a3b8', width: 50, minWidth: 50 }}>{rowIdx + 1}</TableCell>
                           <TableCell sx={{ position: 'sticky', left: 50, bgcolor: 'white', zIndex: 1, fontWeight: 800, borderRight: '2px solid #e2e8f0', width: 150, minWidth: 150 }}>{row.ry_number}</TableCell>
                          <TableCell>{row.delivery_round || ''}</TableCell>
                          <TableCell sx={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.article || ''}</TableCell>
                          <TableCell sx={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.model_name || ''}</TableCell>
                          <TableCell sx={{ color: '#1976d2', fontWeight: 600, width: 110, minWidth: 110 }}>{row.total_quantity}</TableCell>
                          <TableCell sx={{ color: '#6366f1', fontWeight: 600, width: 110, minWidth: 110 }}>{row.accumulated_total}</TableCell>
                          <TableCell sx={{ color: '#ea580c', fontWeight: 800, width: 110, minWidth: 110 }}>{row.remaining_quantity}</TableCell>
                          <TableCell sx={{ bgcolor: isOk ? '#dcfce7 !important' : '#fee2e2 !important', color: isOk ? '#16a34a !important' : '#dc2626 !important', fontWeight: 800, width: 110, minWidth: 110 }}>
                            {isOk ? 'OK' : 'Not OK'}
                          </TableCell>
                          {sizes.map(size => {
                            const sc = sizeToCol(size);
                            const val = row[sc];
                            const originalQty = parseFloat(row['o' + sc]) || 0; // Backend sends os3, os3_5 if sc is s3
                            const hasOrder = originalQty > 0;
                            const isDone = hasOrder && val <= 0;
                            
                            return (
                              <TableCell key={size} sx={{
                                color: isDone ? '#16a34a' : (hasOrder ? '#dc2626' : '#94a3b8'),
                                fontWeight: hasOrder ? 800 : 400,
                                bgcolor: isDone ? '#dcfce7 !important' : (hasOrder ? 'transparent' : '#f1f5f9'),
                                minWidth: 45, width: 45, maxWidth: 45, p: '0 !important'
                              }}>
                                {!hasOrder ? '' : (isDone ? 'Ok' : val)}
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