
import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useListings } from '../../hooks/useListings';
import LoadingCard from '../common/LoadingCard';
import ListingCard from '../common/ListingCard';

const PropertiesSection = () => {
  const { data: listings, isLoading } = useListings();
  
  const propertyListings = listings?.filter(listing => listing.type === 'property').slice(0, 3) || [];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Properties & Real Estate
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your dream home from our curated selection of properties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={index} />
            ))
          ) : (
            propertyListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/properties">
              View All Properties
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PropertiesSection;
