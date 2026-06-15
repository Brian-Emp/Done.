SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database : `Done.`
--
DROP DATABASE IF EXISTS `Done.`;
CREATE DATABASE IF NOT EXISTS `Done.` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `Done.`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `lists`;

-- Structure of the `users` table
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Structure of the `lists` table
CREATE TABLE `lists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Structure of the `tasks` table

CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  `list_id` int NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Trigger to mandatory add a 'general' list for each new user
DELIMITER $$
CREATE TRIGGER after_user_insert
AFTER INSERT ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `lists` (name, user_id) VALUES ('📌 Général', NEW.id);
END$$
DELIMITER ;

-- Dumping data 
INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`) VALUES
(1, 'Brian', 'brian.empereur@icloud.com', '$2y$10$9pxIu5dnGNsoHQ9TPQ50IekunfE1C3uQ/0bVYP/SeExkdweyY0xk6', '2026-06-11 12:00:00');
INSERT INTO `lists` (`id`, `name`, `user_id`) VALUES
(2, '🔒 Perso', 1),
(3, '💼 Travail', 1),
(4, '🎉 Projets', 1),
(5, '📚 Études', 1);
INSERT INTO `tasks` (`id`, `title`, `is_completed`, `created_at`, `user_id`, `list_id`) VALUES
(1, 'Terminer le projet Done.', 0, '2026-06-11 12:00:00', 1, 1),
(2, 'Faire les courses', 0, '2026-06-11 13:00:00', 1, 2),
(3, 'Appeler le plombier', 1, '2026-06-11 14:00:00', 1, 2),
(4, 'Planifier les vacances', 0, '2026-06-11 15:00:00', 1, 2);

COMMIT;