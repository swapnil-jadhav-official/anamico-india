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
