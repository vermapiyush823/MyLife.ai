import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const PASSCODE_KEY = 'vault_passcode';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export const BiometricAuth = {
  // Check if biometric authentication is available
  async isAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return {
        hasHardware,
        isEnrolled,
        supportedTypes,
        isAvailable: hasHardware && isEnrolled
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { isAvailable: false };
    }
  },

  // Authenticate using biometrics
  async authenticate(reason = 'Access your secure vault') {
    try {
      const biometricInfo = await this.isAvailable();
      
      if (!biometricInfo.isAvailable) {
        throw new Error('Biometric authentication not available');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      return result;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw error;
    }
  },

  // Set up passcode as fallback
  async setPasscode(passcode) {
    try {
      await SecureStore.setItemAsync(PASSCODE_KEY, passcode);
      return true;
    } catch (error) {
      console.error('Error setting passcode:', error);
      return false;
    }
  },

  // Verify passcode
  async verifyPasscode(inputPasscode) {
    try {
      const storedPasscode = await SecureStore.getItemAsync(PASSCODE_KEY);
      return storedPasscode === inputPasscode;
    } catch (error) {
      console.error('Error verifying passcode:', error);
      return false;
    }
  },

  // Check if passcode exists
  async hasPasscode() {
    try {
      const passcode = await SecureStore.getItemAsync(PASSCODE_KEY);
      return !!passcode;
    } catch (error) {
      console.error('Error checking passcode:', error);
      return false;
    }
  },

  // Enable/disable biometric authentication
  async setBiometricEnabled(enabled) {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled.toString());
      return true;
    } catch (error) {
      console.error('Error setting biometric preference:', error);
      return false;
    }
  },

  // Check if biometric is enabled
  async isBiometricEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric preference:', error);
      return false;
    }
  },

  // Complete authentication flow with fallback
  async authenticateWithFallback() {
    try {
      const biometricInfo = await this.isAvailable();
      const isBiometricEnabled = await this.isBiometricEnabled();
      const hasPasscode = await this.hasPasscode();

      // Try biometric first if available and enabled
      if (biometricInfo.isAvailable && isBiometricEnabled) {
        const biometricResult = await this.authenticate();
        
        if (biometricResult.success) {
          return { success: true, method: 'biometric' };
        }
        
        // If biometric failed and user chose fallback
        if (biometricResult.error === 'UserFallback' && hasPasscode) {
          return { success: false, fallbackToPasscode: true };
        }
      }

      // Fallback to passcode if biometric not available or failed
      if (hasPasscode) {
        return { success: false, fallbackToPasscode: true };
      }

      // No authentication method available
      return { success: false, needsSetup: true };
    } catch (error) {
      console.error('Authentication flow error:', error);
      return { success: false, error: error.message };
    }
  },

  // Setup authentication (first time)
  async setupAuthentication() {
    return new Promise((resolve) => {
      Alert.alert(
        'Secure Your Vault',
        'Choose how you want to protect your vault data:',
        [
          {
            text: 'Set Passcode',
            onPress: () => resolve({ method: 'passcode' })
          },
          {
            text: 'Use Biometric + Passcode',
            onPress: async () => {
              const biometricInfo = await this.isAvailable();
              if (biometricInfo.isAvailable) {
                resolve({ method: 'both' });
              } else {
                Alert.alert(
                  'Biometric Not Available',
                  'Biometric authentication is not available on this device. Please set up a passcode.',
                  [{ text: 'OK', onPress: () => resolve({ method: 'passcode' }) }]
                );
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ method: 'cancel' })
          }
        ]
      );
    });
  }
};
