'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Wicked Fox Works. All rights reserved.
          </div>
          <Link 
            href="/faq" 
            className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
          >
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
} 