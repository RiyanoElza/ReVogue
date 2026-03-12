-- phpMyAdmin SQL Dump
-- version 5.2.1
-- Database: `revogue_db`
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS revogue_db;
USE revogue_db;

-- Table structure for table `Users`
CREATE TABLE `Users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `Products`
CREATE TABLE `Products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('available','sold') NOT NULL DEFAULT 'available',
  `date_added` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `Cart`
CREATE TABLE `Cart` (
  `cart_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`cart_id`),
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `Cart_Items`
CREATE TABLE `Cart_Items` (
  `cart_item_id` int(11) NOT NULL AUTO_INCREMENT,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`cart_item_id`),
  FOREIGN KEY (`cart_id`) REFERENCES `Cart`(`cart_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `Products`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for table `Orders`
CREATE TABLE `Orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`order_id`),
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert Dummy Data for Users
INSERT INTO `Users` (`name`, `email`, `password`, `phone`, `address`) VALUES
('Alice Smith', 'alice@example.com', 'password123', '123-456-7890', '123 Fashion Ave, NY'),
('Bob Jones', 'bob@example.com', 'password123', '987-654-3210', '456 Vintage St, CA');

-- Insert Dummy Data for Products
INSERT INTO `Products` (`user_id`, `name`, `description`, `price`, `category`, `image`, `status`) VALUES
(1, 'Vintage Leather Jacket', 'Authentic 90s leather jacket in mint condition.', 120.00, 'Clothing', 'jacket.jpg', 'available'),
(2, 'Antique Oak Table', 'Solid oak coffee table perfect for modern homes.', 85.50, 'Furniture', 'table.jpg', 'available'),
(1, 'Sony DSLR Camera', 'Minimal usage, comes with two lenses and a bag.', 450.00, 'Electronics', 'camera.jpg', 'available');

-- Insert Dummy Data for Cart
INSERT INTO `Cart` (`cart_id`, `user_id`) VALUES (1, 1);

-- Insert Dummy Data for Cart_Items
INSERT INTO `Cart_Items` (`cart_id`, `product_id`, `quantity`) VALUES (1, 2, 1);
