import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useLaunches } from '@/hooks/useLaunches';
import LoadingCard from '../common/LoadingCard';
import { Badge } from '@/components/ui/badge';

const NewLaunches = () => {
  const { data: launches, isLoading } = useLaunches();
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            New Launches
          </h2>
          <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
            <Link to="/properties" className="flex items-center gap-1">
              Show All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {launches?.map((launch) => (
                <CarouselItem key={launch.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Link to={`/launch/${launch.slug}`} className="block group">
                    <div className="relative overflow-hidden rounded-lg aspect-[16/9]">
                      <img
                        src={launch.hero_image_url || '/placeholder.svg'}
                        alt={launch.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-orange-500 text-white">New Launch</Badge>
                      </div>
                      <div className="absolute bottom-6 left-6">
                        <h3 className="text-white text-2xl font-bold">
                          {launch.title}
                        </h3>
                        <p className="text-white/80 text-sm mt-1">{launch.location}</p>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default NewLaunches;
