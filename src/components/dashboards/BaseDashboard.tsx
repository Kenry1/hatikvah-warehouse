import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface BaseDashboardProps {
  title: string;
  description: string;
  children: ReactNode;
  stats?: Array<{
    title: string;
    value: string | number;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'success' | 'warning' | 'destructive' | 'primary';
  }>;
}

export function BaseDashboard({ title, description, children, stats }: BaseDashboardProps) {
  const { user, profile } = useAuth();

  const getStatColor = (color?: string) => {
    switch (color) {
      case 'success': return 'bg-success-light text-success border-success/20';
      case 'warning': return 'bg-warning-light text-warning border-warning/20';
      case 'destructive': return 'bg-destructive-light text-destructive border-destructive/20';
      case 'primary': return 'bg-primary-light text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary-light text-primary border-primary/20">
            {user?.role}
          </Badge>
          <Badge variant="outline">
            Company Operations
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  {stat.color && (
                    <Badge className={getStatColor(stat.color)}>
                      {stat.trend === 'up' && '↗'}
                      {stat.trend === 'down' && '↘'}
                      {stat.trend === 'neutral' && '→'}
                    </Badge>
                  )}
                </div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dashboard Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}