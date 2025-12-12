import { localInventoryService } from './localInventoryService';
import { supabase } from '../supabaseClient';

// Helper to create handle from name
const createHandle = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Adapter: Supabase Row -> Frontend Product Object
const mapSupabaseToProduct = (row) => {
  return {
    id: row.id,
    title: row.name,
    handle: createHandle(row.name),
    description: row.description,
    availableForSale: row.quantity_available > 0,
    variants: [
      {
        id: row.id, // Use product ID as variant ID for simple products
        title: 'Default Title',
        price: {
          amount: row.price,
          currencyCode: 'PHP'
        },
        quantityAvailable: row.quantity_available,
        inventory_quantity: row.quantity_available // Keep raw value for logic
      }
    ],
    images: [
      { url: row.image_url || 'https://placehold.co/600x400?text=No+Image' }
    ],
    tags: row.scent_profile ? row.scent_profile.split(',').map(s => `Note: ${s.trim()}`) : []
  };
};

// Original normalizer for local service
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
      // Try fetching from Supabase first
      const { data, error } = await supabase
        .from('perfumes')
        .select('*')
        .eq('status', 'active');

      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseToProduct);
      }

      if (error) {
        console.log('Supabase fetch error (using fallback):', error.message);
      } else {
        console.log('Supabase returned no data, using fallback.');
      }

      // Fallback to local inventory
      const products = await localInventoryService.getAllProducts();
      return products.map(normalizeProduct);
    } catch (error) {
      console.warn("Using local inventory due to error:", error);
      const products = await localInventoryService.getAllProducts();
      return products.map(normalizeProduct);
    }
  },

  getProductByHandle: async (handle) => {
    try {
      // Try to find in Supabase (fetch all active and filter)
      const { data } = await supabase
        .from('perfumes')
        .select('*')
        .eq('status', 'active');

      if (data) {
        const product = data.find(p => createHandle(p.name) === handle);
        if (product) return mapSupabaseToProduct(product);
      }

      const product = await localInventoryService.getProductByHandle(handle);
      return normalizeProduct(product);
    } catch (error) {
      console.error("Failed to fetch product by handle:", error);
      throw error;
    }
  },

  getCollectionByHandle: async (handle) => {
    try {
      // Supabase retrieval for collections could conform here if we had a collection table
      // For now, treat 'all' or 'shop' as all products
      if (handle === 'all' || handle === 'shop') {
        const products = await ProductService.getAllProducts();
        return {
          title: 'All Products',
          products: products
        };
      }

      const collection = await localInventoryService.getCollectionByHandle(handle);
      if (!collection) return null;

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
