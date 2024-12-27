import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle2, Clock, MinusCircle } from 'lucide-react';

type StatusType = 'operational' | 'maintenance' | 'degraded' | 'offline';

interface ServiceStatusProps {
  status: StatusType;
  lastChecked?: string;
}

export function ServiceStatusBadge({
  status,
  lastChecked
}: ServiceStatusProps) {
  const statusConfig = {
    operational: {
      icon: CheckCircle2,
      text: 'Operational',
      variant: 'success'
    },
    maintenance: {
      icon: Clock,
      text: 'Maintenance',
      variant: 'warning'
    },
    degraded: {
      icon: AlertCircle,
      text: 'Degraded',
      variant: 'warning'
    },
    offline: {
      icon: MinusCircle,
      text: 'Offline',
      variant: 'destructive'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={config.variant as any} className="h-5 space-x-1">
            <Icon className="h-3 w-3" />
            <span>{config.text}</span>
          </Badge>
        </TooltipTrigger>
        {lastChecked && (
          <TooltipContent>
            <p>Last checked: {lastChecked}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
