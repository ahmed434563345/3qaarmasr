import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Map as MapIcon, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompound } from '@/hooks/useCompounds';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useListings } from '@/hooks/useListings';
import ListingCard from '@/components/common/ListingCard';

const CompoundDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: compound, isLoading } = useCompound(slug || '');
  const { data: properties } = useListings();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!compound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Compound not found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const compoundProperties = properties?.filter(p => 
    p.location.city.toLowerCase().includes(compound.location.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        {compound.hero_image_url && (
          <img
            src={compound.hero_image_url}
            alt={compound.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {compound.logo_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={compound.logo_url}
                        alt={compound.name}
                        className="h-20 w-20 rounded-full object-cover bg-white border"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{compound.location}</span>
                      <Badge variant="secondary">Compound</Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{compound.name}</h1>
                    {compound.description && (
                      <p className="text-muted-foreground">{compound.description}</p>
                    )}
                  </div>
                </div>

                {/* Features */}
                {compound.features && compound.features.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {compound.features.map((feature: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="text-primary">{feature.icon}</div>
                          <span className="text-sm">{feature.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {compound.amenities && compound.amenities.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {compound.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Properties */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Properties</h2>
                    <p className="text-sm text-muted-foreground">
                      {compoundProperties.length} Results Available
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {compoundProperties.slice(0, 4).map((property) => (
                    <ListingCard key={property.id} listing={property} />
                  ))}
                </div>

                {compoundProperties.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No properties available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Properties</p>
                    <p className="text-2xl font-bold">{compound.property_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full" variant="outline">
                  <MapIcon className="h-4 w-4 mr-2" />
                  View On Map
                </Button>
                <Button className="w-full" variant="outline">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gallery
                </Button>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundDetailPage;
