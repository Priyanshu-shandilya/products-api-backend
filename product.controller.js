const Product = require("./product.model");
const { createError } = require("./errorHandler");
const logger = require("./logger");


const getProductOrThrow = async (id) => {
  let product;
  try {
    product = await Product.findById(id);
  } catch {
    throw createError(`'${id}' is not a valid product ID`, 400);
  }
  if (!product) throw createError("Product not found", 404);
  return product;
};


const listProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      isActive,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);

    logger.debug(`listProducts — found ${products.length}/${total} items`);

    res.json({
      status: "success",
      data: products,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await getProductOrThrow(req.params.id);
    res.json({ status: "success", data: product });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    logger.info(`Product created: ${product._id} — "${product.name}"`);
    res.status(201).json({ status: "success", data: product });
  } catch (err) {
    next(err);
  }
};

const replaceProduct = async (req, res, next) => {
  try {
    await getProductOrThrow(req.params.id);
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true, overwrite: true }
    );
    logger.info(`Product replaced: ${updated._id}`);
    res.json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    await getProductOrThrow(req.params.id);
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    logger.info(`Product patched: ${updated._id}`);
    res.json({ status: "success", data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await getProductOrThrow(req.params.id);
    await product.deleteOne();
    logger.info(`Product deleted: ${req.params.id}`);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  replaceProduct,
  updateProduct,
  deleteProduct,
};
