# Project Structure

This document explains the folder structure of the Canteeners project following clean code and clean architecture principles.

---

## 📁 Root Structure Overview

```
canteeners-main/
├── .next/                      # Next.js build output (generated)
├── docs/                       # Project documentation
├── prisma/                     # Database layer
├── public/                     # Static assets
├── src/                        # Application source code
├── .env                        # Environment variables
├── components.json             # shadcn/ui configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies
├── postcss.config.mjs          # PostCSS configuration
├── prisma.config.ts            # Prisma configuration
├── README.md                   # Project readme
└── tsconfig.json               # TypeScript configuration
```

---

## 📚 `docs/` - Documentation

**Purpose**: Centralize all project documentation for developers and stakeholders.

**Goals**:

- Provide onboarding materials for new developers
- Document architectural decisions and patterns
- Maintain API contracts and data structures
- Store technical specifications

**Structure**:

```
docs/
├── document-structure/         # Firebase/External service schemas
│   ├── chat.md                # Firestore chat collection structure
│   └── notifications/         # FCM notification payload examples
├── context.md                  # Complete project context and overview
├── project-structure.md        # This file - folder structure explanation
├── naming-conventions.md       # Naming standards and conventions
└── readme.md                   # Documentation index
```

**Best Practices**:

- Keep documentation close to code
- Update docs when changing architecture
- Use markdown for easy versioning
- Include code examples where relevant

---

## 🗄️ `prisma/` - Database Layer

**Purpose**: Manage database schema, migrations, and seeding following the **Data Access Layer** principle.

**Goals**:

- Single source of truth for database structure
- Version-controlled schema changes
- Modular schema organization for maintainability
- Repeatable database seeding for development

**Structure**:

```
prisma/
├── migrations/                 # Database migration history
│   └── [timestamp]_[name]/    # Auto-generated migration files
├── schema/                     # Modular Prisma schemas
│   ├── schema.prisma          # Main config, datasource, generator
│   ├── user.prisma            # User, roles, authentication
│   ├── shop.prisma            # Shop, payments, billing, complaints
│   ├── product.prisma         # Products, options, categories
│   ├── cart.prisma            # Shopping cart and items
│   ├── order.prisma           # Orders, refunds, order items
│   ├── chat.prisma            # Quick chat templates
│   ├── testimony.prisma       # Reviews and testimonials
│   └── violation.prisma       # Customer violations tracking
└── seed/                       # Database seeding scripts
    ├── index.ts               # Main seed orchestrator
    └── [entity].seed.ts       # Individual entity seeders
```

**Why Modular Schemas?**

- **Separation of Concerns**: Each domain has its own schema file
- **Easier Navigation**: Find models related to a feature quickly
- **Reduced Merge Conflicts**: Teams can work on different schemas
- **Better Organization**: Large projects stay manageable

**Best Practices**:

- Never edit migrations manually
- Use descriptive migration names
- Keep schemas focused on their domain
- Run migrations before deploying

---

## 🌐 `public/` - Static Assets

**Purpose**: Serve static files directly without processing.

**Goals**:

- Fast asset delivery via CDN
- Version-controlled public assets
- Direct URL access to files

**Common Contents**:

- Favicon and app icons
- Robots.txt
- Sitemap.xml
- Static images (logos, placeholders)
- Font files (if not using CDN)

**Best Practices**:

- Optimize images before adding
- Use meaningful filenames
- Organize by asset type (images/, fonts/, etc.)
- Keep size minimal for performance

---

## 💻 `src/` - Application Source Code

**Purpose**: Contains all application logic following **Clean Architecture** principles.

### Overview Structure

```
src/
├── app/                        # Next.js App Router (Presentation Layer)
├── components/                 # Shared UI components (Presentation Layer)
├── features/                   # Feature modules (Business Logic Layer)
├── lib/                        # Core libraries and infrastructure
├── hooks/                      # Shared React hooks
├── stores/                     # Global state management
├── types/                      # Shared TypeScript types
├── config/                     # Application configuration
├── constant/                   # Application constants
├── helper/                     # Utility functions
└── generated/                  # Auto-generated code (Prisma client)
```

---

### 📱 `src/app/` - Next.js App Router (Presentation Layer)

**Purpose**: File-based routing and page components. Acts as the **Presentation/Delivery Layer** in Clean Architecture.

