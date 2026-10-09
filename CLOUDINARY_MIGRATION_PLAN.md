# Migration Plan: AWS S3 → Cloudinary

## Why Migrate to Cloudinary?

### Current AWS Costs (Your Setup)
Based on your `.env`:
- **S3 Storage**: eu-north-1 region ($0.023/GB/month)
- **S3 Data Transfer**: $0.09/GB egress
- **S3 Requests**: $0.0004 per 1K PUT, $0.0004 per 10K GET

**Estimated Monthly AWS Cost** (assuming 5GB storage, 50GB transfer):
- Storage: 5GB × $0.023 = $0.12
- Transfer: 50GB × $0.09 = $4.50
- Requests: ~$0.20
- **Total: ~$4.82/month** (and growing with traffic)

### Cloudinary Free Tier
- **25 credits/month FREE** = 25GB bandwidth + 25GB storage + 25K transformations
- **Free image optimization**: WebP/AVIF auto-conversion
- **Free CDN**: Global edge delivery
- **Free transformations**: Resize, crop, quality optimization on-the-fly
- **No egress fees**

**Savings: ~$4-5/month + better performance + free optimization**

---

## Migration Strategy

### Phase 1: Set Up Cloudinary (Week 1)
**Goal**: Get Cloudinary account ready, keep AWS as backup

1. Create free Cloudinary account at https://cloudinary.com
2. Get credentials (Cloud Name, API Key, API Secret)
3. Set up unsigned upload preset for browser uploads
4. Add credentials to `.env`

### Phase 2: Update Upload API (Week 1-2)
**Goal**: Replace AWS S3 upload with Cloudinary upload

1. Replace AWS SDK with Cloudinary SDK in upload API
2. Update database to store Cloudinary URLs
3. Test uploads with new system
4. Keep AWS code commented as backup

### Phase 3: Implement Optimization (Week 2)
**Goal**: Apply optimization patterns from CLOUDINARY_OPTIMIZATION_GUIDE.md

1. Create Cloudinary helper functions
2. Set up Next.js custom loader for automatic optimization
3. Update all Image components to use optimized URLs
4. Configure upload preset with size caps

### Phase 4: Migrate Existing Images (Week 3)
**Goal**: Move existing AWS images to Cloudinary

1. Export list of all image URLs from database
2. Download from AWS S3
3. Upload to Cloudinary (preserving filenames)
4. Update database URLs
5. Verify all images working

### Phase 5: Cleanup (Week 4)
**Goal**: Remove AWS dependency

1. Verify all images migrated successfully
2. Delete AWS S3 bucket or keep for backups
3. Remove AWS SDK dependencies
4. Remove AWS credentials from `.env`

---

## Implementation Details

### Step 1: Add Cloudinary to Environment Variables

Add to `.env`:
```env
# -----------------------------
# CLOUDINARY CONFIG
# -----------------------------
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_PRESET="anamico_unsigned_preset"

# Keep AWS credentials commented as backup during migration
# AWS_ACCESS_KEY_ID="your_aws_access_key_here"
# AWS_SECRET_ACCESS_KEY="your_aws_secret_key_here"
# AWS_S3_BUCKET_NAME="s3-silverr-bucket"
# AWS_REGION="eu-north-1"
# AWS_S3_URL="https://s3-silverr-bucket.s3.eu-north-1.amazonaws.com"
```

### Step 2: Install Cloudinary SDK

```bash
npm install cloudinary
npm uninstall @aws-sdk/client-s3  # Remove after migration complete
```

### Step 3: Create Cloudinary Helper Functions

Create `lib/cloudinary.ts`:
```ts
// lib/cloudinary.ts

/**
 * Optimizes a Cloudinary URL with proper transformations
 * Based on CLOUDINARY_OPTIMIZATION_GUIDE.md patterns
 */
export function optimizeCloudinaryUrl(url: string, width?: number): string {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const transformation = width
    ? `f_auto,q_auto,w_${width},c_limit`
    : 'f_auto,q_auto';

  return url.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Generates srcSet for responsive images (1x and 2x)
 * For use with plain <img> tags
 */
export function cloudinarySrcSet(url: string, width: number): string {
  return `${optimizeCloudinaryUrl(url, width)} 1x, ${optimizeCloudinaryUrl(url, width * 2)} 2x`;
}

/**
 * Extracts public_id from Cloudinary URL
 * Useful for deletions and transformations
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!url.includes('res.cloudinary.com')) return null;

  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}
```

