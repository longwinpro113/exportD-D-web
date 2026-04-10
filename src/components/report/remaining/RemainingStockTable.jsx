import React, { memo } from 'react';
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { exportStockReportPdf } from '../../../utils/pdfExport';
import GroupedDateRow from '../GroupedDateRow';
import ReportTableLayout from '../ReportTableLayout';
import { baseCellStyle, commonTableSx, getLeadHeaderCellSx, sizeHeaderCellSx, sizeToCol, sizes } from '../shared';

const RemainingStockTable = memo(function RemainingStockTable({ tableData }) {
  return (
    <ReportTableLayout sx={commonTableSx}>
        <TableHead>
          <TableRow>
            {['STT', 'Đơn Hàng', 'Đợt', 'Article', 'Model Name', 'Product', 'SL Đơn Hàng', 'SL Tích Lũy', 'SL Còn Lại', 'Trạng Thái'].map((h, i) => (
              <TableCell key={h} sx={getLeadHeaderCellSx(i)}>
                {h}
              </TableCell>
            ))}
            {sizes.map((size) => <TableCell key={size} sx={sizeHeaderCellSx}>{size}</TableCell>)}
          </TableRow>
        </TableHead>

        <TableBody>
          {tableData.map((group, groupIdx) => (
            <React.Fragment key={groupIdx}>
              <GroupedDateRow
                label={group.date}
                colSpan={sizes.length + 10}
                onPrint={() => exportStockReportPdf(group, sizes)}
                backgroundColor="#fff4e5"
                accentColor="#dd6b20"
              />

              {group.rows.map((row, rowIdx) => {
                const isOk = (parseFloat(row.remaining_quantity) || 0) <= 0;
                return (
                  <TableRow key={row.ry_number + rowIdx} hover>
                    <TableCell sx={{ ...baseCellStyle, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 7, width: '40px', minWidth: '40px', maxWidth: '40px', p: '0 !important', fontWeight: 800, color: '#94a3b8', textAlign: 'center', borderRight: '1px solid #e2e8f0', boxShadow: '1px 0 0 #e2e8f0' }}>{rowIdx + 1}</TableCell>
                    
                    <TableCell sx={{ ...baseCellStyle, position: 'sticky', left: '40px', bgcolor: 'white', fontWeight: 800, borderRight: '2px solid #e2e8f0', width: '120px', minWidth: '120px', maxWidth: '120px', textAlign: 'center', p: '0 !important' }}>{row.ry_number}</TableCell>
                    
                    <TableCell sx={baseCellStyle}>{row.delivery_round || ''}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.article || ''}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.model_name || ''}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.product || '-'}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, color: '#1976d2', fontWeight: 600, width: '100px', minWidth: '100px', maxWidth: '100px', textAlign: 'center' }}>{row.total_quantity}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, color: '#6366f1', fontWeight: 600, width: '100px', minWidth: '100px', maxWidth: '100px', textAlign: 'center' }}>{row.accumulated_total}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, color: (parseFloat(row.remaining_quantity) || 0) <= 0 ? '#16a34a' : '#ef4444', fontWeight: 800, textAlign: 'center' }}>{row.remaining_quantity}</TableCell>
                    <TableCell sx={{ ...baseCellStyle, bgcolor: isOk ? '#dcfce7 !important' : '#fee2e2 !important', color: isOk ? '#16a34a !important' : '#dc2626 !important', fontWeight: 800, fontSize: '0.75rem', textAlign: 'center' }}>
                      {isOk ? 'OK' : 'Not OK'}
                    </TableCell>
                    {sizes.map((size) => {
                      const sc = sizeToCol(size);
                      const val = row[sc];
                      const originalQty = parseFloat(row[`o${sc}`]) || 0;
                      const hasOrder = originalQty > 0;
                      const isDone = hasOrder && val <= 0;
                      return (
                        <TableCell
                          key={size}
                          sx={{
                            ...baseCellStyle,
                            color: isDone ? '#16a34a' : (hasOrder ? '#dc2626' : '#94a3b8'),
                            fontWeight: hasOrder ? 800 : 400,
                            bgcolor: isDone ? '#dcfce7 !important' : (hasOrder ? 'transparent' : '#e2e8f0'),
                            minWidth: 45,
                            width: 45,
                            maxWidth: 45,
                            p: '0 !important'
                          }}
                        >
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
    </ReportTableLayout>
  );
});

export default RemainingStockTable;



