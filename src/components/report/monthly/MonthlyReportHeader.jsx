import React from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { 
  headerBoxSx, 
  headerTitleSx, 
  headerSubtitleSx, 
} from '../shared';

const FIELD_RADIUS = '10px';

// Matching exactly the ExportEntryForm style
const getEntryFieldSx = (value) => ({
    width: '100%',
    '& .MuiInputBase-root': {
      borderRadius: FIELD_RADIUS,
      backgroundColor: value ? '#ffffff' : '#eef2f7'
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: FIELD_RADIUS,
      height: '42px',
      bgcolor: value ? '#ffffff' : '#eef2f7',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
      '& fieldset': { borderColor: '#d6dee8' },
      '&:hover fieldset': { borderColor: '#94a3b8' },
      '&.Mui-focused fieldset': { borderColor: '#334155', borderWidth: '2px' }
    },
    '& .MuiPickersOutlinedInput-root': {
      borderRadius: FIELD_RADIUS,
      height: '42px',
      backgroundColor: value ? '#ffffff' : '#eef2f7',
      '& fieldset': { borderColor: '#d6dee8' },
      '&:hover fieldset': { borderColor: '#94a3b8' },
      '&.Mui-focused fieldset': { borderColor: '#334155', borderWidth: '2px' }
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 11px) scale(1)', // Center label vertically when empty
    },
    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)', // Shrink correctly
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#334155'
    }
});

const MonthlyReportHeader = React.memo(({
  title,
  receiver,
  clients = [],
  selectedClient = null,
  onClientChange,
  selectedMonth,
  onMonthChange,
  fromDate,
  toDate,
}) => {
  const readOnlyBoxSx = {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    px: 1.5,
    border: '1px solid #d6dee8',
    borderRadius: FIELD_RADIUS,
    bgcolor: '#f8fafc',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#1e293b',
    width: '145px', // Fixed width for alignment
    justifyContent: 'center'
  };

  return (
    <Box sx={headerBoxSx}>
      {/* Row 1: Title Section + Month Picker (Left), Receiver (Right) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ width: '250px' }}>
            <Typography sx={headerTitleSx}>
              {title || 'BÁO CÁO CÔNG NỢ'}
            </Typography>
            <Typography sx={headerSubtitleSx}>
              Đơn vị chuyển: DD (Long An)
            </Typography>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                  label="Tháng tính công nợ"
                  views={['month', 'year']} 
                  format="MM/YYYY"
                  value={selectedMonth}
                  onChange={onMonthChange}
                  slotProps={{
                      textField: {
                          placeholder: 'Tháng tính...',
                          sx: { ...getEntryFieldSx(selectedMonth), width: '306px' }
                      }
                  }}
              />
          </LocalizationProvider>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={headerTitleSx}>Đơn vị lãnh</Typography>
          <Typography sx={headerSubtitleSx}>
            {receiver || '-'}
          </Typography>
        </Box>
      </Box>

      {/* Row 2: Client + Từ + Đến (Left aligned) */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
        <Autocomplete
            size="small"
            disableClearable
            options={clients}
            getOptionLabel={(option) => option?.client || ''}
            value={selectedClient || null}
            onChange={(e, newValue) => onClientChange(newValue)}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Chọn khách hàng..." />}
            sx={{ ...getEntryFieldSx(selectedClient), width: '250px' }}
        />

        <Box sx={readOnlyBoxSx}>
            <Typography variant="caption" sx={{ color: '#94a3b8', mr: 1, fontWeight: 700 }}>TỪ:</Typography>
            {fromDate ? dayjs(fromDate).format('DD/MM/YYYY') : '-'}
        </Box>
        <Box sx={readOnlyBoxSx}>
            <Typography variant="caption" sx={{ color: '#94a3b8', mr: 1, fontWeight: 700 }}>ĐẾN:</Typography>
            {toDate ? dayjs(toDate).format('DD/MM/YYYY') : '-'}
        </Box>
      </Box>
    </Box>
  );
});

export default MonthlyReportHeader;
