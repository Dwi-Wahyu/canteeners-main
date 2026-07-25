# Graph Report - /home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main  (2026-07-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1624 nodes · 5402 edges · 164 communities (102 shown, 62 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.76)
- Token cost: 5,551 input · 1,864 output

## Graph Freshness
- Built from commit: `deb38844`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Root Layout and Providers
- Chat and File Upload
- Dialog and Alert Components
- Product and Chat Actions
- Page Loading States
- Form and Input Components
- Database Schema Tables
- Notification System Logic
- Form Selection Controls
- Empty States and Reviews
- Shop Refund Management
- Order and Cart UI
- Cart and Payment Actions
- UI Layout Components
- Owner Navigation Menu
- Order Tracking and FAQ
- Profile and Help Pages
- Partner Guide Pages
- Owner Settings and Items
- Carousel Component
- Database Seeding Scripts
- Chat List and Helpers
- User and Voucher Actions
- Calendar and Popover UI
- Complaint Forms and Actions
- Shop and History Clients
- Authentication and Registration
- Order Status Mappings
- Multi-Select Command Component
- Shop Payment and Tabs
- Cart and Shop Status
- Customer Violations and Profile
- Order Management Actions
- Order Queries and Tracking
- Canteen Page and Banners
- Canteen Details and Filters
- Partner Landing Page
- Product and Category Queries
- Chat Notification Toasts
- Firebase Admin Messaging
- Product Validation Schemas
- Refund Validation Schemas
- Drawer and Cart UI
- Shop Performance Dashboard
- Product Detail Queries
- Billing and Invoice Queries
- Order History Pagination
- Refund Processing Actions
- Chart and Data Visualization
- Firebase Notification Listeners
- Guest Profile Management
- Landing Page Content
- Landing Page Animations
- Notification Store and Dialogs
- Shop Payment Methods
- Notification and Firestore Schemas
- Core Business Tables
- Customer Profile UI
- Breadcrumb Navigation
- Shop Complaint Management
- Owner Layout and Chat
- Shop Violation Tracking
- Table Selection and History
- Cart State Management
- Brand Assets and Concepts
- Shop Specialization Management
- Billing Status Components
- Discount Database Schema
- Shop Dashboard Orders
- Order Review Icons
- Shop Specialization Forms
- Queue Management System
- Project Documentation and Rules
- Deployment and Branding
- User Identity Tables
- Messaging Database Schema
- User Reporting System
- Shop Complaint UI
- File Utility Helpers
- Cart and Order Tables
- Event Management Tables
- Custom Icon Components
- Auth Session Configuration
- Payment Proof Tables
- Order Item Tables
- FCM Token Tables
- Cart Item Relations
- Cart Status Mapping
- Billing Search Parameters
- Referral Status UI
- ESLint Configuration
- Next.js Configuration
- Next.js Example Config
- PostCSS Configuration
- Canteen Table Migration
- Product Category Migration
- Shop Cart Migration
- Order Table Migration
- Canteen Map Migration
- App Testimonies Schema
- Refunds Schema
- Refund Items Schema
- User Reports Schema
- Customer Data Schema
- Order Management Schema
- Shop Management Schema
- Shop Categories Schema
- Banner Management Schema
- Shop Billing Schema
- Customer Records Schema
- Customer Profiles Schema
- Customer Discounts Schema
- Refund History Schema
- Refund Audit Schema
- Refund Tracking Schema
- Order Records Schema
- User Testimonials Schema
- Global Settings Schema
- Refund Processing Schema
- Order Payment History
- Shop Violation Schema
- Complaint Status Mapping
- Billing Status Mapping
- Transaction Client Utility
- Post-Implementation Protocol
- Discount System Context
- Canteeners ERD Diagram
- Product Management Context
- Application Logo Asset
- Apple Touch Icon
- Marketing Banner Image
- General Icon Asset
- Small App Icon
- Large App Icon
- Placeholder Image Asset
- Transparent Logo Asset
- Food Visual Asset
- Manifest Icon Small
- Manifest Icon Large
- API Route Handlers
- Apple Platform Icon
- App Icon Asset

