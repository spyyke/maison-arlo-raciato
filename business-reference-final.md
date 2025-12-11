# Business Reference Guide: Zero-Cost Deployment
**Small Business Philippines | Cloudflare Free Tier**

---

## Executive Summary

You're using **Cloudflare Free Tier** for hosting. This costs $0/month and is perfect for starting out.

**What you get:**
- Unlimited bandwidth
- 100,000 API requests/day (plenty for initial traffic)
- Automatic deployments from GitHub
- Global CDN (Singapore edge locations for fast PH performance)

**What you pay for (monthly):**
- Shopify: $29–79 (basic plan)
- PayMongo (payment gateway): 2–3% per transaction (no monthly fee)
- Domain: ~$15/year (~$1.25/month)
- Shipping: Included in courier costs (customer pays)
- **Total: ~$31–81/month** (depends on Shopify plan, excluding Shopify subscription)

**Zero infrastructure costs. Everything else is transaction-based.**

---

## Quick Start Timeline

| Task | Owner | Timeline |
|------|-------|----------|
| Set up Cloudflare account + domain | You | Today (15 min) |
| Deploy Antigravity to Cloudflare Pages | Dev team | Today/Tomorrow (1 hour) |
| Create Shopify store + products | You | This week (a few hours) |
| Set up PayMongo payment gateway | You | This week (30 min) |
| Install J&T or GoGo shipping app | You | This week (30 min) |
| Test 3 orders (full flow) | Dev team + You | Next 1–2 days |
| Go live and start marketing | You | Next week |

---

## Cost Breakdown (What You Actually Pay)

### Monthly Costs (Assume 50 orders/month, avg 1,500 PHP each)

| Item | Cost | Notes |
|---|---|---|
| **Hosting** | $0 | Cloudflare free tier |
| **Shopify Basic Plan** | $29 | All features included |
| **Payment Processing** | ~1,875 PHP (2.5% of revenue) | Via PayMongo |
| **Shipping (absorbed)** | ~2,500 PHP | Example: 50 PHP/order × 50 orders |
| **Domain** | ~1.25 | Prorated from $15/year |
| **TOTAL MONTHLY** | ~$32–35 + 1,875 PHP shipping | **Variable, not fixed** |

### When You Exceed Free Tier Limits

**When would you hit limits?**
- **Cloudflare Workers:** 100K requests/day = roughly 3,000–5,000 users/day
- **Traffic estimate:** At 50 orders/month, you'll likely have 100–300 visitors/day (well under limit)
- **You would NOT hit limits unless:** You get thousands of daily visitors

**When to upgrade to Paid ($5/month):**
- When traffic grows to 1M+ monthly visitors
- Or when you hit Workers free tier limits consistently
- This is months or years away at your current scale

---

## Infrastructure Overview (Super Simple)

```
Your Antigravity Code (GitHub)
    ↓ (push to main)
Cloudflare Pages (auto-deploys, free)
    ↓ (serves static HTML/CSS/JS)
User's Browser (fast, via Singapore edge)
    ↓ (API calls to Shopify)
Shopify API
    ↓ (products, checkout, orders)
Shopify Payment Gateway (PayMongo)
    ↓ (processes GCash/card/COD)
Payment Complete → Order Created
```

**That's it. No servers to manage. No containers. No DevOps headaches.**

---

## Exact Steps You Need to Do

### Step 1: Cloudflare Setup (15 minutes)

1. Go to **cloudflare.com**
2. Sign up (free account)
3. Verify email
4. Click "Add a domain"
5. Enter your domain (e.g., `mystore.com.ph`)
6. Cloudflare shows nameservers (e.g., `alma.ns.cloudflare.com`, `bert.ns.cloudflare.com`)
7. Go to your domain registrar (Namecheap, GoDaddy, etc.)
8. Update nameservers to Cloudflare's nameservers
9. Wait 5 minutes to 48 hours for DNS propagation
10. ✅ Done

**That's all. Your domain now uses Cloudflare for DNS and hosting.**

### Step 2: Tell Dev Team to Deploy to Cloudflare Pages (1 hour)

Give your Antigravity dev team this info:

> "Deploy to Cloudflare Pages. Free tier. GitHub integration. Build command is [npm run build or whatever Antigravity uses]. Output folder is [dist/build/whatever]. Auto-deploy on GitHub push."

They will:
1. Create a new project in Cloudflare Pages
2. Connect your Antigravity GitHub repo
3. Set build settings (build command + output folder)
4. Click "Deploy"
5. Site goes live at `yourdomain.com`

