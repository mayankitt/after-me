'use client';

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Access your secure vault</p>
        </div>

        <button
          onClick={() => signIn('keycloak', { callbackUrl: '/dashboard' })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          Sign In with Keycloak
        </button>

        <p className="mt-6 text-gray-400 text-sm">
          Don&apos;t have an account? Register through your Keycloak portal or contact your administrator.
        </p>
      </div>
    </div>
  );
}
