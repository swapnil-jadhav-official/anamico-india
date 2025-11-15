-- Add tracking and shipping details fields to order table
ALTER TABLE `order` ADD COLUMN `trackingNumber` varchar(255);
ALTER TABLE `order` ADD COLUMN `shippingCarrier` varchar(255);
ALTER TABLE `order` ADD COLUMN `shippedAt` timestamp;
ALTER TABLE `order` ADD COLUMN `deliveredAt` timestamp;
