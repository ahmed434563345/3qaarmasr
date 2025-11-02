
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Building2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategoryCarousel = () => {
  const navigate = useNavigate();
  
  const categories = [
    {
      id: 'alexandria-properties',
      title: 'Alexandria Properties',
      description: 'Beachfront homes and apartments',
      icon: Building2,
      count: '2,450',
      color: 'bg-blue-500',
      route: '/properties?location=alexandria'
    },
    {
      id: 'new-cairo',
      title: 'New Cairo Properties',
      description: 'Luxury compounds & apartments',
      icon: Building2,
      count: '3,100',
      color: 'bg-green-500',
      route: '/properties?location=new-cairo'
    },
    {
      id: 'north-coast',
      title: 'North Coast Properties',
      description: 'Beach resorts & chalets',
      icon: MapPin,
      count: '1,650',
      color: 'bg-purple-500',
      route: '/properties?location=north-coast'
    },
    {
      id: '6-october',
      title: '6th October Properties',
      description: 'Modern compounds & villas',
      icon: Building2,
      count: '1,800',
      color: 'bg-orange-500',
      route: '/properties?location=6-october'
    },
    {
      id: 'maadi',
      title: 'Maadi Properties',
      description: 'Exclusive residential area',
      icon: Building2,
      count: '980',
      color: 'bg-red-500',
      route: '/properties?location=maadi'
    },
    {
      id: 'zamalek',
      title: 'Zamalek Properties',
      description: 'Premium island location',
      icon: Building2,
      count: '720',
      color: 'bg-indigo-500',
      route: '/properties?location=zamalek'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the best properties in Egypt's most popular locations
          </p>
        </div>

        {/* Desktop/Tablet Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(category.route)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`${category.color} p-3 rounded-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <p className="text-sm font-medium text-blue-600">
                        {category.count} listings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-4/5">
                    <Card
                      className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(category.route)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`${category.color} p-2 rounded-lg`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {category.title}
                            </h3>
                            <p className="text-xs text-gray-600 mb-1">{category.description}</p>
                            <p className="text-xs font-medium text-blue-600">
                              {category.count} listings
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
