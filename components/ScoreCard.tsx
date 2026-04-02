import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../constants/theme';
import type { Match } from '../services/cricapi';

interface Props {
  match: Match;
}

export default function ScoreCard({ match }: Props) {
  const router = useRouter();

  const team1 = match.teams?.[0] ?? 'TBD';
  const team2 = match.teams?.[1] ?? 'TBD';
  const score1 = match.score?.[0];
  const score2 = match.score?.[1];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/match/${match.id}`)}
      activeOpacity={0.8}
    >
      <Text style={styles.venue} numberOfLines={1}>{match.venue}</Text>
      <View style={styles.row}>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName} numberOfLines={1}>{team1}</Text>
          {score1 && (
            <Text style={styles.score}>{score1.r}/{score1.w} ({score1.o})</Text>
          )}
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={[styles.teamBlock, styles.alignRight]}>
          <Text style={styles.teamName} numberOfLines={1}>{team2}</Text>
          {score2 && (
            <Text style={styles.score}>{score2.r}/{score2.w} ({score2.o})</Text>
          )}
        </View>
      </View>
      <Text style={styles.status} numberOfLines={2}>{match.status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  venue: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamBlock: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  teamName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  score: {
    color: colors.gold,
    fontSize: 13,
    marginTop: 2,
  },
  vs: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: spacing.sm,
  },
  status: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
