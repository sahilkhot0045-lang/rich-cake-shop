# Rich Cake Shop - Production MERN E-Commerce Platform

A production-ready, mobile-first e-commerce web application for **Rich Cake Shop**, an artisanal bakery located in **Mankhurd West, Mumbai (PIN: 400088)** specializing in ready-made cakes, made-to-order celebration cakes, and bespoke multi-tier designer confections.

---

## 🎂 Strict Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Axios, React Router v6.
- **Backend**: Node.js v20+, Express.js v4 REST API (`/api/v1`).
- **Database**: MongoDB with Mongoose 8 (19 models, compound indexes, strict schema validations, amounts in paise).
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing and secure cookies/headers.
- **Payment Processing**: Official Razorpay Node.js SDK with client-side Razorpay standard checkout, server-side amount calculation in paise, HMAC-SHA256 signature verification, and signed idempotent webhooks.
- **Zero-Friction Fallback**: If a live MongoDB instance is not connected, the server automatically boots an in-memory replica via `mongodb-memory-server` and seeds baseline artisanal cakes, Mankhurd delivery zones, and store settings!

---

## 🎨 Visual Design System

- **Primary Cream Canvas**: `#FDFBF7` / `#FAF5EE` (warm, appetizing backdrop)
- **Blush Pink Warmth**: `#FCEEE9` / `#E89A8F` (soft romantic confectionery tone)
- **Deep Chocolate Brown**: `#2C1810` / `#3E2723` (high contrast, luxury cocoa)
- **Champagne Gold Accents**: `#D4AF37` / `#B8860B` (badges, primary CTAs, borders)
- **Typography**: Playfair Display (headings & editorial hero) + Plus Jakarta Sans (clean, legible body text)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18 or v20+
- npm v9+

### 1. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Live MongoDB Atlas or local MongoDB
# Leave default or empty for auto in-memory database
MONGODB_URI=mongodb://127.0.0.1:27017/rich_cake_shop

# Auth Secrets
JWT_SECRET=super_secret_rich_cake_shop_jwt_token_key_change_in_production_2026
JWT_EXPIRES_IN=7d

# Razorpay Test Credentials (from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_RichCakeShopTestKey
RAZORPAY_KEY_SECRET=RichCakeShopTestSecretKey12345
RAZORPAY_WEBHOOK_SECRET=RichCakeShopWebhookSecret12345

