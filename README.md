# Frontend PWA

React + TypeScript + Vite, with Ant Design and feature-based organization.

## Commands

- `yarn install`: install dependencies and update the lockfile.
- `yarn dev`: development server, normally http://localhost:3001.
- `yarn build`: TypeScript checks and production build, including service worker.
- `yarn preview`: serve the production build at http://localhost:3001.
- `yarn lint`: ESLint checks.
- `yarn typecheck`: TypeScript checks.
- `yarn test`: Vitest and React Testing Library tests.
- `yarn test:watch`: watch unit/component tests.
- `yarn playwright install chromium`: install the E2E browser once.
- `yarn test:e2e`: build and test the production app, including offline reload.

## Configuration

`.env.example` lists public configuration. Set `VITE_API_BASE_URL` in `.env.local`
when the backend URL is known. Empty means same-origin requests. Never put
secrets in `VITE_*` variables: they are included in the browser bundle.

The shared Axios client is in `src/services/httpClient.ts`. Authentication
headers, cookies and endpoints must follow the actual backend contract.
The current login still uses the existing mock token and is not production auth.

`src/main.tsx` provides TanStack Query for server state. Use Zustand for client
state when needed. Persistent business data and synchronization through IndexedDB
must be designed per feature and its data requirements.

## PWA

The production service worker precaches static UI assets. It does not cache API
responses or persist TanStack Query data. After an initial online visit, every
React route receives the cached app shell when reloaded offline. Business data is
stored separately in IndexedDB by feature repositories.

Service worker updates wait for existing tabs to close, avoiding reloads during
form entry. Service workers are disabled in development. Stop the development
server, then run `yarn build && yarn preview` to test offline behavior on port
3001. Deployments must serve `index.html` for client routes while preserving
actual API responses and static asset errors.

The installable app currently uses icons derived from the template favicon.
Replace `public/pwa-icon.svg` and its generated PNG files with official branding
before release.
