import React, { memo } from 'react';
import { Box, Paper } from '@mui/material';
import ReportHeader from '../common/ReportHeader';
import { reportPageSx, reportPaperSx } from './shared';

const ReportPageLayout = memo(function ReportPageLayout({
  title,
  receiver,
  placeholder = 'Tìm ngày (dd/mm), mã đơn hàng hoặc đợt...',
  onSearch,
  loading,
  clients,
  selectedClient,
  onClientChange,
  children
}) {
  return (
    <Box sx={reportPageSx}>
      <Paper elevation={0} sx={reportPaperSx}>
        <ReportHeader
          title={title}
          receiver={receiver}
          placeholder={placeholder}
          onSearch={onSearch}
          loading={loading}
          clients={clients}
          selectedClient={selectedClient}
          onClientChange={onClientChange}
        />

        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
});

export default ReportPageLayout;
