import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Snackbar, Checkbox, FormControlLabel } from '@mui/material';
import useFetchList from '../../hooks/useFetchList';
import useQuery from '../../hooks/useQuery';
import useSharedReportClient from '../../hooks/useSharedReportClient';
import ReportPageLayout from './ReportPageLayout';
import { buildApiUrl } from '../../config/api';
import DeleteDialog from './stock/DeleteDialog';
import EditDialog from './stock/EditDialog';
import { groupByDate } from './stock/helpers';
import DailyReportTable from './DailyReportTable';

function DailyReportPage() {
  const [sharedClient, setSharedClient] = useSharedReportClient();
  const [query, updateQuery] = useQuery({ q: '', client: sharedClient });
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [showAll, setShowAll] = useState(false);
  const [searchResetToken, setSearchResetToken] = useState(0);
  const [dateOptions, setDateOptions] = useState([]);

  const [clients] = useFetchList('/api/orders/clients', {});

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const clientQuery = query.client || sharedClient;
        if (!clientQuery) return;
        const res = await fetch(buildApiUrl(`/api/daily/dates?client=${encodeURIComponent(clientQuery)}`));
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
    if (showAll) {
      return { ...query, q: '' };
    }
    return query;
  }, [showAll, query]);

  const [data, loading, , refetch] = useFetchList('/api/daily', actualQuery);

  const tableData = useMemo(() => {
    if (!showAll && !query.q) return [];
    return Array.isArray(data) ? groupByDate(data) : [];
  }, [data, showAll, query.q]);
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
        title="BIỂU GIAO THÀNH PHẨM"
        receiver={selectedClient ? selectedClient.client : '-'}
        searchPlaceholder="Nhập ngày (dd/mm)"
        onSearch={(text) => {
          updateQuery({ q: text });
          if (text) {
            setShowAll(false);
          }
        }}
        loading={loading}
        clients={clients}
        selectedClient={selectedClient}
        onClientChange={(newClient) => {
          const nextClient = newClient ? newClient.client : '';
          setSharedClient(nextClient);
          updateQuery({ client: nextClient });
        }}
        searchResetToken={searchResetToken}
        searchMode="date"
        dateOptions={dateOptions}
        rightSideContent={
          <FormControlLabel
            control={
              <Checkbox
                checked={showAll}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setShowAll(checked);
                  if (checked) {
                    updateQuery({ q: '' });
                    setSearchResetToken(Date.now());
                  }
                }}
                size="small"
                sx={{
                  color: '#94a3b8',
                  '&.Mui-checked': {
                    color: '#1976d2',
                  },
                }}
              />
            }
            label="Hiển thị tất cả"
            sx={{
              mr: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#475569',
              },
            }}
          />
        }
      >
        <DailyReportTable
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

export default React.memo(DailyReportPage);
