import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { Box, Paper } from '@mui/material';
import ReportHeader from '../../common/ReportHeader';
import useFetchList from '../../../hooks/useFetchList';
import useQuery from '../../../hooks/useQuery';
import { reportPageSx } from '../shared';
import ClientOrdersTable from './ClientOrdersTable';
import {
  DEFAULT_CLIENT_NAME,
  filterClientOrderRows,
  getOrderOptions,
  mapOrdersToTableRows
} from './helpers';

function ClientOrders() {
  const [query, updateQuery] = useQuery({ q: '', client: DEFAULT_CLIENT_NAME });
  const [rawOrders, loading] = useFetchList('/api/orders', {});
  const [clients] = useFetchList('/api/orders/clients', {});
  const [selectedClient, setSelectedClient] = useState(null);
  const [hasAppliedDefaultClient, setHasAppliedDefaultClient] = useState(false);

  const tableData = useMemo(() => mapOrdersToTableRows(rawOrders), [rawOrders]);
  const filteredData = useMemo(() => filterClientOrderRows(tableData, query), [tableData, query]);
  const orderOptions = useMemo(() => getOrderOptions(tableData, query.client), [tableData, query.client]);

  useEffect(() => {
    if (hasAppliedDefaultClient || !Array.isArray(clients) || clients.length === 0) return;
    const defaultClient = clients.find((item) => item.client === DEFAULT_CLIENT_NAME) || clients[0];
    if (defaultClient) {
      setSelectedClient(defaultClient);
      startTransition(() => {
        updateQuery({ client: defaultClient.client, q: '' });
      });
      setHasAppliedDefaultClient(true);
    }
  }, [clients, hasAppliedDefaultClient, updateQuery]);

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
            setSelectedClient(newClient);
            startTransition(() => {
              updateQuery({ client: newClient ? newClient.client : '', q: '' });
            });
            if (!newClient) {
              setHasAppliedDefaultClient(true);
            }
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
