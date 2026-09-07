import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export interface BiometricCheckResult {
  available: boolean;
  biometryType?: string;
  error?: string;
}

export class BiometricService {
  /**
   * Checks if biometric hardware is supported and enrolled on the device.
   */
  static async checkAvailability(): Promise<BiometricCheckResult> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      let typeStr = 'Biometrics';
      if (biometryType === BiometryTypes.TouchID) typeStr = 'Touch ID';
      else if (biometryType === BiometryTypes.FaceID) typeStr = 'Face ID';
      else if (biometryType === BiometryTypes.Biometrics) typeStr = 'Fingerprint / Biometrics';

      return { available: !!available, biometryType: typeStr };
    } catch (error: any) {
      console.warn('Biometric sensor check error:', error?.message || error);
      return { available: false, error: error?.message || 'Biometric check failed' };
    }
  }

  /**
   * Prompts the user with Biometrics before performing critical emergency episode actions.
   * (e.g. Broadcasting a Help Request or Accepting / Offering Help as a Responder)
   *
   * @param actionName Friendly label for the prompt e.g. "Broadcast Help Request" or "Offer Emergency Assistance"
   * @returns boolean true if user authenticated (or confirmed fallback), false if canceled.
   */
  static async authenticateForEpisode(actionName: string): Promise<boolean> {
    try {
      const { available, biometryType } = await this.checkAvailability();

      if (available) {
        try {
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: `Authenticate with ${biometryType || 'Biometrics'} to ${actionName}`,
            cancelButtonText: 'Cancel',
          });
          if (success) {
            return true;
          } else {
            // User manually cancelled biometric prompt
            return false;
          }
        } catch (promptErr: any) {
          console.warn('Biometric simplePrompt error, trying simplified prompt:', promptErr?.message || promptErr);
          try {
            const { success } = await rnBiometrics.simplePrompt({
              promptMessage: `Authenticate to ${actionName}`,
            });
            if (success) return true;
          } catch (secondaryErr: any) {
            console.warn('Secondary biometric prompt error:', secondaryErr?.message || secondaryErr);
          }
        }
      }

      // Biometrics hardware not available or not enrolled or prompt errored - offer fallback for safety
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          `Confirm ${actionName}`,
          available
            ? `Could not open biometric prompt. Do you want to proceed with ${actionName}?`
            : `Biometric verification is not enrolled on this device. Do you want to proceed with ${actionName}?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Proceed', style: 'default', onPress: () => resolve(true) },
          ]
        );
      });
    } catch (err: any) {
      console.warn('Biometric authentication prompt error:', err?.message || err);
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          `Confirm ${actionName}`,
          `Proceed with ${actionName}?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Proceed', style: 'default', onPress: () => resolve(true) },
          ]
        );
      });
    }
  }
}

