import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, CssBaseline, IconButton, Tooltip
} from '@mui/material';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';

import ClientOrders from './components/ClientOrders';
import EntryForm from './components/EntryForm';
import StockReport from './components/StockReport';
import RemainingStock from './components/RemainingStock';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 76;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentPath = location.pathname;
  const activeItemId = currentPath === '/' ? 'client-orders' : currentPath.substring(1);

  const navItems = [
    { id: 'client-orders', path: '/client-orders', label: 'Quản Lý Đơn Hàng', Icon: ManageSearchOutlinedIcon },
    { id: 'entry-form', path: '/entry-form', label: 'Entry Form', Icon: PostAddOutlinedIcon },
    { id: 'phieu-xuat-kho', path: '/phieu-xuat-kho', label: 'Phiếu Xuất Kho', Icon: WarehouseOutlinedIcon },
    { id: 'hang-con-no', path: '/hang-con-no', label: 'Hàng Còn Nợ', Icon: InventoryIcon },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      <CssBaseline />

      {/* Sidebar */}
      <Box sx={{
        width: isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        borderRight: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSidebarOpen ? 'stretch' : 'center',
        pt: 2,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}>
        <Box sx={{
          mb: 3,
          px: isSidebarOpen ? 3 : 0,
          width: '100%',
          display: 'flex',
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          alignItems: 'center'
        }}>
          {isSidebarOpen && (
            <Typography variant="overline" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
              MENU
            </Typography>
          )}
          <IconButton
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            sx={{
              width: 32, height: 32, borderRadius: '8px',
              border: '2px solid #cbd5e1', color: '#64748b',
              backgroundColor: 'transparent',
              '&:hover': { backgroundColor: '#f8fafc', borderColor: '#94a3b8', color: '#475569' }
            }}
          >
            {isSidebarOpen ? <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} /> : <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>

        <List sx={{ width: '100%', px: isSidebarOpen ? 2 : 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map((item) => {
            const isActive = item.id === activeItemId;
            const ItemIcon = item.Icon;
            return (
              <Tooltip key={item.id} title={isSidebarOpen ? '' : item.label} placement="right" arrow>
                <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'center' }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      width: isSidebarOpen ? '100%' : 48,
                      height: 48,
                      minWidth: isSidebarOpen ? 'auto' : 48,
                      maxWidth: isSidebarOpen ? 'none' : 48,
                      mx: 'auto',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      borderRadius: '14px',
                      backgroundColor: isActive ? '#1976d2' : 'transparent',
                      color: isActive ? '#ffffff' : '#64748b',
                      px: isSidebarOpen ? 2 : 0,
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      '&:hover': {
                        backgroundColor: isActive ? '#1565c0' : '#f8fafc',
                        color: isActive ? '#ffffff' : '#475569'
                      }
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: isSidebarOpen ? 40 : 48,
                      color: 'inherit',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'min-width 0.2s ease'
                    }}>
                      <ItemIcon sx={{ fontSize: 22 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        margin: 0,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: isSidebarOpen ? 'auto' : 0,
                        opacity: isSidebarOpen ? 1 : 0,
                        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-10px)',
                        paddingLeft: isSidebarOpen ? 1.5 : 0
                      }}
                      primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: '0.92rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ flexGrow: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/client-orders" replace />} />
            <Route path="/client-orders" element={<ClientOrders />} />
            <Route path="/entry-form" element={<EntryForm />} />
            <Route path="/phieu-xuat-kho" element={<StockReport />} />
            <Route path="/hang-con-no" element={<RemainingStock />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;