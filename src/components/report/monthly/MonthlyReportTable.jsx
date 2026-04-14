import React, { memo, useEffect, useMemo, useState } from 'react';
import { Box, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupedDateRow from '../GroupedDateRow';
import ReportTableLayout from '../ReportTableLayout';
import { baseCellStyle, commonTableSx, getLeadHeaderCellSx, sizeHeaderCellSx, sizeToCol, sizes } from '../shared';
import { exportMonthlyReportPdf } from '../../../utils/reportPdfVi';

const sanitizeIntegerInput = (value) => String(value || '').replace(/[^\d]/g, '');

const headerLabels = [
  'STT',
  'Đơn Hàng',
  'Đợt Giao Hàng',
  'Article',
  'Model Name',
  'Sản Phẩm',
  'SL Đơn Hàng',
  'SL Tích Lũy\n(dự kiến)',
  'SL Tích Lũy\n(thực tế)',
  'SL Còn Lại',
  'Trạng Thái'
];

const MonthlyReportRow = memo(function MonthlyReportRow({
  row,
  rowIdx,
  projectedValue,
  actualValue,
  remainingValue,
  isOk,
  isProjectedEdited,
  onProjectedChange,
  onProjectedRevert
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    setDraftValue(String(projectedValue ?? 0));
  }, [isEditing, projectedValue]);

  const commitEdit = () => {
    const nextValue = Number.parseInt(draftValue, 10);
    onProjectedChange(row.ry_number, Number.isFinite(nextValue) ? nextValue : 0);
    setIsEditing(false);
    setDraftValue('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraftValue('');
  };

  return (
    <TableRow hover>
      <TableCell sx={{ ...baseCellStyle, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 7, width: '40px', minWidth: '40px', maxWidth: '40px', p: '0 !important', fontWeight: 800, color: '#94a3b8', textAlign: 'center', borderRight: '1px solid #e2e8f0', boxShadow: '1px 0 0 #e2e8f0' }}>{rowIdx + 1}</TableCell>
      <TableCell sx={{ ...baseCellStyle, position: 'sticky', left: '40px', bgcolor: 'white', fontWeight: 800, borderRight: '2px solid #e2e8f0', width: '120px', minWidth: '120px', maxWidth: '120px', textAlign: 'center', p: '0 !important' }}>{row.ry_number}</TableCell>
      <TableCell sx={baseCellStyle}>{row.delivery_round || ''}</TableCell>
      <TableCell sx={{ ...baseCellStyle, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.article || ''}</TableCell>
      <TableCell sx={{ ...baseCellStyle, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.model_name || ''}</TableCell>
      <TableCell sx={{ ...baseCellStyle, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.product || '-'}</TableCell>
      <TableCell sx={{ ...baseCellStyle, color: '#1976d2', fontWeight: 600, width: '100px', minWidth: '100px', maxWidth: '100px', textAlign: 'center' }}>{Number(row.total_quantity) || 0}</TableCell>
      <TableCell
        sx={{
          ...baseCellStyle,
          color: '#0f766e',
          fontWeight: 700,
          width: '115px',
          minWidth: '115px',
          maxWidth: '115px',
          textAlign: 'center',
          cursor: 'text',
          position: 'relative'
        }}
        onDoubleClick={() => {
          if (!isEditing && !isOk) {
            setDraftValue(String(projectedValue ?? 0));
            setIsEditing(true);
          }
        }}
      >
        {isProjectedEdited && !isEditing ? (
          <Box
            component="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isOk) onProjectedRevert(row.ry_number);
            }}
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 15,
              height: 15,
              border: 0,
              background: 'transparent',
              p: 0,
              color: '#16a34a',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isOk ? 0.35 : 1,
              pointerEvents: isOk ? 'none' : 'auto'
            }}
            aria-label="Revert value"
            title="Revert value"
          >
            <CheckCircleIcon sx={{ fontSize: 14 }} />
          </Box>
        ) : null}

        {isEditing ? (
          <TextField
            autoFocus
            variant="standard"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={draftValue}
            onChange={(e) => setDraftValue(sanitizeIntegerInput(e.target.value))}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData('text');
              setDraftValue(sanitizeIntegerInput(pasted));
            }}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') cancelEdit();
              if (
                e.key.length === 1 &&
                !/[0-9]/.test(e.key) &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.altKey
              ) {
                e.preventDefault();
              }
            }}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              style: { textAlign: 'center', fontSize: '0.82rem', padding: 0 }
            }}
            sx={{ width: '100%' }}
          />
        ) : (
          projectedValue
        )}
      </TableCell>
      <TableCell sx={{ ...baseCellStyle, color: '#6366f1', fontWeight: 600, width: '115px', minWidth: '115px', maxWidth: '115px', textAlign: 'center' }}>{actualValue}</TableCell>
      <TableCell sx={{ ...baseCellStyle, color: remainingValue <= 0 ? '#16a34a' : '#ef4444', fontWeight: 800, textAlign: 'center' }}>{remainingValue}</TableCell>
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
}, (prev, next) => {
  if (prev.row.ry_number !== next.row.ry_number) return false;
  if (prev.row.delivery_round !== next.row.delivery_round) return false;
  if (prev.row.article !== next.row.article) return false;
  if (prev.row.model_name !== next.row.model_name) return false;
  if (prev.row.product !== next.row.product) return false;
  if ((Number(prev.row.total_quantity) || 0) !== (Number(next.row.total_quantity) || 0)) return false;
  if ((Number(prev.row.accumulated_total) || 0) !== (Number(next.row.accumulated_total) || 0)) return false;
  if ((Number(prev.row.pdf_shipped_total) || 0) !== (Number(next.row.pdf_shipped_total) || 0)) return false;
  if ((Number(prev.row.pdf_remaining_quantity) || 0) !== (Number(next.row.pdf_remaining_quantity) || 0)) return false;

  for (const size of sizes) {
    const sc = sizeToCol(size);
    if ((prev.row[sc] ?? '') !== (next.row[sc] ?? '')) return false;
    if ((prev.row[`o${sc}`] ?? '') !== (next.row[`o${sc}`] ?? '')) return false;
  }

  return prev.rowIdx === next.rowIdx
    && prev.projectedValue === next.projectedValue
    && prev.actualValue === next.actualValue
    && prev.remainingValue === next.remainingValue
    && prev.isOk === next.isOk
    && prev.isProjectedEdited === next.isProjectedEdited;
});

