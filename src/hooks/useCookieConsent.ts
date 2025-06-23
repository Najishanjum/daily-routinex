
import { useLocalStorage } from './useLocalStorage';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsent {
  accepted: boolean;
  preferences: CookiePreferences;
  timestamp: string;
}

export function useCookieConsent() {
  const [consent, setConsent] = useLocalStorage<CookieConsent | null>('cookie-consent', null);

  const hasConsented = () => {
    return consent?.accepted === true;
  };

  const canUseAnalytics = () => {
    return consent?.preferences.analytics === true;
  };

  const canUseMarketing = () => {
    return consent?.preferences.marketing === true;
  };

  const canUsePreferences = () => {
    return consent?.preferences.preferences === true;
  };

  const updateConsent = (newConsent: CookieConsent) => {
    setConsent(newConsent);
  };

  const clearConsent = () => {
    setConsent(null);
  };

  return {
    consent,
    hasConsented,
    canUseAnalytics,
    canUseMarketing,
    canUsePreferences,
    updateConsent,
    clearConsent
  };
}
