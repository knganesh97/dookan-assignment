import api from './api';

const productService = {
  // Create a new product
  createProduct: async (productData) => {
    try {
      // Ensure all required fields are present
      const createData = {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        sku: productData.sku,
        ...(productData.image_url && { image_url: productData.image_url })
      };

      const response = await api.post('/products', createData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all products with pagination and sorting
  getProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        per_page: params.per_page || 20,
        sort_by: params.sort_by || 'created_at',
        order: params.order || 'desc',
        ...(params.q && { q: params.q }) // Add search query if present
      });

      const response = await api.get(`/products?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get a single product by ID
  getProduct: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update a product
  updateProduct: async (productId, updateData) => {
    try {
      // Only include fields that are provided and valid
      const updateFields = {};
      
      if (updateData.title !== undefined) {
        updateFields.title = updateData.title;
      }
      if (updateData.description !== undefined) {
        updateFields.description = updateData.description;
      }
      if (updateData.price !== undefined) {
        updateFields.price = updateData.price;
      }
      if (updateData.sku !== undefined) {
        updateFields.sku = updateData.sku;
      }
      if (updateData.image_url !== undefined) {
        updateFields.image_url = updateData.image_url;
      }
      if (updateData.status !== undefined) {
        updateFields.status = updateData.status;
      }

      const response = await api.put(`/products/${productId}`, updateFields);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default productService; 