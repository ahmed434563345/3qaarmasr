import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, LogOut, Settings, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '../../lib/supabase/auth';
import { Button } from '@/components/ui/button';
import { useWishlist } from '../wishlist/WishlistContext';
import { trackNavigation, trackButtonClick } from '@/lib/analytics';

const Header = () => {
  const { user, role, isAgentApproved, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!role) return '/';
    switch (role) {
      case 'admin':
        return '/admin';
      case 'agent':
        return '/agent-dashboard';
      default:
        return '/buyer-dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl group-hover:scale-105 transition-all duration-200 shadow-lg">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">3aqark</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/properties" 
              className="flex items-center space-x-1 text-foreground/80 hover:text-primary transition-all duration-200 font-medium"
              onClick={() => trackNavigation('Properties')}
            >
              <Building2 className="h-4 w-4" />
              <span>Properties</span>
            </Link>
            <Link 
              to="/sell-property" 
              className="text-foreground/80 hover:text-primary transition-all duration-200 font-medium"
              onClick={() => trackNavigation('Sell Property')}
            >
              Sell Property
            </Link>
            {user && (
              <>
                <Link 
                  to="/messages" 
                  className="flex items-center space-x-1 text-foreground/80 hover:text-primary transition-all duration-200 font-medium"
                  onClick={() => trackNavigation('Messages')}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 text-foreground/80 hover:text-primary transition-all duration-200 relative font-medium"
                  onClick={() => trackNavigation('Wishlist')}
                >
                  <Heart className="h-4 w-4" />
                  <span>Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-scale-in">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {role === 'agent' && (
              <Button 
                variant="default" 
                asChild
                onClick={() => trackNavigation('Add Property')}
              >
                <Link to="/add-listing">Add Property</Link>
              </Button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-accent/50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-foreground font-medium">{user.name || user.email}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-card/90 border border-border/40 rounded-xl shadow-lg py-2 z-50 animate-scale-in supports-[backdrop-filter]:bg-card/70">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-foreground hover:bg-accent/50 rounded-lg mx-2 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-foreground hover:bg-accent/50 rounded-lg mx-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/properties"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building2 className="h-4 w-4" />
                <span>Properties</span>
              </Link>
              <Link
                to="/sell-property"
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building2 className="h-4 w-4" />
                <span>Sell Property</span>
              </Link>
              {user && (
                <>
                  <Link
                    to="/messages"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Wishlist ({wishlist.length})</span>
                  </Link>
                </>
              )}
              {role === 'agent' && (
                <Link
                  to="/add-listing"
                  className="flex items-center space-x-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Add Property</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
