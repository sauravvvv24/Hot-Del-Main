// controllers/cartController.js
import Cart from '../models/Cart.js';

export const addToCart = async (req, res) => {
  const { hotelId, productId } = req.body;

  try {
    let cart = await Cart.findOne({ hotelId });

    if (!cart) {
      cart = new Cart({ hotelId, items: [{ productId, quantity: 1 }] });
    } else {
      const item = cart.items.find(i => i.productId.toString() === productId);
      if (item) {
        item.quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

export const getCart = async (req, res) => {
  try {
    console.log('Fetching cart for hotelId:', req.params.hotelId);
    
    const cart = await Cart.findOne({ hotelId: req.params.hotelId }).populate({
      path: 'items.productId',
      model: 'Product',
      populate: {
        path: 'seller',
        model: 'User',
        select: 'businessName email phone address'
      }
    });
    
    console.log('Found cart:', cart);
    
    if (!cart) {
      console.log('No cart found, returning empty items');
      return res.status(200).json({ items: [] });
    }

    // Filter out items with null/undefined products and transform the data
    const transformedItems = cart.items
      .filter(item => {
        if (!item.productId) {
          console.log('Filtering out item with null/undefined product:', item);
          return false;
        }
        return true;
      })
      .map(item => {
        console.log('Processing cart item:', item);
        console.log('Product data:', item.productId);
        
        // Ensure product has all required fields
        const product = item.productId;
        if (!product.name || !product.price) {
          console.log('Product missing required fields:', product);
        }
        
        return {
          product: {
            _id: product._id,
            name: product.name || 'Unknown Product',
            brand: product.brand || 'Unknown Brand',
            category: product.category || 'Unknown Category',
            price: product.price || 0,
            image: product.image || null,
            unit: product.unit || null,
            stock: product.stock || 0,
            description: product.description || '',
            seller: product.seller || null
          },
          quantity: item.quantity,
          _id: item._id
        };
      });

    // Clean up cart by removing items with invalid products
    if (transformedItems.length !== cart.items.length) {
      cart.items = cart.items.filter(item => item.productId);
      await cart.save();
      console.log('Cleaned up cart by removing invalid items');
    }

    console.log('Transformed items:', transformedItems);
    res.status(200).json({ items: transformedItems });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

export const updateCartItem = async (req, res) => {
  const { hotelId, productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ hotelId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ error: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
};

export const removeFromCart = async (req, res) => {
  const { hotelId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ hotelId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
};
