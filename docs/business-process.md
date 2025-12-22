# Business Process & Rules

This document explicitly defines all business rules, workflows, and constraints in the Canteeners food court e-commerce platform.

---

## Table of Contents

1. [Order Lifecycle](#order-lifecycle)
2. [Shopping Cart Rules](#shopping-cart-rules)
3. [Payment Processing](#payment-processing)
4. [Refund & Complaint Process](#refund--complaint-process)
5. [Shop Management Rules](#shop-management-rules)
6. [Product Management Rules](#product-management-rules)
7. [Customer Violation System](#customer-violation-system)
8. [Commission & Billing](#commission--billing)
9. [Rating & Review System](#rating--review-system)
10. [Chat & Communication](#chat--communication)
11. [Notification Rules](#notification-rules)
12. [Table Ordering System](#table-ordering-system)

---

## Order Lifecycle

### Order Status State Machine

```
┌─────────────────────────┐
│ PENDING_CONFIRMATION    │ ← Customer creates order
└───────────┬─────────────┘
            │
            ├─→ Shop Confirms
            │
┌───────────▼─────────────┐
│ WAITING_PAYMENT         │ ← Customer must pay
└───────────┬─────────────┘
            │
            ├─→ Customer uploads payment proof
            │
┌───────────▼─────────────┐
│ WAITING_SHOP_           │
│ CONFIRMATION            │ ← Shop verifies payment
└───────────┬─────────────┘
            │
            ├─→ Shop accepts payment
            │
┌───────────▼─────────────┐
│ PROCESSING              │ ← Order being prepared
└───────────┬─────────────┘
            │
            ├─→ Order ready & delivered
            │
┌───────────▼─────────────┐
│ COMPLETED               │ ← Final state
└─────────────────────────┘

Alternative Paths:
├─→ REJECTED (from PENDING_CONFIRMATION)
├─→ PAYMENT_REJECTED (from WAITING_SHOP_CONFIRMATION)
└─→ CANCELLED (from any state)
```

### Business Rules

#### 1. Order Creation (PENDING_CONFIRMATION)

**Trigger**: Customer clicks "Checkout" on ShopCart

**Prerequisites**:

- Customer must be authenticated
- ShopCart must have at least 1 item
- Shop must be ACTIVE (not INACTIVE or SUSPENDED)
- All products in cart must be available (`is_available = true`)

**Process**:

1. System snapshots product prices (`price_at_add`)
2. System calculates total with options and commission (1000 per item quantity)
3. System creates Order with status PENDING_CONFIRMATION
4. System creates OrderItems from CartItems
5. System preserves selected ProductOptionValues
6. System copies note from ShopCart
7. System generates conversation_id for chat
8. ShopCart marked as checked out (`order_id` set)

**Business Constraints**:

- Cannot create order if shop is suspended
- Cannot create order with unavailable products
- Price snapshot prevents price manipulation
- One ShopCart → One Order (1:1 relationship)

#### 2. Shop Confirmation (PENDING_CONFIRMATION → WAITING_PAYMENT)

**Trigger**: Shop owner clicks "Accept Order"

**Process**:

1. Shop owner enters `estimation` (minutes to prepare)
2. System updates status to WAITING_PAYMENT
3. System records timestamp
4. System sends notification to customer

**Business Rules**:

- Shop can set estimation time (e.g., 30 minutes, 1 hour)
- Estimation is visible to customer
- If order takes longer than estimation, customer can file LATE_DELIVERY complaint

**Alternative: Rejection**

**Trigger**: Shop owner clicks "Reject Order"

**Process**:

1. Shop owner enters `rejected_reason`
2. System updates status to REJECTED
3. System sends notification to customer
4. Customer cannot proceed with this order

**Common Rejection Reasons**:

- Product out of stock
- Shop closing soon
- Unable to fulfill order

#### 3. Payment Upload (WAITING_PAYMENT → WAITING_SHOP_CONFIRMATION)

**Trigger**: Customer uploads payment proof

**Prerequisites**:

- Order must be in WAITING_PAYMENT status
- Customer must select payment method from shop's available methods
- Payment proof is image file (uploaded to Vercel Blob)

**Process**:

1. Customer selects payment method (QRIS, BANK_TRANSFER, or CASH)
2. For QRIS/BANK_TRANSFER: Customer uploads `payment_proof_url`
3. For CASH: No proof required
4. System updates status to WAITING_SHOP_CONFIRMATION
5. System sends notification to shop owner

**Business Rules**:

- Payment method must be from shop's configured payment options
- Additional fees may apply per payment method (`additional_price`)
- Cash payment still requires shop confirmation (to prevent fraud)

#### 4. Payment Verification (WAITING_SHOP_CONFIRMATION → PROCESSING)

**Trigger**: Shop owner reviews payment proof

**Process**:

1. Shop owner views `payment_proof_url`
2. Shop owner verifies payment received
3. System updates status to PROCESSING
4. System sets `processed_at` timestamp
5. System sends notification to customer

**Alternative: Payment Rejection**

**Trigger**: Shop owner rejects invalid payment

**Process**:

1. Shop owner clicks "Reject Payment"
2. System updates status to PAYMENT_REJECTED
3. Customer must upload new payment proof
4. Customer can also cancel order

**Common Rejection Reasons**:

- Invalid payment amount
- Payment to wrong account
- Fake payment proof
- Payment not received

#### 5. Order Processing (PROCESSING → COMPLETED)

**Trigger**: Shop prepares order

**Business Rules**:

- Shop should complete within `estimation` time
- `processed_at` timestamp starts the countdown
- Customer can track order status in real-time
- Shop can communicate via chat for updates

**Completion**:

1. Shop owner clicks "Complete Order"
2. System updates status to COMPLETED
3. System sends notification to customer
4. Customer can now leave review (ShopTestimony)

**Post-Order Delivery Types**:

- `DELIVERY_TO_TABLE`: Delivered to customer's table (requires `table_number`, `floor`)
- `TAKEAWAY`: Customer picks up from shop
- `COURIER_DELIVERY`: Third-party delivery (not implemented yet)

#### 6. Order Cancellation (→ CANCELLED)

**Trigger**: Customer or shop cancels order

**Business Rules**:

**Customer Cancellation**:

- Can cancel before `processed_at` (before shop starts preparing)
- Cannot cancel after PROCESSING (order already being made)
- Must provide `cancelled_reason`
- May incur violation if done repeatedly

**Shop Cancellation**:

- Can cancel any time (but should avoid after payment)
- Must provide `cancelled_reason`
- Should refund customer if payment received

**Cancellation on WAITING_PAYMENT**:

- If customer doesn't pay within reasonable time (e.g., 24 hours)
- Shop can cancel order
- Customer gets ORDER_CANCEL_WITHOUT_PAY violation

---

## Shopping Cart Rules

### Cart Lifecycle

```
ACTIVE → CHECKED_OUT → (can create new cart)
  ↓
ABANDONED (after 1 hour inactivity)
  ↓
EXPIRED (after 7 days)
  ↓
DELETED (manual or automatic cleanup)
```

### Business Rules

#### Cart Creation

**Trigger**: Customer adds first item to cart

**Process**:

1. System checks if customer has ACTIVE cart
2. If no cart exists, create new Cart with status ACTIVE
3. If cart exists, use existing cart
4. One customer can only have one ACTIVE cart at a time

**Constraint**: One Cart per Customer (1:1 relationship)

#### Multi-Shop Cart (ShopCart)

**Business Rule**: Cart items are grouped by shop

**Process**:

1. Customer adds product from Shop A → Creates ShopCart A
2. Customer adds product from Shop B → Creates ShopCart B
3. Both ShopCarts belong to same Cart
4. Each ShopCart can be checked out independently

**Why Separate by Shop?**:

- Different shops have different payment methods
- Different order notes per shop
- Different delivery options per shop
- Independent checkout process

#### Cart Item Pricing

**Formula**:

```
Item Subtotal = Quantity × (Base Price + Option Prices + 1000)

Where:
- Base Price = product.price (snapshot as price_at_add)
- Option Prices = Sum of additional_price from selected ProductOptionValues
- 1000 = Commission per item
```

**Example**:

```
Product: Nasi Goreng (10,000)
Options:
  - Spice Level: Pedas (+0)
  - Extras: Telur (+3,000)
Quantity: 2

Calculation:
= 2 × (10,000 + 0 + 3,000 + 1,000)
= 2 × 14,000
= 28,000
```

#### Cart Expiration

**Business Rules**:

1. **ABANDONED** (after 1 hour of inactivity):

   - Cart not accessed for 1 hour
   - Items preserved but cart marked abandoned
   - Can be reactivated if customer returns

2. **EXPIRED** (after 7 days):

   - Cart not accessed for 7 days
   - Items may be outdated (prices changed, products unavailable)
   - System may clean up automatically

3. **DELETED**:
   - Customer manually clears cart
   - Admin cleanup job
   - Permanent deletion

#### Cart Constraints

- Cannot add items from SUSPENDED or INACTIVE shops
- Cannot add unavailable products (`is_available = false`)
- Product options must match product's available options
- Required options must be selected
- Quantity must be ≥ 1

---

## Payment Processing

### Payment Methods

**Available Options**:

1. **QRIS** - QR Code payment
2. **BANK_TRANSFER** - Bank transfer
3. **CASH** - Cash on delivery/pickup

### Payment Configuration (per Shop)

**Business Rules**:

- Each shop configures their own payment methods
- Shop can enable/disable methods (`active`)
- Shop provides payment details:
  - QRIS: `qr_url` (image of QR code)
  - BANK_TRANSFER: `account_number`, `note` (bank name, account name)
  - CASH: No additional info needed
- Shop can set `additional_price` per method (e.g., +2000 for transfer fees)

**Example**:

```
Shop A supports:
- QRIS (QR image provided, +0)
- BANK_TRANSFER (BCA 1234567890, +2000)
- CASH (+0)

Shop B supports:
- CASH only
```

### Payment Verification Workflow

**For QRIS/BANK_TRANSFER**:

1. Customer uploads payment proof image
2. Shop owner manually verifies payment received
3. Shop owner accepts or rejects

**For CASH**:

1. No proof required at order creation
2. Shop owner confirms at delivery/pickup
3. Payment collected in person

**Why Manual Verification?**

- Prevents automated payment gateway fees
- Suitable for small shops with low transaction volume
- Shop owners can verify against their bank statements
- Reduces fraud (fake payment proofs rejected)

**Business Constraints**:

- Payment proof required for QRIS/BANK_TRANSFER
- Shop must verify within reasonable time (e.g., 24 hours)
- Customer can cancel if shop delays verification
- Invalid payment proofs get rejected (customer must re-upload)

---

## Refund & Complaint Process

### Refund Workflow

```
Customer files complaint → Shop/Admin reviews → Approved/Rejected
                                                      ↓ (if approved)
                                                Refund processed
                                                      ↓
                                            Disbursement proof uploaded
                                                      ↓
                                                  PROCESSED
```

### Complaint System (ShopComplaint)

**Purpose**: Allow customers to report issues with completed orders

**Trigger**: Customer has issue with completed order

**Process**:

1. Customer clicks "File Complaint" on order
2. Customer selects cause and provides description
3. Customer uploads `proof_url` (optional, recommended)
4. System creates ShopComplaint with status PENDING

**Complaint Statuses**:

- **PENDING**: Newly created, shop hasn't seen it
- **UNDER_REVIEW**: Shop is investigating (checking photos, chatting)
- **RESOLVED**: Issue resolved (with or without refund)
- **REJECTED**: Complaint invalid/not substantiated
- **ESCALATED**: Serious issue, escalated to admin/canteen management

**Business Rules**:

- One complaint per order (1:1 relationship)
- Complaint can be filed after order COMPLETED
- Shop owner can provide `feedback` on complaint
- Admin can intervene on ESCALATED complaints

### Refund System

**Refund Reasons** (RefundReason enum):

- **LATE_DELIVERY**: Order took longer than estimation
- **WRONG_ORDER**: Received different items
- **DAMAGED_FOOD**: Food damaged/spoiled
- **MISSING_ITEM**: Items missing from order
- **OTHER**: Other reasons (customer explains in description)

**Refund Process**:

#### Step 1: Customer Requests Refund

**Trigger**: Customer files complaint and requests refund

**Process**:

1. Customer files ShopComplaint
2. Customer clicks "Request Refund"
3. System creates Refund with status PENDING
4. Customer selects refund reason
5. Customer provides `complaint_proof_url` (photos, evidence)
6. Customer specifies refund `amount` (partial or full)

**Business Rules**:

- One refund per order (1:1 relationship)
- Refund linked to order via `order_id`
- Customer must provide reason and description
- Refund amount ≤ order total_price

#### Step 2: Shop/Admin Reviews

**Trigger**: Shop owner or admin reviews refund request

**Process**:

1. Shop owner views complaint proof
2. Shop owner can chat with customer for clarification
3. Shop owner decides: APPROVE or REJECT

**Approval**:

1. Shop owner clicks "Approve Refund"
2. System updates refund status to APPROVED
3. Shop owner must now process refund payment

**Rejection**:

1. Shop owner clicks "Reject Refund"
2. Shop owner enters `rejected_reason`
3. System updates refund status to REJECTED
4. Customer can escalate to admin if unsatisfied

**Business Rules**:

- Shop owner should review within reasonable time (e.g., 3 days)
- Evidence photos are important for decision
- Shop can approve partial refunds
- Rejection must have valid reason

#### Step 3: Refund Disbursement

**Trigger**: Refund approved, shop must pay customer back

**Disbursement Modes** (from Shop's `refund_disbursement_mode`):

- **CASH**: Refund in cash (customer can pick up or transfer)
- **TRANSFER**: Bank transfer to customer

**Process**:

1. Shop processes refund via their preferred method
2. Shop uploads `disbursement_proof_url` (transfer receipt or photo)
3. System updates refund status to PROCESSED
4. System sets `processed_at` timestamp
5. Customer notified of refund completion

**Business Rules**:

- Shop uses configured disbursement mode
- Shop must provide proof of disbursement
- Refund deducted from shop's next billing cycle
- System tracks refund for accounting

#### Step 4: Customer Confirmation

**Trigger**: Customer receives refund

**Process**:

1. Customer checks if refund received
2. Customer can confirm or dispute
3. If disputed, escalates to admin

**Business Constraints**:

- Refund can be cancelled by customer before PROCESSED
- Once PROCESSED, refund cannot be undone
- All refund transactions logged for audit

---

## Shop Management Rules

### Shop Status

**Status Values**:

- **ACTIVE**: Shop operating normally, can receive orders
- **INACTIVE**: Shop temporarily closed, cannot receive orders
- **SUSPENDED**: Shop violates policy, admin-suspended

### Status Transition Rules

#### ACTIVE ↔ INACTIVE

**Business Rules**:

- Shop owner can toggle between ACTIVE and INACTIVE anytime
- Use cases:
  - Daily close/open
  - Temporary break
  - Holiday closure
- Orders in progress still need to be fulfilled
- New orders cannot be created when INACTIVE

#### ACTIVE → SUSPENDED

**Trigger**: Admin suspends shop for violations

**Reasons** (stored in `suspended_reason`):

- Multiple customer complaints
- Fraud or dishonest practices
- Poor quality control
- Repeated refund issues
- Policy violations

**Process**:

1. Admin reviews shop performance/complaints
2. Admin clicks "Suspend Shop"
3. Admin enters `suspended_reason`
4. System updates status to SUSPENDED
5. Shop owner notified
6. All pending orders must be handled
7. No new orders accepted

**Business Rules**:

- Only admin can suspend shops
- Shop owner cannot unsuspend themselves
- Suspended shops still accessible in read-only mode
- Shop owner can appeal via admin

#### SUSPENDED → ACTIVE

**Trigger**: Admin lifts suspension

**Process**:

1. Shop owner appeals or resolves issues
2. Admin reviews case
3. Admin clicks "Reactivate Shop"
4. System updates status to ACTIVE
5. Shop can operate normally again

### Shop Order Modes

**Values** (ShopOrderMode enum):

- **READY_ONLY**: Only accepts ready-to-serve orders
- **PREORDER_ONLY**: Only accepts pre-orders (must order in advance)
- **BOTH**: Accepts both types

**Business Rules**:

- Shop configures their order mode
- Affects order creation validation
- PREORDER typically requires longer estimation time
- Display to customers so they know what to expect

**Use Cases**:

- **READY_ONLY**: Fast food, drinks
- **PREORDER_ONLY**: Catering, custom cakes
- **BOTH**: Restaurants with flexible service

---

## Product Management Rules

### Product Availability

**Business Rules**:

- Product has `is_available` boolean flag
- Shop owner can toggle availability
- Unavailable products:
  - Cannot be added to cart
  - Hidden or greyed out in shop listing
  - Not removed from database (just hidden)

**Use Cases**:

- Temporary out of stock
- Seasonal items
- Testing new products

### Product Options System

**Structure**:

```
Product
  └─ ProductOption (e.g., "Spice Level")
      ├─ is_required: boolean
      ├─ type: SINGLE or MULTIPLE
      └─ ProductOptionValue (e.g., "Mild", "Spicy", "Extra Spicy")
          └─ additional_price: number (e.g., +2000 for Extra Spicy)
```

**Business Rules**:

#### Required Options

- If `is_required = true`, customer MUST select at least one value
- Cannot add to cart without selecting required options
- Validation enforced on backend

#### Option Types

**SINGLE**:

- Customer can select only ONE value
- Example: "Size" → Small, Medium, Large
- UI: Radio buttons

**MULTIPLE**:

- Customer can select MULTIPLE values
- Example: "Toppings" → Cheese, Mushroom, Pepperoni
- UI: Checkboxes

#### Option Pricing

- Each ProductOptionValue can have `additional_price`
- Adds to product base price
- Example:

  ```
  Base: Burger (25,000)
  Options:
    - Size: Large (+5,000)
    - Toppings: Cheese (+3,000), Bacon (+5,000)

  Total: 25,000 + 5,000 + 3,000 + 5,000 + 1,000 (commission) = 39,000
  ```

**Business Constraints**:

- Option must belong to product
- Cannot delete option if used in active orders
- Option values preserved in OrderItem for historical accuracy

### Product Categories

**Business Rules**:

- Products can have multiple categories (many-to-many)
- Categories have unique slugs for URLs
- Categories have images for visual browsing
- Customers can filter products by category
- Removing category doesn't delete products

---

## Customer Violation System

### Purpose

Track and penalize customers who abuse the system

### Violation Types

**Current**: `ORDER_CANCEL_WITHOUT_PAY`

**Trigger**: Customer creates order, gets to WAITING_PAYMENT, then cancels

**Business Rule**:

- If customer repeatedly cancels orders without paying
- System records violation with timestamp
- Links to order_id for audit

### Suspension Logic

**Business Rules**:

- Customer can have multiple violations
- After N violations (configurable, e.g., 3), customer suspended
- Customer table has:
  - `suspend_until`: DateTime (temporary ban)
  - `suspend_reason`: String (explanation)

**Suspended Customer Effects**:

- Cannot create new orders
- Can still view products/shops
- Can chat with existing order shops
- Must wait until `suspend_until` expires

**Admin Controls**:

- Admin can manually suspend/unsuspend customers
- Admin can view violation history
- Admin can adjust suspension duration

---

## Commission & Billing

### Commission Model

**Business Rule**: **1000 IDR per order item quantity**

**Calculation**:

```
Commission = Σ (order_item.quantity × 1000)
```

**Example**:

```
Order contains:
- 2x Nasi Goreng
- 3x Es Teh
- 1x Bakso

Commission = (2 × 1000) + (3 × 1000) + (1 × 1000)
           = 2000 + 3000 + 1000
           = 6000 IDR
```

**Why Per Quantity?**:

- Fair pricing (more items = more commission)
- Simple calculation
- Independent of product price

### Billing Cycle (ShopBilling)

**Business Rules**:

- Billing generated monthly for each shop
- Tracks commission owed to platform

**Billing Structure**:

```typescript
{
  shop_id: string;
  start_date: DateTime; // Start of billing period
  end_date: DateTime; // End of billing period
  subtotal: number; // Total commission from orders
  refund: number; // Total refunds processed
  total: number; // subtotal - refund
  status: "PAID" | "UNPAID";
}
```

**Calculation**:

```
Subtotal = Sum of all order commissions in period
Refund = Sum of all refund amounts in period
Total = Subtotal - Refund
```

**Example**:

```
Shop A - January 2025:
- 50 orders completed
- Total commission: 150,000 IDR
- Refunds processed: 20,000 IDR
- Amount owed: 130,000 IDR
```

**Payment Process**:

1. Platform generates billing at end of month
2. Shop owner views billing in dashboard
3. Shop owner pays platform
4. Admin marks billing as PAID
5. Unpaid billings tracked for collections

**Business Constraints**:

- Refunds deducted from shop's billing
- Shop must pay billing to continue operations
- Overdue billings may result in shop suspension

---

## Rating & Review System

### Shop Testimony

**Business Rules**:

- Customer can only review COMPLETED orders
- One review per order (1:1 relationship)
- Review contains:
  - `rating`: Integer (1-5 stars)
  - `message`: Text feedback

**Rating Calculation**:

```typescript
shop.average_rating = AVG(all_shop_testimonies.rating);
shop.total_ratings = COUNT(all_shop_testimonies);
```

**Process**:

1. Order reaches COMPLETED status
2. Customer sees "Leave Review" button
3. Customer enters rating (1-5 stars) and message
4. System creates ShopTestimony
5. System recalculates shop.average_rating
6. System increments shop.total_ratings

**Business Constraints**:

- Cannot review before order completed
- Cannot edit review after submission
- Cannot delete review (maintains integrity)
- Review visible to all users
- Shop owner can view but not delete reviews

### Product Rating

**Similar to Shop Rating**:

```typescript
product.average_rating = AVG(related_shop_testimonies.rating);
product.total_ratings = COUNT(related_shop_testimonies);
```

**Business Rule**: Product rating calculated from orders containing that product

---

## Chat & Communication

### Chat Creation

**Business Rules**:

- Chat created when order created (via `conversation_id`)
- One chat per customer-shop pair
- Chat ID format: `{customer_id}_{shop_id}`

### Chat Features

**Implemented in Firebase Firestore**:

- Real-time messaging
- Typing indicators
- Read receipts
- Unread counts
- Last seen status

**Business Rules**:

- Both customer and shop owner can send messages
- Message types: TEXT, ORDER, ATTACHMENT
- Chat persists after order completion
- Can be used for support/inquiries

### Quick Chat Templates

**Purpose**: Predefined messages for faster response

**Business Rules**:

- Stored in PostgreSQL (`QuickChat` model)
- User can create custom templates
- One-click send in chat interface
- Useful for common responses:
  - "Order ready for pickup"
  - "Estimated 15 minutes"
  - "Thank you for your order"

---

## Notification Rules

### FCM Token Management

**Business Rules**:

- User can have multiple FCM tokens (multi-device)
- Tokens platform-specific: WEB, ANDROID, IOS
- Tokens stored with metadata:
  - `platform`: FcmPlatform
  - ` browser`: String (e.g., "Chrome", "Firefox")
  - `is_active`: Boolean
  - `last_used_at`: DateTime

**Lifecycle**:

1. User logs in on device
2. Client requests notification permission
3. Client gets FCM token from Firebase
4. Client sends token to backend
5. Backend stores UserFcmToken
6. Backend can now send notifications to that device

**Token Deactivation**:

- User logs out → token marked `is_active = false`
- Token expired → Firebase returns error
- User explicitly disables notifications

### Notification Types

**Order Notifications**:

- Order status changed
- Payment accepted/rejected
- Order completed
- Refund processed

**Chat Notifications**:

- New message received
- User typing

**Shop Notifications** (to owner):

- New order received
- Payment proof uploaded
- Customer sent message

**Business Rules**:

- Send to all active tokens for user
- Include deep link to relevant page
- Store notification payload for history
- User can disable specific notification types (future)

---

## Table Ordering System

### QR Code System

**Purpose**: Enable table-based ordering in canteen

**Structure**:

```
Canteen
  └─ CanteenMap (floor plan with tables)
      └─ TableQRCode (unique QR per table)
          - table_number: int
          - floor: int
          - image_url: string (QR code image)
```

**Business Rules**:

- Each table has unique QR code
- QR code contains: `canteen_id`, `floor`, `table_number`
- Customer scans QR to select table
- Table info saved in customer profile (`last_visit_at`)

### Table Selection Flow

**Process**:

1. Customer enters canteen (physical location)
2. Customer scans QR code on table
3. System decodes: canteen, floor, table number
4. System saves table selection to customer profile
5. When customer creates order, table info included
6. Shop delivers order to that table

**Business Rules**:

- Table selection optional (can choose TAKEAWAY instead)
- Table selection persists until customer chooses different table
- Order must specify `post_order_type`:
  - `DELIVERY_TO_TABLE`: Uses saved table number
  - `TAKEAWAY`: Customer picks up
  - `COURIER_DELIVERY`: Not implemented

**Constraint**:

- Table QR codes are unique per canteen
- Cannot use table from different canteen
- `table_number` + `canteen_id` + `floor` must be unique

---

## Summary of Key Business Constraints

### Critical Rules to Remember

1. **Order Cannot Skip States**: Must follow state machine flow
2. **Price Snapshot**: Prices frozen at cart addition to prevent manipulation
3. **Commission is Fixed**: Always 1000 IDR per item quantity
4. **One Active Cart**: Customer can only have one active cart at a time
5. **Multi-Shop Checkout**: Each shop has separate checkout within same cart
6. **Manual Payment Verification**: No automated payment gateway
7. **Review Requires Completion**: Cannot review until order completed
8. **Refunds Deducted from Billing**: Shop pays platform minus refunds
9. **Shop Suspension Blocks Orders**: Suspended shops cannot receive new orders
10. **Customer Violations Tracked**: Repeated abuse leads to suspension

### Validation Points

**Order Creation**:

- ✅ Shop is ACTIVE
- ✅ Products are available
- ✅ Required options selected
- ✅ Customer not suspended

**Payment Processing**:

- ✅ Payment method configured by shop
- ✅ Proof uploaded (for QRIS/BANK_TRANSFER)
- ✅ Amount matches order total

**Refund Approval**:

- ✅ Evidence provided
- ✅ Amount ≤ order total
- ✅ Order completed
- ✅ Valid reason

**Cart Addition**:

- ✅ Product available
- ✅ Shop not suspended
- ✅ Options valid for product
- ✅ Required options selected

---

_This document should be the authoritative source for all business logic decisions. Any code changes that affect business rules must update this document._

---

_Last Updated: 2025-12-22_
