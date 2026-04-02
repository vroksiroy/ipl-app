import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import type { Player } from '../services/cricapi';

interface Props {
  player: Player;
  rank: number;
}

export default function PlayerCard({ player, rank }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.rank}>#{rank}</Text>
      {player.playerImg ? (
        <Image source={{ uri: player.playerImg }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{player.name?.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
        <Text style={styles.meta}>{player.role} · {player.country}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rank: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 13,
    width: 28,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
