import { db } from '@/lib/db';
import { product, order, orderItem, cartItem, banner, user } from '@/drizzle/schema';

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n');

  try {
    // Check products
    const products = await db.select().from(product);
    console.log('📦 PRODUCTS:');
    console.log(`   Total: ${products.length}`);
    if (products.length > 0) {
      console.log('   Sample:');
      products.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.imageUrl?.substring(0, 50)}...`);
      });
    }
    console.log('');

    // Check orders
    const orders = await db.select().from(order);
    console.log('🛒 ORDERS:');
    console.log(`   Total: ${orders.length}`);
    if (orders.length > 0) {
      console.log('   Sample:');
      orders.slice(0, 3).forEach((o, i) => {
        console.log(`   ${i + 1}. Order #${o.orderNumber} - Status: ${o.status} - Total: ₹${o.total}`);
      });
    }
    console.log('');

    // Check order items
    const orderItems = await db.select().from(orderItem);
    console.log('📋 ORDER ITEMS:');
    console.log(`   Total: ${orderItems.length}`);
    console.log('');

    // Check cart items
    const cartItems = await db.select().from(cartItem);
    console.log('🛒 CART ITEMS:');
    console.log(`   Total: ${cartItems.length}`);
    console.log('');

    // Check banners
    const banners = await db.select().from(banner);
    console.log('🎨 BANNERS:');
    console.log(`   Total: ${banners.length}`);
    if (banners.length > 0) {
      console.log('   Sample:');
      banners.slice(0, 3).forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.title} - ${b.imageUrl?.substring(0, 50)}...`);
      });
    }
    console.log('');

    // Check users (don't show details)
    const users = await db.select().from(user);
    console.log('👤 USERS:');
    console.log(`   Total: ${users.length}`);
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY:');
    console.log(`   Products with AWS S3 images: ${products.filter(p => p.imageUrl?.includes('s3-silverr-bucket')).length}`);
    console.log(`   Banners with AWS S3 images: ${banners.filter(b => b.imageUrl?.includes('s3-silverr-bucket')).length}`);
    console.log('');
    console.log('💡 RECOMMENDATION:');
    if (products.length > 0 || orders.length > 0) {
      console.log('   ⚠️  Database has existing data.');
      console.log('   ℹ️  You can clean:');
      if (products.length > 0) console.log('      - Products (will also remove order items referencing them)');
      if (orders.length > 0) console.log('      - Orders (will also remove order items)');
      if (cartItems.length > 0) console.log('      - Cart items');
      if (banners.length > 0) console.log('      - Banners');
      console.log('   ✅ Users will be kept (for authentication)');
    } else {
      console.log('   ✅ Database is clean! Ready for new data.');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }

  process.exit(0);
}

checkDatabase();
