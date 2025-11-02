import React from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCompounds } from '@/hooks/useCompounds';
import LoadingCard from '@/components/common/LoadingCard';

const TopCompounds = () => {
  const { data: compounds, isLoading } = useCompounds();

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Top Compounds
            </h2>
            <p className="text-muted-foreground">Loading...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Top Compounds
          </h2>
          <p className="text-muted-foreground">
            {compounds?.length || 0} Results Available
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {compounds?.map((compound) => (
              <CarouselItem key={compound.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                <Link to={`/compound/${compound.slug}`} className="block group">
                  <div className="relative overflow-hidden rounded-lg aspect-square">
                    <img
                      src={compound.hero_image_url || compound.logo_url || '/placeholder.svg'}
                      alt={compound.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-xl font-bold mb-1">
                        {compound.name}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {compound.property_count} {compound.property_count === 1 ? 'Property' : 'Properties'}
                      </p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </section>
  );
};

export default TopCompounds;
