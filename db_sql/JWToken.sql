-- Lösche DB
-- DROP DATABASE JWToken;

-- Stellen Sie sicher, dass wir die richtige Datenbank verwenden
CREATE DATABASE IF NOT EXISTS JWToken;
USE JWToken;

-- Überprüfen Sie, ob die Tabelle 'user' existiert, und erstellen Sie sie falls nötig
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image_path VARCHAR(255) DEFAULT NULL
);

SELECT * FROM user;