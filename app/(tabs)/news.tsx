import { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import NewsItemComponent from '../../components/NewsItem';
import BannerAdView from '../../components/BannerAdView';
import { getNews } from '../../services/cricapi';
import type { NewsItem } from '../../services/cricapi';

type ListItem = NewsItem | { _ad: true; id: string };

function injectAds(items: NewsItem[]): ListItem[] {
  const result: ListItem[] = [];
  items.forEach((item, i) => {
    result.push(item);
    if ((i + 1) % 5 === 0) {
      result.push({ _ad: true, id: `ad-${i}` });
    }
  });
  return result;
}

export default function NewsScreen() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getNews();
      setItems(injectAds(data ?? []));
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
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if ('_ad' in item) return <BannerAdView />;
          return <NewsItemComponent item={item} />;
        }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
        }
        ListHeaderComponent={<Text style={styles.title}>IPL News</Text>}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No news available</Text>
          )
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
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 60 },
});
