# Cloudinary Image Optimization — Reusable Playbook

A field-tested pattern for keeping Cloudinary usage inside the free/cheap tier on a
Next.js site, built and refined on this project. Portable to any other Next.js +
Cloudinary project — copy the code patterns directly, adjust widths to your layout.

## The problem this solves

Cloudinary's free plan is 25 credits/month (1 credit = 1,000 transformations, 1 GB
storage, or 1 GB bandwidth). The single most common way a small site blows through
that limit is serving **full-resolution originals on every page view** instead of
delivering a size/format appropriate to where the image actually renders. On this
project that alone was responsible for ~96% of credit usage (30 GB/month bandwidth
against a 25-credit limit) — bandwidth, not storage or transformations, is almost
always the real cost driver.

The fix has three independent layers. All three matter — fixing only one leaves
real savings on the table or reintroduces the problem the moment traffic grows.

---

## Layer 1 — Delivery-side optimization (the big win)

Never link directly to a stored Cloudinary URL. Always request `f_auto,q_auto` +
an explicit width cap, so Cloudinary serves a modern format (WebP/AVIF) at a
size matching the actual display context instead of the raw upload.

### For `next/image` — use a custom loader, not a fixed width

**Don't** bake a fixed width into the URL you hand to `next/image`:

```tsx
// WRONG — defeats next/image's own responsive/retina logic.
// Next can never serve more resolution than this hardcoded cap,
// even on a 2x/3x retina display that needs it.
<Image src={optimizeCloudinaryUrl(url, 800)} fill sizes="..." />
```

**Do** register a custom loader so Next.js drives the exact width per device/DPR
dynamically, and Cloudinary just fulfills whatever Next asks for:

```ts
// lib/cloudinaryLoader.ts
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) {
    return src; // local/static assets pass through untouched
  }
  const q = quality ? `q_${quality}` : 'q_auto';
  return src.replace('/upload/', `/upload/f_auto,${q},w_${width},c_limit/`);
}
```

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudinaryLoader.ts',
  },
};
```

Then every `<Image src={rawCloudinaryUrl} fill sizes="..." />` just works — pass
the **unmodified** stored URL, nothing else to do per-component.

**The one thing that will silently break this:** the `sizes` prop must match the
*actual rendered CSS width* of the image, not an approximation. If `sizes` claims
`400px` but the real container is `570px`, Next picks a lower-resolution
candidate than the box needs and the browser stretches it — visible softness with
zero errors anywhere. When debugging "images look compressed" on a page that uses
`next/image`, check this first before anything else. (Found and fixed exactly
this bug on two components in this project — the `sizes` string had drifted from
the container's actual Tailwind width classes.)

### For plain `<img>` tags — URL + manual `srcSet`

Anywhere a raw `<img>` is used instead of `next/image` (rich-text body content,
simple thumbnails, logos), there's no automatic responsive mechanism, so build
it by hand with density descriptors:

```ts
// lib/cloudinary.ts
export function optimizeCloudinaryUrl(url: string, width?: number): string {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const transformation = width ? `f_auto,q_auto,w_${width},c_limit` : 'f_auto,q_auto';
  return url.replace('/upload/', `/upload/${transformation}/`);
}

// 1x/2x pair so retina screens get real pixel data instead of
// the browser upscaling a 1x image.
export function cloudinarySrcSet(url: string, width: number): string {
  return `${optimizeCloudinaryUrl(url, width)} 1x, ${optimizeCloudinaryUrl(url, width * 2)} 2x`;
}
```

```tsx
<img
  src={optimizeCloudinaryUrl(url, 800)}
  srcSet={cloudinarySrcSet(url, 800)}
  alt="..."
/>
```

Pick the width per context (card ~800px, hero ~1920px, avatar ~200px, etc.) —
same principle as `sizes` above: match the real rendered width, then double it
for the 2x descriptor.

**Real measured result on this project:** a 2.96 MB original image, requested at
an appropriate width with `f_auto,q_auto`, came back at 448 KB — an 85% reduction,
with no visible quality loss when the width is sized correctly.

---

## Layer 2 — Upload-side capping (stops the problem at the source)

Delivery-side optimization controls what gets *served*, but the *stored original*
stays whatever size it was uploaded at — costing storage credit and giving every
future transformation a bigger source to work from. Cap it at upload time via the
unsigned upload preset's incoming transformation:

```js
// One-time setup via Admin API (or do it in the Cloudinary dashboard:
// Settings → Upload → your preset → "Incoming Transformation")
const form = new URLSearchParams();
form.set('transformation', 'w_2000,h_2000,c_limit,q_auto');
await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/upload_presets/${PRESET_NAME}`, {
  method: 'PUT',
  headers: {
    Authorization: 'Basic ' + Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64'),
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: form,
});
```

