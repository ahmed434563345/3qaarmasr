import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'buyer' | 'agent' | 'admin';

interface AuthUser extends User {
  name?: string;
  avatar_url?: string;
  phone?: string;
  whatsapp?: string;
  user_roles?: Array<{ role: UserRole }>;
  agent_approvals?: Array<{ approved: boolean }>;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  role: UserRole | null;
  isAgentApproved: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAgentApproved, setIsAgentApproved] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user as AuthUser ?? null);
        
        if (session?.user) {
          // Fetch user profile, role and approval status
          setTimeout(async () => {
            try {
              // Fetch profile data
              const { data: profile } = await supabase
                .from('profiles')
                .select('name, avatar_url, phone, whatsapp')
                .eq('id', session.user.id)
                .maybeSingle();
              
              // Fetch all roles for the user
              const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id);
              
              if (profile) {
                setUser({ 
                  ...session.user, 
                  name: profile.name,
                  avatar_url: profile.avatar_url,
                  phone: profile.phone,
                  whatsapp: profile.whatsapp
                } as AuthUser);
              }
              
              if (userRoles && userRoles.length > 0) {
                // Priority: admin > agent > buyer
                const rolesPriority = ['admin', 'agent', 'buyer'];
                const userRoleValues = userRoles.map(r => r.role);
                const primaryRole = rolesPriority.find(r => userRoleValues.includes(r as UserRole)) || userRoleValues[0];
                
                setRole(primaryRole as UserRole);
                
                if (userRoleValues.includes('agent')) {
                  const { data: approval } = await supabase
                    .from('agent_approvals')
                    .select('approved')
                    .eq('user_id', session.user.id)
                    .maybeSingle();
                  
                  setIsAgentApproved(approval?.approved || false);
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }, 0);
        } else {
          setRole(null);
          setIsAgentApproved(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user as AuthUser ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      role,
      isAgentApproved,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
