import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { ProductService } from '../services/productService';

export const useAdminProducts = () => {
    return useQuery({
        queryKey: ['adminProducts'],
        queryFn: ProductService.getAllProducts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useAdminOrders = () => {
    return useQuery({
        queryKey: ['adminOrders'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};
