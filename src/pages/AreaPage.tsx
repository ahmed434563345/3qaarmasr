import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bed, Bath, Square, Phone, MessageSquare, MapPin } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const AREAS = {
  miami: 'Miami',
  smouha: 'Smouha',
  'sidi-gaber': 'Sidi Gaber',
  stanley: 'Stanley',
  glim: 'Glim',
  'san-stefano': 'San Stefano',
  montazah: 'Montazah',
  mandara: 'Mandara',
  agami: 'Agami',
  'sidi-beshr': 'Sidi Beshr',
  sporting: 'Sporting',
  roushdy: 'Roushdy',
  cleopatra: 'Cleopatra',
  louran: 'Louran',
  shatby: 'Shatby',
};

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  city: string;
  address: string;
  property_type: string;
  agent_id: string;
  profiles?: {
    name: string;
    phone: string;
    whatsapp: string;
  };
}

const AreaPage = () => {
  const { area } = useParams<{ area: string }>();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const areaName = area ? AREAS[area as keyof typeof AREAS] : '';

  useEffect(() => {
    if (area && AREAS[area as keyof typeof AREAS]) {
      fetchProperties();
    } else {
      navigate('/');
    }
  }, [area]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .eq('city', area)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch agent profiles separately
      if (data) {
        const agentIds = [...new Set(data.map(p => p.agent_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, phone, whatsapp')
          .in('id', agentIds);

        const propertiesWithProfiles = data.map(property => ({
          ...property,
          profiles: profiles?.find(p => p.id === property.agent_id)
        }));

        setProperties(propertiesWithProfiles as Property[]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppClick = (phone: string, propertyTitle: string) => {
    const message = encodeURIComponent(`Hi, I'm interested in the property: ${propertyTitle}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {areaName}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} available
          </p>
        </div>

        {properties.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No properties available in {areaName} at the moment.
            </p>
            <Button className="mt-4" onClick={() => navigate('/properties')}>
              View All Properties
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card
                key={property.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/listing/${property.id}`)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.images[0] || '/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {property.property_type}
                  </Badge>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="font-bold text-primary">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-gray-700">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span className="text-sm">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span className="text-sm">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span className="text-sm">{property.square_feet} sq ft</span>
                    </div>
                  </div>

                  {property.profiles && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePhoneClick(property.profiles?.phone || '');
                        }}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppClick(
                            property.profiles?.whatsapp || property.profiles?.phone || '',
                            property.title
                          );
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaPage;
