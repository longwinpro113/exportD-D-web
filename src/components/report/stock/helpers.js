export const formatVietnameseDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  });
};

export const toDateInputValue = (dateString) => {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  const parts = dateString.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const groupByDate = (rows) => {
  const map = new Map();
  rows.forEach((row) => {
    const date = row.export_date;
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(row);
  });
  return Array.from(map.entries()).map(([date, groupRows]) => ({ date, rows: groupRows }));
};

export const getStatus = (remaining) => {
  const rem = parseFloat(remaining) ?? null;
  if (rem !== null && rem <= 0) return { label: 'Ok', color: '#16a34a', bg: '#dcfce7' };
  return { label: 'Not Ok', color: '#dc2626', bg: '#fee2e2' };
};
