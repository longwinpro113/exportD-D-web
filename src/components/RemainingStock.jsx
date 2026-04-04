import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ReportHeader from './common/ReportHeader';
import useQuery from '../hooks/useQuery';
import useFetchList from '../hooks/useFetchList';
import { exportStockReportPdf } from '../utils/pdfExport';

const buildSizes = () => {
  const s = [];
  for (let i = 3; i <= 18; i += 0.5) s.push(i);
  return s;
};
const sizes = buildSizes();
const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;
const cellStyle = { color: '#1e293b', fontSize: '0.85rem', height: 38, borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' };

const RemainingStock = () => {
  const [query, updateQuery] = useQuery({ q: '', client: '' });
  const [data, loading] = useFetchList('/api/remaining-stock', query);
  const [clients] = useFetchList('/api/orders/clients', {});
  const [selectedClient, setSelectedClient] = useState(null);

  const trimmedSearch = (query.q || '').trim();
  const isDateSearch = trimmedSearch && /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(trimmedSearch);
  const displayDate = isDateSearch ? trimmedSearch : dayjs().format('DD/MM/YYYY');

  const tableData = [{ date: displayDate, rows: Array.isArray(data) ? data : [] }];

  const handleClientChange = (newClient) => {
    setSelectedClient(newClient);
    updateQuery({ client: newClient ? newClient.client : '' });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100%' }}>
      <Paper elevation={0} sx={{
        borderRadius: '12px', bgcolor: '#ffffff', height: '100%',
        display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', overflow: 'hidden'
      }}>

        <ReportHeader
          title="CHI TIẾT HÀNG CÒN NỢ"
          receiver={selectedClient ? selectedClient.client : '-'}
          placeholder="Tìm ngày (dd/mm), mã đơn hàng hoặc đợt..."
          onSearch={(t) => updateQuery({ q: t })}
          loading={loading}
          clients={clients}
          selectedClient={selectedClient}
          onClientChange={handleClientChange}
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
                  {['STT', 'Đơn Hàng', 'Đợt', 'Article', 'Model Name', 'SL Đơn Hàng', 'SL Tích Lũy', 'SL Còn Lại', 'Trạng Thái'].map((h, i) => (
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
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.map((group, groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    <TableRow>
                      <TableCell colSpan={sizes.length + 9} sx={{ bgcolor: '#f0f7ff', textAlign: 'left !important', py: 0, height: 38, borderRight: '1px solid #cbd5e1' }}>
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

                    {group.rows.map((row, rowIdx) => {
                      const isOk = (parseFloat(row.remaining_quantity) || 0) <= 0;
                      return (
                        <TableRow key={row.ry_number + rowIdx} hover>
                          <TableCell sx={{ ...cellStyle, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1, color: '#94a3b8', width: '40px' }}>{rowIdx + 1}</TableCell>
                          <TableCell sx={{ ...cellStyle, position: 'sticky', left: 40, bgcolor: 'white', zIndex: 1, fontWeight: 800, borderRight: '2px solid #e2e8f0', width: '120px' }}>{row.ry_number}</TableCell>
                          <TableCell sx={cellStyle}>{row.delivery_round || ''}</TableCell>
                          <TableCell sx={{ ...cellStyle, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.article || ''}</TableCell>
                          <TableCell sx={{ ...cellStyle, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.model_name || ''}</TableCell>
                          <TableCell sx={{ ...cellStyle, color: '#1976d2', fontWeight: 600 }}>{row.total_quantity}</TableCell>
                          <TableCell sx={{ ...cellStyle, color: '#6366f1', fontWeight: 600 }}>{row.accumulated_total}</TableCell>
                          <TableCell sx={{ ...cellStyle, color: '#ea580c', fontWeight: 800 }}>{row.remaining_quantity}</TableCell>
                          <TableCell sx={{ ...cellStyle, bgcolor: isOk ? '#dcfce7 !important' : '#fee2e2 !important', color: isOk ? '#16a34a !important' : '#dc2626 !important', fontWeight: 800, fontSize: '0.75rem' }}>
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
                                ...cellStyle,
                                color: isDone ? '#16a34a' : (hasOrder ? '#dc2626' : '#94a3b8'),
                                fontWeight: hasOrder ? 800 : 400,
                                bgcolor: isDone ? '#dcfce7 !important' : (hasOrder ? 'transparent' : '#e2e8f0'),
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