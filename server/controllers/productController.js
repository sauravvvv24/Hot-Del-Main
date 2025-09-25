import Product from '../models/Product.js';
import { PRODUCT_CATEGORIES } from '../models/Product.js';

// @desc    Get all products (with optional filtering/search)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, sortBy, order, featured, limit } = req.query;

    let filter = { isActive: true };
    
    if (search) {
      // Search across multiple fields
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    let query = Product.find(filter).sort(sort);
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const products = await query;
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { sortBy, order, limit } = req.query;

    if (!PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    let query = Product.find({ 
      category: category, 
      isActive: true 
    }).sort(sort);

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const products = await query;
    res.json(products);
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    console.log('getCategories function called');
    
    // Get categories with product counts
    const categoriesWithCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('Categories with counts:', categoriesWithCounts);

    const categories = PRODUCT_CATEGORIES.map(category => {
      const found = categoriesWithCounts.find(c => c._id === category);
      return {
        name: category,
        count: found ? found.count : 0
      };
    });

    console.log('Final categories:', categories);
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ 
      featured: true, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.json(products);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller)
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, image, stock, unit, brand, featured, isActive, outOfStock } = req.body;

    // Validate required fields
    if (!name || !price || !description || !category) {
      return res.status(400).json({ error: 'Name, price, description, and category are required' });
    }

    if (!PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Ensure boolean values are properly handled
    const featuredBool = Boolean(featured);
    const isActiveBool = isActive !== undefined ? Boolean(isActive) : true;
    const outOfStockBool = Boolean(outOfStock);

    console.log('Creating product with data:', {
      name,
      price,
      description,
      category,
      image,
      stock,
      unit,
      brand,
      featured: featuredBool,
      isActive: isActiveBool,
      outOfStock: outOfStockBool,
      seller: req.user.id
    });

    const product = new Product({
      name,
      price: parseFloat(price),
      description,
      category,
      image: image || '',
      stock: parseInt(stock) || 0,
      unit: unit || '1 piece',
      brand: brand || 'Generic',
      featured: featuredBool,
      isActive: isActiveBool,
      outOfStock: outOfStockBool,
      seller: req.user.id
    });

    const savedProduct = await product.save();
    console.log('Product saved successfully:', savedProduct);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, image, stock, featured, isActive, outOfStock } = req.body;

    if (category && !PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Ensure boolean values are properly handled
    const updateData = {
      name,
      price: parseFloat(price),
      description,
      category,
      image,
      stock: parseInt(stock) || 0,
      featured: Boolean(featured),
      isActive: Boolean(isActive),
      outOfStock: Boolean(outOfStock)
    };

    console.log('Updating product with data:', updateData);

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// @desc    Delete a product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (Seller)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// @desc    Get products by seller
// @route   GET /api/products/mine
// @access  Private (Seller)
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      seller: req.user.id
    }).sort({ createdAt: -1 });

    console.log('Fetching products for seller:', req.user.id);
    console.log('Found products:', products.length);
    console.log('Products with featured status:', products.map(p => ({ 
      id: p._id, 
      name: p.name, 
      featured: p.featured, 
      isActive: p.isActive, 
      outOfStock: p.outOfStock 
    })));

    res.json(products);
  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).populate('seller', 'name email businessName phone address');
    
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
