import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, Shield, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

const MockRazorpay = ({ isOpen, onClose, orderData, onSuccess, onFailure }) => {
  const [currentStep, setCurrentStep] = useState('methods'); // methods, card, upi, netbanking, bank-login, processing, success, failed
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [bankCredentials, setBankCredentials] = useState({
    userId: '',
    password: ''
  });

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Rupay',
      color: 'blue'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Pay using UPI ID',
      color: 'green'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Building2,
      description: 'All major banks',
      color: 'purple'
    }
  ];

  // Only these 2 specific card numbers will be accepted
  const acceptedCards = [
    { number: '4111 1111 1111 1111', type: 'Accepted Card 1', result: 'success' },
    { number: '4242 4242 4242 4242', type: 'Accepted Card 2', result: 'success' }
  ];

  // Only these 2 specific UPI IDs will be accepted
  const acceptedUPIs = [
    { id: 'success@paytm', type: 'Accepted UPI 1', result: 'success' },
    { id: 'payment@gpay', type: 'Accepted UPI 2', result: 'success' }
  ];

  // Available banks for net banking
  const availableBanks = [
    { 
      id: 'sbi', 
      name: 'State Bank of India', 
      logo: '🏦', 
      color: 'blue',
      credentials: { userId: 'demo123', password: 'pass123' }
    },
    { 
      id: 'hdfc', 
      name: 'HDFC Bank', 
      logo: '🏛️', 
      color: 'red',
      credentials: { userId: 'hdfc456', password: 'hdfc@123' }
    },
    { 
      id: 'icici', 
      name: 'ICICI Bank', 
      logo: '🏢', 
      color: 'orange',
      credentials: { userId: 'icici789', password: 'icici#456' }
    },
    { 
      id: 'axis', 
      name: 'Axis Bank', 
      logo: '🏪', 
      color: 'purple',
      credentials: { userId: 'axis101', password: 'axis$789' }
    },
    { 
      id: 'kotak', 
      name: 'Kotak Mahindra Bank', 
      logo: '🏬', 
      color: 'red',
      credentials: { userId: 'kotak202', password: 'kotak&321' }
    },
    { 
      id: 'pnb', 
      name: 'Punjab National Bank', 
      logo: '🏦', 
      color: 'green',
      credentials: { userId: 'pnb303', password: 'pnb*654' }
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (method === 'card') {
      setCurrentStep('card');
    } else if (method === 'upi') {
      setCurrentStep('upi');
    } else if (method === 'netbanking') {
      setCurrentStep('netbanking');
    }
  };

  const handleCardSubmit = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      alert('Please fill all card details');
      return;
    }

    // Check if the card number is one of the accepted cards
    const acceptedCard = acceptedCards.find(card => 
      cardDetails.number.replace(/\s/g, '') === card.number.replace(/\s/g, '')
    );

    if (acceptedCard) {
      // Only accepted cards will succeed
      processPayment('success');
    } else {
      // All other card numbers will fail
      processPayment('failed');
    }
  };

  const handleUpiSubmit = () => {
    if (!upiId) {
      alert('Please enter UPI ID');
      return;
    }

    // Check if the UPI ID is one of the accepted UPIs
    const acceptedUPI = acceptedUPIs.find(upi => 
      upiId.toLowerCase().trim() === upi.id.toLowerCase()
    );

    if (acceptedUPI) {
      // Only accepted UPI IDs will succeed
      processPayment('success');
    } else {
      // All other UPI IDs will fail
      processPayment('failed');
    }
  };

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
    setCurrentStep('bank-login');
  };

  const handleBankLogin = () => {
    if (!bankCredentials.userId || !bankCredentials.password) {
      alert('Please enter both User ID and Password');
      return;
    }

    const bank = availableBanks.find(b => b.id === selectedBank);
    if (bank && 
        bankCredentials.userId === bank.credentials.userId && 
        bankCredentials.password === bank.credentials.password) {
      processPayment('success');
    } else {
      processPayment('failed');
    }
  };

  const processPayment = (result) => {
    setCurrentStep('processing');

    // Simulate payment processing time
    setTimeout(() => {
      if (result === 'success') {
        setCurrentStep('success');
        setTimeout(() => {
          onSuccess({
            paymentId: `pay_${Date.now()}`,
            orderId: orderData._id,
            signature: `sig_${Date.now()}`,
            method: selectedMethod
          });
        }, 2000);
      } else {
        setCurrentStep('failed');
        setTimeout(() => {
          onFailure('Payment declined by bank');
        }, 2000);
      }
    }, 3000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold text-sm">R</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Razorpay</h2>
              <p className="text-blue-100 text-sm">Secure Payment Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Amount */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Amount to pay</p>
            <p className="text-3xl font-bold text-gray-900">₹{orderData.totalAmount?.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">to Hot-Del</p>
          </div>
        </div>

        {/* Payment Methods Selection */}
        {currentStep === 'methods' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className="w-full flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className={`p-3 rounded-lg mr-4 bg-${method.color}-100 text-${method.color}-600 group-hover:bg-${method.color}-200`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900">{method.name}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <div className="text-gray-400">→</div>
                  </button>
                );
              })}
            </div>

            {/* Accepted Payment Methods Info */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Accepted Payment Details Only
              </h4>
              
              {/* Accepted Cards */}
              <div className="mb-3">
                <p className="text-sm font-medium text-green-800 mb-1">Card Numbers:</p>
                <div className="space-y-1 text-sm text-green-700">
                  {acceptedCards.map((card, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-mono">{card.number}</span>
                      <span className="text-green-600 font-medium">✅</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accepted UPIs */}
              <div className="mb-2">
                <p className="text-sm font-medium text-green-800 mb-1">UPI IDs:</p>
                <div className="space-y-1 text-sm text-green-700">
                  {acceptedUPIs.map((upi, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-mono">{upi.id}</span>
                      <span className="text-green-600 font-medium">✅</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Banking Info */}
              <div className="mb-2">
                <p className="text-sm font-medium text-green-800 mb-1">Net Banking:</p>
                <div className="text-sm text-green-700">
                  <p>✅ All major banks supported</p>
                  <p className="text-xs">Use demo credentials provided for each bank</p>
                </div>
              </div>

              <p className="text-xs text-green-600 mt-2 font-medium">
                ⚠️ For Cards & UPI: Only specific details accepted. For Net Banking: Use demo credentials.
              </p>
            </div>
          </div>
        )}

        {/* Card Payment Form */}
        {currentStep === 'card' && (
          <div className="p-6">
            <div className="flex items-center mb-4">
              <button 
                onClick={() => setCurrentStep('methods')}
                className="mr-3 p-1 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
            </div>
            
            {/* Accepted Cards Warning */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">
                ⚠️ Only these card numbers are accepted:
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <div className="font-mono">4111 1111 1111 1111</div>
                <div className="font-mono">4242 4242 4242 4242</div>
              </div>
              <p className="text-xs text-blue-600 mt-1">All other card numbers will be declined.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  maxLength="19"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.substring(0,2) + '/' + value.substring(2,4);
                      }
                      setCardDetails({...cardDetails, expiry: value});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    maxLength="4"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleCardSubmit}
              className="w-full mt-6 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Pay ₹{orderData.totalAmount?.toFixed(2)}
            </button>
          </div>
        )}

        {/* Net Banking - Bank Selection */}
        {currentStep === 'netbanking' && (
          <div className="p-6">
            <div className="flex items-center mb-4">
              <button 
                onClick={() => setCurrentStep('methods')}
                className="mr-3 p-1 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold text-gray-900">Select Your Bank</h3>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {availableBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank.id)}
                  className="w-full flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="text-2xl mr-4">{bank.logo}</div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-gray-900">{bank.name}</h4>
                    <p className="text-sm text-gray-600">Secure Internet Banking</p>
                  </div>
                  <div className="text-gray-400">→</div>
                </button>
              ))}
            </div>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Demo Bank Credentials
              </h4>
              <div className="space-y-2 text-sm text-purple-700">
                {availableBanks.slice(0, 3).map((bank) => (
                  <div key={bank.id} className="border-b border-purple-200 pb-2 last:border-b-0">
                    <div className="font-medium">{bank.name}</div>
                    <div className="text-xs">
                      <span className="font-mono">User ID: {bank.credentials.userId}</span><br/>
                      <span className="font-mono">Password: {bank.credentials.password}</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-purple-600 mt-2 font-medium">
                  ⚠️ Use exact credentials for successful payment
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Net Banking - Bank Login */}
        {currentStep === 'bank-login' && (
          <div className="p-6">
            {(() => {
              const bank = availableBanks.find(b => b.id === selectedBank);
              return (
                <>
                  <div className="flex items-center mb-4">
                    <button 
                      onClick={() => setCurrentStep('netbanking')}
                      className="mr-3 p-1 hover:bg-gray-100 rounded"
                    >
                      ←
                    </button>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{bank?.logo}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{bank?.name}</h3>
                        <p className="text-sm text-gray-600">Internet Banking Login</p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Login Form */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-semibold">Secure Banking Portal</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                        <input
                          type="text"
                          placeholder="Enter your User ID"
                          value={bankCredentials.userId}
                          onChange={(e) => setBankCredentials({...bankCredentials, userId: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                          type="password"
                          placeholder="Enter your Password"
                          value={bankCredentials.password}
                          onChange={(e) => setBankCredentials({...bankCredentials, password: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Demo Credentials Reminder */}
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium mb-1">
                        Demo Credentials for {bank?.name}:
                      </p>
                      <div className="text-xs text-yellow-700">
                        <div className="font-mono">User ID: {bank?.credentials.userId}</div>
                        <div className="font-mono">Password: {bank?.credentials.password}</div>
                      </div>
                    </div>

                    <button
                      onClick={handleBankLogin}
                      className="w-full mt-6 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Login & Pay ₹{orderData.totalAmount?.toFixed(2)}
                    </button>

                    {/* Security Features */}
                    <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        <span>128-bit SSL</span>
                      </div>
                      <span>•</span>
                      <span>RBI Approved</span>
                      <span>•</span>
                      <span>Secure Payment</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* UPI Payment Form */}
        {currentStep === 'upi' && (
          <div className="p-6">
            <div className="flex items-center mb-4">
              <button 
                onClick={() => setCurrentStep('methods')}
                className="mr-3 p-1 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <h3 className="text-lg font-semibold text-gray-900">UPI Payment</h3>
            </div>
            
            {/* Accepted UPI Warning */}
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-1">
                ⚠️ Only these UPI IDs are accepted:
              </p>
              <div className="text-xs text-green-700 space-y-1">
                <div className="font-mono">success@paytm</div>
                <div className="font-mono">payment@gpay</div>
              </div>
              <p className="text-xs text-green-600 mt-1">All other UPI IDs will be declined.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                <input
                  type="text"
                  placeholder="success@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Accepted UPI IDs Only:</strong><br/>
                  • success@paytm ✅<br/>
                  • payment@gpay ✅<br/>
                  <span className="text-red-600">• Any other UPI ID ❌</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleUpiSubmit}
              className="w-full mt-6 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Pay ₹{orderData.totalAmount?.toFixed(2)}
            </button>
          </div>
        )}

        {/* Processing State */}
        {currentStep === 'processing' && (
          <div className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">256-bit SSL Encrypted</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {currentStep === 'success' && (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">Your payment has been processed successfully</p>
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono">pay_{Date.now()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">₹{orderData.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="capitalize">{selectedMethod}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Failed State */}
        {currentStep === 'failed' && (
          <div className="p-12 text-center">
            <X className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">Your payment could not be processed</p>
            <button
              onClick={() => setCurrentStep('methods')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              <span>Secured by Razorpay</span>
            </div>
            <span>•</span>
            <span>PCI DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockRazorpay;
