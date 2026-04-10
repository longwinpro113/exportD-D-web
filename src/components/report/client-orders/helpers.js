import { sizeToCol, sizes } from '../shared';

export const DEFAULT_CLIENT_NAME = 'Lạc Tỷ';

export const clientOrderColumns = [
  { key: 'stt', label: 'STT', width: 56 },
  { key: 'article', label: 'Article', width: 92 },
  { key: 'donHang', label: 'Đơn hàng', width: 120 },
  { key: 'product', label: 'Product', width: 120 },
  { key: 'dot', label: 'Đợt', width: 68 },
  { key: 'crd', label: 'CRD', width: 90 },
  { key: 'ngayXH', label: 'Ngày XH', width: 90 },
  { key: 'ngayNH', label: 'Ngày NH', width: 90 }
];

export const stickyColumnOffsets = {
  stt: 0,
  article: 56,
  donHang: 148,
  product: 268
};

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

export const mapOrdersToTableRows = (rawOrders) => {
  if (!Array.isArray(rawOrders)) return [];

  return rawOrders.map((item, index) => ({
    stt: index + 1,
    id: `${item.ry_number || 'order'}-${index}`,
    article: item.article || '-',
    donHang: item.ry_number || '-',
    product: item.product || '-',
    dot: item.delivery_round || '-',
    crd: formatDate(item.CRD),
    ngayXH: formatDate(item.client_export_date),
    ngayNH: formatDate(item.client_import_date),
    client: item.client || '',
    sizeValues: sizes.reduce((acc, sizeLabel) => {
      acc[sizeLabel] = item[sizeToCol(sizeLabel)] ?? '';
      return acc;
    }, {})
  }));
};

export const groupOrdersByClient = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const grouped = new Map();

  rows.forEach((row) => {
    const clientName = row.client || 'Không có khách hàng';
    if (!grouped.has(clientName)) {
      grouped.set(clientName, []);
    }
    grouped.get(clientName).push(row);
  });

  return Array.from(grouped.entries()).map(([client, items]) => ({
    client,
    rows: items
  }));
};

export const filterClientOrderRows = (rows, query) => {
  const client = query.client || '';
  const search = (query.q || '').trim().toLowerCase();

  return rows.filter((item) => {
    if (client && item.client !== client) return false;
    if (search && !item.donHang.toLowerCase().includes(search)) return false;
    return true;
  });
};

export const getOrderOptions = (rows, client) => {
  const source = client ? rows.filter((item) => item.client === client) : rows;
  return [...new Set(source.map((item) => item.donHang).filter(Boolean))];
};
