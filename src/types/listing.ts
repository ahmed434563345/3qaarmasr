
export type ListingType = 'property';
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type PropertyType = 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'studio' | 'villa';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ListingType;
  status: ListingStatus;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  images: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  views: number;
  featured: boolean;
}

export interface PropertyListing extends Listing {
  type: 'property';
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt?: number;
  lotSize?: number;
  garage?: number;
  amenities: string[];
  compoundId?: string | null;
  launchId?: string | null;
}
