/**
 * Smart AI Tracker — Dashboard Screen (Home)
 * Displays brand, balance summary, AI quick actions, and recent activity.
 */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  PermissionsAndroid,
  Platform,
  Image,
} from 'react-native';
import { launchCamera, launchImageLibrary, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker';
import {useNavigation, useFocusEffect, DrawerActions} from '@react-navigation/native';
import {Mic, ScanText, TrendingUp, TrendingDown, Smartphone, Type, Menu} from 'lucide-react-native';
import {Transaction} from '../types';
import * as DatabaseService from '../services/DatabaseService';
import * as AIService from '../services/AIService';
import * as FirebaseService from '../services/FirebaseService';
import {useSyncEnabled} from '../contexts/SyncContext';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const {syncEnabled} = useSyncEnabled();

  const currentUser = FirebaseService.getCurrentUser();
  const userId = currentUser?.uid || 'unknown';

  // Reload data every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  // Real-time sync: listen for changes from other devices (only if sync enabled)
  useEffect(() => {
    if (!currentUser?.uid || !syncEnabled) return;

    const unsubscribe = FirebaseService.onTransactionsChanged(
      currentUser.uid,
      cloudTransactions => {
        DatabaseService.syncFromCloud(currentUser.uid, cloudTransactions);
        loadData();
      },
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid, syncEnabled]);

  const loadData = () => {
    try {
      const transactions = DatabaseService.getTransactions(userId);
      setRecords(transactions);
      const summary = DatabaseService.getBalanceSummary(userId);
      setTotalIncome(summary.totalIncome);
      setTotalExpense(summary.totalExpense);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // AI Voice Record handler
  const handleVoiceRecord = async () => {
    try {
      // Request microphone permission first
      const hasPermission = await AIService.requestVoicePermissions();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Microphone permission is required for voice recognition.');
        return;
      }

      setIsProcessing(true);
      setProcessingText('Listening... Speak now.');

      const transcribedText = await AIService.startVoiceRecognition();

      if (!transcribedText || transcribedText.trim().length === 0) {
        setIsProcessing(false);
        Alert.alert('No Speech Detected', 'Please try again and speak clearly.');
        return;
      }

      setProcessingText('AI is analyzing your input...');
      const result = await AIService.parseTransactionText(transcribedText, userId);
      setIsProcessing(false);

      if (result.success) {
        navigation.navigate('Detail', {
          transaction: {
            title: result.data.title,
            amount: result.data.amount,
            category: result.data.category,
            type: result.data.type,
            source: 'voice',
          },
        });
      } else {
        Alert.alert('AI Parse Failed', result.error || 'Could not parse the voice input.');
      }
    } catch (error: any) {
      setIsProcessing(false);
      Alert.alert('Voice Error', error?.message || 'Voice recognition failed. Please try again.');
    }
  };

  // AI Text Input handler
  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      Alert.alert('Empty Input', 'Please type a transaction description.');
      return;
    }
    setShowTextModal(false);
    setIsProcessing(true);
    setProcessingText('AI is analyzing your text...');
    try {
      const result = await AIService.parseTransactionText(textInput.trim(), userId);
      setIsProcessing(false);
      setTextInput('');
      if (result.success) {
        navigation.navigate('Detail', {
          transaction: {
            title: result.data.title,
            amount: result.data.amount,
            category: result.data.category,
            type: result.data.type,
            source: 'ai_text',
          },
        });
      } else {
        Alert.alert('AI Parse Failed', result.error || 'Could not parse the text.');
      }
    } catch (error: any) {
      setIsProcessing(false);
      setTextInput('');
      Alert.alert('Error', error?.message || 'Failed to process text.');
    }
  };

  // State to show loading status during AI parsing
  const [isAiScanning, setIsAiScanning] = useState(false);

  // Real AI Receipt Scan handler
  const handleReceiptScan = () => {
    Alert.alert(
      'Scan Receipt',
      'Choose a method to scan your receipt:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Camera',
          onPress: async () => {
            // Request camera permission at runtime (Android 6+)
            if (Platform.OS === 'android') {
              const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                  title: 'Camera Permission',
                  message: 'Smart AI Tracker needs camera access to scan receipts.',
                  buttonPositive: 'Allow',
                  buttonNegative: 'Deny',
                },
              );
              if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Permission Denied', 'Camera permission is required to scan receipts.');
                return;
              }
            }
            const options: CameraOptions = { mediaType: 'photo', includeBase64: true, quality: 0.8, maxWidth: 1024, maxHeight: 1024 };
            const result = await launchCamera(options);
            processImageResult(result);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
             const options: ImageLibraryOptions = { mediaType: 'photo', includeBase64: true, quality: 0.8, maxWidth: 1024, maxHeight: 1024 };
             const result = await launchImageLibrary(options);
             processImageResult(result);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const processImageResult = async (result: any) => {
    if (result.didCancel || !result.assets || result.assets.length === 0) return;
    const base64 = result.assets[0].base64;
    if (!base64) {
      Alert.alert('Error', 'Failed to acquire image pixel data.');
      return;
    }

    setIsAiScanning(true);
    try {
       const user = FirebaseService.getCurrentUser();
       const parsedResult = await AIService.parseReceiptImage(base64, user?.uid || 'demo_user');
       
       if (parsedResult.success && parsedResult.data) {
          navigation.navigate('Detail', {
            transaction: {
              title: parsedResult.data.title,
              amount: parsedResult.data.amount,
              category: parsedResult.data.category,
              type: parsedResult.data.type,
              source: 'ai_scan',
            },
          });
       } else {
          Alert.alert('AI Parsing Failed', parsedResult.error || 'Could not understand the receipt image.');
       }
    } catch (error: any) {
       Alert.alert('Network Error', error.message);
    } finally {
       setIsAiScanning(false);
    }
  };

  const balance = totalIncome - totalExpense;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Brand Header */}
      <View style={styles.brandRow}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={{width: 48, height: 48, borderRadius: 16}} 
        />
        <View>
          <Text style={styles.brandTitle}>Smart AI Tracker</Text>
          <Text style={styles.brandSub}>NEXT-GEN AI POWERED</Text>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
        <Text style={styles.balanceAmount}>
          $ {balance.toLocaleString('en-US', {minimumFractionDigits: 2})}
        </Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceCol}>
            <View style={styles.balanceIconRow}>
              <TrendingUp color="#34d399" size={14} />
              <Text style={styles.balanceColLabel}>INCOME</Text>
            </View>
            <Text style={styles.incomeText}>
              +${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 0})}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.balanceCol}>
            <View style={styles.balanceIconRow}>
              <TrendingDown color="#fb7185" size={14} />
              <Text style={styles.balanceColLabel}>EXPENSE</Text>
            </View>
            <Text style={styles.expenseText}>
              -${totalExpense.toLocaleString('en-US', {minimumFractionDigits: 0})}
            </Text>
          </View>
        </View>
      </View>

      {/* AI Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleReceiptScan}>
          <View style={[styles.actionIcon, {backgroundColor: '#ecfdf5'}]}>
            <ScanText color="#059669" size={24} />
          </View>
          <Text style={styles.actionLabel}>AI RECEIPT{'\n'}SCAN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleVoiceRecord}>
          <View style={[styles.actionIcon, {backgroundColor: '#eff6ff'}]}>
            <Mic color="#2563eb" size={24} />
          </View>
          <Text style={styles.actionLabel}>AI VOICE{'\n'}RECORD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTextModal(true)}>
          <View style={[styles.actionIcon, {backgroundColor: '#fef3c7'}]}>
            <Type color="#d97706" size={24} />
          </View>
          <Text style={styles.actionLabel}>AI TEXT{'\n'}INPUT</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text style={styles.viewAll}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions yet. Tap + to add one!</Text>
        </View>
      ) : (
        records.slice(0, 3).map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.transactionRow}
            onPress={() => navigation.navigate('Detail', {transaction: item})}>
            <View style={styles.txLeft}>
              <View
                style={[
                  styles.txIcon,
                  {backgroundColor: item.type === 'Income' ? '#ecfdf5' : '#fff1f2'},
                ]}>
                <Text
                  style={[
                    styles.txIconText,
                    {color: item.type === 'Income' ? '#059669' : '#e11d48'},
                  ]}>
                  {item.category ? item.category[0] : 'U'}
                </Text>
              </View>
              <View>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txMeta}>
                  {item.category} • {item.date}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.txAmount,
                {color: item.type === 'Income' ? '#10b981' : '#1f2937'},
              ]}>
              {item.type === 'Income' ? '+' : '-'} ${item.amount.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {/* AI Processing Modal */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.modalTitle}>AI PROCESSING</Text>
            <Text style={styles.modalText}>{processingText}</Text>
            <TouchableOpacity
              style={styles.voiceCancelBtn}
              onPress={async () => {
                await AIService.stopVoiceRecognition();
                setIsProcessing(false);
              }}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* AI Text Input Modal */}
      <Modal visible={showTextModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.textModalContent}>
            <Text style={styles.modalTitle}>AI TEXT INPUT</Text>
            <Text style={styles.modalText}>Describe your transaction in natural language</Text>
            <TextInput
              style={styles.textInputField}
              placeholder='e.g. "Spent 15 dollars on coffee"'
              placeholderTextColor="#6b7280"
              value={textInput}
              onChangeText={setTextInput}
              multiline
              autoFocus
            />
            <View style={styles.textModalBtns}>
              <TouchableOpacity
                style={styles.textCancelBtn}
                onPress={() => { setShowTextModal(false); setTextInput(''); }}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleTextSubmit}>
                <Text style={styles.submitBtnText}>ANALYZE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 20, paddingBottom: 100},
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20},
  menuBtn: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#f3f4f6'},
  brandIcon: {
    width: 48, height: 48, backgroundColor: '#059669', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  brandTitle: {fontSize: 20, fontWeight: '900', color: '#059669'},
  brandSub: {fontSize: 9, fontWeight: '700', color: '#9ca3af', letterSpacing: 3, marginTop: 2},
  balanceCard: {
    backgroundColor: '#0f172a', borderRadius: 28, padding: 28,
    marginBottom: 20, overflow: 'hidden',
  },
  balanceLabel: {fontSize: 9, fontWeight: '900', color: '#10b981', letterSpacing: 3, marginBottom: 8},
  balanceAmount: {fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 24},
  balanceRow: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 20, gap: 24,
  },
  balanceCol: {flex: 1},
  balanceIconRow: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4},
  balanceColLabel: {fontSize: 9, fontWeight: '700', color: '#6b7280'},
  incomeText: {fontSize: 18, fontWeight: '900', color: '#34d399'},
  expenseText: {fontSize: 18, fontWeight: '900', color: '#fb7185'},
  divider: {width: 1, backgroundColor: 'rgba(255,255,255,0.1)', height: 40, alignSelf: 'center'},
  quickActions: {flexDirection: 'row', gap: 10, marginBottom: 24},
  actionBtn: {
    flex: 1, backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 8, borderRadius: 24,
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#f3f4f6',
    elevation: 1,
  },
  actionIcon: {width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  actionLabel: {fontSize: 8, fontWeight: '900', color: '#4b5563', textAlign: 'center', letterSpacing: 1},
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16,
  },
  sectionTitle: {fontSize: 16, fontWeight: '900', color: '#1f2937'},
  viewAll: {fontSize: 9, fontWeight: '900', color: '#059669', letterSpacing: 2},
  emptyState: {
    padding: 40, backgroundColor: '#f9fafb', borderRadius: 20,
    alignItems: 'center',
  },
  emptyText: {fontSize: 13, color: '#9ca3af', fontWeight: '600'},
  transactionRow: {
    backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#f9fafb', elevation: 1,
  },
  txLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  txIcon: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  txIconText: {fontSize: 18, fontWeight: '900'},
  txTitle: {fontSize: 14, fontWeight: '700', color: '#1f2937'},
  txMeta: {fontSize: 9, fontWeight: '700', color: '#9ca3af', marginTop: 2, letterSpacing: 1},
  txAmount: {fontSize: 14, fontWeight: '900'},
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(2,6,23,0.95)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalContent: {alignItems: 'center', padding: 40},
  modalTitle: {
    fontSize: 24, fontWeight: '900', color: '#fff',
    marginTop: 24, letterSpacing: 2,
  },
  modalText: {fontSize: 13, color: '#9ca3af', fontWeight: '600', marginTop: 12, textAlign: 'center'},
  voiceCancelBtn: {
    marginTop: 28, paddingHorizontal: 40, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center',
  },
  textCancelBtn: {
    flex: 1, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center',
  },
  cancelBtnText: {fontSize: 12, fontWeight: '900', color: '#ef4444', letterSpacing: 2},
  textModalContent: {
    backgroundColor: '#1e293b', borderRadius: 28, padding: 28,
    marginHorizontal: 20, width: '90%', maxWidth: 400,
  },
  textInputField: {
    backgroundColor: '#0f172a', borderRadius: 16, padding: 16,
    color: '#fff', fontSize: 15, marginTop: 20, minHeight: 80,
    textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155',
  },
  textModalBtns: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12,
  },
  submitBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: '#059669',
    borderRadius: 20, alignItems: 'center',
  },
  submitBtnText: {fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 2},
});

export default DashboardScreen;
