import React, { memo } from 'react';
import { Box, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import ReportTableLayout from '../ReportTableLayout';
import { sizes } from '../shared';
import { clientOrderColumns, groupOrdersByClient, stickyColumnOffsets } from './helpers';

const cellStyle = {
  color: '#1e293b',
  fontSize: '0.95rem',
  fontWeight: 700,
  height: 40,
  whiteSpace: 'nowrap',
  fontFamily: 'Calibri, Arial, sans-serif',
  borderRight: '1px solid #f1f5f9',
  borderBottom: '1px solid #f1f5f9'
};

const stickyCellStyle = (columnKey, header = false) => ({
  position: 'sticky',
  left: `${stickyColumnOffsets[columnKey]}px`,
  zIndex: header ? 30 : 20,
  backgroundColor: header ? '#f8fafc' : '#ffffff',
  backgroundImage: 'none',
  boxShadow: columnKey === 'donHang' ? '2px 0 0 #cbd5e1' : 'none'
});

const groupRowCellSx = {
  bgcolor: '#eef6ff',
  color: '#1976d2',
  fontWeight: 800,
  fontSize: '0.92rem',
  borderBottom: '1px solid #dbeafe',
  borderRight: '1px solid #dbeafe',
  py: 1.25,
  px: 1.5,
  textAlign: 'center'
};

const renderOrderRow = (row) => (
  <TableRow key={row.id}>
    <TableCell align="center" sx={{ ...cellStyle, width: clientOrderColumns[0].width, minWidth: clientOrderColumns[0].width, maxWidth: clientOrderColumns[0].width, ...stickyCellStyle('stt'), color: '#334155' }}>
      <Box component="span" sx={{ display: 'inline-block', fontWeight: 700, color: '#334155' }}>{row.stt}</Box>
    </TableCell>
    <TableCell align="center" sx={{ ...cellStyle, width: clientOrderColumns[1].width, minWidth: clientOrderColumns[1].width, maxWidth: clientOrderColumns[1].width, ...stickyCellStyle('article') }}>
      <Box component="span" sx={{ display: 'inline-block', fontWeight: 800, color: '#0f172a' }}>{row.article}</Box>
    </TableCell>
    <TableCell align="center" sx={{ ...cellStyle, width: clientOrderColumns[2].width, minWidth: clientOrderColumns[2].width, maxWidth: clientOrderColumns[2].width, ...stickyCellStyle('donHang') }}>
      <Box component="span" sx={{ display: 'inline-block', fontWeight: 700, color: '#0f172a' }}>{row.donHang}</Box>
    </TableCell>
    <TableCell align="center" sx={{ ...cellStyle, width: clientOrderColumns[3].width, minWidth: clientOrderColumns[3].width, maxWidth: clientOrderColumns[3].width, ...stickyCellStyle('product') }}>
      <Box component="span" sx={{ display: 'inline-block', fontWeight: 700, color: '#0f172a' }}>{row.product}</Box>
    </TableCell>
    <TableCell align="center" sx={{ ...cellStyle, width: clientOrderColumns[4].width, minWidth: clientOrderColumns[4].width, maxWidth: clientOrderColumns[4].width, color: '#DAA06D', fontWeight: 800 }}>{row.dot}</TableCell>
    <TableCell align="center" sx={{ ...cellStyle, width: clientOrderColumns[5].width, minWidth: clientOrderColumns[5].width, maxWidth: clientOrderColumns[5].width, color: '#DAA06D', fontWeight: 800 }}>{row.crd}</TableCell>
    <TableCell align="center" sx={{ ...cellStyle, width: clientOrderColumns[6].width, minWidth: clientOrderColumns[6].width, maxWidth: clientOrderColumns[6].width, color: '#DAA06D', fontWeight: 800 }}>{row.ngayXH}</TableCell>
    <TableCell align="center" sx={{ ...cellStyle, width: clientOrderColumns[7].width, minWidth: clientOrderColumns[7].width, maxWidth: clientOrderColumns[7].width, color: '#DAA06D', fontWeight: 800 }}>{row.ngayNH}</TableCell>
    {sizes.map((size) => {
      const value = row.sizeValues[size];
      const isEmpty = value === '' || value === null || Number(value) === 0;
      return (
        <TableCell
          key={size}
          align="center"
          sx={{
            ...cellStyle,
            minWidth: 42,
            width: 42,
            fontSize: '0.94rem',
            color: isEmpty ? '#cbd5e1' : '#334155',
            backgroundColor: isEmpty ? '#dbe4f0' : '#ffffff'
          }}
        >
          {isEmpty ? '' : value}
        </TableCell>
      );
    })}
  </TableRow>
);

const ClientOrdersTable = memo(function ClientOrdersTable({ rows }) {
  const groups = groupOrdersByClient(rows);
  const showGrouped = groups.length > 1;
  const stickyGroupWidth = clientOrderColumns.slice(0, 3).reduce((sum, column) => sum + column.width, 0);

  return (
    <ReportTableLayout
      stickyHeader
      containerSx={{ height: '100%', bgcolor: '#ffffff' }}
      sx={{
        width: 'max-content',
        minWidth: '100%',
        bgcolor: '#ffffff',
        '& th, & td': { px: 0.75, py: 0.5 },
        borderCollapse: 'separate'
      }}
    >
      <TableHead>
        <TableRow>
          {clientOrderColumns.map((column) => (
            <TableCell
              key={column.key}
              align="center"
              sx={{
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.98rem',
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
                whiteSpace: 'nowrap',
                fontFamily: 'Calibri, Arial, sans-serif',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0',
                ...(stickyColumnOffsets[column.key] !== undefined ? stickyCellStyle(column.key, true) : {})
              }}
            >
              {column.label}
            </TableCell>
          ))}
          {sizes.map((size) => (
            <TableCell
              key={size}
              align="center"
              sx={{
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.94rem',
                minWidth: 42,
                width: 42,
                maxWidth: 42,
                whiteSpace: 'nowrap',
                fontFamily: 'Calibri, Arial, sans-serif',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0'
              }}
            >
              {size}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
          {showGrouped
          ? groups.map((group) => (
            <React.Fragment key={group.client}>
              <TableRow>
                <TableCell
                  colSpan={3}
                  sx={{
                    ...groupRowCellSx,
                    position: 'sticky',
                    left: 0,
                    zIndex: 18,
                    width: `${stickyGroupWidth}px`,
                    minWidth: `${stickyGroupWidth}px`,
                    maxWidth: `${stickyGroupWidth}px`,
                    boxShadow: '2px 0 0 #dbeafe'
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', textAlign: 'center', width: '100%' }}>
                    {group.client}
                  </Typography>
                </TableCell>
                <TableCell colSpan={5 + sizes.length} sx={groupRowCellSx} />
              </TableRow>
              {group.rows.map((row) => renderOrderRow(row))}
            </React.Fragment>
          ))
          : rows.map((row) => renderOrderRow(row))}
      </TableBody>
    </ReportTableLayout>
  );
});

export default ClientOrdersTable;
