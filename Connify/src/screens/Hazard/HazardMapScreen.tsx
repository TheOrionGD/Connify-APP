import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../../theme';
import { useHazardStore, HazardReport } from '../../stores/hazardStore';
import { useLocationStore } from '../../stores/locationStore';
import { aiHazardService, VerificationResult } from '../../services/aiHazardService';

const CATEGORIES: Array<HazardReport['category']> = [
  'Poor Lighting',
  'Harassment Hotspot',
  'Obstruction / Blocked',
  'Suspicious Activity',
  'Road Hazard',
];

const SEVERITY_COLORS: Record<HazardReport['severity'], string> = {
  LOW: '#3B82F6',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
  CRITICAL: '#DC2626',
};

const VERIFICATION_TAGS: Record<
  HazardReport['verificationStatus'],
  { label: string; color: string; icon: string }
> = {
  AI_VERIFIED_ONLINE: {
    label: 'AI VERIFIED DANGER SPOT',
    color: '#8B5CF6',
    icon: 'verified',
  },
  USER_REPORTED_ONLY: {
    label: 'USER-REPORTED COMMUNITY SPOT',
    color: '#F59E0B',
    icon: 'record-voice-over',
  },
  COMMUNITY_ATTESTED: {
    label: 'COMMUNITY ATTESTED ZONE',
    color: '#10B981',
    icon: 'groups',
  },
};

