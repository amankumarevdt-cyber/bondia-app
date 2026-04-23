import client from './client';
import { getEndpointPath } from '../constants/config';

// Mobile API (token-based) endpoints per Head Ma'am instructions are under /api/*
// To support inconsistent backends, you can override these in `ENDPOINT_OVERRIDES`.
export const getParties = () => client.get(getEndpointPath('parties'));
export const createParty = (data) => client.post(getEndpointPath('parties'), data);
export const updateParty = (id, data) =>
  client.put(`${getEndpointPath('parties')}/${id}`, data);
export const deleteParty = (id) =>
  client.delete(`${getEndpointPath('parties')}/${id}`);