const MonthlyReportTable = memo(function MonthlyReportTable({
  loading,
  tableData,
  projectedByRyNumber,
  editedProjectedByRyNumber,
  onProjectedChange,
  onProjectedRevert,
  onPrintGroup,
  clientName = ''
}) {
  const titleCells = useMemo(() => headerLabels.map((h, i) => (
    <TableCell
      key={h}
      sx={{
        ...getLeadHeaderCellSx(i),
        whiteSpace: h.includes('\n') ? 'pre-line !important' : undefined
      }}
    >
      {h}
    </TableCell>
  )), []);

  return (
    <ReportTableLayout sx={commonTableSx}>
      <TableHead>
        <TableRow>
          {titleCells}
          {sizes.map((size) => <TableCell key={size} sx={sizeHeaderCellSx}>{size}</TableCell>)}
        </TableRow>
      </TableHead>

      <TableBody>
        {tableData.map((group, groupIdx) => (
          <React.Fragment key={groupIdx}>
            <GroupedDateRow
              label={group.date}
              colSpan={sizes.length + 11}
              onPrint={() => (onPrintGroup ? onPrintGroup(group, sizes) : exportMonthlyReportPdf(group, sizes, 'BÁO CÁO CÔNG NỢ', clientName))}
              backgroundColor="#e8f3ff"
              accentColor="#1976d2"
            />

            {group.rows.map((row, rowIdx) => {
              const actualValue = Number(row.accumulated_total) || 0;
              const projectedValue = projectedByRyNumber?.[row.ry_number] !== undefined
                ? Number(projectedByRyNumber[row.ry_number]) || 0
                : Number(row.pdf_shipped_total ?? actualValue) || 0;
              const remainingValue = Number(row.pdf_remaining_quantity ?? Math.max((Number(row.total_quantity) || 0) - projectedValue, 0));
              const isOk = remainingValue <= 0;

              return (
                <MonthlyReportRow
                  key={row.ry_number + rowIdx}
                  row={row}
                  rowIdx={rowIdx}
                  projectedValue={projectedValue}
                  actualValue={actualValue}
                  remainingValue={remainingValue}
                  isOk={isOk}
                  isProjectedEdited={Boolean(editedProjectedByRyNumber?.[row.ry_number])}
                  onProjectedChange={onProjectedChange}
                  onProjectedRevert={onProjectedRevert}
                />
              );
            })}
          </React.Fragment>
        ))}
      </TableBody>
    </ReportTableLayout>
  );
});

export default MonthlyReportTable;
