# Banner Management System

Complete guide for managing landing page banners and promotional content.

## Overview

The banner management system allows administrators to create, update, and schedule promotional banners across different placements on the landing page. Banners support text overlays, CTA buttons, scheduling, and mobile-optimized images.

## Banner Placements

### 1. Hero Banner
- **Placement ID:** `hero`
- **Desktop Size:** 1920 x 800 px
- **Mobile Size:** 800 x 600 px (optional)
- **Location:** Top of landing page (replaces static hero)
- **Use Case:** Main promotional content, featured products, seasonal campaigns

### 2. Top Promotional Strip
- **Placement ID:** `top_promo`
- **Desktop Size:** 1920 x 100 px
- **Mobile Size:** 800 x 120 px (optional)
- **Location:** Above hero section
- **Use Case:** Announcements, flash sales, free shipping notices

### 3. Section Banner
- **Placement ID:** `section`
- **Desktop Size:** 600 x 300 px
- **Mobile Size:** 400 x 200 px (optional)
- **Location:** Between product categories and featured products
- **Use Case:** Category promotions, product highlights
- **Note:** Displays in 2-column grid on desktop

### 4. Offer Strip
- **Placement ID:** `offer_strip`
- **Desktop Size:** 1920 x 250 px
- **Mobile Size:** 800 x 300 px (optional)
- **Location:** Between featured products and services
- **Use Case:** Mid-page promotional offers, limited-time deals

### 5. Bottom Banner
- **Placement ID:** `bottom`
- **Desktop Size:** 1920 x 400 px
- **Mobile Size:** 800 x 500 px (optional)
- **Location:** Above footer section
- **Use Case:** Newsletter signup, app download, contact info

## Admin Access

### Navigate to Banner Management
1. Login as admin
2. Go to `/admin/banners`

### Dashboard Features
- View all banners
- Filter by placement type
- Toggle banners active/inactive
- View size guidelines
- Preview banner images
- Delete banners
- Quick activate/deactivate

## Creating a Banner

### Step 1: Basic Information
1. Click "Create Banner"
2. Enter **Title** (admin reference only - not shown to users)
3. Select **Placement** from dropdown
4. Set **Display Order** (lower numbers appear first)
5. Check **Active** to show on landing page immediately

### Step 2: Banner Images
1. **Desktop Image URL** (required)
   - Upload image to your server or use AWS S3
   - Paste the full URL: `https://example.com/banner.jpg`
   - Follow recommended size for selected placement

2. **Mobile Image URL** (optional)
   - Provide mobile-optimized version
   - Will display on screens under 768px width
   - If not provided, desktop image will be used

3. **Alt Text** (recommended)
   - Describe the image for accessibility
   - Important for SEO

### Step 3: Text Overlay (Optional)
Add text that appears on top of the banner image:

1. **Heading**
   - Main text (e.g., "Summer Sale - Up to 50% Off")
   - Displays in large, bold font

2. **Subheading**
   - Supporting text (e.g., "On selected electronics and accessories")
   - Displays below heading

3. **Text Position**
   - Left (default)
   - Center
   - Right

4. **CTA Button**
   - Button Text (e.g., "Shop Now")
   - Button Link (e.g., `/products` or full URL)
   - Creates clickable button over banner

### Step 4: Banner Link (Optional)
- Make entire banner clickable
- Use if you want whole banner to be a link
- Note: If CTA button is set, only button will be clickable

### Step 5: Scheduling (Optional)
- **Start Date:** When banner becomes active
- **End Date:** When banner automatically deactivates
- Leave empty for always-active banners
- Great for seasonal campaigns

### Step 6: Save
Click "Create Banner" to save and publish

## Editing a Banner

1. Go to `/admin/banners`
2. Click "Edit" on the banner you want to modify
3. Update any fields
4. Click "Save Changes"

## Managing Banners

### Activate/Deactivate
- Toggle banner visibility without deleting
- Click "Activate" or "Deactivate" button on dashboard
- Inactive banners won't show on landing page

### Delete Banner
- Click "Delete" button
- Confirm deletion
- This action is permanent

