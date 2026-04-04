import React, { useState } from 'react';
import {
    Box, TextField, Paper, Button, Typography,
    CircularProgress, Alert, Snackbar, Grid, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { createOrder } from '../services/api';

const buildSizes = () => {
    const s = [];
    for (let i = 3; i <= 18; i += 0.5) s.push(i);
    return s;
};

const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;
const sizes = buildSizes();

const OrderEntryForm = () => {
    const [formData, setFormData] = useState({
        ry_number: '',
        client_name: '',
        article: '',
        model_name: '',
        delivery_round: '',
        sizeValues: {}
    });

    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleReset = () => {
        setFormData({
            ry_number: '',
            client_name: '',
            article: '',
            model_name: '',
            delivery_round: '',
            sizeValues: {}
        });
    };

    const handleSave = async () => {
        if (!formData.ry_number || !formData.client_name || !formData.article) {
            setSnackbar({ open: true, message: 'Vui lòng nhập Đơn hàng, Khách hàng và Article.', severity: 'warning' });
            return;
        }

        setSaving(true);
        try {
            const sizePayload = {};
            sizes.forEach(size => {
                sizePayload[sizeToCol(size)] = parseFloat(formData.sizeValues[size]) || 0;
            });

            const total_order_qty = Object.values(sizePayload).reduce((sum, v) => sum + v, 0);

            const payload = {
                ry_number: formData.ry_number,
                client_name: formData.client_name,
                article: formData.article,
                model_name: formData.model_name,
                delivery_round: formData.delivery_round,
                total_order_qty,
                ...sizePayload
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save order');
            }

            setSnackbar({ open: true, message: 'Lưu đơn hàng thành công.', severity: 'success' });
            handleReset();
        } catch (err) {
            setSnackbar({ open: true, message: `Lỗi: ${err.message}`, severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: '#ffffff',
            '& fieldset': { borderColor: '#cbd5e1' },
            '&:hover fieldset': { borderColor: '#1e293b' },
            '&.Mui-focused fieldset': { borderColor: '#1976d2', borderWidth: '2px' },
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
            <Paper elevation={0} sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                width: '100%'
            }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>Nhập Thông Tin Đơn Hàng Mới</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Quản lý chi tiết đơn hàng theo từng khách hàng và số lượng size.</Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField fullWidth label="Mã Đơn Hàng (RY)" required value={formData.ry_number}
                            onChange={(e) => setFormData(prev => ({ ...prev, ry_number: e.target.value }))}
                            sx={inputSx}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField fullWidth label="Tên Khách Hàng" required value={formData.client_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                            sx={inputSx}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField fullWidth label="Article" required value={formData.article}
                            onChange={(e) => setFormData(prev => ({ ...prev, article: e.target.value }))}
                            sx={inputSx}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField fullWidth label="Model Name" value={formData.model_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                            sx={inputSx}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField fullWidth label="Đợt Giao" value={formData.delivery_round}
                            onChange={(e) => setFormData(prev => ({ ...prev, delivery_round: e.target.value }))}
                            sx={inputSx}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                <Box>
                    <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>Nhập số lượng tổng cho từng Size</Typography>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(auto-fill, minmax(80px, 1fr))', sm: 'repeat(auto-fill, minmax(100px, 1fr))' },
                        gap: 2,
                    }}>
                        {sizes.map((size) => (
                            <Box key={size} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>{size}</Typography>
                                <TextField
                                    size="small" autoComplete="off"
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
                                    inputProps={{ style: { textAlign: 'center', fontSize: '0.9rem' } }}
                                    sx={inputSx}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                        disabled={saving}
                        onClick={handleSave}
                        sx={{ textTransform: 'none', borderRadius: '8px', px: 4, py: 1.2, fontWeight: 700, bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' } }}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu Đơn Hàng'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        startIcon={<RestartAltIcon />}
                        sx={{ textTransform: 'none', borderRadius: '8px', px: 3, py: 1.2, fontWeight: 600, color: '#64748b', borderColor: '#e2e8f0' }}
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
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default OrderEntryForm;
