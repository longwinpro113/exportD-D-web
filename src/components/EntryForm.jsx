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
        sizeValues: {}
    });

    const [orderOptions, setOrderOptions] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchOrders = async () => {
            setLoadingOrders(true);
            try {
                const res = await fetch('http://localhost:5000/api/orders');
                const data = await res.json();
                if (Array.isArray(data)) setOrderOptions(data);
            } catch (err) {
                console.error('Failed to load orders:', err.message);
            } finally {
                setLoadingOrders(false);
            }
        };
        fetchOrders();
    }, []);

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
        setFormData({ ngayGiao: null, donHang: '', article: '', modelName: '', totalQuantity: '', sizeValues: {} });
    };

    const handleSave = async () => {
        if (!formData.ngayGiao || !formData.donHang) {
            setSnackbar({ open: true, message: 'Please select a date and order.', severity: 'warning' });
            return;
        }

        setSaving(true);
        try {
            const shipped_quantity = Object.values(formData.sizeValues)
                .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

            const prevRes = await fetch(`http://localhost:5000/api/export?ry_number=${encodeURIComponent(formData.donHang)}`);
            const prevData = await prevRes.json();

            const prevTotal = Array.isArray(prevData)
                ? prevData.reduce((sum, row) => sum + (parseFloat(row.shipped_quantity) || 0), 0)
                : 0;
            const accumulated_total = prevTotal + shipped_quantity;
            const remaining_quantity = (parseFloat(formData.totalQuantity) || 0) - accumulated_total;

            const sizePayload = {};
            sizes.forEach(size => {
                sizePayload[sizeToCol(size)] = parseFloat(formData.sizeValues[size]) || 0;
            });

            const parts = formData.ngayGiao.split('/');
            const export_date = `${parts[2]}-${parts[1]}-${parts[0]}`;

            const payload = {
                export_date,
                ry_number: formData.donHang,
                shipped_quantity,
                accumulated_total,
                remaining_quantity,
                ...sizePayload
            };

            const res = await fetch('http://localhost:5000/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Save failed');
            }

            setSnackbar({ open: true, message: 'Export saved successfully.', severity: 'success' });
            handleReset();
        } catch (err) {
            console.error('Save error:', err.message);
            setSnackbar({ open: true, message: `Save failed: ${err.message}`, severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const shippedPreview = Object.values(formData.sizeValues)
        .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

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
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(4, 1fr)' },
                    gap: { xs: 2, md: 4 },
                    width: '100%',
                    mb: 1
                }}>
                    <Box component="div" sx={{ width: '100%' }}>
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
                                        placeholder: formData.ngayGiao ? '' : 'Chọn ngày...',
                                        InputProps: {
                                            endAdornment: formData.ngayGiao && (
                                                <InputAdornment position="end" sx={{ mr: 1 }}>
                                                    <IconButton size="small" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData(prev => ({ ...prev, ngayGiao: '' }));
                                                    }}>
                                                        <ClearIcon sx={{ fontSize: '1.1rem' }} />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        },
                                        sx: inputSx
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box component="div" sx={{ width: '100%' }}>
                        <Autocomplete
                            disablePortal
                            options={orderOptions}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.ry_number || ''}
                            loading={loadingOrders}
                            value={formData.donHang
                                ? (orderOptions.find(o => o.ry_number === formData.donHang) || formData.donHang)
                                : null}
                            onChange={handleOrderChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Đơn Hàng"
                                    placeholder="Chọn đơn hàng..."
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                                {loadingOrders ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </React.Fragment>
                                        ),
                                    }}
                                />
                            )}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    bgcolor: '#ffffff',
                                    fontWeight: 600,
                                    color: '#000000',
                                    '& fieldset': { borderColor: '#000000', borderWidth: '1px' },
                                    '&:hover fieldset': { borderColor: '#334155' },
                                    '&.Mui-focused fieldset': { borderColor: '#000000', borderWidth: '2px' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#000000' }
                            }}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        label="Article"
                        disabled
                        value={formData.article}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: formData.article ? '#f8fafc' : '#cbd5e1',
                                fontWeight: 600,
                                '&.Mui-disabled': {
                                    color: '#0f172a',
                                    '-webkit-text-fill-color': '#0f172a',
                                    '& fieldset': { borderColor: '#e2e8f0 !important' }
                                }
                            }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Model Name"
                        disabled
                        value={formData.modelName}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                bgcolor: formData.modelName ? '#f8fafc' : '#cbd5e1',
                                fontWeight: 600,
                                '&.Mui-disabled': {
                                    color: '#0f172a',
                                    '-webkit-text-fill-color': '#0f172a',
                                    '& fieldset': { borderColor: '#e2e8f0 !important' }
                                }
                            }
                        }}
                    />
                </Box>

                {/* Size Input Grid */}
                <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '1rem', color: '#1e293b' }}>
                            Nhập số lượng size
                        </Typography>
                        {shippedPreview > 0 && (
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1976d2', bgcolor: '#e3f2fd', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                                SL giao hôm nay: {shippedPreview}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(auto-fill, minmax(70px, 1fr))',
                            sm: 'repeat(auto-fill, minmax(80px, 1fr))'
                        },
                        gap: '16px 60px',
                    }}>
                        {sizes.map((size) => (
                            <Box key={size} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ color: '#475569', fontWeight: 500, fontSize: '0.9rem' }}>
                                    {size}
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    autoComplete="off"
                                    placeholder=""
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
                                    inputProps={{
                                        style: { textAlign: 'center', padding: '10px 0', fontSize: '0.9rem', fontWeight: 500, color: '#475569' }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            fontWeight: 500,
                                            '& fieldset': { borderColor: '#e2e8f0' },
                                            '&:hover fieldset': { borderColor: '#cbd5e1' },
                                            '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                                            bgcolor: (formData.sizeValues[size] && formData.sizeValues[size] !== '0') ? '#ffffff' : '#cbd5e1'
                                        }
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mt: 'auto', pt: 4, display: 'flex', alignItems: 'center', gap: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                        disabled={saving}
                        onClick={handleSave}
                        sx={{
                            backgroundColor: '#1976d2',
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 4, py: 1.2,
                            fontWeight: 500,
                            boxShadow: 'none',
                            '&:hover': { backgroundColor: '#1565c0', boxShadow: 'none' }
                        }}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        startIcon={<RestartAltIcon />}
                        sx={{
                            color: '#334155',
                            borderColor: '#e2e8f0',
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3, py: 1.2,
                            fontWeight: 500,
                            '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }
                        }}
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
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    sx={{ borderRadius: '8px', fontWeight: 500 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EntryForm;
