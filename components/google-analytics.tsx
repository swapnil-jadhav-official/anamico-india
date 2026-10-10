'use client'

import Script from 'next/script'

export function GoogleAnalytics() {
  // TODO: Get GA4 Measurement ID from client
  // Replace 'G-XXXXXXXXXX' with actual measurement ID
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

  // Don't render if no GA ID is configured
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}

// Custom event tracking helper
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, eventParams)
  }
}

// E-commerce event helpers
export const trackProductView = (product: {
  id: string
  name: string
  price: number
  category: string
}) => {
  trackEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      },
    ],
  })
}

export const trackAddToCart = (product: {
  id: string
  name: string
  price: number
  category: string
  quantity: number
}) => {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: product.quantity,
      },
    ],
  })
}

export const trackPurchase = (
  orderId: string,
  total: number,
  items: Array<{
    id: string
    name: string
    price: number
    category: string
    quantity: number
  }>
) => {
  trackEvent('purchase', {
    transaction_id: orderId,
    value: total,
    currency: 'INR',
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
    })),
  })
}
