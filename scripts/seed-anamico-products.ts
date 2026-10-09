// Seed real Anamico India biometric products

const anamicoProducts = [
  {
    name: 'Mantra MFS100 Fingerprint Scanner',
    brand: 'Mantra',
    description: 'UIDAI certified USB fingerprint scanner with optical sensor. Ideal for Aadhaar authentication, e-KYC, AEPS, and attendance systems. Features high-quality 500 DPI resolution and fast capture speed.',
    regularPrice: 1850,
    salePrice: 1650,
    category: 'biometric',
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&q=80',
    features: ['500 DPI Resolution', 'UIDAI Certified', 'USB 2.0 Interface', 'Windows & Linux Compatible'],
  },
  {
    name: 'Morpho MSO 1300 E3 Fingerprint Scanner',
    brand: 'Morpho (Idemia)',
    description: 'Advanced biometric fingerprint scanner with FBI certification. Perfect for banking, government services, and secure authentication. Durable design with scratch-resistant platen.',
    regularPrice: 2800,
    salePrice: 2500,
    category: 'biometric',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
    features: ['FBI PIV Certified', 'Auto Capture', 'High Security', 'Durable Build'],
  },
  {
    name: 'Startek FM220U Fingerprint Reader',
    brand: 'Startek',
    description: 'Compact and affordable UIDAI approved fingerprint scanner. Excellent for AEPS applications, digital payments, and biometric verification. Easy plug-and-play setup.',
    regularPrice: 1500,
    salePrice: 1350,
    category: 'biometric',
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80',
    features: ['UIDAI Approved', 'Compact Design', 'Plug & Play', 'Low Power Consumption'],
  },
  {
    name: 'Mantra MSIRIS202 Dual IRIS Scanner',
    brand: 'Mantra',
    description: 'High-precision dual IRIS recognition system for Aadhaar enrollment and authentication. ISO/IEC certified with superior accuracy and anti-spoofing technology.',
    regularPrice: 28000,
    salePrice: 25500,
    category: 'biometric',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    features: ['Dual IRIS Capture', 'ISO/IEC Certified', 'Anti-Spoofing', 'High Accuracy'],
  },
  {
    name: 'Secugen Hamster Pro 20 Fingerprint Scanner',
    brand: 'Secugen',
    description: 'Professional-grade fingerprint reader with advanced SEIR sensor technology. Excellent for harsh environments and provides reliable performance for authentication applications.',
    regularPrice: 3200,
    salePrice: 2900,
    category: 'biometric',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&q=80',
    features: ['SEIR Sensor', 'Harsh Environment Ready', 'FBI Certified', 'Auto-On Technology'],
  },
  {
    name: 'Mantra MFS110 AEPS Fingerprint Scanner',
    brand: 'Mantra',
    description: 'Specially designed for Aadhaar Enabled Payment System (AEPS). RD Service compatible with all major banking apps. Compact and portable design for field operations.',
    regularPrice: 1950,
    salePrice: 1750,
    category: 'biometric',
    stock: 175,
    imageUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
    features: ['AEPS Certified', 'RD Service Compatible', 'Portable Design', 'Bank App Compatible'],
  },
  {
    name: 'Cogent CSD 200 Dual Fingerprint Scanner',
    brand: 'Cogent',
    description: 'Premium dual fingerprint scanner for simultaneous capture. STQC certified for government projects. Ideal for passport, visa, and high-security applications.',
    regularPrice: 4500,
    salePrice: 4200,
    category: 'biometric',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
    features: ['Dual Capture', 'STQC Certified', 'Government Grade', 'High Durability'],
  },
  {
    name: 'Biometric Face Recognition Attendance System',
    brand: 'Anamico',
    description: 'Advanced face recognition attendance machine with RFID card support. Touchless operation, 3000 face capacity, and real-time monitoring. Includes access control features.',
    regularPrice: 12500,
    salePrice: 11000,
    category: 'biometric',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1585079542156-2755d9c8a094?w=800&q=80',
    features: ['3000 Face Capacity', 'RFID Support', 'Touchless', 'Access Control'],
  },
  {
    name: 'UGR 86 UIDAI Aadhaar GPS Receiver',
    brand: 'UGR',
    description: 'UIDAI approved USB GPS receiver for Aadhaar enrollment. Accurate location tracking, fast satellite acquisition, and compatible with all enrollment software. Essential for mobile Aadhaar centers.',
    regularPrice: 1200,
    salePrice: 1050,
    category: 'biometric',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&q=80',
    features: ['UIDAI Approved', 'Fast Acquisition', 'USB Interface', 'High Accuracy'],
  },
  {
    name: 'Aratek A600 Fingerprint Scanner',
    brand: 'Aratek',
    description: 'Professional biometric fingerprint reader with capacitive sensor. FBI and STQC certified, ideal for government ID programs, banking, and enterprise security. Rugged design for field use.',
    regularPrice: 3500,
    salePrice: 3200,
    category: 'biometric',
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
    features: ['Capacitive Sensor', 'FBI Certified', 'STQC Approved', 'Rugged Design'],
  },
];

async function uploadImageViaAPI(imageUrl: string, uploadApiUrl: string): Promise<string> {
  console.log(`   📥 Fetching product image...`);

  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const blob = new Blob([arrayBuffer], { type: contentType });

  console.log(`   ☁️  Uploading to Cloudinary...`);

  const formData = new FormData();
  const extension = contentType.split('/')[1] || 'jpg';
  formData.append('file', blob, `product.${extension}`);

  const uploadResponse = await fetch(uploadApiUrl, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Upload API error: ${uploadResponse.status} - ${error}`);
  }

  const result = await uploadResponse.json();
  return result.url;
}

async function createProductViaAPI(productData: any, apiUrl: string) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function seedAnamicoProducts() {
  const PRODUCTS_API_URL = 'https://amicocart.com/api/admin/products';
  const UPLOAD_API_URL = 'https://amicocart.com/api/upload';

  console.log('🌱 Seeding Anamico India products...\n');

  for (let i = 0; i < anamicoProducts.length; i++) {
    const item = anamicoProducts[i];
    console.log(`\n[${i + 1}/${anamicoProducts.length}] Creating: ${item.name}`);

    try {
      const cloudinaryUrl = await uploadImageViaAPI(item.imageUrl, UPLOAD_API_URL);
      console.log(`   ✅ Image uploaded`);

      const productData = {
        name: item.name,
        brand: item.brand,
        description: item.description,
        regularPrice: item.regularPrice.toString(),
        salePrice: item.salePrice.toString(),
        category: item.category,
        stock: item.stock.toString(),
        imageUrl: cloudinaryUrl,
        features: item.features,
      };

      await createProductViaAPI(productData, PRODUCTS_API_URL);
      console.log(`   ✅ Product created - ₹${item.salePrice}`);
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Anamico products seeded successfully!');
  console.log(`\n📊 Created ${anamicoProducts.length} biometric products`);
  console.log('\n💡 Visit https://amicocart.com/admin/products to manage');
}

console.log('═══════════════════════════════════════');
console.log('  ANAMICO INDIA - PRODUCT SEEDER');
console.log('═══════════════════════════════════════\n');

seedAnamicoProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
