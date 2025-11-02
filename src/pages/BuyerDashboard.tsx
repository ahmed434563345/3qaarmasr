import React, { useState, useEffect } from 'react';
import { Heart, Eye, MapPin, Search, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../lib/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const BuyerDashboard = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchSavedProperties();
    }
  }, [user]);

  const fetchSavedProperties = async () => {
    // For now, fetch some approved properties as placeholder
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'approved')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (data) setSavedProperties(data);
  };

  if (role !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This dashboard is only available for buyers.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Saved Properties',
      value: savedProperties.length.toString(),
      change: 'Your favorites',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      title: 'Recently Viewed',
      value: recentlyViewed.length.toString(),
      change: 'Last 30 days',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Searches',
      value: '0',
      change: 'Saved searches',
      icon: Search,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600">Track your property search and saved listings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="saved">Saved Properties</TabsTrigger>
            <TabsTrigger value="searches">My Searches</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.change}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Properties</CardTitle>
                <CardDescription>Based on your search history</CardDescription>
              </CardHeader>
              <CardContent>
                {savedProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No saved properties yet. Start browsing to save your favorites!</p>
                    <Button asChild className="mt-4">
                      <Link to="/properties">Browse Properties</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedProperties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Home className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">{property.title}</p>
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPin className="h-3 w-3 mr-1" />
                              {property.city}, {property.state}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">EGP {property.price.toLocaleString()}</p>
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/listing/${property.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Properties</CardTitle>
                <CardDescription>Your favorite listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedProperties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Home className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{property.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>EGP {property.price.toLocaleString()}</span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {property.city}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/listing/${property.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="searches">
            <Card>
              <CardHeader>
                <CardTitle>Saved Searches</CardTitle>
                <CardDescription>Get notified when new properties match your criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Saved searches feature coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BuyerDashboard;