export default function HazardMapScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { hazards, loadHazards, addHazard, confirmHazard } = useHazardStore();
  const { latitude, longitude } = useLocationStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState<HazardReport['category']>('Harassment Hotspot');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<HazardReport['severity']>('HIGH');

  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<VerificationResult | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHazards();
  }, []);

  // Calculate distance for all hazards relative to current user GPS
  const personalizedHazards = useMemo(() => {
    const userLat = latitude || 12.9716;
    const userLng = longitude || 77.5946;

    return hazards
      .map((h) => ({
        ...h,
        distanceKm: aiHazardService.calculateDistanceKm(userLat, userLng, h.latitude, h.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [hazards, latitude, longitude]);

  // Proximity Threat Level calculation
  const nearbySpotsCount = useMemo(() => {
    return personalizedHazards.filter((h) => h.distanceKm <= 3.0).length;
  }, [personalizedHazards]);

  const nearestDistance = personalizedHazards.length > 0 ? personalizedHazards[0].distanceKm : null;

  const handleReportSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please provide details of the safety hazard.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addHazard({
        category,
        description: description.trim(),
        latitude: latitude || 12.9716,
        longitude: longitude || 77.5946,
        severity,
      });

      setDescription('');
      setModalVisible(false);

      const isAiVerified = created.verificationStatus === 'AI_VERIFIED_ONLINE';
      Alert.alert(
        isAiVerified ? 'AI Verified Danger Spot Posted!' : 'User Report Broadcasted!',
        isAiVerified
          ? `Your report matched online safety intelligence (${created.verificationScore}% confidence score). Tagged as [AI VERIFIED DANGER SPOT].`
          : `Your report has been tagged as [USER-REPORTED COMMUNITY SPOT] and broadcasted to nearby users.`
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to broadcast hazard report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunAiAudit = async () => {
    setIsAiScanning(true);
    try {
      const res = await aiHazardService.verifyReport(
        'Location Safety Audit',
        'Current user location safety intelligence scan',
        latitude || 12.9716,
        longitude || 77.5946
      );
      setAiScanResult(res);
      setShowAiModal(true);
    } catch (e) {
      Alert.alert('Scan Failed', 'Unable to reach online AI safety intelligence endpoint.');
    } finally {
      setIsAiScanning(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Hazard & Danger Radar</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconBtn}>
          <Icon name="add-location-alt" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Personalized Proximity Threat Meter */}
        <View
          style={[
            styles.proximityCard,
            {
              backgroundColor: nearbySpotsCount > 0 ? '#DC2626' + '15' : colors.surfaceVariant,
              borderColor: nearbySpotsCount > 0 ? '#DC2626' : colors.outline,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={[
                styles.proximityBadgeIcon,
                { backgroundColor: nearbySpotsCount > 0 ? '#DC2626' : colors.primary },
              ]}
            >
              <Icon name={nearbySpotsCount > 0 ? 'warning' : 'shield'} size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.proximityTitle, { color: colors.onBackground }]}>
                {nearbySpotsCount > 0
                  ? `${nearbySpotsCount} HAZARD HOTSPOT(S) WITHIN 3.0 KM`
                  : 'PROXIMITY SAFETY CLEAR'}
              </Text>
              <Text style={[styles.proximitySub, { color: colors.onSurfaceVariant }]}>
                {nearestDistance !== null
                  ? `Closest danger spot is ${nearestDistance} km from your current GPS position (${(latitude || 12.9716).toFixed(3)}, ${(longitude || 77.5946).toFixed(3)}).`
                  : 'Live coordinates scanned. No immediate threats detected nearby.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRunAiAudit}
            disabled={isAiScanning}
            style={[styles.aiAuditBtn, { backgroundColor: colors.primary }]}
          >
            {isAiScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Icon name="psychology" size={18} color="#FFFFFF" />
                <Text style={styles.aiAuditBtnText}>RUN AI ONLINE SAFETY AUDIT</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Header */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
            PERSONALIZED DANGER HOTSPOTS ({personalizedHazards.length})
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: colors.primary }}>
              + REPORT SPOT
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hazard List */}
        {personalizedHazards.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <Icon name="verified-user" size={48} color={colors.statusGreen} />
            <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>No Danger Hotspots Reported</Text>
            <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
              There are no active community safety hazards or incident reports in this area. You can report a new danger spot or run an online AI audit above.
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="add-location-alt" size={18} color="#FFFFFF" />
              <Text style={styles.emptyActionBtnText}>REPORT ACTIVE HAZARD</Text>
            </TouchableOpacity>
          </View>
        ) : (
          personalizedHazards.map((item) => {
            const verTag = VERIFICATION_TAGS[item.verificationStatus];
            return (
              <View
                key={item.id}
                style={[
                  styles.reportCard,
                  { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline },
                ]}
              >
                {/* Top Bar: Verification Badge & Severity */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <View style={[styles.verTagBadge, { backgroundColor: verTag.color + '20', borderColor: verTag.color }]}>
                    <Icon name={verTag.icon} size={14} color={verTag.color} />
                    <Text style={[styles.verTagBadgeText, { color: verTag.color }]}>{verTag.label}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[styles.sevBadge, { backgroundColor: SEVERITY_COLORS[item.severity] }]}>
                      <Text style={styles.sevBadgeText}>{item.severity}</Text>
                    </View>
                    <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: colors.primary }}>
                      {item.distanceKm} km away
                    </Text>
                  </View>
                </View>

                {/* Title & Category */}
                <Text style={[styles.categoryTitle, { color: colors.onBackground }]}>{item.category}</Text>
                <Text style={[styles.descText, { color: colors.onSurfaceVariant }]}>{item.description}</Text>

                {/* AI Online Intelligence Details */}
                <View style={[styles.aiSourceBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}>
                  <Icon name="verified-user" size={16} color={verTag.color} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, color: colors.onBackground }}>
                      INTELLIGENCE SOURCE ({item.verificationScore}% MATCH SCORE):
                    </Text>
                    <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, color: colors.onSurfaceVariant }}>
                      {item.verificationSource}
                    </Text>
                    {item.aiSummary && (
                      <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 10, color: colors.primary, fontStyle: 'italic', marginTop: 2 }}>
                        "{item.aiSummary}"
                      </Text>
                    )}
                  </View>
                </View>

                {/* Footer Meta & Confirmation */}
                <View style={styles.footerRow}>
                  <Text style={{ fontFamily: theme.fontFamilies.technical.regular, fontSize: 11, color: colors.onSurfaceVariant }}>
                    Reported {item.reportedAt}
                  </Text>

                  <TouchableOpacity
                    onPress={() => confirmHazard(item.id)}
                    style={[styles.confirmBtn, { backgroundColor: colors.surfaceVariant, borderColor: colors.outline }]}
                  >
                    <Icon name="thumb-up" size={14} color={colors.primary} />
                    <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: colors.primary }}>
                      ATTEST SPOT ({item.confirmationsCount})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outline }]}>
            <Text style={[styles.modalTitle, { color: colors.onBackground }]}>Report Danger Hotspot</Text>
            <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, color: colors.onSurfaceVariant }}>
              Your report will be cross-verified against online safety databases and tagged accordingly.
            </Text>

            <Text style={styles.inputLabel}>HAZARD CATEGORY</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: category === cat ? colors.primary : colors.surfaceVariant,
                      borderColor: category === cat ? colors.primary : colors.outline,
                    },
                  ]}
                >
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, color: category === cat ? '#FFFFFF' : colors.onBackground }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>SEVERITY LEVEL</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                <TouchableOpacity
                  key={sev}
                  onPress={() => setSeverity(sev)}
                  style={[
                    styles.sevChip,
                    {
                      backgroundColor: severity === sev ? SEVERITY_COLORS[sev] : colors.surfaceVariant,
                      borderColor: severity === sev ? SEVERITY_COLORS[sev] : colors.outline,
                    },
                  ]}
                >
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, color: severity === sev ? '#FFFFFF' : colors.onBackground }}>
                    {sev}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>HAZARD DESCRIPTION</Text>
            <TextInput
              style={[styles.input, { color: colors.onBackground, borderColor: colors.outline }]}
              placeholder="Describe threat (e.g. broken streetlights near alleyway)..."
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ fontFamily: theme.fontFamilies.technical.bold, color: colors.onSurfaceVariant }}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isSubmitting}
                style={[styles.submitBtn, { backgroundColor: '#EF4444' }]}
                onPress={handleReportSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, color: '#FFFFFF' }}>BROADCAST REPORT</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Audit Scan Result Modal */}
      <Modal visible={showAiModal} animationType="fade" transparent onRequestClose={() => setShowAiModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="psychology" size={26} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.onBackground }]}>AI Real-Time Safety Advisory</Text>
            </View>

            {aiScanResult && (
              <View style={{ gap: 12, marginVertical: 4 }}>
                <View style={[styles.verTagBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                  <Icon name="verified" size={14} color={colors.primary} />
                  <Text style={[styles.verTagBadgeText, { color: colors.primary }]}>
                    AI CONFIDENCE SCORE: {aiScanResult.score}%
                  </Text>
                </View>

                <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 13, color: colors.onBackground, lineHeight: 18 }}>
                  {aiScanResult.aiSummary}
                </Text>

                <View style={{ padding: 12, borderRadius: 10, backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.outline, gap: 4 }}>
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, color: colors.primary }}>
                    ONLINE INTELLIGENCE FEED:
                  </Text>
                  <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, color: colors.onSurfaceVariant }}>
                    {aiScanResult.source}
                  </Text>
                </View>

                <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#10B981' + '15', borderWidth: 1, borderColor: '#10B981' }}>
                  <Text style={{ fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, color: '#10B981' }}>
                    RECOMMENDED ADVISORY:
                  </Text>
                  <Text style={{ fontFamily: theme.fontFamilies.secondary.regular, fontSize: 12, color: colors.onBackground, marginTop: 2 }}>
                    {aiScanResult.recommendedAction}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowAiModal(false)}
              style={{ backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 }}
            >
              <Text style={{ fontFamily: theme.fontFamilies.technical.bold, color: '#FFFFFF' }}>DISMISS ADVISORY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#33333333',
  },
  iconBtn: { padding: 8 },
  headerTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 18 },
  scrollContent: { padding: 16, gap: 14 },
  proximityCard: { padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 12 },
  proximityBadgeIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  proximityTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 14 },
  proximitySub: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 11, marginTop: 2, lineHeight: 16 },
  aiAuditBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
  aiAuditBtnText: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, color: '#FFFFFF', letterSpacing: 0.5 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 11, letterSpacing: 1 },
  reportCard: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  verTagBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, alignSelf: 'flex-start' },
  verTagBadgeText: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 9, letterSpacing: 0.5 },
  sevBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sevBadgeText: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 9, color: '#FFFFFF' },
  categoryTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 15 },
  descText: { fontFamily: theme.fontFamilies.secondary.regular, fontSize: 13, lineHeight: 18 },
  aiSourceBox: { padding: 10, borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 380, borderRadius: 16, padding: 20, gap: 12, borderWidth: 1 },
  modalTitle: { fontFamily: theme.fontFamilies.primary.bold, fontSize: 17 },
  inputLabel: { fontFamily: theme.fontFamilies.technical.bold, fontSize: 10, letterSpacing: 1, marginTop: 4 },
  input: { minHeight: 70, borderWidth: 1, borderRadius: 8, padding: 10, fontFamily: theme.fontFamilies.secondary.regular, fontSize: 13, textAlignVertical: 'top' },
  catChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  sevChip: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  submitBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  emptyContainer: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 8,
  },
  emptyTitle: {
    fontFamily: theme.fontFamilies.primary.bold,
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: theme.fontFamilies.secondary.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  emptyActionBtnText: {
    fontFamily: theme.fontFamilies.technical.bold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
