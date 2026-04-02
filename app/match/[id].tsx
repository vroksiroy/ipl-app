import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../constants/theme';
import BannerAdView from '../../components/BannerAdView';
import { useInterstitialAd } from '../../hooks/useInterstitialAd';
import { getMatchDetail } from '../../services/cricapi';
import type { MatchDetail } from '../../services/cricapi';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { show: showInterstitial } = useInterstitialAd();

  useEffect(() => {
    showInterstitial();
    if (id) {
      getMatchDetail(id)
        .then(setMatch)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {match?.name ?? 'Match Details'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.gold} style={{ flex: 1 }} />
      ) : !match ? (
        <Text style={styles.error}>Failed to load match data</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.venue}>{match.venue}</Text>
          <Text style={styles.date}>{new Date(match.dateTimeGMT).toLocaleString()}</Text>

          <View style={styles.teamsRow}>
            <Text style={styles.teamName}>{match.teams?.[0]}</Text>
            <Text style={styles.vs}>VS</Text>
            <Text style={styles.teamName}>{match.teams?.[1]}</Text>
          </View>

          {match.score && match.score.length > 0 && (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreTitle}>Scorecard</Text>
              {match.score.map((s, i) => (
                <View key={i} style={styles.inningRow}>
                  <Text style={styles.inning} numberOfLines={1}>{s.inning}</Text>
                  <Text style={styles.inningScore}>
                    {s.r}/{s.w} ({s.o} ov)
                  </Text>
                </View>
              ))}
            </View>
          )}

          {match.tossWinner && (
            <View style={styles.tossBox}>
              <Text style={styles.tossText}>
                Toss: {match.tossWinner} won and chose to {match.tossChoice}
              </Text>
            </View>
          )}

          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{match.status}</Text>
          </View>

          <BannerAdView />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { marginRight: spacing.sm },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  content: { padding: spacing.md, paddingBottom: 40, gap: spacing.md },
  venue: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  date: { color: colors.textDim, fontSize: 12, textAlign: 'center' },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamName: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  vs: { color: colors.gold, fontWeight: '700', marginHorizontal: spacing.sm },
  scoreBox: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreTitle: { color: colors.gold, fontWeight: '700', marginBottom: spacing.sm },
  inningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inning: { color: colors.text, fontSize: 13, flex: 1 },
  inningScore: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  tossBox: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tossText: { color: colors.textMuted, fontSize: 13 },
  statusBox: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
  },
  statusText: { color: colors.gold, fontWeight: '700', fontSize: 14, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center', marginTop: 60 },
});
