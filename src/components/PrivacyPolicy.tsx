
import React from 'react';
import { X, Shield, Database, Eye, Lock, Smartphone } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  if (!isOpen) return null;

  const sections = [
    {
      title: "Data Collection",
      icon: Database,
      content: "RoutineX stores all your data locally on your device using browser localStorage. We do not collect, transmit, or store any personal information on external servers."
    },
    {
      title: "Local Storage",
      icon: Smartphone,
      content: "Your tasks, preferences, and profile information are stored only in your browser's local storage. This data never leaves your device unless you explicitly export it."
    },
    {
      title: "Voice Recognition",
      icon: Eye,
      content: "Voice-to-text features use your browser's built-in speech recognition API. Voice data is processed locally and is not transmitted to our servers."
    },
    {
      title: "Data Security",
      icon: Lock,
      content: "Since all data is stored locally, you have complete control over your information. We recommend regular backups of your browser data if you want to preserve your routine history."
    },
    {
      title: "Third-Party Services",
      icon: Shield,
      content: "RoutineX may use browser APIs for speech recognition and other features. These services are governed by your browser's privacy policies."
    }
  ];

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Privacy Policy
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-gray-600 dark:text-gray-400 mb-6">
            <p className="mb-2">Last updated: {new Date().toLocaleDateString()}</p>
            <p>Your privacy is critically important to us. This Privacy Policy explains how RoutineX handles your information.</p>
          </div>

          <div className="glass-card p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                Privacy-First Design
              </h3>
            </div>
            <p className="text-green-800 dark:text-green-200">
              RoutineX is designed with privacy as a core principle. All your personal data stays on your device - we never see, collect, or store your information.
            </p>
          </div>

          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div key={index} className="glass-card p-4 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-12">
                  {section.content}
                </p>
              </div>
            );
          })}

          <div className="glass-card p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Contact Us</h3>
            <p className="text-blue-800 dark:text-blue-200">
              If you have any questions about this Privacy Policy, please contact us at: 
              <a href="mailto:najishanjum058@gmail.com" className="font-medium hover:underline ml-1">
                najishanjum058@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
