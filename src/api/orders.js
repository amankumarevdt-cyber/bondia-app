import client from './client';

export const getOrders = () => client.get('/orders/json');
export const createOrder = (data) => client.post('/orders', data);
