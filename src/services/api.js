const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/api/orders`);
    if (!res.ok) throw new Error('Kết nối thất bại!');
    return res.json();
};

export const fetchOrderExports = async (ryNumber) => {
    const res = await fetch(`${API_URL}/api/export?ry_number=${encodeURIComponent(ryNumber)}`);
    if (!res.ok) throw new Error('Kết nối thất bại!');
    return res.json();
};

export const fetchRemainingStock = async (searchParams) => {
    let url = `${API_URL}/api/remaining-stock?`;
    if (searchParams) {
        url += new URLSearchParams(searchParams).toString();
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Kết nối thất bại!');
    return res.json();
};

export const fetchStockReport = async (searchParams) => {
    let url = `${API_URL}/api/export?`;
    if (searchParams) {
        url += new URLSearchParams(searchParams).toString();
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Kết nối thất bại!');
    return res.json();
};

export const saveOrder = async (payload) => {
    const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Save failed');
    return res.json();
};

export const exportOrder = async (payload) => {
    const res = await fetch(`${API_URL}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Export failed');
    }
    return res.json();
};
