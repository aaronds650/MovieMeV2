import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-indigo-600">MovieMe</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Terms of Service
            </Link>
            <a
              href="mailto:support@moviemeapp.com"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Contact Us
            </a>
          </nav>

          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MovieMe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}