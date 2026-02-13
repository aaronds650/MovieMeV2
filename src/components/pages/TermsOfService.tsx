import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="py-6 px-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-indigo-600">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-2">Terms of Service</h2>
            <p className="text-gray-500 mb-6">Effective Date: February 20, 2025</p>
            
            <p className="text-gray-600 mb-6">
              Welcome to MovieMe! These Terms of Service ("Terms") govern your use of the MovieMe application ("App"), website, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, please do not use our Services.
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">1. Acceptance of Terms</h3>
              <p className="text-gray-600 mb-4">By accessing or using MovieMe, you confirm that you:</p>
              <ul className="list-none space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Are at least 13 years old (or the minimum age required by your country's laws)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Have the legal capacity to agree to these Terms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Will comply with these Terms and all applicable laws and regulations</span>
                </li>
              </ul>
              <p className="text-gray-600">If you do not meet these requirements, you may not use the MovieMe Services.</p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">2. Description of Services</h3>
              <p className="text-gray-600">
                MovieMe is an AI-powered movie recommendation platform designed to help users discover movies based on their mood, genre, and preferences. The recommendations are generated using AI and third-party data sources, but we do not guarantee availability of movies on any specific streaming platforms.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">3. User Accounts & Registration</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Account Creation – To access certain features, you may need to create an account by providing a valid email address or username.</li>
                <li>Account Security – You are responsible for keeping your login credentials secure. We are not liable for unauthorized access to your account.</li>
                <li>Account Termination – We reserve the right to suspend or terminate your account if you violate these Terms.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">4. Acceptable Use</h3>
              <p className="text-gray-600 mb-4">You agree NOT to:</p>
              <ul className="list-none space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-red-600">🚫</span>
                  <span>Use MovieMe for any illegal or unauthorized purpose</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">🚫</span>
                  <span>Interfere with or disrupt our Services</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">🚫</span>
                  <span>Attempt to collect or distribute personal data of other users</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">🚫</span>
                  <span>Reverse-engineer, modify, or exploit our AI algorithms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">🚫</span>
                  <span>Use MovieMe to spread misinformation or harmful content</span>
                </li>
              </ul>
              <p className="text-gray-600">
                We reserve the right to take action, including removing content, suspending accounts, or pursuing legal action, if you violate these terms.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">5. Privacy & Data Usage</h3>
              <p className="text-gray-600">
                Your use of MovieMe is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. By using our Services, you agree to our data practices as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">6. Third-Party Services & Streaming Data</h3>
              <p className="text-gray-600">
                MovieMe does not host or provide access to streaming content. Instead, we aggregate movie information from third-party sources (e.g., TMDB, JustWatch, ReelGood). We are not responsible for the accuracy of streaming availability or external links.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">7. Limitation of Liability</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">🚨</span>
                  <div>
                    <p className="font-medium text-gray-900">No Guarantees</p>
                    <p className="text-gray-600">MovieMe is provided "AS IS" without any warranties. We do not guarantee the accuracy of recommendations or third-party data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">🚨</span>
                  <div>
                    <p className="font-medium text-gray-900">Limited Liability</p>
                    <p className="text-gray-600">To the maximum extent permitted by law, MovieMe shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-4">
                If you experience issues, please contact us before taking legal action.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">8. Changes to These Terms</h3>
              <p className="text-gray-600">
                We may update these Terms from time to time. Any changes will be posted on this page with a new Effective Date. Continued use of our Services after updates constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-medium mb-4">9. Contact Information</h3>
              <p className="text-gray-600">
                For any questions about these Terms, contact us at:
              </p>
              <p className="text-gray-600 mt-2">
                Email: info@moviemeapp.com
              </p>
              <p className="text-gray-600 mt-4">
                Thank you for using MovieMe!
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            © 2025 MovieMe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}