import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  previousValue?: string | number
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  description?: string
  className?: string
}

export function KPICard({
  title,
  value,
  previousValue,
  icon,
  trend = "neutral",
  trendValue,
  description,
  className
}: KPICardProps) {
  const getTrendIcon = () => {
    if (trend === "up") {
      return <ArrowUpIcon className="h-3 w-3 text-success" />
    }
    if (trend === "down") {
      return <ArrowDownIcon className="h-3 w-3 text-destructive" />
    }
    return null
  }

  const getTrendColor = () => {
    if (trend === "up") return "text-success"
    if (trend === "down") return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <Card className={cn("bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {(trendValue || previousValue) && (
          <div className="flex items-center gap-2 text-xs">
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {trendValue || (previousValue && `vs. ${previousValue}`)}
            </span>
            {description && (
              <span className="text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
