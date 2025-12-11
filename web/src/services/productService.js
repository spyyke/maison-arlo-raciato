import { localInventoryService } from './localInventoryService';

// No complex normalization needed if JSON is well-structured, 
// but we keep this to Ensure consistent shape for the UI components
const normalizeProduct = (product) => {
  if (!product) return null;

  return {
    ...product,
    variants: product.variants || [],
    images: product.images || [],
    scent_notes: product.scent_notes || [],
    tags: product.tags || []
  };
};

export const ProductService = {
  getAllProducts: async () => {
    try {
      const products = await localInventoryService.getAllProducts();
      return products.map(normalizeProduct);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
  },

  getProductByHandle: async (handle) => {
    try {
      const product = await localInventoryService.getProductByHandle(handle);
      return normalizeProduct(product);
    } catch (error) {
      console.error("Failed to fetch product by handle:", error);
      throw error;
    }
  },

  getCollectionByHandle: async (handle) => {
    try {
      const collection = await localInventoryService.getCollectionByHandle(handle);
      if (!collection) return null;

      // Map the nodes from the collection structure
      const products = collection.products?.nodes
        ? collection.products.nodes.map(normalizeProduct)
        : [];

      return {
        ...collection,
        products
      };
    } catch (error) {
      console.error("Failed to fetch collection by handle:", error);
      return null;
    }
  },

  getAllCollections: async () => {
    try {
      return await localInventoryService.getAllCollections();
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      return [];
    }
  }
};