**Goals**:

- Define application routes and navigation
- Handle HTTP requests and responses
- Orchestrate feature modules for page rendering
- Manage layouts and loading states
- Handle errors at route level

**Structure**:

```
app/
├── api/                        # API Routes (Backend endpoints)
│   ├── auth/                  # Authentication endpoints
│   ├── orders/                # Order operations
│   └── notifications/         # Notification sending
├── (customer-routes)/          # Customer-facing pages
│   ├── chat/                  # Chat interface
│   ├── kantin/                # Browse canteens
│   ├── kedai/                 # Shop and product pages
│   ├── keranjang/             # Shopping cart
│   ├── order/                 # Order tracking
│   ├── notifikasi/            # Notifications
│   └── dashboard-pelanggan/   # Customer dashboard
├── (shop-routes)/              # Shop owner pages
│   ├── dashboard-kedai/       # Shop dashboard
│   │   ├── produk/           # Product management
│   │   ├── order/            # Order management
│   │   ├── chat/             # Customer messages
│   │   └── pengaturan/       # Shop settings
│   └── login-kedai/           # Shop owner login
├── login-pelanggan/            # Customer login
├── globals.css                 # Global styles
├── layout.tsx                  # Root layout
├── page.tsx                    # Homepage
└── providers.tsx               # Context providers
```

**Clean Code Principles**:

- **Pages are thin**: Delegate logic to features
- **Server/Client separation**: Use 'use client' directive wisely
- **Colocation**: Keep page-specific components nearby
- **API routes**: Handle external requests, validate input, call features

**Example Pattern**:

```tsx
// app/kedai/[shop_id]/page.tsx
import { getShopDetails } from "@/features/shop/lib/queries";
import ShopDetailsClient from "@/features/shop/ui/shop-details-client";

export default async function ShopPage({ params }) {
  // Thin controller - fetch data and pass to feature component
  const shop = await getShopDetails(params.shop_id);
  return <ShopDetailsClient shop={shop} />;
}
```

---

### 🎨 `src/components/` - Shared UI Components

**Purpose**: Reusable UI components used across multiple features and pages.

**Goals**:

- **DRY Principle**: Don't repeat UI patterns
- **Consistency**: Maintain uniform design system
- **Reusability**: Components work in any context
- **Accessibility**: ARIA-compliant components

**Structure**:

```
components/
├── ui/                         # shadcn/ui base components
│   ├── button.tsx             # Button variants
│   ├── dialog.tsx             # Modal dialogs
│   ├── input.tsx              # Form inputs
│   ├── card.tsx               # Card layouts
│   └── ...                    # Other primitives
├── layouts/                    # Layout components
│   ├── container.tsx          # Page container
│   ├── navbar.tsx             # Navigation bar
│   ├── sidebar.tsx            # Sidebar layout
│   └── footer.tsx             # Footer
├── icons/                      # Custom icon components
│   ├── canteen-icon.tsx
│   ├── order-icon.tsx
│   └── ...
├── pages/                      # Page-level shared components
│   ├── loading-page.tsx       # Full-page loader
│   └── error-page.tsx         # Error display
├── file-upload-image.tsx       # Image upload component
├── notification-dialog.tsx     # Notification modal
├── logout-button-dialog.tsx    # Logout confirmation
├── multiple-select.tsx         # Multi-select dropdown
└── theme-provider.tsx          # Theme context
```

**When to Create a Component Here**:

- ✅ Used in 3+ different features
- ✅ Generic and configurable
- ✅ No business logic dependencies
- ❌ Feature-specific behavior → Put in `features/[name]/ui/`
- ❌ Used once → Keep in page

**Best Practices**:

- Accept props for customization
- Use TypeScript for prop types
- Document complex components
- Keep components pure (stateless when possible)

---

### ⚙️ `src/features/` - Feature Modules (Clean Architecture Core)

**Purpose**: Each feature is a **self-contained module** following Clean Architecture and Domain-Driven Design principles.

**Goals**:

- **Separation of Concerns**: Each feature owns its domain logic
- **Modularity**: Features can be developed/tested independently
- **Scalability**: Easy to add new features without affecting others
- **Maintainability**: Clear boundaries between domains
- **Testability**: Business logic isolated from framework

**Structure per Feature**:

