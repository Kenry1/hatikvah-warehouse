import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StatsCardData } from '@/types/common';

interface StatsCardProps {
  data: StatsCardData;
  className?: string;
}

export function StatsCard({ data, className }: StatsCardProps) {
  const { title, value, change, icon, color = 'blue' } = data;

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
    green: 'bg-green-500/10 text-green-600 border-green-200',
    red: 'bg-red-500/10 text-red-600 border-red-200',
    yellow: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200'
  };

  return (
    <Card className={`${className} transition-all hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            <span className="text-sm">{icon}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <Badge 
              variant={change.type === 'increase' ? 'default' : 'secondary'}
              className={`
                ${change.type === 'increase' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                  : 'bg-red-100 text-red-800 hover:bg-red-100'
                }
              `}
            >
              {change.type === 'increase' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change.value)}%
            </Badge>
          )}
        </div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}% from {change.period}
          </p>
        )}
      </CardContent>
    </Card>
  );
}