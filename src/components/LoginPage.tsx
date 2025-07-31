
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface LoginPageProps {
  onLogin: (companyName: string, username: string, password: string) => Promise<void>;
  onBackToHome: () => void;
  isLoading: boolean;
}

export function LoginPage({ onLogin, onBackToHome, isLoading }: LoginPageProps) {
  const { getCompanies } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    password: ''
  });
  const { toast } = useToast();
  const companies = getCompanies();

  console.log('Available companies:', companies);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.username || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Submitting login form:', formData);
      await onLogin(formData.companyName, formData.username, formData.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid company name, username, or password.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBackToHome}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Sign In to Your Company</CardTitle>
            <CardDescription className="text-white/70">
              Enter your company credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-white">Company Name</Label>
                <Select
                  value={formData.companyName}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue placeholder="Select your company" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {companies.length === 0 ? (
                      <SelectItem value="no-companies" disabled>
                        No companies available
                      </SelectItem>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  required
                />
              </div>

              <div className="bg-accent/20 p-3 rounded-lg">
                <p className="text-sm text-white/80">
                  <strong>Note:</strong> Create a new company first if you don't see your company in the dropdown. 
                  Use the same email and username you plan to sign in with.
                </p>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
