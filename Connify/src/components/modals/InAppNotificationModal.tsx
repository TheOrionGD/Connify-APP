import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { NotificationService, InAppNotificationItem } from '../../services/NotificationService';

interface InAppNotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InAppNotificationModal({ visible, onClose }: InAppNotificationModalProps) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);

  useEffect(() => {
    if (!visible) return;

    // Subscribe to live in-app notifications
    const unsubscribe = NotificationService.subscribeInAppNotifications((items) => {
      setNotifications(items);
    });

    return () => {
      unsubscribe();
    };
  }, [visible]);

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
  };

  const handleClearAll = async () => {
    await NotificationService.clearAllNotifications();
  };

  const handleItemPress = async (item: InAppNotificationItem) => {
    if (!item.read) {
      await NotificationService.markAsRead(item.id);
    }
  };

  const renderIcon = (type?: string) => {
    switch (type) {
      case 'emergency':
        return <Icon name="warning" size={20} color="#EF4444" />;
      case 'responder':
        return <Icon name="person" size={20} color="#3B82F6" />;
      case 'guard':
        return <Icon name="security" size={20} color="#10B981" />;
      case 'chat':
        return <Icon name="chat" size={20} color="#8B5CF6" />;
      case 'system':
        return <Icon name="info" size={20} color="#F59E0B" />;
      default:
        return <Icon name="notifications" size={20} color={colors.primary} />;
    }
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.outline }]}>
            <View style={styles.headerTitleContainer}>
              <Icon name="people-outline" size={24} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
                IN-APP NOTIFICATIONS
              </Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.onBackground} />
            </TouchableOpacity>
          </View>

          {/* Action Bar */}
          {notifications.length > 0 && (
            <View style={[styles.actionBar, { borderBottomColor: colors.outline }]}>
              <TouchableOpacity onPress={handleMarkAllRead} style={styles.actionBtn}>
                <Icon name="done-all" size={16} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>Mark all as read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearAll} style={styles.actionBtn}>
                <Icon name="delete-outline" size={16} color="#EF4444" />
                <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="notifications-none" size={64} color={colors.outline} />
              <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>No Notifications Yet</Text>
              <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
                Notifications sent to your device or triggered in-app will appear here in real-time.
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: item.read ? colors.surfaceContainerLowest : colors.surfaceContainerHigh,
                      borderColor: colors.outline,
                    },
                  ]}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconBox}>{renderIcon(item.type)}</View>
                  <View style={styles.notifContent}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.notifTitle, { color: colors.onBackground, fontWeight: item.read ? '600' : '700' }]}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.notifBody, { color: colors.onSurfaceVariant }]}>{item.body}</Text>
                    <Text style={[styles.notifTime, { color: colors.onSurfaceVariant }]}>
                      {formatTimestamp(item.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
  },
});
