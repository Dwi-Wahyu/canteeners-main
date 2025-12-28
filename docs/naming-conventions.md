# Naming Conventions

This document explains the naming conventions and standards used throughout the Canteeners project.

---

## 🎯 Overview

Consistent naming conventions improve code readability, maintainability, and collaboration. This project uses a mix of **English** (for code) and **Indonesian** (for user-facing routes) to balance developer standards with local user experience.

---

## 📂 File and Folder Naming

### General Rules

| Context              | Convention     | Example                                             |
| -------------------- | -------------- | --------------------------------------------------- |
| **Folders**          | kebab-case     | `shopping-cart/`, `user-profile/`                   |
| **React Components** | PascalCase.tsx | `ShopDetailsClient.tsx`, `ProductCard.tsx`          |
| **TypeScript Files** | kebab-case.ts  | `queries.ts`, `validations.ts`, `use-cart-query.ts` |
| **Utility Files**    | kebab-case.ts  | `format-rupiah.ts`, `date-helpers.ts`               |
| **Env Files**        | UPPERCASE      | `.env`, `.env.local`, `.env.production`             |

### Route Segments (Indonesian)

**Why Indonesian for Routes?**

- Target users are Indonesian speakers
- Better SEO for local market
- Familiar and intuitive for end users
- Reduces language context switching for users

**Rationale for English Code**:

- Developer documentation and discussions use English
- Third-party libraries and APIs use English
- Easier collaboration with international developers
- Standard practice in software engineering

**Examples**:

| English Concept | Route (Indonesian)  | Component Name (English) |
| --------------- | ------------------- | ------------------------ |
| Shop            | `/kedai/[shop_id]`  | `ShopDetailsPage.tsx`    |
| Cart            | `/keranjang`        | `CartPage.tsx`           |
| Canteen         | `/kantin`           | `CanteenListPage.tsx`    |
| Notification    | `/notifikasi`       | `NotificationPage.tsx`   |
| Order           | `/order/[order_id]` | `OrderDetailPage.tsx`    |
| Dashboard Shop  | `/dashboard-kedai`  | `ShopDashboardPage.tsx`  |

---

## 🗂️ Feature Module Naming

### Feature Folder Structure

```
features/
├── auth/              # Authentication (English - technical domain)
├── cart/              # Shopping cart (English - matches DB table)
├── order/             # Order management (English - matches DB table)
├── product/           # Product catalog (English - matches DB table)
├── shop/              # Shop management (English - matches DB table)
├── chat/              # Chat messaging (English - technical)
└── notification/      # Push notifications (English - technical)
```

**Convention**: Use **English** for feature names that match database tables or technical domains.

### Feature File Naming

```
features/[domain]/
├── lib/
│   ├── [domain]-actions.ts        # Server actions
│   ├── [domain]-queries.ts        # Server-side queries
│   └── [domain]-helpers.ts        # Helper functions
├── types/
│   ├── [domain]-queries-types.ts  # Query return types
│   ├── [domain]-schemas.ts        # Zod validation schemas
│   └── [domain]-search-params.ts  # nuqs search params
└── ui/
    ├── [domain]-client.tsx        # Client components
    ├── [domain]-form.tsx          # Form components
    ├── [domain]-list.tsx          # List components
    ├── [domain]-detail.tsx        # Detail view
    └── [domain]-search.tsx        # Search/filter UI
```

**Why Domain-Prefixed Naming?**

- **Clarity**: `shop-actions.ts` is clearer than generic `actions.ts`
- **Searchability**: Easy to find files across features
- **Import clarity**: `import { getShopById } from '@/features/shop/lib/shop-queries'`
- **Prevents conflicts**: Multiple features can have `actions.ts` without confusion

**Examples**:

