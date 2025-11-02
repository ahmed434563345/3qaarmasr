import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CheckCircle, XCircle, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  appointment_date: string;
  message: string;
  status: string;
  created_at: string;
  properties: {
    title: string;
    address: string;
  };
  buyer_profile: {
    name: string;
    email: string;
    phone: string;
  };
  agent_profile: {
    name: string;
    email: string;
  };
}

const AppointmentsView = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          message,
          status,
          created_at,
          property_id,
          buyer_id,
          agent_id
        `)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      // Fetch related data separately
      if (data) {
        const enrichedData = await Promise.all(
          data.map(async (appointment) => {
            const [propertyData, buyerData, agentData] = await Promise.all([
              supabase.from('properties').select('title, address').eq('id', appointment.property_id).single(),
              supabase.from('profiles').select('name, email, phone').eq('id', appointment.buyer_id).single(),
              supabase.from('profiles').select('name, email').eq('id', appointment.agent_id).single(),
            ]);

            return {
              ...appointment,
              properties: propertyData.data || { title: 'Unknown', address: 'Unknown' },
              buyer_profile: buyerData.data || { name: 'Unknown', email: 'Unknown', phone: 'Unknown' },
              agent_profile: agentData.data || { name: 'Unknown', email: 'Unknown' },
            };
          })
        );
        setAppointments(enrichedData);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading appointments...</p>;
  }

  if (appointments.length === 0) {
    return <p className="text-muted-foreground">No appointments found</p>;
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="p-4 border rounded-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium">{appointment.properties?.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{appointment.properties?.address}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(appointment.appointment_date), 'PPP p')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>
                  Buyer: {appointment.buyer_profile?.name} ({appointment.buyer_profile?.email})
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                Agent: {appointment.agent_profile?.name}
              </div>

              {appointment.message && (
                <div className="text-sm bg-muted p-2 rounded">
                  <strong>Message:</strong> {appointment.message}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                Requested: {format(new Date(appointment.created_at), 'PPP')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentsView;