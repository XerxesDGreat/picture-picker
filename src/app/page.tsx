'use client';

import PageLayout from '@/components/PageLayout';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignOutMessage() {
  const searchParams = useSearchParams();
  const signedOut = searchParams.get('signedOut');

  if (!signedOut) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-center" role="alert">
      <span className="block sm:inline">You have been signed out successfully.</span>
    </div>
  );
}

export default function Home() {
  return (
    <PageLayout>
      <main className="min-h-[calc(100vh-4rem)]">
        <Suspense>
          <SignOutMessage />
        </Suspense>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Share Your Moments, Share Your Story
              </h1>
              <p className="text-xl mb-8">
                Create beautiful photo albums, share with friends, and let them vote on your best shots.
              </p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-500 text-4xl mb-4">📸</div>
                <h3 className="text-xl font-semibold mb-2">Easy Photo Upload</h3>
                <p className="text-gray-600">
                  Upload photos from your desktop or camera roll with just a few clicks.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-500 text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">Share with Anyone</h3>
                <p className="text-gray-600">
                  Share your albums with friends and family, and let them vote on their favorites.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-500 text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-2">Vote and Rank</h3>
                <p className="text-gray-600">
                  Let your audience vote on their favorite photos and see what rises to the top.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Sharing?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our community of photographers and start sharing your moments today.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
              Create Your First Album
            </button>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
