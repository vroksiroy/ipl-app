import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import type { TeamStanding } from '../services/cricapi';

interface Props {
  team: TeamStanding;
  rank: number;
}

export default function TeamRow({ team, rank }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.rank}>{rank}</Text>
      {team.img ? (
        <Image source={{ uri: team.img }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Text style={styles.logoText}>{team.teamSName?.slice(0, 2)}</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>{team.teamSName ?? team.teamName}</Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>{team.matchesPlayed}</Text>
        <Text style={styles.stat}>{team.matchesWon}</Text>
        <Text style={styles.stat}>{team.matchesLost}</Text>
        <Text style={[styles.stat, styles.nrr]}>{team.nrr}</Text>
        <Text style={[styles.stat, styles.points]}>{team.points}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rank: {
    color: colors.textMuted,
    fontSize: 13,
    width: 20,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  logoPlaceholder: {
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    color: colors.textMuted,
    fontSize: 13,
    width: 28,
    textAlign: 'center',
  },
  nrr: {
    width: 40,
  },
  points: {
    color: colors.gold,
    fontWeight: '700',
    width: 24,
  },
});
