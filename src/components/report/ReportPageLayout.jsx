import React, { memo } from 'react';
import { Box, Paper } from '@mui/material';
import ReportHeader from '../common/ReportHeaderFlexible';
import { reportPageSx, reportPaperSx } from './shared';

const ReportPageLayout = memo(function ReportPageLayout({
  title,
  receiver,
  searchPlaceholder = 'Nhập mã đơn hàng ...',
  onSearch,
  loading,
  clients,
  selectedClient,
  onClientChange,
  searchMode = 'order',
  rightSideContent = null,
  searchResetToken = 0,
  dateOptions = [],
  children
}) {
  return (
    <Box sx={reportPageSx}>
      <Paper elevation={0} sx={reportPaperSx}>
        <ReportHeader
          title={title}
          receiver={receiver}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          loading={loading}
          clients={clients}
          selectedClient={selectedClient}
          onClientChange={onClientChange}
          searchMode={searchMode}
          rightSideContent={rightSideContent}
          searchResetToken={searchResetToken}
          dateOptions={dateOptions}
        />

        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
});

export default ReportPageLayout;
