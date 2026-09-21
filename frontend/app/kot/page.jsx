'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KOTPage() {
  const [kotList, setKotList] = useState([
    {
      _id: 'kot1',
      tableNo: 3,
      status: 'pending',
      createdAt: '2026-09-21T12:00:00.000Z',
      items: [
        { _id: 'i1', title: 'Paneer Tikka', qty: 2, status: 'pending' },
        { _id: 'i2', title: 'Veg Hakka Noodles', qty: 1, status: 'pending' }
      ]
    },
    {
      _id: 'kot2',
      tableNo: 5,
      status: 'preparing',
      createdAt: '2026-09-21T11:35:00.000Z',
      items: [
        { _id: 'i3', title: 'Chicken Biryani', qty: 3, status: 'preparing' }
      ]
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

  const updateKOTStatus = (kotId, newStatus) => {
    setKotList(kotList.map(kot => kot._id === kotId ? { ...kot, status: newStatus } : kot));
  };

  const calculateMinutesElapsed = (createdAt) => {
    const diff = Math.floor((new Date() - new Date(createdAt)) / 60000);
    return diff;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-orange-600">Kitchen Order Tickets (KOT)</h1>
            <p className="text-sm text-gray-600 mt-1">Live kitchen view with real-time timers and status controls.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold transition">
            Back to Dashboard
          </button>
        </div>

        {/* KOT Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kotList.map(kot => {
            const elapsedMins = calculateMinutesElapsed(kot.createdAt);
            const isDelayed = elapsedMins > 30; // Red alert if >30 mins as per build sheet

            return (
              <div 
                key={kot._id} 
                className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between ${isDelayed ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200'}`}>
                <div>
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                    <h3 className="text-2xl font-black text-gray-900">Table #{kot.tableNo}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-extrabold uppercase ${
                      kot.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      kot.status === 'preparing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {kot.status}
                    </span>
                  </div>

                  {/* Timer Alert Badge */}
                  <div className={`mb-4 p-3 rounded-xl flex justify-between items-center text-xs font-bold ${isDelayed ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
                    <span>⏱️ Elapsed Time:</span>
                    <span className="text-sm font-black">{elapsedMins} mins {isDelayed && '(⚠️ Kitchen Delay!)'}</span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h4>
                    {kot.items.map(item => (
                      <div key={item._id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl">
                        <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-md">x{item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex gap-2">
                  {kot.status === 'pending' && (
                    <button 
                      onClick={() => updateKOTStatus(kot._id, 'preparing')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm">
                      Mark Preparing
                    </button>
                  )}
                  {kot.status === 'preparing' && (
                    <button 
                      onClick={() => updateKOTStatus(kot._id, 'ready')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm">
                      Mark Ready
                    </button>
                  )}
                  {kot.status === 'ready' && (
                    <span className="w-full text-center text-xs font-bold text-green-600 bg-green-50 py-2.5 rounded-xl border border-green-200">
                      Ready to Serve ✅
                    </span>
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