- `features/shop/lib/shop-actions.ts` - Shop server actions
- `features/shop/lib/shop-queries.ts` - Shop data fetching
- `features/shop/types/shop-queries-types.ts` - GetShopAndProducts, GetShopTestimonies
- `features/shop/types/shop-schemas.ts` - shopCreateSchema, shopUpdateSchema
- `features/shop/types/shop-search-params.ts` - ShopSearchParams with nuqs

**Pattern Explanation**:

**lib/ folder**:

- `[domain]-actions.ts`: Server actions for mutations (create, update, delete)
- `[domain]-queries.ts`: Data fetching functions (getById, getList, etc.)
- `[domain]-helpers.ts`: Pure utility functions specific to this domain

**types/ folder**:

- `[domain]-queries-types.ts`: Inferred return types from query functions
  ```typescript
  export type GetShopAndProducts = NonNullable<
    Awaited<ReturnType<typeof getShopAndProducts>>
  >;
  ```
- `[domain]-schemas.ts`: Zod schemas for validation and type inference
- `[domain]-search-params.ts`: nuqs search params cache and inferred types

  ```typescript
  export const ShopSearchParams = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    name: parseAsString.withDefault(""),
  });

  export type ShopSearchParamsInput = {
    page: number;
    name: string;
  };
  ```

**ui/ folder**:

- Follow component naming: `[domain]-[purpose].tsx`

---

## 📝 Component Naming

### React Components

**Convention**: PascalCase with descriptive, hierarchical names.

**Pattern**: `[Feature][Purpose][Type]`

**Examples**:

```
ShopDetailsClient         # Shop details client component
ProductListItem          # Single product in list
OrderStatusBadge         # Badge showing order status
CartItemCard             # Card for cart item
ShopDashboardLayout      # Layout for shop dashboard
```

### Component Files

**Single Component per File** (preferred):

```
components/ui/
├── button.tsx           # exports Button
├── dialog.tsx           # exports Dialog
└── input.tsx            # exports Input
```

**Multiple Related Components** (when tightly coupled):

```
components/layouts/
└── navbar.tsx           # exports Navbar, NavItem, NavLogo
```

### UI Component Pattern

Follow **shadcn/ui** naming:

- Lowercase file names: `button.tsx`, `dialog.tsx`
- PascalCase exports: `Button`, `Dialog`, `DialogTrigger`
- Compound components use parent name as prefix

---

## 🔤 Variable and Function Naming

### Variables

**Convention**: camelCase for variables and constants (except true constants).

```typescript
// ✅ Good
const userId = "123";
const isLoggedIn = true;
const productList = [...];
const totalPrice = 1000;

// ❌ Bad
const user_id = "123";          // snake_case (reserved for database)
const IsLoggedIn = true;        // PascalCase (reserved for components/classes)
const product_list = [...];     // Inconsistent
```

### Constants

**Convention**: SCREAMING_SNAKE_CASE for true constants (unchanging values).

```typescript
// ✅ Good - src/constant/
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ORDER_STATUS_PENDING = "PENDING_CONFIRMATION";
export const API_BASE_URL = "https://api.example.com";
export const DEFAULT_PAGE_SIZE = 20;

// ❌ Bad
export const maxFileSize = 5242880; // camelCase for constants
```

### Functions

**Convention**: camelCase with verb prefix.

**Patterns**:

| Prefix               | Purpose                | Example                                   |
| -------------------- | ---------------------- | ----------------------------------------- |
| `get`                | Fetch/retrieve data    | `getShopById()`, `getUserProfile()`       |
| `fetch`              | Async data retrieval   | `fetchOrders()`, `fetchProducts()`        |
| `create`             | Create new entity      | `createOrder()`, `createProduct()`        |
| `update`             | Modify existing entity | `updateShop()`, `updateCart()`            |
| `delete`             | Remove entity          | `deleteProduct()`, `deleteCartItem()`     |
| `calculate`          | Compute value          | `calculateTotal()`, `calculateDiscount()` |
| `validate`           | Check validity         | `validateEmail()`, `validateOrder()`      |
| `format`             | Transform data         | `formatCurrency()`, `formatDate()`        |
| `is` / `has` / `can` | Boolean checks         | `isAuthenticated()`, `hasPermission()`    |
| `handle`             | Event handler          | `handleSubmit()`, `handleClick()`         |
| `on`                 | Event callback         | `onOrderCreate()`, `onPaymentSuccess()`   |

