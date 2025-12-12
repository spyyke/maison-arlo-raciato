# Antigravity Execution Plan: Headless Shopify Storefront
**Small Business Philippines | Zero-Cost Hosting (Cloudflare Free Tier)**

---

## 1. Hosting & Infrastructure Setup

### 1.1 Hosting Stack (100% Free)

**CLOUDFLARE PAGES (FREE TIER) + CLOUDFLARE WORKERS (FREE TIER)**

This setup costs absolutely nothing and is perfect for a small business not expecting high traffic yet.

**Cloudflare Pages (Free):**
- Unlimited bandwidth
- Unlimited sites
- 500 builds/month (more than enough for weekly deploys)
- 1 concurrent build
- Automatic deployment on every GitHub push

**Cloudflare Workers (Free):**
- 100,000 requests per day (~3M per month)
- Perfect for proxying Shopify API calls
- Caching to reduce Shopify API hits
- No cost, no credit card required

**Why this works for you right now:**
- Small PH business = low initial traffic
- 100K requests/day = roughly 3,000–5,000 visitors/day (more than enough to start)
- When you grow, you upgrade to Paid ($5/month) — but that's months away

### 1.2 Deployment Steps (Super Simple)

**Step 1: Create Cloudflare Account**
- Go to cloudflare.com
- Sign up (free)
- Verify email

**Step 2: Add Your Domain to Cloudflare**
- In Cloudflare dashboard, click "Add a domain"
- Enter your domain (e.g., mystore.com.ph)
- Follow the prompts to update your domain registrar's nameservers to Cloudflare's
- Wait 5 minutes to 48 hours for DNS to propagate

**Step 3: Connect Antigravity to Cloudflare Pages**
- In Cloudflare dashboard, go to "Pages"
- Click "Create a project"
- Select "Connect to Git" (GitHub, GitLab, or Bitbucket)
- Authorize Cloudflare to access your Antigravity repository
- Select the Antigravity repository
- Configure build settings:
  - **Build command:** `npm run build` (or whatever Antigravity uses)
  - **Build output directory:** `dist` or `.output` or `build` (confirm with your dev team)
- Click "Save and Deploy"
- Cloudflare deploys your site automatically
- Your site is now live at: `yourdomain.com`

**Step 4: Configure Cloudflare Workers (for Shopify API Proxying)**

This is optional but recommended to cache API responses and avoid CORS issues.

- In Cloudflare dashboard, go to "Workers & Pages" → "Workers"
- Click "Create a Worker"
- Paste the following Worker script (updated for your Shopify store):

