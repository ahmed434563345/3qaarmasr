import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Building2, Mail, Phone, Calendar, 
  CheckCircle, XCircle, Eye, Ban, UserCheck, UserPlus 
} from 'lucide-react';
import AddAgentModal from './AddAgentModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Agent {
  id: string;
  user_id: string;
  created_at: string;
  approved: boolean;
  profiles: {
    name: string;
    email: string;
    phone: string | null;
  };
}

interface AgentWithListings extends Agent {
  properties: any[];
  totalListings: number;
  activeListings: number;
  pendingListings: number;
}

const AgentManagementView = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentWithListings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithListings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);

      // Fetch all agent approvals
      const { data: agentData, error: agentError } = await supabase
        .from('agent_approvals')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentError) throw agentError;

      // Fetch profiles and properties for each agent
      const enrichedAgents = await Promise.all(
        (agentData || []).map(async (agent) => {
          // Fetch profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, email, phone')
            .eq('id', agent.user_id)
            .single();

          // Fetch properties
          const { data: propertiesData } = await supabase
            .from('properties')
            .select('*')
            .eq('agent_id', agent.user_id);

          const properties = propertiesData || [];
          const totalListings = properties.length;
          const activeListings = properties.filter(p => p.status === 'approved').length;
          const pendingListings = properties.filter(p => p.status === 'pending').length;

          return {
            ...agent,
            profiles: profileData || { name: 'Unknown', email: 'Unknown', phone: null },
            properties,
            totalListings,
            activeListings,
            pendingListings,
          };
        })
      );

      setAgents(enrichedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agents data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (agentId: string, userId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('agent_approvals')
        .update({ 
          approved: approve,
          approved_at: approve ? new Date().toISOString() : null,
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: approve ? 'Agent Approved' : 'Agent Rejected',
        description: approve 
          ? 'The agent can now create listings' 
          : 'The agent approval has been rejected',
      });

      fetchAgents();
    } catch (error) {
      console.error('Error updating agent approval:', error);
      toast({
        title: 'Error',
        description: 'Failed to update agent status',
        variant: 'destructive',
      });
    }
  };

  const viewAgentDetails = (agent: AgentWithListings) => {
    setSelectedAgent(agent);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const approvedAgents = agents.filter(a => a.approved);
  const pendingAgents = agents.filter(a => !a.approved);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Agent Management</h2>
          <p className="text-muted-foreground">Manage agent accounts and approvals</p>
        </div>
        <Button onClick={() => setIsAddAgentModalOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Agent
        </Button>
      </div>

      <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onClose={() => setIsAddAgentModalOpen(false)}
        onSuccess={fetchAgents}
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedAgents.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingAgents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading agents...</p>
              </CardContent>
            </Card>
          ) : agents.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No agents found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.profiles.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {agent.profiles.email}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={agent.approved ? 'default' : 'secondary'}>
                        {agent.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {agent.profiles.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {agent.profiles.phone}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{agent.totalListings}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{agent.activeListings}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                      <div className="p-3 bg-orange-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{agent.pendingListings}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(agent.created_at)}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => viewAgentDetails(agent)} 
                        variant="outline" 
                        className="flex-1"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {!agent.approved && (
                        <Button 
                          onClick={() => handleApproval(agent.id, agent.user_id, true)}
                          size="sm"
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.profiles.name}</CardTitle>
                        <CardDescription>{agent.profiles.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{agent.totalListings}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{agent.activeListings}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{agent.pendingListings}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => viewAgentDetails(agent)} 
                    variant="outline" 
                    className="w-full"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Listings
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingAgents.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No pending agent approvals</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{agent.profiles.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.profiles.email}</p>
                          {agent.profiles.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {agent.profiles.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleApproval(agent.id, agent.user_id, true)}
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleApproval(agent.id, agent.user_id, false)}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Agent Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Agent Details & Listings</DialogTitle>
            <DialogDescription>
              {selectedAgent?.profiles.name} - {selectedAgent?.profiles.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAgent && (
            <div className="space-y-6">
              {/* Agent Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-foreground">{selectedAgent.totalListings}</p>
                    <p className="text-sm text-muted-foreground">Total Listings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{selectedAgent.activeListings}</p>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-orange-600">{selectedAgent.pendingListings}</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </CardContent>
                </Card>
              </div>

              {/* Listings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Properties</h3>
                {selectedAgent.properties.length === 0 ? (
                  <p className="text-muted-foreground">No listings yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAgent.properties.map((property) => (
                      <Card key={property.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold">{property.title}</h4>
                                <Badge variant={
                                  property.status === 'approved' ? 'default' :
                                  property.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }>
                                  {property.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {property.city}, {property.state}
                              </p>
                              <p className="text-sm font-semibold text-primary mt-2">
                                EGP {property.price.toLocaleString()}
                              </p>
                              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <span>{property.bedrooms} beds</span>
                                <span>{property.bathrooms} baths</span>
                                <span>{property.square_feet} sqft</span>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/listing/${property.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentManagementView;
