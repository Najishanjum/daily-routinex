
import React from 'react';
import { X, Shield, FileText, Users, AlertTriangle } from 'lucide-react';

interface TermsConditionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsConditions({ isOpen, onClose }: TermsConditionsProps) {
  if (!isOpen) return null;

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: FileText,
      content: "By accessing and using RoutineX, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      title: "2. Use License",
      icon: Shield,
      content: "Permission is granted to temporarily use RoutineX for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
    },
    {
      title: "3. User Account",
      icon: Users,
      content: "You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account."
    },
    {
      title: "4. Privacy",
      icon: Shield,
      content: "Your privacy is important to us. All personal data is stored locally on your device. We do not collect or store personal information on external servers."
    },
    {
      title: "5. Disclaimer",
      icon: AlertTriangle,
      content: "The information on this app is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms."
    }
  ];

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Terms & Conditions
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
            <p>Welcome to RoutineX. These terms and conditions outline the rules and regulations for the use of RoutineX's Application.</p>
          </div>

          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div key={index} className="glass-card p-4 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Contact Information</h3>
            <p className="text-blue-800 dark:text-blue-200">
              If you have any questions about these Terms & Conditions, please contact us at: 
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
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
