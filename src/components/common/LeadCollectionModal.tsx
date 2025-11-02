import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { phoneSchema, nameSchema } from '@/utils/validation';
import { trackLeadSubmission, trackFormSubmission, trackUserInteraction } from '@/lib/analytics';

interface LeadFormData {
  name: string;
  phone: string;
  location: string;
  budget?: number;
}

const LeadCollectionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadFormData>();

  useEffect(() => {
    // Check if user has already submitted their info
    const hasSubmitted = localStorage.getItem('leadSubmitted');
    
    if (!hasSubmitted) {
      // Show modal after 2 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsSubmitting(true);

      // Validate name
      const nameValidation = nameSchema.safeParse(data.name);
      if (!nameValidation.success) {
        toast({
          title: 'Invalid Name',
          description: nameValidation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      // Validate phone
      const phoneValidation = phoneSchema.safeParse(data.phone);
      if (!phoneValidation.success) {
        toast({
          title: 'Invalid Phone Number',
          description: phoneValidation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      // Insert lead into database
      const { error } = await supabase
        .from('leads')
        .insert({
          name: data.name.trim(),
          phone: data.phone.trim(),
          location: data.location.trim(),
          budget: data.budget || null,
        });

      if (error) throw error;

      // Mark as submitted in localStorage
      localStorage.setItem('leadSubmitted', 'true');

      // Track lead submission
      trackLeadSubmission(data.location);
      trackFormSubmission('Lead Form');

      toast({
        title: 'Thank you!',
        description: 'We\'ll get back to you soon with matching properties.',
      });

      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find Your Dream Property</DialogTitle>
          <DialogDescription>
            Tell us what you're looking for and we'll help you find the perfect property!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              {...register('phone', { required: 'Phone number is required' })}
              placeholder="+20 1234567890"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Desired Location *</Label>
            <Input
              id="location"
              {...register('location', { required: 'Location is required' })}
              placeholder="e.g., Cairo, Alexandria, Giza"
            />
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="budget">Budget (Optional)</Label>
            <Input
              id="budget"
              type="number"
              {...register('budget', { valueAsNumber: true })}
              placeholder="e.g., 500000"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                trackUserInteraction('Skip Lead Form', 'Lead Modal');
                localStorage.setItem('leadSubmitted', 'true');
                setIsOpen(false);
              }}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCollectionModal;