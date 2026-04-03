/**
 * Smart AI Tracker — History Screen
 * Displays all transactions using FlatList (assignment requirement).
 */
import React, {useCallback, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {Transaction} from '../types';
import * as DatabaseService from '../services/DatabaseService';
import * as FirebaseService from '../services/FirebaseService';

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<Transaction[]>([]);

  const currentUser = FirebaseService.getCurrentUser();
  const userId = currentUser?.uid || 'unknown';

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const transactions = await DatabaseService.getTransactions(userId);
      setRecords(transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  // FlatList renderItem — meets the FlatList assignment requirement
  const renderItem = ({item}: {item: Transaction}) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('Detail', {transaction: item})}>
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.icon,
            {backgroundColor: item.type === 'Income' ? '#ecfdf5' : '#fff1f2'},
          ]}>
          <Text
            style={[
              styles.iconText,
              {color: item.type === 'Income' ? '#059669' : '#e11d48'},
            ]}>
            {item.category ? item.category[0] : 'U'}
          </Text>
        </View>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.category} • {item.date}
            {item.source !== 'manual' ? ` • ${item.source.toUpperCase()}` : ''}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          {color: item.type === 'Income' ? '#10b981' : '#1f2937'},
        ]}>
        {item.type === 'Income' ? '+' : '-'} ${item.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <FlatList
        data={records}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions recorded yet.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    fontSize: 20, fontWeight: '900', color: '#1f2937',
    padding: 20, paddingBottom: 12,
  },
  listContent: {paddingHorizontal: 20, paddingBottom: 100},
  row: {
    backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#f9fafb', elevation: 1,
  },
  rowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  icon: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: {fontSize: 18, fontWeight: '900'},
  title: {fontSize: 14, fontWeight: '700', color: '#1f2937'},
  meta: {fontSize: 9, fontWeight: '700', color: '#9ca3af', marginTop: 2, letterSpacing: 1},
  amount: {fontSize: 14, fontWeight: '900'},
  emptyState: {padding: 40, alignItems: 'center'},
  emptyText: {fontSize: 13, color: '#9ca3af', fontWeight: '600'},
});

export default HistoryScreen;
