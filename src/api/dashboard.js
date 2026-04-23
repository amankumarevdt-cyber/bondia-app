import client from './client';
import { getEndpointPath } from '../constants/config';

export const getDashboard = () => client.get(getEndpointPath('dashboard'));
