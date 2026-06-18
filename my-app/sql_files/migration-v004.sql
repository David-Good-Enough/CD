USE ynov_ci;

CREATE TABLE IF NOT EXISTS admin_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

INSERT INTO admin_user (username, password)
VALUES ('admin', 'admin123')
ON DUPLICATE KEY UPDATE username = username;
