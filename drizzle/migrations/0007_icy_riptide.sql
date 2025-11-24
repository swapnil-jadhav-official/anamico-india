CREATE TABLE `banner` (
	`id` varchar(255) NOT NULL,
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
	`isActive` boolean NOT NULL DEFAULT true,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `banner_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cartItem` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`productId` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`price` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItem_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faq` (
	`id` varchar(255) NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` varchar(100),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faq_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`orderNumber` varchar(255) NOT NULL,
	`subtotal` int NOT NULL,
	`tax` int NOT NULL,
	`total` int NOT NULL,
	`paidAmount` int NOT NULL DEFAULT 0,
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`paymentStatus` varchar(255) NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(255),
	`paymentId` varchar(255),
	`adminNotes` text,
	`rejectionReason` text,
	`shippingName` varchar(255) NOT NULL,
	`shippingEmail` varchar(255) NOT NULL,
	`shippingPhone` varchar(255) NOT NULL,
	`shippingAddress` text NOT NULL,
	`shippingCity` varchar(255) NOT NULL,
	`shippingState` varchar(255) NOT NULL,
	`shippingPincode` varchar(255) NOT NULL,
	`trackingNumber` varchar(255),
	`shippingCarrier` varchar(255),
	`trackingUrl` varchar(500),
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_id` PRIMARY KEY(`id`),
	CONSTRAINT `order_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `orderItem` (
	`id` varchar(255) NOT NULL,
	`orderId` varchar(255) NOT NULL,
	`productId` varchar(255) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItem_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rdServiceRegistration` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`registrationNumber` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`mobile` varchar(20) NOT NULL,
	`address` text NOT NULL,
	`state` varchar(255) NOT NULL,
	`district` varchar(255) NOT NULL,
	`pincode` varchar(10) NOT NULL,
	`deviceName` varchar(255) NOT NULL,
	`deviceModel` varchar(255) NOT NULL,
	`serialNumber` varchar(255) NOT NULL,
	`gstNumber` varchar(255),
	`rdSupport` varchar(10) NOT NULL,
	`amcSupport` varchar(50),
	`callbackService` boolean NOT NULL DEFAULT false,
	`deliveryType` varchar(20) NOT NULL,
	`deviceFee` int NOT NULL,
	`supportFee` int NOT NULL,
	`deliveryFee` int NOT NULL,
	`subtotal` int NOT NULL,
	`gst` int NOT NULL,
	`total` int NOT NULL,
	`paidAmount` int NOT NULL DEFAULT 0,
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`paymentStatus` varchar(255) NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(255),
	`paymentId` varchar(255),
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rdServiceRegistration_id` PRIMARY KEY(`id`),
	CONSTRAINT `rdServiceRegistration_registrationNumber_unique` UNIQUE(`registrationNumber`)
);
--> statement-breakpoint
CREATE TABLE `supportTicket` (
	`id` varchar(255) NOT NULL,
	`ticketNumber` varchar(255) NOT NULL,
	`userId` varchar(255),
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`message` text NOT NULL,
	`category` varchar(100),
	`priority` varchar(20) NOT NULL DEFAULT 'medium',
	`status` varchar(50) NOT NULL DEFAULT 'open',
	`assignedTo` varchar(255),
	`adminNotes` text,
	`resolution` text,
	`resolvedAt` timestamp,
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTicket_id` PRIMARY KEY(`id`),
	CONSTRAINT `supportTicket_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
ALTER TABLE `product` ADD `galleryImages` text;--> statement-breakpoint
ALTER TABLE `cartItem` ADD CONSTRAINT `cartItem_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cartItem` ADD CONSTRAINT `cartItem_productId_product_id_fk` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderItem` ADD CONSTRAINT `orderItem_orderId_order_id_fk` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orderItem` ADD CONSTRAINT `orderItem_productId_product_id_fk` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rdServiceRegistration` ADD CONSTRAINT `rdServiceRegistration_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supportTicket` ADD CONSTRAINT `supportTicket_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supportTicket` ADD CONSTRAINT `supportTicket_assignedTo_user_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;