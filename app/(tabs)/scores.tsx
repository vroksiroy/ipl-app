import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import ScoreCard from '../../components/ScoreCard';
import BannerAdView from '../../components/BannerAdView';
import { getMatches } from '../../services/cricapi';
import { clearCache } from '../../services/cache';
import type { Match } from '../../services/cricapi';

const REFRESH_INTERVAL = 10_000;

export default function ScoresScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load(force = false) {
    if (force) await clearCache('ipl_matches');
    try {
      const data = await getMatches();
      setMatches(data ?? []);
    } catch {}
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    timer.current = setInterval(() => load(true), REFRESH_INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator color={colors.gold} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ScoreCard match={item} />}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
        ListHeaderComponent={
          <Text style={styles.title}>Live & Upcoming Matches</Text>
        }
        ListFooterComponent={<BannerAdView />}
        ListEmptyComponent={
          <Text style={styles.empty}>No matches available</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  title: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    paddingLeft: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 60,
  },
});
