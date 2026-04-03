/**
 * Smart AI Tracker — Detail Screen
 * Add or edit a transaction entry with category selection.
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {ChevronLeft, Save, Trash2} from 'lucide-react-native';
import {RootStackParamList, TransactionType, CategoryName} from '../types';
import {EXPENSE_CATEGORIES, INCOME_CATEGORIES} from '../constants/categories';
import * as DatabaseService from '../services/DatabaseService';
import * as FirebaseService from '../services/FirebaseService';
import {useSyncEnabled} from '../contexts/SyncContext';

type DetailRoute = RouteProp<RootStackParamList, 'Detail'>;

const DetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<DetailRoute>();
  const existing = route.params?.transaction;

  const [type, setType] = useState<TransactionType>(existing?.type || 'Expense');
  const [title, setTitle] = useState(existing?.title || '');
  const [amount, setAmount] = useState(existing?.amount?.toString() || '');
  const [category, setCategory] = useState<CategoryName>(
    existing?.category || (type === 'Expense' ? 'Food' : 'Salary'),
  );

  const currentUser = FirebaseService.getCurrentUser();
  const userId = currentUser?.uid || 'unknown';
  const categories = type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isEditing = existing?.id !== undefined;
  const {syncEnabled} = useSyncEnabled();

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a description.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const source = (existing as any)?.source || 'manual';

      let savedTransaction;

      if (isEditing && existing?.id) {
        // Update existing transaction
        DatabaseService.updateTransaction(
          existing.id,
          title.trim(),
          parsedAmount,
          category,
          type,
          existing.date || today,
          existing.note || '',
          source,
        );
        savedTransaction = {
          ...existing,
          title: title.trim(),
          amount: parsedAmount,
          category,
          type,
          source,
          isSynced: false,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Insert new transaction
        savedTransaction = DatabaseService.insertTransaction(
          userId,
          title.trim(),
          parsedAmount,
          category,
          type,
          today,
          '',
          source,
        );
      }

      // Trigger Cloud Sync if enabled
      if (currentUser?.uid && syncEnabled) {
        FirebaseService.pushTransactionToCloud(currentUser.uid, savedTransaction as any).catch(err => {
          console.error('Failed to sync to Firebase in background:', err);
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      Alert.alert('Error', 'Failed to save transaction.');
    }
  };

  const handleDelete = async () => {
    if (isEditing && existing?.id) {
      try {
        // Delete locally
        DatabaseService.deleteTransaction(existing.id);

        // Delete from cloud if sync enabled
        if (currentUser?.uid && syncEnabled) {
          FirebaseService.deleteTransactionFromCloud(currentUser.uid, existing.id).catch(err => {
            console.error('Failed to delete from cloud:', err);
          });
        }

        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'Failed to delete transaction.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ENTRY DETAILS</Text>
        {isEditing ? (
          <TouchableOpacity style={styles.headerBtn} onPress={handleDelete}>
            <Trash2 color="#e11d48" size={20} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Income / Expense Toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'Expense' && styles.toggleActive]}
            onPress={() => {
              setType('Expense');
              setCategory('Food');
            }}>
            <Text
              style={[
                styles.toggleText,
                {color: type === 'Expense' ? '#e11d48' : '#9ca3af'},
              ]}>
              EXPENSE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'Income' && styles.toggleActive]}
            onPress={() => {
              setType('Income');
              setCategory('Salary');
            }}>
            <Text
              style={[
                styles.toggleText,
                {color: type === 'Income' ? '#059669' : '#9ca3af'},
              ]}>
              INCOME
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>ENTER AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text
              style={[
                styles.dollarSign,
                {color: type === 'Income' ? '#10b981' : '#e11d48'},
              ]}>
              $
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#d1d5db"
            />
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>AI TAG / DESCRIPTION</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Starbucks"
            placeholderTextColor="#d1d5db"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  category === cat && {
                    backgroundColor: type === 'Income' ? '#059669' : '#e11d48',
                  },
                ]}
                onPress={() => setCategory(cat)}>
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && {color: '#fff'},
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {backgroundColor: type === 'Income' ? '#059669' : '#e11d48'},
          ]}
          onPress={handleSave}>
          <Save color="#fff" size={20} />
          <Text style={styles.saveBtnText}>CONFIRM {type.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#f9fafb',
  },
  headerBtn: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {fontSize: 11, fontWeight: '900', letterSpacing: 3, color: '#1f2937'},
  form: {flex: 1},
  formContent: {padding: 24, gap: 32},
  toggle: {
    flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 20,
    padding: 6, height: 52,
  },
  toggleBtn: {flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  toggleActive: {backgroundColor: '#fff', elevation: 1},
  toggleText: {fontSize: 9, fontWeight: '900', letterSpacing: 3},
  amountSection: {alignItems: 'center', gap: 8},
  amountLabel: {fontSize: 8, fontWeight: '900', color: '#d1d5db', letterSpacing: 4},
  amountRow: {flexDirection: 'row', alignItems: 'baseline', gap: 4},
  dollarSign: {fontSize: 24, fontWeight: '900'},
  amountInput: {
    fontSize: 48, fontWeight: '900', color: '#1f2937', textAlign: 'center',
    minWidth: 160, borderBottomWidth: 3, borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  fieldSection: {gap: 12},
  fieldLabel: {
    fontSize: 8, fontWeight: '900', color: '#9ca3af',
    letterSpacing: 3, textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#f9fafb', padding: 20, borderRadius: 20,
    fontWeight: '700', fontSize: 14, color: '#1f2937',
  },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center',
  },
  categoryBtn: {
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16,
    backgroundColor: '#f9fafb', minWidth: '28%', alignItems: 'center',
  },
  categoryText: {fontSize: 9, fontWeight: '900', color: '#9ca3af', letterSpacing: 1},
  footer: {
    padding: 20, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: '#f9fafb',
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingVertical: 20, borderRadius: 28,
    elevation: 4,
  },
  saveBtnText: {fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 3},
});

export default DetailScreen;
