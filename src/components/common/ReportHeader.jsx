import React, { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PageHeader from './PageHeader';
import { Autocomplete } from '@mui/material';

const ReportHeader = React.memo(({ title, sender, receiver, placeholder, onSearch, loading, clients = [], selectedClient = null, onClientChange }) => {
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localSearch);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  return (
    <Box sx={{ p: 2.5, pb: 2 }}>
      <PageHeader title={title} sender={sender} receiver={receiver} />
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
        {clients.length > 0 && (
          <Autocomplete
            size="small"
            options={clients}
            getOptionLabel={(option) => option.client || ''}
            value={selectedClient}
            onChange={(e, newVal) => onClientChange(newVal)}
            renderInput={(params) => (
              <TextField {...params} placeholder="Chọn khách hàng..." variant="outlined" />
            )}
            sx={{
              width: '240px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#ffffff',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' }
              }
            }}
          />
        )}

        <Box sx={{ width: '360px' }}>
          <TextField
            placeholder={placeholder || "Tìm kiếm..."}
            variant="outlined"
            size="small"
            fullWidth
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {loading ? (
                    <CircularProgress size={16} sx={{ color: '#94a3b8', mr: 1 }} />
                  ) : !!localSearch && (
                    <IconButton size="small" onClick={() => setLocalSearch('')}>
                      <ClearIcon sx={{ fontSize: '1.1rem', color: '#94a3b8' }} />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
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
        </Box>
      </Box>
    </Box>
  );
});

export default ReportHeader;
