import React from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const StockHeader = React.memo(({ searchTerm, setSearchTerm }) => {
    return (
        <Box sx={{ p: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        BIỂU GIAO THÀNH PHẨM QUA CÔNG TY LẠC TỶ
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
                        Đơn vị chuyển: DD (Long An)
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Đơn vị lãnh</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>Công Ty Lạc Tỷ</Typography>
                </Box>
            </Box>

            <Box sx={{ width: '350px', mt: 1 }}>
                <TextField
                    placeholder="Tìm ngày (dd/mm) hoặc mã đơn hàng..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                                    <ClearIcon sx={{ fontSize: '1.1rem', color: '#94a3b8' }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        maxWidth: 400,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: '#ffffff',
                            '& fieldset': { borderColor: '#e2e8f0' },
                            '&:hover fieldset': { borderColor: '#cbd5e1' },
                            '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                            '& input:-webkit-autofill': {
                                // Sửa lỗi kebab-case từ ảnh console của bạn
                                WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                                WebkitTextFillColor: '#1e293b !important',
                            }
                        }
                    }}
                />
            </Box>
        </Box>
    );
});

export default StockHeader;