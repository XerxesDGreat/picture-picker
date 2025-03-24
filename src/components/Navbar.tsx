'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            PicturePicker
          </Link>
          <div className="flex space-x-4">
            {session ? (
              <>
                <Link
                  href="/albums"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Albums
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 