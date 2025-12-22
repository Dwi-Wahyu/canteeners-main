# Canteeners 2025 - Project Context

## Project Overview

**Canteeners** is a comprehensive food court e-commerce platform built with Next.js 16, designed to facilitate online food ordering from multiple canteen shops. The platform supports real-time chat, order management, shopping cart functionality, payment processing, and complaint/refund systems.

### Core Purpose

Enable customers to browse food products from various canteen shops, place orders (both ready-to-serve and pre-orders), chat with shop owners, and manage the complete order lifecycle including payments, complaints, and refunds.

---

## Technology Stack

### Frontend

- **Framework**: Next.js 16.0.10 (App Router)
- **React**: 19.2.0
- **UI Library**: Radix UI components with shadcn/ui
- **Styling**: Tailwind CSS v4 with custom design tokens
- **State Management**:
  - Zustand for global state
  - TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Other**:
  - next-themes for theme management
  - nuqs for URL state management
  - sonner for toast notifications

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Database Adapter**: @prisma/adapter-pg with Accelerate extension
- **Authentication**: NextAuth v5 (beta)
- **Real-time Data**: Firebase Firestore (for chat and notifications)
- **File Storage**: Vercel Blob
- **Password Hashing**: bcryptjs
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### Development Tools

- **Language**: TypeScript 5
- **Package Manager**: Bun
- **Linter**: ESLint 9
- **Build Tool**: Next.js built-in compiler

---

## Project Structure

For a complete and detailed explanation of the project structure, including folder goals and clean architecture principles, see **[Project Structure Documentation](./project-structure.md)**.

### Quick Overview

```
canteeners-main/
├── docs/               # 📚 Project documentation
├── prisma/            # 🗄️ Database schemas and migrations
├── public/            # 🌐 Static assets
└── src/
    ├── app/           # 📱 Next.js App Router (routes and API)
    ├── components/    # 🎨 Shared UI components
    ├── features/      # ⚙️ Feature modules (business logic)
    ├── lib/           # 🔧 Core libraries
    ├── hooks/         # 🪝 Shared React hooks
    ├── stores/        # 🏪 Zustand state management
    ├── types/         # 📘 TypeScript type definitions
    ├── config/        # ⚙️ Configuration
    ├── constant/      # 📋 Constants
    └── helper/        # 🛠️ Utility functions
```

---

## Database Schema Overview

### User Management

- **User**: Core user entity with role-based access (ADMIN, CUSTOMER, SHOP_OWNER)
- **Admin**: Admin-specific data
- **Customer**: Customer profile with email, phone, table preferences, violations
- **Owner**: Shop owner data
- **UserFcmToken**: FCM tokens for push notifications (WEB, ANDROID, IOS)

### Canteen & Shop

- **Canteen**: Food court locations with shops
- **CanteenMap**: Floor plans with table locations
- **TableQRCode**: QR codes for table-based ordering
- **Shop**: Individual food shops with status (ACTIVE, INACTIVE, SUSPENDED)
- **Payment**: Shop payment methods (QRIS, BANK_TRANSFER, CASH)
- **ShopBilling**: Commission billing for shops

### Products

- **Product**: Food items with pricing, availability, ratings
- **ProductOption**: Customization options (e.g., spice level, doneness)
- **ProductOptionValue**: Option values with additional pricing
- **Category**: Product categories with slugs
- **ProductCategory**: Many-to-many relationship

### Shopping Cart

- **Cart**: User shopping cart with status (ACTIVE, CHECKED_OUT, ABANDONED, EXPIRED)
- **ShopCart**: Cart items grouped by shop
- **CartItem**: Individual cart items with options and notes

### Orders

- **Order**: Order entity with comprehensive status tracking
  - Status flow: PENDING_CONFIRMATION → WAITING_PAYMENT → WAITING_SHOP_CONFIRMATION → PROCESSING → COMPLETED
  - Also supports: REJECTED, PAYMENT_REJECTED, CANCELLED
- **OrderItem**: Line items with product snapshots
- **OrderType**: READY or PREORDER
- **PostOrderType**: DELIVERY_TO_TABLE, TAKEAWAY, COURIER_DELIVERY
- **Refund**: Refund requests with reasons and status
  - Reasons: LATE_DELIVERY, WRONG_ORDER, DAMAGED_FOOD, MISSING_ITEM, OTHER
  - Status: PENDING, APPROVED, REJECTED, PROCESSED, CANCELLED

### Complaints & Reviews

- **ShopComplaint**: Customer complaints with proof, feedback, status
  - Status: PENDING, UNDER_REVIEW, RESOLVED, REJECTED, ESCALATED
- **ShopTestimony**: Order-based shop reviews with ratings
- **AppTestimony**: General app testimonials

### Chat (Firebase)

