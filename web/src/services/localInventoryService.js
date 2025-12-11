import inventory from '../data/inventory.json';

// Helper to simulate network delay for realism (optional, but good for UX testing)
const simulateDelay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const localInventoryService = {
    getAllProducts: async () => {
        await simulateDelay();
        return inventory;
    },

    getProductByHandle: async (handle) => {
        await simulateDelay();
        const product = inventory.find(p => p.handle === handle);
        return product || null;
    },

    getCollectionByHandle: async (handle) => {
        await simulateDelay();
        // Simple filter logic for mock collections
        if (handle === 'all' || handle === 'signature') {
            return {
                id: 'col_all',
                title: handle === 'signature' ? 'Signature Collection' : 'All Products',
                handle: handle,
                description: 'Our complete curation of fine fragrances.',
                products: {
                    nodes: inventory
                },
                image: null
            };
        }

        // Fallback for specific tags if needed in future
        return null;
    },

    getAllCollections: async () => {
        await simulateDelay();
        return [
            {
                id: 'col_all',
                title: 'All Products',
                handle: 'all'
            }
        ];
    }
};
