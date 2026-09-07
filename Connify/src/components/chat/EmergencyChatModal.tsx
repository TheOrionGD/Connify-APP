import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';
import { socketService, IncomingMessage } from '../../services/socketService';
import { useAuthStore } from '../../stores/authStore';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isSelf: boolean;
}

interface EmergencyChatModalProps {
  visible: boolean;
  onClose: () => void;
  episodeId: string;
  counterpartyName: string;
  role: 'requester' | 'responder';
}

const QUICK_RESPONSES = [
  '5 mins away, stay safe!',
  'I am near the landmark/gate',
  'Holding my position',
  'Police / Medical alerted',
  'Please share exact room/building',
];

export function EmergencyChatModal({
  visible,
  onClose,
  episodeId,
  counterpartyName,
  role,
}: EmergencyChatModalProps) {
  const { colors } = useTheme();
  const userId = useAuthStore((state) => state.user?.uid || state.userProfile?.id || 'user_local');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'system_welcome',
      senderId: 'system',
      senderName: 'Connify SafeNet',
      message: `En-Route Ephemeral Direct Channel active with ${counterpartyName}. Messages are zero-trace and auto-purged on handshake completion.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && episodeId) {
      socketService.connect();
      socketService.joinEpisode(episodeId);

      const handleIncomingMessage = (msg: IncomingMessage) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}_${Math.random()}`,
            senderId: msg.senderId,
            senderName: msg.senderId === userId ? 'You' : counterpartyName,
            message: msg.message,
            timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: msg.senderId === userId,
          },
        ]);
      };

      socketService.onMessage(handleIncomingMessage);

      return () => {
        socketService.offMessage(handleIncomingMessage);
      };
    }
  }, [visible, episodeId, counterpartyName, userId]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append locally immediately for instant feedback
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderId: userId,
        senderName: 'You',
        message: text,
        timestamp: timeStr,
        isSelf: true,
      },
    ]);

    if (!textToSend) setInputText('');

    if (episodeId) {
      socketService.sendMessage(episodeId, text, (err) => {
        if (err) {
          console.warn('[Chat] Failed to dispatch socket message:', err);
        }
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.cardBackground, borderBottomColor: colors.outline }]}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Icon name="close" size={24} color={colors.onBackground} />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.onlineDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.headerTitle, { color: colors.onBackground }]}>{counterpartyName}</Text>
            </View>
            <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, color: colors.primary }}>
              EN-ROUTE P2P CHANNEL ({role.toUpperCase()})
            </Text>
          </View>

          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="verified-user" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Security Alert Banner */}
        <View style={[styles.banner, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '33' }]}>
          <Icon name="lock" size={16} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.onBackground }]}>
            Zero-Trace Ephemeral Chat — All logs auto-discard upon handshake completion.
          </Text>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            if (item.senderId === 'system') {
              return (
                <View style={styles.systemMsgContainer}>
                  <Text style={[styles.systemMsgText, { color: colors.onSurfaceVariant }]}>{item.message}</Text>
                </View>
              );
            }

            return (
              <View style={[styles.msgWrapper, item.isSelf ? styles.msgWrapperSelf : styles.msgWrapperOther]}>
                <View
                  style={[
                    styles.msgBubble,
                    item.isSelf
                      ? [styles.bubbleSelf, { backgroundColor: colors.primary }]
                      : [styles.bubbleOther, { backgroundColor: theme.colors.surfaceVariant, borderColor: colors.outline }],
                  ]}
                >
                  <Text style={[styles.msgText, { color: item.isSelf ? '#FFFFFF' : colors.onBackground }]}>
                    {item.message}
                  </Text>
                  <Text
                    style={[
                      styles.msgTime,
                      { color: item.isSelf ? 'rgba(255,255,255,0.7)' : colors.onSurfaceVariant },
                    ]}
                  >
                    {item.timestamp}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Quick Chips */}
        <View style={styles.quickChipsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={QUICK_RESPONSES}
            keyExtractor={(item, index) => `chip_${index}`}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSend(item)}
                style={[styles.quickChip, { backgroundColor: theme.colors.surfaceVariant, borderColor: colors.outline }]}
              >
                <Text style={{ fontFamily: theme.fontFamilies.technical.medium, fontSize: 11, color: colors.onBackground }}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: theme.colors.cardBackground, borderTopColor: colors.outline }]}>
          <TextInput
            style={[styles.textInput, { color: colors.onBackground, backgroundColor: colors.background, borderColor: colors.outline }]}
            placeholder="Type confidential en-route message..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : colors.surfaceVariant }]}
          >
            <Icon name="send" size={20} color={inputText.trim() ? '#FFFFFF' : colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconBtn: { padding: 8 },
  headerTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 16 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  bannerText: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, flex: 1 },
  messageList: { padding: 16, gap: 12 },
  systemMsgContainer: {
    alignSelf: 'center',
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  systemMsgText: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, textAlign: 'center' },
  msgWrapper: { width: '100%', marginVertical: 2 },
  msgWrapperSelf: { alignItems: 'flex-end' },
  msgWrapperOther: { alignItems: 'flex-start' },
  msgBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  bubbleSelf: { borderBottomRightRadius: 2 },
  bubbleOther: { borderBottomLeftRadius: 2, borderWidth: 1 },
  msgText: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 14, lineHeight: 20 },
  msgTime: { fontFamily: theme.fontFamilies.technical.medium, fontSize: 10, alignSelf: 'flex-end' },
  quickChipsContainer: { height: 44, justifyContent: 'center' },
  quickChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 13,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
