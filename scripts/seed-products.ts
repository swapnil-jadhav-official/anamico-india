import * as fs from 'fs';
import * as path from 'path';
import { db } from '@/lib/db';
import { product } from '@/drizzle/schema';
import { v2 as cloudinary } from 'cloudinary';

// Load .env file manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sample products with Unsplash images
const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
    price: 2999,
    comparePrice: 4999,
    category: 'Electronics',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Eco-friendly insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof design.',
    price: 899,
    comparePrice: 1299,
    category: 'Lifestyle',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
  },
  {
    name: 'Leather Laptop Bag',
    description: 'Genuine leather laptop bag with multiple compartments. Fits laptops up to 15.6 inches. Professional and durable design.',
    price: 3499,
    comparePrice: 5999,
    category: 'Accessories',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your health and fitness goals with this advanced smartwatch. Features heart rate monitoring, GPS, and 7-day battery life.',
    price: 4999,
    comparePrice: 7999,
    category: 'Electronics',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: '100% organic cotton premium t-shirt. Soft, comfortable, and eco-friendly. Available in multiple colors and sizes.',
    price: 699,
    comparePrice: 999,
    category: 'Fashion',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
];

async function uploadImageToCloudinary(imageUrl: string, productName: string): Promise<string> {
  console.log(`   📥 Fetching image from Unsplash...`);

  // Fetch the image
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  console.log(`   ☁️  Uploading to Cloudinary...`);

  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'products',
        resource_type: 'auto',
        transformation: {
          width: 2000,
          height: 2000,
          crop: 'limit',
          quality: 'auto',
        },
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

async function seedProducts() {
  console.log('🌱 Starting product seeding...\n');

  for (let i = 0; i < sampleProducts.length; i++) {
    const item = sampleProducts[i];
    console.log(`\n[${i + 1}/${sampleProducts.length}] Creating: ${item.name}`);

    try {
      // Upload image to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(item.imageUrl, item.name);
      console.log(`   ✅ Image uploaded to Cloudinary`);

      // Create product in database
      await db.insert(product).values({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        comparePrice: item.comparePrice.toString(),
        category: item.category,
        stock: item.stock,
        image: cloudinaryUrl,
        featured: i === 0, // Make first product featured
      });

      console.log(`   ✅ Product created in database`);
      console.log(`   🔗 ${cloudinaryUrl}`);
    } catch (error) {
      console.error(`   ❌ Error creating product:`, error);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Product seeding complete!');
  console.log(`\n📊 Created ${sampleProducts.length} products with Cloudinary images`);
  console.log('\n💡 Visit https://amicocart.com/admin/products to manage them');
}

console.log('═══════════════════════════════════════');
console.log('  PRODUCT SEEDER');
console.log('═══════════════════════════════════════\n');

seedProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
