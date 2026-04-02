import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(`cache:${key}`);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp < ttlMs) {
        return entry.data;
      }
    }
  } catch {}

  const data = await fetcher();
  try {
    await AsyncStorage.setItem(
      `cache:${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {}
  return data;
}

export async function clearCache(key?: string) {
  if (key) {
    await AsyncStorage.removeItem(`cache:${key}`);
  } else {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = (keys as string[]).filter((k) => k.startsWith('cache:'));
    await Promise.all(cacheKeys.map((k) => AsyncStorage.removeItem(k)));
  }
}
