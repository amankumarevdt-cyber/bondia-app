import client from './client';

export const getParties = () => client.get('/parties/json');
export const createParty = (data) => client.post('/parties/store', data);
export const updateParty = (id, data) => client.post(`/parties/update/${id}`, data);
export const deleteParty = (id) => client.post(`/parties/delete/${id}`);
