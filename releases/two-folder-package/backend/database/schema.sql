-- New installations only. Existing deployments reuse their prospects table.
CREATE TABLE IF NOT EXISTS prospects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(150) NOT NULL,
  contact VARCHAR(150) NOT NULL,
  door VARCHAR(200) NOT NULL DEFAULT '',
  msg TEXT NOT NULL,
  mode VARCHAR(20) NOT NULL DEFAULT 'person',
  situation VARCHAR(150) NULL,
  mirror_direction INT NULL,
  mirror_energy INT NULL,
  mirror_systems INT NULL,
  mirror_lowest VARCHAR(20) NULL,
  mirror_question VARCHAR(500) NULL,
  mirror_when VARCHAR(40) NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'website',
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  ip_hash CHAR(64) NOT NULL,
  email_sent TINYINT(1) NOT NULL DEFAULT 0,
  INDEX prospects_ip_received (ip_hash, received_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
