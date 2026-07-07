# Fantasy Football Draft Tracker - Frontend

React application for tracking fantasy football drafts with an Apple-style polished design.

## Tech Stack

- **React 19** with Vite
- **Tailwind CSS 4** for styling
- **Lucide React** for icons
- **ESLint** for code quality

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- Real-time draft tracking
- Mock drafts with CPU picks, localStorage persistence, and history
- Team roster management
- Prospect filtering and search
- Future pick trade facilitation
- CSV/JSON data upload (admin-only Data tab)
- Apple-inspired UI design

## Auth

Sign-in uses the Vercel serverless functions in `api/` and requires `AUTH_SECRET` and `DATABASE_URL` env vars on the deployment. It is not available under `npm run dev`; use "Continue without signing in" locally.

## Project Structure

- `src/App.jsx` - Main application component
- `src/index.css` - Global styles and Tailwind configuration
- `src/main.jsx` - Application entry point

## Deployment

This application is configured for GitHub Pages deployment. The production build is automatically generated in the `dist` folder with relative paths for proper GitHub Pages hosting.
