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
import { theme } from '../theme';
import { useLocationStore } from '../stores/locationStore';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function EmergencyContactsScreen({ navigation }: any) {
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

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Missing Info', 'Name and Phone are required.');
      return;
    }
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRelation.trim() || 'Other',
    };
    saveContacts([...contacts, newContact]);
    setIsAdding(false);
    setNewName('');
    setNewPhone('');
    setNewRelation('');
  };

  const handleDelete = (id: string) => {
    saveContacts(contacts.filter(c => c.id !== id));
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Could not open dialer.'));
  };

  const handleSMS = (phone: string) => {
    let body = 'EMERGENCY: I need help.';
    if (latitude && longitude) {
      body += ` My last known location is: https://maps.google.com/?q=${latitude},${longitude}`;
    }
    // Encode the body properly
    const url = `sms:${phone}?body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open messaging app.'));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PERSONAL EMERGENCY CONTACTS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Trusted Contacts</Text>
          <Text style={styles.subtitle}>
            Stored securely on-device. Connify never transmits these contacts to our servers.
          </Text>
        </View>

        {contacts.map(contact => (
          <View key={contact.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(contact.phone)}>
                <Icon name="phone" size={20} color="#059669" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleSMS(contact.phone)}>
                <Icon name="message" size={20} color="#2563EB" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(contact.id)}>
                <Icon name="delete" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {!isAdding ? (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(true)}>
            <Icon name="add" size={20} color={theme.colors.onPrimary} />
            <Text style={styles.addButtonText}>ADD NEW CONTACT</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>New Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#888"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship (e.g. Partner, Parent)"
              placeholderTextColor="#888"
              value={newRelation}
              onChangeText={setNewRelation}
            />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
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
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 56, borderBottomWidth: 1, borderBottomColor: theme.colors.outline,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 13, letterSpacing: 1 },
  container: { padding: 16, gap: 16 },
  titleSection: { gap: 6, marginBottom: 8 },
  mainTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 22 },
  subtitle: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 13, color: '#666' },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 12,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  cardInfo: { flex: 1 },
  contactName: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 16 },
  contactRelation: { fontFamily: theme.fontFamilies.technical.medium, fontSize: 12, color: '#666', marginTop: 2 },
  contactPhone: { fontFamily: theme.fontFamilies.technical.regular, fontSize: 14, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 8, backgroundColor: theme.colors.surfaceContainerHigh, borderRadius: 8 },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: theme.colors.primary, padding: 14, borderRadius: 12, marginTop: 10
  },
  addButtonText: { fontFamily: theme.fontFamilies.technical.bold, color: '#FFF', fontSize: 13 },
  addForm: {
    backgroundColor: theme.colors.surfaceContainerLowest, padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: theme.colors.outline, gap: 12, marginTop: 10
  },
  formTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 16 },
  input: {
    borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 8,
    paddingHorizontal: 12, height: 44, fontFamily: theme.fontFamilies.secondary.regular
  },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelBtnText: { fontFamily: theme.fontFamilies.technical.bold, color: '#666' },
  saveBtn: { backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  saveBtnText: { fontFamily: theme.fontFamilies.technical.bold, color: '#FFF' },
});
