# Maison Arlo Raciàto - Web Storefront

A headless e-commerce storefront built with [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Shopify Hydrogen React](https://shopify.dev/docs/custom-storefronts/hydrogen/react).

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm run setup
    # Or manually: npm install
    ```

### Environment Setup

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Open `.env` and verify your Shopify credentials:
    ```env
    VITE_SHOPIFY_DOMAIN=maison-arlo-raciato.myshopify.com
    VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token_here
    ```
    > **Note:** The current project should already have these configured.

### Running the Application

Start the development server:
```bash
npm run dev
```
Open your browser to [http://localhost:5173](http://localhost:5173).

## Project Structure

- **`src/components`**: Reusable UI components (Hero, ProductCard, etc.).
- **`src/pages`**: Route-level components (Home, ProductDetails).
- **`src/services`**: API integrations (Shopify client).
- **`src/App.jsx`**: Main application setup and routing.

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run preview`: Preview production build locally.
- `npm run lint`: Run ESLint.
- `npm run setup`: Install dependencies.
