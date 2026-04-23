import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';

const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: 'login',
      Dashboard: 'dashboard',
      Parties: {
        path: 'parties',
        screens: {
          PartyList: '',
          PartyForm: 'form',
        },
      },
      Items: {
        path: 'items',
        screens: {
          ItemList: '',
          ItemForm: 'form',
        },
      },
      Orders: {
        path: 'orders',
        screens: {
          OrderList: '',
          OrderCreate: 'new',
          OrderDetail: ':id',
        },
      },
    },
  },
};

export default function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      {isLoggedIn ? <DrawerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
