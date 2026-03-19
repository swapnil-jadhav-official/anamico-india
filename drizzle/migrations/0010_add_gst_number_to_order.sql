-- Add optional GST number field to order table for shipping information
ALTER TABLE `order` ADD COLUMN `shippingGstNumber` varchar(255);
