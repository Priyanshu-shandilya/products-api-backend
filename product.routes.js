const { Router } = require("express");
const ctrl = require("./product.controller");
const { protect } = require("./auth.middleware");
const {
  createProductValidator,
  replaceProductValidator,
  updateProductValidator,
  listProductsValidator,
} = require("./validators");

const router = Router();

// Public routes
router.get("/", listProductsValidator, ctrl.listProducts);
router.get("/:id", ctrl.getProduct);

// Protected routes (login required)
router.post("/", protect, createProductValidator, ctrl.createProduct);
router.put("/:id", protect, replaceProductValidator, ctrl.replaceProduct);
router.patch("/:id", protect, updateProductValidator, ctrl.updateProduct);
router.delete("/:id", protect, ctrl.deleteProduct);

module.exports = router;