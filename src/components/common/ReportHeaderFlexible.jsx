import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const ReportHeaderFlexible = React.memo(({
  title,
  sender,
  receiver,
  onSearch,
  loading,
  clients = [],
  selectedClient = null,
  onClientChange,
  orderOptions = [],
  dateOptions = [],
  searchMode = 'order',
  searchPlaceholder = 'Nhập mã đơn hàng ...',
  rightSideContent = null,
  searchResetToken = 0
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const getClientLabel = (option) => option?.client || '';
  const isDateSearch = searchMode === 'date';
  const normalizedSearch = useMemo(() => localSearch.trim(), [localSearch]);

  useEffect(() => {
    setLocalSearch('');
  }, [searchResetToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(normalizedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [normalizedSearch, onSearch]);

  const handleDateInputChange = (event) => {
    const cleaned = event.target.value
      .replace(/[^\d/]/g, '')
      .replace(/\/{2,}/g, '/')
      .slice(0, 5);

    setLocalSearch(cleaned);
  };

  const renderSearchInput = () => {
    if (isDateSearch) {
      if (dateOptions.length > 0) {
        return (
          <Autocomplete
            size="small"
            freeSolo
            disableClearable
            options={dateOptions}
            value={localSearch}
            inputValue={localSearch}
            onInputChange={(e, newValue) => {
              // Apply date-specific cleaning even in autocomplete input
              const cleaned = newValue
                .replace(/[^\d/]/g, '')
                .replace(/\/{2,}/g, '/')
                .slice(0, 5);
              setLocalSearch(cleaned);
            }}
            onChange={(e, newValue) => {
              setLocalSearch(newValue || '');
            }}
            ListboxProps={{
              style: {
                maxHeight: 200,
                overflowY: 'auto'
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={searchPlaceholder}
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
        );
      }

      return (
        <TextField
          size="small"
          value={localSearch}
          onChange={handleDateInputChange}
          placeholder={searchPlaceholder}
          variant="outlined"
          autoComplete="off"
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9/]*',
            maxLength: 5
          }}
          InputProps={{
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
              </>
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
      );
    }

    return (
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
            maxHeight: 200,
            overflowY: 'auto'
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={searchPlaceholder}
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
    );
  };

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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '220px 250px 1fr' },
          gap: 2,
          alignItems: 'center',
          mt: 1
        }}
      >
        {clients.length > 0 && (
          <Autocomplete
            size="small"
            disableClearable
            options={clients}
            getOptionLabel={getClientLabel}
            isOptionEqualToValue={(option, value) => getClientLabel(option) === getClientLabel(value)}
            value={selectedClient || null}
            onChange={(e, newVal) => {
              if (newVal) onClientChange(newVal);
            }}
            ListboxProps={{
              style: {
                maxHeight: 200,
                overflowY: 'auto'
              }
            }}
            renderOption={(props, option) => (
              <li {...props}>{getClientLabel(option)}</li>
            )}
            renderInput={(params) => (
              <TextField {...params} placeholder="Chọn khách hàng..." variant="outlined" />
            )}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#ffffff',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' }
              }
            }}
          />
        )}

        <Box sx={{ width: '100%' }}>
          {renderSearchInput()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, alignItems: 'center', width: '100%' }}>
          {rightSideContent}
        </Box>
      </Box>
    </Box>
  );
});

export default ReportHeaderFlexible;
