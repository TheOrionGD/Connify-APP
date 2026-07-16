import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StandardButton } from '../../components/buttons/StandardButton';

function SettingsScreen() {
  const { themeMode, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuthStore();

  return (
    <View style={[styles.container, themeMode === 'dark' ? styles.containerDark : null]}>
      <Text style={[styles.title, themeMode === 'dark' ? styles.textDark : null]}>Settings & Governance</Text>
      
      {/* Profile Section */}
      {user && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themeMode === 'dark' ? styles.textDark : null]}>Logged In As</Text>
          <View style={[styles.card, themeMode === 'dark' ? styles.cardDark : null]}>
            <Icon name="account-circle" size={40} color={theme.colors.primary} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, themeMode === 'dark' ? styles.textDark : null]}>
                {user.displayName || 'Guest User'}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, themeMode === 'dark' ? styles.textDark : null]}>Theme Preference</Text>
        <TouchableOpacity 
          style={[styles.themeToggle, themeMode === 'dark' ? styles.cardDark : null]} 
          onPress={toggleTheme}
        >
          <Icon 
            name={themeMode === 'light' ? 'light-mode' : 'dark-mode'} 
            size={24} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.themeToggleText, themeMode === 'dark' ? styles.textDark : null]}>
            Active: {themeMode.toUpperCase()} MODE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      {user && (
        <StandardButton 
          title="SIGN OUT" 
          variant="secondary" 
          onPress={signOut}
          style={styles.signOutButton} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.containerPadding,
    backgroundColor: theme.colors.background,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingTop: 50,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  title: {
    ...theme.typography.headlineMd,
    color: theme.colors.primary,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  textDark: {
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...theme.typography.labelMd,
    color: theme.colors.onBackground,
    opacity: 0.6,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: theme.spacing.radiusMd,
    backgroundColor: theme.colors.surfaceContainerLow,
    gap: 12,
  },
  cardDark: {
    backgroundColor: '#1f1f1f',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  userEmail: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: theme.spacing.radiusMd,
    backgroundColor: theme.colors.surfaceContainerLow,
    gap: 12,
  },
  themeToggleText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onBackground,
    fontWeight: '500',
  },
  signOutButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});

export default SettingsScreen;
