import client from './client';
import { getEndpointPath } from '../constants/config';

export const getOrders = () => client.get(getEndpointPath('orders'));
export const createOrder = (data) => client.post(getEndpointPath('orders'), data);
