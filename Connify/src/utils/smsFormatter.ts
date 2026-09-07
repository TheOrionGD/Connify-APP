/**
 * Formats a standardized emergency SMS message with 5 required components:
 * 1. Quantified User Alert
 * 2. Quantified User Name
 * 3. Reason for Message
 * 4. Relationship with Quantified User
 * 5. Last Location (GPS coordinates & Google Maps link)
 */

export interface EmergencySMSParams {
  alertType?: string;          // e.g. "MEDICAL EMERGENCY", "PANIC DISTRESS", "SAFETY ALERT"
  userName?: string;           // e.g. "Elena Vance"
  reason?: string;             // e.g. "Emergency panic signal broadcast by user"
  relationship?: string;       // e.g. "Primary Guardian", "Emergency Contact", "Friend"
  latitude?: number | null;
  longitude?: number | null;
  customLocationStr?: string;  // Fallback if coordinates are null
}

export function formatEmergencySMSMessage(params: EmergencySMSParams): string {
  const alertType = (params.alertType || 'EMERGENCY SAFETY ALERT').toUpperCase();
  const userName = params.userName && params.userName.trim() ? params.userName.trim() : 'Safety User';
  const reason = params.reason && params.reason.trim()
    ? params.reason.trim()
    : 'Emergency distress signal triggered from Connify Safety app';
  const relationship = params.relationship && params.relationship.trim()
    ? params.relationship.trim()
    : 'Emergency Contact';

  let locationStr = 'Acquiring GPS fix...';
  let mapsLink = '';

  if (params.latitude != null && params.longitude != null && !(params.latitude === 0 && params.longitude === 0)) {
    const lat = params.latitude.toFixed(5);
    const lng = params.longitude.toFixed(5);
    locationStr = `Lat ${lat}, Lng ${lng}`;
    mapsLink = `https://maps.google.com/?q=${params.latitude},${params.longitude}`;
  } else if (params.customLocationStr) {
    locationStr = params.customLocationStr;
  }

  return `[${alertType}]
User: ${userName}
Relationship: ${relationship}
Reason: ${reason}
Last Location: ${locationStr}${mapsLink ? `\nMap Link: ${mapsLink}` : ''}`;
}
