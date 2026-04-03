import {
  start as startSpeech,
  stop as stopSpeech,
  addSpeechResultListener,
  addSpeechErrorListener,
  requestPermissions,
} from '@dbkable/react-native-speech-to-text';
import auth from '@react-native-firebase/auth';
import Config from 'react-native-config';
import type {EmitterSubscription} from 'react-native';
import {AIParseRequest, AIParseResponse} from '../types';

// API Gateway endpoint (from .env file)
const API_ENDPOINT = Config.API_ENDPOINT as string;
/**
 * Gets the Firebase ID Token for the current user.
 * This token is temporary (1hr), cryptographically signed, and verified by Lambda.
 */
async function getAuthToken(): Promise<string> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.getIdToken();
}

/**
 * Sends natural language text to the Lambda backend for AI parsing.
 */
export async function parseTransactionText(
  inputText: string,
  userId: string,
): Promise<AIParseResponse> {
  return sendToBedrock({inputText, userId});
}

/**
 * Sends a base64-encoded image to the Lambda backend for AI vision parsing.
 */
export async function parseReceiptImage(
  imageBase64: string,
  userId: string,
): Promise<AIParseResponse> {
  return sendToBedrock({imageBase64, userId});
}

/**
 * Core function that sends payload to Lambda/Bedrock with Firebase auth.
 */
async function sendToBedrock(
  payload: AIParseRequest,
): Promise<AIParseResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      throw new Error('Authentication failed. Please re-login.');
    }

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const result: AIParseResponse = await response.json();
    return result;
  } catch (error) {
    console.error('AI parse error:', error);
    return {
      success: false,
      data: {
        title: 'Unknown',
        amount: 0,
        category: 'Others',
        type: 'Expense',
      },
      error: 'Failed to connect to AI service.',
    };
  }
}

// ---- Voice Recognition (using @dbkable/react-native-speech-to-text) ----

/**
 * Requests microphone permissions for speech recognition.
 * Returns true if granted.
 */
export async function requestVoicePermissions(): Promise<boolean> {
  try {
    return await requestPermissions();
  } catch {
    return false;
  }
}

/**
 * Starts listening for voice input.
 * Returns a promise that resolves with the final transcribed text.
 */
export function startVoiceRecognition(): Promise<string> {
  return new Promise((resolve, reject) => {
    let resultSub: EmitterSubscription | null = null;
    let errorSub: EmitterSubscription | null = null;

    const cleanup = () => {
      resultSub?.remove();
      errorSub?.remove();
    };

    resultSub = addSpeechResultListener(result => {
      if (result.isFinal) {
        cleanup();
        resolve(result.transcript || '');
      }
    });

    errorSub = addSpeechErrorListener(error => {
      cleanup();
      reject(new Error(error.message || 'Voice recognition failed'));
    });

    startSpeech({language: 'en-US'}).catch(err => {
      cleanup();
      reject(err);
    });
  });
}

/**
 * Stops voice recognition.
 */
export async function stopVoiceRecognition(): Promise<void> {
  try {
    await stopSpeech();
  } catch {
    // Ignore errors when stopping
  }
}
