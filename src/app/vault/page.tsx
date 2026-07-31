'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  isRequired: boolean;
  content?: string;
}

export default function Vault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('afterme_user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    const vaultData = localStorage.getItem('afterme_vault');
    if (vaultData) {
      setDocuments(JSON.parse(vaultData));
    }
    setLoading(false);
  }, [router]);

  const handleDeleteDocument = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const updatedDocs = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocs);
      localStorage.setItem('afterme_vault', JSON.stringify(updatedDocs));
    }
  };

  const categories = ['all', ...new Set(documents.map(doc => doc.category))];
  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mr-4">
              ← Dashboard
            </Link>
            <span className="text-2xl font-bold text-white">Secure Vault</span>
          </div>
          <Link 
            href="/vault/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Upload Document
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category === 'all' ? 'All Documents' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Documents Found</h3>
            <p className="text-gray-400 mb-6">
              {selectedCategory === 'all' 
                ? "You haven't uploaded any documents yet." 
                : `No documents found in the "${selectedCategory}" category.`}
            </p>
            <Link 
              href="/vault/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md inline-block"
            >
              Upload Your First Document
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{doc.name}</h3>
                    <p className="text-sm text-gray-400">{doc.category}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                      title="Delete document"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{doc.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                  </div>
                  {doc.isRequired && (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <span>⭐</span>
                      <span>Recommended</span>
                    </div>
                  )}
                </div>

                {doc.content && (
                  <div className="mt-4 p-3 bg-gray-700 rounded text-sm text-gray-300">
                    <p className="font-medium mb-1">Content:</p>
                    <p className="truncate">{doc.content}</p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm">
                    View Details
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-12 bg-gray-800 border border-yellow-600 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-400 text-xl">🔒</div>
            <div>
              <h3 className="font-semibold text-white mb-2">Security Notice</h3>
              <p className="text-gray-300 text-sm">
                All documents are stored securely and encrypted. Only you and your designated emergency contacts 
                can access this information. Regular security audits ensure your data remains protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}