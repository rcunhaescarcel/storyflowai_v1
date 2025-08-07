# AI Development Rules

This document outlines the rules and conventions for the AI to follow when developing this application. The goal is to maintain code quality, consistency, and predictability.

## Tech Stack

This project is built with a modern, robust tech stack:

- **Build Tool**: Vite for fast development and optimized builds.
- **Framework**: React for building the user interface.
- **Language**: TypeScript for type safety and improved developer experience.
- **Styling**: Tailwind CSS for a utility-first styling approach.
- **UI Components**: A custom component library built with `shadcn/ui` and Radix UI.
- **Routing**: `react-router-dom` for client-side navigation.
- **Data Fetching**: `@tanstack/react-query` for managing server state.
- **Forms**: `react-hook-form` and `zod` for powerful and type-safe forms.
- **Icons**: `lucide-react` for a comprehensive and consistent icon set.
- **Backend & Database**: Supabase for authentication, database, and storage.
- **In-Browser Video**: FFmpeg (via WebAssembly) for client-side video processing.

## Library Usage and Conventions

### 1. UI and Components

- **Component Library**: **ALWAYS** use components from `shadcn/ui` located in `src/components/ui`.
- **Custom Components**: Create new, reusable components in `src/components`. They should be small, focused, and follow the existing coding style.
- **Styling**: **ONLY** use Tailwind CSS utility classes for styling. Use the `cn()` utility function from `@/lib/utils` to conditionally apply or merge classes. Do not write custom CSS files.
- **Responsiveness**: All components and layouts **MUST** be responsive and work well on all screen sizes, from mobile to desktop.

### 2. State Management

- **Server State**: Use `@tanstack/react-query` for all interactions with the backend (fetching, caching, updating data).
- **Client State**: For local, component-level state, use React's built-in hooks (`useState`, `useReducer`, `useContext`). Avoid complex global state managers unless absolutely necessary.

### 3. Routing

- **Library**: Use `react-router-dom` for all routing.
- **Route Definitions**: All application routes **MUST** be defined within the `<Routes>` component in `src/App.tsx`.

### 4. Forms

- **Form Logic**: Use `react-hook-form` to manage form state, validation, and submissions.
- **Validation**: Use `zod` to define validation schemas. Connect `zod` to `react-hook-form` using `@hookform/resolvers/zod`.

### 5. Icons and Notifications

- **Icons**: Use icons exclusively from the `lucide-react` library.
- **Notifications**: Use `sonner` for toast notifications. The `<Sonner />` provider is already set up in `src/App.tsx`.

### 6. Backend and Data

- **Supabase**: For any database, authentication, or storage needs, use the pre-configured Supabase client available at `@/integrations/supabase/client`.
- **Video Processing**: For all video rendering, manipulation, and processing, use the custom `useFFmpeg` hook located at `@/hooks/useFFmpeg.ts`.

### 7. File Structure

Adhere to the established file structure:

- `src/pages`: For top-level page components corresponding to routes.
- `src/components`: For reusable UI components.
  - `src/components/ui`: For `shadcn/ui` base components.
- `src/hooks`: For custom React hooks.
- `src/lib`: For utility functions and shared logic.
- `src/integrations`: For third-party service integrations (e.g., Supabase).