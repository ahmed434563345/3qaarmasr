
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import heroBackground from '@/assets/hero-background.jpg';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Navigate to search results with query
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
            Make A Move For
            <br />
            <span className="block">Your Future.</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            Find Your Perfect Property in Alexandria with 3aqark
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mt-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
                <div className="flex-1 flex items-center px-8 py-6">
                  <Input
                    type="text"
                    placeholder="Search properties, locations, agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg placeholder:text-muted-foreground bg-transparent"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mr-2 text-muted-foreground hover:text-foreground"
                >
                  <MapPin className="h-5 w-5" />
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full h-14 w-14 mr-2 bg-primary hover:bg-primary/90"
                >
                  <Search className="h-6 w-6" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
