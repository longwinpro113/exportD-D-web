import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, InputAdornment, 
  CircularProgress, IconButton 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Sử dụng React.memo để tránh render lại bảng khi chỉ gõ input
const RemainingHeader = React.memo(({ onSearch, loading }) => {
  const [localSearch, setLocalSearch] = useState('');

  // Xử lý Debounce: Giảm tải cho CPU và tránh delay khi gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  return (
    <Box sx={{ p: 2.5, pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            CHI TIẾT HÀNG CÒN NỢ (REMAINING STOCK)
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.4, fontWeight: 500 }}>
            Đơn vị chuyển: DD (Long An)
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Đơn vị lãnh</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>Công Ty Lạc Tỷ</Typography>
        </Box>
      </Box>

      <Box sx={{ width: '360px', mt: 1 }}>
        <TextField
          placeholder="Tìm ngày (dd/mm), mã đơn hàng hoặc đợt..."
          variant="outlined"
          size="small"
          fullWidth
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
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
                ) : localSearch && (
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

export default RemainingHeader;