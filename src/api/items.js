import client from './client';
import { getEndpointPath } from '../constants/config';

export const getItems = () => client.get(getEndpointPath('items'));
export const createItem = (data) => client.post(getEndpointPath('items'), data);
export const updateItem = (id, data) =>
  client.put(`${getEndpointPath('items')}/${id}`, data);
export const deleteItem = (id) =>
  client.delete(`${getEndpointPath('items')}/${id}`);
