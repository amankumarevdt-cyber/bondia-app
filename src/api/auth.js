import client from './client';
import { getEndpointPath } from '../constants/config';

export const loginApi = async (mobile, password) => {
  const url = getEndpointPath('login');
  return client.post(
    url,
    { mobile, password },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );
};

export const logoutApi = async () => {
  const url = getEndpointPath('logout');
  // Some backends expect POST; using POST is safest for token invalidation.
  return client.post(
    url,
    {},
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );
};
