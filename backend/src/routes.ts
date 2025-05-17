import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertReviewSchema, insertOrderSchema, insertOrderItemSchema, insertHwidLogSchema } from "../shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Products routes
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug/products', async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const products = await storage.getProductsByCategory(category.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching category products:", error);
      res.status(500).json({ message: "Failed to fetch category products" });
    }
  });

  // Reviews routes
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const reviews = await storage.getReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: fromZodError(error).message });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Orders routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }

      const items = await storage.getOrderItems(orderId);

      res.json({
        ...order,
        items
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderSchema = insertOrderSchema.parse({
        ...req.body,
        userId
      });

      // Create the order
      const order = await storage.createOrder(orderSchema);

      // Add order items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const orderItem = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id
          });
          await storage.addOrderItem(orderItem);
        }
      }

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: fromZodError(error).message });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // HWID routes
  app.post('/api/hwid/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { hwid } = req.body;

      if (!hwid) {
        return res.status(400).json({ message: "HWID is required" });
      }

      const user = await storage.updateUserHwid(userId, hwid);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error registering HWID:", error);
      res.status(500).json({ message: "Failed to register HWID" });
    }
  });

  app.post('/api/hwid/activate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertHwidLogSchema.parse({
        ...req.body,
        userId,
        status: 'active'
      });

      // Validate that the user owns the product first
      const order = await storage.getOrdersByUser(userId);
      const orderItems = await Promise.all(
        order.map(o => storage.getOrderItems(o.id))
      );
      const allItems = orderItems.flat();

      const hasProduct = allItems.some(item => item.productId === logData.productId);

      if (!hasProduct) {
        return res.status(403).json({ message: "You do not own this product" });
      }

      const log = await storage.logHwidActivation(logData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid HWID data", errors: fromZodError(error).message });
      }
      console.error("Error activating HWID:", error);
      res.status(500).json({ message: "Failed to activate HWID" });
    }
  });

  app.post('/api/hwid/validate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { hwid, productId } = req.body;

      if (!hwid || !productId) {
        return res.status(400).json({ message: "HWID and productId are required" });
      }

      const isValid = await storage.validateHwid(userId, hwid, productId);

      res.json({ valid: isValid });
    } catch (error) {
      console.error("Error validating HWID:", error);
      res.status(500).json({ message: "Failed to validate HWID" });
    }
  });

  // Game Accounts routes
  app.get('/api/accounts', async (req, res) => {
    try {
      const accounts = await storage.getGameAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post('/api/accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Assuming insertGameAccountSchema is defined elsewhere and imported
      const accountData = insertGameAccountSchema.parse({
        ...req.body,
        userId
      });

      const account = await storage.createGameAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating account listing:", error);
      res.status(500).json({ message: "Failed to create account listing" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}