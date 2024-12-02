import { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BankTransferProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const BANK_ACCOUNTS = [
  {
    bank: 'KCB Bank',
    accountName: 'SecureConnect Ltd',
    accountNumber: '1234567890',
    branchCode: '001',
  },
  {
    bank: 'Equity Bank',
    accountName: 'SecureConnect Ltd',
    accountNumber: '0987654321',
    branchCode: '002',
  },
];

export function BankTransfer({ amount, onSuccess, onError }: BankTransferProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [reference, setReference] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onError('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        onError('Please upload an image file');
        return;
      }
      setReceipt(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt) {
      onError('Please upload your receipt');
      return;
    }
    if (!reference) {
      onError('Please enter the transaction reference');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate API call to verify bank transfer
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to verify payment');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bank Account Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Bank Account Details</h4>
        <div className="space-y-4">
          {BANK_ACCOUNTS.map((account) => (
            <div key={account.bank} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{account.bank}</span>
                <button
                  onClick={() => handleCopy(account.accountNumber)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {copiedText === account.accountNumber ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Account Name:</span> {account.accountName}</p>
                <p><span className="text-gray-500">Account Number:</span> {account.accountNumber}</p>
                <p><span className="text-gray-500">Branch Code:</span> {account.branchCode}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Amount to pay: KES {amount.toLocaleString()}
        </p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
            Transaction Reference
          </label>
          <input
            type="text"
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter bank transaction reference"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Receipt
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="receipt"
                  className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="receipt"
                    name="receipt"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </div>
          {receipt && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {receipt.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying Payment...
            </>
          ) : (
            'Submit Payment Details'
          )}
        </button>
      </form>
    </div>
  );
}