-- FTI E-payment Database Schema
-- MySQL Database Schema

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `FTI_E-payment`;
USE `FTI_E-payment`;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS `FTI_E-Payment_payment_details`;
DROP TABLE IF EXISTS `FTI_E-Payment_transactions`;
DROP TABLE IF EXISTS `FTI_E-Payment_payers`;
DROP TABLE IF EXISTS `FTI_E-Payment_audit_log`;

-- Corporate Customers Table (นิติบุคคล)
CREATE TABLE `FTI_E-Payment_corporate_customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_name` VARCHAR(255) NOT NULL,
    `tax_id` VARCHAR(20) NOT NULL,
    `fti_member_id` VARCHAR(50),
    `phone` VARCHAR(20),
    `email` VARCHAR(255),
    `address` TEXT NOT NULL,
    `contact_person_name` VARCHAR(255), -- ชื่อผู้ติดต่อ
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_corporate_tax_id` (`tax_id`),
    INDEX `idx_corporate_member_id` (`fti_member_id`),
    INDEX `idx_corporate_company_name` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personal Customers Table (บุคคลธรรมดา)
CREATE TABLE `FTI_E-Payment_personal_customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `tax_id` VARCHAR(20),
    `fti_member_id` VARCHAR(50),
    `phone` VARCHAR(20),
    `email` VARCHAR(255),
    `address` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_personal_tax_id` (`tax_id`),
    INDEX `idx_personal_member_id` (`fti_member_id`),
    INDEX `idx_personal_name` (`first_name`, `last_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Main Transaction Table
CREATE TABLE `FTI_E-Payment_transactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaction_reference` VARCHAR(100) UNIQUE, -- Unique reference for each payment attempt
    `invoice_number` VARCHAR(50) NOT NULL, -- Removed UNIQUE to allow multiple payments
    `customer_type` ENUM('corporate', 'personal') NOT NULL,
    `corporate_customer_id` INT NULL,
    `personal_customer_id` INT NULL,
    `others_reference` TEXT,
    `service_or_product` VARCHAR(255) NOT NULL,
    `total_amount` DECIMAL(12,2) NOT NULL,
    `currency` VARCHAR(3) DEFAULT 'THB',
    `payment_status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    `invoice_issued` BOOLEAN DEFAULT FALSE,
    `invoice_date` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`corporate_customer_id`) REFERENCES `FTI_E-Payment_corporate_customers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`personal_customer_id`) REFERENCES `FTI_E-Payment_personal_customers`(`id`) ON DELETE CASCADE,
    INDEX `idx_transaction_reference` (`transaction_reference`),
    INDEX `idx_invoice_number` (`invoice_number`), -- Regular index, not UNIQUE
    INDEX `idx_customer_type` (`customer_type`),
    INDEX `idx_payment_status` (`payment_status`),
    INDEX `idx_created_at` (`created_at`),
    CONSTRAINT `chk_customer_reference` CHECK (
        (`customer_type` = 'corporate' AND `corporate_customer_id` IS NOT NULL AND `personal_customer_id` IS NULL) OR
        (`customer_type` = 'personal' AND `personal_customer_id` IS NOT NULL AND `corporate_customer_id` IS NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Details Table (for payment method and transaction details)
CREATE TABLE `FTI_E-Payment_payment_details` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaction_id` INT NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL, -- e.g., 'credit_card', 'bank_transfer', 'promptpay', etc.
    `payment_reference` VARCHAR(255), -- payment gateway reference
    `payment_date` TIMESTAMP NULL,
    `amount_paid` DECIMAL(12,2),
    `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    `gateway_response` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`transaction_id`) REFERENCES `FTI_E-Payment_transactions`(`id`) ON DELETE CASCADE,
    INDEX `idx_transaction_id` (`transaction_id`),
    INDEX `idx_payment_reference` (`payment_reference`),
    INDEX `idx_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Log Table
CREATE TABLE `FTI_E-Payment_audit_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaction_id` INT,
    `action` VARCHAR(50) NOT NULL, -- e.g., 'created', 'updated', 'payment_completed', 'cancelled'
    `old_values` JSON,
    `new_values` JSON,
    `user_id` VARCHAR(50), -- who performed the action
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`transaction_id`) REFERENCES `FTI_E-Payment_transactions`(`id`) ON DELETE CASCADE,
    INDEX `idx_transaction_action` (`transaction_id`, `action`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
-- Corporate Customer Sample
INSERT INTO `FTI_E-Payment_corporate_customers` (
    `company_name`, `tax_id`, `fti_member_id`, `phone`, `email`, `address`, `contact_person_name`
) VALUES (
    'บริษัท ตัวอย่าง จำกัด', '1234567890123', 'FTI-001', '022345678', 'info@example.com', 
    '123 ถนนสุขุมวิท กรุงเทพฯ 10110', 'สมชาย ใจดี'
);

-- Personal Customer Sample
INSERT INTO `FTI_E-Payment_personal_customers` (
    `first_name`, `last_name`, `tax_id`, `fti_member_id`, `phone`, `email`, `address`
) VALUES (
    'มานี', 'รักดี', '9876543210987', 'FTI-002', '0823456789', 'manee@example.com', 
    '456 ถนนพระราม 4 กรุงเทพฯ 10320'
);

-- Transaction Samples
INSERT INTO `FTI_E-Payment_transactions` (
    `invoice_number`, `customer_type`, `corporate_customer_id`, `service_or_product`, `total_amount`
) VALUES (
    'INV-2025-001', 'corporate', 1, 'บริการสมาชิกประจำปี', 5000.00
);

INSERT INTO `FTI_E-Payment_transactions` (
    `invoice_number`, `customer_type`, `personal_customer_id`, `service_or_product`, `total_amount`
) VALUES (
    'INV-2025-002', 'personal', 1, 'ค่าธรรมเนียมการลงทะเบียน', 2500.00
);
