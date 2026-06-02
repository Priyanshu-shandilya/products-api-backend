const { body, query, validationResult } = require("express-validator");
const { createError } = require("./errorHandler");

/** Run accumulated express-validator checks and short-circuit on failure */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return res.status(422).json({ status: "fail", message: "Validation failed", errors });
  }
  next();
};

// ── Reusable field rules ───────────────────────────────────────────────────────
const CATEGORIES = ["electronics", "clothing", "food", "books", "sports", "home", "other"];

const productRules = {
  name: body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Name must be between 2 and 120 characters"),

  nameRequired: body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Name must be between 2 and 120 characters"),

  description: body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  price: body("price")
    .notEmpty()
    .withMessage("price is required")
    .isFloat({ min: 0 })
    .withMessage("price must be a non-negative number"),

  stock: body("stock")
    .notEmpty()
    .withMessage("stock is required")
    .isInt({ min: 0 })
    .withMessage("stock must be a non-negative integer"),

  category: body("category")
    .notEmpty()
    .withMessage("category is required")
    .toLowerCase()
    .isIn(CATEGORIES)
    .withMessage(`category must be one of: ${CATEGORIES.join(", ")}`),

  sku: body("sku")
    .optional()
    .trim()
    .toUpperCase()
    .isLength({ max: 40 })
    .withMessage("SKU cannot exceed 40 characters"),

  isActive: body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  tags: body("tags")
    .optional()
    .isArray({ max: 10 })
    .withMessage("tags must be an array with at most 10 items"),
};

// ── Composed validators ───────────────────────────────────────────────────────

/** POST /products */
const createProductValidator = [
  productRules.nameRequired,
  productRules.description,
  productRules.price,
  productRules.stock,
  productRules.category,
  productRules.sku,
  productRules.isActive,
  productRules.tags,
  validate,
];

/** PUT /products/:id  (full replace — all required fields) */
const replaceProductValidator = [
  productRules.nameRequired,
  productRules.description,
  productRules.price,
  productRules.stock,
  productRules.category,
  productRules.sku,
  productRules.isActive,
  productRules.tags,
  validate,
];

/** PATCH /products/:id  (partial update — all fields optional) */
const updateProductValidator = [
  productRules.name,
  productRules.description,
  body("price").optional().isFloat({ min: 0 }).withMessage("price must be a non-negative number"),
  body("stock").optional().isInt({ min: 0 }).withMessage("stock must be a non-negative integer"),
  body("category").optional().toLowerCase().isIn(CATEGORIES)
    .withMessage(`category must be one of: ${CATEGORIES.join(", ")}`),
  productRules.sku,
  productRules.isActive,
  productRules.tags,
  validate,
];

/** Query-string rules for GET /products */
const listProductsValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be non-negative"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be non-negative"),
  query("category").optional().toLowerCase().isIn(CATEGORIES)
    .withMessage(`category must be one of: ${CATEGORIES.join(", ")}`),
  validate,
];

module.exports = {
  createProductValidator,
  replaceProductValidator,
  updateProductValidator,
  listProductsValidator,
};
