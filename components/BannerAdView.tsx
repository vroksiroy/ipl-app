import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

const adUnitId = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

export default function BannerAdView() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 4,
  },
});
