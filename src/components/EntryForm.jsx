import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Paper, Button, Typography,
    Autocomplete, CircularProgress, IconButton, InputAdornment,
    Alert, Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ClearIcon from '@mui/icons-material/Clear';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { exportOrder } from '../services/api';
import useFetchList from '../hooks/useFetchList';

const buildSizes = () => {
    const s = [];
    for (let i = 3; i <= 18; i += 0.5) s.push(i);
    return s;
};

const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;
const sizes = buildSizes();

const EntryForm = () => {
    const [formData, setFormData] = useState({
        ngayGiao: null,
        donHang: '',
        article: '',
        modelName: '',
        totalQuantity: '',
        ghiChu: '',
        sizeValues: {}
    });

    const [orderOptions, loadingOrders] = useFetchList('/api/orders', {});
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleOrderChange = (event, newValue) => {
        if (newValue && typeof newValue === 'object') {
            setFormData(prev => ({
                ...prev,
                donHang: newValue.ry_number || '',
                article: newValue.article || '',
                modelName: newValue.model_name || '',
                totalQuantity: newValue.total_order_qty || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, donHang: '', article: '', modelName: '', totalQuantity: '' }));
        }
    };

    const handleReset = () => {
        setFormData({ ngayGiao: null, donHang: '', article: '', modelName: '', totalQuantity: '', ghiChu: '', sizeValues: {} });
    };

    const handleSave = async () => {
        if (!formData.ngayGiao || !formData.donHang) {
            setSnackbar({ open: true, message: 'Vui lòng chọn ngày và đơn hàng.', severity: 'warning' });
            return;
        }

        setSaving(true);
        try {
            // 1. Chỉ gom dữ liệu size vào payload
            const sizePayload = {};
            sizes.forEach(size => {
                sizePayload[sizeToCol(size)] = parseFloat(formData.sizeValues[size]) || 0;
            });

            // 2. Format ngày cho đúng chuẩn YYYY-MM-DD
            const export_date = dayjs(formData.ngayGiao, 'DD/MM/YYYY').format('YYYY-MM-DD');

            // 3. Tạo Payload tối giản (DB sẽ tự lo accumulated và remaining)
            const payload = {
                export_date,
                ry_number: formData.donHang,
                note: formData.ghiChu || null,
                ...sizePayload
            };

            console.log("Payload: ", payload)

            await exportOrder(payload);

            setSnackbar({ open: true, message: 'Lưu thành công.', severity: 'success' });
            handleReset();
        } catch (err) {
            let errorMsg = err.message;
            if (err.message === 'Failed to fetch') {
                errorMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra API URL hoặc mạng.';
            }
            console.error('Save error details:', err);
            setSnackbar({ open: true, message: `Lưu thất bại: ${errorMsg}`, severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Tính toán tạm thời để hiển thị Chip trên UI
    const shippedPreview = Object.values(formData.sizeValues)
        .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

    // Style cho các ô Input
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: '#ffffff',
            fontWeight: 600,
            color: '#000000',
            '& fieldset': { borderColor: '#000000' },
            '&:hover fieldset': { borderColor: '#334155' },
            '&.Mui-focused fieldset': { borderColor: '#000000', borderWidth: '2px' },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#000000' }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100%', overflow: 'auto' }}>
            <Paper elevation={0} sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                width: '100%',
                minHeight: 'fit-content'
            }}>
                {/* Header Row: Date & Order Info */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(5, 1fr)' },
                    gap: { xs: 2, md: 2 },
                    width: '100%',
                    mb: 1
                }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Ngày giao hàng"
                            format="DD/MM/YYYY"
                            value={formData.ngayGiao ? dayjs(formData.ngayGiao, 'DD/MM/YYYY') : null}
                            onChange={(newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    ngayGiao: newValue ? newValue.format('DD/MM/YYYY') : ''
                                }));
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    sx: inputSx
                                }
                            }}
                        />
                    </LocalizationProvider>

                    <Autocomplete
                        disablePortal
                        options={orderOptions}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.ry_number || ''}
                        loading={loadingOrders}
                        value={formData.donHang ? (orderOptions.find(o => o.ry_number === formData.donHang) || formData.donHang) : null}
                        onChange={handleOrderChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Đơn Hàng"
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingOrders ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: '#ffffff',
                                fontWeight: 600,
                                '& fieldset': { borderColor: '#000000' },
                                '&.Mui-focused fieldset': { borderColor: '#000000', borderWidth: '2px' },
                            }
                        }}
                    />

                    <TextField fullWidth label="Article" disabled value={formData.article}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#f8fafc', fontWeight: 600, '-webkit-text-fill-color': '#0f172a' } }}
                    />

                    <TextField fullWidth label="Model Name" disabled value={formData.modelName}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#f8fafc', fontWeight: 600, '-webkit-text-fill-color': '#0f172a' } }}
                    />

                    <TextField fullWidth label="Ghi Chú" value={formData.ghiChu}
                        onChange={(e) => setFormData(prev => ({ ...prev, ghiChu: e.target.value }))}
                        sx={inputSx}
                    />
                </Box>

                {/* Size Input Grid */}
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, minHeight: 40 }}>
                        <Typography sx={{ fontWeight: 500, color: '#1e293b' }}>Nhập số lượng size</Typography>
                        {shippedPreview > 0 && (
                            <Box sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1976d2', bgcolor: '#e3f2fd', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                SL giao hôm nay: {shippedPreview}
                            </Box>
                        )}
                    </Box>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(auto-fill, minmax(70px, 1fr))', sm: 'repeat(auto-fill, minmax(80px, 1fr))' },
                        gap: '16px 60px',
                    }}>
                        {sizes.map((size) => (
                            <Box key={size} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '0.9rem' }}>{size}</Typography>
                                <TextField
                                    fullWidth size="small" autoComplete="off"
                                    value={formData.sizeValues[size] || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (!isNaN(val)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                sizeValues: { ...prev.sizeValues, [size]: val }
                                            }));
                                        }
                                    }}
                                    inputProps={{ style: { textAlign: 'center', fontWeight: 500 } }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            bgcolor: (formData.sizeValues[size] && formData.sizeValues[size] !== '0') ? '#ffffff' : '#e2e8f0'
                                        }
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Footer Actions */}
                <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                        disabled={saving}
                        onClick={handleSave}
                        sx={{ textTransform: 'none', borderRadius: '8px', px: 4, py: 1.2, fontWeight: 500 }}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu báo cáo'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        startIcon={<RestartAltIcon />}
                        sx={{ textTransform: 'none', borderRadius: '8px', px: 3, py: 1.2, fontWeight: 500, color: '#334155' }}
                    >
                        Làm mới
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: '8px' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default EntryForm;