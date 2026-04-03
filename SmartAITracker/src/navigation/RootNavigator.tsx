/**
 * Smart AI Tracker — Root Navigator
 * Stack navigator wrapping Drawer, with Detail screen pushed on top.
 */
import React, {useState, useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {View, ActivityIndicator} from 'react-native';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {RootStackParamList} from '../types';
import * as FirebaseService from '../services/FirebaseService';
import * as DatabaseService from '../services/DatabaseService';
import DrawerNavigator from './DrawerNavigator';
import DetailScreen from '../screens/DetailScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const subscriber = FirebaseService.onAuthStateChanged(async authUser => {
      setUser(authUser);

      // When user logs in, sync cloud data to local DB if local is empty
      if (authUser) {
        try {
          const localRecords = DatabaseService.getTransactions(authUser.uid);
          if (localRecords.length === 0) {
            console.log('Local DB empty, syncing from cloud...');
            const cloudRecords = await FirebaseService.fetchTransactionsFromCloud(authUser.uid);
            if (cloudRecords.length > 0) {
              DatabaseService.bulkInsertTransactions(cloudRecords);
              console.log(`Synced ${cloudRecords.length} records from cloud.`);
            }
          }
          // Ensure user exists in local DB
          DatabaseService.ensureUserExists(
            authUser.uid,
            authUser.email || '',
            authUser.displayName || '',
          );
        } catch (err) {
          console.error('Cloud sync error:', err);
        }
      }

      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a'}}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
