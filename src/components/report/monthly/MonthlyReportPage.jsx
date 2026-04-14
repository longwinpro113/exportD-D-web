import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, Box, Snackbar, Paper } from '@mui/material';
import dayjs from 'dayjs';
import useFetchList from '../../../hooks/useFetchList';
import useQuery from '../../../hooks/useQuery';
import useSharedReportClient from '../../../hooks/useSharedReportClient';
import MonthlyReportHeader from './MonthlyReportHeader';
import MonthlyReportTable from './MonthlyReportTable';
import { exportMonthlyReportPdf } from '../../../utils/reportPdfVi';
import { buildApiUrl } from '../../../config/api';
import { reportPageSx, reportPaperSx } from '../shared';

function MonthlyReportPage() {
  const [sharedClient, setSharedClient] = useSharedReportClient();
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const dateRange = useMemo(() => {
    if (!selectedMonth) return { from: null, to: null };
    const from = selectedMonth.date(26);
    const to = selectedMonth.add(1, 'month').date(25);
    return {
      from: from.format('YYYY-MM-DD'),
      to: to.format('YYYY-MM-DD')
    };
  }, [selectedMonth]);

  const closingDateLabel = useMemo(() => {
    if (!dateRange.to) return '';
    return dayjs(dateRange.to).format('DD/MM/YYYY');
  }, [dateRange.to]);

  const [query, updateQuery] = useQuery({
    client: sharedClient,
    q: closingDateLabel
  });

  const [data, loading] = useFetchList('/api/remaining-stock', query);
  const [clients] = useFetchList('/api/orders/clients', {});
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [projectedByRyNumber, setProjectedByRyNumber] = useState({});
  const [baselineByRyNumber, setBaselineByRyNumber] = useState({});
  const [editedProjectedByRyNumber, setEditedProjectedByRyNumber] = useState({});
  const storageKey = useMemo(() => {
    if (!sharedClient) return '';
    return `monthly-report-draft:${sharedClient}`;
  }, [sharedClient]);

  useEffect(() => {
    updateQuery({
      client: sharedClient,
      q: closingDateLabel
    });
  }, [closingDateLabel, sharedClient, updateQuery]);

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
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) return [];

    return [{
      date: selectedMonth.format('MM/YYYY'),
      rows
    }];
  }, [data, selectedMonth]);

  useEffect(() => {
    if (tableData.length === 0) {
      setProjectedByRyNumber({});
      setBaselineByRyNumber({});
      setEditedProjectedByRyNumber({});
      return;
    }

    const baseProjected = {};

    tableData.forEach((group) => {
      group.rows.forEach((row) => {
        if (!row?.ry_number) return;
        baseProjected[row.ry_number] = Number(row.accumulated_total) || 0;
      });
    });

    if (!storageKey) {
      setProjectedByRyNumber(baseProjected);
      setBaselineByRyNumber(baseProjected);
      setEditedProjectedByRyNumber({});
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      setBaselineByRyNumber(baseProjected);
      if (!raw) {
        setProjectedByRyNumber(baseProjected);
        setEditedProjectedByRyNumber({});
        return;
      }

      const saved = JSON.parse(raw);
      const savedMonthChanges = saved?.months?.[closingDateLabel] || {};
      setProjectedByRyNumber({
        ...baseProjected,
        ...savedMonthChanges
      });
      setEditedProjectedByRyNumber(Object.fromEntries(
        Object.keys(savedMonthChanges).map((ryNumber) => [ryNumber, true])
      ));
    } catch (err) {
      console.warn('Failed to restore monthly draft:', err);
      setProjectedByRyNumber(baseProjected);
      setEditedProjectedByRyNumber({});
    }
  }, [closingDateLabel, storageKey, tableData]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const changedValues = Object.fromEntries(
        Object.entries(projectedByRyNumber)
          .filter(([ryNumber]) => editedProjectedByRyNumber[ryNumber])
          .map(([ryNumber, value]) => [ryNumber, value])
      );

      const existing = (() => {
        try {
          return JSON.parse(localStorage.getItem(storageKey) || '{}');
        } catch (err) {
          return {};
        }
      })();

      const next = {
        ...existing,
        months: {
          ...(existing.months || {}),
          [closingDateLabel]: changedValues
        }
      };

      if (Object.keys(changedValues).length === 0) {
        if (next.months) {
          delete next.months[closingDateLabel];
        }
        if (next.months && Object.keys(next.months).length === 0) {
          delete next.months;
        }
      }

      if (Object.keys(next).length === 0) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(next));
      }
    } catch (err) {
      console.warn('Failed to save monthly draft:', err);
    }
  }, [closingDateLabel, editedProjectedByRyNumber, projectedByRyNumber, storageKey]);

  const pdfTableData = useMemo(() => {
    return tableData.map((group) => ({
      ...group,
      rows: group.rows.map((row) => {
        const actualAccumulated = Number(row.accumulated_total) || 0;
        const projectedAccumulated = projectedByRyNumber[row.ry_number] !== undefined
          ? Number(projectedByRyNumber[row.ry_number]) || 0
          : actualAccumulated;
        const totalQuantity = Number(row.total_quantity) || 0;

        return {
          ...row,
          pdf_shipped_total: projectedAccumulated,
          pdf_remaining_quantity: Math.max(totalQuantity - projectedAccumulated, 0)
        };
      })
    }));
  }, [projectedByRyNumber, tableData]);

  const selectedClientObj = useMemo(
    () => (Array.isArray(clients) ? clients.find((item) => item.client === (query.client || sharedClient)) || null : null),
    [clients, query.client, sharedClient]
  );

  const handleExportPdf = useCallback((group) => {
    if (!group || !Array.isArray(group.rows) || group.rows.length === 0) {
      setToast({ open: true, message: 'Không có dữ liệu để xuất PDF.', severity: 'warning' });
      return;
    }

    const fullRangeLabel = `${dayjs(dateRange.from).format('DD/MM/YYYY')} - ${dayjs(dateRange.to).format('DD/MM/YYYY')}`;
    const reportData = { ...group, date: fullRangeLabel };

    import('../shared').then(({ sizes }) => {
      exportMonthlyReportPdf(reportData, sizes, 'BÁO CÁO CÔNG NỢ', selectedClientObj ? selectedClientObj.client : '');
    });
  }, [dateRange, selectedClientObj]);

  const toastSx = (severity) => ({
    borderRadius: '12px',
    px: 1.5,
    py: 1,
    alignItems: 'center',
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
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          fromDate={dateRange.from}
          toDate={dateRange.to}
          loading={loading}
        />

        <Box sx={{ flex: 1, borderTop: '1px solid #e2e8f0', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <MonthlyReportTable
            loading={loading}
            tableData={pdfTableData}
            projectedByRyNumber={projectedByRyNumber}
            editedProjectedByRyNumber={editedProjectedByRyNumber}
            onProjectedChange={(ryNumber, value) => {
              setProjectedByRyNumber((prev) => ({
                ...prev,
                [ryNumber]: value
              }));
              setEditedProjectedByRyNumber((prev) => ({
                ...prev,
                [ryNumber]: true
              }));
            }}
            onProjectedRevert={(ryNumber) => {
              setProjectedByRyNumber((prev) => {
                return {
                  ...prev,
                  [ryNumber]: baselineByRyNumber[ryNumber] ?? prev[ryNumber]
                };
              });
              setEditedProjectedByRyNumber((prev) => ({
                ...prev,
                [ryNumber]: false
              }));
            }}
            onPrintGroup={handleExportPdf}
            clientName={selectedClientObj ? selectedClientObj.client : ''}
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
