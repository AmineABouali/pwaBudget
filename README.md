# BudgetPro - Budget Management PWA

A complete offline-first Progressive Web App for budget management, built with Next.js 15, TypeScript, and Tailwind CSS.

![BudgetPro](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)

## ✨ Features

### Core Features
- **💰 Transaction Management**: Add income and expense transactions with categorization
- **📊 Visual Dashboard**: Interactive charts showing spending trends and category breakdown
- **🎯 Budget Planning**: Set monthly budgets with rollover options and spending alerts
- **📱 Cross-Platform**: Works on web, mobile, and desktop with responsive design

### PWA Capabilities
- **📴 Offline-First**: Full functionality without internet connection
- **🔄 Background Sync**: Automatic data synchronization when connectivity returns
- **🔔 Push Notifications**: Budget alerts and reminders (when implemented)
- **📲 Installable**: Add to home screen on mobile and desktop
- **⚡ Fast**: Service worker caching for instant load times

### Technical Features
- **IndexedDB Storage**: Local data persistence using Dexie.js
- **Real-time Updates**: Live dashboard updates as you add transactions
- **Export/Import**: Data portability for backup and migration
- **Secure**: HTTPS enforcement and client-side data validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone or extract the project**
```bash
cd budget-pro-pwa
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

To serve the production build locally:

```bash
npx serve@latest out
```

## 📁 Project Structure

```
budget-pro-pwa/
├── app/
│   ├── api/
│   │   └── sync/
│   │       └── route.ts          # API endpoint for data sync
│   ├── globals.css               # Global styles with Tailwind
│   ├── layout.tsx                # Root layout with PWA metadata
│   └── page.tsx                  # Main dashboard page
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.ts
│   ├── BudgetManager.tsx         # Budget creation and tracking
│   ├── Dashboard.tsx             # Main dashboard with charts
│   ├── InstallPrompt.tsx         # PWA install prompt
│   ├── OfflineIndicator.tsx      # Online/offline status indicator
│   ├── Providers.tsx             # App providers wrapper
│   └── TransactionForm.tsx       # Add transaction form
├── lib/
│   ├── db.ts                     # IndexedDB database layer
│   └── utils.ts                  # Utility functions
├── public/
│   ├── icons/                    # PWA icons (add your own)
│   ├── manifest.json             # Web App Manifest
│   └── screenshots/              # App screenshots for PWA
├── types/
│   └── index.ts                  # TypeScript type definitions
├── next.config.js                # Next.js configuration with PWA
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Project dependencies
```

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Headless UI primitives
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Offline & Storage
- **Dexie.js** - IndexedDB wrapper for local storage
- **next-pwa** - PWA configuration and service worker
- **Service Workers** - Background sync and caching

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## 📲 PWA Configuration

### Icons
Place your app icons in `public/icons/`:
- icon-72x72.png through icon-512x512.png
- Maskable icons recommended for adaptive shapes

Generate icons using:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Figma Icon Template](https://www.figma.com/community/file/1141666947323894027)

### Screenshots
Add screenshots to `public/screenshots/` for app store listings.

### Manifest
The `manifest.json` is configured for:
- Standalone display mode
- Theme colors matching the UI
- Shortcuts for quick actions
- Multiple icon sizes

## 🔧 Customization

### Adding New Categories
Edit `lib/db.ts` and modify `defaultCategories`:

```typescript
const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Your Category', color: '#hexcolor', icon: 'emoji', isDefault: true },
  // ...
]
```

### Changing Colors
Modify `app/globals.css` CSS variables:

```css
:root {
  --primary: 217 91% 60%;      /* Change primary color */
  --background: 222 47% 6%;    /* Change background */
  /* ... */
}
```

### API Integration
The sync API is located at `app/api/sync/route.ts`. Connect to your backend:

```typescript
// In the POST handler
await yourDatabase.transactions.create({
  ...body,
  userId: authenticatedUser.id
})
```

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 16.4+ (iOS and macOS)
- Samsung Internet

## 📱 Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home Screen"
4. Tap "Add"

### Desktop (Chrome/Edge)
1. Click install icon in address bar
2. Click "Install"

## 🔒 Security

- All data stored locally in browser (IndexedDB)
- HTTPS required for PWA features
- Input validation on all forms
- XSS protection through React's escaping
- CSP headers recommended for production

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

## 🐛 Troubleshooting

### Build Errors
- Ensure Node.js 18+ is installed
- Delete `node_modules` and `package-lock.json`, then `npm install`

### PWA Not Working
- Must serve over HTTPS (localhost exception for development)
- Check browser console for service worker errors
- Verify manifest.json is valid

### Data Not Persisting
- Check browser storage permissions
- Verify IndexedDB is enabled
- Check browser storage quotas

---

Built with ❤️ using Next.js and modern web technologies.
