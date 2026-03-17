-- BATON MOTOR: DBeaver starter SQL
-- Connection target DB: db-1

USE `db-1`;

-- 1) Quick health checks
SELECT NOW() AS server_time;
SELECT DATABASE() AS current_db;
SHOW TABLES;

-- 2) Seed base categories (idempotent)
INSERT INTO categories (name, description, image_url, is_active)
VALUES
  ('Sedan', 'รถยนต์นั่งขนาดกลาง', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d', 1),
  ('SUV', 'รถอเนกประสงค์', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c', 1),
  ('Motorcycle', 'รถจักรยานยนต์', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39', 1)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  image_url = VALUES(image_url),
  is_active = VALUES(is_active);

-- 3) Seed sample products (safe re-run by SKU)
INSERT INTO products (
  sku, name, description, category_id, price, discount_price,
  quantity_in_stock, image_url, thumbnail_url, is_active, is_featured
)
SELECT * FROM (
  SELECT 'CAR-CRV-2024' AS sku, 'Honda CR-V 2024' AS name,
         'SUV ครอบครัว ขับนุ่ม ประหยัด' AS description,
         (SELECT id FROM categories WHERE name = 'SUV' LIMIT 1) AS category_id,
         1299000.00 AS price, 1249000.00 AS discount_price,
         12 AS quantity_in_stock,
         'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7' AS image_url,
         'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400' AS thumbnail_url,
         1 AS is_active, 1 AS is_featured
  UNION ALL
  SELECT 'CAR-CIVIC-2024', 'Honda Civic 2024',
         'Sedan ดีไซน์สปอร์ต ประหยัดน้ำมัน',
         (SELECT id FROM categories WHERE name = 'Sedan' LIMIT 1),
         999000.00, 959000.00,
         15,
         'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
         'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
         1, 1
  UNION ALL
  SELECT 'MOTO-CB500X', 'Honda CB500X',
         'มอเตอร์ไซค์ทัวร์ริ่งยอดนิยม',
         (SELECT id FROM categories WHERE name = 'Motorcycle' LIMIT 1),
         224900.00, 214900.00,
         20,
         'https://images.unsplash.com/photo-1558981806-ec527fa84c39',
         'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400',
         1, 0
) AS seed
WHERE seed.category_id IS NOT NULL
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  category_id = VALUES(category_id),
  price = VALUES(price),
  discount_price = VALUES(discount_price),
  quantity_in_stock = VALUES(quantity_in_stock),
  image_url = VALUES(image_url),
  thumbnail_url = VALUES(thumbnail_url),
  is_active = VALUES(is_active),
  is_featured = VALUES(is_featured);

-- 4) Create test user (password is plain text for demo only)
INSERT INTO users (
  email, username, password, first_name, last_name, phone, role, is_active
)
VALUES (
  'demo@batonmotor.com', 'demo_user', 'password', 'Demo', 'User', '0812345678', 'customer', 1
)
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  phone = VALUES(phone),
  is_active = VALUES(is_active);

-- 5) Create cart for demo user if not exists
INSERT INTO shopping_carts (user_id, total_items, total_price)
SELECT u.id, 0, 0
FROM users u
LEFT JOIN shopping_carts c ON c.user_id = u.id
WHERE u.email = 'demo@batonmotor.com' AND c.id IS NULL;

-- 6) Helpful query: product list for frontend
SELECT
  p.id,
  p.sku,
  p.name,
  c.name AS category,
  p.price,
  p.discount_price,
  p.quantity_in_stock,
  p.is_featured,
  p.rating,
  p.review_count
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.is_active = 1
ORDER BY p.is_featured DESC, p.created_at DESC;

-- 7) Helpful query: stock summary by category
SELECT
  c.name AS category,
  COUNT(*) AS product_count,
  SUM(p.quantity_in_stock) AS total_stock,
  ROUND(AVG(p.price), 2) AS avg_price
FROM products p
JOIN categories c ON c.id = p.category_id
GROUP BY c.name
ORDER BY product_count DESC;
