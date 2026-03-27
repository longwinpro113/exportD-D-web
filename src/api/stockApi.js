import axiosClient from './axiosClient';

const stockApi = {
  // Fetch "Hàng Còn Nợ" data based on filter conditions (e.g. DD Long An)
  getRemaining: (params) => {
    const url = '/stock/remaining';
    return axiosClient.get(url, { params });
  },

  // Fetch "Phiếu Xuất Kho" stock shipment data
  getExports: (params) => {
    const url = '/stock/exports';
    return axiosClient.get(url, { params });
  },

  // Save the modified inline-edit values to backend
  updateStockCell: (stockId, payload) => {
    const url = `/stock/${stockId}`;
    return axiosClient.patch(url, payload); 
  },
  
  // Track total shipments or aggregates 
  // (e.g. from total '14617' displayed on the header)
  getSummary: (companyId) => {
    const url = `/stock/summary/${companyId}`;
    return axiosClient.get(url);
  }
};

export default stockApi;
