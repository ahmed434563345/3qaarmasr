
import React from 'react';
import { Button } from '@/components/ui/button';
import { useFeaturedListings } from '../../hooks/useListings';
import ListingCard from '../common/ListingCard';
import LoadingCard from '../common/LoadingCard';
import ErrorBoundary from '../common/ErrorBoundary';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturedListings = () => {
  const { data: listings, isLoading, error } = useFeaturedListings();

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Listings
            </h2>
          </div>
          <Card className="max-w-md mx-auto">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to load listings
                </h3>
                <p className="text-gray-600 mb-4">
                  We're having trouble loading the featured listings. Please try again later.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Listings
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium properties and vehicles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Show loading cards
              Array.from({ length: 3 }).map((_, index) => (
                <LoadingCard key={index} />
              ))
            ) : (
              // Show actual listings
              listings?.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              View All Listings
            </Button>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default FeaturedListings;
