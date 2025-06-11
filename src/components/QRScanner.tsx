
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, Flashlight } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if camera is available
    QrScanner.hasCamera().then(setHasCamera);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !hasCamera || !isActive) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        console.log('QR Code detected:', result.data);
        onScan(result.data);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment', // Use back camera
      }
    );

    setQrScanner(scanner);

    return () => {
      scanner.destroy();
    };
  }, [hasCamera, isActive, onScan]);

  const startScanning = async () => {
    if (!qrScanner) return;

    try {
      setError('');
      await qrScanner.start();
      setIsScanning(true);
      
      // Force video to play on iOS Safari
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to start camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (!qrScanner) return;

    qrScanner.stop();
    setIsScanning(false);
    setFlashOn(false);
  };

  const toggleFlash = async () => {
    if (!qrScanner) return;

    try {
      if (flashOn) {
        await qrScanner.turnFlashOff();
        setFlashOn(false);
      } else {
        await qrScanner.turnFlashOn();
        setFlashOn(true);
      }
    } catch (err) {
      console.error('Flash not supported:', err);
    }
  };

  if (!hasCamera) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CameraOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Camera not available</p>
          <p className="text-sm text-gray-500 mt-2">
            Please use manual input or check camera permissions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-green-600" />
            <span>Camera Scanner</span>
          </span>
          <div className="flex space-x-2">
            {isScanning && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlash}
                className="p-2"
              >
                <Flashlight className={`w-4 h-4 ${flashOn ? 'text-yellow-500' : 'text-gray-500'}`} />
              </Button>
            )}
            <Button
              variant={isScanning ? "destructive" : "default"}
              size="sm"
              onClick={isScanning ? stopScanning : startScanning}
            >
              {isScanning ? 'Stop' : 'Start'} Scanner
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded-lg object-cover"
            style={{ 
              opacity: isScanning ? 1 : 0,
              visibility: isScanning ? 'visible' : 'hidden',
              position: isScanning ? 'relative' : 'absolute'
            }}
            playsInline
            autoPlay
            muted
            webkit-playsinline="true"
            controls={false}
          />
          {!isScanning && (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Click "Start Scanner" to begin</p>
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
        {isScanning && (
          <p className="text-green-600 text-sm mt-2 text-center">
            Point camera at QR code to scan
          </p>
        )}
      </CardContent>
    </Card>
  );
};
