'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Document {
  key: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  size: number;
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
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/vault/documents')
        .then((res) => res.json())
        .then((data) => setDocuments(data.documents ?? []))
        .catch(console.error);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const suggestions = documentSuggestions.default;
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
            <span className="text-gray-300">Welcome, {session.user?.name ?? session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
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
                  style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{Math.min(completionPercentage, 100)}%</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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
        </div>

        {/* Document Suggestions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Suggested Documents</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {suggestions.map((category, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">{category.category}</h3>
                <ul className="space-y-2">
                  {category.documents.map((doc, docIndex) => (
                    <li key={docIndex} className="flex items-center space-x-2 text-sm">
                      <span className="w-4 h-4 rounded-full bg-gray-500"></span>
                      <span className="text-gray-300">{doc}</span>
                    </li>
                  ))}
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