### Step 4: Update Upload API Route

Replace `app/api/upload/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed image MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products', // Organize in folders like AWS S3
          resource_type: 'auto',
          // Apply optimization on upload (from CLOUDINARY_OPTIMIZATION_GUIDE.md)
          transformation: {
            width: 2000,
            height: 2000,
            crop: 'limit',
            quality: 'auto',
          },
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const result = uploadResponse as any;

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to Cloudinary' },
      { status: 500 }
    );
  }
}
```

### Step 5: Create Cloudinary Loader for Next.js

Create `lib/cloudinaryLoader.ts`:
```ts
// lib/cloudinaryLoader.ts
// Based on CLOUDINARY_OPTIMIZATION_GUIDE.md

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Pass through non-Cloudinary URLs
  if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) {
    return src;
  }

  const q = quality ? `q_${quality}` : 'q_auto';

  // Insert transformation parameters
  return src.replace(
    '/upload/',
    `/upload/f_auto,${q},w_${width},c_limit/`
  );
}
```

### Step 6: Update Next.js Config

Update `next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudinaryLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig
```

### Step 7: Update Image Components

**For Next.js Image components** (already using `next/image`):
```tsx
import Image from "next/image";

// BEFORE (AWS S3 direct URL)
<Image
  src="https://s3-silverr-bucket.s3.eu-north-1.amazonaws.com/products/image.jpg"
  alt="Product"
  width={800}
  height={600}
/>

// AFTER (Cloudinary with automatic optimization)
<Image
  src="https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/products/image.jpg"
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  // Loader automatically adds f_auto,q_auto,w_XXX,c_limit
/>
```

**For plain `<img>` tags**:
```tsx
import { optimizeCloudinaryUrl, cloudinarySrcSet } from '@/lib/cloudinary';

// BEFORE
<img
  src="https://s3-silverr-bucket.s3.eu-north-1.amazonaws.com/products/image.jpg"
  alt="Product"
/>

// AFTER
<img
  src={optimizeCloudinaryUrl(imageUrl, 800)}
  srcSet={cloudinarySrcSet(imageUrl, 800)}
  alt="Product"
  loading="lazy"
/>
```

### Step 8: Set Up Cloudinary Upload Preset

**In Cloudinary Dashboard**:
1. Go to Settings → Upload → Upload presets
2. Click "Add upload preset"
3. Set:
   - **Preset name**: `anamico_unsigned_preset`
   - **Signing Mode**: `Unsigned` (for browser uploads)
   - **Folder**: `products`
   - **Incoming Transformation**: `w_2000,h_2000,c_limit,q_auto`
   - **Access Mode**: `public`
4. Save preset

This caps all uploads at 2000×2000px automatically (from optimization guide).

---

## Migration Script for Existing Images

