const mongoose = require("mongoose");

const CATEGORIES = [
  "electronics",
  "clothing",
  "food",
  "books",
  "sports",
  "home",
  "other",
];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
      lowercase: true,
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,           // allows multiple null values
      maxlength: [40, "SKU cannot exceed 40 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "A product can have at most 10 tags",
      },
    },
  },
  {
    timestamps: true,           // adds createdAt / updatedAt automatically
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
productSchema.index({ name: "text", description: "text" }); // full-text search
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });

// ── Virtual: priceFormatted ───────────────────────────────────────────────────
productSchema.virtual("priceFormatted").get(function () {
  return `$${this.price.toFixed(2)}`;
});

// ── Pre-save hook: sanitise tags ──────────────────────────────────────────────
productSchema.pre("save", function (next) {
  this.tags = [...new Set(this.tags.map((t) => t.toLowerCase().trim()))];
  next();
});

module.exports = mongoose.model("Product", productSchema);