# Admin Bootstrap Credentials
ADMIN_NAME=Rich Cake Master Chef
ADMIN_EMAIL=admin@richcakeshop.com
ADMIN_PASSWORD=RichCake@Admin2026
ADMIN_PHONE=+919820098200
```

### 3. Seed Database
```bash
cd server
npm run seed
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend API (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173/** in your browser.

---

## 🔑 Default Seeded Credentials

| Role | Email | Password |
|---|---|---|
| **Bakery Admin** | `admin@richcakeshop.com` | `RichCake@Admin2026` |
| **Test Customer** | `priya.sharma@example.com` | `Customer@2026` |

---

## 📦 Key Functional Modules

### 1. Storefront & Catalogue
- **Live Search & Refinements**: Search by cake name, category, flavour, 100% eggless toggle, gluten-free tags, and price slider.
- **Product Details**: Multi-photo gallery, weight variants with dynamic price in Indian Rupees (`formatRupees` helper), custom piping message on cake (free text inscription with live counter), serving guides, key ingredients, and allergen warnings.
- **PIN Code Delivery Eligibility Checker**: Instant validation against active delivery zones in Mankhurd, Chembur, Ghatkopar, Sion, and Navi Mumbai.

### 2. Shopping Cart & Persistent Session
- Real-time price breakdown in paise ($1\text{ INR} = 100\text{ paise}$).
- Editable quantities, flavour choices, and special baking instructions.
- Promotional coupons with min order threshold and max discount cap (e.g. `WELCOME10`, `MANKHURD50`).

### 3. Capacity-Protected Slot Checkout
- **Delivery vs Pick-up**: Pick up directly from bakery in Mankhurd West (free) or chilled carrier delivery.
- **Slot Capacities**: Real-time server query ensures slots are locked once maximum baking capacity is reached.
- **Lead Time Cutoff**: Enforces store cutoff hours (default 4 hours) for same-day deliveries.
- **Payment Options**: Razorpay online checkout (UPI / Cards / NetBanking), Cash on Delivery (up to ₹3,000 limit), or Pay at Bakery Counter.

### 4. Custom Cake Studio & Negotiation Pipeline
- Multi-step interactive custom cake designer (Occasion, Shape, Tiers 1-4, Weight 1kg-5kg, Flavour, Reference photo links, and detailed notes).
- **Indicative Price Estimator**: Instant dynamic calculation clearly marked as an estimate.
- **Chef Quotation**: Admin reviews feasibility and transmits official binding quote with preparation time and required deposit.
- **Customer Acceptance**: Customer accepts quote and pays deposit online to confirm the baking slot.

### 5. Admin Management Console (`/admin`)
- **Real-Time Telemetry**: Total verified revenue from captured transactions, order count, upcoming deliveries, pending custom quotes, and low-stock alerts (`< 10 units`).
- **Order State Machine**: Strict status transitions (`pending_payment` -> `confirmed` -> `preparing` -> `ready_for_pickup` / `out_for_delivery` -> `delivered`; `cancelled`, `refunded`).
- **Inventory Restock on Cancel**: Cancelling an order automatically restores variant stock quantities and creates an `InventoryMovement` log.
- **CSV Export**: Stream filtered order reports to CSV for accounting and delivery drivers.
- **Editable Store Settings**: Modify bakery address, phone, email, operating hours, delivery fees, and policies.

---

## 🧪 Automated Test Suite

Run backend test suite:
```bash
cd server
npm test
```
Vitest test suites included:
1. `pricing_and_discounts.test.js`: Paise integer accuracy, percentage cap calculation, and minimum order values.
2. `order_state_machine.test.js`: Strict validation of allowed transitions and rejection of invalid states.
3. `auth_and_authorization.test.js`: Password hashing with bcrypt, JWT token generation, and admin route protection.
4. `payment_signatures_and_webhooks.test.js`: HMAC-SHA256 signature verification, tampering detection, and signed webhook idempotency.
5. `custom_quote_workflow.test.js`: Indicative pricing formulas and quote validity expiration checks.
6. `e2e_order_flow.test.js`: Full lifecycle test from cart addition to Razorpay verification and cancellation restock.

---

## 🚢 Production Deployment Guide

### 1. MongoDB Atlas Setup
1. Create a free or dedicated cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist your server IP (or `0.0.0.0/0`).
3. Obtain your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/rich_cake_shop?retryWrites=true&w=majority`.
4. Set `MONGODB_URI` in server environment variables.

### 2. Backend Deployment (Render / Railway / DigitalOcean)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- Add all environment variables from `server/.env.example`.

### 3. Frontend Deployment (Vercel / Netlify)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Set `VITE_API_URL` to your production backend API (e.g. `https://api.richcakeshop.com/api/v1`).

---

## 📋 Shop Owner Handover Guide

1. **Accessing the Admin Console**:
   - Go to `https://your-domain.com/login` and log in with your admin credentials.
   - Click **Admin Dashboard** in the user menu.
2. **Managing Store Details**:
   - Navigate to **Bakery & Delivery Settings** to update your phone number, operating hours, delivery zones, or store address.
3. **Handling New Orders**:
   - Check **Order Management** daily. As each cake is baked and frosted, click **Update Status** to move from `Confirmed` -> `Preparing` -> `Out for Delivery` -> `Delivered`.
4. **Reviewing Custom Cake Inquiries**:
   - Go to **Custom Cake Quotes**. Review customer reference images, calculate your preparation hours, and issue an official quotation. The customer will be able to review and pay their deposit online.
5. **Downloading Sales Reports**:
   - Click **Export All Orders to CSV** anytime to download a full spreadsheet for your accountant or delivery partners.
