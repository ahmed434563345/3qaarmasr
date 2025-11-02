import React, { useState, useEffect } from 'react';
import { Users, Building2, TrendingUp, MessageSquare, Eye, CheckCircle, XCircle, AlertTriangle, Plus, BarChart3, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../lib/supabase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AppointmentsView from '../components/admin/AppointmentsView';
import AgentManagementView from '../components/admin/AgentManagementView';
import LaunchesManagement from '../components/admin/LaunchesManagement';
import CompoundsManagement from '../components/admin/CompoundsManagement';

const AdminDashboard = () => {
  const { role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    pendingApprovals: 0,
    totalLeads: 0,
  });
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [pendingAgents, setPendingAgents] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsFilter, setListingsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (role === 'admin') {
      fetchDashboardData();
    }
  }, [role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active listings
      const { count: activeListingsCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch pending approvals (agents)
      const { count: pendingApprovalsCount } = await supabase
        .from('agent_approvals')
        .select('*', { count: 'exact', head: true })
        .eq('approved', false);

      // Fetch total leads
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Fetch pending properties
      const { data: pendingProps } = await supabase
        .from('properties')
        .select('id, title, price, created_at, agent_id')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch agent profiles for pending properties
      const agentIds = pendingProps?.map(p => p.agent_id).filter(Boolean) || [];
      const { data: agentProfiles } = agentIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', agentIds) : { data: [] };

      // Map agent data to properties
      const pendingWithAgents = pendingProps?.map(prop => ({
        ...prop,
        agent: agentProfiles?.find(a => a.id === prop.agent_id)
      })) || [];

      // Fetch all properties for listings management
      const { data: allProps } = await supabase
        .from('properties')
        .select('id, title, price, status, created_at, city, property_type, agent_id')
        .order('created_at', { ascending: false });

      // Fetch agent profiles for all properties
      const allAgentIds = allProps?.map(p => p.agent_id).filter(Boolean) || [];
      const { data: allAgentProfiles } = allAgentIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', [...new Set(allAgentIds)]) : { data: [] };

      // Map agent data to all properties
      const allWithAgents = allProps?.map(prop => ({
        ...prop,
        agent: allAgentProfiles?.find(a => a.id === prop.agent_id)
      })) || [];

      // Fetch pending agent approvals
      const { data: pendingAgentData, error: agentError } = await supabase
        .from('agent_approvals')
        .select('id, user_id, created_at')
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (agentError) {
        console.error('Error fetching agent approvals:', agentError);
      }

      // Fetch profiles for pending agents
      let enrichedAgents: any[] = [];
      if (pendingAgentData && pendingAgentData.length > 0) {
        enrichedAgents = await Promise.all(
          pendingAgentData.map(async (agent) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, email, phone')
              .eq('id', agent.user_id)
              .single();

            return {
              ...agent,
              profiles: profileData || { name: 'Unknown', email: 'Unknown', phone: 'N/A' },
            };
          })
        );
      }

      // Fetch all leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all users (buyers)
      const { data: usersData } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          phone,
          created_at
        `)
        .order('created_at', { ascending: false });

      setStats({
        totalUsers: usersCount || 0,
        activeListings: activeListingsCount || 0,
        pendingApprovals: pendingApprovalsCount || 0,
        totalLeads: leadsCount || 0,
      });

      setPendingListings(pendingWithAgents || []);
      setAllListings(allWithAgents || []);
      setPendingAgents(enrichedAgents || []);
      setLeads(leadsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'approved' })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Property approved successfully',
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error approving property:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve property',
        variant: 'destructive',
      });
    }
  };

  const handleRejectProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'rejected' })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Property rejected',
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject property',
        variant: 'destructive',
      });
    }
  };

  const handleApproveAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agent_approvals')
        .update({ 
          approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('user_id', agentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent approved successfully',
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error approving agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve agent',
        variant: 'destructive',
      });
    }
  };

  const handleRejectAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agent_approvals')
        .delete()
        .eq('user_id', agentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent application rejected',
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject agent',
        variant: 'destructive',
      });
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const statsDisplay = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Active Listings',
      value: stats.activeListings.toLocaleString(),
      icon: Building2,
      color: 'text-green-600'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your marketplace platform</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Advanced Analytics
            </Button>
            <Button 
              onClick={() => navigate('/add-listing')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Listing
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="launches">Launches</TabsTrigger>
            <TabsTrigger value="compounds">Compounds</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Listing Approvals</CardTitle>
                <CardDescription>
                  New listings waiting for your review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : pendingListings.length === 0 ? (
                  <p className="text-muted-foreground">No pending listings</p>
                ) : (
                  <div className="space-y-4">
                    {pendingListings.map((listing) => (
                      <div key={listing.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{listing.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              by {listing.agent?.name || listing.agent?.email || 'Unknown'} • EGP {listing.price?.toLocaleString()} • {formatTimeAgo(listing.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 border-green-600"
                            onClick={() => handleApproveProperty(listing.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-600"
                            onClick={() => handleRejectProperty(listing.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/listing/${listing.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <AgentManagementView />
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Requests</CardTitle>
                <CardDescription>Manage property viewing appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentsView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : users.length === 0 ? (
                  <p className="text-muted-foreground">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Phone</th>
                          <th className="text-left p-2">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{user.name || 'N/A'}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.phone || 'N/A'}</td>
                            <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Leads Data</CardTitle>
                <CardDescription>All visitor leads collected from the website</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : leads.length === 0 ? (
                  <p className="text-muted-foreground">No leads yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Phone</th>
                          <th className="text-left p-2">Location</th>
                          <th className="text-left p-2">Budget</th>
                          <th className="text-left p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{lead.name}</td>
                            <td className="p-2">{lead.phone}</td>
                            <td className="p-2">{lead.location}</td>
                            <td className="p-2">{lead.budget ? `EGP ${lead.budget.toLocaleString()}` : 'Not specified'}</td>
                            <td className="p-2">{new Date(lead.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Listing Management</CardTitle>
                <CardDescription>Review and manage all property listings from agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filter Tabs */}
                  <div className="flex gap-2 border-b pb-4">
                    <Button
                      variant={listingsFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setListingsFilter('all')}
                    >
                      All ({allListings.length})
                    </Button>
                    <Button
                      variant={listingsFilter === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setListingsFilter('pending')}
                    >
                      Pending ({allListings.filter(l => l.status === 'pending').length})
                    </Button>
                    <Button
                      variant={listingsFilter === 'approved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setListingsFilter('approved')}
                    >
                      Approved ({allListings.filter(l => l.status === 'approved').length})
                    </Button>
                    <Button
                      variant={listingsFilter === 'rejected' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setListingsFilter('rejected')}
                    >
                      Rejected ({allListings.filter(l => l.status === 'rejected').length})
                    </Button>
                  </div>

                  {/* Listings Table */}
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : allListings.filter(l => listingsFilter === 'all' || l.status === listingsFilter).length === 0 ? (
                    <p className="text-muted-foreground">No listings found</p>
                  ) : (
                    <div className="space-y-3">
                      {allListings
                        .filter(l => listingsFilter === 'all' || l.status === listingsFilter)
                        .map((listing) => (
                          <div key={listing.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-primary mt-1" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-lg">{listing.title}</h4>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      listing.status === 'approved' ? 'bg-green-100 text-green-700' :
                                      listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    <span className="font-medium">Agent:</span> {listing.agent?.name || listing.agent?.email || 'Unknown'}
                                    {listing.agent?.phone && ` • ${listing.agent.phone}`}
                                  </p>
                                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="font-semibold text-primary">EGP {listing.price?.toLocaleString()}</span>
                                    <span>• {listing.city}</span>
                                    <span>• {listing.property_type}</span>
                                    <span>• {formatTimeAgo(listing.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/edit-listing/${listing.id}`)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              {listing.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => handleApproveProperty(listing.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleRejectProperty(listing.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {listing.status === 'approved' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleRejectProperty(listing.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              )}
                              {listing.status === 'rejected' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleApproveProperty(listing.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              )}
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/property/${listing.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Message Center</CardTitle>
                <CardDescription>Monitor platform communications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Message monitoring interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="launches">
            <LaunchesManagement />
          </TabsContent>

          <TabsContent value="compounds">
            <CompoundsManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics</CardTitle>
                <CardDescription>Website traffic and user behavior insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Analytics Integration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Google Analytics is tracking your website. To view detailed analytics data:
                    </p>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                      <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics</a></li>
                      <li>Sign in with your Google account</li>
                      <li>Select your property to view reports</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Page Views</h4>
                      <p className="text-muted-foreground text-sm">View real-time page views in your Google Analytics dashboard</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">User Sessions</h4>
                      <p className="text-muted-foreground text-sm">Track user sessions and engagement metrics</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Traffic Sources</h4>
                      <p className="text-muted-foreground text-sm">See where your visitors are coming from</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">User Demographics</h4>
                      <p className="text-muted-foreground text-sm">Understand your audience demographics</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
