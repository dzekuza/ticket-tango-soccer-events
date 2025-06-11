
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManualScannerProps {
  onScan: (qrCodeData: string) => void;
}

export const ManualScanner: React.FC<ManualScannerProps> = ({ onScan }) => {
  const [scanInput, setScanInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleManualScan = async () => {
    if (!scanInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a QR code or ticket ID",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Add a small delay to show processing state
      await new Promise(resolve => setTimeout(resolve, 100));
      onScan(scanInput.trim());
      setScanInput('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleManualScan();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-green-600" />
          <span>Manual Input</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter QR code or ticket ID..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isProcessing}
              aria-label="QR code or ticket ID input"
            />
            <Button 
              onClick={handleManualScan}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
              aria-label="Process manual input"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {isProcessing && (
            <p className="text-sm text-gray-600" aria-live="polite">
              Processing...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
