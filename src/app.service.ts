import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type LoginPayload = {
  identifier: string;
  password: string;
};

type AddCartItemPayload = {
  productId: number;
  quantity?: number;
};

type CheckoutPayload = {
  userId: number;
  paymentMethod?: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
};

type CreateProductPayload = {
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  price: number;
  discountPrice?: number;
  quantityInStock?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  isFeatured?: boolean;
};

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Welcome to BATON MOTOR E-Commerce API!';
  }

  async getProducts() {
    return this.dataSource.query(
      `
      SELECT
        p.id,
        p.sku,
        p.name,
        p.description,
        p.price,
        p.discount_price AS discountPrice,
        p.quantity_in_stock AS quantityInStock,
        p.image_url AS imageUrl,
        p.thumbnail_url AS thumbnailUrl,
        p.rating,
        p.review_count AS reviewCount,
        p.is_featured AS isFeatured,
        c.name AS category
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = 1
      ORDER BY p.is_featured DESC, p.created_at DESC
      `,
    );
  }

  async createProduct(payload: CreateProductPayload) {
    const sku = String(payload.sku || '').trim();
    const name = String(payload.name || '').trim();
    const price = Number(payload.price);

    if (!sku || !name || Number.isNaN(price) || price <= 0) {
      throw new BadRequestException('sku, name and valid price are required');
    }

    const duplicate = await this.dataSource.query(`SELECT id FROM products WHERE sku = ? LIMIT 1`, [sku]);
    if (duplicate.length > 0) {
      throw new BadRequestException('SKU already exists');
    }

    let categoryId = payload.categoryId ? Number(payload.categoryId) : 0;
    if (!categoryId && payload.categoryName) {
      const byName = await this.dataSource.query(`SELECT id FROM categories WHERE name = ? LIMIT 1`, [payload.categoryName]);
      if (byName.length > 0) {
        categoryId = Number(byName[0].id);
      }
    }

    if (!categoryId) {
      const fallback = await this.dataSource.query(`SELECT id FROM categories ORDER BY id ASC LIMIT 1`);
      if (fallback.length === 0) {
        throw new BadRequestException('No category found. Create category first');
      }
      categoryId = Number(fallback[0].id);
    }

    await this.dataSource.query(
      `
      INSERT INTO products (
        sku, name, description, category_id, price, discount_price,
        quantity_in_stock, image_url, thumbnail_url, is_active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `,
      [
        sku,
        name,
        payload.description || null,
        categoryId,
        price,
        payload.discountPrice ?? null,
        payload.quantityInStock ?? 0,
        payload.imageUrl || null,
        payload.thumbnailUrl || null,
        payload.isFeatured ? 1 : 0,
      ],
    );

    const created = await this.dataSource.query(
      `
      SELECT
        p.id,
        p.sku,
        p.name,
        p.price,
        p.quantity_in_stock AS quantityInStock,
        c.name AS category
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.sku = ?
      LIMIT 1
      `,
      [sku],
    );

    return created[0];
  }

  async register(payload: RegisterPayload) {
    const existing = await this.dataSource.query(
      `SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1`,
      [payload.email, payload.username],
    );

    if (existing.length > 0) {
      throw new BadRequestException('Email or username already exists');
    }

    await this.dataSource.query(
      `
      INSERT INTO users (email, username, password, first_name, last_name, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 'customer', 1)
      `,
      [
        payload.email,
        payload.username,
        payload.password,
        payload.firstName || null,
        payload.lastName || null,
        payload.phone || null,
      ],
    );

    const created = await this.dataSource.query(
      `SELECT id, email, username, first_name AS firstName, last_name AS lastName, phone FROM users WHERE email = ? LIMIT 1`,
      [payload.email],
    );

    return created[0];
  }

  async login(payload: LoginPayload) {
    const rows = await this.dataSource.query(
      `SELECT id, email, username, password, role FROM users WHERE email = ? OR username = ? LIMIT 1`,
      [payload.identifier, payload.identifier],
    );

    if (rows.length === 0 || rows[0].password !== payload.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = rows[0];
    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async getOrCreateDemoUser() {
    const existing = await this.dataSource.query(
      `SELECT id, email, username FROM users WHERE email = 'demo@batonmotor.com' LIMIT 1`,
    );

    if (existing.length > 0) {
      return { userId: Number(existing[0].id), email: existing[0].email, username: existing[0].username };
    }

    await this.dataSource.query(
      `
      INSERT INTO users (email, username, password, first_name, last_name, phone, role, is_active)
      VALUES ('demo@batonmotor.com', 'demo_user', 'password', 'Demo', 'User', '0812345678', 'customer', 1)
      `,
    );

    const created = await this.dataSource.query(
      `SELECT id, email, username FROM users WHERE email = 'demo@batonmotor.com' LIMIT 1`,
    );

    return { userId: Number(created[0].id), email: created[0].email, username: created[0].username };
  }

  async getCartByUserId(userId: number) {
    const cartId = await this.ensureCart(userId);
    const items = await this.dataSource.query(
      `
      SELECT
        ci.id,
        ci.product_id AS productId,
        p.name,
        p.image_url AS imageUrl,
        ci.quantity,
        ci.unit_price AS unitPrice,
        ci.subtotal
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.id DESC
      `,
      [cartId],
    );

    const summary = await this.dataSource.query(
      `SELECT COALESCE(SUM(quantity), 0) AS totalItems, COALESCE(SUM(subtotal), 0) AS totalPrice FROM cart_items WHERE cart_id = ?`,
      [cartId],
    );

    return {
      cartId,
      items,
      totalItems: Number(summary[0].totalItems),
      totalPrice: Number(summary[0].totalPrice),
    };
  }

  async addCartItem(userId: number, payload: AddCartItemPayload) {
    const quantity = Math.max(1, Number(payload.quantity || 1));
    const cartId = await this.ensureCart(userId);

    const products = await this.dataSource.query(
      `SELECT id, price, quantity_in_stock AS quantityInStock FROM products WHERE id = ? AND is_active = 1 LIMIT 1`,
      [payload.productId],
    );

    if (products.length === 0) {
      throw new BadRequestException('Product not found');
    }

    const product = products[0];
    if (Number(product.quantityInStock) < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const existing = await this.dataSource.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1`,
      [cartId, payload.productId],
    );

    if (existing.length > 0) {
      const nextQty = Number(existing[0].quantity) + quantity;
      await this.dataSource.query(
        `UPDATE cart_items SET quantity = ?, unit_price = ?, subtotal = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [nextQty, product.price, Number(product.price) * nextQty, existing[0].id],
      );
    } else {
      await this.dataSource.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`,
        [cartId, payload.productId, quantity, product.price, Number(product.price) * quantity],
      );
    }

    await this.syncCartSummary(cartId);
    return this.getCartByUserId(userId);
  }

  async checkout(payload: CheckoutPayload) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const cartId = await this.ensureCart(payload.userId);
      const items = await runner.query(
        `SELECT product_id AS productId, quantity, unit_price AS unitPrice, subtotal FROM cart_items WHERE cart_id = ?`,
        [cartId],
      );

      if (items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.subtotal), 0);
      const taxAmount = 0;
      const shippingCost = 0;
      const totalAmount = subtotal + taxAmount + shippingCost;
      const orderNumber = `ORD-${Date.now()}`;

      const result = await runner.query(
        `
        INSERT INTO orders (
          order_number, user_id, status, payment_method, payment_status,
          shipping_address, shipping_city, shipping_postal_code, shipping_country,
          subtotal, tax_amount, shipping_cost, total_amount
        ) VALUES (?, ?, 'pending', ?, 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderNumber,
          payload.userId,
          payload.paymentMethod || 'card',
          payload.shippingAddress,
          payload.shippingCity || null,
          payload.shippingPostalCode || null,
          payload.shippingCountry || null,
          subtotal,
          taxAmount,
          shippingCost,
          totalAmount,
        ],
      );

      const orderId = result.insertId;

      for (const item of items) {
        await runner.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.unitPrice, item.subtotal],
        );
      }

      await runner.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
      await runner.query(`UPDATE shopping_carts SET total_items = 0, total_price = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [cartId]);

      await runner.commitTransaction();
      return { orderId, orderNumber, totalAmount };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  private async ensureCart(userId: number): Promise<number> {
    const carts = await this.dataSource.query(`SELECT id FROM shopping_carts WHERE user_id = ? LIMIT 1`, [userId]);

    if (carts.length > 0) {
      return Number(carts[0].id);
    }

    const result = await this.dataSource.query(
      `INSERT INTO shopping_carts (user_id, total_items, total_price) VALUES (?, 0, 0)`,
      [userId],
    );

    return Number(result.insertId);
  }

  private async syncCartSummary(cartId: number): Promise<void> {
    const summary = await this.dataSource.query(
      `SELECT COALESCE(SUM(quantity), 0) AS totalItems, COALESCE(SUM(subtotal), 0) AS totalPrice FROM cart_items WHERE cart_id = ?`,
      [cartId],
    );

    await this.dataSource.query(
      `UPDATE shopping_carts SET total_items = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [Number(summary[0].totalItems), Number(summary[0].totalPrice), cartId],
    );
  }
}
