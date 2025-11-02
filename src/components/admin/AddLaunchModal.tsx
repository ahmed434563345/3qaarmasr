import React, { useEffect, useState } from 'react';
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
import { useCreateLaunch, useUpdateLaunch, Launch } from '@/hooks/useLaunches';

interface AddLaunchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  launch?: Launch | null;
}

const AddLaunchModal = ({ open, onOpenChange, launch }: AddLaunchModalProps) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const createLaunch = useCreateLaunch();
  const updateLaunch = useUpdateLaunch();
  const [features, setFeatures] = useState<string>('');
  const [amenities, setAmenities] = useState<string>('');
  const [paymentPlans, setPaymentPlans] = useState<string>('');

  useEffect(() => {
    if (launch) {
      Object.entries(launch).forEach(([key, value]) => {
        setValue(key, value);
      });
      setFeatures(JSON.stringify(launch.features || [], null, 2));
      setAmenities((launch.amenities || []).join(', '));
      setPaymentPlans(JSON.stringify(launch.payment_plans || [], null, 2));
    } else {
      reset();
      setFeatures('[]');
      setAmenities('');
      setPaymentPlans('[]');
    }
  }, [launch, reset, setValue]);

  const onSubmit = async (data: any) => {
    try {
      // Safely parse JSON-like inputs; tolerate simple comma lists
      const parseJsonArray = (txt: string): any[] => {
        if (!txt) return [];
        try {
          const val = JSON.parse(txt);
          return Array.isArray(val) ? val : [];
        } catch {
          return [];
        }
      };

      const featuresParsed = parseJsonArray(features);
      const featuresValue =
        featuresParsed.length > 0
          ? featuresParsed
          : (features || '')
              .replace(/[\[\]]/g, '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);

      const paymentPlansValue = parseJsonArray(paymentPlans);

      const launchData = {
        ...data,
        features: featuresValue,
        amenities: amenities ? amenities.split(',').map((a) => a.trim()).filter(Boolean) : [],
        payment_plans: paymentPlansValue,
        developer_start_price: data.developer_start_price ? parseFloat(data.developer_start_price) : null,
        resale_start_price: data.resale_start_price ? parseFloat(data.resale_start_price) : null,
      };

      if (launch) {
        await updateLaunch.mutateAsync({ id: launch.id, ...launchData });
      } else {
        await createLaunch.mutateAsync(launchData);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Error saving launch:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{launch ? 'Edit Launch' : 'Add New Launch'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug * (URL friendly, e.g., ras-el-hekma)</Label>
            <Input id="slug" {...register('slug', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input id="location" {...register('location', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input id="logo_url" {...register('logo_url')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_image_url">Hero Image URL</Label>
              <Input id="hero_image_url" {...register('hero_image_url')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="developer_start_price">Developer Start Price</Label>
              <Input
                id="developer_start_price"
                type="number"
                {...register('developer_start_price')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resale_start_price">Resale Start Price</Label>
              <Input
                id="resale_start_price"
                type="number"
                {...register('resale_start_price')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="master_plan_url">Master Plan URL</Label>
            <Input id="master_plan_url" {...register('master_plan_url')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features (JSON array)</Label>
            <Textarea
              id="features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={3}
              placeholder='[{"icon": "plane", "label": "Dedicated Airport"}]'
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities (comma separated)</Label>
            <Input
              id="amenities"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="Pool, Gym, Parking"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_plans">Payment Plans (JSON array)</Label>
            <Textarea
              id="payment_plans"
              value={paymentPlans}
              onChange={(e) => setPaymentPlans(e.target.value)}
              rows={3}
              placeholder='[{"name": "Original Plan", "downPayment": 5, "years": 8}]'
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {launch ? 'Update' : 'Create'} Launch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLaunchModal;
