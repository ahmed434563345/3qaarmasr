import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Compound {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location: string;
  logo_url?: string;
  hero_image_url?: string;
  gallery_images: string[];
  features: any[];
  amenities: string[];
  latitude?: number;
  longitude?: number;
  property_count: number;
  created_at: string;
  updated_at: string;
}

export const useCompounds = () => {
  return useQuery({
    queryKey: ['compounds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compounds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Compound[];
    },
  });
};

export const useCompound = (slug: string) => {
  return useQuery({
    queryKey: ['compound', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compounds')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Compound;
    },
    enabled: !!slug,
  });
};

export const useCreateCompound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (compound: Omit<Compound, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('compounds')
        .insert(compound)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      toast.success('Compound created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create compound');
    },
  });
};

export const useUpdateCompound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...compound }: Partial<Compound> & { id: string }) => {
      const { data, error } = await supabase
        .from('compounds')
        .update(compound)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      toast.success('Compound updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update compound');
    },
  });
};

export const useDeleteCompound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('compounds')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      toast.success('Compound deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete compound');
    },
  });
};
