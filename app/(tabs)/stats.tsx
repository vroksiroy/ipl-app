import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { colors, spacing, radius } from '../../constants/theme';
import PlayerCard from '../../components/PlayerCard';
import { getPlayerStats } from '../../services/cricapi';
import type { Player } from '../../services/cricapi';

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

export default function StatsScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [adReady, setAdReady] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const rewardedRef = useRef(RewardedAd.createForAdRequest(adUnitId));

  useEffect(() => {
    const onLoad = rewardedRef.current.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setAdReady(true)
    );
    const onEarned = rewardedRef.current.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => setUnlocked(true)
    );
    rewardedRef.current.load();
    return () => { onLoad(); onEarned(); };
  }, []);

  async function load() {
    try {
      const data = await getPlayerStats();
      setPlayers(data ?? []);
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

  function handlePlayerPress(player: Player) {
    if (unlocked) {
      setSelectedPlayer(player);
    } else if (adReady) {
      rewardedRef.current.show();
    }
  }

  const displayedPlayers = unlocked ? players : players.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={displayedPlayers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => handlePlayerPress(item)} activeOpacity={0.8}>
            <PlayerCard player={item} rank={index + 1} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
        }
        ListHeaderComponent={<Text style={styles.title}>Player Stats</Text>}
        ListFooterComponent={
          !unlocked ? (
            <TouchableOpacity
              style={[styles.unlockBtn, !adReady && styles.unlockBtnDim]}
              onPress={() => adReady && rewardedRef.current.show()}
              disabled={!adReady}
            >
              <Text style={styles.unlockText}>
                {adReady ? 'Watch Ad to Unlock Full Stats' : 'Loading Ad...'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No player data available</Text>
          )
        }
      />

      <Modal visible={!!selectedPlayer} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalName}>{selectedPlayer?.name}</Text>
            <Text style={styles.modalMeta}>{selectedPlayer?.role}</Text>
            <Text style={styles.modalMeta}>{selectedPlayer?.country}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedPlayer(null)}>
              <Text style={styles.closeTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  unlockBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  unlockBtnDim: {
    backgroundColor: colors.goldDim,
  },
  unlockText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: 14,
  },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 60 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  modalName: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: spacing.sm },
  modalMeta: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.xs },
  closeBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  closeTxt: { color: colors.bg, fontWeight: '700' },
});
