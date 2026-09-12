const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');

const serviceAccount = require('../connify-2026-firebase-adminsdk-fbsvc-0ac0df4f28.json');

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://connify-2026-default-rtdb.firebaseio.com',
  });
}

const messaging = getMessaging();
const targetPhone = '+919344462238';
const sanitizedPhone = targetPhone.replace(/[^0-9]/g, '');
const topicName = `guardian_${sanitizedPhone}`;

console.log(`🚀 Dispatching FCM Emergency Guardian Alert for ${targetPhone}...`);
console.log(`Target Topic: ${topicName}`);

// FCM Notification Payload for Guardian Alert
const message = {
  notification: {
    title: '🛡️ CONNIFY EMERGENCY GUARDIAN ALERT',
    body: `URGENT: Emergency SOS triggered for guardian contact ${targetPhone}. User requires immediate assistance!`,
  },
  data: {
    phone: targetPhone,
    alertType: 'EMERGENCY_SOS_GUARDIAN',
    timestamp: new Date().toISOString(),
    latitude: '10.7905',
    longitude: '78.7047',
    screen: 'GuardianAlert',
  },
  topic: topicName,
};

async function sendAlert() {
  try {
    const response = await messaging.send(message);
    console.log('✅ FCM Emergency Guardian Alert successfully sent to topic:', response);
    
    // Send to general emergency broadcast channel as well
    const broadcastMessage = {
      notification: {
        title: '🚨 EMERGENCY ALERT BROADCAST',
        body: `Emergency signal dispatched to guardian ${targetPhone}.`,
      },
      data: {
        guardianPhone: targetPhone,
        alertType: 'GUARDIAN_DISPATCH',
      },
      topic: 'connify_emergency_alerts',
    };
    
    const broadcastResponse = await messaging.send(broadcastMessage);
    console.log('✅ FCM General Broadcast Alert successfully sent:', broadcastResponse);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to send FCM message:', error);
    process.exit(1);
  }
}

sendAlert();
