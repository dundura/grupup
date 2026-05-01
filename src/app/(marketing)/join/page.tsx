'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function JoinContent() {
  const params = useSearchParams();
  const name = params.get('name') || '';
  const email = params.get('email') || '';
  const signUpUrl = `/sign-up?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f3154] to-[#1a4a7a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0f3154] px-8 py-8 text-center">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-white text-2xl font-extrabold uppercase tracking-wide mb-2">Welcome to Grupup</h1>
          <p className="text-white/70 text-sm">Group training near you — affordable, organized, and fun</p>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {name && (
            <p className="text-[#0f3154] font-semibold text-base mb-4">
              Hi {name.split(' ')[0]}! Your profile is ready to set up.
            </p>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Create your free profile to find group training sessions near you and connect with other players at your level.
          </p>

          {/* Pre-filled info preview */}
          {(name || email) && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your info</p>
              {name && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 text-sm">👤</span>
                  <span className="text-gray-700 text-sm font-medium">{name}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">✉️</span>
                  <span className="text-gray-700 text-sm font-medium">{email}</span>
                </div>
              )}
            </div>
          )}

          <Link
            href={signUpUrl}
            className="block w-full text-center bg-[#e63946] hover:bg-[#c1121f] text-white font-bold text-base uppercase tracking-wide py-4 rounded-full transition-colors"
          >
            Create My Profile →
          </Link>

          <p className="text-center text-xs text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#e63946] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinContent />
    </Suspense>
  );
}
