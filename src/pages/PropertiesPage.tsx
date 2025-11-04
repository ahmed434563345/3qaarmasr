import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PropertyListing } from '@/types/listing';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ListingCard from '@/components/common/ListingCard';

const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  
  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'alexandria', label: 'Alexandria' },
    { value: '6-october', label: '6th October' },
    { value: 'maadi', label: 'Maadi' },
    { value: 'marassi', label: 'Marassi' },
    { value: 'elmohandisen', label: 'El Mohandisen' }
  ];
  
  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved');

      // Apply filters from URL params
      const type = searchParams.get('type');
      const city = searchParams.get('city');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const bedrooms = searchParams.get('bedrooms');
      const bathrooms = searchParams.get('bathrooms');

      if (type) query = query.eq('property_type', type as any);
      if (city) query = query.ilike('city', `%${city}%`);
      if (minPrice) query = query.gte('price', parseInt(minPrice));
      if (maxPrice) query = query.lte('price', parseInt(maxPrice));
      if (bedrooms) query = query.gte('bedrooms', parseInt(bedrooms));
      if (bathrooms) query = query.gte('bathrooms', parseInt(bathrooms));

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProperties: PropertyListing[] = (data || []).map(property => ({
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
      }));

      setProperties(mappedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = selectedLocation === 'all'
    ? properties 
    : properties.filter(property => 
        property.location.city.toLowerCase() === selectedLocation
      );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[500px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            Luxury Properties In Egypt
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Featured Properties Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">Featured Properties</h2>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by location, property type..."
                className="w-full"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-300k">Under 300K EGP</SelectItem>
                <SelectItem value="300k-500k">300K - 500K EGP</SelectItem>
                <SelectItem value="500k-1m">500K - 1M EGP</SelectItem>
                <SelectItem value="1m+">1M+ EGP</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">{filteredProperties.length} properties found</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select defaultValue="newest">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="beds">Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <ListingCard key={property.id} listing={property} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <Button variant="outline" disabled>Previous</Button>
            <Button>1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
