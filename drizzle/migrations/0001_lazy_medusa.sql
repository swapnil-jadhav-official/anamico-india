ALTER TABLE `user` ADD `phone` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `address` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `role` varchar(255) DEFAULT 'user' NOT NULL;