This is a one-time 30-minute setup.

### Step 3: Create Shopify Store + Products (2–3 hours)

1. Go to **shopify.com**
2. Click "Create a free store"
3. Sign up with your email
4. Fill in store name, password
5. Confirm email
6. Start free trial (14 days, then $29/month)
7. Add your first 10–20 products:
   - Go to Products → Add product
   - Fill in title, description, images, price, inventory
   - Click Save
   - Repeat for each product
8. Create collections (categories):
   - Go to Collections → Create collection
   - Name: "Men", "Women", "New Arrivals", etc.
   - Add products to each collection
9. ✅ Store is set up

### Step 4: Set Up PayMongo Payment Gateway (30 minutes)

1. Go to **paymongo.com**
2. Sign up for merchant account
3. Provide business documents, ID, bank details
4. Wait for approval (usually same-day or next-day)
5. Get API keys from PayMongo dashboard
6. Go to Shopify Admin → Settings → Payments
7. Search "PayMongo" → Install app
8. Paste API keys from PayMongo
9. Enable payment methods:
   - ✅ GCash
   - ✅ Visa/Mastercard
   - ✅ Maya
10. ✅ Payments are live

### Step 5: Set Up Shipping (1 hour)

1. **In Shopify Admin:**
   - Settings → Shipping and delivery
   - Create shipping zones (NCR, Luzon, Visayas, Mindanao)
   - For each zone, create flat-rate shipping methods:
     - NCR: 80 PHP
     - Luzon: 120 PHP
     - Visayas: 150 PHP
     - Mindanao: 180 PHP

2. **Install a shipping app:**
   - Go to Shopify App Store
   - Search "J&T Express" or "GoGo Xpress"
   - Install the app
   - Connect with your courier merchant account
   - ✅ Now Shopify shows real-time shipping options

3. **Optional: Enable Cash on Delivery (COD)**
   - Shopify Admin → Settings → Payments → Manual payment methods
   - Add "Cash on Delivery"
   - Restrict to specific zones if you want

### Step 6: Test Full Order Flow (30 minutes)

Before going live, test the entire flow:

1. **As a customer:**
   - Go to your website
   - Browse products
   - Add item to cart
   - Proceed to checkout
   - Select shipping (should see your rates)
   - Choose payment method (GCash, card, or COD)
   - Complete payment
   - See order confirmation

2. **Check Shopify Admin:**
   - Go to Orders
   - Verify the order appears
   - Check payment status (Paid or Pending)

3. **Test different payment methods:**
   - Repeat flow with GCash
   - Repeat flow with test card number
   - Repeat flow with COD (if enabled)

4. **Create shipping label:**
   - Click the test order
   - Scroll to "Shipping"
   - Click "Create shipping label"
   - Confirm courier and service type
   - ✅ Label created

---

## Operations: What You Do Weekly & Monthly

### Weekly (15 minutes)

- Check Shopify for new orders
- Create shipping labels (or ask team to do it)
- Respond to customer messages/emails

### Monthly (30 minutes)

- Review Shopify analytics (traffic, top products, conversion rate)
- Check payment transactions in PayMongo dashboard
- Verify shipping is working (no lost packages?)
- Test website on mobile (any broken links?)
- Review costs (should be ~$31–35/month + transaction fees)

---

## Important: Free Tier Limits (You Won't Hit These)

| Limit | Amount | Your Usage | Safe? |
|-------|--------|-----------|-------|
| Cloudflare Pages bandwidth | Unlimited | 1–5 GB/month estimate | ✅ Yes |
| Workers requests/day | 100,000 | ~500–2,000/day estimate | ✅ Yes |
| Builds/month | 500 | ~8–20/month estimate | ✅ Yes |

**Bottom line:** You won't exceed free tier limits. If you do (traffic grows dramatically), you upgrade to Paid ($5/month). But that's a good problem to have.

---

## Payment Methods for Your Customers

You offer:

1. **GCash** (most popular in PH)
   - Instant, no friction
   - 60% of online PH shoppers use it

2. **Credit/Debit Card** (Visa, Mastercard)
   - For broader market

3. **Maya** (formerly PayMaya)
   - Alternative e-wallet

4. **Cash on Delivery (COD)** (optional)
   - Good for trust-building but slower (courier collects cash)

**Fees for you:**
- GCash: ~2% per transaction
- Card: ~2.5% + $0.50 fixed
- Maya: ~2% per transaction
- COD: ~2–5% remittance fee (courier takes cut)

