import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./lib/supabase/auth";
import { WishlistProvider } from "./components/wishlist/WishlistContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Layout from "./components/layout/Layout";
import { initGA, trackPageView } from "./lib/analytics";
import HomePage from "./pages/HomePage";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import PasswordResetForm from "./components/auth/PasswordResetForm";
import UpdatePasswordForm from "./components/auth/UpdatePasswordForm";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import PropertiesPage from "./pages/PropertiesPage";
import CityPage from "./pages/city/[city]";
import MessagesPage from "./pages/MessagesPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LaunchDetailPage from "./pages/LaunchDetailPage";
import UserProfile from "./pages/UserProfile";
import AddListingForm from "./components/vendor/AddListingForm";
import EditListingPage from "./pages/EditListingPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

const App = () => {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <WishlistProvider>
              <BrowserRouter>
                <AnalyticsTracker />
                <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<PasswordResetForm />} />
                <Route path="/reset-password" element={<UpdatePasswordForm />} />
                <Route path="/" element={
                  <Layout>
                    <HomePage />
                  </Layout>
                } />
                <Route path="/properties" element={
                  <Layout>
                    <PropertiesPage />
                  </Layout>
                } />
                <Route path="/city/:city" element={
                  <Layout>
                    <CityPage />
                  </Layout>
                } />
                <Route path="/listing/:id" element={
                  <Layout>
                    <ListingDetailPage />
                  </Layout>
                } />
                <Route path="/property/:id" element={
                  <Layout>
                    <ListingDetailPage />
                  </Layout>
                } />
                <Route path="/launch/:slug" element={
                  <Layout>
                    <LaunchDetailPage />
                  </Layout>
                } />
                <Route path="/profile" element={
                  <Layout>
                    <UserProfile />
                  </Layout>
                } />
                <Route path="/add-listing" element={
                  <Layout>
                    <AddListingForm />
                  </Layout>
                } />
                <Route path="/edit-listing/:id" element={
                  <Layout>
                    <EditListingPage />
                  </Layout>
                } />
                <Route path="/messages" element={
                  <Layout>
                    <MessagesPage />
                  </Layout>
                } />
                <Route path="/admin" element={
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                } />
                <Route path="/agent-dashboard" element={
                  <Layout>
                    <AgentDashboard />
                  </Layout>
                } />
                <Route path="/buyer-dashboard" element={
                  <Layout>
                    <BuyerDashboard />
                  </Layout>
                } />
                <Route path="/analytics" element={
                  <Layout>
                    <AnalyticsDashboard />
                  </Layout>
                } />
                <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </WishlistProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
