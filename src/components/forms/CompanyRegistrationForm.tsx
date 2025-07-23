import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Mail, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompanyRegistrationFormProps {
  onSubmit: (data: CompanyRegistrationData) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

export interface CompanyRegistrationData {
  companyName: string;
  companyDescription: string;
  industry: string;
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
  confirmPassword: string;
}

export function CompanyRegistrationForm({ onSubmit, onBack, isLoading = false }: CompanyRegistrationFormProps) {
  const [formData, setFormData] = useState<CompanyRegistrationData>({
    companyName: '',
    companyDescription: '',
    industry: '',
    adminEmail: '',
    adminUsername: '',
    adminPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email format';
    }
    if (!formData.adminUsername.trim()) {
      newErrors.adminUsername = 'Admin username is required';
    } else if (formData.adminUsername.length < 3) {
      newErrors.adminUsername = 'Username must be at least 3 characters';
    }
    if (!formData.adminPassword) {
      newErrors.adminPassword = 'Password is required';
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = 'Password must be at least 8 characters';
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const updateField = (field: keyof CompanyRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-white hover:bg-white/10"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-white">Start Your Free Trial</CardTitle>
            <CardDescription className="text-white/70 text-lg">
              Create your company account and get started with our comprehensive operations management platform
            </CardDescription>
            <Badge className="bg-green-600 text-white w-fit mx-auto mt-2">
              <CheckCircle className="mr-1 h-3 w-3" />
              ICT Administrator Account
            </Badge>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="Enter your company name"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    disabled={isLoading}
                  />
                  {errors.companyName && (
                    <p className="text-red-300 text-sm">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-white">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => updateField('industry', e.target.value)}
                    placeholder="e.g., Technology, Manufacturing, Healthcare"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDescription" className="text-white">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    value={formData.companyDescription}
                    onChange={(e) => updateField('companyDescription', e.target.value)}
                    placeholder="Brief description of your company and its operations"
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50 min-h-20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Admin Account */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Administrator Account
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail" className="text-white flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => updateField('adminEmail', e.target.value)}
                      placeholder="admin@yourcompany.com"
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                      disabled={isLoading}
                    />
                    {errors.adminEmail && (
                      <p className="text-red-300 text-sm">{errors.adminEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminUsername" className="text-white flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Username *
                    </Label>
                    <Input
                      id="adminUsername"
                      value={formData.adminUsername}
                      onChange={(e) => updateField('adminUsername', e.target.value)}
                      placeholder="admin"
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                      disabled={isLoading}
                    />
                    {errors.adminUsername && (
                      <p className="text-red-300 text-sm">{errors.adminUsername}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword" className="text-white flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      Password *
                    </Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) => updateField('adminPassword', e.target.value)}
                      placeholder="Enter secure password"
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                      disabled={isLoading}
                    />
                    {errors.adminPassword && (
                      <p className="text-red-300 text-sm">{errors.adminPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-300 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="bg-accent/20 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">What you'll get:</h4>
                <ul className="text-sm text-white/80 space-y-1">
                  <li>• Complete IT department management system</li>
                  <li>• User management and role-based access control</li>
                  <li>• Integrated ticketing and workflow management</li>
                  <li>• Real-time analytics and reporting</li>
                  <li>• 30-day free trial with full access</li>
                </ul>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-white py-6 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Your Account...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}