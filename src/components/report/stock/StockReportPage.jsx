import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import useFetchList from '../../../hooks/useFetchList';
import useQuery from '../../../hooks/useQuery';
import useSharedReportClient from '../../../hooks/useSharedReportClient';
import ReportPageLayout from '../ReportPageLayout';
import DeleteDialog from './DeleteDialog';
import EditDialog from './EditDialog';
import { groupByDate } from './helpers';
import StockReportTable from './StockReportTable';

function StockReportPage() {
  const [sharedClient, setSharedClient] = useSharedReportClient();
  const [query, updateQuery] = useQuery({ q: '', client: sharedClient });
  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [data, loading, , refetch] = useFetchList('/api/export', query);
  const [clients] = useFetchList('/api/orders/clients', {});

  const tableData = useMemo(() => (Array.isArray(data) ? groupByDate(data) : []), [data]);
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
        placeholder="Tìm ngày (dd/mm), mã đơn hàng hoặc đợt..."
        onSearch={(text) => updateQuery({ q: text })}
        loading={loading}
        clients={clients}
        selectedClient={selectedClient}
        onClientChange={(newClient) => {
          const nextClient = newClient ? newClient.client : '';
          setSharedClient(nextClient);
          updateQuery({ client: nextClient });
        }}
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

export default React.memo(StockReportPage);
