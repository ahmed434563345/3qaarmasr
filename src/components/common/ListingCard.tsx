
import React from 'react';
import { MapPin, Eye, Heart, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PropertyListing } from '../../types/listing';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../wishlist/WishlistContext';
import { toast } from '@/hooks/use-toast';

interface ListingCardProps {
  listing: PropertyListing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(listing.id);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(listing.id);
      toast({
        title: "Removed from wishlist",
        description: `${listing.title} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(listing.id);
      toast({
        title: "Added to wishlist",
        description: `${listing.title} has been added to your wishlist.`,
      });
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const whatsappNumber = listing.vendorPhone.replace(/\D/g, '');
    const message = `Hi! I'm interested in your listing: ${listing.title}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${listing.vendorPhone}`;
  };

  const handleViewDetails = () => {
    navigate(`/listing/${listing.id}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer">
      <div className="relative" onClick={handleViewDetails}>
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {listing.featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Featured
            </span>
          </div>
        )}
        <button 
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isWishlisted 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 hover:bg-white text-gray-600'
          }`}
          onClick={handleWishlistToggle}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(listing.price)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {listing.description}
        </p>

        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{listing.location.city}, {listing.location.state}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
          <span>{listing.bedrooms} beds</span>
          <span>{listing.bathrooms} baths</span>
          <span>{listing.squareFeet.toLocaleString()} sqft</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>{listing.views} views</span>
          </div>
          <span className="text-sm text-gray-600">by {listing.vendorName}</span>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handlePhoneClick}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
            onClick={handleWhatsAppClick}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
        </div>

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
