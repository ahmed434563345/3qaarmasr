import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/supabase/auth';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { trackAppointmentBooking } from '@/lib/analytics';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  agentId: string;
  propertyTitle: string;
}

interface AppointmentFormData {
  date: Date;
  phone: string;
  message?: string;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  agentId,
  propertyTitle,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AppointmentFormData>();

  const onSubmit = async (data: AppointmentFormData) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to book an appointment.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: 'Date Required',
        description: 'Please select an appointment date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Use selected date
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(9, 0, 0, 0); // Default to 9 AM

      // Insert appointment into database
      const { error } = await supabase
        .from('appointments')
        .insert({
          property_id: propertyId,
          buyer_id: user.id,
          agent_id: agentId,
          appointment_date: appointmentDateTime.toISOString(),
          message: `Phone: ${data.phone}\n\n${data.message || 'No additional message'}`,
          status: 'pending',
        });

      if (error) throw error;

      // Track appointment booking
      trackAppointmentBooking(propertyId);

      toast({
        title: 'Appointment Booked!',
        description: 'Your appointment request has been sent to the agent.',
      });

      onClose();
      reset();
      setSelectedDate(undefined);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Schedule Your Viewing</DialogTitle>
          <DialogDescription>
            Book an appointment to view {propertyTitle}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="bg-muted/50 p-4 rounded-lg">
            <Label htmlFor="date" className="text-base font-semibold mb-2 block">Select Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12 bg-background"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {selectedDate ? format(selectedDate, 'PPPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="phone" className="text-base font-semibold">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="h-12 mt-2"
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[\d\s\+\-\(\)]+$/,
                  message: 'Please enter a valid phone number'
                }
              })}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message" className="text-base font-semibold">Additional Notes (Optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Any specific requests or questions about the property..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 text-base">
              {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentModal;