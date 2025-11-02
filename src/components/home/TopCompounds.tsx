import React from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import compound1 from '@/assets/compound-1.jpg';
import compound2 from '@/assets/compound-2.jpg';
import compound3 from '@/assets/compound-3.jpg';
import compound4 from '@/assets/compound-4.jpg';
import compound5 from '@/assets/compound-5.jpg';
import compound6 from '@/assets/compound-6.jpg';

const compounds = [
  {
    id: 1,
    name: 'Solana East Strip',
    properties: 1,
    image: compound1,
  },
  {
    id: 2,
    name: 'Hyde Park Signature',
    properties: 5,
    image: compound2,
  },
  {
    id: 3,
    name: 'Crescent Walk',
    properties: 24,
    image: compound3,
  },
  {
    id: 4,
    name: 'Solana East',
    properties: 37,
    image: compound4,
  },
  {
    id: 5,
    name: 'Telal East',
    properties: 61,
    image: compound5,
  },
  {
    id: 6,
    name: 'El Patio Riva',
    properties: 13,
    image: compound6,
  },
];

const TopCompounds = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Top Compounds
          </h2>
          <p className="text-muted-foreground">
            136 Results Available
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
            {compounds.map((compound) => (
              <CarouselItem key={compound.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                <Link to="/properties" className="block group">
                  <div className="relative overflow-hidden rounded-lg aspect-square">
                    <img
                      src={compound.image}
                      alt={compound.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-xl font-bold mb-1">
                        {compound.name}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {compound.properties} {compound.properties === 1 ? 'Property' : 'Properties'}
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