```
features/[domain]/
├── lib/                            # Business Logic Layer
│   ├── [domain]-actions.ts        # Server actions (Next.js)
│   ├── [domain]-queries.ts        # Server-side data fetching
│   └── [domain]-helpers.ts        # Feature-specific utilities
├── types/                          # TypeScript Definitions
│   ├── [domain]-queries-types.ts  # Query return types (inferred from queries)
│   ├── [domain]-schemas.ts        # Zod schemas for CRUD and validation
│   └── [domain]-search-params.ts  # nuqs search params schemas and types
└── ui/                             # Presentation Components
    ├── [domain]-client.tsx        # Client components
    ├── [domain]-form.tsx          # Form components
    ├── [domain]-list.tsx          # List/table components
    ├── [domain]-detail.tsx        # Detail view components
    └── [domain]-search.tsx        # Search/filter components
```

**Example (Shop Feature)**:

```
features/shop/
├── lib/
│   ├── shop-actions.ts       # Server actions (create, update, delete shop)
│   ├── shop-queries.ts       # getShopById(), getShopAndProducts()
│   └── shop-helpers.ts       # Shop-specific helper functions
├── types/
│   ├── shop-queries-types.ts # GetShopAndProducts, GetShopTestimonies
│   ├── shop-schemas.ts       # shopCreateSchema, shopUpdateSchema
│   └── shop-search-params.ts # ShopSearchParams, ShopProductsSearchParams
└── ui/
    ├── shop-details-client.tsx
    ├── shop-form.tsx
    └── shop-list.tsx
```

**Subdomain Organization**:

- Features can contain **subdomain features** if closely related
- Example: `features/shop/billing/` for shop billing subdomain
- Critical features should remain in **root feature folder**
- Subdomains follow same structure: `lib/`, `types/`, `ui/`

---

### 📦 Feature Modules Detailed Breakdown

#### 1. **`features/auth/`** - Authentication & Authorization

**Domain**: User authentication, session management, role-based access control.

**Responsibilities**:

- Login/logout flows
- Session validation
- Role checking (ADMIN, CUSTOMER, SHOP_OWNER)
- Password hashing
- NextAuth configuration

**Key Files**:

- `lib/auth.ts` - NextAuth config and session utilities
- `lib/actions.ts` - Login/logout server actions

---

#### 2. **`features/cart/`** - Shopping Cart Management

**Domain**: Multi-shop shopping cart with product customization.

**Responsibilities**:

- Add/remove/update cart items
- Calculate cart totals with options pricing
- Handle cart expiration (ACTIVE → ABANDONED → EXPIRED)
- Manage cart by shop (ShopCart)
- Cart to order conversion

**Key Files**:

- `lib/mutations.ts` - Cart CRUD operations
- `lib/queries.ts` - Fetch cart with shop details
- `lib/utils.ts` - Price calculation logic
- `ui/shop-cart-client.tsx` - Cart display component

**Business Rules**:

- Each shop has separate sub-cart (ShopCart)
- Cart items snapshot product price
- Options add additional cost
- Carts expire after 7 days of inactivity

---

#### 3. **`features/chat/`** - Real-time Chat

**Domain**: One-on-one messaging between customers and shop owners.

**Responsibilities**:

- Send/receive messages (Firebase Firestore)
- Typing indicators
- Read receipts
- Unread count calculation
- Message attachments
- Quick chat templates
- Chat history management

**Key Files**:

- `lib/firebase-client.ts` - Firestore operations
- `lib/queries.ts` - Fetch chat participants from PostgreSQL
- `ui/client-chat-page.tsx` - Chat interface
- `ui/message-list.tsx` - Message rendering
- `types/index.ts` - Chat message types

**Architecture Note**:

- **Firestore**: Real-time messages, typing status, presence
- **PostgreSQL**: User info, quick chat templates
- Hybrid approach for optimal performance

---

#### 4. **`features/order/`** - Order Management

**Domain**: Complete order lifecycle from creation to completion/refund.

**Responsibilities**:

- Create orders from cart
- Order status transitions
- Payment proof upload
- Shop order acceptance/rejection
- Estimation time management
- Order completion
- Refund requests and processing
- Order history

**Key Files**:

- `lib/mutations.ts` - Order state transitions
- `lib/queries.ts` - Fetch orders with relations
- `lib/validations.ts` - Order creation schemas
- `ui/order-status-card.tsx` - Status display
- `ui/order-timeline.tsx` - Order progress tracker

