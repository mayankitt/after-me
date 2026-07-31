'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const categories = [
  'Legal Documents',
  'Financial',
  'Insurance',
  'Property',
  'Medical',
  'Personal',
  'Digital Assets',
  'Other'
];

const documentTypes = [
  'Will',
  'Power of Attorney',
  'Healthcare Directive',
  'Trust Documents',
  'Bank Account Information',
  'Investment Details',
  'Insurance Policy',
  'Property Deed',
  'Medical Records',
  'Contact Information',
  'Personal Note',
  'Other'
];

export default function Upload() {
  const { status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    isRequired: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('name', formData.name || file.name);
      data.append('type', formData.type);
      data.append('category', formData.category);
      data.append('isRequired', String(formData.isRequired));

      const res = await fetch('/api/vault/upload', { method: 'POST', body: data });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Upload failed');
      }

      setSuccess(true);
      setTimeout(() => router.push('/vault'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-white mb-4">Document Uploaded Successfully!</h2>
          <p className="text-gray-400">Redirecting to your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/vault" className="text-blue-400 hover:text-blue-300 mr-4">
            ← Back to Vault
          </Link>
          <span className="text-2xl font-bold text-white">Upload Document</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File *
              </label>
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Defaults to filename if left blank"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Type *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select document type</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isRequired"
                id="isRequired"
                checked={formData.isRequired}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRequired" className="ml-2 text-sm text-gray-300">
                Mark as recommended document
              </label>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-3 px-4 rounded-md font-medium transition-colors"
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>

              <Link
                href="/vault"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium text-center transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-4">💡 Quick Tips</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Supported formats: PDF, images, Word documents, and more</li>
            <li>• Files are stored securely in S3-compatible object storage</li>
            <li>• Downloads use time-limited pre-signed URLs for security</li>
            <li>• Include location information for physical documents</li>
            <li>• Consider adding expiration dates for time-sensitive documents</li>
          </ul>
        </div>
      </div>
    </div>
  );
}