import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Building2, BedDouble, Bath, Maximize, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingCard from '@/components/common/LoadingCard';

const CITIES = {
  'alexandria': 'Alexandria',
  'cairo': 'Cairo',
  'sahel': 'Sahel',
  'ras-elhekma': 'Ras El Hekma',
  '6-october': '6th October',
  'maadi': 'Maadi',
  'marassi': 'Marassi',
  'elmohandisen': 'El Mohandisen',
};

const CityPage = () => {
  const { city } = useParams<{ city: string }>();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cityName = city ? CITIES[city as keyof typeof CITIES] : '';

  useEffect(() => {
    if (city) {
      fetchProperties();
    }
  }, [city]);

  const fetchProperties = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('properties')
      .select('*, profiles!properties_agent_id_fkey(name, phone)')
      .eq('city', city)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (data) setProperties(data);
    setIsLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppClick = (phone: string, title: string) => {
    const message = encodeURIComponent(`Hi, I'm interested in: ${title}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="h-8 w-8" />
            <h1 className="text-4xl font-bold">{cityName}</h1>
          </div>
          <p className="text-xl text-blue-100">
            Discover {properties.length} properties in {cityName}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/properties" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to all properties
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <LoadingCard key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h3>
              <p className="text-gray-500">There are no properties available in {cityName} at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gray-200">
                    {property.images && property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {formatPrice(property.price)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {property.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <BedDouble className="h-4 w-4 mr-1" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms}
                      </div>
                      <div className="flex items-center">
                        <Maximize className="h-4 w-4 mr-1" />
                        {property.square_feet} sq ft
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handlePhoneClick(property.profiles?.phone || '')}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleWhatsAppClick(property.profiles?.phone || '', property.title)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityPage;
