import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    InputAdornment, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ClientOrders = () => {
    const sizes = [];
    for (let i = 3; i <= 18; i += 0.5) sizes.push(i);

    const [tableData, setTableData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/orders`);
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

    const cellStyle = { color: '#1e293b', fontSize: '0.85rem', height: 38, borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' };

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
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Đơn vị lãnh</Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', mt: 0.5, fontWeight: 500 }}>Công Ty Lạc Tỷ</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ width: '380px', mt: 1 }}>
                        <TextField
                            fullWidth size="small"
                            placeholder="Nhập mã đơn hàng ..."
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
                        <Table stickyHeader size="small" sx={{ 
                            '& th, & td': { p: 1 },
                            borderCollapse: 'separate'
                        }}>
                            <TableHead>
                                <TableRow>
                                    {['STT', 'Đơn Hàng', 'Article', 'Model Name', 'Total', 'Đợt giao hàng'].map((h, i) => (
                                        <TableCell key={h} align="center" sx={{
                                            color: '#475569', fontWeight: 600, fontSize: '0.85rem',
                                            minWidth: i === 0 ? 50 : i === 3 ? 140 : i === 2 ? 80 : 120,
                                            backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0'
                                        }}>{h}</TableCell>
                                    ))}
                                    {sizes.map(s => (
                                        <TableCell key={s} align="center" sx={{ 
                                            color: '#475569', fontWeight: 600, fontSize: '0.85rem', 
                                            minWidth: 40, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0'
                                        }}>{s}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((row, index) => (
                                    <TableRow key={row.id}>
                                        <TableCell align="center" sx={{ ...cellStyle, fontWeight: 500, color: '#64748b' }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell align="center" sx={{ ...cellStyle, fontWeight: 600 }}>{row.donHang}</TableCell>
                                        <TableCell align="center" sx={cellStyle}>{row.article}</TableCell>
                                        <TableCell align="center" sx={{ ...cellStyle, fontWeight: 600 }}>{row.modelName}</TableCell>
                                        <TableCell align="center" sx={{ ...cellStyle, fontWeight: 700 }}>{row.total}</TableCell>
                                        <TableCell align="center" sx={cellStyle}>{row.dotGiao}</TableCell>
                                        {sizes.map(s => {
                                            const val = row.sizes && row.sizes[s] !== undefined ? row.sizes[s] : '';
                                            const isEmpty = val === '' || Number(val) === 0;
                                            return (
                                                <TableCell
                                                    key={s}
                                                    align="center"
                                                    sx={{
                                                        ...cellStyle,
                                                        color: !isEmpty ? '#0f172a' : '#94a3b8',
                                                        fontWeight: !isEmpty ? 600 : 400,
                                                        bgcolor: !isEmpty ? '#ffffff' : '#e2e8f0'
                                                    }}
                                                >
                                                    {isEmpty ? '' : val}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default ClientOrders;
