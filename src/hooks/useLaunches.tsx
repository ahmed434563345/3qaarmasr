import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Launch {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location: string;
  logo_url?: string;
  hero_image_url?: string;
  gallery_images: string[];
  developer_start_price?: number;
  resale_start_price?: number;
  features: any[];
  amenities: string[];
  payment_plans: any[];
  latitude?: number;
  longitude?: number;
  master_plan_url?: string;
  created_at: string;
  updated_at: string;
}

export const useLaunches = () => {
  return useQuery({
    queryKey: ['launches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Launch[];
    },
  });
};

export const useLaunch = (slug: string) => {
  return useQuery({
    queryKey: ['launch', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launches')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Launch;
    },
    enabled: !!slug,
  });
};

export const useCreateLaunch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (launch: Omit<Launch, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('launches')
        .insert(launch)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create launch');
    },
  });
};

export const useUpdateLaunch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...launch }: Partial<Launch> & { id: string }) => {
      const { data, error } = await supabase
        .from('launches')
        .update(launch)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update launch');
    },
  });
};

export const useDeleteLaunch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('launches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete launch');
    },
  });
};
