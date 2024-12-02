import { useState, useEffect } from 'react';
import { QRCode } from 'react-qr-code';
import { Loader2, Smartphone, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRCodePaymentProps {
  amount: number;
  currency?: string;
  orderId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface QRPayload {
  id: string;
  amount: number;
  currency: string;
  expires: string;
  status: 'pending' | 'completed' | 'expired';
}

export function QRCodePayment({ amount, currency = 'KES', orderId, onSuccess, onError }: QRCodePaymentProps) {
  const [qrPayload, setQrPayload] = useState<QRPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'expired'>('pending');
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes

  useEffect(() => {
    generateQRCode();
  }, []);

  useEffect(() => {
    if (!qrPayload) return;

    // Start countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll for payment status
    const statusCheck = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/qr/${qrPayload.id}/status`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          clearInterval(statusCheck);
          setPaymentStatus('completed');
          onSuccess();
        } else if (data.status === 'expired') {
          clearInterval(statusCheck);
          setPaymentStatus('expired');
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(statusCheck);
    };
  }, [qrPayload]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate QR code');

      const data = await response.json();
      setQrPayload(data);
      setTimeLeft(300); // Reset timer
      setPaymentStatus('pending');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Generating secure QR code...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Scan to Pay {currency} {amount.toLocaleString()}
        </h3>
        <p className="text-sm text-gray-600">
          Use your MPESA app or banking app to scan and pay
        </p>
      </div>

      {qrPayload && paymentStatus === 'pending' && (
        <div className="relative">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <QRCode
              value={JSON.stringify({
                id: qrPayload.id,
                amount,
                currency,
                expires: qrPayload.expires,
              })}
              size={200}
              level="H"
            />
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {formatTime(timeLeft)}
          </div>
        </div>
      )}

      {paymentStatus === 'expired' && (
        <div className="text-center space-y-4">
          <p className="text-red-600">QR code has expired</p>
          <button
            onClick={generateQRCode}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Code
          </button>
        </div>
      )}

      {paymentStatus === 'completed' && (
        <div className="text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          <p className="text-green-600 font-medium">Payment Successful!</p>
        </div>
      )}

      <div className="space-y-4 w-full max-w-sm">
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">How to pay:</h4>
          <ol className="text-sm text-gray-600 space-y-2">
            <li>1. Open your MPESA app or banking app</li>
            <li>2. Select 'Scan to Pay' or 'Scan QR'</li>
            <li>3. Point your camera at the QR code above</li>
            <li>4. Confirm the payment amount</li>
            <li>5. Enter your PIN to complete payment</li>
          </ol>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Smartphone className="w-4 h-4" />
          <span>Supports MPESA and major banking apps</span>
        </div>
      </div>
    </div>
  );
}