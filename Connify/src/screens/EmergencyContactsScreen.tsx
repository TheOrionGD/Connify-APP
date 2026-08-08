import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Keychain from 'react-native-keychain';
import { theme, useTheme } from '../theme';
import { useLocationStore } from '../stores/locationStore';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function EmergencyContactsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');

  const { latitude, longitude } = useLocationStore();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'CONNIFY_EMERGENCY_CONTACTS' });
      if (credentials) {
        setContacts(JSON.parse(credentials.password));
      }
    } catch (e) {
      console.warn('Failed to load contacts from keychain', e);
    }
  };

  const saveContacts = async (newContacts: EmergencyContact[]) => {
    try {
      await Keychain.setGenericPassword('contacts', JSON.stringify(newContacts), {
        service: 'CONNIFY_EMERGENCY_CONTACTS'
      });
      setContacts(newContacts);
    } catch (e) {
      console.error('Failed to save contacts to keychain', e);
      Alert.alert('Error', 'Failed to save securely.');
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Validation Error', 'Please enter both Name and Phone Number.');
      return;
    }
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRelation.trim() || 'Emergency Contact',
    };
    const updated = [...contacts, newContact];
    await saveContacts(updated);
    setNewName('');
    setNewPhone('');
    setNewRelation('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    await saveContacts(updated);
  };

  const handleTriggerAll = (contact: EmergencyContact) => {
    const mapsUrl = latitude && longitude
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : 'Acquiring satellite GPS fix...';
    const message = `EMERGENCY ALERT! I need immediate help. Please track my location: ${mapsUrl}`;

    Alert.alert(
      'Broadcast Emergency SMS',
      `Send instant alert SMS with GPS coordinates to ${contact.name} (${contact.phone})? Works offline via mobile SMS network.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SMS NOW',
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`sms:${contact.phone}?body=${encodeURIComponent(message)}`);
          }
        }
      ]
    );
  };

  const handleVoiceCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open mobile phone dialer.'));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.outline }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>EMERGENCY CONTACTS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: colors.onBackground }]}>Trusted Circle</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Contacts registered here will receive direct SMS coordinates and cellular calls during emergency alerts.
          </Text>
        </View>

        {contacts.map((contact) => (
          <View key={contact.id} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.outline }]}>
            <View style={styles.cardInfo}>
              <Text style={[styles.contactName, { color: colors.onBackground }]}>{contact.name}</Text>
              <Text style={[styles.contactRelation, { color: colors.onSurfaceVariant }]}>{contact.relationship}</Text>
              <Text style={[styles.contactPhone, { color: colors.onBackground }]}>{contact.phone}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => handleVoiceCall(contact.phone)}>
                <Icon name="phone" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceContainerHigh }]} onPress={() => handleTriggerAll(contact)}>
                <Icon name="sms" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceContainerHigh }]} onPress={() => handleDelete(contact.id)}>
                <Icon name="delete-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {!isAdding ? (
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => setIsAdding(true)}>
            <Icon name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>ADD EMERGENCY CONTACT</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.addForm, { backgroundColor: colors.cardBackground, borderColor: colors.outline }]}>
            <Text style={[styles.formTitle, { color: colors.onBackground }]}>New Contact</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline, color: colors.onSurface }]}
              placeholder="Name"
              placeholderTextColor={colors.onSurfaceVariant}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline, color: colors.onSurface }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outline, color: colors.onSurface }]}
              placeholder="Relationship (e.g. Partner, Parent)"
              placeholderTextColor={colors.onSurfaceVariant}
              value={newRelation}
              onChangeText={setNewRelation}
            />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.onSurfaceVariant }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>SAVE CONTACT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    height: 56, borderBottomWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 13, letterSpacing: 1 },
  container: { padding: 16, gap: 16 },
  titleSection: { gap: 6, marginBottom: 8 },
  mainTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 22 },
  subtitle: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 13 },
  card: {
    borderWidth: 1, borderRadius: 12,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  cardInfo: { flex: 1 },
  contactName: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 16 },
  contactRelation: { fontFamily: theme.fontFamilies.technical.medium, fontSize: 12, marginTop: 2 },
  contactPhone: { fontFamily: theme.fontFamilies.technical.regular, fontSize: 14, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 8, borderRadius: 8 },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: 12, marginTop: 10
  },
  addButtonText: { fontFamily: theme.fontFamilies.technical.bold, color: '#FFF', fontSize: 13 },
  addForm: {
    padding: 16, borderRadius: 12,
    borderWidth: 1, gap: 12, marginTop: 10
  },
  formTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 16 },
  input: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, height: 44, fontFamily: theme.fontFamilies.secondary.regular
  },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelBtnText: { fontFamily: theme.fontFamilies.technical.bold },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  saveBtnText: { fontFamily: theme.fontFamilies.technical.bold, color: '#FFF' },
});
