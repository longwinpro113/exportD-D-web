import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = React.memo(({ title, sender, receiver }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title || 'BIỂU GIAO THÀNH PHẨM'}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.4, fontWeight: 500 }}>
          {sender || 'Đơn vị chuyển: DD (Long An)'}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Đơn vị lãnh</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
          {receiver || '-'}
        </Typography>
      </Box>
    </Box>
  );
});

export default PageHeader;
