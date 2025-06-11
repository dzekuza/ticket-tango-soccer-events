
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scan, CheckCircle, XCircle, Search, Camera } from 'lucide-react';
import { Ticket, IndividualTicket } from './Dashboard';
import { QRScanner } from './QRScanner';
import { useToast } from '@/hooks/use-toast';

interface TicketScannerProps {
  tickets: Ticket[];
  onValidate: (ticketId: string) => void;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({ tickets, onValidate }) => {
  const [scanInput, setScanInput] = useState('');
  const [lastScannedTicket, setLastScannedTicket] = useState<IndividualTicket | null>(null);
  const [activeTab, setActiveTab] = useState('manual');
  const { toast } = useToast();

  const findTicketByQRCode = (qrCode: string): IndividualTicket | null => {
    try {
      // Try to parse as JSON first (new format)
      const qrData = JSON.parse(qrCode);
      for (const batch of tickets) {
        const ticket = batch.tickets.find(t => t.id === qrData.ticketId);
        if (ticket) return ticket;
      }
    } catch {
      // Fallback to old format - direct search
      for (const batch of tickets) {
        const ticket = batch.tickets.find(t => t.qrCode === qrCode || t.id === qrCode);
        if (ticket) return ticket;
      }
    }
    return null;
  };

  const validateTicket = (qrCodeData: string) => {
    const ticket = findTicketByQRCode(qrCodeData);
    
    if (!ticket) {
      toast({
        title: "Invalid Ticket",
        description: "Ticket not found in the system",
        variant: "destructive",
      });
      setLastScannedTicket(null);
      return;
    }

    if (ticket.isUsed) {
      toast({
        title: "Already Used",
        description: `This ticket was already validated on ${ticket.validatedAt?.toLocaleString()}`,
        variant: "destructive",
      });
      setLastScannedTicket(ticket);
      return;
    }

    // Validate the ticket
    onValidate(ticket.id);
    setLastScannedTicket({ ...ticket, isUsed: true, validatedAt: new Date() });
    
    toast({
      title: "Ticket Validated",
      description: `Valid ticket for ${ticket.eventTitle}`,
    });
  };

  const handleManualScan = () => {
    if (!scanInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a QR code or ticket ID",
        variant: "destructive",
      });
      return;
    }

    validateTicket(scanInput.trim());
    setScanInput('');
  };

  const handleCameraScan = (result: string) => {
    validateTicket(result);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualScan();
    }
  };

  const getValidationStats = () => {
    const totalTickets = tickets.reduce((sum, batch) => sum + batch.tickets.length, 0);
    const validatedTickets = tickets.reduce((sum, batch) => 
      sum + batch.tickets.filter(ticket => ticket.isUsed).length, 0
    );
    return { total: totalTickets, validated: validatedTickets };
  };

  const stats = getValidationStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ticket Scanner</h1>
        <p className="text-gray-600 mt-1">Scan and validate tickets at the event</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Scan className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Tickets</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Validated</p>
            <p className="text-2xl font-bold text-gray-900">{stats.validated}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total - stats.validated}</p>
          </CardContent>
        </Card>
      </div>

      {/* Scanner Interface */}
      <div className="max-w-2xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="mt-6">
            <QRScanner 
              onScan={handleCameraScan} 
              isActive={activeTab === 'camera'} 
            />
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
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
                    />
                    <Button 
                      onClick={handleManualScan}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Last Scanned Ticket Result */}
        {lastScannedTicket && (
          <Card className={`mt-6 ${lastScannedTicket.isUsed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{lastScannedTicket.eventTitle}</h3>
                  <p className="text-sm text-gray-600">Price: ${lastScannedTicket.price}</p>
                  <p className="text-sm text-gray-600">Ticket ID: {lastScannedTicket.id}</p>
                </div>
                <Badge 
                  variant={lastScannedTicket.isUsed ? "default" : "destructive"}
                  className="flex items-center space-x-1"
                >
                  {lastScannedTicket.isUsed ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  <span>{lastScannedTicket.isUsed ? 'Valid' : 'Already Used'}</span>
                </Badge>
              </div>
              {lastScannedTicket.validatedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Validated: {lastScannedTicket.validatedAt.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