**Order Status Flow**:

```
PENDING_CONFIRMATION
  ↓ (shop confirms)
WAITING_PAYMENT
  ↓ (customer uploads proof)
WAITING_SHOP_CONFIRMATION
  ↓ (shop verifies payment)
PROCESSING
  ↓ (order prepared)
COMPLETED

Alternative paths:
- REJECTED (out of stock)
- PAYMENT_REJECTED (invalid proof)
- CANCELLED (customer/shop cancels)
```

---

#### 5. **`features/product/`** - Product Catalog

**Domain**: Product listing, details, customization options.

**Responsibilities**:

- CRUD operations for products
- Product options and values (e.g., spice level)
- Category assignment
- Availability toggle
- Price management
- Product search and filtering
- Rating aggregation

**Key Files**:

- `lib/mutations.ts` - Create/update/delete products
- `lib/queries.ts` - Product listing with filters
- `lib/validations.ts` - Product form schemas
- `ui/product-form.tsx` - Create/edit product
- `ui/product-card.tsx` - Product display

**Product Options System**:

- **ProductOption**: Option type (e.g., "Spice Level")
  - `is_required`: Must be selected
  - `type`: SINGLE (radio) or MULTIPLE (checkbox)
- **ProductOptionValue**: Specific values ("Mild", "Spicy")
  - `additional_price`: Extra cost for this option

---

#### 6. **`features/shop/`** - Shop Management

**Domain**: Shop profiles, settings, billing, complaints.

**Responsibilities**:

- Shop CRUD operations
- Payment method configuration
- Operating hours management
- Shop status (ACTIVE, INACTIVE, SUSPENDED)
- Billing and commission tracking
- Complaint handling
- Shop ratings

**Key Files**:

- `lib/mutations.ts` - Shop updates
- `lib/queries.ts` - Shop details with products
- `ui/shop-settings-form.tsx` - Settings editor
- `ui/payment-methods-config.tsx` - Payment setup

**Business Rules**:

- Commission: Tiered (1000 for first 2 items, 500 for subsequent) per order item quantity
- Billing cycle: Monthly
- Refunds deducted from billing
- Suspended shops cannot receive orders

---

#### 7. **`features/notification/`** - Push Notifications

**Domain**: Firebase Cloud Messaging integration.

**Responsibilities**:

- FCM token registration
- Send push notifications (order updates, messages)
- Multi-device support (WEB, ANDROID, IOS)
- Notification preferences
- Token lifecycle management

**Key Files**:

- `lib/fcm-client.ts` - Client-side FCM setup
- `lib/fcm-server.ts` - Server-side notification sending
- `lib/mutations.ts` - Token registration
- `ui/notification-permission.tsx` - Permission request

---

#### 8. **`features/user/`** - User Management

**Domain**: User profiles and account management.

**Responsibilities**:

- User profile updates
- Avatar management
- Role-specific data (Customer, Owner, Admin)
- Account suspension
- Last login tracking

---

#### 9. **`features/canteen/`** - Canteen Management

**Domain**: Food court locations and table management.

**Responsibilities**:

- Canteen listing
- Floor maps with tables
- QR code generation for tables
- Table selection for orders

---

#### 10. **`features/category/`** - Product Categories

**Domain**: Product categorization and filtering.

**Responsibilities**:

- Category CRUD
- Category slugs for URLs
- Product-to-category assignment

---

#### 11. **`features/testimony/`** - Reviews & Ratings

**Domain**: Customer reviews and ratings.

**Responsibilities**:

- Order-based reviews
- Rating aggregation
- Shop testimonials
- App testimonials

---

### 🔧 `src/lib/` - Core Libraries & Infrastructure

**Purpose**: Infrastructure layer containing framework integrations and core utilities.

**Goals**:

- Abstract external dependencies
- Provide singleton instances
- Configure third-party services

**Structure**:

```
lib/
├── firebase/
│   ├── admin.ts              # Firebase Admin SDK (server)
│   ├── client.ts             # Firebase Client SDK
│   └── messaging.ts          # FCM configuration
├── prisma.ts                  # Prisma client singleton
└── utils.ts                   # Shared utility functions (cn, etc.)
```

**Best Practices**:

