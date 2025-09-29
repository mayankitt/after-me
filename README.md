# After Me - Digital Legacy Vault

A secure Progressive Web Application (PWA) that helps users create password-protected vaults for important documents that their loved ones will need after they're gone.

## Features

- 🔒 **Secure & Private**: Password-protected vaults with client-side storage
- 🌍 **Country-Specific Suggestions**: Personalized document recommendations based on user's country
- 📱 **Progressive Web App**: Installable on mobile and desktop devices
- 👨‍👩‍👧‍👦 **Family Access**: Emergency contact management for vault access
- 📄 **Document Management**: Upload and organize important documents by category
- 📊 **Progress Tracking**: Visual progress indicator for document completion

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **PWA Support**: next-pwa
- **Deployment**: Vercel-ready

## Document Categories

The app suggests documents based on the user's country:

### United States
- **Legal**: Will, Power of Attorney, Healthcare Directive, Trust Documents
- **Financial**: Bank Accounts, Investment Accounts, 401k/IRA, Social Security
- **Insurance**: Life, Health, Auto, Home Insurance
- **Property**: Property Deeds, Mortgage Information, Vehicle Titles

### United Kingdom
- **Legal**: Will, Lasting Power of Attorney, Advance Decision, Trust Documents
- **Financial**: Bank Details, ISA Information, Pension Details, National Insurance
- **Insurance**: Life Assurance, Home, Motor, Travel Insurance
- **Property**: Property Deeds, Mortgage Details, Council Tax Information

### Canada
- **Legal**: Will, Power of Attorney, Personal Directive, Trust Documents
- **Financial**: Bank Information, RRSP/TFSA, CPP Information, SIN
- **Insurance**: Life, Health, Auto, Home Insurance
- **Property**: Property Deeds, Mortgage Information, Vehicle Registration

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This application is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and configure the build
3. The app will be deployed with PWA capabilities

## PWA Installation

When accessing the application on a mobile device or desktop browser, users will see an "Install App" button that allows them to install the application directly to their device.

## Security Note

This demo version stores data locally in the browser's localStorage for demonstration purposes. In a production environment, data would be:

- Encrypted end-to-end
- Stored securely in the cloud
- Protected with proper authentication
- Backed up with redundancy
- Audited regularly for security

## Usage

1. **Register**: Create an account with your country and emergency contact
2. **Dashboard**: View progress and country-specific document suggestions
3. **Upload**: Add documents with metadata and location information
4. **Vault**: Browse and manage uploaded documents
5. **Share**: Configure emergency contact access (future feature)

## Contributing

This is a demonstration project showcasing PWA capabilities and thoughtful UX design for sensitive document management.
