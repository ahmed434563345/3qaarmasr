
import { useQuery } from '@tanstack/react-query';
import { PropertyListing } from '../types/listing';
import { supabase } from '@/integrations/supabase/client';

const fetchListings = async (): Promise<PropertyListing[]> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, compound_id, launch_id')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }

  return (data || []).map(property => ({
    id: property.id,
    title: property.title,
    description: property.description,
    price: Number(property.price),
    type: 'property' as const,
    status: property.status,
    vendorId: property.agent_id,
    vendorName: '',
    vendorPhone: '',
    images: property.images || [],
    location: {
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zip_code || '',
    },
    createdAt: property.created_at,
    updatedAt: property.updated_at,
    views: property.views || 0,
    featured: property.featured,
    propertyType: property.property_type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.square_feet,
    yearBuilt: property.year_built,
    lotSize: property.lot_size,
    garage: property.garage,
    amenities: property.amenities || [],
    compoundId: property.compound_id,
    launchId: property.launch_id,
  }));
};

const fetchFeaturedListings = async (): Promise<PropertyListing[]> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, compound_id, launch_id')
    .eq('status', 'approved')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured listings:', error);
    throw error;
  }

  return (data || []).map(property => ({
    id: property.id,
    title: property.title,
    description: property.description,
    price: Number(property.price),
    type: 'property' as const,
    status: property.status,
    vendorId: property.agent_id,
    vendorName: '',
    vendorPhone: '',
    images: property.images || [],
    location: {
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zip_code || '',
    },
    createdAt: property.created_at,
    updatedAt: property.updated_at,
    views: property.views || 0,
    featured: property.featured,
    propertyType: property.property_type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.square_feet,
    yearBuilt: property.year_built,
    lotSize: property.lot_size,
    garage: property.garage,
    amenities: property.amenities || [],
    compoundId: property.compound_id,
    launchId: property.launch_id,
  }));
};

export const useListings = () => {
  return useQuery({
    queryKey: ['listings'],
    queryFn: fetchListings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

export const useFeaturedListings = () => {
  return useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: fetchFeaturedListings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};
