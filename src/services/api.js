import { buildApiUrl } from "../config/api";

const readErrorMessage = async (res, fallback) => {
    try {
        const err = await res.json();
        return err.error || fallback;
    } catch {
        return fallback;
    }
};

export const fetchOrders = async () => {
    const res = await fetch(buildApiUrl("/api/orders"));
    if (!res.ok) throw new Error('Kết nối thất bại!');
    return res.json();
};

export const fetchClients = async () => {
    const res = await fetch(buildApiUrl("/api/orders/clients"));
    if (!res.ok) throw new Error('Thất bại khi lấy danh sách khách hàng!');
    return res.json();
};

export const fetchOrderExports = async (ryNumber) => {
    const res = await fetch(buildApiUrl(`/api/history-export?ry_number=${encodeURIComponent(ryNumber)}`));
    if (!res.ok) throw new Error('Kết nối thất bại!');
    return res.json();
};

export const fetchRemainingStock = async (searchParams) => {
    let url = buildApiUrl("/api/remaining-stock?");
    if (searchParams) {
        url += new URLSearchParams(searchParams).toString();
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Kết nối thất bại!');
    return res.json();
};

export const fetchStockReport = async (searchParams) => {
    let url = buildApiUrl("/api/history-export?");
    if (searchParams) {
        url += new URLSearchParams(searchParams).toString();
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Kết nối thất bại!');
    return res.json();
};

export const createOrder = async (payload) => {
    const res = await fetch(buildApiUrl("/api/orders"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Lưu đơn hàng thất bại.'));
    }
    return res.json();
};

export const exportOrder = async (payload) => {
    const res = await fetch(buildApiUrl("/api/history-export"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Lưu báo cáo xuất hàng thất bại.'));
    }
    return res.json();
};
