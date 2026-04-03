import React, { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PageHeader from './PageHeader';

const ReportHeader = React.memo(({ title, sender, receiver, placeholder, onSearch, loading }) => {
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
      <Box sx={{ width: '360px', mt: 1 }}>
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
  );
});

export default ReportHeader;