- Use environment variables for configuration
- Create singleton instances to prevent memory leaks
- Keep this layer thin - just infrastructure

---

### 🪝 `src/hooks/` - Shared React Hooks

**Purpose**: Reusable React hooks used across multiple features.

**Examples**:

- `use-media-query.ts` - Responsive breakpoints
- `use-debounce.ts` - Debounce values
- `use-local-storage.ts` - Browser storage
- `use-auth.ts` - Current user session

**When to Create Here vs Features**:

- ✅ Feature-agnostic hooks → `src/hooks/`
- ❌ Feature-specific hooks → `features/[name]/hooks/`

---

### 🏪 `src/stores/` - Global State (Zustand)

**Purpose**: Application-wide state management for client-side data.

**Goals**:

- Share state across components without prop drilling
- Persist state to localStorage when needed
- Handle UI state (modals, sidebar, theme)

**Structure**:

```
stores/
├── auth-store.ts              # Current user state
├── ui-store.ts                # UI state (sidebar, modals)
└── cart-store.ts              # Client-side cart optimizations
```

**Best Practices**:

- Keep server state in React Query, not Zustand
- Use selectors to prevent unnecessary re-renders
- Document state shape with TypeScript

---

### 📘 `src/types/` - Shared TypeScript Types

**Purpose**: Type definitions used across multiple features.

**Structure**:

```
types/
├── index.ts                   # Shared type exports
├── api.ts                     # API response types
└── common.ts                  # Common domain types
```

**Best Practices**:

- Feature-specific types go in `features/[name]/types/`
- Only truly shared types belong here
- Re-export Prisma types when needed

---

### ⚙️ `src/config/` - Application Configuration

**Purpose**: Centralized configuration constants.

**Examples**:

- API endpoints
- Feature flags
- App constants (max file size, etc.)

---

### 📋 `src/constant/` - Application Constants

**Purpose**: Immutable values used throughout the app.

**Examples**:

- Enum mappings
- Static text
- Configuration values

---

### 🛠️ `src/helper/` - Utility Functions

**Purpose**: Pure functions for data transformation and formatting.

**Examples**:

- Date formatters
- Currency formatters
- String manipulations
- Validation helpers

**Best Practices**:

- Keep functions pure (no side effects)
- Unit test helpers
- Export from index for easy import

---

### 🤖 `src/generated/` - Auto-generated Code

**Purpose**: Output directory for code generators (Prisma Client).

**Important**:

- ⚠️ Never edit files here manually
- ✅ Add to `.gitignore`
- ✅ Regenerate with `npx prisma generate`

---

## 🎯 Clean Architecture Principles Applied

### Layer Separation

```
┌─────────────────────────────────────┐
│   Presentation Layer (app/, components/)   │
│   - Pages, UI components            │
│   - User interaction                │
└──────────────┬──────────────────────┘
               │ depends on
┌──────────────▼──────────────────────┐
│   Business Logic Layer (features/)  │
│   - Domain logic                    │
│   - Use cases                       │
│   - Validation                      │
└──────────────┬──────────────────────┘
               │ depends on
┌──────────────▼──────────────────────┐
│   Data Layer (prisma/, lib/)        │
│   - Database access                 │
│   - External services               │
└─────────────────────────────────────┘
```

### Dependency Rule

- Outer layers depend on inner layers
- Inner layers know nothing about outer layers
- `app/` uses `features/`, not vice versa
- `features/` uses `lib/`, not vice versa

### Benefits

- **Testability**: Test business logic without UI or database
- **Flexibility**: Swap implementations without breaking logic
- **Maintainability**: Clear boundaries make code easier to understand
- **Scalability**: Add features without modifying existing ones

---

## 📝 Summary

The Canteeners project structure follows **Clean Architecture** and **Domain-Driven Design** principles:

1. **Features are self-contained modules** with their own logic, UI, and types
2. **Pages are thin controllers** that orchestrate features
3. **Shared components** promote consistency and DRY
4. **Infrastructure is abstracted** in the lib layer
5. **Database is modular** for better organization

This structure ensures:

- ✅ **Scalability**: Easy to add new features
- ✅ **Maintainability**: Clear where code belongs
- ✅ **Testability**: Business logic is isolated
- ✅ **Team collaboration**: Minimal merge conflicts
- ✅ **Code reusability**: Shared components and utilities
