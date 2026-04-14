import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Divider,
  CircularProgress,
  Paper,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useFetchList from '../../hooks/useFetchList';
import { createOrder } from '../../services/api';
import FormActions from './FormActions';
import SizeGridSection from './SizeGridSection';
import {
  getEntryPaperSx,
  getFieldInputSx,
  pageShellSx,
  sizeToCol,
  sizes,
  toApiDate
} from './shared';

const getToastSx = (severity) => ({
  borderRadius: '12px',
  px: 1.5,
  py: 1,
  alignItems: 'center',
  backgroundColor: severity === 'success' ? '#ecfdf5' : severity === 'warning' ? '#fffbeb' : '#fef2f2',
  color: severity === 'success' ? '#166534' : severity === 'warning' ? '#92400e' : '#991b1b',
  border: `1px solid ${severity === 'success' ? '#bbf7d0' : severity === 'warning' ? '#fde68a' : '#fecaca'}`,
  '& .MuiAlert-icon': {
    color: severity === 'success' ? '#22c55e' : severity === 'warning' ? '#f59e0b' : '#ef4444'
  }
});

const createInitialFormData = () => ({
  article: '',
  ry_number: '',
  delivery_round: '',
  CRD: null,
  client_export_date: null,
  client_import_date: null,
  client: '',
  model_name: '',
  product: '',
  sizeValues: {}
});

function OrderEntryForm() {
  const [formData, setFormData] = useState(createInitialFormData());
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clients, loadingClients] = useFetchList('/api/orders/clients', {});

  const clientOptions = useMemo(() => {
    if (!Array.isArray(clients)) return [];

    return [...new Set(
      clients
        .map((item) => item?.client?.trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }, [clients]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSizeChange = useCallback((size, val) => {
    setFormData((prev) => ({
      ...prev,
      sizeValues: { ...prev.sizeValues, [size]: val }
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFormData(createInitialFormData());
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.article || !formData.ry_number || !formData.client) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập Article, Đơn Hàng và Khách hàng.',
        severity: 'warning'
      });
      return;
    }

    setSaving(true);
    try {
      const sizePayload = {};
      sizes.forEach((size) => {
        sizePayload[sizeToCol(size)] = parseFloat(formData.sizeValues[size]) || 0;
      });

      const total_order_qty = Object.values(sizePayload).reduce((sum, value) => sum + value, 0);

      const payload = {
        article: formData.article.trim(),
        ry_number: formData.ry_number.trim(),
        delivery_round: formData.delivery_round.trim(),
        CRD: toApiDate(formData.CRD),
        client_export_date: toApiDate(formData.client_export_date),
        client_import_date: toApiDate(formData.client_import_date),
        client: formData.client.trim(),
        model_name: formData.model_name.trim(),
        product: formData.product.trim(),
        total_order_qty,
        ...sizePayload
      };

      await createOrder(payload);
      setSnackbar({ open: true, message: 'Lưu đơn hàng thành công.', severity: 'success' });
      handleReset();
    } catch (err) {
      setSnackbar({ open: true, message: `Lưu đơn hàng thất bại: ${err.message}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [formData, handleReset]);

  const totalSizePreview = useMemo(
    () => Object.values(formData.sizeValues).reduce((sum, value) => sum + (parseFloat(value) || 0), 0),
    [formData.sizeValues]
  );

  return (
    <Box sx={pageShellSx}>
      <Paper elevation={0} sx={getEntryPaperSx}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            Nhập Thông Tin Đơn Hàng Mới
          </Typography>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))'
              },
              gap: 2.5,
              alignItems: 'start'
            }}
          >
            <Autocomplete
              freeSolo
              openOnFocus
              options={clientOptions}
              value={formData.client}
              inputValue={formData.client}
              onChange={(_, newValue) => updateField('client', typeof newValue === 'string' ? newValue : newValue || '')}
              onInputChange={(_, newInputValue) => updateField('client', newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Khách hàng"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingClients ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              sx={getFieldInputSx(formData.client)}
            />
            <TextField fullWidth label="Article" value={formData.article} onChange={(e) => updateField('article', e.target.value)} sx={getFieldInputSx(formData.article)} />
            <TextField fullWidth label="Đơn Hàng" value={formData.ry_number} onChange={(e) => updateField('ry_number', e.target.value)} sx={getFieldInputSx(formData.ry_number)} />
            <TextField fullWidth label="Đợt Giao Hàng" value={formData.delivery_round} onChange={(e) => updateField('delivery_round', e.target.value)} sx={getFieldInputSx(formData.delivery_round)} />
            <DatePicker
              label="Ngày Xuất Cảng"
              format="DD/MM/YYYY"
              value={formData.CRD}
              onChange={(newValue) => updateField('CRD', newValue)}
              slotProps={{ textField: { fullWidth: true, sx: getFieldInputSx(formData.CRD) } }}
            />
            <DatePicker
              label="Ngày Xuất Hàng"
              format="DD/MM/YYYY"
              value={formData.client_export_date}
              onChange={(newValue) => updateField('client_export_date', newValue)}
              slotProps={{ textField: { fullWidth: true, sx: getFieldInputSx(formData.client_export_date) } }}
            />
            <DatePicker
              label="Ngày Nhập Hàng"
              format="DD/MM/YYYY"
              value={formData.client_import_date}
              onChange={(newValue) => updateField('client_import_date', newValue)}
              slotProps={{ textField: { fullWidth: true, sx: getFieldInputSx(formData.client_import_date) } }}
            />
            <TextField fullWidth label="Model Name" value={formData.model_name} onChange={(e) => updateField('model_name', e.target.value)} sx={getFieldInputSx(formData.model_name)} />
            <TextField fullWidth label="Product" value={formData.product} onChange={(e) => updateField('product', e.target.value)} sx={getFieldInputSx(formData.product)} />
          </Box>
        </LocalizationProvider>

        <Divider sx={{ borderColor: '#edf2f7' }} />

        <SizeGridSection
          sizeValues={formData.sizeValues}
          totalValue={totalSizePreview}
          onSizeChange={handleSizeChange}
        />

        <FormActions
          saving={saving}
          saveLabel="Lưu Đơn Hàng"
          onSave={handleSave}
          onReset={handleReset}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="standard" sx={getToastSx(snackbar.severity)}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default OrderEntryForm;
