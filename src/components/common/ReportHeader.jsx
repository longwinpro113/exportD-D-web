import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const ReportHeader = React.memo(({
  title,
  sender,
  receiver,
  onSearch,
  loading,
  clients = [],
  selectedClient = null,
  onClientChange,
  orderOptions = []
}) => {
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  return (
    <Box sx={{ p: 2.5, pb: 2, fontFamily: 'Calibri, Arial, sans-serif' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: 'Calibri, Arial, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title || 'BIỂU GIAO THÀNH PHẨM'}
          </Typography>
          <Typography sx={{ fontFamily: 'Calibri, Arial, sans-serif', fontSize: '0.85rem', color: '#94a3b8', mt: 0.4, fontWeight: 500 }}>
            {sender || 'Đơn vị chuyển: DD (Long An)'}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontFamily: 'Calibri, Arial, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Đơn vị lãnh</Typography>
          <Typography sx={{ fontFamily: 'Calibri, Arial, sans-serif', fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
            {receiver || '-'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
        {clients.length > 0 && (
          <Autocomplete
            size="small"
            disableClearable
            options={clients}
            getOptionLabel={(option) => option.client || ''}
            isOptionEqualToValue={(option, value) => option.client === value?.client}
            value={selectedClient || clients[0] || null}
            onChange={(e, newVal) => {
              if (newVal) onClientChange(newVal);
            }}
            ListboxProps={{
              style: {
                maxHeight: 280,
                overflowY: 'auto'
              }
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Chọn khách hàng..." variant="outlined" />
            )}
            sx={{
              width: '220px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#ffffff',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' }
              }
            }}
          />
        )}

        <Box sx={{ width: '250px' }}>
          <Autocomplete
            size="small"
            freeSolo
            disableClearable
            options={orderOptions}
            value={localSearch}
            inputValue={localSearch}
            onInputChange={(e, newValue) => setLocalSearch(newValue || '')}
            onChange={(e, newValue) => setLocalSearch(newValue || '')}
            filterOptions={(options, state) =>
              options.filter((option) => option.toLowerCase().includes(state.inputValue.toLowerCase()))
            }
            ListboxProps={{
              style: {
                maxHeight: 300,
                overflowY: 'auto'
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Nhập mã đơn hàng ..."
                variant="outlined"
                autoComplete="off"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress size={16} sx={{ color: '#94a3b8', mr: 1 }} />
                      ) : localSearch.length > 0 ? (
                        <IconButton size="small" onClick={() => setLocalSearch('')}>
                          <ClearIcon sx={{ fontSize: '1.1rem', color: '#94a3b8' }} />
                        </IconButton>
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' }
                }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
});

export default ReportHeader;
