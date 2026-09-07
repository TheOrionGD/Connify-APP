/**
 * Normalizes a phone number for use in tel: and sms: URIs.
 *
 * - Strips all non-digit characters (spaces, dashes, parentheses, plus sign)
 * - Prepends India country code (91) if the number has exactly 10 digits
 * - Returns the number with a leading '+' for proper international format
 *
 * Examples:
 *   normalizePhoneForURI('+91 98765 43210') → '+919876543210'
 *   normalizePhoneForURI('9876543210')      → '+919876543210'
 *   normalizePhoneForURI('919876543210')     → '+919876543210'
 *   normalizePhoneForURI('+1 555 123 4567') → '+15551234567'
 */
export function normalizePhoneForURI(phone: string): string {
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  // If exactly 10 digits, treat as Indian local number and prepend 91
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  return `+${digitsOnly}`;
}

/**
 * Returns just the digits-only version (no + prefix) for systems
 * that need raw numeric format (e.g., WhatsApp API).
 */
export function normalizePhoneDigitsOnly(phone: string): string {
  if (!phone) return '';
  let digitsOnly = phone.replace(/[^0-9]/g, '');
  // Handle leading 0 (e.g., 09876543210 -> 9876543210)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    digitsOnly = digitsOnly.substring(1);
  }
  // If 10 digits, prepend India country code 91
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Opens WhatsApp with a given phone number and message.
 * Formats the number with clean country code digits (no + sign or spaces) to avoid unregistered number errors.
 */
export async function openWhatsAppContact(phone: string, message?: string): Promise<boolean> {
  const { Linking, Alert } = require('react-native');
  const digits = normalizePhoneDigitsOnly(phone);
  if (!digits || digits.length < 7) {
    Alert.alert('Invalid Number', 'Please check the contact phone number.');
    return false;
  }

  const encodedMsg = message ? encodeURIComponent(message) : '';
  const waApiUrl = `https://api.whatsapp.com/send?phone=${digits}${encodedMsg ? `&text=${encodedMsg}` : ''}`;
  const waMeUrl = `https://wa.me/${digits}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
  const appSchemeUrl = `whatsapp://send?phone=${digits}${encodedMsg ? `&text=${encodedMsg}` : ''}`;

  try {
    // Try api.whatsapp.com first as it works reliably across Android & iOS without the "Number not on WhatsApp" URI scheme bug
    const canOpenApi = await Linking.canOpenURL(waApiUrl);
    if (canOpenApi) {
      await Linking.openURL(waApiUrl);
      return true;
    }
    const canOpenScheme = await Linking.canOpenURL(appSchemeUrl);
    if (canOpenScheme) {
      await Linking.openURL(appSchemeUrl);
      return true;
    }
    await Linking.openURL(waMeUrl);
    return true;
  } catch (err) {
    try {
      await Linking.openURL(waMeUrl);
      return true;
    } catch (fallbackErr) {
      Alert.alert('WhatsApp Error', 'Could not open WhatsApp. Please verify WhatsApp is installed on your device.');
      return false;
    }
  }
}

