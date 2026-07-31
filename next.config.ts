import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

// Security headers applied to every response.
// CSP uses a nonce-less approach suitable for Next.js with Tailwind.
// Tighten script-src when you add a nonce-based CSP in the middleware.
const securityHeaders = [
  // Prevent browsers from sniffing MIME types
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Deny framing (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },
  // Reduce referrer leakage
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HSTS — 2-year max-age, include subdomains, preload-ready
  // Only effective over HTTPS; browsers enforce it on subsequent visits.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its inline scripts; 'unsafe-eval'
      // is needed by Turbopack in development only — remove it via env in prod.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      // API calls go to the same origin; Keycloak OIDC calls go to its host.
      // Update KEYCLOAK_HOST below to match your Keycloak deployment URL.
      "connect-src 'self'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withPWA(nextConfig);
