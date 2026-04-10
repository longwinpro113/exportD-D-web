import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import useFetchList from '../../hooks/useFetchList';
import { exportOrder } from '../../services/api';
import FormActions from './FormActions';
import SizeGridSection from './SizeGridSection';
import {
  getEntryPaperSx,
  getFieldInputSx,
  pageShellSx,
  readOnlyInputSx,
  sizeToCol,
  sizes
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
  exportDate: null,
  client: null,
  order: null,
  note: '',
  sizeValues: {}
});

function ExportEntryForm() {
  const [formData, setFormData] = useState(createInitialFormData());
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [clients] = useFetchList('/api/orders/clients', {});
  const selectedClientName = formData.client?.client || '';
  const [orderOptions, loadingOrders] = useFetchList('/api/orders', { client: selectedClientName });

  const selectedOrder = useMemo(
    () => (formData.order && typeof formData.order === 'object' ? formData.order : null),
    [formData.order]
  );

  const totalShippedPreview = useMemo(
    () => Object.values(formData.sizeValues).reduce((sum, value) => sum + (parseFloat(value) || 0), 0),
    [formData.sizeValues]
  );

  const handleReset = useCallback(() => {
    setFormData(createInitialFormData());
  }, []);

  const handleSizeChange = useCallback((size, val) => {
    setFormData((prev) => ({
      ...prev,
      sizeValues: { ...prev.sizeValues, [size]: val }
    }));
  }, []);

  const handleClientChange = useCallback((_, newValue) => {
    setFormData((prev) => ({
      ...prev,
      client: newValue,
      order: null,
      sizeValues: {}
    }));
  }, []);

  const handleOrderChange = useCallback((_, newValue) => {
    setFormData((prev) => ({
      ...prev,
      order: newValue && typeof newValue === 'object' ? newValue : null
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.exportDate || !selectedOrder?.ry_number) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn ngày giao hàng và đơn hàng.',
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

      const payload = {
        export_date: dayjs(formData.exportDate).format('YYYY-MM-DD'),
        ry_number: selectedOrder.ry_number,
        note: formData.note.trim() || null,
        ...sizePayload
      };

      console.log('Submitting export payload:', payload);

      await exportOrder(payload);
      setSnackbar({ open: true, message: 'Lưu báo cáo xuất hàng thành công.', severity: 'success' });
      handleReset();
    } catch (err) {
      setSnackbar({ open: true, message: `Lưu báo cáo xuất hàng thất bại: ${err.message}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [formData.exportDate, formData.note, formData.sizeValues, handleReset, selectedOrder]);

  return (
    <Box sx={pageShellSx}>
      <Paper elevation={0} sx={getEntryPaperSx}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
          Nhập Thông Tin Xuất Hàng
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))'
              },
              gap: 2.5,
              alignItems: 'start'
            }}
          >
            <Autocomplete
              disablePortal
              options={clients}
              getOptionLabel={(option) => option.client || ''}
              value={formData.client}
              onChange={handleClientChange}
              isOptionEqualToValue={(option, value) => option.client === value.client}
              renderInput={(params) => <TextField {...params} fullWidth label="Khách hàng" />}
              sx={getFieldInputSx(formData.client)}
            />

            <DatePicker
              label="Ngày giao hàng"
              format="DD/MM/YYYY"
              value={formData.exportDate}
              onChange={(newValue) => setFormData((prev) => ({ ...prev, exportDate: newValue }))}
              slotProps={{ textField: { fullWidth: true, sx: getFieldInputSx(formData.exportDate) } }}
            />

            <Autocomplete
              disablePortal
              options={orderOptions}
              loading={loadingOrders}
              getOptionLabel={(option) => option?.ry_number || ''}
              value={formData.order}
              onChange={handleOrderChange}
              isOptionEqualToValue={(option, value) => option.ry_number === value.ry_number}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label="Đơn hàng"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingOrders ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              sx={getFieldInputSx(formData.order)}
            />

            <TextField fullWidth label="Article" value={selectedOrder?.article || ''} disabled sx={readOnlyInputSx} />
            <TextField fullWidth label="Model Name" value={selectedOrder?.model_name || ''} disabled sx={readOnlyInputSx} />
            <TextField fullWidth label="Product" value={selectedOrder?.product || ''} disabled sx={readOnlyInputSx} />
            <TextField
              fullWidth
              label="Ghi chú"
              value={formData.note}
              onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
              sx={getFieldInputSx(formData.note)}
            />
          </Box>
        </LocalizationProvider>

        <Divider sx={{ borderColor: '#edf2f7' }} />

        <SizeGridSection
          sizeValues={formData.sizeValues}
          totalValue={totalShippedPreview}
          onSizeChange={handleSizeChange}
        />

        <FormActions
          saving={saving}
          saveLabel="Lưu báo cáo"
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

export default ExportEntryForm;
