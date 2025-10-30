-- GS1 E-Payment Database Schema Update v2
-- Update tables to support new form requirements
-- Note: GS1 tables are in the same database as FTI (FTI_E-Payment)

USE `FTI_E-Payment`;

-- 1. Add first_name and last_name to GS1_corporate_customers table
ALTER TABLE `GS1_corporate_customers` 
ADD COLUMN `first_name` VARCHAR(100) NULL AFTER `address`,
ADD COLUMN `last_name` VARCHAR(100) NULL AFTER `first_name`;

-- 2. Add contact_first_name and contact_last_name to GS1_personal_customers table
ALTER TABLE `GS1_personal_customers` 
ADD COLUMN `contact_first_name` VARCHAR(100) NULL AFTER `address`,
ADD COLUMN `contact_last_name` VARCHAR(100) NULL AFTER `contact_first_name`;

-- 3. Make address nullable in both tables
ALTER TABLE `GS1_corporate_customers` 
MODIFY COLUMN `address` TEXT NULL;

ALTER TABLE `GS1_personal_customers` 
MODIFY COLUMN `address` TEXT NULL;

-- 4. Make service_or_product nullable in GS1_transactions table
ALTER TABLE `GS1_transactions` 
MODIFY COLUMN `service_or_product` VARCHAR(255) NULL;

-- 5. Add original_invoice_number field to GS1_transactions table
ALTER TABLE `GS1_transactions` 
ADD COLUMN `original_invoice_number` VARCHAR(255) NULL AFTER `invoice_number`;

-- 6. Add indexes for new fields
ALTER TABLE `GS1_corporate_customers` 
ADD INDEX `idx_corporate_contact_name` (`first_name`, `last_name`);

ALTER TABLE `GS1_personal_customers` 
ADD INDEX `idx_personal_contact_name` (`contact_first_name`, `contact_last_name`);

ALTER TABLE `GS1_transactions` 
ADD INDEX `idx_original_invoice` (`original_invoice_number`);

-- 7. Update sample data (optional)
UPDATE `GS1_corporate_customers` 
SET `first_name` = 'สมชาย', `last_name` = 'ใจดี' 
WHERE `contact_person_name` = 'สมชาย ใจดี';

UPDATE `GS1_personal_customers` 
SET `contact_first_name` = 'มานี', `contact_last_name` = 'รักดี' 
WHERE `first_name` = 'มานี' AND `last_name` = 'รักดี';

-- Show updated table structures
DESCRIBE `GS1_corporate_customers`;
DESCRIBE `GS1_personal_customers`;
DESCRIBE `GS1_transactions`;