- **QuickChat**: Predefined quick reply templates (PostgreSQL)
- **Firestore Collections** (see Firebase section below)

### Violations

- **CustomerViolation**: Track customer violations (e.g., ORDER_CANCEL_WITHOUT_PAY)

### Other

- **Faq**: Frequently asked questions

---

## Firebase Structure

### Firestore Collections

#### `/chats/{chatId}`

```typescript
{
  id: string;                    // "{buyerId}_{sellerId}"
  participantIds: string[];      // [buyerId, sellerId]
  lastMessage: string;
  lastMessageType: "TEXT" | "ORDER" | "ATTACHMENT";
  lastMessageAt: timestamp;
  lastMessageSenderId: string;
  participantsInfo: {
    [userId]: {
      name: string;
      avatar: string;
      role: "CUSTOMER" | "SHOP_OWNER";
      lastSeenAt: timestamp;
    }
  };
  unreadCounts: Record<string, number>;
  lastSeenAt: {
    [userId]: timestamp;
  };
  typing: {
    [userId]: boolean;
  };
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### `/chats/{chatId}/messages/{messageId}`

```typescript
{
  id: string;
  senderId: string;
  type: "TEXT" | "ORDER" | "ATTACHMENT";
  text?: string;
  imageUrl?: string;
  media?: Array<{
    url: string;
    path: string;
    contentType: string;
    size: number;
  }>;
  readBy: string[];
  createdAt: timestamp;
}
```

### Firebase Services

- **Client SDK**: Real-time chat, notifications subscription
- **Admin SDK**: Server-side operations, FCM push notifications

---

## Key Features

### 1. **Authentication & Authorization**

- **Location**: `src/features/auth/`
- **Tech**: NextAuth v5 with role-based access control
- **Roles**: ADMIN, CUSTOMER, SHOP_OWNER
- **Pages**:
  - `/login-pelanggan` - Customer login
  - `/login-kedai` - Shop owner login

### 2. **Canteen & Shop Management**

- **Location**: `src/features/canteen/`, `src/features/shop/`
- **Features**:
  - Browse canteens and shops
  - Shop status management (active, inactive, suspended)
  - Payment method configuration (QRIS, bank transfer, cash)
  - Order mode: PREORDER_ONLY, READY_ONLY, BOTH
  - Refund disbursement mode: CASH, TRANSFER
  - Shop billing and commission tracking
- **Pages**:
  - `/kantin` - Browse canteens
  - `/kantin/[slug]` - Canteen detail
  - `/kantin/[slug]/pilih-meja` - Table selection with QR codes
  - `/kedai/[shop_id]` - Shop detail
  - `/dashboard-kedai` - Shop owner dashboard

### 3. **Product Management**

- **Location**: `src/features/product/`
- **Features**:
  - Product CRUD operations
  - Product options with additional pricing
  - Categories and filtering
  - Availability toggle
  - Product ratings
- **Pages**:
  - `/kedai/[shop_id]/[product_id]` - Product detail
  - `/dashboard-kedai/produk` - Product list (owner)
  - `/dashboard-kedai/produk/create` - Create product
  - `/dashboard-kedai/produk/[product_id]/edit` - Edit product

### 4. **Shopping Cart**

- **Location**: `src/features/cart/`
- **Features**:
  - Multi-shop cart support
  - Cart item customization with product options
  - Cart expiration and cleanup
  - Per-shop notes and payment method selection
- **Pages**:
  - `/keranjang` - Cart overview
  - `/keranjang/[shop_cart_id]` - Shop-specific cart
  - `/keranjang/[shop_cart_id]/[cart_item_id]` - Edit cart item

### 5. **Order Management**

- **Location**: `src/features/order/`
- **Features**:
  - Order creation from cart
  - Order status tracking with comprehensive flow
  - Payment proof upload and verification
  - Order estimation (time in minutes)
  - Post-order delivery options (table, takeaway, courier)
  - Order cancellation and rejection with reasons
- **Pages**:
  - `/order/[order_id]` - Order detail and tracking
  - `/dashboard-kedai/order` - Shop orders dashboard
  - `/dashboard-kedai/order/[order_id]` - Shop order detail

### 6. **Real-time Chat**

- **Location**: `src/features/chat/`
- **Tech**: Firebase Firestore for real-time messaging
- **Features**:
  - One-on-one chat (customer ↔ shop owner)
  - Text messages, attachments, order sharing
  - Typing indicators
  - Unread message counts
  - Last seen tracking
  - Quick chat templates
  - Message read receipts
- **Pages**:
  - `/chat` - Customer chat list
  - `/chat/[chat_id]` - Customer chat conversation
  - `/dashboard-kedai/chat` - Shop owner chat list
  - `/dashboard-kedai/chat/[chat_id]` - Shop owner chat conversation

### 7. **Notifications**

- **Location**: `src/features/notification/`
- **Tech**: Firebase Cloud Messaging (FCM)
- **Features**:
  - Push notifications for web, Android, iOS
  - Multi-device token management
  - Order status updates
  - Chat message notifications
  - Custom notification dialogs
- **Pages**:
  - `/notifikasi` - Notifications page
  - `/dashboard-kedai/demo/notification` - Notification demo

### 8. **Complaints & Refunds**

- **Features**:
  - File complaints with proof
  - Refund requests with multiple reasons
  - Admin review and approval workflow
  - Status tracking (PENDING → APPROVED → PROCESSED)
  - Refund disbursement proof upload
- **Related**: `src/features/order/`, shop complaint management

### 9. **Reviews & Testimonials**

- **Location**: `src/features/testimony/`
- **Features**:
  - Order-based shop reviews with ratings
  - App testimonials
  - Average rating calculation
- **Pages**:
  - `/kedai/[shop_id]/testimoni` - Shop testimonials

### 10. **Shop Settings**

- **Pages**:
  - `/dashboard-kedai/pengaturan` - Settings overview
  - `/dashboard-kedai/pengaturan/edit-kedai` - Edit shop info
  - `/dashboard-kedai/pengaturan/metode-pembayaran` - Payment methods
  - `/dashboard-kedai/pengaturan/pesan-singkat` - Quick chat templates

---

## API Routes

### Location: `src/app/api/`

Key API endpoints include:

- Authentication endpoints
- Order processing
- Payment verification
- File uploads (Vercel Blob)
- Notification sending (FCM)
- Chat operations

---

## Routing & Navigation

### Customer Routes

- `/` - Homepage
- `/kantin` - Browse canteens
- `/kantin/[slug]` - Canteen detail
- `/kantin/[slug]/pilih-meja` - Table selection
- `/kedai/[shop_id]` - Shop detail
- `/kedai/[shop_id]/[product_id]` - Product detail
- `/keranjang` - Shopping cart
- `/order/[order_id]` - Order tracking
- `/chat` - Chat conversations
- `/notifikasi` - Notifications
- `/dashboard-pelanggan` - Customer dashboard

### Shop Owner Routes

- `/dashboard-kedai` - Dashboard home
- `/dashboard-kedai/produk` - Product management
- `/dashboard-kedai/order` - Order management
- `/dashboard-kedai/chat` - Customer conversations
- `/dashboard-kedai/pengaturan` - Shop settings
- `/login-kedai` - Shop owner login

---

## Design Patterns & Conventions

### Feature Module Structure

Each feature follows a modular pattern:

```
features/[feature-name]/
├── lib/        # Business logic, data fetching
├── ui/         # React components
├── types/      # TypeScript types
└── hooks/      # Custom hooks
```

### Naming Conventions

For comprehensive naming standards covering files, components, variables, functions, database tables, and more, see **[Naming Conventions Documentation](./naming-conventions.md)**.

**Key Highlights**:

- **Routes**: Indonesian (user-facing) - `kedai`, `keranjang`, `notifikasi`
- **Code**: English (developer-facing) - `ShopCard`, `createOrder()`
- **Components**: PascalCase - `ProductCard.tsx`
- **Functions**: camelCase with verb prefix - `getShopById()`
- **Database**: snake_case - `created_at`, `user_id`
- **Constants**: SCREAMING_SNAKE_CASE - `MAX_FILE_SIZE`

### State Management

- **Server State**: TanStack React Query for caching and synchronization
- **Global Client State**: Zustand stores
- **Form State**: React Hook Form
- **URL State**: nuqs for searchParams

### Styling Approach

- Tailwind CSS utility classes
- Custom design tokens in `globals.css`
- Radix UI primitives with shadcn/ui
- Responsive design patterns

---

## Environment Configuration

Key environment variables (see `.env`):

- Database connection (`DATABASE_URL`)
- NextAuth configuration
- Firebase credentials (admin and client)
- Vercel Blob token
- App URLs and secrets

---

## Development Workflow

### Commands

```bash
# Development
bun run dev

