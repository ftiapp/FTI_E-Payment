-- Update FTI E-payment Database Schema to allow multiple payments per invoice
-- Remove UNIQUE constraint from invoice_number

USE `FTI_E-payment`;

-- Remove UNIQUE constraint from invoice_number
ALTER TABLE `FTI_E-Payment_transactions` 
DROP INDEX `invoice_number`;

-- Add regular index for performance (still allows duplicates)
ALTER TABLE `FTI_E-Payment_transactions` 
ADD INDEX `idx_invoice_number` (`invoice_number`);

-- Do the same for GS1 tables
ALTER TABLE `GS1_transactions` 
DROP INDEX `invoice_number`;

ALTER TABLE `GS1_transactions` 
ADD INDEX `idx_invoice_number` (`invoice_number`);

-- Add transaction_reference to uniquely identify each payment attempt
ALTER TABLE `FTI_E-Payment_transactions` 
ADD COLUMN `transaction_reference` VARCHAR(100) UNIQUE AFTER `id`,
ADD INDEX `idx_transaction_reference` (`transaction_reference`);

ALTER TABLE `GS1_transactions` 
ADD COLUMN `transaction_reference` VARCHAR(100) UNIQUE AFTER `id`,
ADD INDEX `idx_transaction_reference` (`transaction_reference`);

-- Update existing records with unique transaction references
UPDATE `FTI_E-Payment_transactions` 
SET `transaction_reference` = CONCAT('TXN-', id, '-', UNIX_TIMESTAMP())
WHERE `transaction_reference` IS NULL;

UPDATE `GS1_transactions` 
SET `transaction_reference` = CONCAT('GS1-TXN-', id, '-', UNIX_TIMESTAMP())
WHERE `transaction_reference` IS NULL;
