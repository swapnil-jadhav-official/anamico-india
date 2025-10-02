export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
  inStock: boolean
  featured?: boolean
  badge?: string
}

export const products: Product[] = [
  // Biometric Devices
  {
    id: "mantra-mfs110",
    name: "Mantra MFS 110 Single Finger Scanner",
    description: "USB Single Fingerprint Scanner - UIDAI Certified",
    price: 2999,
    originalPrice: 3499,
    image: "/mantra-fingerprint-scanner.jpg",
    category: "biometric",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    featured: true,
    badge: "Best Seller",
  },
  {
    id: "morpho-mso1300",
    name: "Morpho MSO 1300 E3 Fingerprint Scanner",
    description: "High-quality USB fingerprint device for Aadhaar",
    price: 2999,
    originalPrice: 3299,
    image: "/morpho-biometric-device.jpg",
    category: "biometric",
    rating: 4.7,
    reviews: 256,
    inStock: true,
    featured: true,
  },
  {
    id: "startek-fm220u",
    name: "Startek FM 220u Fingerprint Scanner",
    description: "Compact USB fingerprint reader",
    price: 2849,
    image: "/startek-fingerprint-device.jpg",
    category: "biometric",
    rating: 4.3,
    reviews: 89,
    inStock: true,
  },
  {
    id: "cogent-csd200",
    name: "Cogent CSD200 Single Finger Scanner",
    description: "Professional grade fingerprint scanner",
    price: 3899,
    image: "/cogent-fingerprint-scanner.jpg",
    category: "biometric",
    rating: 4.6,
    reviews: 145,
    inStock: true,
  },
  {
    id: "aratek-a600",
    name: "Aratek A600 Biometric Scanner",
    description: "Advanced fingerprint authentication device",
    price: 3999,
    image: "/aratek-biometric-scanner.jpg",
    category: "biometric",
    rating: 4.8,
    reviews: 203,
    inStock: true,
    featured: true,
  },
  {
    id: "cmitech-bmt20",
    name: "CMITech BMT 20 Dual Iris Scanner",
    description: "USB Dual IRIS Scanner - UIDAI Certified",
    price: 19999,
    originalPrice: 22999,
    image: "/iris-scanner-biometric.jpg",
    category: "biometric",
    rating: 4.9,
    reviews: 67,
    inStock: true,
    badge: "Premium",
  },
  {
    id: "mantra-mis100",
    name: "Mantra MIS100 V2 Single Iris Scanner",
    description: "Compact USB single iris authentication device",
    price: 13999,
    image: "/iris-scanner-device.jpg",
    category: "biometric",
    rating: 4.4,
    reviews: 92,
    inStock: true,
  },
  {
    id: "thales-cs500f",
    name: "Thales Cogent CS500F Fingerprint Scanner",
    description: "Enterprise-grade biometric scanner",
    price: 10999,
    image: "/thales-fingerprint-scanner.jpg",
    category: "biometric",
    rating: 4.7,
    reviews: 134,
    inStock: true,
  },
  // Electronics
  {
    id: "logitech-c270",
    name: "Logitech C270 HD Webcam",
    description: "720p HD video calling camera",
    price: 1899,
    image: "/logitech-webcam.jpg",
    category: "electronics",
    rating: 4.2,
    reviews: 456,
    inStock: true,
  },
  {
    id: "logitech-c525",
    name: "Logitech C525 HD Webcam",
    description: "Portable HD 720p video calling with autofocus",
    price: 3899,
    image: "/logitech-c525-webcam.jpg",
    category: "electronics",
    rating: 4.5,
    reviews: 289,
    inStock: true,
  },
  // Printers
  {
    id: "evolis-primacy",
    name: "Evolis Primacy Card Printer",
    description: "Professional ID card printer with encoding",
    price: 89999,
    image: "/evolis-card-printer.jpg",
    category: "printers",
    rating: 4.8,
    reviews: 45,
    inStock: true,
    badge: "Professional",
  },
  {
    id: "zebra-zxp3",
    name: "Zebra ZXP Series 3 Card Printer",
    description: "Reliable card printing solution",
    price: 65999,
    image: "/zebra-card-printer.jpg",
    category: "printers",
    rating: 4.6,
    reviews: 78,
    inStock: true,
  },
  {
    id: "honeywell-pc42t",
    name: "Honeywell PC42T Thermal Printer",
    description: "Desktop thermal transfer printer",
    price: 12999,
    image: "/thermal-printer.jpg",
    category: "printers",
    rating: 4.4,
    reviews: 156,
    inStock: true,
  },
  // Barcode Readers
  {
    id: "honeywell-orbit",
    name: "Honeywell Orbit 7120 Barcode Scanner",
    description: "Omnidirectional laser scanner",
    price: 8999,
    image: "/barcode-scanner.png",
    category: "electronics",
    rating: 4.7,
    reviews: 234,
    inStock: true,
  },
  {
    id: "honeywell-voyager",
    name: "Honeywell Voyager 1250G Barcode Scanner",
    description: "Single-line laser barcode scanner",
    price: 6999,
    image: "/handheld-barcode-scanner.jpg",
    category: "electronics",
    rating: 4.5,
    reviews: 189,
    inStock: true,
  },
  // GPS Devices
  {
    id: "gp-receiver-bu353",
    name: "GP Receiver BU 353 S4 GPS Device",
    description: "USB GPS receiver for Aadhaar enrollment",
    price: 2549,
    image: "/gps-receiver-device.jpg",
    category: "electronics",
    rating: 4.3,
    reviews: 167,
    inStock: true,
  },
  // Surveillance
  {
    id: "dome-camera-2mp",
    name: "2MP Dome CCTV Camera",
    description: "Indoor/outdoor surveillance camera",
    price: 1899,
    image: "/dome-cctv-camera.jpg",
    category: "surveillance",
    rating: 4.4,
    reviews: 312,
    inStock: true,
  },
  {
    id: "bullet-camera-4mp",
    name: "4MP Bullet CCTV Camera",
    description: "High-resolution outdoor camera",
    price: 2999,
    image: "/bullet-cctv-camera.jpg",
    category: "surveillance",
    rating: 4.6,
    reviews: 278,
    inStock: true,
  },
  {
    id: "dvr-8channel",
    name: "8 Channel DVR System",
    description: "Digital video recorder for CCTV",
    price: 8999,
    image: "/dvr-system.jpg",
    category: "surveillance",
    rating: 4.5,
    reviews: 145,
    inStock: true,
  },
  // Networking
  {
    id: "tp-link-router",
    name: "TP-Link Wireless Router",
    description: "Dual-band WiFi router",
    price: 1499,
    image: "/wifi-router.jpg",
    category: "networking",
    rating: 4.3,
    reviews: 567,
    inStock: true,
  },
  {
    id: "cisco-switch-24port",
    name: "Cisco 24-Port Gigabit Switch",
    description: "Managed network switch",
    price: 15999,
    image: "/network-switch.png",
    category: "networking",
    rating: 4.8,
    reviews: 89,
    inStock: true,
  },
]

export function getProductsByCategory(category?: string): Product[] {
  if (!category) return products
  return products.filter((p) => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}