**Examples**:

```typescript
// ✅ Good
async function getShopById(id: string) {
  /* ... */
}
function calculateCartTotal(items: CartItem[]) {
  /* ... */
}
function isShopOpen(openTime: Date, closeTime: Date) {
  /* ... */
}
async function createOrder(data: OrderInput) {
  /* ... */
}
function handleFormSubmit(e: FormEvent) {
  /* ... */
}

// ❌ Bad
async function shop(id: string) {
  /* ... */
} // Missing verb
function total(items: CartItem[]) {
  /* ... */
} // Not descriptive
function shopIsOpen() {
  /* ... */
} // Wrong order
async function orderCreate() {
  /* ... */
} // Wrong order
```

### React Hooks

**Convention**: Always prefix with `use` + camelCase.

```typescript
// ✅ Good
function useCartQuery() {
  /* ... */
}
function useOrderMutation() {
  /* ... */
}
function useAuthUser() {
  /* ... */
}
function useMediaQuery() {
  /* ... */
}

// ❌ Bad
function cartQuery() {
  /* ... */
} // Missing 'use' prefix
function UseOrderMutation() {
  /* ... */
} // PascalCase
function get_auth_user() {
  /* ... */
} // snake_case
```

---

## 🗄️ Database Naming

### Tables

**Convention**: `snake_case` + plural for tables.

```sql
-- ✅ Good
users
shops
products
cart_items
order_items
shop_testimonies

-- ❌ Bad
Users              -- PascalCase
product            -- Singular
cartItems          -- camelCase
```

### Columns

**Convention**: `snake_case` for all columns.

```prisma
// ✅ Good
model User {
  id         String @id
  user_id    String
  created_at DateTime
  full_name  String
  is_active  Boolean
}

// ❌ Bad
model User {
  id        String @id
  userId    String    // camelCase
  createdAt DateTime  // camelCase
  fullName  String    // camelCase
}
```

**Rationale**:

- SQL convention is snake_case
- Prevents accidental keyword conflicts
- Consistent with PostgreSQL naming standards
- Prisma auto-maps to camelCase in generated client

### Prisma Model Naming

**Convention**: PascalCase + singular for models.

```prisma
// ✅ Good
model User { ... }
model ShopCart { ... }
model OrderItem { ... }
model ProductOption { ... }

// ❌ Bad
model users { ... }            // lowercase
model shop_cart { ... }        // snake_case
model OrderItems { ... }       // plural
```

**Rationale**:

- Models represent entities/classes (PascalCase in TypeScript)
- Singular form represents "one instance"
- Prisma convention aligns with TypeScript classes

### Relationship Naming

```prisma
model Order {
  customer    Customer @relation(fields: [customer_id], references: [id])
  customer_id String   // Foreign key: [entity]_id pattern

  shop        Shop     @relation(fields: [shop_id], references: [id])
  shop_id     String

  order_items OrderItem[] // Collection: plural
}
```

**Pattern**:

- **Foreign key column**: `[entity]_id` (snake_case)
- **Relation field**: `[entity]` (camelCase, singular)
- **Collection relation**: `[entities]` (camelCase, plural)

---

## 🎨 CSS and Styling Naming

### CSS Classes (Tailwind)

**Convention**: Utility classes as-is, custom classes use kebab-case.

```tsx
// ✅ Good - Tailwind utilities
<div className="flex items-center gap-4 p-4 bg-white">

// ✅ Good - Custom classes
<div className="shop-card-container">

// ❌ Bad - Mixing conventions
<div className="ShopCard-container">
<div className="shop_card_container">
```

