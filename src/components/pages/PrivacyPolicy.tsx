import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
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
          <h1 className="text-2xl font-bold text-indigo-600">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-2">Privacy Policy for MovieMe</h2>
            <p className="text-gray-500 mb-6">Last updated: February 20, 2025</p>
            
            <p className="text-gray-600 mb-6">
              MovieMe ("we," "our," or "us") respects your privacy and is committed to protecting it. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our MovieMe application ("App"). By using the App, you agree to the collection and use of information as described in this policy.
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">1. Information We Collect</h3>
              <p className="text-gray-600 mb-4">When you use MovieMe, we may collect the following types of data:</p>
              
              <h4 className="text-lg font-medium mb-2">1.1 Personal Information</h4>
              <p className="text-gray-600 mb-4">
                We collect personal information when you sign up for an account or use authentication services, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Email address (for login and account management)</li>
                <li>Username (if you choose to create one)</li>
                <li>Google or Apple authentication data (if you log in using those services)</li>
                <li>Profile preferences (such as favorite genres, moods, or saved movies)</li>
              </ul>

              <h4 className="text-lg font-medium mb-2">1.2 Automatically Collected Information</h4>
              <p className="text-gray-600 mb-4">
                When you use the App, we may collect certain information automatically, such as:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Device Information (device type, operating system)</li>
                <li>Usage Data (features accessed, timestamps)</li>
                <li>IP Address (to provide regional content and for security purposes)</li>
              </ul>

              <h4 className="text-lg font-medium mb-2">1.3 Third-Party Services Data</h4>
              <p className="text-gray-600 mb-4">
                If you choose to connect your account with third-party services (e.g., Google, Apple, or future streaming service integrations), we may receive certain profile information from them, such as:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Your name</li>
                <li>Email address</li>
                <li>Profile picture (if applicable)</li>
                <li>Authentication tokens</li>
              </ul>
              <p className="text-gray-600">We do not store passwords from third-party services.</p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">2. How We Use Your Information</h3>
              <p className="text-gray-600 mb-4">We use your data for the following purposes:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>To provide and improve the app's features (movie recommendations, user experience)</li>
                <li>To personalize content based on your preferences</li>
                <li>To authenticate users and allow access to accounts</li>
                <li>To improve security and prevent fraud</li>
                <li>To comply with legal requirements where necessary</li>
              </ul>
              <p className="text-gray-600">We do not sell or share your personal data with advertisers.</p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">3. How We Share Your Information</h3>
              <p className="text-gray-600 mb-4">
                We do not sell, rent, or trade your personal information. However, we may share information in the following situations:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>With Service Providers: We use third-party services (e.g., Supabase, OpenAI, Google Cloud) to store and process data securely</li>
                <li>For Legal Reasons: If required by law, we may disclose your data in response to a legal request (e.g., court order)</li>
                <li>With Your Consent: We will ask for your consent before sharing information in any other scenario</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">4. Data Storage and Security</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>We implement industry-standard security measures to protect your information, including encryption and secure authentication</li>
                <li>Your data is stored securely in our database (Supabase)</li>
                <li>We do not store sensitive authentication data (e.g., passwords from third-party logins)</li>
                <li>You can delete your account and associated data at any time by contacting us</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">5. Your Rights and Choices</h3>
              <p className="text-gray-600">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Access & Update: You can update your email, username, and preferences in the app</li>
                <li>Delete Your Data: You can request account deletion via the settings or by contacting us</li>
                <li>Opt-Out of Communications: If we send promotional emails in the future, you will be able to opt out</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">6. Third-Party Links and Services</h3>
              <p className="text-gray-600">
                MovieMe may contain links to external sites (e.g., movie streaming platforms). These third-party sites have their own privacy policies, and we are not responsible for their data practices.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">7. Children's Privacy</h3>
              <p className="text-gray-600">
                MovieMe is not intended for children under 13. We do not knowingly collect personal data from children. If you believe we have collected a child's data, please contact us, and we will delete it immediately.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-medium mb-4">8. Changes to This Policy</h3>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify users of significant changes by posting an update within the app. Your continued use of MovieMe constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-medium mb-4">9. Contact Information</h3>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, you can contact us at:
              </p>
              <ul className="list-none text-gray-600 space-y-2 mt-4">
                <li>Email: info@movemeapp.com</li>
                <li>Website: www.moviemeapp.com</li>
              </ul>
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