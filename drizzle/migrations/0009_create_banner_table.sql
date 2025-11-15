-- Create banner table for managing landing page banners
CREATE TABLE `banner` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `placement` varchar(50) NOT NULL,
  `imageUrl` varchar(500) NOT NULL,
  `imageUrlMobile` varchar(500),
  `linkUrl` varchar(500),
  `altText` varchar(255),
  `heading` varchar(255),
  `subheading` text,
  `ctaText` varchar(100),
  `ctaLink` varchar(500),
  `textPosition` varchar(20) DEFAULT 'left',
  `displayOrder` int NOT NULL DEFAULT 0,
  `isActive` boolean NOT NULL DEFAULT TRUE,
  `startDate` timestamp,
  `endDate` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX `idx_banner_placement` ON `banner` (`placement`);
CREATE INDEX `idx_banner_active` ON `banner` (`isActive`);
CREATE INDEX `idx_banner_order` ON `banner` (`displayOrder`);
