import React, { memo } from 'react';
import { Box, TableCell, TableRow, Typography } from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { groupedDateContentSx, groupedDateRowCellSx } from './shared';

const GroupedDateRow = memo(function GroupedDateRow({
  label,
  colSpan,
  onPrint,  
  backgroundColor = '#f0f7ff',
  accentColor = '#1976d2',
  hasStickyAction = false,
  hidePrint = false
}) {
  const middleColSpan = Math.max(1, colSpan - (hasStickyAction ? 3 : 2));

  return (
    <TableRow>
      <TableCell
        sx={{
          ...groupedDateRowCellSx(backgroundColor),
          position: 'sticky',
          left: 0,
          boxSizing: 'border-box',
          width: '40px',
          minWidth: '40px',
          maxWidth: '40px',
          zIndex: 4,
          borderRight: '1px solid #e2e8f0'
        }}
      />
      <TableCell
        sx={{
          ...groupedDateRowCellSx(backgroundColor),
          position: 'sticky',
          left: '40px',
          boxSizing: 'border-box',
          width: '120px',
          minWidth: '120px',
          maxWidth: '120px',
          zIndex: 3,
          borderRight: '2px solid #e2e8f0'
        }}
      >
        <Box sx={{ ...groupedDateContentSx, justifyContent: 'center', px: 0 }}>
          <Typography sx={{ fontWeight: 700, color: accentColor, fontSize: '0.95rem', textAlign: 'center', ml: 0.35 }}>
            {label}
          </Typography>
          {!hidePrint && (
            <Box
              component="button"
              onClick={onPrint}
              sx={{
                border: 0,
                background: 'transparent',
                color: accentColor,
                p: 0.35,
                ml: -0.1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <PrintOutlinedIcon sx={{ fontSize: '1.15rem' }} />
            </Box>
          )}
        </Box>
      </TableCell>
      <TableCell colSpan={middleColSpan} sx={groupedDateRowCellSx(backgroundColor)} />
      {hasStickyAction ? (
        <TableCell
          sx={{
            ...groupedDateRowCellSx('#ffffff'),
            position: 'sticky',
            right: 0,
            minWidth: '84px',
            width: '84px',
            zIndex: 3,
            borderLeft: '2px solid #e2e8f0'
          }}
        />
      ) : null}
    </TableRow>
  );
});

export default GroupedDateRow;