## God Nodes (most connected - your core abstractions)
1. `cn()` - 219 edges
2. `Button()` - 104 edges
3. `getImageUrl()` - 101 edges
4. `successResponse()` - 76 edges
5. `errorResponse()` - 76 edges
6. `formatRupiah()` - 66 edges
7. `Card()` - 61 edges
8. `CardContent()` - 57 edges
9. `prisma` - 49 edges
10. `Input()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `App Logo SVG` --references--> `Canteeners 2025`  [INFERRED]
  public/app-logo.svg → README.md
- `Logo PNG` --references--> `Canteeners 2025`  [INFERRED]
  public/logo.png → README.md
- `seedCanteens()` --calls--> `generateCategorySlug()`  [EXTRACTED]
  prisma/seed/seed-canteens.ts → src/helper/generate-category-slug.ts
- `seedCategories()` --calls--> `generateCategorySlug()`  [EXTRACTED]
  prisma/seed/seed-categories.ts → src/helper/generate-category-slug.ts
- `ProfilePage()` --calls--> `getImageUrl()`  [EXTRACTED]
  src/app/dashboard-kedai/pengaturan/profile/page.tsx → src/helper/get-image-url.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Documentation Suite** — docs_context, docs_project_structure, docs_naming_conventions, docs_business_process [EXTRACTED 1.00]
- **Dispute and Refund Flow** — docs_complaint_system_context, docs_refund_flow_context, refund_schema, docs_document_structure_notifications_complaint_notification_schema, docs_document_structure_notifications_refund_notification_schema [INFERRED 0.85]
- **Canteeners Branding and UI Assets** — src_app_icon0, src_app_apple_icon, src_app_icon1, public_banners_01, public_banners_03 [EXTRACTED 0.90]
- **Canteeners AR Ordering Concept** — public_visual_hero_slide_1, public_visual_hero_slide_2, public_visual_kantin_kudapan [INFERRED 0.85]

## Communities (164 total, 62 thin omitted)

### Community 0 - "Root Layout and Providers"
Cohesion: 0.06
Nodes (61): inter, metadata, plusJakartaSans, poppins, Providers(), queryClient, EventParticipationPopup(), colors (+53 more)

### Community 1 - "Chat and File Upload"
Cohesion: 0.06
Nodes (45): QuickChatPage(), createStore(), Direction, DirectionContext, FileState, FileUploadClear(), FileUploadClearProps, FileUploadContext (+37 more)

### Community 2 - "Dialog and Alert Components"
Cohesion: 0.19
Nodes (15): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+7 more)

### Community 3 - "Product and Chat Actions"
Cohesion: 0.08
Nodes (42): CreateProductForm(), EditProductForm(), createQuickChat(), deleteQuickChat(), createProduct(), createProductOption(), createProductOptionValue(), deleteProduct() (+34 more)

### Community 4 - "Page Loading States"
Cohesion: 0.08
Nodes (4): TopbarWithBackButton(), Skeleton(), ProductFilterDialog(), DeleteAllNotificationsButton()

### Community 5 - "Form and Input Components"
Cohesion: 0.18
Nodes (21): ProductWithCategories, FileUploadImage(), FormControl(), FormDescription(), FormField(), FormFieldContext, FormFieldContextValue, FormItem() (+13 more)

### Community 6 - "Database Schema Tables"
Cohesion: 0.13
Nodes (33): "admins", "app_testimonies", "canteen_maps", "canteens", "cart_items", "_CartItemToProductOptionValue", "carts", "categories" (+25 more)

### Community 7 - "Notification System Logic"
Cohesion: 0.12
Nodes (24): notificationIntentColorMap, notificationIntentIconMapping, notificationIntentVariantMap, notificationTypeIconMapping, ComplaintNotification, ComplaintNotificationSubType, NotificationBase, NotificationButton (+16 more)

### Community 8 - "Form Selection Controls"
Cohesion: 0.17
Nodes (19): Checkbox(), Select(), SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), productOptionTypeMapping, refundDisbursementModeMapping (+11 more)

### Community 9 - "Empty States and Reviews"
Cohesion: 0.15
Nodes (18): ShopDashboardTestimonyClient(), CustomerReviewsPage(), ShopTestimonyDisplayPage(), ShoppingCartQuestionIcon(), Empty(), EmptyContent(), EmptyDescription(), EmptyHeader() (+10 more)

### Community 10 - "Shop Refund Management"
Cohesion: 0.11
Nodes (16): ShopOrderDetailPage(), ShopEscalateRefundPage(), ShopRefundPage(), ShopRefundListPage(), CustomerEscalateRefundPage(), CustomerRefundPage(), { auth, handlers, signIn, signOut }, authConfig (+8 more)

### Community 11 - "Order and Cart UI"
Cohesion: 0.20
Nodes (16): ProductClientPage(), UploadPaymentProof(), CanteenClient(), CartItemCard(), CustomerOrderChatBubble(), CustomerOrderDetailClient(), OrderDetailClient(), ShopOrderDetailClient() (+8 more)

### Community 12 - "Cart and Payment Actions"
Cohesion: 0.14
Nodes (22): OrderComplaintPage(), OrderDetailPage(), getPaymentTimeoutAction(), PaymentCountdown(), addCartItemNote(), addToCart(), changeCartItemDetails(), deleteCartItem() (+14 more)

### Community 13 - "UI Layout Components"
Cohesion: 0.10
Nodes (26): PanduanMitraContent(), PanduanPelangganContent(), NavButton(), AlertDialogOverlay(), CardAction(), DialogOverlay(), FieldContent(), FieldDescription() (+18 more)

### Community 14 - "Owner Navigation Menu"
Cohesion: 0.11
Nodes (18): OwnerTopbar(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+10 more)

### Community 15 - "Order Tracking and FAQ"
Cohesion: 0.22
Nodes (16): getFaqs(), FAQ(), PaymentFormInput, PaymentFormSchema, ShoppingCartExclamationIcon(), Accordion(), AccordionContent(), AccordionItem() (+8 more)

### Community 16 - "Profile and Help Pages"
Cohesion: 0.21
Nodes (8): ProfilePage(), Card(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), ProductOptionWithValue, ToggleProductAvailableButton()

### Community 17 - "Partner Guide Pages"
Cohesion: 0.15
Nodes (5): Badge(), badgeVariants, CardContent(), Separator(), ToggleShopStatus()

### Community 18 - "Owner Settings and Items"
Cohesion: 0.17
Nodes (16): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+8 more)

### Community 19 - "Carousel Component"
Cohesion: 0.14
Nodes (20): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+12 more)

### Community 20 - "Database Seeding Scripts"
Cohesion: 0.21
Nodes (10): main(), seedCanteens(), seedCategories(), seedOwners(), seedShops(), seedSuperAdmin(), seedUsers(), generateCategorySlug() (+2 more)

### Community 21 - "Chat List and Helpers"
Cohesion: 0.19
Nodes (13): CustomerChatListPage(), OwnerChatListPage(), OrderHistoryFilters(), useChatListPaginated(), getMyUnreadCount(), getOpponentId(), getOpponentInfo(), isOpponentTyping() (+5 more)

### Community 22 - "User and Voucher Actions"
Cohesion: 0.15
Nodes (15): NewVoucherPopup(), UnluckyVoucherPopup(), CanteenAutoTableSync(), ChooseTableClient(), activateReferralCode(), changeGuestName(), changePassword(), chooseCustomerTable() (+7 more)

### Community 23 - "Calendar and Popover UI"
Cohesion: 0.14
Nodes (16): Calendar(), CalendarDayButton(), Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger() (+8 more)

### Community 24 - "Complaint Forms and Actions"
Cohesion: 0.19
Nodes (14): Textarea(), createShopComplaint(), updateShopComplaint(), ShopComplaintInput, ShopComplaintSchema, UpdateComplaintInput, UpdateComplaintSchema, CreateComplaintForm() (+6 more)

### Community 25 - "Shop and History Clients"
Cohesion: 0.13
Nodes (16): Client(), IndexPageProps, ShopDetail(), OrderHistoryPage(), getExistingPendingShopCart(), CartShopCard(), CartShopCardProps, ShopCartClient() (+8 more)

### Community 26 - "Authentication and Registration"
Cohesion: 0.16
Nodes (10): loginWithGoogle(), ContinueWithGoogle(), registerCustomer(), ChangePasswordSchema, ChangePasswordSchemaType, CreateGuestSessionSchema, LoginInput, LoginSchema (+2 more)

### Community 27 - "Order Status Mappings"
Cohesion: 0.22
Nodes (9): CashIcon(), orderStatusMapping, getPaymentMethodIcon(), paymentMethodMapping, postOrderTypeMapping, ShopOrderChatBubble(), getOrderSummaryForChatBubble(), ShopOrderDetailDialog() (+1 more)

### Community 28 - "Multi-Select Command Component"
Cohesion: 0.13
Nodes (13): CommandEmpty, GroupOption, MultipleSelector, MultipleSelectorProps, MultipleSelectorRef, Command(), CommandDialog(), CommandGroup() (+5 more)

### Community 29 - "Shop Payment and Tabs"
Cohesion: 0.19
Nodes (11): tabs, RunIcon(), Tabs(), TabsContent(), TabsList(), TabsTrigger(), SelectedTable, ImageLightbox() (+3 more)

### Community 30 - "Cart and Shop Status"
Cohesion: 0.13
Nodes (15): CartPage(), CartItemDetail(), shopStatusDetail, shopStatusMapping, ActiveTab, FlyingImage, ProductWithShopInfo, getCart() (+7 more)

### Community 31 - "Customer Violations and Profile"
Cohesion: 0.20
Nodes (11): GuestShopCartPage(), ViolationDetailPage(), ViolationsPage(), customerViolationDescriptionMapping, customerViolationIconMapping, customerViolationTitleMapping, getShopCart(), getCustomerProfile() (+3 more)

### Community 32 - "Order Management Actions"
Cohesion: 0.25
Nodes (16): cancelOrder(), changeOrderEstimation(), completeOrder(), confirmOrder(), confirmPayment(), rejectOrder(), rejectPayment(), revalidateOrderPaths() (+8 more)

### Community 33 - "Order Queries and Tracking"
Cohesion: 0.19
Nodes (11): ShopOrderTrackingPage(), ShopOrderTrackingClient(), OrderPaymentPage(), getOrderAndPaymentMethod(), getOrderDetail(), getOrderTrackingData(), GetCustomerOrderDetail, GetOrderDetail (+3 more)

### Community 34 - "Canteen Page and Banners"
Cohesion: 0.17
Nodes (7): CanteenPage(), BottomNav(), NAV_ITEMS, getBanners(), CanteenBanner(), Banner, getCanteens()

### Community 35 - "Canteen Details and Filters"
Cohesion: 0.18
Nodes (11): CanteenDetailPage(), getCanteenBySlug(), GetCanteenBySlug, GetCanteenIncludeMaps, CanteenCategoryFilter(), CanteenCategoryFilterClient(), Category, categoryIconMap (+3 more)

### Community 36 - "Partner Landing Page"
Cohesion: 0.15
Nodes (10): benefits, MitraRegistrationPage(), AnimateOnScroll(), AnimateOnScrollProps, animationStyles, AnimationType, canteens, heroSlides (+2 more)

### Community 37 - "Product and Category Queries"
Cohesion: 0.19
Nodes (9): IndexPageProps, ProductPage(), UnauthorizedPage(), _getCategories(), GetCategories, CategoryScroller(), getShopProducts(), ProductSearchParams (+1 more)

### Community 38 - "Chat Notification Toasts"
Cohesion: 0.23
Nodes (9): ToastContainer(), Chat, useWatchChatNotification(), ChatNotificationToast(), ChatNotificationToastProps, NotificationWatcher(), ToastNotification, ToastStore (+1 more)

### Community 39 - "Firebase Admin Messaging"
Cohesion: 0.19
Nodes (8): adminAuth, adminDb, adminMessaging, getAdminApp(), getAdminAuth(), getAdminDb(), getAdminMessaging(), RefundFirestoreData

### Community 40 - "Product Validation Schemas"
Cohesion: 0.13
Nodes (14): BaseProductOptionSchema, BaseProductOptionValueSchema, BaseProductSchema, CreateProductInput, CreateProductOptionInput, CreateProductOptionSchema, CreateProductOptionValueInput, CreateProductOptionValueSchema (+6 more)

### Community 41 - "Refund Validation Schemas"
Cohesion: 0.16
Nodes (12): CancelRefundInput, CancelRefundSchema, CompleteRefundInput, CompleteRefundSchema, EscalateRefundInput, EscalateRefundSchema, ITEM_LEVEL_REASONS, ProcessRefundInput (+4 more)

### Community 42 - "Drawer and Cart UI"
Cohesion: 0.26
Nodes (10): Drawer(), DrawerClose(), DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle() (+2 more)

### Community 43 - "Shop Performance Dashboard"
Cohesion: 0.32
Nodes (7): PerformaKedaiPage(), getBestSellingProducts(), ShopBestSellingProduct(), getShopDashboardStats(), getShopRanking(), DashboardStats(), DashboardStatsProps

### Community 44 - "Product Detail Queries"
Cohesion: 0.27
Nodes (6): EditProductPage(), ProductDetailPage(), GuestProductDetailPage(), NotFoundResource(), getProductById(), getProductIncludeCategory()

### Community 45 - "Billing and Invoice Queries"
Cohesion: 0.26
Nodes (8): BillingDetailPage(), ShopBillingListPage(), getBillingById(), getShopBillings(), GetShopBillings, ShopBilling, BillingDetail(), BillingList()

### Community 46 - "Order History Pagination"
Cohesion: 0.25
Nodes (8): OrderHistoryPagination(), formatDate(), OrderHistoryPage(), BadgeVariant, checkIfValueInOptions(), CustomBadge(), CustomBadgeProps, getShopOrderHistory()

### Community 47 - "Refund Processing Actions"
Cohesion: 0.31
Nodes (8): cancelRefund(), completeRefund(), createRefundRequest(), escalateRefund(), processRefund(), revalidateRefundPaths(), updateRefundStatus(), CreateRefundDialog()

### Community 48 - "Chart and Data Visualization"
Cohesion: 0.25
Nodes (9): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES (+1 more)

### Community 49 - "Firebase Notification Listeners"
Cohesion: 0.33
Nodes (6): NotificationListener(), useComplaintNotification(), useOrderNotification(), useRefundNotification(), firebaseConfig, globalForFirebase

### Community 50 - "Guest Profile Management"
Cohesion: 0.31
Nodes (9): useGuestCartId(), useGuestCustomerId(), useGuestName(), useGuestUserId(), useInitializeGuestProfile(), useSetCustomerData(), GuestProfileStore, GuestProfileStoreActions (+1 more)

### Community 51 - "Landing Page Content"
Cohesion: 0.27
Nodes (4): LandingPage(), LandingFooter(), getAppTestimonies(), AppTestimonyList()

### Community 53 - "Notification Store and Dialogs"
Cohesion: 0.24
Nodes (7): NotificationDialog(), useWatchNotification(), AppNotification, Notification, NotificationDialogType, NotificationStore, useNotificationDialogStore

### Community 54 - "Shop Payment Methods"
Cohesion: 0.44
Nodes (5): toggleShopPaymentActive(), getShopPaymentByMethod(), BankTransferPayment(), CashShopPayment(), QrisShopPayment()

### Community 55 - "Notification and Firestore Schemas"
Cohesion: 0.22
Nodes (9): Complaint System Context, Complaint Notification Schema, Order Notification Schema, Refund Notification Schema, Firestore Order Schema, Order Tracking Context, Refund Flow Context, Notification Field Structure (+1 more)

### Community 56 - "Core Business Tables"
Cohesion: 0.33
Nodes (8): "customer_violations", "orders", "payments", "products", "quick_chats", "shop_billings", "shops", "user_reports"

### Community 57 - "Customer Profile UI"
Cohesion: 0.50
Nodes (5): CustomerProfilePage(), Avatar(), AvatarFallback(), AvatarImage(), getCustomerReferralStatus()

### Community 58 - "Breadcrumb Navigation"
Cohesion: 0.36
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 59 - "Shop Complaint Management"
Cohesion: 0.29
Nodes (6): ComplaintsPage(), getShopComplaints(), Complaint, ComplaintsListClient(), ComplaintsListClientProps, complaintStatusMap

### Community 61 - "Shop Violation Tracking"
Cohesion: 0.43
Nodes (5): ShopPelanggaranPage(), shopViolationDescriptionMapping, shopViolationIconMapping, shopViolationTitleMapping, getMyShopViolations()

### Community 62 - "Table Selection and History"
Cohesion: 0.39
Nodes (4): ChooseTablePage(), HistoryBackButton(), getCanteenIncludeMaps(), getCustomerSelectedTable()

### Community 63 - "Cart State Management"
Cohesion: 0.36
Nodes (6): useCartId(), useInitializeCart(), CartStore, CartStoreActions, useCartStore, getCustomerById()

### Community 64 - "Brand Assets and Concepts"
Cohesion: 0.29
Nodes (7): Canteeners Platform, Canteeners Banner: Lapar Setelah Lab?, Canteeners Banner: Pesan Makanan Kampus Tanpa Antri, Canteeners AR Interface Concept 1, Canteeners AR Interface Concept 2, Kantin Kudapan Physical Location, Canteeners Logo SVG

### Community 65 - "Shop Specialization Management"
Cohesion: 0.52
Nodes (5): EditShopPage(), ShopSpecializationPage(), getShopById(), getAllCategories(), getShopSpecializations()

### Community 66 - "Billing Status Components"
Cohesion: 0.38
Nodes (5): GetBillingDetail, BillingDetailProps, BillingStatusBadge(), BillingStatusBadgeProps, statusConfig

### Community 67 - "Discount Database Schema"
Cohesion: 0.60
Nodes (5): "customer_discounts", "customers", "discounts", "order_discounts", "orders"

### Community 68 - "Shop Dashboard Orders"
Cohesion: 0.53
Nodes (4): DashboardKedai(), getRecentOrdersByShop(), RecentOrdersListProps, getShopStatus()

### Community 69 - "Order Review Icons"
Cohesion: 0.47
Nodes (3): StarFilledIcon(), StarIcon(), OrderReviewSection()

### Community 70 - "Shop Specialization Forms"
Cohesion: 0.47
Nodes (4): Option, updateShopSpecializations(), ShopSpecializationForm(), ShopSpecializationFormProps

### Community 72 - "Project Documentation and Rules"
Cohesion: 0.50
Nodes (5): Business Process & Rules, Project Context, Firestore Chat Schema, Naming Conventions, Project Structure

### Community 73 - "Deployment and Branding"
Cohesion: 0.40
Nodes (5): Deploy Production Workflow, Deploy Staging Workflow, App Logo SVG, Logo PNG, Canteeners 2025

### Community 74 - "User Identity Tables"
Cohesion: 0.70
Nodes (4): "admins", "customers", "owners", "users"

### Community 75 - "Messaging Database Schema"
Cohesion: 0.40
Nodes (4): "conversation_participants", "message_media", "messages", "orders"

### Community 76 - "User Reporting System"
Cohesion: 0.60
Nodes (3): REPORT_REASONS, ReportUserInput, ReportUserSchema

### Community 77 - "Shop Complaint UI"
Cohesion: 0.50
Nodes (4): GetShopOrderDetail, complaintStatusMap, ShopComplaintSection(), ShopComplaintSectionProps

### Community 78 - "File Utility Helpers"
Cohesion: 0.70
Nodes (4): generateFileName(), generateRandomSuffix(), getFileExtension(), truncateFileName()

### Community 79 - "Cart and Order Tables"
Cohesion: 0.50
Nodes (3): "cart_items", "orders", "shop_carts"

### Community 80 - "Event Management Tables"
Cohesion: 0.83
Nodes (3): "event_slots", "event_usages", "events"

### Community 81 - "Custom Icon Components"
Cohesion: 0.50
Nodes (3): CustomIconComponent, CustomIconProps, IconType

### Community 82 - "Auth Session Configuration"
Cohesion: 0.50
Nodes (3): next-auth, Session, User

## Knowledge Gaps
- **248 isolated node(s):** `eslintConfig`, `nextConfig`, `nextConfig`, `config`, `"faqs"` (+243 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Layout Components` to `Root Layout and Providers`, `Chat and File Upload`, `Dialog and Alert Components`, `Page Loading States`, `Form and Input Components`, `Notification System Logic`, `Form Selection Controls`, `Empty States and Reviews`, `Order and Cart UI`, `Owner Navigation Menu`, `Order Tracking and FAQ`, `Profile and Help Pages`, `Partner Guide Pages`, `Owner Settings and Items`, `Carousel Component`, `Calendar and Popover UI`, `Complaint Forms and Actions`, `Shop and History Clients`, `Order Status Mappings`, `Multi-Select Command Component`, `Shop Payment and Tabs`, `Cart and Shop Status`, `Canteen Page and Banners`, `Canteen Details and Filters`, `Chat Notification Toasts`, `Drawer and Cart UI`, `Billing and Invoice Queries`, `Chart and Data Visualization`, `Customer Profile UI`, `Breadcrumb Navigation`, `Table Selection and History`, `Billing Status Components`, `Shop Dashboard Orders`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `Button()` connect `Dialog and Alert Components` to `Root Layout and Providers`, `Chat and File Upload`, `Form and Input Components`, `Notification System Logic`, `Form Selection Controls`, `Order and Cart UI`, `UI Layout Components`, `Owner Navigation Menu`, `Order Tracking and FAQ`, `Profile and Help Pages`, `Partner Guide Pages`, `Carousel Component`, `Calendar and Popover UI`, `Complaint Forms and Actions`, `Authentication and Registration`, `Order Status Mappings`, `Shop Payment and Tabs`, `Customer Violations and Profile`, `Refund Validation Schemas`, `Drawer and Cart UI`, `Order History Pagination`, `Notification Store and Dialogs`, `Shop Payment Methods`, `Customer Profile UI`, `Shop Violation Tracking`, `Table Selection and History`, `Order Review Icons`, `Shop Specialization Forms`, `User Reporting System`, `Referral Status UI`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `getImageUrl()` connect `Order and Cart UI` to `Root Layout and Providers`, `Product and Chat Actions`, `Form and Input Components`, `Form Selection Controls`, `Empty States and Reviews`, `Shop Refund Management`, `Cart and Payment Actions`, `UI Layout Components`, `Owner Navigation Menu`, `Order Tracking and FAQ`, `Profile and Help Pages`, `Carousel Component`, `Chat List and Helpers`, `User and Voucher Actions`, `Shop and History Clients`, `Order Status Mappings`, `Shop Payment and Tabs`, `Cart and Shop Status`, `Order Queries and Tracking`, `Canteen Page and Banners`, `Canteen Details and Filters`, `Partner Landing Page`, `Product and Category Queries`, `Chat Notification Toasts`, `Refund Validation Schemas`, `Drawer and Cart UI`, `Shop Performance Dashboard`, `Refund Processing Actions`, `Shop Payment Methods`, `Customer Profile UI`, `Shop Complaint Management`, `Shop Complaint UI`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `nextConfig` to the rest of the system?**
  _248 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Root Layout and Providers` be split into smaller, more focused modules?**
  _Cohesion score 0.05504950495049505 - nodes in this community are weakly interconnected._
- **Should `Chat and File Upload` be split into smaller, more focused modules?**
  _Cohesion score 0.061367621274108705 - nodes in this community are weakly interconnected._
- **Should `Product and Chat Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07712765957446809 - nodes in this community are weakly interconnected._