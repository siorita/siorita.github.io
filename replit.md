# Bioacoustic Bird Deterrent System

## Overview

This is a bioacoustic bird deterrent IoT control panel application. The system provides a web-based interface for controlling and monitoring an automated bird deterrent device that uses sound-based methods. Users can start/stop the system, trigger different sounds, and configure settings like interval timing and duration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The project has a dual frontend setup:

1. **Legacy Static Frontend** (root level): Simple HTML/CSS/JS files (`index.html`, `style.css`, `script.js`) using vanilla JavaScript with a mock API service. Uses Google Fonts (Inter) and localStorage for state persistence.

2. **Modern React Frontend** (`src/` directory): React 18 with TypeScript, using:
   - **Routing**: Wouter for lightweight client-side routing
   - **State Management**: TanStack React Query for server state
   - **UI Components**: Shadcn/ui component library built on Radix UI primitives
   - **Styling**: Tailwind CSS with CSS custom properties for theming

### Build System

- **Vite** for development server and bundling
- Server runs on port 5000 with host binding to 0.0.0.0
- Build script (`script/build.ts`) uses both Vite and esbuild for client and server bundling respectively

### Mock API Pattern

The current implementation uses a mock API service (`MockAPI` object in `script.js`) that:
- Simulates network latency (500ms)
- Stores state in localStorage
- Handles commands: START, STOP, and sound triggers
- Returns system status including power state, mode, and settings

### Component Architecture

UI components follow the Shadcn/ui pattern:
- Components are copy-pasted into `src/components/ui/`
- Built on Radix UI primitives for accessibility
- Styled with Tailwind CSS and class-variance-authority for variants
- Uses `cn()` utility for conditional class merging

## External Dependencies

### UI Framework Dependencies
- **@radix-ui/***: Multiple primitive components (dialog, dropdown, accordion, etc.)
- **class-variance-authority**: Component variant management
- **tailwind-merge** and **clsx**: CSS class utilities
- **lucide-react**: Icon library
- **embla-carousel-react**: Carousel functionality
- **react-day-picker**: Calendar/date picker
- **recharts**: Charting library
- **vaul**: Drawer component
- **cmdk**: Command palette
- **input-otp**: OTP input handling
- **react-resizable-panels**: Resizable panel layouts
- **react-hook-form**: Form handling

### Data & API
- **@tanstack/react-query**: Server state management and data fetching
- API requests use native fetch with credentials included

### Build Dependencies (from build script allowlist)
The build script bundles certain dependencies for faster cold starts:
- Database: `drizzle-orm`, `drizzle-zod`, `pg`
- Auth: `passport`, `passport-local`, `express-session`, `jsonwebtoken`
- HTTP: `express`, `cors`, `axios`
- AI: `@google/generative-ai`, `openai`
- Payments: `stripe`
- Other: `ws` (WebSocket), `multer` (file uploads), `nodemailer` (email)

### State Persistence
- Currently uses browser `localStorage` for system state
- Server-side database support is prepared via Drizzle ORM (database type to be configured)