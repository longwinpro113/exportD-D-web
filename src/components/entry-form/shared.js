import dayjs from 'dayjs';

export const FIELD_RADIUS = '10px';

export const buildSizes = () => {
  const result = [];
  for (let i = 3; i <= 18; i += 0.5) result.push(i);
  return result;
};

export const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;

export const sizes = buildSizes();

export const getFieldInputSx = (value) => ({
  '& .MuiInputBase-root': {
    borderRadius: FIELD_RADIUS,
    backgroundColor: value ? '#ffffff' : '#eef2f7'
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: FIELD_RADIUS,
    bgcolor: value ? '#ffffff' : '#eef2f7',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: '#d6dee8' },
    '&:hover fieldset': { borderColor: '#94a3b8' },
    '&.Mui-focused fieldset': { borderColor: '#334155', borderWidth: '2px' }
  },
  '& .MuiPickersOutlinedInput-root': {
    borderRadius: FIELD_RADIUS,
    backgroundColor: value ? '#ffffff' : '#eef2f7',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: '#d6dee8' },
    '&:hover fieldset': { borderColor: '#94a3b8' },
    '&.Mui-focused fieldset': { borderColor: '#334155', borderWidth: '2px' }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#334155'
  }
});

export const readOnlyInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: FIELD_RADIUS,
    bgcolor: '#f8fafc',
    '& fieldset': { borderColor: '#d6dee8' }
  },
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: '#0f172a',
    fontWeight: 600
  }
};

export const getEntryPaperSx = {
  p: { xs: 3, md: 4 },
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  width: '100%'
};

export const pageShellSx = {
  p: { xs: 2, md: 3 },
  width: '100%',
  height: '100%',
  overflow: 'auto',
  bgcolor: '#f8fafc'
};

export const sizeSummaryBoxSx = {
  borderRadius: '10px',
  px: 2,
  py: 0.8,
  backgroundColor: '#e0f0ff',
  color: '#1976d2',
  fontWeight: 700,
  fontSize: '0.95rem',
  minWidth: 100,
  textAlign: 'center'
};

export const toApiDate = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
};