### Display Order
- Control the sequence of banners in same placement
- Lower numbers appear first
- Multiple banners in same placement will display sequentially

## Image Upload Options

### Option 1: Public Folder
```bash
# Place images in public folder
/public/banners/summer-sale.jpg

# Use URL in admin
/banners/summer-sale.jpg
```

### Option 2: AWS S3
```bash
# Upload to your S3 bucket
# Use full S3 URL in admin
https://your-bucket.s3.amazonaws.com/banners/summer-sale.jpg
```

### Option 3: External CDN
```bash
# Use any accessible image URL
https://cdn.example.com/images/banner.jpg
```

## Best Practices

### Image Guidelines
1. **Use recommended sizes** for best quality
2. **Optimize images** - Keep file size under 500KB for faster loading
3. **Use JPG** for photos, **PNG** for graphics with transparency
4. **Provide mobile versions** for better mobile experience
5. **Test on multiple devices** before activating

### Text Overlay Tips
1. **Keep it short** - 5-10 words max for heading
2. **High contrast** - Ensure text is readable against image
3. **Use dark backgrounds** with white text, or vice versa
4. **Test readability** on both desktop and mobile

### Scheduling
1. **Set end dates** for seasonal campaigns
2. **Schedule in advance** for launches
3. **Test before going live** - create as inactive first

### Performance
1. **Limit active banners** - Don't overwhelm users
2. **Use max 1-2 banners per placement**
3. **Monitor loading times**

## Landing Page Display

### Fallback Behavior
- If no hero banner is active, static hero component displays
- Other placements only show when banners exist
- Landing page gracefully handles missing banners

### Mobile Responsiveness
- Mobile images automatically load on small screens
- Text overlays adjust size for mobile
- Grid layouts collapse to single column

## API Reference

### Public Endpoints

**GET /api/banners**
- Returns all active banners within date range
- Query params: `?placement=hero` to filter

```json
[
  {
    "id": "uuid",
    "title": "Summer Sale Hero",
    "placement": "hero",
    "imageUrl": "https://...",
    "heading": "Summer Sale",
    "isActive": true
  }
]
```

### Admin Endpoints (Requires Auth)

**GET /api/admin/banners**
- Returns all banners (including inactive)
- Query params: `?placement=hero`

**POST /api/admin/banners**
- Create new banner
- Body: All banner fields

**PATCH /api/admin/banners/[id]**
- Update existing banner
- Body: Fields to update

**DELETE /api/admin/banners/[id]**
- Delete banner permanently

## Database Migration

Run migration to add banner table:

```bash
npm run drizzle:push
```

This creates the `banner` table with all necessary fields.

## Troubleshooting

### Banner Not Showing
1. Check if banner is **Active**
2. Verify **Start/End dates** if set
3. Ensure **Image URL** is accessible
4. Check browser console for errors
5. Try hard refresh (Ctrl+F5)

### Image Not Loading
1. Verify URL is publicly accessible
2. Check CORS settings if using external CDN
3. Ensure image file exists
4. Test URL in browser directly

### Text Overlay Not Visible
1. Check if heading/subheading fields are filled
2. Verify text color contrasts with background
3. Adjust text position if needed
4. Check if image is too bright/dark

## Example Use Cases

### Flash Sale Banner
```
Placement: top_promo
Heading: "⚡ Flash Sale: 30% Off All Biometric Devices"
Link: /products/biometric
Active: During sale period only
Schedule: Set start and end date
```

### New Product Launch
```
Placement: hero
Desktop Image: High-quality product photo (1920x800)
Heading: "Introducing Our Latest Fingerprint Scanner"
Subheading: "Advanced security with lightning-fast recognition"
CTA Text: "Learn More"
CTA Link: /products/new-scanner
```

### Seasonal Campaign
```
Placement: section
Multiple banners: Diwali offers, Summer deals
Schedule: Automatically activate/deactivate
Display Order: Featured offer first
```

## Need Help?

- View size guidelines in admin dashboard
- Test banners as inactive before publishing
- Use scheduling for time-sensitive campaigns
- Monitor banner performance through user engagement
