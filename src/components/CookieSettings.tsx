
import React, { useState } from 'react';
import { Cookie, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { toast } from 'sonner';

export function CookieSettings() {
  const { consent, updateConsent } = useCookieConsent();
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState(
    consent?.preferences || {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    }
  );

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'necessary') return;
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const savePreferences = () => {
    const newConsent = {
      accepted: true,
      preferences,
      timestamp: new Date().toISOString()
    };
    
    updateConsent(newConsent);
    setIsOpen(false);
    toast.success('Cookie preferences updated!');
  };

  if (!consent?.accepted) {
    return null; // Don't show if user hasn't consented yet
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Cookie className="w-4 h-4" />
          Cookie Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Manage Cookie Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Necessary Cookies</p>
              <p className="text-sm text-muted-foreground">Required for basic site functionality</p>
            </div>
            <Switch checked={preferences.necessary} disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Analytics Cookies</p>
              <p className="text-sm text-muted-foreground">Help improve site performance</p>
            </div>
            <Switch 
              checked={preferences.analytics}
              onCheckedChange={() => togglePreference('analytics')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Marketing Cookies</p>
              <p className="text-sm text-muted-foreground">Personalized advertisements</p>
            </div>
            <Switch 
              checked={preferences.marketing}
              onCheckedChange={() => togglePreference('marketing')}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium">Preference Cookies</p>
              <p className="text-sm text-muted-foreground">Remember your settings</p>
            </div>
            <Switch 
              checked={preferences.preferences}
              onCheckedChange={() => togglePreference('preferences')}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={savePreferences} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
