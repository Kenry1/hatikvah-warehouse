import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionPanelItem } from '@/types/common';

interface ActionPanelProps {
  title: string;
  description?: string;
  actions: ActionPanelItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ActionPanel({ 
  title, 
  description, 
  actions, 
  columns = 2,
  className 
}: ActionPanelProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
      default:
        return 'bg-card text-card-foreground hover:bg-accent border';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {actions.length > 0 && (
            <Badge variant="secondary">{actions.length} actions</Badge>
          )}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className={`grid gap-3 ${gridClasses[columns]}`}>
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              onClick={action.action}
              className={`h-auto p-4 flex flex-col items-center gap-2 ${getVariantClasses(action.variant)}`}
            >
              <div className="text-2xl">{action.icon}</div>
              <div className="text-center">
                <div className="font-medium">{action.title}</div>
                {action.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        {actions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No actions available
          </div>
        )}
      </CardContent>
    </Card>
  );
}