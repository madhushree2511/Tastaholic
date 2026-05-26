import express from "express";
import path from "path";
import mongoose from "mongoose";
import { createServer as createViteServer } from "vite";
import { connectDB, DB } from "./src/models.js";
import Restaurant from "./models/Restaurant.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Core Express middleware for parsing JSON post bodies
  app.use(express.json());

  // 2. Connect to Database (connected with robust custom real/mock fallback)
  await connectDB();

  // 3. API REST Endpoints
  // GET /api/restaurants: Returns all restaurants
  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await DB.getRestaurants();
      res.status(200).json(restaurants);
    } catch (error: any) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  // GET /api/restaurants/search: Handles flexible fuzzy tokenized searching
  app.get("/api/restaurants/search", async (req, res) => {
    try {
      const searchTerm = (req.query.q as string) || "";
      
      // If the query is empty or whitespace-only, return all restaurants
      if (!searchTerm.trim()) {
        const allRestaurants = await DB.getRestaurants();
        return res.json(allRestaurants);
      }

      // 1. Tokenize: Split user query by spaces to search search terms individually, e.g., "masala dosa" -> ["masala", "dosa"]
      const words = searchTerm.split(" ").filter(w => w.trim() !== "");

      // Check if we are running in in-memory fallback sandbox mode
      const isMongooseDisconnected = mongoose.connection.readyState !== 1;
      
      if (isMongooseDisconnected) {
        // Safe in-memory logic when MongoDB isn't running in development Sandbox
        const allRestaurants = await DB.getRestaurants();
        const results = allRestaurants.filter((restaurant) => {
          // Verify if ALL words in the tokenized query match the restaurant's name OR cuisine
          const matchesName = words.every((word) =>
            restaurant.name.toLowerCase().includes(word.toLowerCase())
          );
          const matchesCuisine = words.every((word) =>
            restaurant.cuisine.toLowerCase().includes(word.toLowerCase())
          );
          // OR if ALL words in the query match within the name of a SINGLE item in the menu array
          const matchesMenu = restaurant.menu && restaurant.menu.some((item) =>
            words.every((word) => item.name.toLowerCase().includes(word.toLowerCase()))
          );

          return matchesName || matchesCuisine || matchesMenu;
        });
        return res.json(results);
      }

      // 2. MongoDB Production Query: Uses $or, $and, and $regex
      const query = {
        $or: [
          // Conditions must verify that ALL tokens exist within the Restaurant name field
          { $and: words.map((w) => ({ name: { $regex: w, $options: "i" } })) },
          
          // Conditions must verify that ALL tokens exist within the Restaurant cuisine field
          { $and: words.map((w) => ({ cuisine: { $regex: w, $options: "i" } })) },
          
          // CRITICAL: We query the nested menu array using $elemMatch to ensure 
          // all words in our search query match inside a SINGLE menu item's name field
          {
            menu: {
              $elemMatch: {
                $and: words.map((w) => ({ name: { $regex: w, $options: "i" } }))
              }
            }
          }
        ]
      };

      // Run query on production MongoDB model using .find()
      const results = await Restaurant.find(query as any);
      res.json(results);
    } catch (error) {
      console.error("Search API Error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // POST /api/orders: Saves a new order to the database
  app.post("/api/orders", async (req, res) => {
    try {
      const { restaurantId, items, totalAmount } = req.body;

      if (!restaurantId || !items || !Array.isArray(items) || items.length === 0 || typeof totalAmount !== "number") {
        return res.status(400).json({ error: "Missing required order parameters" });
      }

      const savedOrder = await DB.createOrder({
        restaurantId,
        items,
        totalAmount
      });

      res.status(201).json({
        success: true,
        message: "Order placed successfully!",
        order: savedOrder
      });
    } catch (error: any) {
      console.error("Error saving new order:", error);
      res.status(500).json({ error: "Server error placing order" });
    }
  });

  // POST /api/restaurants/:id/reviews: Saves a new review for a specified restaurant
  app.post("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const { userName, rating, comment } = req.body;

      if (!userName || typeof rating !== "number" || rating < 1 || rating > 5 || !comment) {
        return res.status(400).json({ error: "Missing or invalid review input fields (userName, rating 1-5, comment)" });
      }

      const freshReview = await DB.addReview(id, { userName, rating, comment });
      res.status(201).json({
        success: true,
        message: "Review added successfully!",
        review: freshReview
      });
    } catch (error: any) {
      console.error("Error saving new review:", error);
      res.status(500).json({ error: error.message || "Server error posting review" });
    }
  });

  // Simple live healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Food Delivery App Prototype" });
  });

  // 4. Vite Developer/Production Static File Middleware Routing
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Express with Active Dev-Mode Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`📦 Running Production Build Mode. Serving assets from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Food Delivery Server running successfully on http://0.0.0.0:${PORT}`);
  });
}

// Start booting up custom server
startServer().catch((err) => {
  console.error("❌ Fatal runtime server crash on startup:", err);
});