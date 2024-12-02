import { useState } from 'react';
import { Loader2, SmartphoneCharging } from 'lucide-react';

interface MpesaPaymentProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function MpesaPayment({ amount, onSuccess, onError }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'complete'>('input');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.match(/^(?:254|\+254|0)?([71](?:(?:0[0-8])|(?:[12][0-9])|(?:9[0-9])|(?:4[0-4])|(?:5[0-4])|(?:6[0-4])|(?:7[0-4]))[0-9]{6})$/)) {
      onError('Please enter a valid Safaricom phone number');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      // Simulate API call to initiate M-PESA payment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, you would:
      // 1. Call your backend to initiate STK push
      // 2. Wait for callback/webhook
      // 3. Update UI based on payment status
      
      setStep('complete');
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'input' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              M-PESA Phone Number
            </label>
            <div className="mt-1">
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 0712345678"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              You will receive an M-PESA prompt to pay KES {amount.toLocaleString()}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Pay with M-PESA
          </button>
        </form>
      )}

      {step === 'processing' && (
        <div className="text-center py-8">
          <SmartphoneCharging className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Check your phone
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Enter your M-PESA PIN to complete the payment
          </p>
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Payment Successful
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Thank you for your payment. You can now proceed to list your business.
          </p>
        </div>
      )}
    </div>
  );
}