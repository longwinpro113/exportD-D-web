import axiosClient from './axiosClient';

const ordersApi = {
  getAll: (params) => axiosClient.get('/orders', { params }),
  getById: (id) => axiosClient.get(`/orders/${id}`),
  add: (data) => axiosClient.post('/orders', data),
  update: (id, data) => axiosClient.patch(`/orders/${id}`, data),
  remove: (id) => axiosClient.delete(`/orders/${id}`),
};

export default ordersApi;
