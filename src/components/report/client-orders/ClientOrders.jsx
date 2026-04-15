import React, { startTransition, useEffect, useMemo } from 'react';
import { Box, Paper } from '@mui/material';
import ReportHeader from '../../common/ReportHeaderNew';
import useFetchList from '../../../hooks/useFetchList';
import useQuery from '../../../hooks/useQuery';
import useSharedReportClient from '../../../hooks/useSharedReportClient';
import { reportPageSx } from '../shared';
import ClientOrdersTable from './ClientOrdersTable';
import {
  DEFAULT_CLIENT_NAME,
  filterClientOrderRows,
  getOrderOptions,
  mapOrdersToTableRows
} from './helpers';

function ClientOrders() {
  const [sharedClient, setSharedClient] = useSharedReportClient();
  const [query, updateQuery] = useQuery({ q: '', client: sharedClient || DEFAULT_CLIENT_NAME });
  const [rawOrders, loading] = useFetchList('/api/orders', {});
  const [clients] = useFetchList('/api/orders/clients', {});

  const tableData = useMemo(() => mapOrdersToTableRows(rawOrders), [rawOrders]);
  const filteredData = useMemo(() => filterClientOrderRows(tableData, query), [tableData, query]);
  const orderOptions = useMemo(() => getOrderOptions(tableData, query.client), [tableData, query.client]);
  const selectedClient = useMemo(() => {
    const currentClient = query.client || sharedClient || DEFAULT_CLIENT_NAME;
    return Array.isArray(clients)
      ? clients.find((item) => item.client === currentClient) || null
      : null;
  }, [clients, query.client, sharedClient]);

  useEffect(() => {
    if (!Array.isArray(clients) || clients.length === 0) return;

    const nextClient =
      clients.find((item) => item.client === sharedClient) ||
      clients.find((item) => item.client === query.client) ||
      clients.find((item) => item.client === DEFAULT_CLIENT_NAME) ||
      clients[0];

    if (!nextClient) return;

    if (sharedClient !== nextClient.client) {
      setSharedClient(nextClient.client);
    }

    if (query.client !== nextClient.client) {
      startTransition(() => {
        updateQuery({ client: nextClient.client });
      });
    }
  }, [clients, query.client, sharedClient, setSharedClient, updateQuery]);

  return (
    <Box sx={{ ...reportPageSx, fontFamily: 'Calibri, Arial, sans-serif' }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        <ReportHeader
          title="THEO DÕI ĐƠN HÀNG"
          sender="Danh sách chi tiết các đơn hàng theo khách hàng"
          receiver={selectedClient ? selectedClient.client : '-'}
          onSearch={(text) => updateQuery({ q: text })}
          loading={loading}
          clients={clients}
          selectedClient={selectedClient}
          onClientChange={(newClient) => {
            const nextClient = newClient ? newClient.client : '';
            setSharedClient(nextClient);
            startTransition(() => {
              updateQuery({ client: nextClient, q: '' });
            });
          }}
          orderOptions={orderOptions}
        />

        <Box
          sx={{
            flexGrow: 1,
            borderTop: '1px solid #e2e8f0',
            width: '100%',
            overflow: 'hidden',
            bgcolor: '#f8fafc',
            overscrollBehaviorX: 'contain',
            overscrollBehaviorY: 'contain'
          }}
        >
          <ClientOrdersTable rows={filteredData} />
        </Box>
      </Paper>
    </Box>
  );
}

export default ClientOrders;
