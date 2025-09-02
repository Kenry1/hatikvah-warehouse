import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function MetricsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: MetricsCardProps) {
  const variants = {
    default: 'border-l-4 border-l-primary bg-gradient-to-br from-card to-muted/30',
    success: 'border-l-4 border-l-success bg-gradient-to-br from-success/5 to-success/10',
    warning: 'border-l-4 border-l-warning bg-gradient-to-br from-warning/5 to-warning/10',
    danger: 'border-l-4 border-l-danger bg-gradient-to-br from-danger/5 to-danger/10',
  };

  const iconVariants = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", variants[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "text-xs font-medium",
                trend.positive ? "text-success" : "text-danger"
              )}>
                {trend.value}
              </div>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", iconVariants[variant], "bg-current/10")}> 
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
