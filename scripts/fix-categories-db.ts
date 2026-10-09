// Fix product categories directly in database

import { db } from '../lib/db';
import { product } from '../drizzle/schema';
import { eq, or, inArray } from 'drizzle-orm';

async function fixCategories() {
  console.log('🔧 Fixing product categories in database...\n');

  try {
    // Get all products with wrong categories
    const wrongCategories = [
      'AEPS Device',
      'Face Recognition',
      'Fingerprint Scanner',
      'GPS Receiver',
      'IRIS Scanner'
    ];

    const products = await db
      .select()
      .from(product)
      .where(inArray(product.category, wrongCategories));

    console.log(`Found ${products.length} products with wrong categories\n`);

    if (products.length === 0) {
      console.log('No products need updating!');
      return;
    }

    // Update each product
    for (const prod of products) {
      console.log(`Updating: ${prod.name}`);
      console.log(`  Old category: ${prod.category}`);

      await db
        .update(product)
        .set({ category: 'biometric' })
        .where(eq(product.id, prod.id));

      console.log(`  ✅ Updated to: biometric\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Category fix complete!');
    console.log(`\n📊 Updated ${products.length} products`);
    console.log('\n💡 All products now use "biometric" category');
    console.log('   Visit https://amicocart.com/products/biometric');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

console.log('═══════════════════════════════════════');
console.log('  FIX PRODUCT CATEGORIES (DATABASE)');
console.log('═══════════════════════════════════════\n');

fixCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
