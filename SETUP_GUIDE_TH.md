# BATON MOTOR E-Commerce Setup Guide

## สวัสดีครับ! ผมได้สร้างโปรเจค BATON MOTOR E-Commerce เสร็จแล้ว
## ✅ อัปเดตเป็น MySQL 8.0 แล้ว!

### ที่ได้สร้างไป:

1. **NestJS Project Structure** ✓
   - พร้อมใช้งานทั้ง TypeScript configuration
   - Dependencies ทั้งหมดในไฟล์ package.json

2. **Docker Setup** ✓
   - Dockerfile สำหรับ building application
   - docker-compose.yml สำหรับ run PostgreSQL + Application

3. **PostgreSQL Database Schema** ✓
   - 11 tables ตามระบบ e-commerce ที่สมบูรณ์:
     - users (ผู้ใช้งาน)
     - categories (หมวดหมู่)
     - products (สินค้า)
     - product_images (รูปสินค้า)
     - shopping_carts (ตะกร้าสินค้า)
     - cart_items (สินค้าในตะกร้า)
     - orders (คำสั่งซื้อ)
     - order_items (สินค้าในคำสั่งซื้อ)
     - reviews (รีวิวสินค้า)
     - wishlists (รายการโปรด)
     - wishlist_items (สินค้าในรายการโปรด)

4. **TypeORM Entities** ✓
   - Entity ทั้ง 11 ตัวพร้อมสำหรับใช้กับ NestJS

5. **Configuration Files** ✓
   - .env (environment variables)
   - .env.example (template)
   - .gitignore, .prettierrc, .eslintrc

## วิธีเริ่มต้นใช้งาน (2 ขั้นตอน)

### ขั้นตอนที่ 1: เปิด Terminal และไปที่โปรเจค
```bash
cd "d:\Project database"
```

### ขั้นตอนที่ 2: เริ่ม Docker
```bash
docker-compose up -d
```

**นั่นคือทั้งหมด!** Docker จะ:
- สร้าง PostgreSQL database
- สร้าง Database ชื่อ "baton_motor"
- รัน SQL script initialization
- เตรียม NestJS application

## การใช้งาน DBeaver

### ขั้นตอนที่ 1: เปิด DBeaver

### ขั้นตอนที่ 2: สร้างการเชื่อมต่อใหม่
1. คลิก "New Database Connection"
2. เลือก MySQL → Next
3. กรอก:
   - **Server Host**: localhost
   - **Port**: 3306
   - **Database**: baton_motor
   - **Username**: baton_user
   - **Password**: baton_pass

### ขั้นตอนที่ 3: ทดสอบการเชื่อมต่อ
- คลิก "Test Connection"
- ถ้าสำเร็จ จะเห็นทั้ง 11 tables

## ตรวจสอบสถานะ

### ดูสถานะ Containers
```bash
docker-compose ps
```

### ดูสถานะ API
```bash
curl http://localhost:3000/api/health
```

หากตอบกลับมา `{"status":"ok"}` แสดงว่าสำเร็จแล้ว!

### ดูข้อมูลสินค้า
```bash
curl http://localhost:3000/api
```

## โครงสร้างไฟล์

```
Project database/
├── src/                      # Source code
│   ├── database/
│   │   └── entities/         # Database entities
│   ├── modules/              # Features (ready for development)
│   ├── common/               # Utilities
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── app.controller.ts
│   └── main.ts
├── database/
│   └── init.sql              # SQL initialization
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env
├── README.md
└── .gitignore
```

## ขั้นตอนต่อไป - สิ่งที่ต้องทำเพิ่มเติม

1. **สร้าง API Modules** (Products, Users, Orders, etc.)
2. **เพิ่ม Authentication** (JWT, Passport)
3. **สร้าง Repositories** สำหรับ Database operations
4. **สร้าง DTOs** (Data Transfer Objects)
5. **สร้าง Error Handling**
6. **สร้าง Validation**
7. **สร้าง API Documentation** (Swagger)

## ปัญหาที่อาจเกิด

### Docker ไม่เริ่ม
```bash
# ลบ containers เก่า
docker-compose down

# เริ่มใหม่
docker-compose up -d
```

### Database ไม่เชื่อมต่อ
```bash
# ดูเชื่อมต่อหรือไม่
docker-compose logs postgres
```

### Port ถูกใช้งาน
```bash
# เปลี่ยน port ใน docker-compose.yml
# แล้ว restart
docker-compose up -d
```

## สำเร็จแล้ว! 🎉

โปรเจคของคุณพร้อมแล้ว กดดำเนินการต่อได้เลยครับ!

หากต้องการเพิ่มเติมหรือมีปัญหาอะไร บอกฉันได้นะครับ!
