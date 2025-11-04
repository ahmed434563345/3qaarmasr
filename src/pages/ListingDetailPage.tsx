import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Eye, Heart, Bed, Bath, Square, Calendar, Gauge, Fuel, Car, Phone, MessageSquare, Star, ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '../components/wishlist/WishlistContext';
import BookAppointmentModal from '../components/common/BookAppointmentModal';
import { useAuth } from '../lib/supabase/auth';
import { trackPropertyView, trackButtonClick, trackUserInteraction, trackWishlistAction, trackPropertyContact } from '../lib/analytics';
import useScrollTracking from '../hooks/useScrollTracking';
import useTimeTracking from '../hooks/useTimeTracking';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MapDisplay from '@/components/map/MapDisplay';
import { useToast } from '@/hooks/use-toast';

interface PropertyData {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number | null;
  amenities: string[] | null;
  images: string[];
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  agent_id: string;
  views: number;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  agent?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
    avatar_url: string | null;
  };
}

const AIFeatures = ({ listing }: { listing: PropertyData }) => {
  const [aiInsight, setAiInsight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIInsight = async () => {
    setIsGenerating(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAiInsight(`This property offers excellent value in the ${listing.city} market. The price per square foot of EGP ${Math.round(listing.price / listing.square_feet)} is competitive for the area. The modern amenities and prime location make this an attractive investment opportunity.`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">AI Market Analysis</h3>
        </div>
        
        {!aiInsight && (
          <Button 
            onClick={generateAIInsight} 
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? 'Analyzing...' : 'Get AI Market Insight'}
          </Button>
        )}
        
        {aiInsight && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">{aiInsight}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ContactSection = ({ listing }: { listing: PropertyData }) => {
  const [message, setMessage] = useState('');
  
  const handleWhatsAppClick = () => {
    trackPropertyContact(listing.id, 'whatsapp');
    const whatsappNumber = (listing.agent?.whatsapp || listing.agent?.phone || '').replace(/\D/g, '');
    const defaultMessage = `Hi! I'm interested in your listing: ${listing.title}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = () => {
    trackPropertyContact(listing.id, 'phone');
    window.location.href = `tel:${listing.agent?.phone}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
        <div className="space-y-4">
          {listing.agent?.phone && (
            <div className="flex gap-3">
              <Button
                onClick={handlePhoneClick}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              {listing.agent?.whatsapp && (
                <Button
                  onClick={handleWhatsAppClick}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <Input
              placeholder="Your name"
              className="w-full"
            />
            <Input
              placeholder="Your email"
              type="email"
              className="w-full"
            />
            <Textarea
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-24"
            />
            <Button className="w-full bg-primary hover:bg-primary/90">
              Send Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [listing, setListing] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);

  // Track scroll and time on page
  useScrollTracking();
  useTimeTracking('Listing Detail Page');

  useEffect(() => {
    if (id) {
      fetchListing(id);
    }
  }, [id]);

  const fetchListing = async (listingId: string) => {
    try {
      setLoading(true);
      
      // Fetch property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', listingId)
        .single();

      if (propertyError) throw propertyError;

      // Fetch agent profile
      const { data: agentData, error: agentError } = await supabase
        .from('profiles')
        .select('id, name, email, phone, whatsapp, avatar_url')
        .eq('id', propertyData.agent_id)
        .single();

      if (agentError) {
        console.error('Error fetching agent:', agentError);
      }

      setListing({
        ...propertyData,
        agent: agentData || undefined,
      });

      // Track property view
      trackPropertyView(propertyData.id, propertyData.title);
      
      // Increment view count
      await supabase
        .from('properties')
        .update({ views: (propertyData.views || 0) + 1 })
        .eq('id', listingId);

    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleWishlistToggle = () => {
    const action = isInWishlist(listing.id) ? 'remove' : 'add';
    trackWishlistAction(action, listing.id);
    
    if (isInWishlist(listing.id)) {
      removeFromWishlist(listing.id);
    } else {
      addToWishlist(listing.id);
    }
  };

  const handleMessageAgent = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!listing) return;

    setStartingConversation(true);

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_id', listing.id)
        .eq('buyer_id', user.id)
        .eq('agent_id', listing.agent_id)
        .maybeSingle();

      if (existingConv) {
        navigate('/messages');
        return;
      }

      // Create new conversation
      const { error } = await supabase
        .from('conversations')
        .insert({
          property_id: listing.id,
          buyer_id: user.id,
          agent_id: listing.agent_id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Conversation started! Redirecting to messages...',
      });

      setTimeout(() => navigate('/messages'), 1000);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
    } finally {
      setStartingConversation(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {user && (
              <Button 
                onClick={() => {
                  trackButtonClick('Book Appointment', 'Listing Detail');
                  setIsBookingModalOpen(true);
                }}
                className="flex items-center gap-2 h-11 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-base font-semibold"
              >
                <Calendar className="h-5 w-5" />
                Schedule Viewing
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => trackButtonClick('Share', 'Listing Detail')}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-4 w-4 ${isInWishlist(listing.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>

        <BookAppointmentModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          propertyId={listing.id}
          agentId={listing.agent_id}
          propertyTitle={listing.title}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="relative">
                <Badge className="bg-blue-600 text-white">
                  Property
                </Badge>
              </div>
              {listing.images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {listing.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={listing.images[index]} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold">{listing.title}</h1>
                  <span className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</span>
                </div>

                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{listing.address}, {listing.city}, {listing.state} {listing.zip_code}</span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{listing.views} views</span>
                  </div>
                  <Badge variant={listing.status === 'approved' ? 'default' : 'secondary'}>
                    {listing.property_type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <Bed className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">{listing.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">{listing.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <Square className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">{listing.square_feet.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Sq Ft</div>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">{listing.year_built || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Built</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
                </div>

                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Features */}
            <AIFeatures listing={listing} />

            {/* Message Agent Button */}
            {user && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleMessageAgent}
                  disabled={startingConversation}
                  className="group relative flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-base font-semibold transition-all"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="group-hover:hidden">
                    {startingConversation ? 'Starting...' : 'Message Agent'}
                  </span>
                  <span className="hidden group-hover:inline">
                    Chat Now for Info
                  </span>
                </Button>
              </div>
            )}

            {/* Map Section */}
            {listing.latitude && listing.longitude && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Location</h3>
                  <MapDisplay 
                    latitude={listing.latitude} 
                    longitude={listing.longitude} 
                    title={listing.title}
                  />
                  <div className="flex items-center gap-2 text-muted-foreground mt-4">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.address}, {listing.city}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Listed by</h3>
                <div className="flex items-center gap-3 mb-4">
                  {listing.agent?.avatar_url ? (
                    <img 
                      src={listing.agent.avatar_url} 
                      alt={listing.agent.name || 'Agent'} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {listing.agent?.name?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{listing.agent?.name || 'Agent'}</div>
                    <div className="text-sm text-muted-foreground">Verified Agent</div>
                  </div>
                </div>
                {listing.agent?.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Phone className="h-4 w-4" />
                    <span>{listing.agent.phone}</span>
                  </div>
                )}
                {listing.agent?.whatsapp && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{listing.agent.whatsapp}</span>
                  </div>
                )}
                {listing.agent?.email && (
                  <div className="text-sm text-muted-foreground">
                    {listing.agent.email}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Section */}
            <ContactSection listing={listing} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
