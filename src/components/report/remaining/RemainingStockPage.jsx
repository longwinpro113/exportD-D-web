import React, { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import useFetchList from '../../../hooks/useFetchList';
import useQuery from '../../../hooks/useQuery';
import useSharedReportClient from '../../../hooks/useSharedReportClient';
import ReportPageLayout from '../ReportPageLayout';
import RemainingStockTable from './RemainingStockTable';

function RemainingStockPage() {
  const [sharedClient, setSharedClient] = useSharedReportClient();
  const [query, updateQuery] = useQuery({ q: '', client: sharedClient });
  const [data, loading] = useFetchList('/api/remaining-stock', query);
  const [clients] = useFetchList('/api/orders/clients', {});

  const trimmedSearch = (query.q || '').trim();
  const displayDate = useMemo(() => {
    const isDateSearch = trimmedSearch && /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(trimmedSearch);
    return isDateSearch ? trimmedSearch : dayjs().format('DD/MM/YYYY');
  }, [trimmedSearch]);

  const tableData = useMemo(
    () => [{ date: displayDate, rows: Array.isArray(data) ? data : [] }],
    [data, displayDate]
  );
  const selectedClient = useMemo(
    () => (Array.isArray(clients) ? clients.find((item) => item.client === (query.client || sharedClient)) || null : null),
    [clients, query.client, sharedClient]
  );

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
    <ReportPageLayout
      title="CHI TIẾT HÀNG CÒN NỢ"
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
      <RemainingStockTable tableData={tableData} />
    </ReportPageLayout>
  );
}

export default React.memo(RemainingStockPage);
