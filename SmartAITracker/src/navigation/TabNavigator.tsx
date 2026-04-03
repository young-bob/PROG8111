/**
 * Smart AI Tracker — Bottom Tab Navigator
 * Contains Dashboard, History, [+] Add, Analytics, Settings.
 */
import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {Home, List, Plus, PieChart, Settings} from 'lucide-react-native';
import {MainTabParamList} from '../types';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screen for the center "Add" tab (never actually shown)
const AddPlaceholder: React.FC = () => <View />;

const TabNavigator: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: '#6b7280',
        tabBarItemStyle: {
          top: 10,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({color, size}) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({color, size}) => <List color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="AddPlaceholder"
        component={AddPlaceholder}
        options={{
          tabBarButton: () => (
            <View style={{flex: 1, alignItems: 'center'}}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() =>
                  navigation.navigate('Detail', {
                    transaction: {title: '', amount: 0, type: 'Expense'},
                  })
                }>
                <Plus color="#fff" size={28} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({color, size}) => <PieChart color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f172a',
    borderTopWidth: 0,
    height: 60,
    borderRadius: 20,
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    elevation: 8,
    paddingHorizontal: 8,
    paddingBottom: 0,
    paddingTop: 0,
    alignItems: 'center',
  },
  addBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#10b981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    top: -24,
    elevation: 6,
    borderWidth: 4,
    borderColor: '#0f172a',
  },
});

export default TabNavigator;
