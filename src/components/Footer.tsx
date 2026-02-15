
import React from 'react';
import { Github, Linkedin, Facebook, Instagram, Phone, Mail, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
}

export function Footer({ onTermsClick, onPrivacyClick }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/md-najish-anjum-044078328?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      icon: Linkedin,
      color: 'hover:text-blue-500'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/Najishanjum',
      icon: Github,
      color: 'hover:text-gray-600 dark:hover:text-gray-300'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/16NSRahFs2/',
      icon: Facebook,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/najish.onic?igsh=Z2cwejR1a2xqbWl6',
      icon: Instagram,
      color: 'hover:text-pink-500'
    }
  ];

  return (
    <footer className="glass-header border-t border-white/20 dark:border-gray-700/20 mt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RoutineX
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your personal productivity tracker to organize daily routines and achieve your goals.
            </p>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Legal
            </h4>
            <div className="space-y-2 text-sm">
              <button
                onClick={onTermsClick}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Terms & Conditions
              </button>
              <button
                onClick={onPrivacyClick}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:najishanjum058@gmail.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  najishanjum058@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <a href="https://wa.me/917631296157" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  +91 7631296157
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Follow Me
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg bg-white/10 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 transition-all duration-300 hover:scale-110 ${link.color}`}
                    title={link.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 dark:border-gray-700/20 mt-8 pt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {currentYear} RoutineX. All rights reserved. Developed by{' '}
            <a href="https://najish-anjum-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline underline-offset-2">Najish Anjum</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
