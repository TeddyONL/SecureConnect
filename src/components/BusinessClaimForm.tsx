import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Upload, X } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import toast from 'react-hot-toast';

interface BusinessClaimFormProps {
  onSubmit: (claim: {
    documents: string[];
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export function BusinessClaimForm({ onSubmit, onCancel }: BusinessClaimFormProps) {
  const [documents, setDocuments] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const { user } = useAuthStore();
  const { imageUrl, handleImageUpload } = useImageUpload();

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await handleImageUpload(file);
        if (imageUrl) {
          setDocuments([...documents, imageUrl]);
        }
      } catch (error) {
        toast.error('Failed to upload document');
      }
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to claim this business');
      return;
    }
    if (documents.length === 0) {
      toast.error('Please upload at least one verification document');
      return;
    }
    onSubmit({ documents, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Claim Your Business</h3>
        <p className="mt-1 text-sm text-gray-600">
          Please provide documentation to verify your ownership of this business.
        </p>
      </div>

      {/* Document Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Verification Documents
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Upload business registration, licenses, or other proof of ownership
        </p>
        <div className="mt-2 flex items-center gap-4">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-5 w-5 mr-2 text-gray-400" />
            Upload Document
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleDocumentUpload}
            />
          </label>
        </div>

        {/* Document Preview */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {documents.map((doc, index) => (
            <div key={index} className="relative p-4 border rounded-lg">
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">Document {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add any additional information that might help verify your ownership..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Submit Claim
        </button>
      </div>
    </form>
  );
}
