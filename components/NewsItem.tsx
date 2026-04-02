import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import type { NewsItem as NewsItemType } from '../services/cricapi';

interface Props {
  item: NewsItemType;
}

export default function NewsItem({ item }: Props) {
  function handlePress() {
    if (item.url) Linking.openURL(item.url);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      {item.imageurl ? (
        <Image source={{ uri: item.imageurl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.intro} numberOfLines={2}>{item.intro}</Text>
        <Text style={styles.source}>{item.source}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 90,
    height: 90,
  },
  imagePlaceholder: {
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  intro: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  source: {
    color: colors.gold,
    fontSize: 10,
    marginTop: 4,
  },
});
