'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  emergencyContact: string;
  emergencyEmail: string;
  createdAt: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  isRequired: boolean;
}

const documentSuggestions: Record<string, Array<{category: string, documents: string[]}>> = {
  US: [
    { category: 'Legal Documents', documents: ['Will', 'Power of Attorney', 'Healthcare Directive', 'Trust Documents'] },
    { category: 'Financial', documents: ['Bank Account Information', 'Investment Accounts', '401k/IRA Details', 'Social Security Info'] },
    { category: 'Insurance', documents: ['Life Insurance Policy', 'Health Insurance', 'Auto Insurance', 'Home Insurance'] },
    { category: 'Property', documents: ['Property Deeds', 'Mortgage Information', 'Vehicle Titles'] }
  ],
  UK: [
    { category: 'Legal Documents', documents: ['Will', 'Lasting Power of Attorney', 'Advance Decision', 'Trust Documents'] },
    { category: 'Financial', documents: ['Bank Account Details', 'ISA Information', 'Pension Details', 'National Insurance Number'] },
    { category: 'Insurance', documents: ['Life Assurance', 'Home Insurance', 'Motor Insurance', 'Travel Insurance'] },
    { category: 'Property', documents: ['Property Deeds', 'Mortgage Details', 'Council Tax Information'] }
  ],
  CA: [
    { category: 'Legal Documents', documents: ['Will', 'Power of Attorney', 'Personal Directive', 'Trust Documents'] },
    { category: 'Financial', documents: ['Bank Information', 'RRSP/TFSA Details', 'CPP Information', 'SIN'] },
    { category: 'Insurance', documents: ['Life Insurance', 'Health Insurance', 'Auto Insurance', 'Home Insurance'] },
    { category: 'Property', documents: ['Property Deeds', 'Mortgage Information', 'Vehicle Registration'] }
  ],
  default: [
    { category: 'Legal Documents', documents: ['Will', 'Power of Attorney', 'Healthcare Directive'] },
    { category: 'Financial', documents: ['Bank Account Information', 'Investment Details', 'Pension Information'] },
    { category: 'Insurance', documents: ['Life Insurance', 'Health Insurance', 'Property Insurance'] },
    { category: 'Personal', documents: ['Identity Documents', 'Contact Information', 'Personal Wishes'] }
  ]
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('afterme_user');
    const vaultData = localStorage.getItem('afterme_vault');
    
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    if (vaultData) {
      setDocuments(JSON.parse(vaultData));
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('afterme_user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const suggestions = documentSuggestions[user.country] || documentSuggestions.default;
  const totalSuggested = suggestions.reduce((acc, cat) => acc + cat.documents.length, 0);
  const completedCount = documents.length;
  const completionPercentage = totalSuggested > 0 ? Math.round((completedCount / totalSuggested) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">After Me Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Vault Progress</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Documents Stored</span>
                <span>{completedCount} of {totalSuggested} suggested</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link 
            href="/vault/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors"
          >
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold">Upload Document</h3>
            <p className="text-sm opacity-90">Add a new document to your vault</p>
          </Link>
          
          <Link 
            href="/vault"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors"
          >
            <div className="text-3xl mb-2">🗂️</div>
            <h3 className="font-semibold">View Vault</h3>
            <p className="text-sm opacity-90">Browse all stored documents</p>
          </Link>
          
          <Link 
            href="/vault/share"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors"
          >
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold">Share Access</h3>
            <p className="text-sm opacity-90">Manage emergency contacts</p>
          </Link>
        </div>

        {/* Document Suggestions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Suggested Documents for {user.country === 'US' ? 'United States' : 
            user.country === 'UK' ? 'United Kingdom' : 
            user.country === 'CA' ? 'Canada' : 'Your Country'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {suggestions.map((category, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">{category.category}</h3>
                <ul className="space-y-2">
                  {category.documents.map((doc, docIndex) => {
                    const isUploaded = documents.some(d => d.name.toLowerCase().includes(doc.toLowerCase()));
                    return (
                      <li key={docIndex} className="flex items-center space-x-2 text-sm">
                        <span className={`w-4 h-4 rounded-full ${isUploaded ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        <span className={`${isUploaded ? 'text-green-300' : 'text-gray-300'}`}>
                          {doc}
                        </span>
                        {isUploaded && <span className="text-green-400">✓</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/vault/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Start Adding Documents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}