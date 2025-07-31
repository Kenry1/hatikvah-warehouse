
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
  const [companies, setCompanies] = useState<Company[]>([]);

  // Fetch companies from database
  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }
      
      console.log('Fetched companies:', data);
      setCompanies(data || []);
    } catch (error) {
      console.error('Error in fetchCompanies:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
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
            console.log('Fetched profile:', profile);
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

    // Fetch companies on component mount
    fetchCompanies();

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
    return companies;
  };

  const login = async (companyName: string, username: string, password: string) => {
    try {
      console.log('Attempting login with:', { companyName, username });
      
      // Find the company first
      const company = companies.find(c => c.name === companyName);
      if (!company) {
        console.error('Company not found:', companyName);
        throw new Error('Company not found');
      }

      console.log('Found company:', company);

      // Find user by username and company_id
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('company_id', company.id);

      if (profileError) {
        console.error('Error finding user profile:', profileError);
        throw new Error('Error finding user');
      }

      if (!profiles || profiles.length === 0) {
        console.error('User not found with username:', username, 'in company:', companyName);
        throw new Error('User not found');
      }

      const userProfile = profiles[0];
      console.log('Found user profile:', userProfile);

      // Sign in with email and password
      console.log('Attempting signIn with email:', userProfile.email);
      const { error } = await signIn(userProfile.email, password);
      if (error) {
        console.error('Sign in error details:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid password for this user');
        }
        throw new Error(`Authentication failed: ${error.message}`);
      }

      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
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
      
      // Refresh companies list
      await fetchCompanies();
      
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
