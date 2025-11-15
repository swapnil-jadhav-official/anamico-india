'use client';

export default function TestEnv() {
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const isConfigured = razorpayKeyId && razorpayKeyId.startsWith('rzp_');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Environment Variable Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Razorpay Configuration</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NEXT_PUBLIC_RAZORPAY_KEY_ID:
              </label>
              <div className={`p-3 rounded font-mono text-sm ${
                isConfigured ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {razorpayKeyId || '❌ NOT FOUND - RESTART DEV SERVER!'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status:
              </label>
              <div className={`p-3 rounded font-semibold ${
                isConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConfigured ? '✅ Configured Correctly' : '❌ Not Configured'}
              </div>
            </div>

            {isConfigured && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode:
                </label>
                <div className="p-3 rounded bg-blue-50 text-blue-800 font-semibold">
                  {razorpayKeyId?.includes('live') ? '🔴 LIVE MODE' : '🟡 TEST MODE'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">💡 Troubleshooting</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• If you see "NOT FOUND", make sure <code className="bg-yellow-100 px-1 rounded">.env.local</code> exists</li>
            <li>• After creating/editing <code className="bg-yellow-100 px-1 rounded">.env.local</code>, you MUST restart the dev server</li>
            <li>• Run: <code className="bg-yellow-100 px-1 rounded">npm run dev</code> or <code className="bg-yellow-100 px-1 rounded">pnpm dev</code></li>
            <li>• Check that the variable starts with <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_</code></li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/checkout/payment?orderId=test"
            className="text-blue-600 hover:underline"
          >
            ← Back to Payment Page
          </a>
        </div>
      </div>
    </div>
  );
}
