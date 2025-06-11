import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { TicketProgress } from '@/types/ticketCreation';

interface TicketCreationProgressProps {
  progress: TicketProgress;
  onCancel?: () => void;
  onComplete?: () => void;
  showCancelButton?: boolean;
}

export const TicketCreationProgress: React.FC<TicketCreationProgressProps> = ({
  progress,
  onCancel,
  onComplete,
  showCancelButton = true,
}) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'creating':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'creating':
        return 'Creating tickets...';
      case 'completed':
        return 'All tickets created successfully!';
      case 'cancelled':
        return 'Ticket creation cancelled';
      case 'error':
        return 'Error occurred during creation';
      default:
        return 'Ready to create tickets';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (progress.status) {
      case 'creating':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (progress.status === 'idle') {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Ticket Creation Progress</span>
          </div>
          <Badge variant={getStatusBadgeVariant()}>
            {progress.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{getStatusText()}</span>
            <span className="font-medium">
              {progress.current} / {progress.total} tickets
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="text-center text-sm text-gray-600">
            {progress.percentage}% complete
          </div>
        </div>

        {/* Current Tier */}
        {progress.currentTier && progress.status === 'creating' && (
          <div className="text-sm text-gray-600">
            Currently creating: <span className="font-medium">{progress.currentTier}</span> tickets
          </div>
        )}

        {/* Error Message */}
        {progress.status === 'error' && progress.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-800">
              <strong>Error:</strong> {progress.error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          {progress.status === 'creating' && showCancelButton && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel Creation
            </Button>
          )}
          
          {(progress.status === 'completed' || progress.status === 'cancelled' || progress.status === 'error') && onComplete && (
            <Button onClick={onComplete}>
              {progress.status === 'completed' ? 'Create More Tickets' : 'Try Again'}
            </Button>
          )}
        </div>

        {/* Summary for completed */}
        {progress.status === 'completed' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-800">
              Successfully created <strong>{progress.current}</strong> tickets! 
              You can now view them in the tickets list or generate a PDF.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
