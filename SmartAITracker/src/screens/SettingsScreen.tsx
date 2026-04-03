/**
 * Smart AI Tracker — Settings Screen
 * App configuration with Switch components for toggles.
 */
import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Switch, StyleSheet, Alert} from 'react-native';
import {User, Bell, ShieldCheck, CircleHelp, ChevronRight, Cloud, Database, LogOut} from 'lucide-react-native';
import * as FirebaseService from '../services/FirebaseService';
import {useSyncEnabled} from '../contexts/SyncContext';

const SettingsScreen: React.FC = () => {
  // Switch states
  const {syncEnabled, setSyncEnabled} = useSyncEnabled();
  const [notifications, setNotifications] = useState(true);

  const settingsList = [
    {
       icon: LogOut, 
       label: 'Sign Out', 
       action: () => {
          Alert.alert('Sign Out', 'Are you sure you want to log out?', [
             {text: 'Cancel', style: 'cancel'},
             {text: 'Sign Out', style: 'destructive', onPress: () => FirebaseService.logoutUser()}
          ]);
       }
    },
    {icon: ShieldCheck, label: 'Security', action: () => Alert.alert('Security', 'Security settings coming soon.')},
    {icon: CircleHelp, label: 'Support Center', action: () => Alert.alert('Support', 'Contact: support@smartaitracker.com')},
  ];

  return (
    <View style={styles.container}>


      {/* Settings List */}
      <View style={styles.card}>
        {/* Notification Toggle — uses Switch component */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Bell color="#6b7280" size={18} />
            <Text style={styles.rowLabel}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{false: '#e5e7eb', true: '#a7f3d0'}}
            thumbColor={notifications ? '#059669' : '#9ca3af'}
          />
        </View>

        {settingsList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity key={idx} style={styles.row} onPress={item.action}>
              <View style={styles.rowLeft}>
                <Icon color="#6b7280" size={18} />
                <Text style={styles.rowLabel}>{item.label}</Text>
              </View>
              <ChevronRight color="#d1d5db" size={14} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Storage Engine Card */}
      <View style={styles.storageCard}>
        <Text style={styles.storageTitle}>STORAGE ENGINE</Text>

        <View style={styles.storageRow}>
          <Database color="#047857" size={14} />
          <Text style={styles.storageLabel}>SQLite: Local Active</Text>
        </View>

        <View style={styles.storageRow}>
          <Cloud color="#2563eb" size={14} />
          <Text style={[styles.storageLabel, {color: '#1e40af'}]}>
            Firebase: {syncEnabled ? 'Syncing' : 'Paused'}
          </Text>
        </View>

        {/* Firebase Sync Toggle — uses Switch component */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  header: {fontSize: 20, fontWeight: '900', color: '#1f2937', marginBottom: 20},
  card: {
    backgroundColor: '#fff', borderRadius: 28, borderWidth: 1,
    borderColor: '#f3f4f6', overflow: 'hidden', marginBottom: 20,
    elevation: 1,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#f9fafb',
  },
  rowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  rowLabel: {fontSize: 13, fontWeight: '700', color: '#374151'},
  storageCard: {
    backgroundColor: '#ecfdf5', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#a7f3d0',
  },
  storageTitle: {
    fontSize: 8, fontWeight: '900', color: '#059669',
    letterSpacing: 3, textAlign: 'center', marginBottom: 16,
  },
  storageRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 8, opacity: 0.7,
  },
  storageLabel: {fontSize: 12, fontWeight: '700', color: '#065f46'},
  syncRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#a7f3d0',
  },
  syncLabel: {fontSize: 12, fontWeight: '900', color: '#059669'},
});

export default SettingsScreen;
