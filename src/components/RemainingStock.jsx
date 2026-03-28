import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField,
  IconButton, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

const EditableCell = ({ value, onChange, align = 'left', sx = {}, colSpan }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value || '');

    React.useEffect(() => { setTempValue(value || ''); }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { onChange(tempValue); setIsEditing(false); }
        else if (e.key === 'Escape') { setTempValue(value || ''); setIsEditing(false); }
    };

    if (isEditing) {
        return (
            <TableCell align={align} colSpan={colSpan} sx={{ ...sx, p: '4px' }}>
                <TextField
                    autoFocus size="small" variant="outlined"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => { onChange(tempValue); setIsEditing(false); }}
                    InputProps={{ sx: { fontSize: '0.85rem', height: 26, borderRadius: '4px' } }}
                    inputProps={{ style: { textAlign: align === 'center' ? 'center' : 'left', padding: '0 8px' } }}
                    sx={{ width: '100%', minWidth: 40 }}
                />
            </TableCell>
        );
    }

    return (
        <TableCell
            align={align} colSpan={colSpan}
            sx={{
                ...sx,
                cursor: 'text',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' }
            }}
            onClick={() => setIsEditing(true)}
        >
            {value}
        </TableCell>
    );
};

const RemainingStock = () => {
    const sizes = [];
    for (let i = 3; i <= 18; i += 0.5) sizes.push(i);

    const initialData = [
        {
            maDon: 'AH2602-M25',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '02/02/2026', tongCan: 670, tichLuy: 124, conLai: 546, sizes: { '3.5': 25, '4': 22, '4.5': 29, '5': 20, '5.5': 37, '6': 29, '6.5': 31, '7': 34, '7.5': 32, '8': 47, '8.5': 32, '9': 49, '9.5': 32, '10': 41, '10.5': 30, '11': 5, '11.5': 11, '12': 29, '12.5': 10, '13': 4 } }]
        },
        {
            maDon: 'AH2602-N34',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '29/01/2026', tongCan: 205, tichLuy: 54, conLai: 151, sizes: { '7.5': 40, '9': 9, '10': 18, '10.5': 98, '12': 3 } }]
        },
        {
            maDon: 'AH2603-E96',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '21/01/2026', tongCan: 480, tichLuy: 30, conLai: 450, sizes: { '10.5': 450 } }]
        },
        {
            maDon: 'AH2602-G64',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '23/01/2026', tongCan: 948, tichLuy: 653, conLai: 295, sizes: { '3': 28, '3.5': 38, '4': 55, '4.5': 39, '5': 31, '5.5': 104 } }]
        },
        {
            maDon: 'AH2602-M65',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '30/01/2026', tongCan: 629, tichLuy: 447, conLai: 182, sizes: { '3': 3, '3.5': 26, '4': 28, '4.5': 32, '5': 24, '6.5': 56, '7': 13 } }]
        },
        {
            maDon: 'AH2602-G67',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '30/01/2026', tongCan: 514, tichLuy: 513, conLai: 1, sizes: { '3': 1, '3.5': 1, '5': 1 } }]
        },
        {
            maDon: 'AH2604-556',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '31/01/2026', tongCan: 667, tichLuy: 428, conLai: 239, sizes: { '6.5': 6, '7.5': 17, '8.5': 12, '10': 191, '12': 7, '12.5': 2 } }]
        },
        {
            maDon: 'AH2603-C39',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '02/02/2026', tongCan: 232, tichLuy: 231, conLai: 1, sizes: { '4.5': 1 } }]
        },
        {
            maDon: 'AH2603-C34',
            rows: [{ stt: 1, dotGh: 'DHD3', ngayGh: '03/02/2026', tongCan: 323, tichLuy: 314, conLai: 9, sizes: { '7.5': 10 } }]
        }
    ];

    const [dataGroups, setDataGroups] = useState(initialData);

    const handleUpdate = (groupIdx, rowIdx, field, newValue) => {
        const newData = [...dataGroups];
        newData[groupIdx].rows[rowIdx][field] = ['tongCan', 'tichLuy', 'conLai'].includes(field)
            ? (newValue !== '' ? Number(newValue) : '')
            : newValue;
        setDataGroups(newData);
    };

    const handleUpdateSize = (groupIdx, rowIdx, sizeStr, newValue) => {
        const newData = [...dataGroups];
        if (newValue === '') delete newData[groupIdx].rows[rowIdx].sizes[sizeStr];
        else newData[groupIdx].rows[rowIdx].sizes[sizeStr] = Number(newValue);
        setDataGroups(newData);
    };

    const cellStyle = { py: 1.2, px: 1, borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', fontSize: '0.85rem' };
    const headerCellStyle = { ...cellStyle, color: '#475569', fontWeight: 600, bgcolor: '#ffffff' };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={0} sx={{
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
            }}>
                <Box sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                THEO DÕI XUẤT NHẬP KHO — HÀNG CÒN NỢ
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
                                Đơn vị chuyển: DD (Long An)
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ textAlign: 'right', mr: 1 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Tổng còn lại</Typography>
                                <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>14617</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ width: '380px', mt: 1 }}>
                        <TextField
                            fullWidth size="small" placeholder="Search..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px', backgroundColor: '#ffffff',
                                    fontSize: '0.9rem', color: '#334155',
                                    '& fieldset': { borderColor: '#c7d2fe' },
                                    '&:hover fieldset': { borderColor: '#a5b4fc' },
                                    '&.Mui-focused fieldset': { borderColor: '#818cf8' },
                                }
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, borderTop: '1px solid #e2e8f0', width: '100%', overflowX: 'auto' }}>
                    <TableContainer sx={{ minWidth: 2400 }}>
                        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" sx={{ ...headerCellStyle, width: 45 }}>STT</TableCell>
                                    <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>Đợt GH</TableCell>
                                    <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 100 }}>Ngày GH</TableCell>
                                    <TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Mã Đơn Hàng</TableCell>
                                    <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>Tổng Cần</TableCell>
                                    <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>Tích Lũy</TableCell>
                                    <TableCell align="center" sx={{ ...headerCellStyle, minWidth: 80 }}>Còn Lại</TableCell>
                                    {sizes.map(s => (
                                        <TableCell key={s} align="center" sx={{ ...headerCellStyle, width: 40, p: 0.5 }}>{s}</TableCell>
                                    ))}
                                    <TableCell align="left" sx={{ ...headerCellStyle, minWidth: 100 }}>Trạng thái</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataGroups.map((group, groupIdx) => {
                                    const totals = group.rows.reduce((acc, row) => {
                                        acc.tongCan += row.tongCan;
                                        acc.tichLuy += row.tichLuy;
                                        acc.conLai += row.conLai;
                                        Object.keys(row.sizes).forEach(s => {
                                            acc.sizes[s] = (acc.sizes[s] || 0) + row.sizes[s];
                                        });
                                        return acc;
                                    }, { tongCan: 0, tichLuy: 0, conLai: 0, sizes: {} });

                                    return (
                                        <React.Fragment key={groupIdx}>
                                            {group.rows.map((row, rowIdx) => (
                                                <TableRow key={`row-${groupIdx}-${rowIdx}`} sx={{ '& td': { borderBottom: '1px solid #f8fafc' } }}>
                                                    <TableCell align="center" sx={{ ...cellStyle, color: '#94a3b8' }}>{row.stt}</TableCell>
                                                    <EditableCell value={row.dotGh} align="center" onChange={(v) => handleUpdate(groupIdx, rowIdx, 'dotGh', v)} sx={{ ...cellStyle, color: '#475569' }} />
                                                    <EditableCell value={row.ngayGh} align="center" onChange={(v) => handleUpdate(groupIdx, rowIdx, 'ngayGh', v)} sx={{ ...cellStyle, color: '#475569' }} />
                                                    <EditableCell value={row.maDon} onChange={(v) => handleUpdate(groupIdx, rowIdx, 'maDon', v)} sx={{ ...cellStyle, fontWeight: 600, color: '#1e293b' }} />
                                                    <EditableCell value={row.tongCan} align="center" onChange={(v) => handleUpdate(groupIdx, rowIdx, 'tongCan', v)} sx={{ ...cellStyle, color: '#64748b' }} />
                                                    <EditableCell value={row.tichLuy} align="center" onChange={(v) => handleUpdate(groupIdx, rowIdx, 'tichLuy', v)} sx={{ ...cellStyle, color: '#8b5cf6', fontWeight: 500 }} />
                                                    <EditableCell value={row.conLai} align="center" onChange={(v) => handleUpdate(groupIdx, rowIdx, 'conLai', v)} sx={{ ...cellStyle, color: '#334155', fontWeight: 600 }} />
                                                    {sizes.map(s => (
                                                        <EditableCell key={s} value={row.sizes[s] || ''} align="center" onChange={(v) => handleUpdateSize(groupIdx, rowIdx, s.toString(), v)} sx={{ ...cellStyle, color: '#1e293b', fontWeight: 600 }} />
                                                    ))}
                                                    <TableCell sx={{ ...cellStyle }} />
                                                </TableRow>
                                            ))}

                                            {/* Total Row */}
                                            <TableRow sx={{ bgcolor: '#fbfcfd' }}>
                                                <TableCell colSpan={2} sx={{ ...cellStyle, borderRight: 'none' }} />
                                                <TableCell colSpan={2} align="right" sx={{ ...cellStyle, fontWeight: 700, color: '#1e293b', pr: 2 }}>
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Total:</Typography>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{group.maDon}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center" sx={{ ...cellStyle, fontWeight: 700, color: '#475569' }}>{totals.tongCan}</TableCell>
                                                <TableCell align="center" sx={{ ...cellStyle, fontWeight: 700, color: '#8b5cf6' }}>{totals.tichLuy}</TableCell>
                                                <TableCell align="center" sx={{ ...cellStyle, fontWeight: 800, color: '#1e293b' }}>{totals.conLai}</TableCell>
                                                {sizes.map(s => (
                                                    <TableCell key={s} align="center" sx={{ ...cellStyle, color: totals.sizes[s] ? '#1e293b' : '#cbd5e1', fontWeight: 700 }}>
                                                        {totals.sizes[s] || '—'}
                                                    </TableCell>
                                                ))}
                                                <TableCell sx={{ ...cellStyle, color: '#64748b' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                        <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />
                                                        <Typography sx={{ fontSize: '0.8rem' }}>Còn {totals.conLai}</Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default RemainingStock;
