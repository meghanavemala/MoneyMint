'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestAuthPage() {
  const { userId, sessionId, getToken } = useAuth();
  const [authState, setAuthState] = useState({
    userId: '',
    sessionId: '',
    token: '',
    error: '',
    loading: true,
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getToken();
        setAuthState({
          userId: userId || 'null',
          sessionId: sessionId || 'null',
          token: token ? 'Token received' : 'No token',
          error: '',
          loading: false,
        });
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false,
        }));
      }
    }

    checkAuth();
  }, [userId, sessionId, getToken]);

  if (authState.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md p-8">
          <h1 className="mb-4 text-2xl font-bold">Testing Authentication...</h1>
          <p>Please wait while we check your authentication status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Authentication Test</h1>

        {authState.error ? (
          <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
            <h2 className="font-bold text-red-800">Error</h2>
            <p className="text-red-700">{authState.error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-gray-700">User ID:</h2>
              <p className="rounded bg-gray-100 p-2 font-mono text-sm">
                {authState.userId || 'Not authenticated'}
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700">Session ID:</h2>
              <p className="rounded bg-gray-100 p-2 font-mono text-sm">
                {authState.sessionId || 'No active session'}
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700">Token Status:</h2>
              <p className="rounded bg-gray-100 p-2 font-mono text-sm">{authState.token}</p>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            {userId ? '✅ You are authenticated!' : '❌ You are not authenticated. Please sign in.'}
          </p>

          <div className="mt-4 flex space-x-4">
            <Link
              href="/dashboard"
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
            {!userId && (
              <Link
                href="/sign-in"
                className="rounded border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
