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
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    content: '',
    isRequired: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('afterme_user');
    if (!userData) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newDocument: Document = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        category: formData.category,
        content: formData.content,
        isRequired: formData.isRequired,
        uploadDate: new Date().toISOString()
      };

      // Get existing documents
      const existingDocs = localStorage.getItem('afterme_vault');
      const documents = existingDocs ? JSON.parse(existingDocs) : [];
      
      // Add new document
      documents.push(newDocument);
      localStorage.setItem('afterme_vault', JSON.stringify(documents));

      setSuccess(true);
      setTimeout(() => {
        router.push('/vault');
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

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
                Document Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Last Will and Testament"
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Content / Notes
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                placeholder="Enter important information, account numbers, locations, or any relevant details..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                For security, avoid storing actual file content. Instead, include references, locations, or instructions.
              </p>
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

            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-semibold text-blue-300 mb-2">🔒 Security Note</h3>
              <p className="text-blue-200 text-sm">
                For maximum security, this demo stores information locally in your browser. 
                In a production environment, all data would be encrypted and stored securely in the cloud 
                with proper access controls and backup systems.
              </p>
            </div>

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
            <li>• Include location information for physical documents</li>
            <li>• Add contact details for lawyers, financial advisors, or other professionals</li>
            <li>• Include account numbers and institution names for financial documents</li>
            <li>• Consider adding expiration dates for time-sensitive documents</li>
            <li>• Include any special instructions or wishes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}