# Build
bun run build

# Production
bun run start

# Lint
bun run lint

# Database
bun prisma db push          # Sync schema
bun prisma migrate dev      # Create migration
bun prisma studio           # GUI for database
bun run prisma/seed         # Seed database
```

### Database Management

- **ORM**: Prisma with modular schemas
- **Schema Location**: `prisma/schema/`
- **Client Output**: `src/generated/prisma`
- **Migrations**: `prisma/migrations/`

---

## Key Dependencies Summary

### UI & Interaction

- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icon library
- `sonner` - Toast notifications
- `embla-carousel-react` - Carousels
- `cmdk` - Command palette

### Data & Forms

- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation
- `zustand` - Global state

### Backend & Database

- `@prisma/client` - Database ORM
- `next-auth` - Authentication
- `firebase` - Real-time data & notifications
- `firebase-admin` - Server-side Firebase
- `@vercel/blob` - File storage
- `bcryptjs` - Password hashing

### Utilities

- `date-fns` - Date manipulation
- `clsx` & `tailwind-merge` - Class name utilities
- `class-variance-authority` - Component variants
- `nuqs` - URL state management

---

## Recent Development History

Based on conversation history, recent work includes:

1. **Chat Permissions Debugging** - Fixed Firestore rules for chat updates
2. **Order Notification Dialog** - Modal component for new order alerts
3. **Chat Typing Indicator** - Real-time typing status
4. **Product Option Resolver** - TypeScript type fixes
5. **Vercel Blob Upload Service** - File upload API
6. **Complaint and Refund System** - Comprehensive dispute resolution
7. **Food Court E-commerce Setup** - Initial project setup

---

## Critical Business Logic

For comprehensive business rules, workflows, and constraints, see **[Business Process & Rules Documentation](./business-process.md)**.

**Key Highlights**:

### Order Flow

- State Machine: PENDING_CONFIRMATION → WAITING_PAYMENT → WAITING_SHOP_CONFIRMATION → PROCESSING → COMPLETED
- Alternative paths: REJECTED, PAYMENT_REJECTED, CANCELLED
- Manual payment verification by shop owner

### Pricing Model

- Commission: **1000 IDR per order item quantity**
- Price snapshot at cart addition prevents manipulation
- Product options add to base price

### Cart System

- Multi-shop cart support (grouped by ShopCart)
- Independent checkout per shop
- Cart expiration: ACTIVE → ABANDONED (1h) → EXPIRED (7d)

### Refund Process

- Customer files complaint → Shop reviews → Approved/Rejected → Disbursement
- Refunds deducted from shop's monthly billing

### Shop Management

- Status: ACTIVE, INACTIVE, SUSPENDED
- Only admin can suspend shops
- Suspended shops cannot receive new orders

---

## Firebase vs PostgreSQL Split

### PostgreSQL (Prisma)

- User accounts and authentication
- Product catalog
- Orders and transactions
- Cart and checkout
- Billing and payments
- Static configuration

### Firebase Firestore

- Real-time chat messages
- Typing indicators
- Read receipts
- Unread counts
- Last seen status

### Rationale

- PostgreSQL for transactional, relational data
- Firebase for real-time, collaborative features
- Separation of concerns for scalability

---

## Security Considerations

1. **Role-based Access**: ADMIN, CUSTOMER, SHOP_OWNER with proper authorization
2. **Firestore Rules**: Enforced read/write permissions for chat
3. **Password Hashing**: bcryptjs for secure storage
4. **Shop Suspension**: Admin can suspend shops for violations
5. **Customer Violations**: Track and penalize fraudulent behavior
6. **Payment Verification**: Manual shop verification prevents fraud

---

## Performance Optimizations

1. **Prisma Accelerate**: Database connection pooling and caching
2. **React Query**: Automatic caching and background refetching
3. **Next.js**: Server-side rendering and static generation
4. **Indexed Database Queries**: Strategic indexes on frequently queried fields
5. **Image Optimization**: Vercel Blob for efficient storage

---

## Known Technical Debt / Areas for Improvement

1. See [project-structure.md](./project-structure.md) and [naming-conventions.md](./naming-conventions.md)
2. **Type Safety**: Some TypeScript resolver issues (recently addressed)
3. **Error Handling**: Need consistent error boundaries and user feedback
4. **Testing**: No test suite currently implemented - consider Jest/Vitest for unit tests, Playwright for E2E
5. **Courier Delivery**: Commented out in order schema, not fully implemented

---

## Future Considerations

- Admin dashboard for system-wide management
- Analytics and reporting
- Advanced search and filtering
- Loyalty programs
- Multi-language support (currently Indonesian)
- Mobile app development (push notification infrastructure ready)
- Automated refund processing
- AI-powered fraud detection

---

## Contact & Documentation

- **Project Name**: Canteeners 2025
- **Repository**: Dwi-Wahyu/canteeners-main

### Documentation Files

- **[context.md](./context.md)** - This file - Complete project overview and reference
- **[project-structure.md](./project-structure.md)** - Detailed folder structure with clean architecture explanations
- **[naming-conventions.md](./naming-conventions.md)** - Comprehensive naming standards and conventions
- **[business-process.md](./business-process.md)** - Complete business rules, workflows, and constraints
- **[document-structure/](./document-structure/)** - Firebase/external service schemas
  - [chat.md](./document-structure/chat.md) - Firestore chat schema
  - [notifications/](./document-structure/notifications/) - FCM notification examples

---

_Last Updated: 2025-12-22_
