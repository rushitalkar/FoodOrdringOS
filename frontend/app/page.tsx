'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Professional Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 text-white font-black p-2.5 rounded-xl text-lg shadow-md">🍽️</div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">FoodOrderingOS</h1>
            <p className="text-xs text-gray-500 font-medium">Restaurant Management & POS System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-sm transition border border-red-200">
            Logout 🔒
          </button>
        </div>
      </nav>

      {/* Main Content Dashboard Hub */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900">Restaurant Operations</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your menu, tables, kitchen, orders, and customer ordering flow.</p>
        </div>

        {/* Navigation Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. Menu Management */}
          <div onClick={() => router.push('/menu')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 transition cursor-pointer group">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-orange-600 group-hover:text-white transition">
              📖
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Menu Management</h3>
            <p className="text-sm text-gray-500 mb-4">Add dishes, set prices, GST%, categories, and upload images.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">Open Module →</span>
          </div>

          {/* 2. Table Grid & QR */}
          <div onClick={() => router.push('/tables')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 transition cursor-pointer group">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-orange-600 group-hover:text-white transition">
              📱
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Table & QR Generator</h3>
            <p className="text-sm text-gray-500 mb-4">Manage tables, monitor status, and generate scannable ordering QRs.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">Open Module →</span>
          </div>

          {/* 3. Kitchen KOT View */}
          <div onClick={() => router.push('/kot')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 transition cursor-pointer group">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-orange-600 group-hover:text-white transition">
              👨‍🍳
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Kitchen KOT View</h3>
            <p className="text-sm text-gray-500 mb-4">Real-time kitchen order tickets with timers and status updates.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">Open Module →</span>
          </div>

          {/* 4. Orders & Billing */}
          <div onClick={() => router.push('/orders')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 transition cursor-pointer group">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-orange-600 group-hover:text-white transition">
              🧾
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Orders & Billing</h3>
            <p className="text-sm text-gray-500 mb-4">Calculate totals, process payments, and settle table orders.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">Open Module →</span>
          </div>

          {/* 5. Public QR Menu Simulation */}
          <div onClick={() => router.push('/qr/spice-villa/1')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 transition cursor-pointer group">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-orange-600 group-hover:text-white transition">
              🔗
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Customer QR Menu</h3>
            <p className="text-sm text-gray-500 mb-4">Preview the customer menu and place a table order.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">Test Customer View →</span>
          </div>

        </div>
      </main>
    </div>
  );
}