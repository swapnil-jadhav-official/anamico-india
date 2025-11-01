import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";
import crypto from "crypto";

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_DATABASE,
  password: process.env.DATABASE_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = drizzle(pool, { schema, mode: "default" });
const { product } = schema;

interface SeedProduct {
  name: string;
  brand: string;
  category: string;
  description: string;
  features: string[];
  regularPrice: number;
  salePrice: number;
  sku: string;
  stock: number;
  availability: string;
  technicalSpecifications: { key: string; value: string }[];
  hardwareSpecifications: { key: string; value: string }[];
}

const dummyImageUrls = {
  biometric: [
    "https://images.unsplash.com/photo-1635897845135-e73e7b5f842a?w=800&q=80",
    "https://images.unsplash.com/photo-1633356030464-f96e75e36a11?w=800&q=80",
    "https://images.unsplash.com/photo-1634821054834-29dc8382b645?w=800&q=80",
  ],
  computers: [
    "https://images.unsplash.com/photo-1588872657840-218e86e742ba?w=800&q=80",
    "https://images.unsplash.com/photo-1603468620905-8de1a3a23932?w=800&q=80",
  ],
  networking: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1636132523562-81c11efcc69d?w=800&q=80",
  ],
  printers: [
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
  ],
  electronics: [
    "https://images.unsplash.com/photo-1578926078328-123456789012?w=800&q=80",
    "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80",
  ],
  surveillance: [
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
  ],
  software: [
    "https://images.unsplash.com/photo-1633356030464-f96e75e36a11?w=800&q=80",
  ],
};

