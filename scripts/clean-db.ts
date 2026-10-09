import { db } from '@/lib/db';
import { product, order, orderItem, cartItem, banner } from '@/drizzle/schema';

/**
 * Database Cleanup Script
 * Removes test/old data before starting fresh with Cloudinary images
 *
 * SAFETY: This keeps USERS intact (for authentication)
 */

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n');
  console.log('⚠️  This will DELETE:');
  console.log('   - All products');
  console.log('   - All orders and order items');
  console.log('   - All cart items');
  console.log('   - All banners');
  console.log('   ✅ Users will be KEPT (for authentication)\n');

  console.log('⏳ Waiting 5 seconds... Press Ctrl+C to cancel\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // 1. Delete cart items (no foreign key dependencies)
    console.log('🛒 Deleting cart items...');
    const deletedCartItems = await db.delete(cartItem);
    console.log(`   ✓ Deleted cart items\n`);

    // 2. Delete order items (references orders)
    console.log('📋 Deleting order items...');
    const deletedOrderItems = await db.delete(orderItem);
    console.log(`   ✓ Deleted order items\n`);

    // 3. Delete orders (references users)
    console.log('📦 Deleting orders...');
    const deletedOrders = await db.delete(order);
    console.log(`   ✓ Deleted orders\n`);

    // 4. Delete products (may be referenced by order items, but we deleted those)
    console.log('🏷️  Deleting products...');
    const deletedProducts = await db.delete(product);
    console.log(`   ✓ Deleted products\n`);

    // 5. Delete banners (no foreign key dependencies)
    console.log('🎨 Deleting banners...');
    const deletedBanners = await db.delete(banner);
    console.log(`   ✓ Deleted banners\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database cleanup complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Cart items deleted`);
    console.log(`   Order items deleted`);
    console.log(`   Orders deleted`);
    console.log(`   Products deleted`);
    console.log(`   Banners deleted`);
    console.log('');
    console.log('✅ Users kept intact');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Upload new products with Cloudinary images');
    console.log('   2. Create new banners with Cloudinary images');
    console.log('   3. Test the site');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    console.log('\n⚠️  Some data may have been partially deleted.');
    console.log('   Check the error above and run again if needed.');
  }

  process.exit(0);
}

// Run cleanup
console.log('═══════════════════════════════════════');
console.log('  DATABASE CLEANUP SCRIPT');
console.log('═══════════════════════════════════════\n');

cleanDatabase();
