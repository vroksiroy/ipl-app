import { useEffect, useRef } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const COOLDOWN_MS = 3 * 60 * 1000;

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

export function useInterstitialAd() {
  const ad = useRef(InterstitialAd.createForAdRequest(adUnitId)).current;
  const lastShown = useRef<number>(0);
  const loaded = useRef(false);

  useEffect(() => {
    const onLoad = ad.addAdEventListener(AdEventType.LOADED, () => {
      loaded.current = true;
    });
    const onClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loaded.current = false;
      ad.load();
    });
    ad.load();
    return () => { onLoad(); onClose(); };
  }, []);

  function show() {
    const now = Date.now();
    if (loaded.current && now - lastShown.current > COOLDOWN_MS) {
      lastShown.current = now;
      ad.show();
    }
  }

  return { show };
}
