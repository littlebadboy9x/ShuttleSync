'use client';

import { useState } from 'react';

export default function SyncPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');

  const syncAllPayments = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('http://localhost:8080/api/customer/bookings/sync-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const text = await response.text();
      
      if (response.ok) {
        setResult(`✅ Success: ${text}`);
      } else {
        setResult(`❌ Error: ${text}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const syncSinglePayment = async () => {
    if (!bookingId.trim()) {
      setResult('❌ Please enter a booking ID');
      return;
    }
    
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch(`http://localhost:8080/api/customer/bookings/sync-payment-status/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const text = await response.text();
      
      if (response.ok) {
        setResult(`✅ Success: ${text}`);
      } else {
        setResult(`❌ Error: ${text}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔄 Sync Payment Status
          </h1>
          
          <div className="space-y-6">
            {/* Sync All */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Sync All Bookings
              </h2>
              <p className="text-gray-600 mb-4">
                Đồng bộ payment status cho tất cả bookings từ bảng Payments mới nhất
              </p>
              <button
                onClick={syncAllPayments}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? '⏳ Syncing...' : '🔄 Sync All Payments'}
              </button>
            </div>

            {/* Sync Single */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Sync Single Booking
              </h2>
              <p className="text-gray-600 mb-4">
                Đồng bộ payment status cho một booking cụ thể
              </p>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter Booking ID (e.g., 21)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={syncSinglePayment}
                  disabled={loading || !bookingId.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? '⏳ Syncing...' : '🔄 Sync Single'}
                </button>
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {result}
                </pre>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📋 Instructions
            </h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• <strong>Sync All:</strong> Cập nhật payment status cho tất cả bookings</li>
              <li>• <strong>Sync Single:</strong> Cập nhật payment status cho booking cụ thể (test với booking #21, #23)</li>
              <li>• Sau khi sync, kiểm tra lại trang lịch sử để xem payment status đã đúng chưa</li>
              <li>• API sẽ lấy payment mới nhất theo CreatedAt từ bảng Payments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 