**Gotcha:** the preset update API does *not* accept `width`/`height`/`crop` as
separate top-level form fields — it silently accepts the request but stores
nothing. It must be sent as a single `transformation` string. Verify it actually
took effect with a real test upload afterward (`GET .../upload_presets/{name}`
should echo back a `settings.transformation` array), don't just trust the 200
response.

Pick the cap based on your largest real display context (e.g., if your biggest
rendered image is a 1920px-wide hero, 2000px leaves headroom for 2x without
storing arbitrarily huge originals). Anything beyond that cap is pure waste.

---

## Layer 3 — One-time cleanup (if migrating an existing account/library)

Two scripts worth keeping on hand if you're cleaning up a library that predates
this pattern:

**Find unused assets** (uploaded but never referenced in your database) — walk
every text field in your DB for `res.cloudinary.com/.../upload/...` URLs,
extract the `public_id` from each, and diff against the full asset list from
Cloudinary's Admin API (`GET /resources/image`, paginated via `next_cursor`).
Anything not referenced is a deletion candidate — always spot-check a sample
against raw DB content before bulk-deleting, not just trust the diff.

**Resize already-oversized existing assets** down to your new cap, in place
(same `public_id`, so no code/DB changes needed):

```js
// Download the already-resized bytes yourself, then upload as a direct
// FILE (not a remote-URL fetch) to overwrite the original.
const resizedUrl = `https://res.cloudinary.com/${CLOUD}/image/upload/w_2000,h_2000,c_limit,q_auto/v${version}/${publicId}.${format}`;
const bytes = await (await fetch(resizedUrl)).arrayBuffer();
// ...then a signed `overwrite: true` upload with that blob as `file`.
```

**Critical gotcha:** doing this via Cloudinary's "fetch by remote URL" upload
mode (passing a URL string as `file`, having Cloudinary fetch it) hits an
aggressive, undocumented rate limit (`HTTP 420`) far sooner than a normal
direct-upload would — we burned through it after ~800 combined remote-fetch
calls in one day across a migration + this resize pass. **Download the bytes
yourself and upload them as a real file** (multipart form data, not a URL
string) — that's a completely different, much more generous rate-limit bucket,
and it's not rate-limited in any way we hit even at scale.

---

## CSS pitfalls specific to styling Cloudinary-served images

These cost real debugging time on this project and aren't Cloudinary-specific —
worth knowing before you hit them on any project with Tailwind v4 + hand-rolled
figure/caption styling:

1. **Tailwind v4 wraps utilities in CSS layers; unlayered plain CSS always wins,
   regardless of specificity.** If your `globals.css` has a plain (unlayered)
   rule touching the same property as a Tailwind utility class, the plain CSS
   wins every time, even if the utility looks "more specific." This caused real
   confusion here: a pre-existing `.prose img { margin: 0.5rem 0; }` silently
   defeated every Tailwind-based centering attempt until we found and edited that
   exact rule directly.
2. **A Tailwind class sitting directly adjacent to a template-literal
   interpolation (`` `...someClass${variable}` `` with no space) can fail to be
   picked up by Tailwind's static content scanner**, even though it renders fine
   at runtime and looks identical to every other class in the string. Always
   leave a space before `${...}` in a dynamically-built className string.
3. **`display: table` + `table-cell` + a percentage `max-width` on an image is a
   long-standing cross-browser quirk** — it can shrink the image down to a
   fraction of its real size instead of the intended "shrink-wrap to content"
   behavior. Use `width: fit-content` (modern, well-specified, no table-cell
   involved) if you need a container to shrink-wrap an image's natural width;
   pair with `contain: inline-size` on any caption/sibling text so a long
   caption sentence can't force the container wider than the image.
4. When in doubt about any of the above, **verify against a real production
   build's compiled CSS output** (`grep` the generated `.next/static/chunks/*.css`
   for your selector), not just the source file — several of these bugs produced
   source code that looked completely correct while compiling to something
   subtly different or nothing at all.

---

## Checklist for a new project

- [ ] Write `optimizeCloudinaryUrl()` / `cloudinarySrcSet()` helpers (Layer 1)
- [ ] Write the custom `next/image` loader + wire it into `next.config.ts`
- [ ] Audit every `next/image` `sizes` prop against its real rendered width
- [ ] Apply `optimizeCloudinaryUrl`/`cloudinarySrcSet` to every plain `<img>`
- [ ] Set an incoming-transformation width cap on the upload preset (Layer 2)
- [ ] Verify the preset cap with a real test upload, don't trust the API response alone
- [ ] If migrating an existing library: unused-asset audit, then resize pass (Layer 3)
- [ ] Re-check Cloudinary's usage dashboard ~1-2 weeks after shipping — usage
      stats lag by about a day, and traffic patterns need real time to settle
      before the credit number means anything
