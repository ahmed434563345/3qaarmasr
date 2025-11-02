
import React from 'react';
import { Building2, Users, Shield, Star, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MarketplaceBooth = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-300 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold">
              MarketPlace Company
            </h2>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Your trusted partner in real estate and automotive sales
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Company Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-blue-300">About Us</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                MarketPlace Company has been connecting buyers and sellers for over a decade. 
                We specialize in premium real estate and quality vehicles, ensuring every 
                transaction is smooth, secure, and satisfactory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-300">50K+</div>
                <div className="text-blue-100">Happy Customers</div>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-300">100%</div>
                <div className="text-blue-100">Verified Listings</div>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-300">4.9</div>
                <div className="text-blue-100">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Contact Us</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Phone className="h-5 w-5 text-blue-300" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-blue-100">+1 (555) 123-MARKET</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-blue-300" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-blue-100">info@marketplace.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <MapPin className="h-5 w-5 text-blue-300" />
                  <div>
                    <div className="font-medium">Address</div>
                    <div className="text-blue-100">123 Business Ave, City, State 12345</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Schedule a Consultation
                </Button>
                <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                  View Our Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceBooth;
