'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const [orders, setOrders] = useState([
    {
      _id: 'ord1',
      tableNo: 3,
      items: [
        { title: 'Paneer Tikka', qty: 2, price: 250 },
        { title: 'Veg Hakka Noodles', qty: 1, price: 180 }
      ],
      status: 'served',
      paymentStatus: 'unpaid'
    },
    {
      _id: 'ord2',
      tableNo: 5,
      items: [
        { title: 'Chicken Biryani', qty: 3, price: 350 }
      ],
      status: 'ready',
      paymentStatus: 'unpaid'
    }
  ]);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      router.push('/login');
      return;
    }

  }, [router]);

  const handleGenerateBill = (orderId) => {
    setOrders(orders.map(ord => ord._id === orderId ? { ...ord, paymentStatus: 'paid', status: 'billed' } : ord));
    alert('Payment successful! Bill generated and table marked as billed.');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-orange-600">Orders & Billing</h1>
            <p className="text-sm text-gray-600 mt-1">Manage active table bills, calculate totals, and process payments.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold transition">
            Back to Dashboard
          </button>
        </div>

        {/* Orders List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => {
            const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
            const gst = subtotal * 0.05; // 5% GST calculation as per build sheet
            const total = subtotal + gst;

            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                    <h3 className="text-2xl font-black text-gray-900">Table #{order.tableNo}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-extrabold uppercase ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'Paid / Billed' : 'Unpaid Bill'}
                    </span>
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bill Items</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl text-sm">
                        <span className="font-semibold text-gray-900">{item.title} (x{item.qty})</span>
                        <span className="font-bold text-gray-700">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5 mb-6 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST (5%)</span>
                      <span>₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-200">
                      <span>Total Amount</span>
                      <span className="text-orange-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Billing Action */}
                <div>
                  {order.paymentStatus === 'unpaid' ? (
                    <button 
                      onClick={() => handleGenerateBill(order._id)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-md">
                      Collect Payment & Print Bill 🧾
                    </button>
                  ) : (
                    <div className="w-full text-center text-xs font-bold text-green-600 bg-green-50 py-3 rounded-xl border border-green-200">
                      Bill Settled Successfully ✅
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}