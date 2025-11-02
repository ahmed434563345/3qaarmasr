
import React from 'react';
import Hero from '../components/home/Hero';
import NewLaunches from '../components/home/NewLaunches';
import TopCompounds from '../components/home/TopCompounds';
import CategoryCarousel from '../components/home/CategoryCarousel';
import FeaturedListings from '../components/home/FeaturedListings';
import MarketplaceBooth from '../components/home/MarketplaceBooth';
import PropertiesSection from '../components/home/PropertiesSection';
import LeadCollectionModal from '../components/common/LeadCollectionModal';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <NewLaunches />
      <TopCompounds />
      <CategoryCarousel />
      <FeaturedListings />
      <PropertiesSection />
      <MarketplaceBooth />
      <LeadCollectionModal />
    </div>
  );
};

export default HomePage;
