import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface LoginPageProps {
  onLogin: (companyName: string, username: string, password: string) => Promise<void>;
  onBackToHome: () => void;
  isLoading: boolean;
}

export function LoginPage({ onLogin, onBackToHome, isLoading }: LoginPageProps) {
  const { getCompanies, auth } = useAuth(); // Destructure auth from useAuth
  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    password: ''
  });
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  const { toast } = useToast();

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
      await onLogin(formData.companyName, formData.username, formData.password);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid company name, username, or password.",
        variant: "destructive"
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address to reset your password.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingResetEmail(true);
    try {
      // Firebase sendPasswordResetEmail
      // Ensure 'auth' is available from the useAuth context
      if (auth && auth.currentUser) { // Check if auth is defined and a user is signed in (though password reset doesn't require sign-in)
        // Correct usage with sendPasswordResetEmail (it takes the auth instance and email)
        await auth.sendPasswordResetEmail(resetEmail);
        toast({
          title: "Password Reset Email Sent",
          description: "If an account with that email exists, a password reset link has been sent to your email address.",
        });
        setIsForgotPasswordDialogOpen(false);
        setResetEmail('');
      } else {
        // Fallback or error if auth is not properly initialized or current user is null
        // For password reset, current user is not strictly necessary, but 'auth' object is.
        // It's safer to ensure auth is available.
        // If auth isn't directly exposed or usable like this, the implementation needs to change.
        // For now, assuming `auth` from context is the Firebase auth instance.
        toast({
          title: "Error",
          description: "Firebase Auth instance not available. Please contact support.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Error Sending Reset Email",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingResetEmail(false);
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
                  <SelectContent>
                    {getCompanies().map((company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
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
                <Button variant="link" className="text-white/70 text-sm p-0 h-auto" onClick={() => setIsForgotPasswordDialogOpen(true)}>
                  Forgot password?
                </Button>
              </div>

              <div className="bg-accent/20 p-3 rounded-lg">
                <p className="text-sm text-white/80">
                  <strong>Demo Credentials:</strong><br />
                  Company: TechCorp Solutions<br />
                  Username: admin, finance, hr, management, safety, employee, implmanager, logistics, operations, planning, projectmgr, siteeng, warehouse, procurement<br />
                  Password: password
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

        {/* Forgot Password Dialog */}
        <Dialog open={isForgotPasswordDialogOpen} onOpenChange={setIsForgotPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Forgot Password</DialogTitle>
              <DialogDescription>
                Enter your email address to receive a password reset link.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resetEmail" className="text-right">
                  Email
                </Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="your@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                onClick={handleForgotPassword} 
                disabled={isSendingResetEmail}
              >
                {isSendingResetEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
