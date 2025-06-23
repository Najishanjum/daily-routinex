
import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

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

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useLocalStorage<CookieConsent | null>('cookie-consent', null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    if (!consent) {
      setShowBanner(true);
    } else {
      setPreferences(consent.preferences);
      // Apply cookie preferences to actual tracking scripts
      applyCookiePreferences(consent.preferences);
    }
  }, [consent]);

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Apply analytics cookies
    if (prefs.analytics) {
      // Enable Google Analytics or other analytics
      console.log('Analytics cookies enabled');
      // Example: gtag('consent', 'update', { analytics_storage: 'granted' });
    } else {
      console.log('Analytics cookies disabled');
      // Example: gtag('consent', 'update', { analytics_storage: 'denied' });
    }

    // Apply marketing cookies
    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
      // Example: gtag('consent', 'update', { ad_storage: 'granted' });
    } else {
      console.log('Marketing cookies disabled');
      // Example: gtag('consent', 'update', { ad_storage: 'denied' });
    }

    // Apply preference cookies
    if (prefs.preferences) {
      console.log('Preference cookies enabled');
    } else {
      console.log('Preference cookies disabled');
    }
  };

  const saveConsent = (newPreferences: CookiePreferences) => {
    const consentData: CookieConsent = {
      accepted: true,
      preferences: newPreferences,
      timestamp: new Date().toISOString()
    };
    
    setConsent(consentData);
    applyCookiePreferences(newPreferences);
    setShowBanner(false);
    setShowSettings(false);
    
    toast.success('Cookie preferences saved successfully!');
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    saveConsent(allAccepted);
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    saveConsent(onlyNecessary);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Necessary cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-2xl p-6 border border-border shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                <Cookie className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  🍪 We use cookies
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and improve our services. 
                  You can manage your preferences or learn more about our cookie policy.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button onClick={acceptAll} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Check className="w-4 h-4 mr-2" />
                    Accept All
                  </Button>
                  <Button onClick={rejectAll} variant="outline">
                    Reject All
                  </Button>
                  <Button onClick={() => setShowSettings(true)} variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={rejectAll}
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-6 h-6 text-amber-600" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Necessary Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These cookies are essential for the website to function properly. They cannot be disabled.
                  </p>
                </div>
                <Switch checked={preferences.necessary} disabled />
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Analytics Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how visitors interact with our website to improve user experience.
                  </p>
                </div>
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={() => togglePreference('analytics')}
                />
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Marketing Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Used to deliver relevant advertisements and track ad campaign performance.
                  </p>
                </div>
                <Switch 
                  checked={preferences.marketing} 
                  onCheckedChange={() => togglePreference('marketing')}
                />
              </div>
            </div>

            {/* Preference Cookies */}
            <div className="space-y-3 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Preference Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Remember your settings and preferences to provide a personalized experience.
                  </p>
                </div>
                <Switch 
                  checked={preferences.preferences} 
                  onCheckedChange={() => togglePreference('preferences')}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={acceptSelected} className="flex-1">
              Save Preferences
            </Button>
            <Button onClick={acceptAll} variant="outline" className="flex-1">
              Accept All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
