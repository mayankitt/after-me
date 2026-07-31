'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Document {
  key: string;
  name: string;
  uploadDate: string;
  size: number;
}

export default function Vault() {
  const { status } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/vault/documents')
        .then((res) => res.json())
        .then((data) => {
          setDocuments(data.documents ?? []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleDeleteDocument = async (key: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    await fetch(`/api/vault/documents?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    setDocuments((prev) => prev.filter((doc) => doc.key !== key));
  };

  const handleDownload = async (key: string, name: string) => {
    const res = await fetch(`/api/vault/download?key=${encodeURIComponent(key)}`);
    if (!res.ok) return;
    const { url } = await res.json();
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  if (status === 'loading' || loading) {
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
          <div className="flex items-center space-x-4">
            <Link 
              href="/vault/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Upload Document
            </Link>
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
        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Documents Found</h3>
            <p className="text-gray-400 mb-6">You haven&apos;t uploaded any documents yet.</p>
            <Link 
              href="/vault/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md inline-block"
            >
              Upload Your First Document
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.key} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{doc.name}</h3>
                    <p className="text-sm text-gray-400">
                      {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.key)}
                    className="text-red-400 hover:text-red-300 text-sm"
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleDownload(doc.key, doc.name)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm"
                  >
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
                All documents are stored securely in S3-compatible object storage. Access is protected
                by Keycloak authentication and time-limited pre-signed download URLs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
