import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompounds } from '@/hooks/useCompounds';

const sellerInquirySchema = z.object({
  name: z.string().trim().nonempty({ message: "Name is required" }).max(100),
  phone: z.string().trim().nonempty({ message: "Phone number is required" }).max(20),
  location: z.string().trim().nonempty({ message: "Location is required" }).max(200),
  compound: z.string().optional(),
  property_type: z.string().nonempty({ message: "Property type is required" }),
});

type SellerInquiryForm = z.infer<typeof sellerInquirySchema>;

const SellPropertyPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: compounds } = useCompounds();

  const form = useForm<SellerInquiryForm>({
    resolver: zodResolver(sellerInquirySchema),
    defaultValues: {
      name: '',
      phone: '',
      location: '',
      compound: '',
      property_type: '',
    },
  });

  const onSubmit = async (data: SellerInquiryForm) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('seller_inquiries')
        .insert([{
          name: data.name,
          phone: data.phone,
          location: data.location,
          compound: data.compound || null,
          property_type: data.property_type,
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Thank you! One of our agents will contact you soon.",
      });

      form.reset();
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to submit your inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/20 to-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Sell Your Property With Nawy
        </h1>

        {/* Steps Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-border/40 hover:shadow-lg transition-shadow">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">1</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Step</p>
            <h3 className="text-xl font-bold mb-2">List Your Property Details</h3>
            <p className="text-muted-foreground">Add All The Information Related To Your Property</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-border/40 hover:shadow-lg transition-shadow">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">2</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Step</p>
            <h3 className="text-xl font-bold mb-2">One Of Our Agents Will Call You</h3>
            <p className="text-muted-foreground">We Will Help You Find The Best Buyer</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-border/40 hover:shadow-lg transition-shadow">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">3</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Step</p>
            <h3 className="text-xl font-bold mb-2">Meet With Serious Buyers</h3>
            <p className="text-muted-foreground">Final Step To Sell Your Property</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-card/70 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border/40 shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Complete The Form</h2>
          <p className="text-muted-foreground mb-8">
            Your privacy is important to us. We won't publish or share your information with anyone
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Your Name" 
                          {...field}
                          className="h-12 bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Phone Number" 
                          {...field}
                          className="h-12 bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Location" 
                          {...field}
                          className="h-12 bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compound"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background">
                            <SelectValue placeholder="Compound (Optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {compounds?.map((compound) => (
                            <SelectItem key={compound.id} value={compound.name}>
                              {compound.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="property_type"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-background">
                          <SelectValue placeholder="Property Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="duplex">Duplex</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="chalet">Chalet</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SellPropertyPage;
