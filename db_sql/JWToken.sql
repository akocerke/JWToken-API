-- Stellen sicher, dass wir die richtige Datenbank verwenden
CREATE DATABASE IF NOT EXISTS JWToken;

USE JWToken;

-- Überprüfen, ob die Tabelle 'user' existiert, und wird erstellt falls nötig
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
