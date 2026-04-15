import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Checkbox, FormControlLabel, Snackbar } from '@mui/material';
import useFetchList from '../../../hooks/useFetchList';
import useQuery from '../../../hooks/useQuery';
import useSharedReportClient from '../../../hooks/useSharedReportClient';
import ReportPageLayout from '../ReportPageLayout';
import { buildApiUrl } from '../../../config/api';
import DeleteDialog from './DeleteDialog';
import EditDialog from './EditDialog';
import { groupByDate } from './helpers';
import StockReportTable from './StockReportTable';

function HistoryExportPage() {
  const [sharedClient, setSharedClient] = useSharedReportClient();
  const [query, updateQuery] = useQuery({ date: '', client: sharedClient });
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [showAllExports, setShowAllExports] = useState(false);
  const [searchResetToken, setSearchResetToken] = useState(0);
  const [dateOptions, setDateOptions] = useState([]);

  const [clients] = useFetchList('/api/orders/clients', {});

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const clientQuery = query.client || sharedClient;
        if (!clientQuery) return;
        const res = await fetch(buildApiUrl(`/api/history-export/dates?client=${encodeURIComponent(clientQuery)}`));
        if (res.ok) {
          const result = await res.json();
          setDateOptions(result);
        }
      } catch (err) {
        console.error('Failed to fetch available dates:', err);
      }
    };
    fetchDates();
  }, [query.client, sharedClient]);

  const actualQuery = useMemo(() => {
    if (showAllExports) {
      return { ...query, date: '' };
    }
    return query;
  }, [showAllExports, query]);

  const [data, loading, , refetch] = useFetchList('/api/history-export', actualQuery);

  const tableData = useMemo(() => {
    if (!showAllExports && !query.date) return [];
    return Array.isArray(data) ? groupByDate(data) : [];
  }, [data, showAllExports, query.date]);
  const selectedClient = useMemo(
    () => (Array.isArray(clients) ? clients.find((item) => item.client === (query.client || sharedClient)) || null : null),
    [clients, query.client, sharedClient]
  );

  const toastSx = (severity) => ({
    borderRadius: '12px',
    px: 1.5,
    py: 1,
    alignItems: 'center',
    backgroundColor: severity === 'success' ? '#ecfdf5' : '#fef2f2',
    color: severity === 'success' ? '#166534' : '#991b1b',
    border: `1px solid ${severity === 'success' ? '#bbf7d0' : '#fecaca'}`,
    '& .MuiAlert-icon': {
      color: severity === 'success' ? '#22c55e' : '#ef4444'
    }
  });

  useEffect(() => {
    if (!Array.isArray(clients) || clients.length === 0) return;
    const nextClientName = query.client || sharedClient || clients[0].client || '';
    if (nextClientName !== query.client) {
      updateQuery({ client: nextClientName });
    }
    if (nextClientName !== sharedClient) {
      setSharedClient(nextClientName);
    }
  }, [clients, query.client, sharedClient, setSharedClient, updateQuery]);

  return (
    <>
      <ReportPageLayout
        title="Phiếu Xuất Kho"
        receiver={selectedClient ? selectedClient.client : '-'}
        searchPlaceholder="Nhập ngày (dd/mm)"
        onSearch={(text) => {
          updateQuery({ date: text });
          if (text && text.trim()) {
            setShowAllExports(false);
          }
        }}
        loading={loading}
        clients={clients}
        selectedClient={selectedClient}
        searchMode="date"
        rightSideContent={
          <FormControlLabel
            sx={{
              m: 0,
              justifyContent: 'flex-end',
              '& .MuiFormControlLabel-label': {
                fontSize: '0.78rem',
                lineHeight: 1.1,
                color: '#334155',
                fontWeight: 600
              }
            }}
            control={
              <Checkbox
                size="small"
                checked={showAllExports}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setShowAllExports(checked);
                  if (checked) {
                    updateQuery({ date: '' });
                    setSearchResetToken((prev) => prev + 1);
                  }
                }}
                sx={{ p: 0.5, mr: 0.5 }}
              />
            }
            label="Hiển thị toàn bộ phiếu xuất kho"
          />
        }
        searchResetToken={searchResetToken}
        onClientChange={(newClient) => {
          const nextClient = newClient ? newClient.client : '';
          setSharedClient(nextClient);
          updateQuery({ client: nextClient });
        }}
        dateOptions={dateOptions}
      >
        <StockReportTable
          loading={loading}
          tableData={tableData}
          onEdit={setEditRow}
          onDelete={setDeleteRow}
        />
      </ReportPageLayout>

      {editRow && (
        <EditDialog
          open={!!editRow}
          row={editRow}
          onClose={() => setEditRow(null)}
          onNotify={(payload) => setToast({ open: true, ...payload })}
          onSave={() => {
            setEditRow(null);
            refetch();
          }}
        />
      )}
      {deleteRow && (
        <DeleteDialog
          open={!!deleteRow}
          row={deleteRow}
          onClose={() => setDeleteRow(null)}
          onNotify={(payload) => setToast({ open: true, ...payload })}
          onConfirm={() => {
            setDeleteRow(null);
            refetch();
          }}
        />
      )}

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
    </>
  );
}

export default React.memo(HistoryExportPage);