const seedProducts: SeedProduct[] = [
  {
    name: "Biometric Fingerprint Scanner Pro",
    brand: "SecureID",
    category: "biometric",
    description: "Professional-grade fingerprint scanner with advanced optical sensors for accurate biometric authentication. Ideal for government and enterprise applications.",
    features: [
      "UIDAI Certified for Aadhaar authentication",
      "High-quality optical sensor for 500 DPI resolution",
      "USB 2.0 plug-and-play connectivity",
      "Compatible with Windows, Linux, and Android",
      "Durable stainless steel construction",
      "Fast capture speed (< 0.5 seconds)",
    ],
    regularPrice: 4500,
    salePrice: 3990,
    sku: "BIO-FP-001",
    stock: 45,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Resolution", value: "500 DPI" },
      { key: "Interface", value: "USB 2.0" },
      { key: "Capture Time", value: "< 0.5 seconds" },
      { key: "FAR (False Accept Rate)", value: "0.01%" },
      { key: "FRR (False Reject Rate)", value: "1%" },
      { key: "Operating Voltage", value: "5V DC" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "66 x 66 x 38 mm" },
      { key: "Weight", value: "150g" },
      { key: "Sensor Type", value: "Optical" },
      { key: "Material", value: "Stainless Steel" },
      { key: "Operating Temperature", value: "-10°C to 60°C" },
      { key: "Storage Temperature", value: "-20°C to 70°C" },
    ],
  },
  {
    name: "Iris Recognition System Enterprise",
    brand: "IrisTech",
    category: "biometric",
    description: "Advanced iris recognition technology for high-security applications. Provides non-intrusive biometric authentication with minimal false positive rates.",
    features: [
      "Non-intrusive iris capture technology",
      "Working distance: 10-100 cm",
      "Capture time: < 1 second",
      "Enterprise-grade accuracy",
      "Multi-spectral imaging",
      "Live capture detection",
    ],
    regularPrice: 12000,
    salePrice: 9999,
    sku: "BIO-IRIS-001",
    stock: 15,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Working Distance", value: "10-100 cm" },
      { key: "Capture Speed", value: "< 1 second" },
      { key: "Image Quality", value: "ISO/IEC 19794-6" },
      { key: "Accuracy", value: "99.99%" },
      { key: "Anti-spoofing", value: "Live Capture Detection" },
      { key: "Database Size", value: "100,000+ templates" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "240 x 180 x 150 mm" },
      { key: "Weight", value: "2.5 kg" },
      { key: "Power Consumption", value: "30W" },
      { key: "Connectivity", value: "USB 3.0, Ethernet" },
      { key: "Operating Temperature", value: "0°C to 45°C" },
      { key: "LED Illumination", value: "Multi-spectral" },
    ],
  },
  {
    name: "Face Recognition Door Lock System",
    brand: "SmartSecure",
    category: "biometric",
    description: "Intelligent door lock system with facial recognition technology. Perfect for offices, homes, and secure facilities.",
    features: [
      "1080p HD camera with night vision",
      "Real-time face detection and recognition",
      "Mask detection capability",
      "Temperature screening enabled",
      "Cloud connectivity",
      "Emergency bypass options",
    ],
    regularPrice: 8500,
    salePrice: 7200,
    sku: "BIO-FACE-001",
    stock: 28,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Camera Resolution", value: "1080p HD" },
      { key: "Recognition Accuracy", value: "99.5%" },
      { key: "Processing Time", value: "< 0.3 seconds" },
      { key: "Night Vision Range", value: "Up to 3 meters" },
      { key: "Temperature Accuracy", value: "±0.3°C" },
      { key: "Network Connectivity", value: "WiFi 5GHz/2.4GHz" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "185 x 110 x 25 mm" },
      { key: "Weight", value: "450g" },
      { key: "Power Supply", value: "AC 100-240V or DC 12V" },
      { key: "Battery Backup", value: "5000mAh" },
      { key: "Storage", value: "32GB onboard" },
      { key: "Operating Humidity", value: "10%-80% RH" },
    ],
  },
  {
    name: "Industrial Desktop Computer i7",
    brand: "TechPro",
    category: "computers",
    description: "Powerful industrial-grade desktop computer with Intel i7 processor. Designed for heavy computing tasks and enterprise applications.",
    features: [
      "Intel Core i7 (11th Gen) processor",
      "32GB DDR4 RAM",
      "512GB NVMe SSD",
      "Dedicated Graphics Card",
      "Multiple connectivity ports",
      "24/7 continuous operation capability",
    ],
    regularPrice: 65000,
    salePrice: 55000,
    sku: "COMP-DESK-I7-001",
    stock: 12,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Processor", value: "Intel Core i7-11700K" },
      { key: "RAM", value: "32GB DDR4 3200MHz" },
      { key: "Storage", value: "512GB NVMe SSD" },
      { key: "GPU", value: "NVIDIA RTX 3060 12GB" },
      { key: "Display Support", value: "Triple 4K monitors" },
      { key: "Power Consumption", value: "650W" },
    ],
    hardwareSpecifications: [
      { key: "Form Factor", value: "Mini Tower" },
      { key: "Dimensions", value: "380 x 170 x 340 mm" },
      { key: "Weight", value: "8.5 kg" },
      { key: "Ports", value: "4x USB 3.1, 2x USB-C, HDMI, DP" },
      { key: "Cooling", value: "Liquid Cooling" },
      { key: "Warranty", value: "3 Years Onsite" },
    ],
  },
  {
    name: "Laptop Core i5 Gaming Edition",
    brand: "GameDrive",
    category: "computers",
    description: "High-performance gaming laptop with Intel i5 processor and dedicated graphics. Ideal for gaming, design, and development work.",
    features: [
      "Intel Core i5 11th Generation",
      "RTX 3050 Graphics Card",
      "15.6 inch Full HD IPS Display",
      "144Hz Refresh Rate",
      "RGB Mechanical Keyboard",
      "Advanced Cooling System",
    ],
    regularPrice: 72000,
    salePrice: 59999,
    sku: "COMP-LAP-I5-001",
    stock: 20,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Processor", value: "Intel Core i5-11400H" },
      { key: "RAM", value: "16GB DDR4" },
      { key: "Storage", value: "512GB NVMe SSD" },
      { key: "Display", value: "15.6 inch FHD 144Hz" },
      { key: "Graphics", value: "NVIDIA RTX 3050" },
      { key: "Battery", value: "6 Cell 56Wh" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "359 x 254 x 19.9 mm" },
      { key: "Weight", value: "2.3 kg" },
      { key: "Keyboard", value: "RGB Mechanical" },
      { key: "Touchpad", value: "Glass Precision" },
      { key: "Ports", value: "2x USB-C, 3x USB 3.1, HDMI" },
      { key: "Operating System", value: "Windows 11 Pro" },
    ],
  },
  {
    name: "Network Switch Gigabit 48-Port",
    brand: "NetConnect",
    category: "networking",
    description: "Enterprise-class managed network switch with 48 gigabit ports. Designed for large-scale network deployments.",
    features: [
      "48 x 10/100/1000 Base-T Ports",
      "Layer 3 Managed Switch",
      "QoS support for voice and video",
      "VLAN support up to 4094",
      "Advanced security features",
      "Redundant power supplies",
    ],
    regularPrice: 45000,
    salePrice: 38500,
    sku: "NET-SWITCH-48-001",
    stock: 8,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Ports", value: "48 x 1Gbps Ethernet" },
      { key: "Uplink Ports", value: "4 x 10Gbps" },
      { key: "Switching Capacity", value: "960 Gbps" },
      { key: "Packet Forwarding Rate", value: "720 Mpps" },
      { key: "Memory", value: "32MB Buffer" },
      { key: "Management", value: "CLI, Web, SNMP" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "440 x 330 x 44 mm" },
      { key: "Weight", value: "4.2 kg" },
      { key: "Power Consumption", value: "120W" },
      { key: "Cooling", value: "3 x Fans" },
      { key: "Operating Temp", value: "0°C to 45°C" },
      { key: "Mounting", value: "19 inch Rack Mount" },
    ],
  },
  {
    name: "Wireless Access Point WiFi 6",
    brand: "NetWave",
    category: "networking",
    description: "Next-generation WiFi 6 access point with dual-band support. Provides high-speed wireless connectivity for enterprise networks.",
    features: [
      "WiFi 6 (802.11ax) technology",
      "Dual-band 2.4GHz and 5GHz",
      "Speed up to 1200 Mbps",
      "OFDMA technology",
      "Multi-client support (up to 256)",
      "PoE powered",
    ],
    regularPrice: 8000,
    salePrice: 6800,
    sku: "NET-AP-WIFI6-001",
    stock: 35,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "WiFi Standard", value: "802.11ax WiFi 6" },
      { key: "Data Rate", value: "1200 Mbps" },
      { key: "Bands", value: "2.4GHz & 5GHz Dual-Band" },
      { key: "Coverage Area", value: "200 sqm" },
      { key: "Connected Devices", value: "256+" },
      { key: "Security", value: "WPA3" },
    ],
    hardwareSpecifications: [
      { key: "Antenna", value: "4x4 MIMO" },
      { key: "Dimensions", value: "165 x 165 x 28 mm" },
      { key: "Weight", value: "280g" },
      { key: "Power Supply", value: "PoE 802.3at/bt" },
      { key: "Operating Temp", value: "0°C to 40°C" },
      { key: "Certifications", value: "FCC, CE, IC" },
    ],
  },
  {
    name: "Laser Printer A4 Color High-Volume",
    brand: "PrintMax",
    category: "printers",
    description: "Professional color laser printer designed for high-volume printing. Perfect for busy office environments.",
    features: [
      "Print speed: 33 ppm (color & B&W)",
      "Max monthly volume: 100,000 pages",
      "1200 x 1200 dpi print resolution",
      "250-sheet input tray",
      "Network printing support",
      "Automatic duplex printing",
    ],
    regularPrice: 28000,
    salePrice: 23500,
    sku: "PRINT-LASER-A4-001",
    stock: 14,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Print Speed", value: "33 ppm (Color & B&W)" },
      { key: "Resolution", value: "1200 x 1200 dpi" },
      { key: "Monthly Volume", value: "100,000 pages" },
      { key: "First Print Time", value: "6.5 seconds" },
      { key: "Color Output", value: "Full Color" },
      { key: "Connectivity", value: "Gigabit Ethernet, USB" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "455 x 430 x 390 mm" },
      { key: "Weight", value: "32 kg" },
      { key: "Input Tray", value: "250 sheets (A4)" },
      { key: "Output Tray", value: "150 sheets" },
      { key: "Power Consumption", value: "1.5kW" },
      { key: "Noise Level", value: "68 dB" },
    ],
  },
  {
    name: "Barcode Scanner 2D Desktop",
    brand: "ScanTech",
    category: "electronics",
    description: "Professional 2D barcode and QR code scanner with auto-trigger capability. Ideal for retail and inventory management.",
    features: [
      "2D barcode and QR code reading",
      "Auto-trigger scanning",
      "100 scans per second",
      "IP67 rated (dustproof & waterproof)",
      "Plug and play USB connection",
      "Multi-barcode recognition",
    ],
    regularPrice: 3500,
    salePrice: 2990,
    sku: "ELEC-SCAN-2D-001",
    stock: 50,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Barcode Types", value: "1D/2D/QR Code" },
      { key: "Scan Speed", value: "100 scans/sec" },
      { key: "Reading Distance", value: "5-35 cm" },
      { key: "Interface", value: "USB, RS232, Keyboard" },
      { key: "Resolution", value: "1280 x 960" },
      { key: "Auto-Trigger Range", value: "Adjustable" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "110 x 110 x 115 mm" },
      { key: "Weight", value: "420g" },
      { key: "IP Rating", value: "IP67" },
      { key: "Operating Temp", value: "0°C to 50°C" },
      { key: "Light Source", value: "Red LED" },
      { key: "Warranty", value: "2 Years" },
    ],
  },
  {
    name: "Thermal Imaging Camera IR",
    brand: "ThermalVision",
    category: "electronics",
    description: "Advanced thermal imaging camera for building inspection and preventive maintenance. Detects heat loss and electrical faults.",
    features: [
      "Thermal resolution: 160x120 pixels",
      "Temperature range: -20°C to 250°C",
      "JPEG image recording",
      "Real-time thermal display",
      "USB data transfer",
      "Compact and portable design",
    ],
    regularPrice: 22000,
    salePrice: 18500,
    sku: "ELEC-THERMAL-IR-001",
    stock: 9,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Thermal Resolution", value: "160x120 pixels" },
      { key: "Temperature Range", value: "-20°C to 250°C" },
      { key: "Accuracy", value: "±2°C or ±2%" },
      { key: "Image Format", value: "JPEG" },
      { key: "Recording", value: "Built-in Memory 8GB" },
      { key: "Display", value: "2.4 inch LCD" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "130 x 90 x 50 mm" },
      { key: "Weight", value: "350g" },
      { key: "Lens", value: "Standard 25° FOV" },
      { key: "Power Source", value: "4x AA Batteries" },
      { key: "Operating Time", value: "4 hours" },
      { key: "IP Rating", value: "IP54" },
    ],
  },
  {
    name: "Surveillance Camera Dome Network",
    brand: "SecureEye",
    category: "surveillance",
    description: "Network dome camera with infrared night vision. Suitable for indoor surveillance in offices and retail stores.",
    features: [
      "1080p Full HD resolution",
      "IR Night Vision (up to 15m)",
      "Motorized zoom (4x optical)",
      "IP67 weatherproof rating",
      "H.264 video compression",
      "Cloud storage compatible",
    ],
    regularPrice: 6500,
    salePrice: 5400,
    sku: "SURV-DOME-NET-001",
    stock: 25,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Resolution", value: "1920 x 1080p" },
      { key: "Sensor", value: "1/3 inch CMOS" },
      { key: "Frame Rate", value: "30 fps" },
      { key: "Lens", value: "4x Motorized Zoom" },
      { key: "Night Vision", value: "IR up to 15m" },
      { key: "Compression", value: "H.264" },
    ],
    hardwareSpecifications: [
      { key: "Dimensions", value: "200 x 200 x 145 mm" },
      { key: "Weight", value: "580g" },
      { key: "IP Rating", value: "IP67" },
      { key: "Power Supply", value: "PoE 95W" },
      { key: "Operating Temp", value: "-10°C to 50°C" },
      { key: "Mounting", value: "Ceiling/Wall Bracket" },
    ],
  },
  {
    name: "Business Software License Suite",
    brand: "CorporateTech",
    category: "software",
    description: "Comprehensive business software suite including office, accounting, and project management tools. One-time license for 5 users.",
    features: [
      "Office applications (Word, Excel, PowerPoint)",
      "Accounting software with GST compliance",
      "Project management tools",
      "Document management system",
      "Employee HR module",
      "Dashboard and reporting",
    ],
    regularPrice: 15000,
    salePrice: 12000,
    sku: "SOFT-SUITE-BIZ-001",
    stock: 40,
    availability: "in-stock",
    technicalSpecifications: [
      { key: "Users", value: "5 Licenses" },
      { key: "Modules", value: "6 Core Modules" },
      { key: "Updates", value: "1 Year Free" },
      { key: "Support", value: "Email & Phone" },
      { key: "Compliance", value: "GST, TDS Ready" },
      { key: "Storage", value: "50GB Cloud" },
    ],
    hardwareSpecifications: [
      { key: "Installation", value: "Cloud-based" },
      { key: "Browsers", value: "Chrome, Firefox, Safari" },
      { key: "Minimum RAM", value: "4GB" },
      { key: "Internet", value: "Broadband Required" },
      { key: "Backup", value: "Daily Automated" },
      { key: "Training", value: "Included" },
    ],
  },
];

