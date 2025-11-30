import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AlexandriaAreas = () => {
  const navigate = useNavigate();
  
  const alexandriaAreas = [
    {
      id: 'miami',
      name: 'Miami',
      description: 'Beachfront luxury properties',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2074',
      count: '156',
    },
    {
      id: 'smouha',
      name: 'Smouha',
      description: 'Central residential hub',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070',
      count: '234',
    },
    {
      id: 'sidi-gaber',
      name: 'Sidi Gaber',
      description: 'Prime location near train station',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075',
      count: '189',
    },
    {
      id: 'stanley',
      name: 'Stanley',
      description: 'Iconic corniche views',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071',
      count: '142',
    },
    {
      id: 'glim',
      name: 'Glim',
      description: 'Seaside elegance',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070',
      count: '167',
    },
    {
      id: 'san-stefano',
      name: 'San Stefano',
      description: 'Upscale beachfront living',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
      count: '203',
    },
    {
      id: 'montazah',
      name: 'Montazah',
      description: 'Royal palace neighborhood',
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=2084',
      count: '178',
    },
    {
      id: 'mandara',
      name: 'Mandara',
      description: 'Coastal residential area',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053',
      count: '145',
    },
    {
      id: 'agami',
      name: 'Agami',
      description: 'Summer retreat destination',
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2087',
      count: '267',
    },
    {
      id: 'sidi-beshr',
      name: 'Sidi Beshr',
      description: 'Family-friendly beaches',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070',
      count: '198',
    },
    {
      id: 'sporting',
      name: 'Sporting',
      description: 'Green spaces and clubs',
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070',
      count: '215',
    },
    {
      id: 'roushdy',
      name: 'Roushdy',
      description: 'Established residential area',
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=2087',
      count: '189',
    },
    {
      id: 'cleopatra',
      name: 'Cleopatra',
      description: 'Historic beach area',
      image: 'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?q=80&w=2070',
      count: '134',
    },
    {
      id: 'louran',
      name: 'Louran',
      description: 'Quiet residential district',
      image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?q=80&w=2070',
      count: '112',
    },
    {
      id: 'shatby',
      name: 'Shatby',
      description: 'Near university campus',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070',
      count: '98',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Explore Alexandria Areas
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover properties across Alexandria's most sought-after neighborhoods
          </p>
        </div>

        {/* Desktop/Tablet Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alexandriaAreas.map((area) => (
            <Card
              key={area.id}
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden"
              onClick={() => navigate(`/area/${area.id}`)}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={area.image}
                  alt={area.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{area.name}</h3>
                  <p className="text-sm opacity-90">{area.description}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    {area.count} properties
                  </span>
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {alexandriaAreas.map((area) => (
                <CarouselItem key={area.id} className="pl-2 basis-4/5">
                  <Card
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/area/${area.id}`)}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={area.image}
                        alt={area.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="text-base font-bold mb-0.5">{area.name}</h3>
                        <p className="text-xs opacity-90">{area.description}</p>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-600">
                          {area.count} properties
                        </span>
                        <MapPin className="h-3 w-3 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default AlexandriaAreas;
