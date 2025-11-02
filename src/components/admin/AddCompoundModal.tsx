import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCompound, useUpdateCompound, Compound } from '@/hooks/useCompounds';

interface AddCompoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compound?: Compound;
}

interface CompoundFormData {
  name: string;
  slug: string;
  description?: string;
  location: string;
  logo_url?: string;
  hero_image_url?: string;
  gallery_images: string;
  features: string;
  amenities: string;
  latitude?: number;
  longitude?: number;
  property_count: number;
}

const AddCompoundModal: React.FC<AddCompoundModalProps> = ({
  open,
  onOpenChange,
  compound,
}) => {
  const { register, handleSubmit, reset } = useForm<CompoundFormData>();
  const { mutate: createCompound } = useCreateCompound();
  const { mutate: updateCompound } = useUpdateCompound();

  useEffect(() => {
    if (compound) {
      reset({
        name: compound.name,
        slug: compound.slug,
        description: compound.description || '',
        location: compound.location,
        logo_url: compound.logo_url || '',
        hero_image_url: compound.hero_image_url || '',
        gallery_images: compound.gallery_images.join(', '),
        features: JSON.stringify(compound.features),
        amenities: compound.amenities.join(', '),
        latitude: compound.latitude,
        longitude: compound.longitude,
        property_count: compound.property_count,
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        location: '',
        logo_url: '',
        hero_image_url: '',
        gallery_images: '',
        features: '[]',
        amenities: '',
        property_count: 0,
      });
    }
  }, [compound, reset]);

  const onSubmit = (data: CompoundFormData) => {
    const compoundData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      location: data.location,
      logo_url: data.logo_url,
      hero_image_url: data.hero_image_url,
      gallery_images: data.gallery_images
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean),
      features: data.features ? JSON.parse(data.features) : [],
      amenities: data.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      latitude: data.latitude,
      longitude: data.longitude,
      property_count: data.property_count,
    };

    if (compound) {
      updateCompound({ id: compound.id, ...compoundData });
    } else {
      createCompound(compoundData as any);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {compound ? 'Edit Compound' : 'Add New Compound'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input {...register('name')} required />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input {...register('slug')} required />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input {...register('location')} required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea {...register('description')} />
          </div>

          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input {...register('logo_url')} type="url" />
          </div>

          <div>
            <Label htmlFor="hero_image_url">Hero Image URL</Label>
            <Input {...register('hero_image_url')} type="url" />
          </div>

          <div>
            <Label htmlFor="gallery_images">Gallery Images (comma-separated URLs)</Label>
            <Textarea {...register('gallery_images')} />
          </div>

          <div>
            <Label htmlFor="property_count">Property Count</Label>
            <Input
              {...register('property_count', { valueAsNumber: true })}
              type="number"
              defaultValue={0}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                {...register('latitude', { valueAsNumber: true })}
                type="number"
                step="any"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                {...register('longitude', { valueAsNumber: true })}
                type="number"
                step="any"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Textarea {...register('amenities')} />
          </div>

          <div>
            <Label htmlFor="features">Features (JSON array)</Label>
            <Textarea {...register('features')} defaultValue="[]" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {compound ? 'Update' : 'Create'} Compound
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompoundModal;
