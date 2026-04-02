import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import TeamRow from '../../components/TeamRow';
import BannerAdView from '../../components/BannerAdView';
import { getPointsTable } from '../../services/cricapi';
import type { TeamStanding } from '../../services/cricapi';

export default function PointsScreen() {
  const [teams, setTeams] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getPointsTable();
      setTeams(data ?? []);
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
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
      >
        <Text style={styles.title}>Points Table</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { width: 20 }]}>#</Text>
          <Text style={[styles.headerCell, { width: 30 }]}></Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Team</Text>
          <View style={styles.statsHeader}>
            <Text style={styles.headerCell}>M</Text>
            <Text style={styles.headerCell}>W</Text>
            <Text style={styles.headerCell}>L</Text>
            <Text style={[styles.headerCell, { width: 40 }]}>NRR</Text>
            <Text style={[styles.headerCell, styles.ptsHeader]}>Pts</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : teams.length > 0 ? (
          teams.map((team, i) => <TeamRow key={team.teamId ?? i} team={team} rank={i + 1} />)
        ) : (
          <Text style={styles.empty}>Points table not available</Text>
        )}

        <BannerAdView />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '700',
    margin: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    paddingLeft: spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  headerCell: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
  ptsHeader: {
    color: colors.gold,
    width: 24,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 60,
  },
});
