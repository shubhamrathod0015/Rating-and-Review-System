import express from "express";
import { setupMiddleware } from "./middleware/index.middleware.js";
import reviewRoutes from "./routes/reviews.routes.js";
import productRoutes from "./routes/product.routes.js";
import errorHandler from "./middleware/errorHandler.middleware.js";

const app = express();

setupMiddleware(app);

app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

app.use(errorHandler);

export default app;
