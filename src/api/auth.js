import client from './client';

export const loginApi = (mobile, password) =>
  client.post('/login', { mobile, password });
