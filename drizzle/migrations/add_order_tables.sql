-- Create order table
CREATE TABLE IF NOT EXISTS `order` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `userId` varchar(255) NOT NULL,
  `orderNumber` varchar(255) NOT NULL UNIQUE,
  `subtotal` int NOT NULL,
  `tax` int NOT NULL,
  `total` int NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `paymentStatus` varchar(255) NOT NULL DEFAULT 'pending',
  `paymentMethod` varchar(255),
  `paymentId` varchar(255),
  `shippingName` varchar(255) NOT NULL,
  `shippingEmail` varchar(255) NOT NULL,
  `shippingPhone` varchar(255) NOT NULL,
  `shippingAddress` text NOT NULL,
  `shippingCity` varchar(255) NOT NULL,
  `shippingState` varchar(255) NOT NULL,
  `shippingPincode` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE
);

-- Create orderItem table
CREATE TABLE IF NOT EXISTS `orderItem` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `orderId` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT
);

-- Create index on userId for faster lookups
CREATE INDEX idx_order_userId ON `order`(`userId`);
CREATE INDEX idx_orderItem_orderId ON `orderItem`(`orderId`);
