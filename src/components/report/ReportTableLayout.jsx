import React, { memo } from 'react';
import { Table, TableContainer } from '@mui/material';
import { commonTableContainerSx } from './shared';

const ReportTableLayout = memo(function ReportTableLayout({
  minWidth,
  sx,
  containerSx,
  stickyHeader = false,
  children
}) {
  return (
    <TableContainer sx={{ ...commonTableContainerSx, ...containerSx }}>
      <Table stickyHeader={stickyHeader} size="small" sx={{ minWidth, ...sx }}>
        {children}
      </Table>
    </TableContainer>
  );
});

export default ReportTableLayout;