```javascript
// Cloudflare Worker: Shopify API Proxy
// This worker caches Shopify API responses

const SHOPIFY_STORE = "your-store.myshopify.com";
const SHOPIFY_STOREFRONT_API_KEY = "your-api-key-here";
const SHOPIFY_API_VERSION = "2024-10";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only proxy requests to /api/shopify/*
    if (!url.pathname.startsWith("/api/shopify")) {
      return new Response("Not found", { status: 404 });
    }

    // Extract the Shopify endpoint (e.g., /api/shopify/products -> /products.json)
    const shopifyPath = url.pathname.replace("/api/shopify", "");
    const shopifyUrl = `https://${SHOPIFY_STORE}/api/${SHOPIFY_API_VERSION}/graphql.json`;

    // Create cache key
    const cacheKey = new Request(shopifyUrl, { method: "GET" });
    const cache = caches.default;

    // For GET requests, try to return cached response
    if (request.method === "GET") {
      const cached = await cache.match(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Forward request to Shopify
    const shopifyRequest = new Request(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_API_KEY,
      },
      body: request.body,
    });

    const response = await fetch(shopifyRequest);

    // Cache successful responses for 15 minutes (900 seconds)
    if (response.ok && request.method === "GET") {
      const cacheResponse = response.clone();
      const cacheHeaders = new Headers(cacheResponse.headers);
      cacheHeaders.set("Cache-Control", "public, max-age=900");
      const cachedResponse = new Response(cacheResponse.body, {
        status: cacheResponse.status,
        statusText: cacheResponse.statusText,
        headers: cacheHeaders,
      });
      cache.put(cacheKey, cachedResponse);
    }

    return response;
  },
};
```

- Replace `your-store.myshopify.com` and `your-api-key-here` with your actual Shopify store URL and Storefront API key
- Click "Deploy"
- Create a route: `yourdomain.com/api/shopify/*` → points to this Worker

**Step 5: Enable Caching in Cloudflare**

- In Cloudflare dashboard for your domain, go to "Caching" → "Cache Rules"
- Create cache rules:
  - **For product pages:** Path contains `/products/*` → Cache for 15 minutes
  - **For collection pages:** Path contains `/collections/*` → Cache for 15 minutes
  - **For homepage:** Path is exactly `/` → Cache for 5 minutes
  - **For cart/checkout:** Do NOT cache (set TTL to 0)

**Done!** Your site is now live on Cloudflare Pages with zero cost.

---

## 2. Shopify Integration (Storefront API)

### 2.1 Set Up Shopify API Access

1. **Go to Shopify Admin:**
   - Settings → Apps and integrations → Develop apps
   - Click "Create an app"
   - App name: "Antigravity Storefront"
   - Select "Headless" or "Custom app"

2. **Configure API Scopes:**
   - Admin API scopes:
     ```
     read:products
     read:product_listings
     read:collections
     read:inventory
     write:orders
     read:orders
     read:fulfillments
     ```

3. **Generate Storefront API Token:**
   - Click "Install app"
   - Go to "API credentials" tab
   - Scroll to "Storefront API" section
   - Click "Generate token"
   - Copy the token (you'll need this for Antigravity)
   - Also copy your Shopify Storefront API access token and store URL

4. **Store these securely in Cloudflare Pages:**
   - In Cloudflare Pages project settings:
     - Add environment variables:
       - `SHOPIFY_STORE_URL`: your-store.myshopify.com
       - `SHOPIFY_STOREFRONT_API_KEY`: your-token-here
       - `SHOPIFY_API_VERSION`: 2024-10
   - These variables are available to your build process

### 2.2 Antigravity Frontend Implementation

**Build these pages in Antigravity:**

1. **Homepage**
   - Fetch featured collections from Shopify
   - Display hero banner, featured products
   - API call: `POST /graphql` to get collections (cached 5 min)

2. **Collections/Category Page**
   - List all products in a collection
   - Display filters (by tag, price range, etc.)
   - Pagination support
   - API call: `POST /graphql` to get collection products (cached 15 min)

3. **Product Detail Page (PDP)**
   - Show product image, title, description, price
   - Display variants (size, color) with individual prices
   - Show inventory status
   - "Add to cart" button
   - API call: `POST /graphql` to get single product (cached 15 min)

4. **Cart Page**
   - Display items in cart (from browser localStorage + Shopify API)
   - Show subtotal, estimated shipping, taxes
   - "Proceed to Checkout" button
   - No caching (always fresh)

5. **Checkout Redirect**
   - On "Proceed to Checkout":
     - Call Shopify Storefront API to create checkout
     - Redirect user to Shopify's checkout URL
     - Shopify handles all payment, shipping, taxes
   - After payment:
     - User redirected back to your thank-you page
     - Display order summary

6. **Thank You / Order Confirmation Page**
   - Display order number, items, total
   - Show tracking info (if available)
   - No API calls needed (info passed via URL params or session)

### 2.3 API Call Pattern (Using GraphQL)

All Shopify API calls should be GraphQL queries. Example:

```graphql
query GetProducts {
  products(first: 20) {
    edges {
      node {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
  }
}
```

Call this via:
```javascript
const response = await fetch('/api/shopify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `query GetProducts { ... }`
  })
});
```

The Cloudflare Worker will cache this for 15 minutes.

---

## 3. Shopify Configuration (Admin Setup)

### 3.1 Set Up Products

1. **In Shopify Admin:**
   - Go to Products → All products
   - Click "Add product"
   - Fill in:
     - Title
     - Description
     - Images (at least 1, preferably 3–5 high-quality images)
     - Price
     - Compare-at price (optional, for discounts)
     - SKU
     - Inventory quantity
   - Save

2. **Create Collections:**
   - Go to Products → Collections
   - Create collections (e.g., "Men", "Women", "New Arrivals", "Sale")
   - Add products to each collection

3. **Important:**
   - Ensure all products have "Status: Active" so they show on your storefront
   - Use high-quality images (Cloudflare will auto-optimize them)

### 3.2 Set Up Shipping

1. **Create Shipping Zones:**
   - Settings → Shipping and delivery
   - Create zones:
     - **Zone 1:** Metro Manila / NCR
     - **Zone 2:** Luzon (non-NCR)
     - **Zone 3:** Visayas
     - **Zone 4:** Mindanao

2. **Create Shipping Methods (Flat Rates):**
   - For each zone, add methods:
     - **NCR Standard:** 80 PHP (2–3 days)
     - **Luzon Standard:** 120 PHP (2–3 days)
     - **Visayas Standard:** 150 PHP (3–5 days)
     - **Mindanao Standard:** 180 PHP (3–5 days)

3. **Install a Shipping App (Free):**
   - Go to Apps → Search "J&T" or "GoGo Xpress" or "LOKAL"
   - Install the app that covers your region
   - Connect your courier merchant account
   - Shopify will now show real-time rates at checkout (or flat rates you set)

### 3.3 Set Up Payments

1. **Choose a Payment Gateway:**
   - Recommended: **PayMongo** (supports GCash, cards, Maya)
   - Go to Shopify Admin → Settings → Payments
   - Search "PayMongo" → Install the app
   - Sign up at paymongo.com with your business details
   - Get API keys from PayMongo and link to Shopify

2. **Enable Payment Methods:**
   - Once PayMongo is linked, enable:
     - ✅ GCash
     - ✅ Visa/Mastercard (Card)
     - ✅ Maya

3. **Enable Cash on Delivery (COD):**
   - Settings → Payments → Manual payment methods
   - Add "Cash on Delivery"
   - Optionally restrict to certain zones (e.g., NCR + Luzon only)

4. **Test Payments:**
   - Place a test order with test card number (provided by Shopify)
   - Verify payment goes through in PayMongo dashboard
   - Refund the test order

---

## 4. Operations: Processing Orders

### 4.1 On Each New Order

1. **In Shopify Admin:**
   - Go to Orders
   - Click the new order to view details

2. **Create Shipping Label:**
   - Scroll down to "Shipping" section
   - Click "Create shipping label"
   - Select courier service (same-day, standard, etc.)
   - Confirm package weight/dimensions
   - Click "Buy label"

3. **Print Waybill:**
   - Download and print the waybill/label
   - Attach to package

4. **Arrange Pickup/Drop-off:**
   - Contact courier for pickup, OR
   - Drop off at courier branch

5. **Mark as Fulfilled:**
   - Once package is picked up/dropped off, click "Fulfill" in Shopify
   - Tracking number is automatically emailed to customer

### 4.2 Handle Refunds/Returns

1. **Customer requests refund:**
   - Record the request (email, chat, support ticket)
   - Decide whether to accept (based on your return policy)

2. **Process refund in Shopify:**
   - Go to Orders → Click order
   - Scroll to "Payments" → "Refund"
   - Select items to refund, amount
   - Click "Refund"
   - Refund is automatically issued to customer's original payment method (2–5 days)

3. **Update inventory:**
   - If customer returns product, update inventory in Shopify when it arrives back to you

---

## 5. Weekly Monitoring Tasks

- [ ] Check Shopify for new orders
- [ ] Process shipments (create waybills, arrange pickups)
- [ ] Review payment transactions in PayMongo dashboard
- [ ] Check for payment failures or chargebacks (should be rare)
- [ ] Spot-check website on mobile (any broken links/images?)
- [ ] Review customer support messages (emails, DMs, etc.)

---

## 6. Monthly Maintenance Tasks

- [ ] Review Cloudflare Pages build logs (any deployment errors?)
- [ ] Check Shopify inventory (reorder low-stock items?)
- [ ] Review Shopify analytics (traffic, conversion rate, top products)
- [ ] Check abandonment rate in Shopify (if high, adjust shipping/prices)
- [ ] Test a full order flow (add to cart → checkout → payment)
- [ ] Verify all shipping methods are working
- [ ] Backup Shopify data (download customer list, orders)

---

## 7. Performance Checklist

**Before Going Live:**

- [ ] All products have images, descriptions, prices
- [ ] At least 2 collections created
- [ ] Homepage displays featured products
- [ ] PDP displays product details, variants, inventory
- [ ] Cart shows items and subtotal
- [ ] Checkout redirects to Shopify checkout
- [ ] Payment methods (GCash, card, COD) tested
- [ ] Shipping zones and methods configured
- [ ] Mobile responsive (test on iPhone/Android)
- [ ] Cloudflare caching rules set
- [ ] Pages and Workers deployed
- [ ] Website loads in < 3 seconds

---

## 8. Troubleshooting (Free Tier Limits)

### "Website is down / shows error"

- Check Cloudflare Pages build logs for errors
- Verify Antigravity build command is correct
- Check Shopify API credentials are correct in environment variables

### "Products not showing on PDP"

- Verify product is "Active" in Shopify
- Check API permissions (read:products should be enabled)
- Test GraphQL query manually in Shopify GraphQL admin

### "Cart is empty / checkout not working"

- Check browser console for JavaScript errors
- Verify Shopify checkout URL is correct
- Clear browser cache and try again

### "Payment keeps failing"

- Verify PayMongo API keys are correct in Shopify
- Check PayMongo dashboard for transaction logs
- Test with a different payment method (GCash vs. card)
- Contact PayMongo support if persistent

### "Free tier limit exceeded" (unlikely, but just in case)

- Workers free tier: 100K requests/day
- If you hit this, you would need to upgrade to Paid ($5/month)
- Symptoms: API calls start returning 429 errors
- Solution: Upgrade to Paid tier or optimize cache to reduce API calls

---

## 9. Deployment Checklist (Ready to Go Live)

- [ ] Cloudflare account created
- [ ] Domain pointing to Cloudflare
- [ ] Antigravity repository connected to Cloudflare Pages
- [ ] Antigravity built and deployed (green checkmark in Pages dashboard)
- [ ] Shopify store created with products and collections
- [ ] Shopify API credentials stored in Cloudflare environment variables
- [ ] PayMongo connected and payment methods enabled
- [ ] Shipping zones configured in Shopify
- [ ] Courier app installed (J&T, GoGo, etc.)
- [ ] Cloudflare Workers deployed (if using API proxy)
- [ ] Caching rules configured
- [ ] Test order placed (card payment) ✅ Success
- [ ] Test order placed (GCash) ✅ Success
- [ ] Test order placed (COD) ✅ Success
- [ ] Website tested on mobile
- [ ] Website loads in under 3 seconds
- [ ] Google Analytics (optional) set up
- [ ] Privacy policy visible on site
- [ ] Contact info/support email displayed
- [ ] Ready to go live ✨

**Zero Cost Hosting, Full Functionality, Ready to Scale.**