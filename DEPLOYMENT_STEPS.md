# Deployment Steps - Cloudinary Migration + Database Cleanup

## What's Been Done ✅

I've completed the Cloudinary migration locally:

1. ✅ Added Cloudinary credentials to `.env`
2. ✅ Installed Cloudinary SDK (`cloudinary` package)
3. ✅ Created helper functions (`lib/cloudinary.ts`)
4. ✅ Created custom loader (`lib/cloudinaryLoader.ts`)
5. ✅ Updated `next.config.mjs` with Cloudinary optimization
6. ✅ Replaced AWS upload API with Cloudinary (`app/api/upload/route.ts`)
7. ✅ Created database cleanup API (`app/api/admin/cleanup-db/route.ts`)
8. ✅ Created admin cleanup UI page (`app/admin/cleanup/page.tsx`)

---

## Deploy to Production (VPS)

### Step 1: Update VPS Environment Variables

SSH into your VPS and update the `.env` file:

```bash
ssh root@212.38.94.61
cd /var/www/app
nano .env
```

Add these Cloudinary credentials (replace AWS section):

```env
# -----------------------------
# CLOUDINARY CONFIG (Active)
# -----------------------------
CLOUDINARY_CLOUD_NAME="davcnvfyn"
CLOUDINARY_API_KEY="868525965412486"
CLOUDINARY_API_SECRET="RbfqvSgyGVe7ns5AxDIvxd2GtLg"
CLOUDINARY_UPLOAD_PRESET="c-45ad99fb0853027f94318066e1356a"
CLOUDINARY_URL="cloudinary://868525965412486:RbfqvSgyGVe7ns5AxDIvxd2GtLg@davcnvfyn"

# -----------------------------
# AWS S3 CONFIG (Backup - commented during migration)
# -----------------------------
# AWS_ACCESS_KEY_ID="your_aws_access_key_here"
# AWS_SECRET_ACCESS_KEY="your_aws_secret_key_here"
# AWS_S3_BUCKET_NAME="s3-silverr-bucket"
# AWS_REGION="eu-north-1"
# AWS_S3_URL="https://s3-silverr-bucket.s3.eu-north-1.amazonaws.com"
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`)

---

### Step 2: Push Local Changes to Git

On your local machine:

```bash
cd C:\Users\tejas\OneDrive\Desktop\anamico-india

# Add all changes
git add .

# Commit with message
git commit -m "Migrate from AWS S3 to Cloudinary with optimization"

# Push to remote
git push origin main
```

---

### Step 3: Pull Changes on VPS

On your VPS:

```bash
cd /var/www/app

# Pull latest code
git pull origin main

# Install Cloudinary package
npm install cloudinary --legacy-peer-deps

# Rebuild the application
npm run build
```

---

### Step 4: Restart the Application

```bash
# If using PM2
pm2 restart all
pm2 save

# Check logs to ensure no errors
pm2 logs
```

---

### Step 5: Clean the Database

Visit the admin cleanup page in your browser:

**URL**: https://amicocart.com/admin/cleanup

1. Log in as admin
2. Read the warnings
3. Check the confirmation checkbox
4. Click "Clean Database Now"
5. Wait for success message

**What it deletes:**
- ❌ All products (with old AWS S3 images)
- ❌ All orders
- ❌ All cart items
- ❌ All banners

**What it keeps:**
- ✅ All users (for authentication)

---

### Step 6: Upload New Products with Cloudinary

1. Go to admin panel: https://amicocart.com/admin/products
2. Add new products
3. Upload images - they will now go to Cloudinary
4. Images will be automatically optimized (WebP/AVIF)

---

## Verification Checklist

After deployment, verify:

- [ ] Site loads without errors
- [ ] Can log in as admin
- [ ] Database cleanup page works (`/admin/cleanup`)
- [ ] Can upload new product images
- [ ] Images upload to Cloudinary (check dashboard: https://cloudinary.com/console)
- [ ] Images are served in WebP format (check browser Network tab)
- [ ] Images load fast with CDN

---

## Quick Reference

### Important URLs
- **Site**: https://amicocart.com
- **Admin Panel**: https://amicocart.com/admin
- **Cleanup Page**: https://amicocart.com/admin/cleanup
- **Cloudinary Dashboard**: https://cloudinary.com/console

### SSH Access
```bash
ssh root@212.38.94.61
cd /var/www/app
```

### Check PM2 Status
```bash
pm2 status
pm2 logs
pm2 restart all
```

### View Cloudinary Usage
Go to: https://cloudinary.com/console/lui/usage

---

## Rollback (If Needed)

If something goes wrong:

1. **Restore AWS upload API:**
   - Edit `app/api/upload/route.ts`
   - Uncomment the AWS code at the bottom
   - Comment out the Cloudinary code
   - Restore AWS credentials in `.env`

2. **Revert Next.js config:**
   - Edit `next.config.mjs`
   - Set `images: { unoptimized: true }`

3. **Rebuild and restart:**
   ```bash
   npm run build
   pm2 restart all
   ```

---

## Cost Savings

**Before (AWS S3):**
- ~$4.82/month
- No CDN
- No automatic optimization

**After (Cloudinary Free):**
- **$0/month** (within 25GB free tier)
- ✅ Global CDN included
- ✅ Automatic WebP/AVIF conversion
- ✅ 60-85% smaller file sizes
- ✅ Faster page loads

---

## Support

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Optimization Guide**: See `CLOUDINARY_OPTIMIZATION_GUIDE.md` in repo
- **Migration Plan**: See `CLOUDINARY_MIGRATION_PLAN.md` in repo

---

## Next Steps After Cleanup

1. Upload 5-10 test products with Cloudinary images
2. Check Cloudinary dashboard for usage stats
3. Test image loading speed on mobile and desktop
4. Run Lighthouse audit to see performance improvements
5. Monitor Cloudinary free tier usage (stay under 25GB/month)
