# Project Status Report: Maison Arlo Raciàto

**Date:** December 9, 2025
**Project Type:** Headless Shopify Storefront
**Tech Stack:** React (Vite), Cloudflare Pages, Cloudflare Workers (Functions), Shopify Storefront API

---

## 1. Executive Summary
The project is a premium headless e-commerce website for a perfume brand ("Maison Arlo Raciàto"). The frontend is built with React and connects to Shopify for backend e-commerce functionality (Products, Cart, Checkout). We have successfully implemented a "Zero-Cost Hosting" architecture using Cloudflare Pages Free Tier, which proxies API requests to Shopify to ensure security and caching.

## 2. Architecture & Infrastructure

### Hosting (Cloudflare Pages)
- **Frontend Serving:** Static assets (HTML/CSS/JS) are served via Cloudflare Pages.
- **API Proxy (Functions):** A specific function `web/functions/api/shopify/[[path]].js` acts as a middleware.
    - **Purpose:** Hides the Shopify Storefront Access Token from the client, handles CORS, and allows for server-side caching (though basic caching is currently handled by the browser/query client).
    - **Route:** `/api/shopify` -> Proxies to `your-store.myshopify.com/api/2024-10/graphql.json`.

### Backend (Shopify)
- Acts as the database and commerce engine.
- **Data flow:** Products and Collections are fetched via GraphQL.
- **Checkout:** Users are redirected to the standard Shopify web checkout url (`webUrl`) to complete purchases.

## 3. Implemented Features

### Frontend Core
- **Design System:** Custom CSS using variables for a "Titanium & Noir" aesthetic. Responsive layout for mobile and desktop.
- **Routing:** `react-router-dom` handles navigation.
- **State Management:** `TanStack Query` (React Query) handles API data fetching and caching. `Context API` handles global Cart state.

### Pages & Components
1.  **Home Page (`/`)**
    -   Hero Section.
    -   Heritage & Philosophy sections (Brand storytelling).
    -   "The Collection" section: Dynamically fetches and displays products.

2.  **Navigation (`Navbar.jsx`)**
    -   **Update:** Now links to specific collections: Signature, Men, Women, Limited Edition.
    -   Handles: `/collections/signature`, `/collections/men`, `/collections/women`, `/collections/limited-edition`.
    -   Links to Brand Story (Heritage) still present.

3.  **Product Details Page (`/products/:handle`)**
    -   Fetches specific product data using the handle.
    -   Displays image, title, formatted price, description, and scent notes.
    -   "Add to Cart" functionality.

3.  **Collection Details Page (`/collections/:handle`)**
    -   **New:** Recently implemented to support specific category views.
    -   Displays collection title, description, and a grid of products within that collection.

4.  **Cart Drawer**
    -   Slide-out UI overlaid on any page.
    -   Displays added items, quantities, and subtotal.
    -   Allows updating quantities and removing items.
    -   "Proceed to Checkout" button links directly to Shopify's checkout.

### Service Layer (`src/services/`)
-   **`shopifyClient.js`**: Core GraphQL client. Now configured to query the local Cloudflare proxy (`/api/shopify`) instead of directly hitting Shopify.
-   **`productService.js`**: Abstraction layer that normalizes Shopify's nested GraphQL data shapes into flat objects usable by the UI components. Support added for `getAllProducts`, `getProductByHandle`, and `getCollectionByHandle`.

## 4. Environment Configuration
The project is set up to run locally using `wrangler` to simulate the Cloudflare environment.

**Required Environment Variables:**
- `SHOPIFY_STORE_URL`: The myshopify domain (e.g., `maison-arlo.myshopify.com`).
- `SHOPIFY_STOREFRONT_API_KEY`: The public public access token for the Storefront API.
- `SHOPIFY_API_VERSION`: Default is `2024-10`.

## 5. Recent "Antigravity" Updates
We recently executed the "Antigravity Execution Plan" which involved:
1.  **Secure Proxying:** Moved API calls from direct client-side requests to a serverless function structure (`/api/shopify`).
2.  **Collection Support:** Added backend queries and frontend views for Collections.
3.  **Dev Experience:** Added `npm run dev:cloud` to `package.json` to easily run the local proxy server.

## 6. Immediate Next Steps / Roadmap
1.  **Deployment:** Connect the GitHub repository to Cloudflare Pages and set the production environment variables.
2.  **Content Population:** Ensure the real Shopify store has the necessary "Collection" structure with handles that match the links on the website.
3.  **Verification:** Perform a full end-to-end test on the live production URL (Browse -> Add to Cart -> Checkout).
