import React, { memo } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { FIELD_RADIUS } from './shared';

const FormActions = memo(function FormActions({
  saving,
  saveLabel,
  savingLabel = 'Đang lưu...',
  onSave,
  onReset
}) {
  return (
    <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
        disabled={saving}
        onClick={onSave}
        sx={{
          textTransform: 'none',
          borderRadius: FIELD_RADIUS,
          px: 4,
          py: 1.2,
          fontWeight: 700,
          bgcolor: '#1976d2',
          '&:hover': { bgcolor: '#1565c0' }
        }}
      >
        {saving ? savingLabel : saveLabel}
      </Button>
      <Button
        variant="outlined"
        onClick={onReset}
        startIcon={<RestartAltIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: FIELD_RADIUS,
          px: 3,
          py: 1.2,
          fontWeight: 600,
          color: '#1976d2',
          borderColor: '#bfdbfe',
          '&:hover': {
            borderColor: '#93c5fd',
            backgroundColor: '#eff6ff'
          }
        }}
      >
        Làm mới
      </Button>
    </Box>
  );
});

export default FormActions;
