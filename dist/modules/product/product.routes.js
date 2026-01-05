import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { ProductController } from "./product.controller.js";
import { ProductDatabase } from "./product.database.js";
import { ProductService } from "./product.service.js";
const router = Router();
const db = new ProductDatabase();
const service = new ProductService(db);
const controller = new ProductController(service);
// Get all products (public)
router.get("/", controller.list);
// Get product by id (public)
router.get("/:id", controller.getById);
// Create product (admin only)
router.post("/", requireAuth, requireRole("admin"), controller.create);
// Update product (admin only)
router.put("/:id", requireAuth, requireRole("admin"), controller.update);
// Delete product (admin only)
router.delete("/:id", requireAuth, requireRole("admin"), controller.delete);
export { router as productRouters };
//# sourceMappingURL=product.routes.js.map