Create `scripts/migrate-to-cloudinary.ts`:
```ts
import { db } from '@/lib/db';
import { product, banner } from '@/drizzle/schema';
import { v2 as cloudinary } from 'cloudinary';
import { eq } from 'drizzle-orm';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImages() {
  console.log('Starting migration from AWS S3 to Cloudinary...\n');

  // 1. Migrate product images
  const products = await db.select().from(product);
  console.log(`Found ${products.length} products to migrate\n`);

  for (const prod of products) {
    try {
      // Migrate main image
      if (prod.imageUrl && prod.imageUrl.includes('s3-silverr-bucket')) {
        console.log(`Migrating product: ${prod.name}`);
        console.log(`  Old URL: ${prod.imageUrl}`);

        const cloudinaryUrl = await uploadToCloudinary(
          prod.imageUrl,
          `products/${prod.id}`
        );

        console.log(`  New URL: ${cloudinaryUrl}`);

        // Update database
        await db
          .update(product)
          .set({ imageUrl: cloudinaryUrl })
          .where(eq(product.id, prod.id));

        console.log(`  ✓ Updated database\n`);
      }

      // Migrate gallery images
      if (prod.galleryImages) {
        const gallery = JSON.parse(prod.galleryImages);
        if (Array.isArray(gallery) && gallery.length > 0) {
          console.log(`  Migrating ${gallery.length} gallery images...`);

          const migratedGallery = [];
          for (let i = 0; i < gallery.length; i++) {
            const imgUrl = gallery[i];
            if (imgUrl.includes('s3-silverr-bucket')) {
              const cloudinaryUrl = await uploadToCloudinary(
                imgUrl,
                `products/${prod.id}/gallery-${i}`
              );
              migratedGallery.push(cloudinaryUrl);
              console.log(`    ✓ Gallery image ${i + 1}/${gallery.length}`);
            } else {
              migratedGallery.push(imgUrl);
            }
          }

          await db
            .update(product)
            .set({ galleryImages: JSON.stringify(migratedGallery) })
            .where(eq(product.id, prod.id));

          console.log(`  ✓ Updated gallery in database\n`);
        }
      }
    } catch (error) {
      console.error(`  ✗ Error migrating product ${prod.name}:`, error);
    }
  }

  // 2. Migrate banner images
  const banners = await db.select().from(banner);
  console.log(`\nFound ${banners.length} banners to migrate\n`);

  for (const ban of banners) {
    try {
      // Migrate desktop banner
      if (ban.imageUrl && ban.imageUrl.includes('s3-silverr-bucket')) {
        console.log(`Migrating banner: ${ban.title}`);
        console.log(`  Old URL: ${ban.imageUrl}`);

        const cloudinaryUrl = await uploadToCloudinary(
          ban.imageUrl,
          `banners/${ban.id}`
        );

        console.log(`  New URL: ${cloudinaryUrl}`);

        await db
          .update(banner)
          .set({ imageUrl: cloudinaryUrl })
          .where(eq(banner.id, ban.id));

        console.log(`  ✓ Updated database\n`);
      }

      // Migrate mobile banner
      if (ban.imageUrlMobile && ban.imageUrlMobile.includes('s3-silverr-bucket')) {
        console.log(`  Migrating mobile version...`);

        const cloudinaryUrl = await uploadToCloudinary(
          ban.imageUrlMobile,
          `banners/${ban.id}-mobile`
        );

        await db
          .update(banner)
          .set({ imageUrlMobile: cloudinaryUrl })
          .where(eq(banner.id, ban.id));

        console.log(`  ✓ Updated mobile banner\n`);
      }
    } catch (error) {
      console.error(`  ✗ Error migrating banner ${ban.title}:`, error);
    }
  }

  console.log('\n✓ Migration complete!');
}

async function uploadToCloudinary(
  s3Url: string,
  publicId: string
): Promise<string> {
  try {
    // Upload directly from URL (Cloudinary fetches from S3)
    const result = await cloudinary.uploader.upload(s3Url, {
      public_id: publicId,
      resource_type: 'auto',
      transformation: {
        width: 2000,
        height: 2000,
        crop: 'limit',
        quality: 'auto',
      },
    });

    return result.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Run migration
migrateImages().catch(console.error);
```

**Run migration**:
```bash
# Add to package.json scripts:
"migrate:cloudinary": "tsx scripts/migrate-to-cloudinary.ts"

# Then run:
npm run migrate:cloudinary
```

---

## Cost Comparison

### Scenario: Small E-commerce Site (amicocart.com)

| Usage | AWS S3 Cost | Cloudinary Free | Cloudinary Paid |
|-------|-------------|-----------------|-----------------|
| 5GB storage | $0.12/mo | FREE | $89/mo (Plus plan) |
| 25GB bandwidth | $2.25/mo | FREE | Included |
| 50GB bandwidth | $4.50/mo | $89/mo (over limit) | Included |
| 100GB bandwidth | $9.00/mo | $89/mo | Included |
| Image optimization | Not included | FREE | Included |
| CDN delivery | Not included | FREE | Included |
| Transformations | Not included | FREE (25K/mo) | Unlimited |

