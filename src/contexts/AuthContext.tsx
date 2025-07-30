import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Company = Database['public']['Tables']['companies']['Row'];

interface CreateCompanyData {
  companyName: string;
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  signUp: (email: string, password: string, userData: {
    username: string;
    first_name: string;
    last_name: string;
    company_id: string;
    role: string;
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  login: (companyName: string, username: string, password: string) => Promise<void>;
  createCompany: (data: CreateCompanyData) => Promise<void>;
  getCompanies: () => Company[];
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setProfile(profile);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setProfile(profile);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: {
    username: string;
    first_name: string;
    last_name: string;
    company_id: string;
    role: string;
  }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const getCompanies = (): Company[] => {
    // Mock companies for compatibility
    return [
      { id: '11111111-1111-1111-1111-111111111111', name: 'TechCorp Solutions', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: '22222222-2222-2222-2222-222222222222', name: 'BuildMaster Construction', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: '33333333-3333-3333-3333-333333333333', name: 'GlobalNet Services', created_at: '2024-01-01', updated_at: '2024-01-01' }
    ];
  };

  const login = async (companyName: string, username: string, password: string) => {
    // Find user by company and username, then sign in with email
    const companies = getCompanies();
    const company = companies.find(c => c.name === companyName);
    
    if (!company) {
      throw new Error('Company not found');
    }
    
    // Create email from username and company (for demo purposes)
    const email = `${username}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    
    const { error } = await signIn(email, password);
    if (error) {
      throw new Error('Invalid credentials');
    }
  };

  const createCompany = async (data: CreateCompanyData) => {
    try {
      console.log('Creating company with data:', data);
      
      // First create company in database
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{ name: data.companyName }])
        .select()
        .single();
      
      console.log('Company creation result:', { company, error: companyError });
      
      if (companyError) {
        console.error('Company creation error:', companyError);
        throw new Error(`Failed to create company: ${companyError.message}`);
      }
      
      console.log('Created company:', company);
      
      // Then create admin user
      const { error } = await signUp(data.adminEmail, data.adminPassword, {
        username: data.adminUsername,
        first_name: '',
        last_name: '',
        company_id: company.id,
        role: 'ICT'
      });
      
      console.log('User creation result:', { error });
      
      if (error) {
        console.error('User creation error:', error);
        throw new Error(`Failed to create admin user: ${error.message}`);
      }
      
      console.log('Company and user created successfully');
    } catch (error) {
      console.error('createCompany failed:', error);
      throw error;
    }
  };

  const logout = () => {
    signOut();
  };

  const value = {
    user,
    profile,
    session,
    signUp,
    signIn,
    signOut,
    login,
    createCompany,
    getCompanies,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}