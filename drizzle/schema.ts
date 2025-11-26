import { int, mysqlTable, text, primaryKey, timestamp, varchar, boolean } from 'drizzle-orm/mysql-core';
import type { AdapterAccount } from '@auth/core/adapters';

export const user = mysqlTable('user', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date', fsp: 3 }),
  image: varchar('image', { length: 255 }),
  password: text('password'),
  phone: varchar('phone', { length: 255 }),
  address: varchar('address', { length: 255 }),
  role: varchar('role', { length: 255 }).default('user').notNull(),
});

export const account = mysqlTable(
  'account',
  {
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: int('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const session = mysqlTable('session', {
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationToken = mysqlTable(
  'verificationToken',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const product = mysqlTable('product', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }),
  description: text('description'),
  features: text('features'), // Stored as JSON string
  regularPrice: int('regularPrice'),
  salePrice: int('salePrice'),
  sku: varchar('sku', { length: 255 }),
  stock: int('stock'),
  availability: varchar('availability', { length: 255 }),
  technicalSpecifications: text('technicalSpecifications'), // Stored as JSON string
  hardwareSpecifications: text('hardwareSpecifications'), // Stored as JSON string
  options: text('options'), // Stored as JSON string
  price: int('price').notNull(), // Keeping original price field, assuming it's the final price
  category: varchar('category', { length: 255 }).notNull(),
  imageUrl: varchar('imageUrl', { length: 255 }),
  galleryImages: text('galleryImages'), // Stored as JSON string array of image URLs
  isActive: boolean('isActive').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const cartItem = mysqlTable('cartItem', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  productId: varchar('productId', { length: 255 })
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  quantity: int('quantity').notNull().default(1),
  price: int('price').notNull(), // Price at time of adding to cart
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const order = mysqlTable('order', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  orderNumber: varchar('orderNumber', { length: 255 }).notNull().unique(),
  subtotal: int('subtotal').notNull(), // Total before tax
  tax: int('tax').notNull(), // Tax amount (18% GST)
  total: int('total').notNull(), // Final total
  paidAmount: int('paidAmount').default(0).notNull(), // Amount paid so far (for partial payments)
  status: varchar('status', { length: 255 }).default('pending').notNull(), // pending, payment_received, accepted, rejected, shipped, delivered, cancelled
  paymentStatus: varchar('paymentStatus', { length: 255 }).default('pending').notNull(), // pending, partial_payment, completed, failed
  paymentMethod: varchar('paymentMethod', { length: 255 }), // razorpay, credit_card, etc.
  paymentId: varchar('paymentId', { length: 255 }), // Razorpay payment ID
  adminNotes: text('adminNotes'), // Notes from admin during order review
  rejectionReason: text('rejectionReason'), // Reason for order rejection
  // Shipping details
  shippingName: varchar('shippingName', { length: 255 }).notNull(),
  shippingEmail: varchar('shippingEmail', { length: 255 }).notNull(),
  shippingPhone: varchar('shippingPhone', { length: 255 }).notNull(),
  shippingAddress: text('shippingAddress').notNull(),
  shippingCity: varchar('shippingCity', { length: 255 }).notNull(),
  shippingState: varchar('shippingState', { length: 255 }).notNull(),
  shippingPincode: varchar('shippingPincode', { length: 255 }).notNull(),
  // Tracking details
  trackingNumber: varchar('trackingNumber', { length: 255 }), // Courier tracking number
  shippingCarrier: varchar('shippingCarrier', { length: 255 }), // Courier company name
  trackingUrl: varchar('trackingUrl', { length: 500 }), // Tracking URL for customer
  shippedAt: timestamp('shippedAt', { mode: 'date' }), // When order was shipped
  deliveredAt: timestamp('deliveredAt', { mode: 'date' }), // When order was delivered
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const banner = mysqlTable('banner', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(), // Admin reference name
  placement: varchar('placement', { length: 50 }).notNull(), // hero, top_promo, section, offer_strip, bottom
  imageUrl: varchar('imageUrl', { length: 500 }).notNull(), // Banner image URL
  imageUrlMobile: varchar('imageUrlMobile', { length: 500 }), // Optional mobile-optimized image
  linkUrl: varchar('linkUrl', { length: 500 }), // Where banner links to
  altText: varchar('altText', { length: 255 }), // Image alt text for SEO
  heading: varchar('heading', { length: 255 }), // Text overlay heading
  subheading: text('subheading'), // Text overlay subheading
  ctaText: varchar('ctaText', { length: 100 }), // Call-to-action button text
  ctaLink: varchar('ctaLink', { length: 500 }), // CTA button link
  textPosition: varchar('textPosition', { length: 20 }).default('left'), // left, center, right
  displayOrder: int('displayOrder').default(0).notNull(), // Sort order
  isActive: boolean('isActive').default(true).notNull(), // Enable/disable
  startDate: timestamp('startDate', { mode: 'date' }), // Schedule start
  endDate: timestamp('endDate', { mode: 'date' }), // Schedule end
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const orderItem = mysqlTable('orderItem', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  orderId: varchar('orderId', { length: 255 })
    .notNull()
    .references(() => order.id, { onDelete: 'cascade' }),
  productId: varchar('productId', { length: 255 })
    .notNull()
    .references(() => product.id, { onDelete: 'restrict' }),
  productName: varchar('productName', { length: 255 }).notNull(),
  quantity: int('quantity').notNull(),
  price: int('price').notNull(), // Price per unit at time of order
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

export const rdServiceRegistration = mysqlTable('rdServiceRegistration', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  registrationNumber: varchar('registrationNumber', { length: 255 }).notNull().unique(),

  // Personal Information
  email: varchar('email', { length: 255 }).notNull(),
  customerName: varchar('customerName', { length: 255 }).notNull(),
  mobile: varchar('mobile', { length: 20 }).notNull(),
  address: text('address').notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  district: varchar('district', { length: 255 }).notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),

  // Device Details
  deviceName: varchar('deviceName', { length: 255 }).notNull(),
  deviceModel: varchar('deviceModel', { length: 255 }).notNull(),
  serialNumber: varchar('serialNumber', { length: 255 }).notNull(),
  gstNumber: varchar('gstNumber', { length: 255 }),

  // Service Selection
  rdSupport: varchar('rdSupport', { length: 10 }).notNull(), // 1, 2, or 3 years
  amcSupport: varchar('amcSupport', { length: 50 }), // standard-1, comprehensive-2, etc.
  callbackService: boolean('callbackService').default(false).notNull(),
  deliveryType: varchar('deliveryType', { length: 20 }).notNull(), // regular or express

  // Pricing
  deviceFee: int('deviceFee').notNull(),
  supportFee: int('supportFee').notNull(),
  deliveryFee: int('deliveryFee').notNull(),
  subtotal: int('subtotal').notNull(),
  gst: int('gst').notNull(), // 18% GST
  total: int('total').notNull(),

  // Payment and Status
  paidAmount: int('paidAmount').default(0).notNull(),
  status: varchar('status', { length: 255 }).default('pending').notNull(), // pending, payment_received, processing, completed, cancelled
  paymentStatus: varchar('paymentStatus', { length: 255 }).default('pending').notNull(), // pending, completed, failed
  paymentMethod: varchar('paymentMethod', { length: 255 }),
  paymentId: varchar('paymentId', { length: 255 }),

  // Admin notes
  adminNotes: text('adminNotes'),

  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const supportTicket = mysqlTable('supportTicket', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  ticketNumber: varchar('ticketNumber', { length: 255 }).notNull().unique(),
  userId: varchar('userId', { length: 255 }).references(() => user.id, { onDelete: 'set null' }), // Optional - guest users can submit tickets

  // Contact Information
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),

  // Ticket Details
  subject: varchar('subject', { length: 500 }).notNull(),
  message: text('message').notNull(),
  category: varchar('category', { length: 100 }), // order_support, rd_service, payment, technical, account, service_query
  priority: varchar('priority', { length: 20 }).default('medium').notNull(), // low, medium, high, urgent
  status: varchar('status', { length: 50 }).default('open').notNull(), // open, in_progress, waiting_response, resolved, closed

  // Admin fields
  assignedTo: varchar('assignedTo', { length: 255 }).references(() => user.id, { onDelete: 'set null' }), // Admin user ID
  adminNotes: text('adminNotes'),
  resolution: text('resolution'), // Resolution details
  resolvedAt: timestamp('resolvedAt', { mode: 'date' }),
  closedAt: timestamp('closedAt', { mode: 'date' }),

  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const faq = mysqlTable('faq', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 100 }), // general, orders, payments, services, technical
  displayOrder: int('displayOrder').default(0).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const downloadFile = mysqlTable('downloadFile', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(), // biometric, electronics, computer_peripherals, gps_devices, rd_service, software, encrypted_token, forms

  // File Information
  fileName: varchar('fileName', { length: 255 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 500 }).notNull(),
  fileSize: varchar('fileSize', { length: 50 }), // e.g., "2.5 MB"
  fileType: varchar('fileType', { length: 50 }), // e.g., "PDF", "EXE", "ZIP"
  version: varchar('version', { length: 100 }), // e.g., "1.0.0", "v2.3"

  // Thumbnail
  thumbnailUrl: varchar('thumbnailUrl', { length: 500 }), // Thumbnail image URL

  // Additional Details
  systemRequirements: text('systemRequirements'), // e.g., "Windows 10/11, 4GB RAM"
  downloadCount: int('downloadCount').default(0).notNull(),
  tags: text('tags'), // Stored as JSON string array for search

  // Status
  isActive: boolean('isActive').default(true).notNull(),
  isFeatured: boolean('isFeatured').default(false).notNull(),
  displayOrder: int('displayOrder').default(0).notNull(),

  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});

export const productReview = mysqlTable('productReview', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  productId: varchar('productId', { length: 255 })
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rating: int('rating').notNull(), // 1-5 star rating
  title: varchar('title', { length: 255 }).notNull(),
  comment: text('comment'),
  isApproved: boolean('isApproved').default(false).notNull(), // For moderation
  helpfulCount: int('helpfulCount').default(0).notNull(), // Number of people who found it helpful
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().onUpdateNow().notNull(),
});