### CSS Custom Properties

**Convention**: kebab-case with `--` prefix.

```css
/* ✅ Good */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --border-radius: 0.5rem;
  --max-width-container: 1200px;
}

/* ❌ Bad */
:root {
  --primaryColor: #3b82f6;
  --SECONDARY_COLOR: #8b5cf6;
}
```

---

## 📦 Import/Export Naming

### Named Exports (Preferred)

```typescript
// ✅ Good - Explicit and searchable
export function getShopById(id: string) { ... }
export function createOrder(data: OrderInput) { ... }
export const MAX_CART_ITEMS = 50;

// Import
import { getShopById, createOrder, MAX_CART_ITEMS } from './shop';
```

### Default Exports (Components Only)

```typescript
// ✅ Good - For React components
export default function ShopDetailsPage() { ... }

// Import
import ShopDetailsPage from './shop-details-page';
```

### Barrel Exports

```typescript
// features/cart/types/index.ts
export * from "./schemas";
export * from "./dto";
export type { Cart, CartItem, ShopCart } from "./models";

// Usage
import { Cart, CartItem, CartFormSchema } from "@/features/cart/types";
```

---

## 🔐 Environment Variables

### Convention

**Pattern**: `SCREAMING_SNAKE_CASE` with prefix.

```bash
# ✅ Good
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...

VERCEL_BLOB_TOKEN=...

NEXT_PUBLIC_API_URL=...        # Public variables
NEXT_PUBLIC_FIREBASE_API_KEY=...
```

**Prefixes**:

- `NEXT_PUBLIC_` - Exposed to browser (use sparingly)
- `DATABASE_` - Database related
- `FIREBASE_` - Firebase configuration
- `NEXTAUTH_` - NextAuth configuration

---

## 🏷️ TypeScript Type Naming

### Interfaces vs Types

**Preference**: Use `type` for most cases, `interface` for extensible APIs.

```typescript
// ✅ Good - Type aliases
type User = {
  id: string;
  name: string;
};

type ShopWithProducts = Shop & {
  products: Product[];
};

// ✅ Good - Interfaces for extensible contracts
interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}
```

### Type Naming Patterns

| Pattern                  | Purpose             | Example                                 |
| ------------------------ | ------------------- | --------------------------------------- |
| `[Entity]`               | Core domain type    | `User`, `Shop`, `Order`                 |
| `[Entity]Input`          | Create/update input | `OrderInput`, `ProductInput`            |
| `[Entity]Output`         | API response        | `ShopOutput`, `OrderOutput`             |
| `[Entity]With[Related]`  | Type with relations | `ShopWithProducts`, `OrderWithItems`    |
| `[Action][Entity]Params` | Function parameters | `CreateOrderParams`, `UpdateShopParams` |
| `[Component]Props`       | React props         | `ButtonProps`, `DialogProps`            |

**Examples**:

```typescript
// ✅ Good
type Order = { ... };
type OrderInput = { ... };
type OrderWithItems = Order & { items: OrderItem[] };
type CreateOrderParams = { customerId: string; items: CartItem[] };
type ButtonProps = { variant: string; children: ReactNode };

// ❌ Bad
type order = { ... };                    // lowercase
type IOrder = { ... };                   // Hungarian notation
type OrderType = { ... };                // Redundant 'Type' suffix
type OrderInterface = { ... };           // Redundant 'Interface' suffix
```

### Enum Naming

**Convention**: PascalCase for enum, SCREAMING_SNAKE_CASE for values (Prisma style).

```typescript
// Prisma generated
enum OrderStatus {
  PENDING_CONFIRMATION
  WAITING_PAYMENT
  PROCESSING
  COMPLETED
  CANCELLED
}

// TypeScript enum (if not using Prisma)
enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  SHOP_OWNER = "SHOP_OWNER",
}
```

