// src/pages/AddProduct.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PRODUCT_CATEGORIES } from '../constants/categories.js';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  Upload, 
  Link, 
  DollarSign, 
  Hash, 
  FileText, 
  Tag, 
  Layers, 
  Star, 
  Save, 
  Eye,
  Camera,
  CheckCircle,
  Image as ImageIcon,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import BackButton from '../components/BackButton';

const AddProduct = ({ editMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    stock: '',
    unit: '',
    brand: '',
    featured: false,
    isActive: true,
    outOfStock: false
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'

  useEffect(() => {
    if (editMode && id) {
      setLoading(true);
      axios.get(`http://localhost:3000/api/products/${id}`)
        .then(res => {
          setForm({
            ...res.data,
            price: res.data.price || '',
            stock: res.data.stock || '',
            featured: res.data.featured || false,
            isActive: res.data.isActive !== undefined ? res.data.isActive : true,
            outOfStock: res.data.outOfStock || false,
          });
        })
        .catch(() => toast.error('Failed to load product.'))
        .finally(() => setLoading(false));
    }
  }, [editMode, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Form field changed: ${name} = ${type === 'checkbox' ? checked : value}`);
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
    if (method === 'url') {
      setImageFile(null);
      setImagePreview('');
    } else {
      setForm(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }
      let imageUrl = form.image;
      
      // If file upload is selected and a file is chosen
      if (uploadMethod === 'file' && imageFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
          // Upload image first
          const uploadResponse = await axios.post('http://localhost:3000/api/upload/image', formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
          });
          imageUrl = uploadResponse.data.imageUrl;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.error('Failed to upload image. Please try again.');
          return;
        }
      }

      const productData = {
        ...form,
        image: imageUrl,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
      };

      console.log('Form data being submitted:', form);
      console.log('Product data being sent to server:', productData);
      
      // Ensure boolean values are properly set
      productData.featured = Boolean(form.featured);
      productData.isActive = Boolean(form.isActive);
      productData.outOfStock = Boolean(form.outOfStock);
      
      console.log('Final product data with booleans:', productData);

      if (editMode && id) {
        await axios.put(`http://localhost:3000/api/products/${id}`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Product updated!');
      } else {
        await axios.post('http://localhost:3000/api/products', productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Product added!');
        // Don't reset form immediately to show the saved state
        // setForm({ name: '', price: '', description: '', category: '', image: '', stock: '', unit: '', brand: '', featured: false, isActive: true, outOfStock: false });
      }
      setTimeout(() => navigate('/seller-dashboard'), 1000);
    } catch (err) {
      console.error('Product operation error:', err);
      toast.error(editMode ? 'Failed to update product' : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted!');
      setTimeout(() => navigate('/seller-dashboard'), 1000);
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <BackButton 
            onClick={() => navigate('/seller-dashboard')}
            className="mb-6"
          />
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editMode ? 'Edit Product' : 'Add New Product'}
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Fill in the details below to {editMode ? 'update your' : 'add a new'} product to your inventory and make it available to customers.
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Image Upload Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Camera className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Product Image</h3>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  {(uploadMethod === 'file' && imagePreview) || (uploadMethod === 'url' && form.image) ? (
                    <div className="relative">
                      <img 
                        src={uploadMethod === 'file' ? imagePreview : form.image} 
                        alt="Product preview" 
                        className="w-40 h-40 object-cover rounded-2xl border-4 border-white shadow-xl" 
                      />
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Upload Method Toggle */}
                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    type="button"
                    onClick={() => handleUploadMethodChange('url')}
                    className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      uploadMethod === 'url' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <Link className="w-5 h-5 mr-2" />
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUploadMethodChange('file')}
                    className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      uploadMethod === 'file' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload File
                  </button>
                </div>

                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Link className="w-5 h-5 text-blue-600" />
                      <label className="text-lg font-semibold text-gray-900">Product Image URL</label>
                    </div>
                    <input 
                      type="url" 
                      name="image" 
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)" 
                      value={form.image} 
                      onChange={handleChange} 
                      className="w-full border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Enter a direct URL to your product image
                    </p>
                  </div>
                )}

                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <label className="text-lg font-semibold text-gray-900">Upload Product Image</label>
                    </div>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="bg-blue-600 p-4 rounded-full mb-4">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                          <p className="mb-2 text-lg text-gray-700">
                            <span className="font-bold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-sm text-gray-600">PNG, JPG, JPEG (MAX. 5MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {imageFile && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-sm text-green-700 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {imageFile.name} selected successfully
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
              <div className="flex items-center space-x-3 mb-6">
                <Package className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Product Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <label className="text-lg font-semibold text-gray-900">Product Name *</label>
                  </div>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Enter product name" 
                    value={form.name} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg bg-white shadow-md" 
                    required 
                  />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Hash className="w-5 h-5 text-gray-600" />
                    <label className="text-lg font-semibold text-gray-900">Product Category *</label>
                  </div>
                  <select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg bg-white shadow-md" 
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Dairy Products">🥛 Dairy Products</option>
                    <option value="Fruits">🍎 Fresh Fruits</option>
                    <option value="Vegetables">🥕 Fresh Vegetables</option>
                    <option value="Frozen Products">🧊 Frozen Products</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-200">
              <div className="flex items-center space-x-3 mb-6">
                <DollarSign className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-900">Pricing & Inventory</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <label className="text-lg font-semibold text-gray-900">Price (₹) *</label>
                  </div>
                  <input 
                    type="number" 
                    name="price" 
                    placeholder="0.00" 
                    value={form.price} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-lg bg-white shadow-md" 
                    min="0" 
                    step="0.01" 
                    required 
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Hash className="w-5 h-5 text-gray-600" />
                    <label className="text-lg font-semibold text-gray-900">Stock Quantity *</label>
                  </div>
                  <input 
                    type="number" 
                    name="stock" 
                    placeholder="Enter quantity available" 
                    value={form.stock} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-lg bg-white shadow-md" 
                    min="0" 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-6">
                <Tag className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Additional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Hash className="w-5 h-5 text-gray-600" />
                    <label className="text-lg font-semibold text-gray-900">Unit</label>
                  </div>
                  <input 
                    type="text" 
                    name="unit" 
                    placeholder="e.g., 1kg, 500g, 1 piece" 
                    value={form.unit} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-lg bg-white shadow-md" 
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <label className="text-lg font-semibold text-gray-900">Brand</label>
                  </div>
                  <input 
                    type="text" 
                    name="brand" 
                    placeholder="Brand name" 
                    value={form.brand} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-lg bg-white shadow-md" 
                  />
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-200">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Product Description</h3>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <label className="text-lg font-semibold text-gray-900">Description *</label>
              </div>
              <textarea 
                name="description" 
                placeholder="Describe your product in detail..." 
                value={form.description} 
                onChange={handleChange} 
                rows="5" 
                className="w-full border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-lg bg-white shadow-md resize-none"
                required
              />
              <p className="text-sm text-gray-600 mt-3 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Provide a detailed description to help customers understand your product
              </p>
            </div>

            {/* Product Status Options */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-8 rounded-2xl border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <Eye className="w-6 h-6 text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">Product Settings</h3>
              </div>
              
              <div className="space-y-6">
                {/* Featured Product Option */}
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 shadow-md">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="featured" 
                      checked={form.featured} 
                      onChange={handleChange} 
                      className="rounded-lg border-2 border-yellow-300 text-yellow-600 focus:ring-yellow-500 h-6 w-6" 
                    />
                  </div>
                  <div className="flex items-center space-x-3 flex-1">
                    <Star className="w-6 h-6 text-yellow-600" />
                    <div>
                      <label className="text-lg font-bold text-gray-900">Featured Product</label>
                      <p className="text-sm text-gray-600">Featured products appear prominently on the homepage and get more visibility</p>
                    </div>
                  </div>
                </div>

                {/* Active Product Option */}
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-md">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="isActive" 
                      checked={form.isActive} 
                      onChange={handleChange} 
                      className="rounded-lg border-2 border-green-300 text-green-600 focus:ring-green-500 h-6 w-6" 
                    />
                  </div>
                  <div className="flex items-center space-x-3 flex-1">
                    <Eye className="w-6 h-6 text-green-600" />
                    <div>
                      <label className="text-lg font-bold text-gray-900">Active Product</label>
                      <p className="text-sm text-gray-600">Active products are visible to customers and available for purchase</p>
                    </div>
                  </div>
                </div>

                {/* Out of Stock Option */}
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 shadow-md">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="outOfStock" 
                      checked={form.outOfStock} 
                      onChange={(e) => {
                        console.log('Out of Stock checkbox clicked:', e.target.checked);
                        handleChange(e);
                        // Auto-set isActive to false when marking as out of stock
                        if (e.target.checked) {
                          setForm(prev => ({ ...prev, isActive: false }));
                          console.log('Auto-setting isActive to false because outOfStock is true');
                        }
                      }} 
                      className="rounded-lg border-2 border-red-300 text-red-600 focus:ring-red-500 h-6 w-6" 
                    />
                  </div>
                  <div className="flex items-center space-x-3 flex-1">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <label className="text-lg font-bold text-gray-900">Out of Stock</label>
                      <p className="text-sm text-gray-600">Mark this product as temporarily unavailable (will automatically deactivate the product)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 pt-8">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>{editMode ? 'Updating Product...' : 'Adding Product...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    <span>{editMode ? 'Update Product' : 'Add Product'}</span>
                  </>
                )}
              </button>
              
              {editMode && (
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  disabled={deleting} 
                  className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-6 h-6" />
                      <span>Delete Product</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;