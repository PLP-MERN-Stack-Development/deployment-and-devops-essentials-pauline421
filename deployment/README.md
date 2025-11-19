# Deployment Configurations

This folder contains example configurations you can adapt for your MERN application deployments.

Contents:
- render.yaml: Render blueprint example for the backend service (Express).
- vercel.json: Vercel configuration example for frontend deployments (React / Vite / Next).

Steps (high-level):
1. Backend on Render
   - Create a new Web Service and connect your GitHub repository.
   - Set the root directory to `backend`.
   - Set build command: `npm ci && npm run build --if-present` and start: `npm start`.
   - Add environment variables (MONGODB_URI, JWT_SECRET, NODE_ENV, CORS_ORIGIN, etc.).
   - Optionally, import `deployment/render.yaml` in Render to provision automatically.
2. Frontend on Vercel
   - Import your repo into Vercel.
   - Set the project root to `frontend`.
   - Build command: `npm run build`, Output directory: `dist` (Vite) or `build` (CRA).
   - Set environment variables (VITE_API_BASE_URL or REACT_APP_API_BASE_URL).
   - Optionally, customize with the provided `deployment/vercel.json`.

Custom Domain & HTTPS
- Configure your DNS with the provider (Vercel, Netlify, Render) and verify domain.
- HTTPS is automatic with these providers once the domain is verified.