function getRandomImageUrl(category: string): string {
  const categoryUrls = dummyImageUrls[category as keyof typeof dummyImageUrls] || dummyImageUrls.computers;
  return categoryUrls[Math.floor(Math.random() * categoryUrls.length)];
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting to seed products...");

    for (const prod of seedProducts) {
      const imageUrl = getRandomImageUrl(prod.category);

      const newProduct = await db.insert(product).values({
        id: crypto.randomUUID(),
        name: prod.name,
        brand: prod.brand,
        category: prod.category,
        description: prod.description,
        features: JSON.stringify(prod.features),
        regularPrice: prod.regularPrice,
        salePrice: prod.salePrice,
        sku: prod.sku,
        stock: prod.stock,
        availability: prod.availability,
        technicalSpecifications: JSON.stringify(prod.technicalSpecifications),
        hardwareSpecifications: JSON.stringify(prod.hardwareSpecifications),
        options: JSON.stringify([]),
        price: prod.regularPrice,
        imageUrl: imageUrl,
        galleryImages: JSON.stringify([]),
        isActive: true,
      });

      console.log(`✅ Created: ${prod.name}`);
    }

    console.log(`\n🎉 Successfully seeded ${seedProducts.length} products!`);
    console.log("🖼️ Note: Each product has a dummy image. You can replace with real images in admin panel.");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
