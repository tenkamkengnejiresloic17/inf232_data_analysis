CREATE TABLE `analysisReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`generatedById` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`summary` text,
	`trends` json,
	`anomalies` json,
	`statistics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysisReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `csvImports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`uploadedById` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` varchar(500),
	`rowCount` int NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `csvImports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`fieldType` enum('text','number','email','date','select','checkbox','radio','textarea') NOT NULL,
	`isRequired` boolean NOT NULL DEFAULT false,
	`options` json,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdById` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`sector` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`fieldId` int NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `formId_idx` ON `analysisReports` (`formId`);--> statement-breakpoint
CREATE INDEX `formId_idx` ON `csvImports` (`formId`);--> statement-breakpoint
CREATE INDEX `uploadedBy_idx` ON `csvImports` (`uploadedById`);--> statement-breakpoint
CREATE INDEX `formId_idx` ON `fields` (`formId`);--> statement-breakpoint
CREATE INDEX `createdBy_idx` ON `forms` (`createdById`);--> statement-breakpoint
CREATE INDEX `submissionId_idx` ON `responses` (`submissionId`);--> statement-breakpoint
CREATE INDEX `fieldId_idx` ON `responses` (`fieldId`);--> statement-breakpoint
CREATE INDEX `formId_idx` ON `submissions` (`formId`);--> statement-breakpoint
CREATE INDEX `submittedAt_idx` ON `submissions` (`submittedAt`);