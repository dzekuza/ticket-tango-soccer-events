
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Search } from 'lucide-react';
import { QRScanner } from './QRScanner';
import { ManualScanner } from './ManualScanner';
import { ScannerErrorBoundary } from './ScannerErrorBoundary';

interface ScannerInterfaceProps {
  onScan: (qrCodeData: string) => void;
}

export const ScannerInterface: React.FC<ScannerInterfaceProps> = ({ onScan }) => {
  const [activeTab, setActiveTab] = useState('camera');

  return (
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
        <ScannerErrorBoundary>
          <QRScanner 
            onScan={onScan} 
            isActive={activeTab === 'camera'} 
          />
        </ScannerErrorBoundary>
      </TabsContent>

      <TabsContent value="manual" className="mt-6">
        <ManualScanner onScan={onScan} />
      </TabsContent>
    </Tabs>
  );
};
