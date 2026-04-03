/**
 * Smart AI Tracker — Main Application Entry Point
 * Initializes the database and sets up the navigation container.
 */
import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import * as DatabaseService from './src/services/DatabaseService';
import {SyncProvider} from './src/contexts/SyncContext';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // Initialize SQLite database and create tables (synchronous with JSI)
      DatabaseService.initDatabase();
      setIsReady(true);
    } catch (err) {
      console.error('App initialization error:', err);
      setError('Failed to initialize database.');
    }
  };

  // Loading screen while database initializes
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Initializing Smart AI Tracker...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SyncProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SyncProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1},
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default App;
