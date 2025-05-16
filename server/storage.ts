import {
  type User,
  type UpsertUser,
  type Product,
  type Category,
  type InsertCategory,
  type InsertProduct,
  type Review,
  type InsertReview,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type HwidLog,
  type InsertHwidLog
} from "@shared/schema";
import { db } from "./db";

// Interface for storage operations
export interface IStorage {
  // Game Accounts operations
  getGameAccounts(): Promise<GameAccount[]>;
  createGameAccount(account: InsertGameAccount): Promise<GameAccount>;
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserHwid(userId: string, hwid: string): Promise<User | undefined>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Review operations
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Order operations
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // HWID operations
  logHwidActivation(log: InsertHwidLog): Promise<HwidLog>;
  getHwidActivations(userId: string): Promise<HwidLog[]>;
  validateHwid(userId: string, hwid: string, productId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const users = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id)
    });
    return users.length > 0 ? users[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    return users.length > 0 ? users[0] : undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Verificar se o usuário já existe
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      // Atualizar usuário existente
      const updatedUser = await sql`
        UPDATE users
        SET 
          email = COALESCE(${userData.email}, email),
          first_name = COALESCE(${userData.firstName}, first_name),
          last_name = COALESCE(${userData.lastName}, last_name),
          profile_image_url = COALESCE(${userData.profileImageUrl}, profile_image_url),
          updated_at = NOW()
        WHERE id = ${userData.id}
        RETURNING *
      `;
      return updatedUser[0];
    } else {
      // Criar novo usuário
      const newUser = await sql`
        INSERT INTO users (
          id, email, first_name, last_name, profile_image_url, role
        ) VALUES (
          ${userData.id}, 
          ${userData.email}, 
          ${userData.firstName}, 
          ${userData.lastName}, 
          ${userData.profileImageUrl},
          'user'
        )
        RETURNING *
      `;
      return newUser[0];
    }
  }

  async updateUserHwid(userId: string, hwid: string): Promise<User | undefined> {
    const updatedUser = await sql`
      UPDATE users
      SET hwid = ${hwid}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `;
    return updatedUser.length > 0 ? updatedUser[0] : undefined;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return sql`SELECT * FROM products WHERE is_active = true`;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return sql`
      SELECT * FROM products 
      WHERE is_active = true AND category_id = ${categoryId}
    `;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const products = await sql`
      SELECT * FROM products 
      WHERE is_active = true AND slug = ${slug}
      LIMIT 1
    `;
    return products.length > 0 ? products[0] : undefined;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const products = await sql`
      SELECT * FROM products 
      WHERE id = ${id}
      LIMIT 1
    `;
    return products.length > 0 ? products[0] : undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = await sql`
      INSERT INTO products (
        name, slug, description, short_description, price, 
        category_id, features, image_url, is_bestseller, is_active
      ) VALUES (
        ${product.name}, 
        ${product.slug}, 
        ${product.description}, 
        ${product.shortDescription}, 
        ${product.price}, 
        ${product.categoryId},
        ${JSON.stringify(product.features)}, 
        ${product.imageUrl}, 
        ${product.isBestseller}, 
        ${product.isActive}
      )
      RETURNING *
    `;
    return newProduct[0];
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    // Construir consulta dinâmica
    const updateFields = [];
    const values: any[] = [];
    
    if (product.name !== undefined) {
      updateFields.push('name = $' + (values.length + 1));
      values.push(product.name);
    }
    
    if (product.description !== undefined) {
      updateFields.push('description = $' + (values.length + 1));
      values.push(product.description);
    }
    
    if (product.shortDescription !== undefined) {
      updateFields.push('short_description = $' + (values.length + 1));
      values.push(product.shortDescription);
    }
    
    if (product.price !== undefined) {
      updateFields.push('price = $' + (values.length + 1));
      values.push(product.price);
    }
    
    if (product.categoryId !== undefined) {
      updateFields.push('category_id = $' + (values.length + 1));
      values.push(product.categoryId);
    }
    
    if (product.features !== undefined) {
      updateFields.push('features = $' + (values.length + 1));
      values.push(JSON.stringify(product.features));
    }
    
    if (product.imageUrl !== undefined) {
      updateFields.push('image_url = $' + (values.length + 1));
      values.push(product.imageUrl);
    }
    
    if (product.isBestseller !== undefined) {
      updateFields.push('is_bestseller = $' + (values.length + 1));
      values.push(product.isBestseller);
    }
    
    if (product.isActive !== undefined) {
      updateFields.push('is_active = $' + (values.length + 1));
      values.push(product.isActive);
    }
    
    // Adicionar updated_at
    updateFields.push('updated_at = NOW()');
    
    if (updateFields.length === 0) {
      // Nada para atualizar
      return this.getProductById(id);
    }
    
    // Atualizar produto
    const queryText = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
    
    values.push(id);
    
    const updatedProduct = await sql.unsafe(queryText, ...values);
    return updatedProduct.length > 0 ? updatedProduct[0] : undefined;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return sql`SELECT * FROM categories ORDER BY name`;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const categories = await sql`
      SELECT * FROM categories 
      WHERE slug = ${slug}
      LIMIT 1
    `;
    return categories.length > 0 ? categories[0] : undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = await sql`
      INSERT INTO categories (name, slug)
      VALUES (${category.name}, ${category.slug})
      RETURNING *
    `;
    return newCategory[0];
  }

  // Review operations
  async getReviews(productId: number): Promise<Review[]> {
    return sql`
      SELECT * FROM reviews
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const newReview = await sql`
      INSERT INTO reviews (
        user_id, product_id, rating, comment
      ) VALUES (
        ${review.userId}, 
        ${review.productId}, 
        ${review.rating}, 
        ${review.comment}
      )
      RETURNING *
    `;
    return newReview[0];
  }

  // Order operations
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return sql`
      SELECT * FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const orders = await sql`
      SELECT * FROM orders
      WHERE id = ${id}
      LIMIT 1
    `;
    return orders.length > 0 ? orders[0] : undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder = await sql`
      INSERT INTO orders (
        user_id, status, total, payment_method
      ) VALUES (
        ${order.userId}, 
        ${order.status}, 
        ${order.total}, 
        ${order.paymentMethod}
      )
      RETURNING *
    `;
    return newOrder[0];
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const newOrderItem = await sql`
      INSERT INTO order_items (
        order_id, product_id, quantity, price
      ) VALUES (
        ${orderItem.orderId}, 
        ${orderItem.productId}, 
        ${orderItem.quantity}, 
        ${orderItem.price}
      )
      RETURNING *
    `;
    return newOrderItem[0];
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return sql`
      SELECT * FROM order_items
      WHERE order_id = ${orderId}
    `;
  }

  // HWID operations
  async logHwidActivation(log: InsertHwidLog): Promise<HwidLog> {
    const newLog = await sql`
      INSERT INTO hwid_logs (
        user_id, product_id, hwid, status, ip_address
      ) VALUES (
        ${log.userId}, 
        ${log.productId}, 
        ${log.hwid}, 
        ${log.status}, 
        ${log.ipAddress}
      )
      RETURNING *
    `;
    return newLog[0];
  }

  async getHwidActivations(userId: string): Promise<HwidLog[]> {
    return sql`
      SELECT * FROM hwid_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  async validateHwid(userId: string, hwid: string, productId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || user.hwid !== hwid) {
      return false;
    }
    
    const activations = await sql`
      SELECT * FROM hwid_logs
      WHERE 
        user_id = ${userId} AND
        product_id = ${productId} AND
        status = 'active'
      LIMIT 1
    `;
    
    return activations.length > 0;
  }

  // Game Accounts operations
  async getGameAccounts(): Promise<GameAccount[]> {
    return sql`
      SELECT * FROM game_accounts 
      WHERE status = 'available'
      ORDER BY created_at DESC
    `;
  }

  async createGameAccount(account: InsertGameAccount): Promise<GameAccount> {
    const newAccount = await sql`
      INSERT INTO game_accounts (
        user_id, title, description, game, price, image_url
      ) VALUES (
        ${account.userId},
        ${account.title},
        ${account.description},
        ${account.game},
        ${account.price},
        ${account.imageUrl}
      )
      RETURNING *
    `;
    return newAccount[0];
  }
}

export const storage = new DatabaseStorage();
