import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField,
    InputAdornment, IconButton
} from '@mui/material';
import ReportHeader from './common/ReportHeader';
import useQuery from '../hooks/useQuery';
import useFetchList from '../hooks/useFetchList';

const buildSizes = () => {
    const s = [];
    for (let i = 3; i <= 18; i += 0.5) s.push(i);
    return s;
};
const sizes = buildSizes();

const ClientOrders = () => {
    const [query, updateQuery] = useQuery({ q: '' });
    const [rawOrders, loading] = useFetchList('/api/orders', {});

    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        if (!Array.isArray(rawOrders) || rawOrders.length === 0) {
            setTableData([]);
            setFilteredData([]);
            return;
        }
        
        const mappedData = rawOrders.map(item => {
            const rowSizes = {};
            sizes.forEach(s => {
                const col = `s${s.toString().replace('.', '_')}`;
                if (item[col] !== undefined && item[col] !== null) rowSizes[s] = item[col];
            });
            return {
                id: item.ry_number,
                donHang: item.ry_number || '',
                client: item.client || '',
                article: item.article || '',
                modelName: item.model_name || '',
                total: item.total_order_qty || 0,
                dotGiao: item.delivery_round || '',
                sizes: rowSizes
            };
        });

        setTableData(mappedData);
        setFilteredData(mappedData);
    }, [rawOrders, sizes]);

    useEffect(() => {
        if (!query.q.trim()) {
            setFilteredData(tableData);
        } else {
            const q = query.q.toLowerCase();
            setFilteredData(tableData.filter(item =>
                item.donHang.toLowerCase().includes(q) || 
                item.client.toLowerCase().includes(q) ||
                item.modelName.toLowerCase().includes(q)
            ));
        }
    }, [query.q, tableData]);

    const cellStyle = { color: '#1e293b', fontSize: '0.85rem', height: 38, border: '1px solid #e2e8f0' };

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
                <ReportHeader 
                    title="THEO DÕI ĐƠN HÀNG"
                    sender="Danh sách chi tiết các đơn hàng và số liệu từng size"
                    placeholder="Nhập mã đơn hàng ..."
                    onSearch={(text) => updateQuery({ q: text })}
                />

                <Box sx={{ flexGrow: 1, borderTop: '1px solid #e2e8f0', width: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
                    <TableContainer sx={{ minWidth: 2400, height: '100%' }}>
                        <Table stickyHeader size="small" sx={{ 
                            '& th, & td': { p: 1 },
                            borderCollapse: 'separate'
                        }}>
                            <TableHead>
                                <TableRow>
                                    {['STT', 'Đơn Hàng', 'Khách hàng', 'Article', 'Model Name', 'Total', 'Đợt giao'].map((h, i) => (
                                        <TableCell key={h} align="center" sx={{
                                            color: '#475569', fontWeight: 600, fontSize: '0.85rem',
                                            minWidth: i === 0 ? 50 : i === 1 ? 140 : i === 2 ? 150 : 80,
                                            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', sticky: i <= 1 ? 'left' : 'auto'
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
                                        <TableCell align="center" sx={cellStyle}>{row.client}</TableCell>
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
