
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '@/components/map/LocationPicker';
import { useCompounds } from '@/hooks/useCompounds';
import { useLaunches } from '@/hooks/useLaunches';

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  propertyType: z.string().min(1, "Property type is required"),
  address: z.string().min(1, "Address is required").max(300, "Address must be less than 300 characters"),
  city: z.string().min(1, "City is required"),
  bedrooms: z.coerce.number().int().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.coerce.number().int().min(0, "Bathrooms must be 0 or more"),
  squareFeet: z.coerce.number().positive("Square feet must be positive"),
  amenities: z.string().optional(),
  compoundId: z.string().optional(),
  launchId: z.string().optional(),
  categories: z.string().optional(),
});

type ListingFormData = z.infer<typeof formSchema>;

const AddListingForm = () => {
  const { toast } = useToast();
  const { user, role, isAgentApproved } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latitude, setLatitude] = useState<number>(31.2001);
  const [longitude, setLongitude] = useState<number>(29.9187);
  
  const { data: compounds } = useCompounds();
  const { data: launches } = useLaunches();
  
  const form = useForm<ListingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      propertyType: '',
      address: '',
      city: 'alexandria',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 0,
      amenities: '',
      compoundId: 'none',
      launchId: 'none',
      categories: '',
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    // Allow both agents and admins to add listings
    if (role !== 'agent' && role !== 'admin') {
      navigate('/');
    }
  }, [user, role, navigate]);

  const cities = [
    'alexandria',
    'miami',
    'smouha',
    'sidi-gaber',
    'stanley',
    'glim',
    'san-stefano',
    'montazah',
    'mandara',
    'agami',
    'sidi-beshr',
    'sporting',
    'roushdy',
    'cleopatra',
    'louran',
    'shatby',
    '6 october',
    'maadi',
    'marassi',
    'elmohandisen'
  ];

  const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'land'];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
      
      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageRemove = async (index: number) => {
    const imageUrl = images[index];
    
    // Extract file path from URL
    const urlParts = imageUrl.split('/property-images/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      
      try {
        await supabase.storage
          .from('property-images')
          .remove([filePath]);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ListingFormData) => {
    // For admins, skip the approval check
    if (role === 'agent' && !isAgentApproved) {
      toast({
        variant: "destructive",
        title: "Not Approved",
        description: "You need admin approval before adding properties.",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "Images Required",
        description: "Please upload at least one image for the property.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const amenitiesArray = data.amenities 
        ? data.amenities.split(',').map(a => a.trim()).filter(Boolean)
        : [];

      const categoriesArray = data.categories
        ? data.categories.split(',').map(c => c.trim()).filter(Boolean)
        : [];

      // If admin, auto-approve the listing
      const listingStatus = role === 'admin' ? 'approved' : 'pending';

      const { error } = await supabase.from('properties').insert([{
        title: data.title,
        description: data.description,
        price: data.price,
        property_type: data.propertyType as any,
        address: data.address,
        city: data.city,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_feet: data.squareFeet,
        amenities: amenitiesArray,
        categories: categoriesArray,
        compound_id: data.compoundId && data.compoundId !== 'none' ? data.compoundId : null,
        launch_id: data.launchId && data.launchId !== 'none' ? data.launchId : null,
        images: images,
        agent_id: user?.id || '',
        status: listingStatus as any,
        latitude: latitude,
        longitude: longitude
      }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: role === 'admin' 
          ? "Property has been added and approved." 
          : "Your property has been submitted for admin approval.",
      });
      
      navigate(role === 'admin' ? '/admin' : '/agent-dashboard');
    } catch (error) {
      console.error('Error submitting listing:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit property. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show approval warning for agents, not admins
  if (role === 'agent' && !isAgentApproved) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your agent account is pending approval. Please wait for an admin to approve your account before you can add properties.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Property</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter listing title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (EGP)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your listing..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter property address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city.charAt(0).toUpperCase() + city.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="compoundId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compound (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select compound or leave empty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {compounds?.map((compound) => (
                            <SelectItem key={compound.id} value={compound.id}>
                              {compound.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="launchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Launch (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select launch or leave empty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {launches?.map((launch) => (
                            <SelectItem key={launch.id} value={launch.id}>
                              {launch.title}
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
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Luxury, Waterfront, Modern" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="squareFeet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Feet</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Pool, Gym, Parking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Property Location *</label>
                <LocationPicker 
                  onLocationSelect={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                  initialLat={latitude}
                  initialLng={longitude}
                />
              </div>

              {/* Images */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Images *</label>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() => handleImageRemove(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="relative">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      {uploadingImages ? (
                        <div className="text-sm text-muted-foreground">Uploading...</div>
                      ) : (
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      )}
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Upload at least one image (JPG, PNG, WEBP)</p>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Property for Approval'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddListingForm;
