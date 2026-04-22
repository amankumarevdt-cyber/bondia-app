import client from './client';

export const getItems = () => client.get('/items/json');
export const createItem = (data) => client.post('/items/store', data);
export const updateItem = (id, data) => client.put(`/items/update/${id}`, data);
