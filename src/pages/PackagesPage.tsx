// Update the PaymentMethod type and the renderPaymentMethod function
// in the existing PackagesPage.tsx file

type PaymentMethod = 'mpesa' | 'bank' | 'paypal' | 'qr';

// ... (keep existing code)

const renderPaymentMethod = () => {
  switch (paymentMethod) {
    case 'mpesa':
      return (
        <MpesaPayment
          amount={selectedPackage?.price || 0}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      );
    case 'bank':
      return (
        <BankTransfer
          amount={selectedPackage?.price || 0}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      );
    case 'qr':
      return (
        <QRCodePayment
          amount={selectedPackage?.price || 0}
          orderId={`PKG-${selectedPackage?.id}`}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      );
    case 'paypal':
      return (
        <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
          {/* ... (keep existing PayPal code) ... */}
        </PayPalScriptProvider>
      );
  }
};

// Update the payment method selection buttons to include QR code option
<button
  onClick={() => setPaymentMethod('qr')}
  className={`w-full flex items-center p-4 rounded-lg border ${
    paymentMethod === 'qr'
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 hover:bg-gray-50'
  }`}
>
  <QrCode className="h-5 w-5 mr-3" />
  Scan QR Code
</button>

// ... (keep rest of the existing code)