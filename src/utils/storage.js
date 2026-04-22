import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export const saveToken = (token) =>
  AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);

export const getToken = () => AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

export const saveUser = (user) =>
  AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

export const getUser = async () => {
  const str = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  return str ? JSON.parse(str) : null;
};

export const clearAll = () =>
  AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
