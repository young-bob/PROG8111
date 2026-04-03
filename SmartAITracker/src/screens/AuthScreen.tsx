/**
 * Smart AI Tracker — Authentication Screen
 * Secure user login and registration powered by Firebase Auth.
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import {Smartphone, Mail, Lock, Eye, EyeOff} from 'lucide-react-native';
import * as FirebaseService from '../services/FirebaseService';
import * as DatabaseService from '../services/DatabaseService';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Sign In
        const user = await FirebaseService.loginUser(email.trim(), password);
        
        // When logged in, fetch cloud data and populate local database immediately.
        // Doing this before rendering prevents racing conditions in the Dashboard.
        const cloudData = await FirebaseService.fetchTransactionsFromCloud(user.uid);
        if (cloudData.length > 0) {
          DatabaseService.bulkInsertTransactions(cloudData);
        }
      } else {
        // Sign Up
        const user = await FirebaseService.registerUser(email.trim(), password);
        // Save initial profile
        await FirebaseService.saveUserProfile(user.uid, user.email || '', 'New User');
        // Ensure user is created in local SQLite immediately
        DatabaseService.ensureUserExists(user.uid, user.email || '', 'New User');
      }
      // Note: We do not manually navigate away because RootNavigator's onAuthStateChanged 
      // will proactively swap the screen from Auth to DrawerRoot automatically!
    } catch (error: any) {
      console.error('Authentication Error:', error);
      Alert.alert(
        'Authentication Failed',
        error.message || 'Check your credentials and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.content}>
        {/* Logo / Branding */}
        <View style={styles.brandContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={{width: 80, height: 80, marginBottom: 16}} 
          />
          <Text style={styles.brandTitle}>Smart AI Tracker</Text>
          <Text style={styles.brandSub}>SECURE CLOUD PLATFORM</Text>
        </View>

        {/* Input Form */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputRow}>
              <Mail color="#9ca3af" size={20} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#d1d5db"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <Lock color="#9ca3af" size={20} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#d1d5db"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color="#9ca3af" size={20} />
                ) : (
                  <Eye color="#9ca3af" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleAuthenticate}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggle Mode */}
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setIsLogin(!isLogin)}
          disabled={loading}>
          <Text style={styles.toggleText}>
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Quick Test Login */}
        {isLogin && (
          <TouchableOpacity
            style={styles.quickLoginBtn}
            onPress={() => {
              setEmail('test@test.com');
              setPassword('password123');
            }}
            disabled={loading}>
            <Text style={styles.quickLoginText}>⚡ FILL TEST ACCOUNT</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f172a'}, // Deep navy brand color
  content: {flex: 1, justifyContent: 'center', padding: 24},
  brandContainer: {alignItems: 'center', marginBottom: 48},
  iconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#059669',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#059669',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  brandTitle: {fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 1},
  brandSub: {fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 4, marginTop: 8},
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    gap: 24,
    elevation: 4,
  },
  inputGroup: {gap: 8},
  label: {fontSize: 9, fontWeight: '900', color: '#9ca3af', letterSpacing: 2},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  input: {flex: 1, fontSize: 16, fontWeight: '600', color: '#1e293b', padding: 0},
  primaryBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
  },
  primaryBtnText: {fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 2},
  toggleBtn: {alignItems: 'center', marginTop: 32},
  toggleText: {fontSize: 13, fontWeight: '600', color: '#cbd5e1'},
  quickLoginBtn: {alignItems: 'center', marginTop: 16, paddingVertical: 10},
  quickLoginText: {fontSize: 11, fontWeight: '700', color: '#f59e0b', letterSpacing: 1},
});

export default AuthScreen;