---

## 🧪 Test File Naming

### Convention

```
[filename].test.ts         # Unit tests
[filename].spec.ts         # Integration tests (alternative)
[filename].e2e.ts          # End-to-end tests
```

**Examples**:

```
cart.test.ts               # Tests for cart utility
ShopCard.test.tsx          # Tests for ShopCard component
order-mutations.test.ts    # Tests for order mutations
checkout.e2e.ts            # E2E test for checkout flow
```

---

## 📋 Comment Naming

### JSDoc Comments

````typescript
/**
 * Calculates the total price of cart items including options.
 *
 * @param items - Array of cart items with selected options
 * @returns Total price in rupiah (IDR)
 *
 * @example
 * ```ts
 * const total = calculateCartTotal(cartItems);
 * console.log(total); // 50000
 * ```
 */
function calculateCartTotal(items: CartItem[]): number {
  // Implementation
}
````

### Inline Comments

```typescript
// ✅ Good - Explain "why", not "what"
// Snapshot price to handle future price changes
const price_at_add = product.price;

// ✅ Good - Explain complex business logic
// Commission is 1000 per item quantity, not per order
const commission = orderItems.reduce(
  (sum, item) => sum + 1000 * item.quantity,
  0
);

// ❌ Bad - Obvious comment
// Set user id
const userId = user.id;
```

---

## 📖 Documentation File Naming

**Convention**: kebab-case.md

```
docs/
├── context.md
├── project-structure.md
├── naming-conventions.md    # This file
├── api-reference.md
└── deployment-guide.md
```

---

## 🎯 Summary Table

| Context                  | Convention            | Example                           |
| ------------------------ | --------------------- | --------------------------------- |
| **Routes (User-facing)** | Indonesian kebab-case | `/kedai`, `/keranjang`            |
| **Files (Code)**         | English kebab-case    | `queries.ts`, `mutations.ts`      |
| **Components**           | PascalCase            | `ShopCard.tsx`, `OrderDetail.tsx` |
| **Functions**            | camelCase with verb   | `getShopById()`, `createOrder()`  |
| **Variables**            | camelCase             | `userId`, `totalPrice`            |
| **Constants**            | SCREAMING_SNAKE_CASE  | `MAX_FILE_SIZE`, `API_URL`        |
| **React Hooks**          | `use` + camelCase     | `useCartQuery()`, `useAuth()`     |
| **Database Tables**      | snake_case plural     | `users`, `cart_items`             |
| **Database Columns**     | snake_case            | `created_at`, `user_id`           |
| **Prisma Models**        | PascalCase singular   | `User`, `OrderItem`               |
| **Types**                | PascalCase            | `Order`, `OrderInput`             |
| **CSS Classes**          | kebab-case            | `shop-card`, `order-status`       |
| **CSS Variables**        | --kebab-case          | `--primary-color`                 |
| **Env Variables**        | SCREAMING_SNAKE_CASE  | `DATABASE_URL`                    |

---

## ✅ Rationale Summary

### Why Mixed Language?

- **Indonesian routes**: Better UX for local users, improved SEO
- **English code**: Industry standard, easier collaboration and maintenance

### Why These Conventions?

- **Consistency**: Reduces cognitive load, easier to find files
- **Standards**: Follows TypeScript, React, and Next.js best practices
- **Tooling**: Works seamlessly with linters and formatters
- **Searchability**: Descriptive names make code searchable
- **Team Collaboration**: Clear standards reduce debates and merge conflicts

### Key Principles

1. **Be descriptive** - `getUserById` over `getUser`
2. **Be consistent** - Pick one style and stick to it
3. **Follow conventions** - Use community standards when available
4. **Consider context** - Database uses snake_case, TypeScript uses camelCase
5. **Document exceptions** - When breaking rules, explain why

---

_This guide should be followed by all contributors to maintain codebase consistency._
