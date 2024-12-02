import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, FileCheck, X } from 'lucide-react';
import { Business, VerificationBadge } from '../types';
import { format } from 'date-fns';

interface AdvancedVerificationProps {
  business: Business;
  onVerify: (badge: VerificationBadge) => void;
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'verified' | 'failed';
  verifiedAt?: string;
}

export function AdvancedVerification({ business, onVerify }: AdvancedVerificationProps) {
  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: 'docs',
      title: 'Document Verification',
      description: 'Business registration and licensing documents',
      status: 'pending'
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Owner/manager identification and proof of association',
      status: 'pending'
    },
    {
      id: 'location',
      title: 'Location Verification',
      description: 'Physical location and operating address confirmation',
      status: 'pending'
    },
    {
      id: 'compliance',
      title: 'Compliance Check',
      description: 'Industry-specific regulations and standards',
      status: 'pending'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const handleVerificationStep = async (stepId: string) => {
    // Simulate verification process
    setSteps(current =>
      current.map(step =>
        step.id === stepId
          ? { ...step, status: 'verified', verifiedAt: new Date().toISOString() }
          : step
      )
    );

    // Check if all steps are verified
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, status: 'verified' } : step
    );

    if (updatedSteps.every(step => step.status === 'verified')) {
      // All steps verified, grant verification badge
      onVerify({
        type: 'business',
        issuedBy: 'SecureConnect',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
      });
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Business Verification
          </h3>
        </div>
        {business.verificationBadges.length > 0 && (
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified Business
          </div>
        )}
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative ${
              index < steps.length - 1 ? 'pb-4' : ''
            }`}
          >
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
            )}
            <div className="relative flex items-start">
              <div className="flex-shrink-0 flex items-center">
                {getStepIcon(step.status)}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {step.title}
                  </h4>
                  {step.status === 'verified' ? (
                    <span className="text-xs text-gray-500">
                      Verified {format(new Date(step.verifiedAt!), 'MMM d, yyyy')}
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedStep(step.id);
                        setIsModalOpen(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      {isModalOpen && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Verification Process
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-500">
                <FileCheck className="w-5 h-5 mr-2" />
                Upload required documents or complete verification steps
              </div>
              
              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {steps.find(s => s.id === selectedStep)?.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {steps.find(s => s.id === selectedStep)?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleVerificationStep(selectedStep);
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Complete Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
