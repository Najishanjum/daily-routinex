
import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify({
      accepted: true,
      preferences: allAccepted,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      accepted: true,
      preferences: preferences,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie-consent', JSON.stringify({
      accepted: true,
      preferences: onlyNecessary,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="glass-card rounded-2xl p-6 mx-auto max-w-4xl border border-white/20 dark:border-gray-700/20">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
              <Cookie className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                We use cookies
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage, and improve our services. 
                You can manage your preferences or learn more about our cookie policy.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Accept All
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Customize
                </button>
              </div>
            </div>
            
            <button
              onClick={rejectAll}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 modal-backdrop z-60 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cookie Preferences
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Necessary Cookies
                  </h3>
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  These cookies are essential for the website to function properly. They cannot be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Analytics Cookies
                  </h3>
                  <button
                    onClick={() => setPreferences({...preferences, analytics: !preferences.analytics})}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.analytics ? 'ml-auto' : ''
                    }`} />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Help us understand how visitors interact with our website to improve user experience.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Marketing Cookies
                  </h3>
                  <button
                    onClick={() => setPreferences({...preferences, marketing: !preferences.marketing})}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.marketing ? 'ml-auto' : ''
                    }`} />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Used to deliver relevant advertisements and track ad campaign performance.
                </p>
              </div>

              {/* Preference Cookies */}
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Preference Cookies
                  </h3>
                  <button
                    onClick={() => setPreferences({...preferences, preferences: !preferences.preferences})}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.preferences ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences.preferences ? 'ml-auto' : ''
                    }`} />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Remember your settings and preferences to provide a personalized experience.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={acceptSelected}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
