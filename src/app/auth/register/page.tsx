'use client';

import Link from "next/link";
import { signIn } from "next-auth/react";

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Vault</h1>
          <p className="text-gray-400">Secure your digital legacy</p>
        </div>

        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-300 mb-2">🔑 Account Registration</h3>
          <p className="text-blue-200 text-sm">
            Accounts are managed through Keycloak, our identity provider. Click below to be taken
            to the registration page where you can create your account securely.
          </p>
        </div>

        <button
          onClick={() => signIn('keycloak', { callbackUrl: '/dashboard' })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors mb-4"
        >
          Continue to Keycloak
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
