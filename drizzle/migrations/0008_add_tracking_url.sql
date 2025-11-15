-- Add tracking URL field to order table
ALTER TABLE `order` ADD COLUMN `trackingUrl` varchar(500);
