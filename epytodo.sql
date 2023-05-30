CREATE DATABASE IF NOT EXISTS `epytodo`;

USE `epytodo`;

CREATE TABLE IF NOT EXISTS `user`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(200) NOT NULL UNIQUE,
  `password` VARCHAR(200) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
  `firstname` VARCHAR(200) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  CONSTRAINT `id` PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `todo`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
  `due_time` DATETIME NOT NULL,
  `user_id` INT(11) NOT NULL,
  `status` ENUM('not started', 'todo', 'in progress', 'done') DEFAULT 'not started' NOT NULL,
  CONSTRAINT `todo_id` PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);
