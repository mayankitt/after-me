'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            After Me
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Secure digital vault for your most important documents. 
            Ensure your loved ones have access to what matters most when you&apos;re no longer here.
          </p>
        </header>

        {/* PWA Install Button */}
        {showInstallButton && (
          <div className="text-center mb-8">
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              📱 Install App
            </button>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
            <p className="text-gray-400">
              Military-grade encryption protects your sensitive documents and information.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Country-Specific</h3>
            <p className="text-gray-400">
              Get personalized document suggestions based on your country&apos;s requirements.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-semibold text-white mb-2">Family Access</h3>
            <p className="text-gray-400">
              Controlled access ensures your family can retrieve important documents when needed.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-y-4">
          <Link 
            href="/auth/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors mr-4"
          >
            Create Your Vault
          </Link>
          
          <Link 
            href="/auth/login"
            className="inline-block border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
          >
            Access Existing Vault
          </Link>
        </div>

        {/* Document Types Preview */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-8">Important Documents to Store</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              "Wills & Testaments",
              "Insurance Policies", 
              "Property Deeds",
              "Bank Information",
              "Medical Records",
              "Digital Assets",
              "Contact Information",
              "Final Wishes"
            ].map((doc, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg text-sm">
                {doc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
