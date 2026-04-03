/**
 * Smart AI Tracker — Drawer Navigator
 * Side menu navigation wrapping the Tab navigator.
 */
import React from 'react';
import {View, Text, TouchableOpacity, Switch, StyleSheet, Image} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {
  Smartphone,
  Database,
  Cloud,
  Home,
  List,
  PieChart,
  Settings,
  Menu,
} from 'lucide-react-native';
import {RootDrawerParamList} from '../types';
import TabNavigator from './TabNavigator';
import HistoryScreen from '../screens/HistoryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useSyncEnabled} from '../contexts/SyncContext';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

// Custom drawer content with brand header and storage status
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const currentRoute = props.state.routes[props.state.index];
  const activeRouteName = getFocusedRouteNameFromRoute(currentRoute) ?? 'Dashboard';
  const {syncEnabled, setSyncEnabled} = useSyncEnabled();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      {/* Brand Header */}
      <View style={styles.brandRow}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={{width: 48, height: 48, borderRadius: 16}} 
        />
        <View>
          <Text style={styles.brandTitle}>Smart AI Tracker</Text>
          <Text style={styles.brandSub}>GROUP PROJECT W26</Text>
        </View>
      </View>

      {/* Navigation Items mapping to TabNavigator */}
      <View style={{marginTop: 10}}>
        <DrawerItem
          label="Dashboard"
          icon={({color, size}) => <Home color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          focused={activeRouteName === 'Dashboard'}
          activeTintColor="#fff"
          activeBackgroundColor="#0f172a"
          inactiveTintColor="#9ca3af"
          onPress={() => props.navigation.navigate('MainTabs', {screen: 'Dashboard'})}
        />
        <DrawerItem
          label="History"
          icon={({color, size}) => <List color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          focused={activeRouteName === 'History'}
          activeTintColor="#fff"
          activeBackgroundColor="#0f172a"
          inactiveTintColor="#9ca3af"
          onPress={() => props.navigation.navigate('MainTabs', {screen: 'History'})}
        />
        <DrawerItem
          label="Analytics"
          icon={({color, size}) => <PieChart color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          focused={activeRouteName === 'Analytics'}
          activeTintColor="#fff"
          activeBackgroundColor="#0f172a"
          inactiveTintColor="#9ca3af"
          onPress={() => props.navigation.navigate('MainTabs', {screen: 'Analytics'})}
        />
        <DrawerItem
          label="Settings"
          icon={({color, size}) => <Settings color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          focused={activeRouteName === 'Settings'}
          activeTintColor="#fff"
          activeBackgroundColor="#0f172a"
          inactiveTintColor="#9ca3af"
          onPress={() => props.navigation.navigate('MainTabs', {screen: 'Settings'})}
        />
      </View>

      {/* Storage Engine Card */}
      <View style={styles.storageCard}>
        <Text style={styles.storageTitle}>STORAGE ENGINE</Text>
        <View style={styles.storageRow}>
          <Database color="#047857" size={12} />
          <Text style={styles.storageLabel}>SQLite: Local Active</Text>
        </View>
        <View style={styles.storageRow}>
          <Cloud color="#2563eb" size={12} />
          <Text style={[styles.storageLabel, {color: '#1e40af'}]}>
            Firebase: {syncEnabled ? 'Syncing' : 'Paused'}
          </Text>
        </View>
        <View style={styles.syncRow}>
          <Text style={styles.syncLabel}>Cloud Sync</Text>
          <Switch
            value={syncEnabled}
            onValueChange={setSyncEnabled}
            trackColor={{false: '#e5e7eb', true: '#93c5fd'}}
            thumbColor={syncEnabled ? '#2563eb' : '#9ca3af'}
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const TAB_TITLES: Record<string, string> = {
  Dashboard: 'DASHBOARD',
  History: 'HISTORY',
  Analytics: 'ANALYTICS',
  Settings: 'APP CONFIG',
};

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({navigation, route}) => ({
        headerShown: true,
        headerTitle: TAB_TITLES[getFocusedRouteNameFromRoute(route) ?? 'Dashboard'] || 'DASHBOARD',
        headerTitleStyle: {fontSize: 18, fontWeight: '900', color: '#1f2937'},
        headerStyle: {backgroundColor: '#fff', elevation: 0, shadowOpacity: 0},
        headerLeft: () => (
          <TouchableOpacity
            style={drawerStyles.menuBtn}
            onPress={() => navigation.toggleDrawer()}>
            <Menu color="#1f2937" size={22} />
          </TouchableOpacity>
        ),
        drawerStyle: styles.drawer,
        drawerActiveBackgroundColor: '#0f172a',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#9ca3af',
        drawerLabelStyle: styles.drawerLabel,
      })}>
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          drawerItemStyle: {display: 'none'},
        }}
      />
    </Drawer.Navigator>
  );
};

const drawerStyles = StyleSheet.create({
  menuBtn: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#f3f4f6', marginLeft: 12},
});

const styles = StyleSheet.create({
  drawer: {width: 280, backgroundColor: '#fff'},
  drawerContent: {flex: 1, paddingTop: 20},
  drawerLabel: {
    fontSize: 11, fontWeight: '900', letterSpacing: 3,
  },
  brandRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 24, marginBottom: 12,
  },
  brandIcon: {
    width: 48, height: 48, backgroundColor: '#059669', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  brandTitle: {fontSize: 16, fontWeight: '900', color: '#1f2937'},
  brandSub: {fontSize: 7, fontWeight: '700', color: '#9ca3af', letterSpacing: 3, marginTop: 2},
  storageCard: {
    backgroundColor: '#ecfdf5', borderRadius: 20, padding: 20,
    marginHorizontal: 16, marginTop: 'auto', marginBottom: 24,
    borderWidth: 1, borderColor: '#a7f3d0',
  },
  storageTitle: {
    fontSize: 8, fontWeight: '900', color: '#059669',
    letterSpacing: 3, textAlign: 'center', marginBottom: 12,
  },
  storageRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 6, opacity: 0.7,
  },
  storageLabel: {fontSize: 11, fontWeight: '700', color: '#065f46'},
  syncRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#a7f3d0',
  },
  syncLabel: {fontSize: 11, fontWeight: '900', color: '#059669'},
});

export default DrawerNavigator;
