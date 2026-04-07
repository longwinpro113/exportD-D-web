import React, { memo, useMemo } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { getFieldInputSx, sizeSummaryBoxSx, sizes } from './shared';

const SizeCell = memo(function SizeCell({ size, value, onSizeChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
      <Typography sx={{ color: '#475569', fontWeight: 700, fontSize: '0.86rem', textAlign: 'center' }}>
        {size}
      </Typography>
      <TextField
        size="small"
        autoComplete="off"
        value={value}
        onChange={(e) => onSizeChange(size, e.target.value)}
        inputProps={{ style: { textAlign: 'center', fontSize: '0.95rem', fontWeight: 600 } }}
        sx={getFieldInputSx(value)}
      />
    </Box>
  );
});

const SizeGridSection = memo(function SizeGridSection({
  title = 'Nhập số lượng size',
  totalLabel = 'Tổng',
  totalValue = 0,
  sizeValues,
  onSizeChange
}) {
  const sizeList = useMemo(() => sizes, []);

  return (
    <Box sx={{ mt: -1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 2.25 }}>
        <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
          {title}
        </Typography>
        <Box
          sx={{
            ...sizeSummaryBoxSx,
            visibility: totalValue > 0 ? 'visible' : 'hidden',
            opacity: totalValue > 0 ? 1 : 0,
            transition: 'opacity 0.2s ease'
          }}
        >
          {totalLabel}: {totalValue}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
            md: 'repeat(6, minmax(0, 1fr))',
            lg: 'repeat(10, minmax(0, 1fr))'
          },
          gap: 2
        }}
      >
        {sizeList.map((size) => (
          <SizeCell
            key={size}
            size={size}
            value={sizeValues[size] || ''}
            onSizeChange={onSizeChange}
          />
        ))}
      </Box>
    </Box>
  );
});

export default SizeGridSection;
