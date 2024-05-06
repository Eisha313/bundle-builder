# Bundle Builder

A customizable product bundling tool for e-commerce stores that lets customers create their own discount bundles with drag-and-drop functionality and real-time pricing.

## Features

- 🎯 Drag-and-drop bundle builder with real-time price calculations
- 📊 Admin dashboard for configuring bundle rules and discounts
- 💳 Stripe checkout integration with automatic discount application
- 📦 Customer bundle history and saved bundles for reordering
- 🏷️ Tiered discount system based on bundle size

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bundle-builder.git
cd bundle-builder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Stripe keys and database URL
```

## Environment Variables

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
```

## Usage

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the bundle builder.

Admin dashboard available at [http://localhost:3000/admin](http://localhost:3000/admin).

## Project Structure

```
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utility functions and configurations
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
└── prisma/            # Database schema
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Stripe
- Prisma (database ORM)

## License

MIT