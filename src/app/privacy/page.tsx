import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – After Me",
  description: "How After Me collects, uses, and protects your personal data.",
};

export default function PrivacyPolicy() {
  const lastUpdated = "2024-01-01";

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
            ← Back to Home
          </Link>
          <span className="text-xl font-bold text-white">Privacy Policy</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-gray-800 rounded-lg p-8 space-y-8 text-gray-300">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-gray-400 text-sm">Last updated: {lastUpdated}</p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Who We Are</h2>
            <p>
              After Me (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a secure digital vault service
              that allows individuals to store and share important documents with their designated
              contacts. This Privacy Policy explains how we collect, use, and protect your personal
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Data We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Account information</strong> — name, email address,
                and profile data provided through your identity provider (Keycloak).
              </li>
              <li>
                <strong className="text-white">Documents you upload</strong> — files you store in
                your vault, including their names, types, and metadata.
              </li>
              <li>
                <strong className="text-white">Usage data</strong> — structured audit logs of
                actions (uploads, downloads, deletions) including timestamps and IP addresses.
                These are retained for security and legal accountability.
              </li>
              <li>
                <strong className="text-white">Technical data</strong> — browser type, operating
                system, and session identifiers necessary to operate the service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and operate the vault service</li>
              <li>To authenticate you and protect your account</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
              <li>To comply with applicable legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data to third parties. We do not use your data for
              advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage &amp; Security</h2>
            <p>
              Your documents are stored in encrypted S3-compatible object storage with server-side
              encryption (AES-256). Access to your files requires authentication and is scoped
              exclusively to your account. Download links are time-limited (1 hour) and cannot be
              shared or reused after expiry.
            </p>
            <p className="mt-3">
              All data is stored in the region disclosed in our service configuration. We do not
              transfer your data across regional boundaries without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              Your documents and account metadata are retained for as long as your account is
              active. Audit logs are retained for a minimum of 12 months for security and
              compliance purposes, even after account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>
                <strong className="text-white">Right of access</strong> — request a copy of your
                personal data.
              </li>
              <li>
                <strong className="text-white">Right to rectification</strong> — correct inaccurate
                data.
              </li>
              <li>
                <strong className="text-white">Right to erasure</strong> — delete your account and
                all associated documents. You can exercise this right from the{" "}
                <Link href="/settings" className="text-blue-400 hover:text-blue-300">
                  Settings
                </Link>{" "}
                page.
              </li>
              <li>
                <strong className="text-white">Right to data portability</strong> — export your
                documents (available via the vault download feature).
              </li>
              <li>
                <strong className="text-white">Right to object</strong> — object to certain
                processing activities.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us or use the self-service options
              in your{" "}
              <Link href="/settings" className="text-blue-400 hover:text-blue-300">
                account settings
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
            <p>
              We use only essential session cookies required to authenticate you and maintain your
              logged-in state. We do not use tracking, analytics, or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Keycloak</strong> — identity and access management.
                Your authentication credentials are managed by Keycloak and are not stored by
                After Me directly.
              </li>
              <li>
                <strong className="text-white">S3-compatible storage</strong> — your documents are
                stored with an S3-compatible provider. The provider is contractually required to
                maintain appropriate security standards.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by updating the &quot;last updated&quot; date at the top of this page and, where
              appropriate, through in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or your data, please contact us
              through the support channel listed in your account portal.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
