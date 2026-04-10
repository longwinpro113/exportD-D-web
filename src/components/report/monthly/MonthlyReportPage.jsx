import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, Box, Button, Snackbar, Paper } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import dayjs from 'dayjs';
import useFetchList from '../../../hooks/useFetchList';
import useQuery from '../../../hooks/useQuery';
import useSharedReportClient from '../../../hooks/useSharedReportClient';
import MonthlyReportHeader from './MonthlyReportHeader';
import DailyReportTable from '../DailyReportTable'; // Use the same table if it fits
import { groupByDate } from '../stock/helpers';
import { exportStockReportPdf } from '../../../utils/pdfExport';
import { buildApiUrl } from '../../../config/api';
import { reportPageSx, reportPaperSx } from '../shared';

function MonthlyReportPage() {
  const [sharedClient, setSharedClient] = useSharedReportClient();
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [ryNumber, setRyNumber] = useState('');

  
  const dateRange = useMemo(() => {
    if (!selectedMonth) return { from: null, to: null };
    const from = selectedMonth.date(26);
    const to = selectedMonth.add(1, 'month').date(25);
    return {
      from: from.format('YYYY-MM-DD'),
      to: to.format('YYYY-MM-DD')
    };
  }, [selectedMonth]);

  const [query, updateQuery] = useQuery({ 
    client: sharedClient,
    from: dateRange.from,
    to: dateRange.to,
    ry_number: ryNumber
  });

  const [data, loading, , refetch] = useFetchList('/api/daily', query);
  const [clients] = useFetchList('/api/orders/clients', {});
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Sync state to query
  useEffect(() => {
    updateQuery({ 
      from: dateRange.from, 
      to: dateRange.to,
      ry_number: ryNumber,
      client: sharedClient
    });
  }, [dateRange, ryNumber, sharedClient, updateQuery]);

  // Fetch max month whenever the selected client changes
  useEffect(() => {
    const fetchMaxMonth = async () => {
      try {
        const url = sharedClient 
          ? `/api/daily/max-month?client=${encodeURIComponent(sharedClient)}` 
          : '/api/daily/max-month';
          
        const res = await fetch(buildApiUrl(url));
        if (res.ok) {
          const result = await res.json();
          if (result.max_date) {
            const dateObj = dayjs(result.max_date);
            if (dateObj.date() >= 26) {
              setSelectedMonth(dateObj);
            } else {
              setSelectedMonth(dateObj.subtract(1, 'month'));
            }
          } else if (result.max_month) {
            setSelectedMonth(dayjs(result.max_month));
          }
        }
      } catch (err) {
        console.error('Failed to fetch max month:', err);
      }
    };
    fetchMaxMonth();
  }, [sharedClient]);

  const tableData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (data.length === 0) return [];
    
    return [{
      date: selectedMonth.format('MM/YYYY'),
      rows: data
    }];
  }, [data, selectedMonth]);
  const selectedClientObj = useMemo(
    () => (Array.isArray(clients) ? clients.find((item) => item.client === (query.client || sharedClient)) || null : null),
    [clients, query.client, sharedClient]
  );

  const handleExportPdf = useCallback(() => {
    if (tableData.length === 0) {
      setToast({ open: true, message: 'Không có dữ liệu để xuất PDF.', severity: 'warning' });
      return;
    }
    const allRows = tableData.flatMap(group => group.rows);
    const fullRangeLabel = `${dayjs(dateRange.from).format('DD/MM/YYYY')} - ${dayjs(dateRange.to).format('DD/MM/YYYY')}`;
    const reportData = { date: fullRangeLabel, rows: allRows };

    import('../shared').then(({ sizes }) => {
      exportStockReportPdf(reportData, sizes, "BÁO CÁO CÔNG NỢ");
    });
  }, [tableData, dateRange]);

  const toastSx = (severity) => ({
    borderRadius: '12px',
    px: 1.5, py: 1, alignItems: 'center',
    backgroundColor: severity === 'success' ? '#ecfdf5' : '#fef2f2',
    color: severity === 'success' ? '#166534' : '#991b1b',
    border: `1px solid ${severity === 'success' ? '#bbf7d0' : '#fecaca'}`,
    '& .MuiAlert-icon': { color: severity === 'success' ? '#22c55e' : '#ef4444' }
  });

  return (
    <Box sx={reportPageSx}>
      <Paper elevation={0} sx={reportPaperSx}>
        <MonthlyReportHeader
          title="BÁO CÁO CÔNG NỢ"
          receiver={selectedClientObj ? selectedClientObj.client : '-'}
          clients={clients}
          selectedClient={selectedClientObj}
          onClientChange={(newClient) => {
            const nextClient = newClient ? newClient.client : '';
            setSharedClient(nextClient);
          }}
          ryNumber={ryNumber}
          onRyNumberChange={setRyNumber}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          fromDate={dateRange.from}
          toDate={dateRange.to}
          loading={loading}
        />

        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <DailyReportTable
            loading={loading}
            tableData={tableData}
            onEdit={() => {}} 
            onDelete={() => {}}
            hidePrint={false}
            showActions={false}
            onPrintGroup={() => handleExportPdf()}
          />
        </Box>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="standard" sx={toastSx(toast.severity)}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default React.memo(MonthlyReportPage);
