export const buildSizes = () => {
  const result = [];
  for (let i = 3; i <= 18; i += 0.5) result.push(i);
  return result;
};

export const sizes = buildSizes();

export const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;

export const baseCellStyle = {
  color: '#1e293b',
  fontSize: '0.85rem',
  height: 38,
  borderRight: '1px solid #cbd5e1',
  borderBottom: '1px solid #cbd5e1',
  width: 42,
  textAlign: 'center'
};

const leadColumnWidths = [40, 120, 60, 80, 130, 120];
const leadColumnCustomWidths = {
  9: 88,
  10: 92
};

export const reportPageSx = {
  p: { xs: 2, md: 3 },
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  bgcolor: '#f8fafc',
  overflow: 'hidden'
};

export const reportPaperSx = {
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
  bgcolor: '#fff'
};

export const commonTableSx = {
  borderCollapse: 'separate',
  borderSpacing: 0,
  '& th, & td': {
    borderBottom: '1px solid #f1f5f9',
    borderRight: '1px solid #f1f5f9',
    px: 1,
    textAlign: 'center',
    whiteSpace: 'nowrap'
  }
};

export const commonTableContainerSx = {
  width: '100%',
  flex: 1,
  overflow: 'auto'
};

export const getLeadHeaderCellSx = (index) => ({
  bgcolor: '#f8fafc',
  fontWeight: 800,
  fontSize: '0.82rem',
  position: 'sticky',
  top: 0,
  left: index === 0 ? 0 : index === 1 ? '40px' : 'auto',
  width: index in leadColumnCustomWidths
    ? `${leadColumnCustomWidths[index]}px`
    : index < leadColumnWidths.length
      ? `${leadColumnWidths[index]}px`
      : '75px',
  minWidth: index in leadColumnCustomWidths
    ? `${leadColumnCustomWidths[index]}px`
    : index < leadColumnWidths.length
      ? `${leadColumnWidths[index]}px`
      : '75px',
  maxWidth: index in leadColumnCustomWidths
    ? `${leadColumnCustomWidths[index]}px`
    : index < leadColumnWidths.length
      ? `${leadColumnWidths[index]}px`
      : '75px',
  p: index <= 1 ? '0 !important' : undefined,
  zIndex: index === 0 ? 13 : index === 1 ? 12 : 2,
  borderRight: index <= 1 ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
  boxShadow: index === 0 ? '1px 0 0 #e2e8f0' : index === 1 ? '2px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
});

export const sizeHeaderCellSx = {
  bgcolor: '#f8fafc',
  fontWeight: 700,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  minWidth: 45,
  width: 45,
  maxWidth: 45,
  p: '0 !important'
};

export const groupedDateRowCellSx = (backgroundColor = '#f0f7ff') => ({
  textAlign: 'left !important',
  py: 0,
  px: 0,
  height: 42,
  borderBottom: '1px solid #e2e8f0',
  backgroundColor
});

export const groupedDateContentSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  width: '100%',
  minHeight: 42,
  pl: 3,
  pr: 1.5,
  justifyContent: 'center'
};

export const headerBoxSx = {
  p: 2.5,
  pb: 2,
  fontFamily: 'Calibri, Arial, sans-serif'
};

export const headerTitleSx = {
  fontFamily: 'Calibri, Arial, sans-serif',
  fontWeight: 800,
  fontSize: '1.05rem',
  color: '#1e293b',
  textTransform: 'uppercase',
  letterSpacing: 0.5
};

export const headerSubtitleSx = {
  fontFamily: 'Calibri, Arial, sans-serif',
  fontSize: '0.85rem',
  color: '#94a3b8',
  mt: 0.4,
  fontWeight: 500
};

export const headerInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#ffffff',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
  }
};

export const headerLabelSx = {
  fontFamily: 'Calibri, Arial, sans-serif',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#94a3b8',
  mb: 0.5,
  textTransform: 'uppercase'
};
