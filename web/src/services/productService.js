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
    title: row.name, // Correctly mapped from 'name' to 'title'
    handle: row.handle || createHandle(row.name),
    description: row.description,
    availableForSale: row.quantity_available > 0,
    variants: [
      {
        id: row.id,
        title: 'Default Title',
        price: {
          amount: row.price,
          currencyCode: 'PHP'
        },
        quantityAvailable: row.quantity_available,
        inventory_quantity: row.quantity_available
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
        // Group by handle
        const groupedMap = new Map();

        data.forEach(row => {
          const handle = row.handle || createHandle(row.name);

          if (!groupedMap.has(handle)) {
            // Create base product from the first row found
            groupedMap.set(handle, {
              id: row.id, // ID of the first variant effectively acts as product ID for now
              title: row.name, // Display Title
              handle: handle,
              description: row.description,
              availableForSale: row.quantity_available > 0,
              images: [{ url: row.image_url || 'https://placehold.co/600x400?text=No+Image' }],
              tags: row.scent_profile ? row.scent_profile.split(',').map(s => `Note: ${s.trim()}`) : [],
              variants: []
            });
          }

          // Add this row as a variant
          const product = groupedMap.get(handle);
          product.variants.push({
            id: row.id,
            title: row.size || 'Default Size', // Assuming 'size' column exists or we fallback
            price: {
              amount: row.price,
              currencyCode: 'PHP'
            },
            quantityAvailable: row.quantity_available, // Frontend prop
            inventory_quantity: row.quantity_available // Admin prop
          });

          // Update aggregate availability
          if (row.quantity_available > 0) product.availableForSale = true;
        });

        return Array.from(groupedMap.values());
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
      // 1. Fetch ALL active products from Supabase
      const { data, error } = await supabase
        .from('perfumes')
        .select('*')
        .eq('status', 'active');

      if (data) {
        // 2. Filter for all rows that match this handle
        const matchingRows = data.filter(p => (p.handle || createHandle(p.name)) === handle);

        if (matchingRows.length > 0) {
          // 3. Construct the grouped product object
          const firstRow = matchingRows[0];
          const product = {
            id: firstRow.id,
            title: firstRow.name,
            handle: handle,
            description: firstRow.description,
            availableForSale: matchingRows.some(row => row.quantity_available > 0),
            images: [{ url: firstRow.image_url || 'https://placehold.co/600x400?text=No+Image' }],
            tags: firstRow.scent_profile ? firstRow.scent_profile.split(',').map(s => `Note: ${s.trim()}`) : [],
            variants: matchingRows.map(row => ({
              id: row.id,
              title: row.size || 'Default Size',
              price: {
                amount: row.price,
                currencyCode: 'PHP'
              },
              quantityAvailable: row.quantity_available,
              inventory_quantity: row.quantity_available
            }))
          };
          return product;
        }
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
  },

  updateProduct: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('perfumes')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? mapSupabaseToProduct(data[0]) : null;
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    try {
      // 1. Prepare data for Supabase
      const handle = productData.handle || createHandle(productData.title);
      const dbPayload = {
        name: productData.title,
        handle: handle,
        description: productData.description,
        price: parseFloat(productData.price),
        quantity_available: parseInt(productData.quantity),
        image_url: productData.imageUrl || null,
        scent_profile: productData.tags,
        size: productData.size || '50ml', // New column support
        status: 'active'
      };

      const { data, error } = await supabase
        .from('perfumes')
        .insert([dbPayload])
        .select();

      if (error) throw error;

      // Return a "normalized" product structure so the UI can use it immediately
      // We wrap the single new row into the structure expected by the frontend
      const newRow = data[0];
      return {
        id: newRow.id,
        title: newRow.name,
        handle: newRow.handle,
        description: newRow.description,
        availableForSale: newRow.quantity_available > 0,
        images: [{ url: newRow.image_url || '' }],
        tags: [],
        variants: [{
          id: newRow.id,
          title: newRow.size || '50ml',
          price: { amount: newRow.price, currencyCode: 'PHP' },
          inventory_quantity: newRow.quantity_available
        }]
      };
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  },

  createManualOrder: async (orderData) => {
    try {
      // 1. Create Order Record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail || 'walkin@store.local',
          line_items: orderData.items, // standardizing on line_items if possible, or check schema
          items: orderData.items, // Supporting legacy/current schema
          total_price: orderData.totalPrice,
          order_status: orderData.status || 'paid',
          notes: orderData.notes || 'Manual Order via Admin',
          shipping_address: { address: 'In-Store / Direct Pickup', city: 'N/A' },
          order_number: `MAN-${Date.now().toString().slice(-6)}` // Simple unique ID
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Decrement Inventory for each item
      // We do this concurrently for speed, though sequentially is safer for errors. 
      // For this scale, Promise.all is fine.
      await Promise.all(orderData.items.map(async (item) => {
        // Fetch current to ensure atomic-ish update (Supabase doesn't support 'decrement' easily without RPC)
        // For now, we'll blindly subtract from what we *think* we have or just use the ID.
        // Better: Use RPC if available, or just update. 
        // We will read-modify-write here.

        const { data: product } = await supabase
          .from('perfumes')
          .select('quantity_available')
          .eq('id', item.id)
          .single();

        if (product) {
          const newQty = Math.max(0, product.quantity_available - item.quantity);
          await supabase
            .from('perfumes')
            .update({ quantity_available: newQty })
            .eq('id', item.id);
        }
      }));

      return order;
    } catch (error) {
      console.error("Failed to create manual order:", error);
      throw error;
    }
  }
};
