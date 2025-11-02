
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, MapPin, Heart, MessageSquare, Settings, Eye, Upload, Camera } from 'lucide-react';
import { useAuth } from '../lib/supabase/auth';
import { useWishlist } from '../components/wishlist/WishlistContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserProfile = () => {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfileData({
          name: data.name || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      // Upload to storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileData({ ...profileData, avatar_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          whatsapp: profileData.whatsapp
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const mockUserListings = [
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      price: 450000,
      status: 'approved',
      views: 245,
      image: '/placeholder.svg',
      createdAt: '2024-01-15'
    },
    {
      id: '2', 
      title: 'Luxury Family Home',
      price: 750000,
      status: 'pending',
      views: 0,
      image: '/placeholder.svg',
      createdAt: '2024-01-10'
    }
  ];

  const mockWishlistItems = [
    {
      id: '3',
      title: 'Cozy Suburban Townhouse',
      price: 320000,
      location: 'Austin, TX',
      image: '/placeholder.svg'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={profileData.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {profileData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute bottom-4 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  <h2 className="text-xl font-semibold">{profileData.name || user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {user?.role === 'agent' ? 'Agent' : user?.role === 'admin' ? 'Admin' : 'Buyer'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-3" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  {profileData.phone && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-3" />
                      <span className="text-sm">{profileData.phone}</span>
                    </div>
                  )}
                  {profileData.whatsapp && (
                    <div className="flex items-center text-green-600">
                      <MessageSquare className="h-4 w-4 mr-3" />
                      <span className="text-sm">{profileData.whatsapp}</span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full mt-6"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="listings">My Listings</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Full Name</label>
                          <Input 
                            value={profileData.name} 
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Phone</label>
                            <Input 
                              value={profileData.phone} 
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              placeholder="+20 123 456 7890"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">WhatsApp</label>
                            <Input 
                              value={profileData.whatsapp} 
                              onChange={(e) => setProfileData({ ...profileData, whatsapp: e.target.value })}
                              placeholder="+20 123 456 7890"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {user.role === 'vendor' ? mockUserListings.length : wishlist.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.role === 'vendor' ? 'Active Listings' : 'Wishlist Items'}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">245</div>
                          <div className="text-sm text-gray-600">Total Views</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">12</div>
                          <div className="text-sm text-gray-600">Messages</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="listings">
                <div className="space-y-4">
                  {user.role === 'vendor' ? (
                    mockUserListings.map((listing) => (
                      <Card key={listing.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <img
                              src={listing.image}
                              alt={listing.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                              <p className="text-blue-600 font-bold">{formatPrice(listing.price)}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge
                                  variant={listing.status === 'approved' ? 'default' : 'secondary'}
                                >
                                  {listing.status}
                                </Badge>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {listing.views} views
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Only vendors can create listings.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="wishlist">
                <div className="space-y-4">
                  {mockWishlistItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-blue-600 font-bold">{formatPrice(item.price)}</p>
                            <p className="text-sm text-gray-600">{item.location}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button variant="outline" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No messages yet. Start a conversation!</p>
                      <Button className="mt-4">Go to Messages</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
