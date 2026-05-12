# SUSU Management System - Frontend

A modern React frontend for the SUSU savings and collection management system.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Routing**: React Router
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Authentication**: Supabase Auth
- **Payments**: Paystack

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your actual values:
   ```env
   VITE_API_URL=http://localhost:3333
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── common/         # Common components (forms, layout)
│   └── features/      # Feature-specific components
├── pages/              # Page components by role
│   ├── auth/           # Authentication pages
│   ├── customer/       # Customer-specific pages
│   ├── worker/         # Worker-specific pages
│   └── admin/          # Admin-specific pages
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── store/              # Zustand stores
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── lib/                # shadcn/ui utilities
```

## State Management Architecture

### Zustand + React Query Integration

This project uses a hybrid state management approach:

- **React Query**: Handles server state, caching, and data fetching
- **Zustand**: Stores client-side state and query variables

**Key Principle**: React Query is the source of truth for server data. Zustand stores only query variables (filters, pagination, UI state) that tell React Query what to fetch.

### Store Structure

- `authStore`: User authentication state and user data
- `queryVariablesStore`: Filter states, pagination, and UI variables

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Role-Based Access

The application supports three user roles:

- **Customer**: Personal savings management
- **Worker**: Cash collection and deposits
- **Admin**: System management and oversight

Each role has dedicated routes and functionality.

## API Integration

The frontend connects to the NestJS backend API at `/api/v1`. All API calls are handled through:

- Service layer in `src/services/`
- React Query hooks in `src/hooks/`
- Axios interceptors for authentication

## Development Notes

- Use TypeScript strictly
- Follow the established folder structure
- Components should be reusable and tested
- API calls should go through React Query
- UI components use Tailwind CSS + shadcn/ui

## Contributing

1. Follow the existing code patterns
2. Use TypeScript for all new code
3. Test your changes
4. Update documentation as needed