---

## When You Grow (Future Decisions)

### At 500 orders/month (~$15K revenue):

- Shopify plan still $29–79/month (no upgrade needed)
- Hosting still $0 (Cloudflare free tier)
- Payment fees: ~$300–400/month (2–3% of revenue)
- Shipping: Variable (customer covers it, but you absorb part)

### At 2,000+ orders/month (~$60K+ revenue):

- Upgrade Shopify to Advanced ($299/month) for more features
- Cloudflare free tier still works
- Consider hiring 1 part-time operations person ($200–300/week)

### At 5,000+ orders/month and beyond:

- Evaluate enterprise solutions
- Consider warehouse/fulfillment infrastructure
- Negotiate volume discounts with couriers
- Maybe hire dedicated tech team

**For now: Stay on Cloudflare free tier. Growth is months away.**

---

## Dashboard You'll Use Daily

### 1. Shopify Admin Dashboard

**Check daily:**
- Orders (new orders, payment status)
- Inventory (low stock alerts)

**Check weekly:**
- Analytics (traffic, conversion rate, top products)
- Customer feedback/reviews

### 2. Cloudflare Dashboard

**You don't really need to check this.** But if curious:
- Pages → Deployments (see if your site deployed successfully)
- Analytics → Traffic (see how many visitors)

### 3. PayMongo Dashboard

**Check weekly:**
- Transactions (did payments go through?)
- Settlement (when does money hit your bank?)

---

## Launch Checklist

- [ ] Cloudflare account created
- [ ] Domain pointing to Cloudflare
- [ ] Antigravity deployed to Cloudflare Pages (site is live)
- [ ] Shopify store created
- [ ] At least 10 products added with images, prices, descriptions
- [ ] At least 2 collections created
- [ ] Shipping zones configured (NCR, Luzon, Visayas, Mindanao)
- [ ] Flat-rate shipping methods set (80, 120, 150, 180 PHP)
- [ ] Shipping app installed (J&T or GoGo)
- [ ] PayMongo merchant account approved
- [ ] Payment methods enabled (GCash, card, Maya)
- [ ] Test order placed with GCash ✅ Success
- [ ] Test order placed with card ✅ Success
- [ ] Test order placed with COD (if enabled) ✅ Success
- [ ] Shipping label created for test order ✅ Success
- [ ] Website tested on mobile (loads fast, no broken links)
- [ ] Cloudflare caching configured (product pages 15 min)
- [ ] Contact info visible on site (email, phone, or Facebook)
- [ ] Privacy policy and return policy posted
- [ ] Ready to go live ✨

---

## FAQ (Frequently Asked Questions)

**Q: Is Cloudflare really free forever?**
A: For the free tier, yes. Pages (static hosting) is free forever. Workers (API requests) has a free tier of 100K requests/day, which is enough for most small businesses for months/years.

**Q: When do I have to pay for Cloudflare?**
A: Only when you exceed free tier limits. With 50–100 orders/month, you won't hit limits. When traffic grows significantly (1K+ daily visitors), you upgrade to Paid ($5–20/month depending on usage).

**Q: What if I need to change something after launch?**
A: Easy:
- Update products in Shopify → changes appear on site automatically (via API)
- Update shipping rates in Shopify → changes appear at checkout automatically
- Update code in Antigravity → push to GitHub → Cloudflare auto-deploys

**Q: Do I need a dedicated database?**
A: No. Shopify IS your database. Everything (products, orders, inventory) lives in Shopify. Cloudflare Pages just serves the front-end.

**Q: Can I handle 10,000 orders/month on Cloudflare free?**
A: No, but that's a good problem. By then you'd upgrade to Paid ($5/month) or move to Google Cloud Run (still $13–40/month). But you'll have revenue to justify it.

**Q: What if my website gets hacked?**
A: Cloudflare has built-in DDoS protection and firewall. Very unlikely. Shopify handles PCI compliance for payments. Risk is low.

**Q: Do I need to do anything special to scale?**
A: No. Your infrastructure auto-scales with Cloudflare. If traffic spikes, Cloudflare handles it (no manual intervention needed).

---

## Final Advice

**Start simple. Don't over-engineer.**

- You have: Cloudflare (free) + Shopify ($29/mo) + PayMongo (2.5% per transaction) + J&T shipping
- That's 99% of what you need to run a successful small business
- Marketing and customer service matter way more than infrastructure at this stage
- Focus on getting your first 100 customers, not scaling to 1M

**You're ready to launch. Go sell.**