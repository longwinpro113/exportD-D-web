import React, { memo } from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { exportStockReportPdf } from '../../../utils/pdfExport';
import GroupedDateRow from '../GroupedDateRow';
import ReportTableLayout from '../ReportTableLayout';
import { baseCellStyle, commonTableSx, getLeadHeaderCellSx, sizeHeaderCellSx, sizeToCol, sizes } from '../shared';
import { formatVietnameseDateTime, getStatus } from './helpers';

const StockReportTable = memo(function StockReportTable({
  loading,
  tableData,
  onEdit,
  onDelete
}) {
  if (loading && tableData.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <ReportTableLayout minWidth={2400} sx={commonTableSx}>
        <TableHead>
          <TableRow>
            {['STT', 'Đơn Hàng', 'Đợt', 'Article', 'Model Name', 'SL Đơn Hàng', 'SL Tích Lũy', 'SL Ngày', 'SL Còn Lại', 'Trạng Thái'].map((h, i) => (
              <TableCell key={h} sx={getLeadHeaderCellSx(i)}>
                {h}
              </TableCell>
            ))}
            {sizes.map((size) => <TableCell key={size} sx={sizeHeaderCellSx}>{size}</TableCell>)}
            <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, top: 0, zIndex: 1, minWidth: '100px' }}>Ghi chú</TableCell>
            <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700,  top: 0, zIndex: 1, minWidth: '120px' }}>Cập nhật lúc</TableCell>
            <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, position: 'sticky', top: 0, right: 0, zIndex: 13, borderLeft: '2px solid #e2e8f0' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              <GroupedDateRow
                label={group.date}
                colSpan={sizes.length + 13}
                onPrint={() => exportStockReportPdf(group, sizes)}
                backgroundColor="#e8f3ff"
                accentColor="#1976d2"
                hasStickyAction
              />
              {group.rows.map((row, rIdx) => {
                const status = getStatus(row.remaining_quantity);
                return (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ ...baseCellStyle, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 7, width: '40px', minWidth: '40px', maxWidth: '40px', p: '0 !important', fontWeight: 800, textAlign: 'center', borderRight: '1px solid #e2e8f0', boxShadow: '1px 0 0 #e2e8f0' }}>{rIdx + 1}</TableCell>

                    <TableCell sx={{ ...baseCellStyle, position: 'sticky', left: '40px', bgcolor: 'white', fontWeight: 800, borderRight: '2px solid #e2e8f0', width: '120px', minWidth: '120px', maxWidth: '120px', textAlign: 'center', p: '0 !important' }}>{row.ry_number}</TableCell>
                    
                    <TableCell sx={{ ...baseCellStyle, fontWeight: 800, color: '#DAA06D' }}>{row.delivery_round}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, fontWeight: 800, color: '#DAA06D', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.article}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, fontWeight: 800, color: '#DAA06D', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.model_name}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, color: '#1976d2', fontWeight: 700, width: '110px', minWidth: '110px', maxWidth: '110px' }}>{row.total_quantity}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, color: '#7c3aed', fontWeight: 700, width: '110px', minWidth: '110px', maxWidth: '110px' }}>{row.accumulated_total}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, color: '#0369a1', fontWeight: 600 }}>{row.shipped_quantity}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, fontWeight: 600, color: row.remaining_quantity <= 0 ? '#16a34a' : '#ef4444' }}>{row.remaining_quantity}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, bgcolor: status.bg, color: status.color, fontWeight: 800, fontSize: '0.75rem' }}>{status.label}</TableCell>
                    {sizes.map((s) => {
                      const val = row[sizeToCol(s)];
                      return (
                        <TableCell
                          key={s}
                          sx={{
                            ...baseCellStyle,
                            color: val > 0 ? '#334155' : '#94a3b8',
                            fontWeight: val > 0 ? 800 : 400,
                            bgcolor: val > 0 ? 'transparent' : '#e2e8f0',
                            minWidth: 45,
                            width: 45,
                            maxWidth: 45,
                            p: '0 !important'
                          }}
                        >
                          {val > 0 ? val : ''}
                        </TableCell>
                      );
                    })}
                    <TableCell sx={{ ...baseCellStyle, color: '#475569', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.note || '-'}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, color: 'black', fontSize: '0.82rem', fontWeight: 800 }}>
                      {formatVietnameseDateTime(row.updated_at)}
                    </TableCell>
                    <TableCell sx={{ ...baseCellStyle, position: 'sticky', right: 0, bgcolor: 'white', zIndex: 5, borderLeft: '2px solid #e2e8f0' }}>
                      <IconButton size="small" onClick={() => onEdit(row)} color="primary"><EditOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => onDelete(row)} color="error"><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
    </ReportTableLayout>
  );
});

export default StockReportTable;


