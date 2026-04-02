import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import ScoreCard from '../../components/ScoreCard';
import NewsItem from '../../components/NewsItem';
import BannerAdView from '../../components/BannerAdView';
import { getMatches, getNews } from '../../services/cricapi';
import type { Match, NewsItem as NewsItemType } from '../../services/cricapi';

export default function HomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [m, n] = await Promise.all([getMatches(), getNews()]);
      setMatches(m?.slice(0, 3) ?? []);
      setNews(n?.slice(0, 4) ?? []);
    } catch {}
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>IPL 2025</Text>
        <Text style={styles.subtitle}>TATA Indian Premier League</Text>
      </View>
      <BannerAdView />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
      >
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Today's Matches</Text>
            {matches.length > 0 ? (
              matches.map((m) => <ScoreCard key={m.id} match={m} />)
            ) : (
              <Text style={styles.empty}>No matches scheduled today</Text>
            )}

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Latest News</Text>
            {news.map((item) => (
              <NewsItem key={item.id} item={item} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
  },
  logo: {
    color: colors.gold,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 40 },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    paddingLeft: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
