import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, Shield, Zap, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateCompanyData } from '@/types/auth';

interface HomePageProps {
  onCompanyCreate: (data: CreateCompanyData) => Promise<void>;
  onSignInClick: () => void;
  isLoading?: boolean;
}

export function HomePage({ onCompanyCreate, onSignInClick, isLoading = false }: HomePageProps) {
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    adminEmail: '',
    adminUsername: '',
    adminPassword: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.adminEmail || !formData.adminUsername || !formData.adminPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onCompanyCreate(formData);
      setShowTrialModal(false);
      toast({
        title: "Company Created Successfully!",
        description: "Your trial account has been set up. Welcome to the platform!",
      });
      // Clear form data
      setFormData({
        companyName: '',
        adminEmail: '',
        adminUsername: '',
        adminPassword: ''
      });
    } catch (error) {
      toast({
        title: "Company Creation Failed",
        description: error instanceof Error ? error.message : "An error occurred while creating your company.",
        variant: "destructive"
      });
    }
  };

  const features = [
    {
      icon: Building2,
      title: "Multi-Department Management",
      description: "Streamline operations across ICT, Finance, HR, Logistics, and more"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Secure permissions and workflows tailored to each department"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with compliance monitoring"
    },
    {
      icon: Zap,
      title: "Real-Time Operations",
      description: "Live dashboards and instant notifications for critical processes"
    }
  ];

  const benefits = [
    "Unified vehicle and asset management",
    "Automated approval workflows",
    "Real-time inventory tracking",
    "Integrated safety compliance",
    "Employee leave management",
    "Project tracking and reporting"
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Enterprise Operations Platform
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Streamline Your
            <br />
            <span className="bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
              Company Operations
            </span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Complete multi-tenant SaaS platform for managing vehicle fleets, employee operations, 
            project tracking, and departmental workflows in one unified system.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => setShowTrialModal(true)}
              className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg shadow-glow"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={onSignInClick}
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Sign In to Existing Company
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-accent" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Everything You Need to Manage Operations</CardTitle>
            <CardDescription className="text-white/70 text-lg">
              Comprehensive tools for every department in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trial Registration Modal */}
      <Dialog open={showTrialModal} onOpenChange={setShowTrialModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Your Free Trial</DialogTitle>
            <DialogDescription>
              Create your company profile and admin account. This trial is exclusively for ICT department personnel.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Enter your company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                placeholder="admin@company.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminUsername">Admin Username</Label>
              <Input
                id="adminUsername"
                value={formData.adminUsername}
                onChange={(e) => setFormData(prev => ({ ...prev, adminUsername: e.target.value }))}
                placeholder="admin"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                placeholder="Enter secure password"
                required
              />
            </div>

            <div className="bg-primary-light p-4 rounded-lg">
              <p className="text-sm text-primary">
                <Shield className="h-4 w-4 inline mr-2" />
                Default role will be set to ICT with full administrative privileges.
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTrialModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Company...
                  </>
                ) : (
                  'Create Company'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}