**Key Insights**:
- **For low traffic** (< 25GB/month): Cloudinary FREE tier wins
- **For medium traffic** (25-50GB/month): AWS slightly better
- **For high traffic** (> 50GB/month): Consider both costs

**Your current situation**: If you're within 25GB/month, Cloudinary FREE = **$4-5/month savings**

---

## Rollback Plan

If migration has issues:

1. **Keep AWS S3 bucket intact during migration** (don't delete)
2. **Database backup before updating URLs**
3. **Gradual migration**: Migrate 10 products first, test thoroughly
4. **Quick rollback**: Update `app/api/upload/route.ts` back to AWS code

---

## Implementation Checklist

### Week 1: Setup & Testing
- [ ] Create Cloudinary account
- [ ] Get API credentials (Cloud Name, API Key, Secret)
- [ ] Add credentials to `.env`
- [ ] Set up unsigned upload preset in Cloudinary dashboard
- [ ] Install Cloudinary SDK: `npm install cloudinary`
- [ ] Create `lib/cloudinary.ts` helper functions
- [ ] Create `lib/cloudinaryLoader.ts` custom loader
- [ ] Update `next.config.mjs` with Cloudinary config

### Week 2: Update Upload System
- [ ] Replace AWS code in `app/api/upload/route.ts` with Cloudinary
- [ ] Test upload with 2-3 test images
- [ ] Verify images appear in Cloudinary dashboard
- [ ] Verify optimization (check if WebP is delivered)
- [ ] Update Image components to use new Cloudinary URLs

### Week 3: Migrate Existing Images
- [ ] Create `scripts/migrate-to-cloudinary.ts`
- [ ] **BACKUP DATABASE** before migration
- [ ] Run migration for 10 test products first
- [ ] Verify test products display correctly on site
- [ ] Run full migration for all products and banners
- [ ] Verify all images working on staging/production

### Week 4: Cleanup & Optimization
- [ ] Test site thoroughly on mobile and desktop
- [ ] Check Lighthouse scores (should improve)
- [ ] Monitor Cloudinary usage in dashboard
- [ ] Remove AWS SDK: `npm uninstall @aws-sdk/client-s3`
- [ ] Optional: Keep AWS bucket for 1 month as backup
- [ ] Optional: Delete AWS bucket after confirming stability

---

## Monitoring & Optimization

### Check Cloudinary Usage
1. Dashboard → Analytics
2. Watch for:
   - Credits used (stay under 25/month for free tier)
   - Bandwidth (should be < 25GB for free tier)
   - Transformations count
   - Storage size

### Optimization Tips (from guide)
1. **Audit `sizes` prop** on all `<Image>` components - must match actual rendered width
2. **Use custom loader** for automatic `f_auto,q_auto` on all images
3. **Set upload preset transformation** to cap at 2000px
4. **Monitor LCP** with Lighthouse - should improve 30-50%

### If You Exceed Free Tier
Options:
1. Optimize more (reduce image sizes, use lower quality)
2. Upgrade to Cloudinary Plus ($89/month)
3. Consider hybrid: Keep large files in AWS, small/frequent in Cloudinary

---

## Support & Resources

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Optimization Guide**: See `CLOUDINARY_OPTIMIZATION_GUIDE.md` in repo
- **Next.js Integration**: https://cloudinary.com/documentation/nextjs_integration
- **Support**: https://support.cloudinary.com

---

## Expected Results

After migration:
- ✅ **$4-5/month cost savings** (within free tier)
- ✅ **60-85% smaller image files** (auto WebP/AVIF)
- ✅ **2-3x faster page loads** (CDN + optimization)
- ✅ **Better SEO** (faster LCP scores)
- ✅ **Global CDN** for free (AWS S3 has no CDN)
- ✅ **Automatic transformations** (resize, crop, format)

**Total Migration Time**: 10-15 hours over 3-4 weeks
