import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField,
  InputAdornment, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import ClearIcon from '@mui/icons-material/Clear';

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
                    InputProps={{ sx: { fontSize: '0.85rem', height: 26, borderRadius: '4px', bgcolor: '#ffffff' } }}
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
                borderBottom: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0',
                transition: 'background-color 0.1s ease',
                '&:hover': { filter: 'brightness(0.95)' }
            }}
            onClick={() => setIsEditing(true)}
        >
            {value}
        </TableCell>
    );
};

const ClientOrders = () => {
    const sizes = [];
    for (let i = 3; i <= 18; i += 0.5) sizes.push(i);

    const [tableData, setTableData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/orders');
                const data = await response.json();

                if (!Array.isArray(data)) { setTableData([]); return; }

                const mappedData = data.map(item => {
                    const rowSizes = {};
                    sizes.forEach(s => {
                        const col = `s${s.toString().replace('.', '_')}`;
                        if (item[col] !== undefined && item[col] !== null) rowSizes[s] = item[col];
                    });
                    return {
                        id: item.ry_number,
                        donHang: item.ry_number || '',
                        article: item.article || '',
                        modelName: item.model_name || '',
                        total: item.total_order_qty || 0,
                        dotGiao: item.delivery_round || '',
                        sizes: rowSizes
                    };
                });

                setTableData(mappedData);
                setFilteredData(mappedData);
            } catch (error) {
                console.error('Failed to fetch orders:', error.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredData(tableData);
        } else {
            setFilteredData(tableData.filter(item =>
                item.donHang.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        }
    }, [searchQuery, tableData]);

    const handleUpdate = (rowIdx, field, newValue) => {
        const newData = [...tableData];
        newData[rowIdx][field] = field === 'total'
            ? (newValue !== '' ? Number(newValue) : '')
            : newValue;
        setTableData(newData);
    };

    const handleUpdateSize = (rowIdx, sizeStr, newValue) => {
        const newData = [...tableData];
        if (newValue === '') delete newData[rowIdx].sizes[sizeStr];
        else newData[rowIdx].sizes[sizeStr] = Number(newValue);
        setTableData(newData);
    };

    const cellStyle = { color: '#1e293b', fontSize: '0.85rem' };

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
                                THEO DÕI ĐƠN HÀNG (CLIENT ORDERS)
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>
                                Danh sách chi tiết các đơn hàng và số liệu từng size
                            </Typography>
                        </Box>
                        <IconButton sx={{
                            border: '1px solid #e2e8f0', borderRadius: '8px',
                            color: '#64748b', backgroundColor: '#f8fafc',
                            '&:hover': { backgroundColor: '#f1f5f9' },
                            width: 38, height: 38
                        }}>
                            <SyncIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    <Box sx={{ width: '380px', mt: 1 }}>
                        <TextField
                            fullWidth size="small"
                            placeholder="Nhập mã đơn hàng và nhấn Enter..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <ClearIcon sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px', backgroundColor: '#ffffff',
                                    fontSize: '0.9rem', color: '#334155',
                                    '& fieldset': { borderColor: '#e2e8f0' },
                                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                                    '&.Mui-focused fieldset': { borderColor: '#1976d2', borderWidth: '2px' },
                                }
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, borderTop: '1px solid #e2e8f0', width: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
                    <TableContainer sx={{ minWidth: 2400, height: '100%' }}>
                        <Table size="small" sx={{ '& th, & td': { border: '1px solid #f1f5f9', py: 1.2, px: 1 } }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                    {['STT', 'Đơn Hàng', 'Article', 'Model Name', 'Total', 'Đợt giao hàng'].map((h, i) => (
                                        <TableCell key={h} align="center" sx={{
                                            color: '#475569', fontWeight: 600, fontSize: '0.85rem',
                                            minWidth: i === 0 ? 50 : i === 3 ? 140 : i === 2 ? 80 : 120
                                        }}>{h}</TableCell>
                                    ))}
                                    {sizes.map(s => (
                                        <TableCell key={s} align="center" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem', minWidth: 40 }}>{s}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((row, index) => {
                                    const actualIdx = tableData.findIndex(item => item.id === row.id);
                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell align="center" sx={{ ...cellStyle, fontWeight: 500, color: '#64748b' }}>
                                                {index + 1}
                                            </TableCell>
                                            <EditableCell value={row.donHang} align="center" onChange={(v) => handleUpdate(actualIdx, 'donHang', v)} sx={{ ...cellStyle, fontWeight: 600 }} />
                                            <EditableCell value={row.article} align="center" onChange={(v) => handleUpdate(actualIdx, 'article', v)} sx={cellStyle} />
                                            <EditableCell value={row.modelName} align="center" onChange={(v) => handleUpdate(actualIdx, 'modelName', v)} sx={{ ...cellStyle, fontWeight: 600 }} />
                                            <EditableCell value={row.total} align="center" onChange={(v) => handleUpdate(actualIdx, 'total', v)} sx={{ ...cellStyle, fontWeight: 700 }} />
                                            <EditableCell value={row.dotGiao} align="center" onChange={(v) => handleUpdate(actualIdx, 'dotGiao', v)} sx={cellStyle} />
                                            {sizes.map(s => {
                                                const val = row.sizes && row.sizes[s] !== undefined ? row.sizes[s] : '';
                                                const isEmpty = val === '' || Number(val) === 0;
                                                return (
                                                    <EditableCell
                                                        key={s}
                                                        value={isEmpty ? '' : val}
                                                        align="center"
                                                        onChange={(v) => handleUpdateSize(actualIdx, s.toString(), v)}
                                                        sx={{
                                                            color: !isEmpty ? '#0f172a' : '#94a3b8',
                                                            fontSize: '0.85rem',
                                                            fontWeight: !isEmpty ? 600 : 400,
                                                            bgcolor: !isEmpty ? '#ffffff' : '#e2e8f0'
                                                        }}
                                                    />
                                                );
                                            })}
                                        </TableRow>
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

export default ClientOrders;
