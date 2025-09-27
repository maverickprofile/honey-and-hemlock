
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthUser extends User {
  role?: 'admin' | 'contractor';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First check for stored admin or contractor session
    const storedAdminSession = localStorage.getItem('admin_session');
    const storedContractorSession = localStorage.getItem('contractor_session');

    if (storedAdminSession) {
      try {
        const adminUser = JSON.parse(storedAdminSession);
        setUser(adminUser);
        setLoading(false);
        return; // Exit early if we have a stored session
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    } else if (storedContractorSession) {
      try {
        const contractorUser = JSON.parse(storedContractorSession);
        setUser(contractorUser);
        setLoading(false);
        return; // Exit early if we have a stored session
      } catch (error) {
        localStorage.removeItem('contractor_session');
      }
    }

    // Set up auth state listener for Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          const authUser: AuthUser = {
            ...session.user,
            role: session.user.user_metadata?.role ||
                  (session.user.email === 'admin' || session.user.email === 'admin@honeyandhemlock.productions' ? 'admin' : undefined)
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const authUser: AuthUser = {
          ...session.user,
          role: session.user.user_metadata?.role ||
                (session.user.email === 'admin' || session.user.email === 'admin@honeyandhemlock.productions' ? 'admin' : undefined)
        };
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Session check failed:', error);
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if this is the admin user trying to log in
      if (email === 'admin' || email === 'admin@honeyandhemlock.productions') {
        // For admin, check credentials directly
        const ADMIN_PASSWORD = 'Neurobit@123';
        
        if (password !== ADMIN_PASSWORD) {
          return { success: false, error: 'Invalid admin credentials' };
        }

        // Try to use the database function first (non-critical for basic functionality)
        let data = null;
        try {
          const result = await supabase.rpc('authenticate_admin', {
            admin_email: email,
            admin_password: password
          }).maybeSingle();
          data = result.data;
        } catch (dbError) {
          console.log('Database admin auth failed, using local auth:', dbError);
          // Continue with local authentication below
        }

        // Create admin user session
        const adminUser: AuthUser = {
          id: data?.id || 'admin-user-id',
          email: email,
          user_metadata: { role: 'admin', name: 'Administrator' },
          role: 'admin',
          isAdmin: true,
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          app_metadata: {},
          confirmed_at: new Date().toISOString(),
        };

        setUser(adminUser);
        // Store admin session in localStorage for persistence
        localStorage.setItem('admin_session', JSON.stringify(adminUser));
        return { success: true };
      }

      // Simple test contractor login - bypass RPC for now
      if (email === 'test' && password === 'test') {
        console.log('Test contractor login detected');
        
        // Fetch the test contractor directly from judges table
        const { data: testJudge, error: fetchError } = await supabase
          .from('judges')
          .select('*')
          .eq('email', 'test')
          .single();
        
        console.log('Test judge fetch:', { testJudge, fetchError });
        
        if (testJudge && testJudge.status === 'approved') {
          const contractorUser: AuthUser = {
            id: testJudge.id,
            email: testJudge.email,
            user_metadata: { role: 'contractor', name: testJudge.name },
            role: 'contractor',
            isAdmin: false,
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
            confirmed_at: new Date().toISOString(),
          };

          setUser(contractorUser);
          localStorage.setItem('contractor_session', JSON.stringify(contractorUser));
          return { success: true };
        }
      }
      
      // Try judge authentication with RPC (keeping as fallback)
      console.log('Attempting contractor login with RPC:', { email });
      
      try {
        const { data: judgeData, error: judgeError } = await supabase.rpc('authenticate_judge', {
          judge_email: email,
          judge_password: password
        });

        console.log('Judge auth response:', { 
          email, 
          judgeData, 
          judgeError,
          hasData: !!judgeData,
          dataType: typeof judgeData,
          isArray: Array.isArray(judgeData)
        });

        // Check if we got any data back
        if (!judgeError && judgeData) {
          console.log('Judge data received, processing...');
          // Handle both array and single object responses
          const judgeRecord = Array.isArray(judgeData) ? judgeData[0] : judgeData;
          
          // Create a session for the judge/contractor
          const contractorUser: AuthUser = {
            id: judgeRecord.id,
            email: judgeRecord.email,
            user_metadata: { role: 'contractor', name: judgeRecord.name },
            role: 'contractor',
            isAdmin: false,
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
            confirmed_at: new Date().toISOString(),
          };

          setUser(contractorUser);
          // Store contractor session in localStorage for persistence
          localStorage.setItem('contractor_session', JSON.stringify(contractorUser));
          return { success: true };
        }
      } catch (rpcError) {
        console.error('RPC error:', rpcError);
      }

      // If contractor auth failed, try regular Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: 'Invalid credentials' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    // Clear admin session if it exists
    localStorage.removeItem('admin_session');
    // Clear contractor session if it exists
    localStorage.removeItem('contractor_session');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };


  return (
    <AuthContext.Provider value={{
      user,
      session,
      login,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
