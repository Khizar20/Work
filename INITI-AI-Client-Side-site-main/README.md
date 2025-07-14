# VillaLaSala Landing Page

A modern, responsive landing page for VillaLaSala hotel with integrated AI chatbot functionality.

## Features

- 🏨 Hotel-specific branding and theming
- 🤖 Integrated Botpress AI chatbot
- 🌙 Dark/Light theme support
- 📱 Fully responsive design
- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS styling
- 🔒 Session-based hotel room integration

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment to Vercel

### Method 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Vercel will automatically detect Next.js and deploy

### Method 2: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Environment Variables

If you need to set environment variables in Vercel:

1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add any required variables

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── not-found.tsx       # Custom 404 page
│   └── globals.css         # Global styles
├── components/
│   ├── BotpressWebChat.tsx # AI chatbot integration
│   ├── ChatSection.tsx     # Chat interface
│   ├── ContactSection.tsx  # Contact information
│   ├── Header.tsx          # Navigation header
│   ├── HeroSection.tsx     # Landing hero section
│   └── ThemeToggle.tsx     # Dark/light mode toggle
├── config/
│   └── hotels.ts           # Hotel configuration
├── contexts/
│   ├── SessionContext.tsx  # Session management
│   └── ThemeContext.tsx    # Theme management
└── utils/
    └── session.ts          # Session utilities
```

## Usage

### Accessing Hotel Services

Guests can access personalized services by scanning QR codes in their hotel rooms. The QR codes contain session parameters:

```
https://your-domain.com/?hotel_id=villalasala&room_number=101
```

### Hotel Configuration

Hotels are configured in `src/config/hotels.ts`. Each hotel can have:

- Custom branding and colors
- Botpress chatbot integration
- Contact information
- Theme customization

## Troubleshooting

### Vercel 404 Error

If you get a 404 error on Vercel deployment:

1. ✅ Ensure `vercel.json` is present (already included)
2. ✅ Check that `next.config.ts` has proper configuration (already configured)
3. ✅ Verify all pages are properly exported (already fixed)
4. ✅ Ensure no TypeScript/ESLint errors (already resolved)

### Development Issues

- Make sure you're using Node.js 18 or later
- Clear `.next` folder if you encounter build cache issues
- Check that all dependencies are installed with `npm install`

## Technologies Used

- **Framework:** Next.js 15
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Icons:** Heroicons
- **Deployment:** Vercel
- **AI Chat:** Botpress

## Support

For technical support or questions about the deployment, please check:

1. [Next.js Documentation](https://nextjs.org/docs)
2. [Vercel Documentation](https://vercel.com/docs)
3. [Tailwind CSS Documentation](https://tailwindcss.com/docs)
