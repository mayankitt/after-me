'use client';

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/api/auth/signin');
    return null;
  }

  const handleDeleteAccount = async () => {
    if (!confirmed) {
      setError('Please tick the confirmation checkbox before deleting your account.');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Account deletion failed. Please contact support.');
      }
      // Sign out and redirect to home after successful deletion
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mr-4">
              ← Dashboard
            </Link>
            <span className="text-2xl font-bold text-white">Account Settings</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        {/* Account info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span>{session?.user?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span>{session?.user?.email ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Privacy</h2>
          <p className="text-gray-300 text-sm mb-4">
            Review how we handle your data in our{' '}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-gray-800 rounded-lg p-6 border border-red-800">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-gray-300 text-sm mb-6">
            Permanently delete your account and all documents stored in your vault. This action
            cannot be undone. Your audit history will be retained for legal compliance purposes.
          </p>

          <div className="flex items-start space-x-3 mb-6">
            <input
              type="checkbox"
              id="confirm-delete"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-600 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="confirm-delete" className="text-sm text-gray-300">
              I understand that deleting my account will permanently remove all my documents and
              this action cannot be reversed.
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="bg-red-700 hover:bg-red-800 disabled:bg-red-900 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {deleting ? 'Deleting account…' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
