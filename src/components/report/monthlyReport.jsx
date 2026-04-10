import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useFetchList from '../../hooks/useFetchList';
import useQuery from '../../hooks/useQuery';
import useSharedReportClient from '../../hooks/useSharedReportClient';
import DailyReportTable from './DailyReportTable';
import { groupByDate } from './stock/helpers';
import { reportPageSx, reportPaperSx } from './shared';

const pad2 = (value) => String(value).padStart(2, '0');

const formatDisplayDate = (date) => `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
const formatIsoDate = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const buildMonthRange = (monthInput) => {
  const now = new Date();
  const parsedMonth = Number.parseInt(monthInput, 10);
  const month = Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : now.getMonth() + 1;
  const year = now.getFullYear();
  const fromDate = new Date(year, month - 1, 26);
  const toDate = new Date(year, month, 25);

  return {
    month: String(month),
    from: formatIsoDate(fromDate),
    to: formatIsoDate(toDate),
    fromLabel: formatDisplayDate(fromDate),
    toLabel: formatDisplayDate(toDate)
  };
};

function MonthlyReportPage() {
  const [sharedClient, setSharedClient] = useSharedReportClient();
  const currentMonth = String(new Date().getMonth() + 1);
  const [monthInput, setMonthInput] = useState(currentMonth);
  const monthRange = useMemo(() => buildMonthRange(monthInput), [monthInput]);
  const [query, updateQuery] = useQuery({
    q: '',
    client: sharedClient,
    from: monthRange.from,
    to: monthRange.to
  });

  const [data, loading] = useFetchList('/api/daily', query);
  const [clients] = useFetchList('/api/orders/clients', {});

  const tableData = useMemo(() => (Array.isArray(data) ? groupByDate(data) : []), [data]);
  const selectedClient = useMemo(
    () => (Array.isArray(clients) ? clients.find((item) => item.client === (query.client || sharedClient)) || null : null),
    [clients, query.client, sharedClient]
  );

  useEffect(() => {
    updateQuery({ from: monthRange.from, to: monthRange.to });
  }, [monthRange.from, monthRange.to, updateQuery]);

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
    <Box sx={{ ...reportPageSx, fontFamily: 'Calibri, Arial, sans-serif' }}>
      <Paper elevation={0} sx={{ ...reportPaperSx, fontFamily: 'Calibri, Arial, sans-serif' }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: '1 1 auto' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
                BÁO CÁO CÔNG NỢ
              </Typography>
              <TextField
                label="Tháng"
                type="text"
                size="small"
                value={monthInput}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
                  if (!digits) {
                    setMonthInput('');
                    return;
                  }
                  const nextMonth = Math.max(1, Math.min(12, Number(digits)));
                  setMonthInput(String(nextMonth));
                }}
                onBlur={() => {
                  if (!monthInput) {
                    setMonthInput(currentMonth);
                  }
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 2 }}
                sx={{
                  width: 110,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#ffffff',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                  }
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'right', minWidth: 160 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Đơn vị lãnh</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
                {selectedClient ? selectedClient.client : '-'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ px: 2.5, pt: 1.75, pb: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr 200px 200px' }, gap: 2, alignItems: 'center' }}>
            <Autocomplete
              size="small"
              disableClearable
              options={clients}
              getOptionLabel={(option) => option.client || ''}
              isOptionEqualToValue={(option, value) => option.client === value?.client}
              value={selectedClient || clients[0] || null}
              onChange={(e, newVal) => {
                if (newVal) {
                  const nextClient = newVal.client || '';
                  setSharedClient(nextClient);
                  updateQuery({ client: nextClient });
                }
              }}
              ListboxProps={{ style: { maxHeight: 280, overflowY: 'auto' } }}
              renderInput={(params) => <TextField {...params} placeholder="Chọn khách hàng..." variant="outlined" />}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />

            <TextField
              size="small"
              value={query.q || ''}
              onChange={(e) => updateQuery({ q: e.target.value })}
              placeholder="Nhập mã đơn hàng ..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
              }}
            />

            <TextField
              label="Từ ngày"
              size="small"
              value={monthRange.fromLabel}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' }
                }
              }}
            />

            <TextField
              label="Đến ngày"
              size="small"
              value={monthRange.toLabel}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' }
                }
              }}
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DailyReportTable
            loading={loading}
            tableData={tableData}
            showActions={false}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default React.memo(MonthlyReportPage);
